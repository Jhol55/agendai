import { useState } from 'react';
import { cn } from '@/lib/utils';
import { FlipCardProps } from './flip-card.type';

export const FlipCard = ({
  renderFront,
  renderBack,
  className,
}: FlipCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="relative w-full h-full" style={{ perspective: 1000 }}>
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-500 ease-in-out",
          "transform-style-3d"
        )}
        style={{
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className={cn(
            "absolute inset-0 flex justify-center items-center",
            "rounded-3xl backface-hidden",
            className
          )}
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          {renderFront?.(isFlipped, setIsFlipped)}
        </div>

        <div
          className={cn(
            "absolute inset-0 flex justify-center items-center",
            "rounded-3xl backface-hidden",
            className
          )}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {renderBack?.(isFlipped, setIsFlipped)}
        </div>
      </div>
    </div>

  );
};
