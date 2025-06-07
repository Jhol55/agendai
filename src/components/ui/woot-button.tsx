import React, { forwardRef } from "react";
import { Button } from "./button";
import { Typography } from "./typography";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react"

export interface WootButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ElementType
}

export const WootButton = forwardRef<HTMLButtonElement, WootButtonProps>(
  ({ children, className, icon: Icon, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        className={cn("bg-skyblue hover:bg-skyblue hover:enabled:brightness-110 focus-visible:brightness-110 transition-all duration-200 ease-in-out h-10 rounded-lg outline-1", className)}
        {...props}
      >
        {Icon && <Icon className="h-4 w-4 dark:text-white text-white" />}
        <Typography variant="span" className={cn(Icon && "md:block hidden", "dark:!text-white !text-white")}>
          {children}
        </Typography>
      </Button>
    )
  }
)
WootButton.displayName = "WootButton"