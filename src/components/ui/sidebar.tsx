"use client";
import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext, forwardRef, useEffect, ButtonHTMLAttributes } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { Typography } from "./typography";
import { Button } from "./button";
import useWindowSize from "@/hooks/use-window-size";
import { ModeToggle } from "./ModeToggle";
import { useSettings } from "@/hooks/use-settings";


interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeLabel: string | undefined;
  setActiveLabel?: React.Dispatch<React.SetStateAction<string | undefined>>;
  isLoading: boolean;
  setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);
  const [activeLabel, setActiveLabel] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate, activeLabel, setActiveLabel, isLoading, setIsLoading }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = ({
  initialActiveLabel,
  ...props
}: {
  initialActiveLabel?: string
} & React.ComponentProps<typeof motion.div>) => {

  const { setActiveLabel } = useSidebar();

  useEffect(() => {
    setActiveLabel?.(initialActiveLabel)
  }, [initialActiveLabel, setActiveLabel])

  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate, isLoading, setIsLoading } = useSidebar();
  const { isMobile } = useWindowSize();
  const { zoom } = useSettings();

  useEffect(() => {
    if (animate && open && !isMobile) {
      setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile])

  return (
    <>
      <motion.div
      style={{ height: `calc(100vh / ${zoom})` }}
        className={cn(
          "absolute left-0 px-4 py-4 hidden md:flex md:flex-col bg-neutral-700 dark:bg-neutral-800 flex-shrink-0 z-50 border-r border-r-neutral-700",
          "",
          className
        )}
        initial={{ width: "60px" }}
        animate={{
          width: animate ? (open ? "250px" : "60px") : "60px",
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => {
          if (isLoading) {
            setTimeout(() => {
              setOpen(false);
              setIsLoading?.(false);
            }, 400)         
          } else {
            setOpen(false);
          }
        }}
        {...props}
      >
        {children}
      </motion.div>
    </>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();

  return (
    <>
      <div
        className={cn(
          "h-10 flex flex-row md:hidden items-center justify-between bg-neutral-100 dark:bg-neutral-800 w-full"
        )}
        {...props}
      >
        <div className="flex justify-end items-center z-20 w-full px-10 gap-2">
          <ModeToggle />
          <IconMenu2
            className="text-neutral-800 dark:text-neutral-200 cursor-pointer h-6 w-6"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ y: "-100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{
                duration: 0.2,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-white dark:bg-neutral-900 p-10 z-[100] flex flex-col justify-between",
                className
              )}
            >
              <Button
                variant="ghost"
                className="absolute right-10 px-2.5 top-10 z-50 cursor-pointer"
                onClick={() => setOpen(!open)}
              >
                <IconX className="!h-5 !w-5" />
              </Button>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

interface SidebarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string
  onClick: (e: React.MouseEvent<Element, MouseEvent>) => void
}

export const SidebarButton = forwardRef<HTMLButtonElement, SidebarButtonProps>(
  ({ icon, label, className, onClick, ...props }, ref) => {
    const { open, animate, setOpen, activeLabel, setActiveLabel, setIsLoading } = useSidebar();
    const { isMobile } = useWindowSize();

    return (
      <div className="flex items-center w-full h-full">
        {activeLabel === label &&
          <div className="absolute right-0 w-1 h-6 bg-green-400 border border-green-400 rounded-l"></div>
        }
        <Button
          variant="ghost"
          className={cn("relative flex items-center justify-start gap-2 group/sidebar py-2 !px-1 h-10 w-fit hover:bg-transparent dark:hover:bg-neutral-800", className)}
          onClick={(e: React.MouseEvent) => {
            setActiveLabel?.(label);
            setIsLoading?.(true);
            onClick?.(e);
            if (isMobile) {
              setOpen(false);
            }
          }}
          ref={ref}
          {...props}
        >
          <div className={cn("absolute left-1 text-neutral-200", activeLabel === label && "text-green-400")}>{icon}</div>
          <motion.div
            animate={{
              display: animate ? (open ? "inline-block" : "none") : "inline-block",
              opacity: animate ? (open ? 1 : 0) : 1,
            }}
            className="group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !px-2 !ml-5"
          >
            <Typography variant="span" className={cn("!text-neutral-200", activeLabel === label && "!text-green-400")}>{label}</Typography>
          </motion.div>
        </Button>
      </div>
    );
  }
);

SidebarButton.displayName = "SidebarButton"
