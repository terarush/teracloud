import React from "react"
import type { ContainerEvent } from "@/service/api/containers"

interface ContainerEventsTableProps {
  events: ContainerEvent[]
}

export const ContainerEventsTable: React.FC<ContainerEventsTableProps> = ({ events }) => {
  if (events.length === 0) {
    return (
      <div className="p-8 text-center bg-card ring-1 ring-foreground/10 rounded-xl text-sm text-muted-foreground">
        Belum ada catatan aktivitas untuk container ini.
      </div>
    )
  }

  return (
    <div className="bg-card ring-1 ring-foreground/10 rounded-xl overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-6 py-4">Tipe Aksi</th>
            <th className="px-6 py-4">Deskripsi</th>
            <th className="px-6 py-4">Waktu</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {events.map((ev) => (
            <tr key={ev.id} className="hover:bg-muted/30 transition">
              <td className="px-6 py-4 font-mono font-semibold text-xs text-primary">
                {ev.event_type}
              </td>
              <td className="px-6 py-4 text-foreground text-xs">{ev.description}</td>
              <td className="px-6 py-4 text-muted-foreground text-xs">
                {new Date(ev.created_at).toLocaleString("id-ID")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
