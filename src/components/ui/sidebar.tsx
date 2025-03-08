"use client";
import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext, forwardRef, useEffect, ButtonHTMLAttributes } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { Typography } from "./typography";
import { Button } from "./button";
import useWindowSize from "@/hooks/use-window-size";
import { ModeToggle } from "./ModeToggle";


interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
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

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
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

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
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
  const { open, setOpen, animate } = useSidebar();
  const { isMobile } = useWindowSize();

  useEffect(() => {
    if (animate && open && !isMobile) {
      setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile])

  return (
    <>
      <motion.div
        className={cn(
          "sticky left-0 h-screen px-4 py-4 hidden md:flex md:flex-col bg-[#2B2D42] dark:bg-[#2E2E46] w-[60px] flex-shrink-0",
          "",
          className
        )}
        animate={{
          width: animate ? (open ? "250px" : "60px") : "250px",
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
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
    const { open, animate, setOpen } = useSidebar();
    const { isMobile } = useWindowSize();

    return (
      <Button
        variant="ghost"
        className={cn("relative flex items-center justify-start gap-2 group/sidebar py-2 !px-1 h-10 w-fit hover:bg-transparent dark:hover:bg-neutral-800", className)}
        onClick={(e: React.MouseEvent) => {
          onClick?.(e);
          if (isMobile) {
            setOpen(false);
          }
        }}
        ref={ref}
        {...props}
      >
        <div className="absolute left-1">{icon}</div>
        <motion.div
          animate={{
            display: animate ? (open ? "inline-block" : "none") : "inline-block",
            opacity: animate ? (open ? 1 : 0) : 1,
          }}
          className="group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !px-2 !ml-5"
        >
          <Typography variant="span" className="dark:text-neutral-200 !text-neutral-200">{label}</Typography>
        </motion.div>
      </Button>
    );
  }
);

SidebarButton.displayName = "SidebarButton"
