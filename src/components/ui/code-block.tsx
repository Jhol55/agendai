"use client";
import React, { useEffect, useRef, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { solarizedlight } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { IconCheck, IconCopy, IconDeviceFloppy } from "@tabler/icons-react";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { Button } from "./button";
import { Typography } from "./typography";


type CodeBlockProps = {
  language: string;
  title: string;
  externalContent: string;
  onSave?: (content: string) => void
}

export const CodeBlock = ({
  language,
  title,
  externalContent,
  onSave
}: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [content, setContent] = useState(externalContent);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const isDarkMode = useDarkMode();

  const copyToClipboard = async () => {
    if (content) {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const saveContent = async () => {
    if (content) {
      onSave?.(content)
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  useEffect(() => {
    setContent(externalContent);
  }, [externalContent])


  useEffect(() => {
    const textArea = textAreaRef.current;
    const syntaxHighlighter = document.getElementById("syntax-highlighter");

    const syncScroll = () => {
      if (textArea && syntaxHighlighter) {
        syntaxHighlighter.scrollTop = textArea.scrollTop;
        syntaxHighlighter.scrollLeft = textArea.scrollLeft;
      }
    };

    textArea?.addEventListener("scroll", syncScroll);

    return () => {
      textArea?.removeEventListener("scroll", syncScroll);
    };
  }, []);

  const handleTabPress = (e: React.KeyboardEvent) => {
    if (e.key === "Tab" && textAreaRef.current) {
      e.preventDefault();
  
      const textArea = textAreaRef.current;
      const { selectionStart, selectionEnd } = textArea;
  
      const before = textArea.value.substring(0, selectionStart);
      const selectedText = textArea.value.substring(selectionStart, selectionEnd);
      const after = textArea.value.substring(selectionEnd);
  
      const updatedText = `${before}\t${selectedText}${after}`;
      setContent(updatedText);
  
      textArea.value = updatedText;
      textArea.selectionStart = textArea.selectionEnd = selectionStart + 1;
    }
  };
  


  return (
    <div className="w-full h-full bg-transparent">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center py-2">
          <Typography variant="h2">{title}</Typography>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={copyToClipboard}
              className="py-2 px-2 h-8"
            >
              {copied ? <IconCheck className="h-4" /> : <IconCopy className="h-4" />}
            </Button>
            <Button
              onClick={saveContent}
              variant="outline"
              className="py-2 px-2 h-8"
            >
              {saved ? <IconCheck className="h-4" /> : <IconDeviceFloppy className="h-4" />}
            </Button>
          </div>
        </div>
      </div>
      <div className="relative w-full h-full border rounded-md border-neutral-200 dark:border-neutral-800 py-[0.45rem]">
        <SyntaxHighlighter
          id="syntax-highlighter"
          language={language}
          style={solarizedlight}
          customStyle={{
            margin: 0,
            padding: 0,
            background: "transparent",
            fontSize: "1rem",
            height: "100%",
            width: "100%",
            overflow: "auto",
          }}
          wrapLines={true}
          showLineNumbers={true}
          lineProps={() => ({
            style: {
              display: "block",
              width: "100%",
              lineHeight: "1.40",
              transform: "translateX(-2px)",
              color: isDarkMode ? "#e5e5e5" : "#171717",
              fontFamily: "Roboto",
              opacity: 1
            },
          })}
          lineNumberStyle={{
            minWidth: "50px"
          }}
          PreTag="div"
        >
          {content}
        </SyntaxHighlighter>
        <div className="absolute top-[0.03rem] left-[calc(3em-0.5px)] h-[calc(100%)] w-[calc(100%-3rem)] z-50 py-2">
          <textarea
            ref={textAreaRef}
            value={content}
            onInput={(e) => setContent((e.target as HTMLTextAreaElement).value)}
            onChange={(e) => setContent((e.target as HTMLTextAreaElement).value)}
            className="h-full w-full bg-transparent resize-none focus:outline-none font-roboto text-base text-transparent selection:text-transparent selection:bg-black/30 whitespace-nowrap code-block-textarea"
            onKeyDown={handleTabPress}
            spellCheck="false"
            style={{ lineHeight: "1.41" }}
          />
        </div>
      </div>
    </div>
  );
};

