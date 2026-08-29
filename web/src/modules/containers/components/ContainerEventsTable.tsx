import React from "react"
import type { ContainerEvent } from "@/service/api/containers"
import { Card, CardContent } from "@/components/ui/card"
import { ListOrdered } from "lucide-react"

interface ContainerEventsTableProps {
  events: ContainerEvent[]
}

export const ContainerEventsTable: React.FC<ContainerEventsTableProps> = ({ events }) => {
  if (events.length === 0) {
    return (
      <Card className="ring-1 ring-foreground/10">
        <CardContent className="py-12 text-center">
          <ListOrdered className="size-8 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">Belum ada catatan aktivitas untuk container ini.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="ring-1 ring-foreground/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 border-b border-border/50 text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Tipe Aksi</th>
              <th className="px-4 py-3">Deskripsi</th>
              <th className="px-4 py-3">Waktu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {events.map((ev) => (
              <tr key={ev.id} className="hover:bg-muted/40 transition">
                <td className="px-4 py-3 font-mono font-semibold text-xs text-primary">
                  {ev.event_type}
                </td>
                <td className="px-4 py-3 text-foreground text-xs">{ev.description}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {new Date(ev.created_at).toLocaleString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
