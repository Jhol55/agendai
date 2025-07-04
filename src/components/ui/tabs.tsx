"use Client";

import { createContext, FC, ReactNode, useContext, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface TabsProps {
  value?: string | number;
  onChange?: (item: string) => void;
  children?: ReactNode;
  className?: string;
  activeClassName?: string;
}
interface TabProps {
  value: string;
  className?: string;
  children?: ReactNode;
  onClick?: () => void; 
}
type ActiveItem = {
  item: string;
  width: number;
  height: number;
  left: number;
  top: number;
};
interface TabsContextType {
  active: ActiveItem;
  handleChange: (value: ActiveItem) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const useTabsContext = (): TabsContextType => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("No context found for Tabs");
  }
  return context;
};

const TabContainer: FC<TabsProps> = ({ children, onChange, className }) => {
  const [active, setActive] = useState({ item: "", width: 0, height: 0, left: 0, top: 0 });

  const handleChange = (value: ActiveItem) => {
    setActive(value);
    onChange?.(value.item);
  };

  return (
    <TabsContext.Provider value={{ active, handleChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

const Tabs: FC<TabsProps> = ({ children, className, activeClassName }) => {
  const { active, handleChange } = useTabsContext();

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let defaultItem = { item: "", width: 0, height: 0, left: 0, top: 0 };
    if (ref.current && ref.current.children.length >= 0 && ref.current.firstElementChild instanceof HTMLElement) {
      defaultItem = {
        item: ref.current.firstElementChild?.dataset.value || ref.current.firstElementChild?.innerText,
        width: ref.current.firstElementChild?.clientWidth,
        height: ref.current.firstElementChild?.clientHeight,
        left: ref.current.firstElementChild?.offsetLeft,
        top: ref.current.firstElementChild?.offsetTop,
      };
    }
    handleChange(defaultItem);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "bg relative flex flex-nowrap gap-2 overflow-auto rounded-md",
        className,
      )}
    >
      {children}
      <span
        style={{ width: active.width, height: active.height, left: active.left, top: active.top, margin: 0 }}
        className={cn(
          "z-1 absolute h-full rounded-sm transition-all duration-200 ease-in-out",
          activeClassName,
        )}
      ></span>
    </div>
  );
};

const Tab: FC<TabProps> = ({ children, className, value, onClick }) => {
  const { handleChange } = useTabsContext();

  const ref = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    let item = { item: "", width: 0, height: 0, left: 0, top: 0 };
    if (ref.current && ref.current instanceof HTMLElement) {
      item = {
        item: ref.current?.dataset.value || ref.current?.innerText,
        width: ref.current?.clientWidth,
        height: ref.current?.clientHeight,
        left: ref.current?.offsetLeft,
        top: ref.current?.offsetTop,
      };
    }
    handleChange(item);
    onClick?.();
  };

  return (
    <button
      data-value={value}
      onClick={handleClick}
      ref={ref}
      type="button"
      className={cn(`z-10 text-nowrap rounded-sm px-6 py-2 transition-colors duration-200`, className)}
    >
      {children}
    </button>
  );
};

const TabPanel: FC<TabProps> = ({ children, value, className }) => {
  const { active } = useTabsContext();
  if (value !== active.item) return null;
  return (
    <div className={cn("rounded-md", className)}>{children}</div>
  );
};

export { Tabs, Tab, TabContainer, TabPanel };
