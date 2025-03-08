"use client";

import * as React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { solarizedlight } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { cn } from "@/lib/utils";
import { Loading } from "./loading/loading";
import { useTheme } from "next-themes";


type Props = React.HTMLAttributes<HTMLDivElement> & {
  // Props for the component
  ignoreTabKey?: boolean;
  insertSpaces?: boolean;
  onValueChange: (value: string) => void;
  tabSize?: number;
  value: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>;
  onKeyUp?: React.KeyboardEventHandler<HTMLTextAreaElement>;
  containerClassName?: string;
  textareaClassName?: string;
  textareaId?: string;
  // Props for the hightlighted code’s pre element
  preClassName?: string;
};

type Record = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

type History = {
  stack: (Record & { timestamp: number })[];
  offset: number;
};

const KEYCODE_Y = 89;
const KEYCODE_Z = 90;
const KEYCODE_M = 77;
const KEYCODE_PARENS = 57;
const KEYCODE_BRACKETS = 219;
const KEYCODE_QUOTE = 222;
const KEYCODE_BACK_QUOTE = 192;

const HISTORY_LIMIT = 100;
const HISTORY_TIME_GAP = 3000;

const isWindows =
  typeof window !== 'undefined' &&
  'navigator' in window &&
  /Win/i.test(navigator.platform);
const isMacLike =
  typeof window !== 'undefined' &&
  'navigator' in window &&
  /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);

const textAreaClassName = 'editor-textarea';


