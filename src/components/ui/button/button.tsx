import React, { forwardRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { darkenColor } from '@/utils/darkenColor';
import { MultiVariantButtonProps } from './button.type';
import Image from 'next/image';

const Button = forwardRef<HTMLButtonElement, MultiVariantButtonProps>(
  (
    {
      variant = 'default',
      type = 'button',
      bgHexColor = '#2f2f2f',
      darkenFactor = 0.22,
      animated = true,
      className,
      children,
      icon = { src: '', width: 16, height: 16, alt: '' },
      ...props
    },
    ref,
  ) => {
    const animatedStyle = useMemo(
      () =>
        variant === 'gradient' && animated
          ? 'transition-[background] duration-700 hover:bg-right-top'
          : '',
      [variant, animated],
    );

    const classNames = useMemo(
      () =>
        cn(
          'bg-[280%_auto] w-fit text-white text-sm text-center font-medium cursor-pointer rounded-md py-2.5 px-2',
          animatedStyle,
          className,
        ),
      [animatedStyle, className],
    );

    const gradientBackground = useMemo(() => {
      if (variant === 'gradient') {
        const darkenedBackgroundColor = darkenColor(bgHexColor, darkenFactor);
        return `linear-gradient(325deg, ${darkenedBackgroundColor} 0%, ${bgHexColor} 55%, ${darkenedBackgroundColor} 90%)`;
      }
      return undefined;
    }, [variant, bgHexColor, darkenFactor]);

    return (
      <button
        ref={ref}
        type={type}
        className={classNames}
        style={{
          backgroundImage: gradientBackground,
          backgroundColor: variant === 'default' ? bgHexColor : undefined,
        }}
        {...props}
      >
        <span className="relative flex items-center justify-center gap-2">
          {icon.src && (
            <Image
              {...{
                src: icon.src,
                width: icon.width,
                height: icon.height,
                alt: icon.alt,
              }}
            />
          )}
          {children}
        </span>
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
