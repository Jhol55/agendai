import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const Loading = ({ display, className }: { display: boolean, className?: string }) => {
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    setIsHidden(!display);
  }, [display]);

  return (
    <motion.div
      className={cn("relative w-20 h-20 z-50", isHidden && "hidden", className)}
      initial={{ opacity: 1, scale: 0.6 }}
      animate={{ opacity: display ? 1 : 0, scale: display ? 0.6 : 0.4 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      onAnimationComplete={() => {
        if (!display) {
          setIsHidden(true);
        }
      }}
    >
      {Array.from({ length: 12 }).map((_, index) => (
        <motion.div
          key={index}
          className="absolute w-full h-full origin-[40px_40px] animate-spin-opacity"
          style={{
            transform: `rotate(${index * 30}deg)`,
            animationDelay: `${-1.1 + index * 0.1}s`,
          }}
        >
          <div className="absolute top-[3.2px] left-[36.8px] w-[6.4px] h-[17.6px] bg-neutral-800 dark:bg-neutral-100 rounded-[20%]"></div>
        </motion.div>
      ))}
    </motion.div>
  );
};