const Editor = React.forwardRef(function Editor(
  props: Props,
  ref: React.Ref<null | { session: { history: History } }>
) {
  const {
    ignoreTabKey = false,
    insertSpaces = true,
    onKeyDown,
    onValueChange,
    preClassName,
    tabSize = 4,
    containerClassName,
    textareaClassName,
    textareaId,
    value,
    ...rest
  } = props;

  const historyRef = React.useRef<History>({
    stack: [],
    offset: -1,
  });
  const inputRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [capture, setCapture] = React.useState(true);

  const getLines = (text: string, position: number) =>
    text.substring(0, position).split('\n');

  const recordChange = React.useCallback(
    (record: Record, overwrite = false) => {
      const { stack, offset } = historyRef.current;

      if (stack.length && offset > -1) {
        // When something updates, drop the redo operations
        historyRef.current.stack = stack.slice(0, offset + 1);

        // Limit the number of operations to 100
        const count = historyRef.current.stack.length;

        if (count > HISTORY_LIMIT) {
          const extras = count - HISTORY_LIMIT;

          historyRef.current.stack = stack.slice(extras, count);
          historyRef.current.offset = Math.max(
            historyRef.current.offset - extras,
            0
          );
        }
      }

      const timestamp = Date.now();

      if (overwrite) {
        const last = historyRef.current.stack[historyRef.current.offset];

        if (last && timestamp - last.timestamp < HISTORY_TIME_GAP) {
          // A previous entry exists and was in short interval

          // Match the last word in the line
          const re = /[^a-z0-9]([a-z0-9]+)$/i;

          // Get the previous line
          const previous = getLines(last.value, last.selectionStart)
            .pop()
            ?.match(re);

          // Get the current line
          const current = getLines(record.value, record.selectionStart)
            .pop()
            ?.match(re);

          if (previous?.[1] && current?.[1]?.startsWith(previous[1])) {
            // The last word of the previous line and current line match
            // Overwrite previous entry so that undo will remove whole word
            historyRef.current.stack[historyRef.current.offset] = {
              ...record,
              timestamp,
            };

            return;
          }
        }
      }

      // Add the new operation to the stack
      historyRef.current.stack.push({ ...record, timestamp });
      historyRef.current.offset++;
    },
    []
  );

  const recordCurrentState = React.useCallback(() => {
    const input = inputRef.current;

    if (!input) return;

    // Save current state of the input
    const { value, selectionStart, selectionEnd } = input;

    if (!value) return;

    recordChange({
      value,
      selectionStart,
      selectionEnd,
    });
  }, [recordChange]);

  const updateInput = (record: Record) => {
    const input = inputRef.current;

    if (!input) return;

    // Update values and selection state
    input.value = record.value;
    input.selectionStart = record.selectionStart;
    input.selectionEnd = record.selectionEnd;

    onValueChange?.(record.value);
  };

  const applyEdits = (record: Record) => {
    // Save last selection state
    const input = inputRef.current;
    const last = historyRef.current.stack[historyRef.current.offset];

    if (last && input) {
      historyRef.current.stack[historyRef.current.offset] = {
        ...last,
        selectionStart: input.selectionStart,
        selectionEnd: input.selectionEnd,
      };
    }

    // Save the changes
    recordChange(record);
    updateInput(record);
  };

  const undoEdit = () => {
    const { stack, offset } = historyRef.current;

    // Get the previous edit
    const record = stack[offset - 1];

    if (record) {
      // Apply the changes and update the offset
      updateInput(record);
      historyRef.current.offset = Math.max(offset - 1, 0);
    }
  };

  const redoEdit = () => {
    const { stack, offset } = historyRef.current;

    // Get the next edit
    const record = stack[offset + 1];

    if (record) {
      // Apply the changes and update the offset
      updateInput(record);
      historyRef.current.offset = Math.min(offset + 1, stack.length - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (onKeyDown) {
      onKeyDown(e);

      if (e.defaultPrevented) {
        return;
      }
    }

    if (e.key === 'Escape') {
      e.currentTarget.blur();
    }

    const { value, selectionStart, selectionEnd } = e.currentTarget;

    const tabCharacter = (insertSpaces ? ' ' : '\t').repeat(tabSize);

    if (e.key === 'Tab' && !ignoreTabKey && capture) {
      // Prevent focus change
      e.preventDefault();

      if (e.shiftKey) {
        // Unindent selected lines
        const linesBeforeCaret = getLines(value, selectionStart);
        const startLine = linesBeforeCaret.length - 1;
        const endLine = getLines(value, selectionEnd).length - 1;
        const nextValue = value
          .split('\n')
          .map((line, i) => {
            if (
              i >= startLine &&
              i <= endLine &&
              line.startsWith(tabCharacter)
            ) {
              return line.substring(tabCharacter.length);
            }

            return line;
          })
          .join('\n');

        if (value !== nextValue) {
          const startLineText = linesBeforeCaret[startLine];

          applyEdits({
            value: nextValue,
            // Move the start cursor if first line in selection was modified
            // It was modified only if it started with a tab
            selectionStart: startLineText?.startsWith(tabCharacter)
              ? selectionStart - tabCharacter.length
              : selectionStart,
            // Move the end cursor by total number of characters removed
            selectionEnd: selectionEnd - (value.length - nextValue.length),
          });
        }
      } else if (selectionStart !== selectionEnd) {
        // Indent selected lines
        const linesBeforeCaret = getLines(value, selectionStart);
        const startLine = linesBeforeCaret.length - 1;
        const endLine = getLines(value, selectionEnd).length - 1;
        const startLineText = linesBeforeCaret[startLine];

        applyEdits({
          value: value
            .split('\n')
            .map((line, i) => {
              if (i >= startLine && i <= endLine) {
                return tabCharacter + line;
              }

              return line;
            })
            .join('\n'),
          // Move the start cursor by number of characters added in first line of selection
          // Don't move it if it there was no text before cursor
          selectionStart:
            startLineText && /\S/.test(startLineText)
              ? selectionStart + tabCharacter.length
              : selectionStart,
          // Move the end cursor by total number of characters added
          selectionEnd:
            selectionEnd + tabCharacter.length * (endLine - startLine + 1),
        });
      } else {
        const updatedSelection = selectionStart + tabCharacter.length;

        applyEdits({
          // Insert tab character at caret
          value:
            value.substring(0, selectionStart) +
            tabCharacter +
            value.substring(selectionEnd),
          // Update caret position
          selectionStart: updatedSelection,
          selectionEnd: updatedSelection,
        });
      }
    } else if (e.key === 'Backspace') {
      const hasSelection = selectionStart !== selectionEnd;
      const textBeforeCaret = value.substring(0, selectionStart);

      if (textBeforeCaret.endsWith(tabCharacter) && !hasSelection) {
        // Prevent default delete behaviour
        e.preventDefault();

        const updatedSelection = selectionStart - tabCharacter.length;

        applyEdits({
          // Remove tab character at caret
          value:
            value.substring(0, selectionStart - tabCharacter.length) +
            value.substring(selectionEnd),
          // Update caret position
          selectionStart: updatedSelection,
          selectionEnd: updatedSelection,
        });
      }
    } else if (e.key === 'Enter') {
      // Ignore selections
      if (selectionStart === selectionEnd) {
        // Get the current line
        const line = getLines(value, selectionStart).pop();
        const matches = line?.match(/^\s+/);

        if (matches?.[0]) {
          e.preventDefault();

          // Preserve indentation on inserting a new line
          const indent = '\n' + matches[0];
          const updatedSelection = selectionStart + indent.length;

          applyEdits({
            // Insert indentation character at caret
            value:
              value.substring(0, selectionStart) +
              indent +
              value.substring(selectionEnd),
            // Update caret position
            selectionStart: updatedSelection,
            selectionEnd: updatedSelection,
          });
        }
      }
    } else if (
      e.keyCode === KEYCODE_PARENS ||
      e.keyCode === KEYCODE_BRACKETS ||
      e.keyCode === KEYCODE_QUOTE ||
      e.keyCode === KEYCODE_BACK_QUOTE
    ) {
      let chars;

      if (e.keyCode === KEYCODE_PARENS && e.shiftKey) {
        chars = ['(', ')'];
      } else if (e.keyCode === KEYCODE_BRACKETS) {
        if (e.shiftKey) {
          chars = ['{', '}'];
        } else {
          chars = ['[', ']'];
        }
      } else if (e.keyCode === KEYCODE_QUOTE) {
        if (e.shiftKey) {
          chars = ['"', '"'];
        } else {
          chars = ["'", "'"];
        }
      } else if (e.keyCode === KEYCODE_BACK_QUOTE && !e.shiftKey) {
        chars = ['`', '`'];
      }

      // If text is selected, wrap them in the characters
      if (selectionStart !== selectionEnd && chars) {
        e.preventDefault();

        applyEdits({
          value:
            value.substring(0, selectionStart) +
            chars[0] +
            value.substring(selectionStart, selectionEnd) +
            chars[1] +
            value.substring(selectionEnd),
          // Update caret position
          selectionStart,
          selectionEnd: selectionEnd + 2,
        });
      }
    } else if (
      (isMacLike
        ? // Trigger undo with ⌘+Z on Mac
        e.metaKey && e.keyCode === KEYCODE_Z
        : // Trigger undo with Ctrl+Z on other platforms
        e.ctrlKey && e.keyCode === KEYCODE_Z) &&
      !e.shiftKey &&
      !e.altKey
    ) {
      e.preventDefault();

      undoEdit();
    } else if (
      (isMacLike
        ? // Trigger redo with ⌘+Shift+Z on Mac
        e.metaKey && e.keyCode === KEYCODE_Z && e.shiftKey
        : isWindows
          ? // Trigger redo with Ctrl+Y on Windows
          e.ctrlKey && e.keyCode === KEYCODE_Y
          : // Trigger redo with Ctrl+Shift+Z on other platforms
          e.ctrlKey && e.keyCode === KEYCODE_Z && e.shiftKey) &&
      !e.altKey
    ) {
      e.preventDefault();

      redoEdit();
    } else if (
      e.keyCode === KEYCODE_M &&
      e.ctrlKey &&
      (isMacLike ? e.shiftKey : true)
    ) {
      e.preventDefault();

      // Toggle capturing tab key so users can focus away
      setCapture((prev) => !prev);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value, selectionStart, selectionEnd } = e.currentTarget;

    recordChange(
      {
        value,
        selectionStart,
        selectionEnd,
      },
      true
    );

    onValueChange(value);
  };

  React.useEffect(() => {
    recordCurrentState();
  }, [recordCurrentState]);

  React.useImperativeHandle(
    ref,
    () => {
      return {
        get session() {
          return {
            history: historyRef.current,
          };
        },
        set session(session: { history: History }) {
          historyRef.current = session.history;
        },
      };
    },
    []
  );

  const id = React.useId()

  const { theme } = useTheme();

  // Sync textarea and highlighter scrollbars
  React.useEffect(() => {
    const input = inputRef.current;
    const highlighter = document.getElementById(id);
    const syncScroll = () => {
      if (input && highlighter) {
        highlighter.scrollTop = input.scrollTop;
        highlighter.scrollLeft = input.scrollLeft;
      }
    };
    input?.addEventListener("scroll", syncScroll);
    return () => {
      input?.removeEventListener("scroll", syncScroll);
    };
  }, [id, value]);

  const isDarkMode = useDarkMode();

  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
      setIsLoading(true);
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 5000)
      return () => clearTimeout(timeout);
    }, [value])

  return (
    <div
      {...rest}
      className={cn("relative w-full h-full border rounded-md border-neutral-200 dark:border-neutral-800 py-2", containerClassName)}
    >
      {value ?
        <>
          <SyntaxHighlighter
            id={id}
            language="html"
            style={solarizedlight}
            customStyle={{
              margin: 0,
              padding: 0,
              background: "#fff",
              backgroundColor: "#171717",
              fontSize: "1rem",
              height: "100%",
              width: "100%",
              overflow: "auto",
              fontFamily: "Nunito",
            }}
            wrapLines={true}
            showLineNumbers={true}
            lineProps={() => ({
              style: {
                display: "block",
                width: "100%",
                lineHeight: "1.40",
                transform: "translateX(-2px)",
                backgroundColor: theme === "dark"
                  ? "#171717"
                  : "#ffffff",
                color: theme === "dark"
                  ? "#ffffff"
                  : "#171717",
                fontFamily: "Nunito",
              },
            })}
            lineNumberStyle={{
              fontFamily: "Nunito",
              minWidth: "50px",
              position: "sticky",
              backgroundColor: theme === "dark"
                ? "#171717"
                : "#ffffff",
              border: "none"
            }}
            PreTag="div"
          >
            {value}
          </SyntaxHighlighter>
          <textarea
            className={cn(
              "bg-transparent resize-none focus:outline-none font-nunito text-base text-black dark:text-white selection:text-transparent dark:selection:bg-white/30",
              "whitespace-nowrap absolute left-[3em] h-full w-[calc(100%-3rem)] top-0 z-50 py-2 leading-[1.4rem]",
              textAreaClassName
            )}
            ref={(c: HTMLTextAreaElement | null) => { inputRef.current = c; }}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            data-gramm={false}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
        </>
        :
        <div className="flex h-full w-full items-center justify-center">
          <Loading display={isLoading} />
        </div>
      }
    </div>

  );
});


export default Editor;
