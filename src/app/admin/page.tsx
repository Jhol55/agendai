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


export default function Admin() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(4);

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
      label: "Logout",
      href: "#",
      icon: (
        <IconArrowLeft className="text-neutral-200 dark:text-neutral-200 !h-5 !w-5 flex-shrink-0" />
      ),
      content: (
        <></>
      )
    },
  ], []);

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
    <div className="flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full min-h-[100vh] relative">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="" initialActiveLabel={links[activeTab].label}>
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <Logo open={open} />
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
          transition={{ duration: 0.2, ease: "easeIn" }}
          className="relative -z-0 flex w-full flex-1 basis-0 md:ml-[60px] light-scrollbar dark:dark-scrollbar overflow-x-hidden overflow-y-auto bg-neutral-100 dark:bg-neutral-900"
        >
          {links[activeTab].content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}