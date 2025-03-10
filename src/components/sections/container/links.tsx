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
import { KnowledgeBases } from "../knowledge-bases/knowledge-bases";
import { Prompts } from "../prompts/prompts";
import { Services } from "../services/services";
import { Scheduler } from "../scheduler/scheduler";

export const links = [
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
];