"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ThemeSwitcherToggleProps {
  vertical?: boolean;
}

export function ThemeSwitcherToggle({ vertical = false }: ThemeSwitcherToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [prevVertical, setPrevVertical] = useState(vertical);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setPrevVertical(vertical);
  }, [vertical]);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  const isSwitchingToVertical = vertical && !prevVertical;
  const isSwitchingToHorizontal = !vertical && prevVertical;

  const containerClass = vertical
    ? "flex flex-col w-7 h-12"
    : "flex flex-row w-12 h-7";

  const ballClass = "w-5 h-5 rounded-full bg-neutral-50 shadow-md flex items-center justify-center";

  const position = vertical ? { x: 0, y: isDark ? 24 : 2 } : { y: 0, x: isDark ? 24 : 2 };
  const rotation = isSwitchingToVertical
    ? 90
    : isSwitchingToHorizontal
    ? -90
    : 0;

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative items-center justify-start rounded-full bg-neutral-500 dark:bg-neutral-700 focus:outline-none !scale-[0.9] ${containerClass}`}
    >
      <motion.div
        className={`absolute ${ballClass}`}
        animate={{ ...position, rotate: rotation }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <MoonIcon className="w-4 h-4 text-neutral-900" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ opacity: 0, rotate: 45, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -45, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <SunIcon className="w-4 h-4 text-yellow-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  );
}
