"use client"

import { useEffect, useMemo, useState } from "react";
import { Sidebar, SidebarBody, SidebarButton } from "@/components/ui/sidebar"
import { Logo } from "@/components/sections/container/logo";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconMessage,
  IconBrain,
  IconCode,
  IconBriefcase,
  IconCalendarWeek
} from "@tabler/icons-react";
import { KnowledgeBases } from "../../components/sections/knowledge-bases/knowledge-bases";
import { Prompts } from "../../components/sections/prompts/prompts";
import { Services } from "../../components/sections/services/services";
import { Scheduler } from "../../components/sections/scheduler/scheduler";
import { useSettings } from "@/hooks/use-settings";
import { ThemeSwitcherToggle } from "@/components/ui/theme-switch-toggle";
import { Chat } from "@/components/sections/chat/Chat";
import { Typography } from "@/components/ui/typography";
import { useTheme } from "next-themes";


export default function Admin() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(5);
  const { zoom } = useSettings();

  const links = useMemo(() => [
    {
      label: "Dashboard",
      icon: (
        <IconBrandTabler className="!h-5 !w-5 flex-shrink-0" />
      ),
      content: (
        <KnowledgeBases />
      )
    },
    {
      label: "Bases de Conhecimento",
      icon: (
        <IconBrain className="!h-5 !w-5 flex-shrink-0" />
      ),
      content: (
        <KnowledgeBases />
      )
    },
    {
      label: "Prompts",
      icon: (
        <IconMessage className="!h-5 !w-5 flex-shrink-0" />
      ),
      content: (
        <Prompts />
      )
    },
    {
      label: "Serviços",
      icon: (
        <IconBriefcase className="!h-5 !w-5 flex-shrink-0" />
      ),
      content: (
        <Services />
      )
    },
    {
      label: "Agenda",
      icon: (
        <IconCalendarWeek className="!h-5 !w-5 flex-shrink-0" />
      ),
      content: (
        <Scheduler />
      )
    },
    {
      label: "Chat",
      icon: (
        <IconMessage className="text-neutral-200 dark:text-neutral-200 !h-5 !w-5 flex-shrink-0" />
      ),
      content: (
        <Chat />
      )
    },
  ], []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (typeof document !== "undefined" && document.body) {
        document.body.style.overflow = "auto";
      }
    }, 500);

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

  const { theme } = useTheme();

  return (
    <div className="flex flex-col md:flex-row bg-neutral-50 dark:bg-background w-full relative"
      style={{ minHeight: `calc(100vh / ${zoom})`, zoom }}
    >
      <Sidebar open={open} setOpen={setOpen}>
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
      </Sidebar>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          // initial={{ x: "-100%", opacity: 0 }}
          // animate={{ x: 0, opacity: 1 }}
          // exit={{ x: "100%", opacity: 0 }}
          // transition={{ duration: 0.17, ease: "easeIn" }}
          className="relative -z-0 flex w-full md:min-h-screen min-h-[86vh] flex-1 basis-0 md:ml-[60px] light-scrollbar dark:dark-scrollbar overflow-x-hidden overflow-y-auto bg-neutral-50 dark:bg-neutral-900"
        >
          {links[activeTab].content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}