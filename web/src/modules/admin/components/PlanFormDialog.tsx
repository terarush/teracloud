import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import type { Plan, CreatePlanRequest } from "@/service/api/plans"
import { Loader2 } from "lucide-react"

interface PlanFormDialogProps {
  initialPlan?: Plan | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreatePlanRequest) => Promise<void>
  isPending: boolean
}

export const PlanFormDialog: React.FC<PlanFormDialogProps> = ({
  initialPlan,
  isOpen,
  onClose,
  onSubmit,
  isPending,
}) => {
  const [formData, setFormData] = useState<CreatePlanRequest>({
    name: initialPlan?.name || "",
    slug: initialPlan?.slug || "",
    short_description: initialPlan?.short_description || "",
    image_name: initialPlan?.image_name || "ubuntu",
    image_tag: initialPlan?.image_tag || "24.04",
    cpu_limit: initialPlan?.cpu_limit || 1,
    memory_limit: initialPlan?.memory_limit || 1024,
    disk_limit: initialPlan?.disk_limit || 20,
    price_monthly: initialPlan?.price_monthly || 50000,
    max_per_user: initialPlan?.max_per_user || 3,
    is_active: initialPlan ? initialPlan.is_active : true,
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-card border border-border w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <h2 className="text-xl font-bold text-foreground">
          {initialPlan ? "Edit Paket Hosting" : "Tambah Paket Hosting Baru"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Nama Paket
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Slug</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Image Docker
              </label>
              <input
                type="text"
                required
                value={formData.image_name}
                onChange={(e) => setFormData({ ...formData, image_name: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Tag</label>
              <input
                type="text"
                required
                value={formData.image_tag}
                onChange={(e) => setFormData({ ...formData, image_tag: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                vCPU Limit
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={formData.cpu_limit}
                onChange={(e) => setFormData({ ...formData, cpu_limit: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                RAM (MB)
              </label>
              <input
                type="number"
                required
                value={formData.memory_limit}
                onChange={(e) =>
                  setFormData({ ...formData, memory_limit: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Disk (GB)
              </label>
              <input
                type="number"
                required
                value={formData.disk_limit}
                onChange={(e) => setFormData({ ...formData, disk_limit: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Harga Bulanan (IDR)
            </label>
            <input
              type="number"
              required
              value={formData.price_monthly}
              onChange={(e) => setFormData({ ...formData, price_monthly: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending} className="font-semibold">
              {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Simpan Paket
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
