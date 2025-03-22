"use client"

import { useEffect, useState } from "react";
import { Sidebar, SidebarBody, SidebarButton } from "@/components/ui/sidebar"
import { links } from "@/components/sections/container/links";
import { Logo } from "@/components/sections/container/logo";
import { AnimatePresence, motion } from "framer-motion";


export default function Admin() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(3);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (typeof document !== "undefined" && document.body) {
        document.body.style.overflow = "auto";
      }
    }, 300);

    if (typeof document !== "undefined" && document.body) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      if (typeof document !== "undefined" && document.body) {
        document.body.style.overflow = "auto";
      }
      clearTimeout(timeout);
    };
  }, [activeTab]);

  return (
    <div className="flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full min-h-[100vh]">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10" initialActiveLabel={links[activeTab].label}>
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <Logo />
            <div className={"mt-20 flex flex-col gap-2"}>
              {links.map(({ icon, label }, idx) => (
                <SidebarButton
                  key={idx}
                  icon={icon}
                  label={label}
                  onClick={() => setActiveTab(idx)}
                />
              ))}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="relative flex w-full flex-1 basis-0 light-scrollbar dark:dark-scrollbar overflow-x-hidden overflow-y-auto bg-[#F8F9FA] dark:bg-neutral-900"
        >
          {links[activeTab].content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}