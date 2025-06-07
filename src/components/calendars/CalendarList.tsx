"use client"

import React from "react"
import Image from 'next/image'
import { cn } from "@/lib/utils"
import { Typography } from "../ui/typography"

type Calendar = {
  id: number
  name: string
  email: string
  thumbnail?: string
  availability_status?: string
  confirmed: boolean
  custom_role_id?: string
}

type Props = {
  calendarList: Calendar[]
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
        <div className="flex items-center !font-inter text-white/70 justify-center rounded-full w-[40px] h-[40px] bg-gradient-to-t from-[#135899] to-[#135899]">
          {getInitials(username)}
        </div>
        }
    </>
  )
}


export const CalendarList: React.FC<Props> = ({
  calendarList,
}) => {
  return (
    <table className="divide-y divide-slate-75 dark:divide-slate-700 w-full">
      <tbody className="divide-y divide-n-weak text-n-slate-11">
        {calendarList.map((calendar) => (
          <tr key={calendar.id}>
            <td className="py-4 pr-4">
              <div className="flex flex-row items-center gap-4">
                <Thumbnail
                  src={calendar.thumbnail}
                  username={calendar.name}
                  status={calendar.availability_status}
                />
                <div>
                  <Typography variant="span" className="block capitalize !text-neutral-300">{calendar.name}</Typography>
                  <span>{calendar.email}</span>
                </div>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

