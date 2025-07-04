"use client"

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Scheduler } from "../../../components/sections/scheduler/scheduler";
import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";


export default function Admin() {
  const searchParams = useSearchParams();

  const { setTheme } = useTheme();

  useEffect(() => {
    const theme = searchParams.get("theme");
    if (theme) {
      setTheme(theme);
    }
  }, [searchParams, setTheme]);

  return (
    <div className="flex flex-col md:flex-row bg-neutral-50 dark:bg-background w-full relative min-h-screen"
    >
      {/* <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="" initialActiveLabel={links[activeTab].label}>
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <Logo open={open} />
            <div className="mt-14 flex gap-2 w-full">
              <div>
                <ThemeSwitcherToggle vertical={true} />
              </div>
              <Typography variant="span" className="!text-neutral-200">{theme === "dark" ? "Dark" : "Light"}</Typography>
            </div>
            <div className={"mt-4 flex flex-col gap-2"}>
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
      </Sidebar> */}
      <AnimatePresence mode="wait">
        <motion.div
          // initial={{ x: "-100%", opacity: 0 }}
          // animate={{ x: 0, opacity: 1 }}
          // exit={{ x: "100%", opacity: 0 }}
          // transition={{ duration: 0.17, ease: "easeIn" }}
          className="relative -z-0 flex w-full md:min-h-screen min-h-[86vh] flex-1 basis-0 light-scrollbar dark:dark-scrollbar overflow-x-hidden overflow-y-auto !bg-[rgb(253,253,253)] dark:!bg-dark-chatwoot-primary"
        >
          <Scheduler />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
