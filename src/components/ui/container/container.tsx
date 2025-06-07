import { cn } from '@/lib/utils';

import { ContainerProps } from './container.type';
import { forwardRef } from 'react';

const Container = forwardRef<HTMLElement, ContainerProps>(
  ({ variant, color, className, children, style, ...props }, ref) => {
    const Component = variant;

    const styles = {
      main: 'relative flex justify-center items-center w-screen h-screen overflow-hidden p-10',
      section: 'relative flex justify-center items-center w-full h-full gap-8',
      article: '',
    };

    return (
      <Component
        ref={ref}
        {...props}
        className={cn(styles[variant], color, className)}
        style={style}
      >
        {children}
      </Component>
    );
  },
);

Container.displayName = 'Container';

export { Container };
