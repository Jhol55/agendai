import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Typography } from "@/components/ui/typography";



export const Logo = ({ open }: { open: boolean }) => {
  return (
    <div
      className="fixed transform left-0 font-normal flex ml-0.5 items-center text-sm text-black pb-2 z-20"
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-4 font-medium text-black dark:text-white whitespace-pre translate-x-2"
      >
        <Image src="/imgs/logo.png" alt="" width={40} height={40} />
        <AnimatePresence>
          {
            open &&
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: open ? 1 : 0 }}
            >
              <Typography variant="h1" className="!text-white !text-md !font-cursive md:block hidden translate-y-1">
                AGEND
                <span className="text-red-400">AI</span>
              </Typography>
            </motion.div>
          }
        </AnimatePresence>
      </motion.span>
    </div>
  );
};