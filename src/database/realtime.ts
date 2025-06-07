import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { supabase } from "./client";


export function subscribe({ channel, table, onChange }: {
  channel: string,
  table: string,
  onChange?: (payload: RealtimePostgresChangesPayload<{ [key: string]: unknown }>) => void
}) {
  return supabase
    .channel(channel)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: table },
      (payload) => {
        onChange?.(payload)
      }
    )
    .subscribe()
}