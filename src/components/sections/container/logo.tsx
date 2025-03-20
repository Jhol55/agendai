import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Typography } from "@/components/ui/typography";


export const Logo = () => {
    return (
      <div
        className="fixed transform -left-1/2 translate-x-1/2 font-normal flex ml-0.5 items-center text-sm text-black pb-2 z-20 w-full"
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-4 font-medium text-black dark:text-white whitespace-pre translate-x-2"
        >
          <Image src="/imgs/logo.png" alt="" width={40} height={40} />
          <Typography variant="h1" className="!text-white !text-sm !font-cursive md:block hidden translate-y-1">AGENDAI</Typography>
        </motion.span>
      </div>
    );
  };