import * as React from "react"

import { cn } from "@/lib/utils"

export type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-[#F8F9FA] dark:bg-neutral-900 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
TextArea.displayName = "Input"

export { TextArea }