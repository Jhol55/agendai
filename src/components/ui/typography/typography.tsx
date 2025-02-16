import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { TypographyProps } from './typography.type';

export const Typography = forwardRef<HTMLParagraphElement, TypographyProps>(({
  className,
  variant = 'p',
  secondary = false,
  children,
  ...props
}, ref) => {
  const Component = variant;

  const styles = {
    p: `text-[0.9375rem] font-medium`,
    b: 'text-[0.9375rem] font-bold',
    span: `text-md font-medium`,
    h1: `text-xl font-bold`,
    h2: `text-lg font-semibold`,
    h3: `text-md font-semibold`,
    h4: `text-md font-medium`,
    h5: `text-md font-medium`,
  };

  return (
    <Component
      ref={ref}
      className={cn(
        styles[variant],
        className,
        secondary
          ? "text-neutral-500 dark:text-neutral-400"
          : "text-neutral-900 dark:text-neutral-200", 
          "content-center"
      )}
      {...props}
    >
      {children}
    </Component>
  );
},
);

Typography.displayName = 'Typography';
