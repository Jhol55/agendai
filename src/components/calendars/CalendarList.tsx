"use client"

import React from "react"
import Image from 'next/image'
import { cn } from "@/lib/utils"
import { Typography } from "../ui/typography"
import { Spinner } from "../ui/spinner"
import { ActionButtons } from "./ActionButtons"

export type CalendarType = {
  id: number,
  name: string,
  description: string
  thumbnail?: string
  availability_status?: string
  user_or_team_id?: string
  user_or_team_name?: string
  user_type?: string
  operating_hours?: { start: string, end: string, closed: boolean }[]
  services?: { id: string }[]
  settings: {
    tax: string,
    reschedule_deadline_value: string,
    reschedule_deadline_unit: string,
    payment_deadline_value: string,
    tax_deadline_value: string
  }
}

type Props = {
  calendarList: CalendarType[]
  onEdit?: (index?: number) => void
  onDelete?: (index?: number) => void
}

const getInitials = (name: string) => {
  const parts = name.trim().split(" ");
  const first = parts[0]?.charAt(0).toUpperCase() || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.charAt(0).toUpperCase() : "";
  return first + last;
};

const Thumbnail: React.FC<{
  src?: string
  username: string
  status?: string
}> = ({ src, username }) => {
  return (
    <>
      {src ?
        <Image
          src={src || "/default-avatar.png"}
          alt={username}
          className="rounded-full object-cover"
          width={40}
          height={40}
        />
        :
        <div className="flex items-center !font-inter dark:text-white/70 text-skyblue justify-center rounded-full w-[40px] h-[40px] bg-gradient-to-t dark:from-[#135899] dark:to-[#135899] from-[#c2e1ff] to-[#d6ebff]">
          {getInitials(username)}
        </div>
      }
    </>
  )
}


export const CalendarList: React.FC<Props> = ({
  calendarList,
  onEdit,
  onDelete
}) => {
  return (
    <table className="divide-y divide-slate-75 dark:divide-slate-700 w-full">
      <tbody className="divide-y divide-n-weak text-n-slate-11">
        {calendarList.map((calendar, index) => (
          <tr key={calendar.id}>
            <td className="py-4 pr-4">
              <div className="flex flex-row items-center justify-between gap-4">
                <div className="flex gap-4 w-1/2">
                  <Thumbnail
                    src={calendar.thumbnail}
                    username={calendar.name}
                    status={calendar.availability_status}
                  />
                  <Typography variant="span" className="block capitalize dark:!text-neutral-400 !text-neutral-600">{calendar.name}</Typography>
                </div>

                <div className="flex w-full gap-2">
                  {calendar.user_or_team_name &&
                    <div className="rounded-full p-1 bg-gradient-to-t dark:from-[#135899] dark:to-[#135899] from-[#c2e1ff] to-[#d6ebff]">
                      <Typography variant="p" className="!text-skyblue dark:!text-white/70">{calendar.user_type === "agent" ? "Agente" : "Time"}</Typography>
                    </div>}
                  <Typography variant="span" className="capitalize !text-neutral-600">{calendar.user_or_team_name}</Typography>
                </div>

                <ActionButtons onEdit={() => onEdit?.(index)} onDelete={() => onDelete?.(index)} />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

