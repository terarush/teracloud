import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import type { Plan, CreatePlanRequest, PortConfigItem } from "@/service/api/plans"
import { Loader2, Plus, Trash2, Network, Upload, Image as ImageIcon, X } from "lucide-react"
import { useUploadFileMutation } from "@/service/mutation/auth"
import { toast } from "sonner"
import { getImageUrl } from "@/lib/utils"
import { useTranslation } from "react-i18next"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  const { t } = useTranslation()
  const uploadMutation = useUploadFileMutation()
  const [uploadingField, setUploadingField] = useState<"icon" | "thumbnail" | null>(null)

  const [formData, setFormData] = useState<CreatePlanRequest>({
    name: "",
    slug: "",
    short_description: "",
    image_name: "",
    image_tag: "",
    icon: "",
    thumbnail_url: "",
    badge: "",
    cpu_limit: "" as any,
    memory_limit: "" as any,
    disk_limit: "" as any,
    price_monthly: "" as any,
    is_active: true,
    command: "",
    entrypoint: "",
    port_config: [],
  })

  useEffect(() => {
    if (initialPlan) {
      setFormData({
        name: initialPlan.name || "",
        slug: initialPlan.slug || "",
        short_description: initialPlan.short_description || "",
        image_name: initialPlan.image_name || "",
        image_tag: initialPlan.image_tag || "",
        icon: initialPlan.icon || "",
        thumbnail_url: initialPlan.thumbnail_url || "",
        badge: initialPlan.badge || "",
        cpu_limit: initialPlan.cpu_limit,
        memory_limit: initialPlan.memory_limit,
        disk_limit: initialPlan.disk_limit,
        price_monthly: initialPlan.price_monthly,
        is_active: initialPlan.is_active,
        command: initialPlan.command || "",
        entrypoint: initialPlan.entrypoint || "",
        port_config: initialPlan.port_config || [],
      })
    } else {
      setFormData({
        name: "",
        slug: "",
        short_description: "",
        image_name: "",
        image_tag: "",
        icon: "",
        thumbnail_url: "",
        badge: "",
        cpu_limit: "" as any,
        memory_limit: "" as any,
        disk_limit: "" as any,
        price_monthly: "" as any,
        is_active: true,
        command: "",
        entrypoint: "",
        port_config: [],
      })
    }
  }, [initialPlan, isOpen])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "icon" | "thumbnail") => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingField(field)
    try {
      const res = await uploadMutation.mutateAsync({ file })
      const uploadedUrl = typeof res === "string" ? res : (res as any)?.url || (res as any)?.data?.url || ""
      if (field === "icon") {
        setFormData((prev) => ({ ...prev, icon: uploadedUrl }))
      } else {
        setFormData((prev) => ({ ...prev, thumbnail_url: uploadedUrl }))
      }
      toast.success(t("hosting.plan.uploadImageSuccess"))
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || t("hosting.plan.uploadImageFailed"))
    } finally {
      setUploadingField(null)
      e.target.value = ""
    }
  }

  const handleAddPort = () => {
    setFormData((prev) => ({
      ...prev,
      port_config: [
        ...(prev.port_config || []),
        {
          container_port: "" as any,
          protocol: "tcp",
          name: "",
          description: "",
          is_primary: (prev.port_config || []).length === 0,
        },
      ],
    }))
  }

  const handleRemovePort = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      port_config: (prev.port_config || []).filter((_, i) => i !== index),
    }))
  }

  const handlePortChange = (index: number, field: keyof PortConfigItem, value: any) => {
    setFormData((prev) => {
      const updated = [...(prev.port_config || [])]
      updated[index] = {
        ...updated[index],
        [field]: value,
      }
      return { ...prev, port_config: updated }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} size="xl">
      <DialogContent showFullscreenButton={true} showCloseButton={true}>
        <DialogHeader>
          <DialogTitle>
            {initialPlan ? t("hosting.editPlan", "Edit Paket Hosting") : t("hosting.addPlan", "Tambah Paket Hosting Baru")}
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <form id="plan-form" onSubmit={handleSubmit} className="space-y-5 text-sm py-2">
          {/* General Plan Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              {t("hosting.plan.generalInfo")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  {t("hosting.planName")}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t("hosting.plan.namePlaceholder")}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">{t("hosting.plan.slugLabel")}</label>
                <input
                  type="text"
                  required
                  placeholder={t("hosting.plan.slugPlaceholder")}
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  {t("hosting.plan.shortDescLabel")}
                </label>
                <input
                  type="text"
                  placeholder={t("hosting.plan.shortDescPlaceholder")}
                  value={formData.short_description || ""}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  {t("hosting.plan.badgeLabel")}
                </label>
                <input
                  type="text"
                  placeholder={t("hosting.plan.badgePlaceholder")}
                  value={formData.badge || ""}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Media / Images */}
          <div className="space-y-4 pt-3 border-t border-border/50">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="size-3.5 text-primary" />
              <span>{t("hosting.plan.imageSection")}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Icon / Logo */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground block">
                  {t("hosting.plan.iconLabel")}
                </label>
                <div className="flex items-center gap-3">
                  {formData.icon ? (
                    <div className="relative size-14 rounded-xl border border-border bg-muted/30 p-1 flex items-center justify-center shrink-0">
                      <img
                        src={getImageUrl(formData.icon)}
                        alt={t("hosting.plan.iconPreviewAlt")}
                        className="max-h-full max-w-full object-contain rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, icon: "" }))}
                        className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs hover:opacity-90 cursor-pointer"
                        title={t("hosting.plan.removeIcon")}
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="size-14 rounded-xl border border-dashed border-border bg-muted/20 flex items-center justify-center text-muted-foreground shrink-0">
                      <ImageIcon className="size-6 opacity-40" />
                    </div>
                  )}

                  <div className="flex-1">
                    <label className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl border border-border bg-secondary hover:bg-secondary/80 text-foreground cursor-pointer transition">
                      {uploadingField === "icon" ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Upload className="size-3.5" />
                      )}
                      <span>{formData.icon ? t("hosting.plan.changeIcon") : t("hosting.plan.chooseIcon")}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "icon")}
                        disabled={uploadingField !== null}
                      />
                    </label>
                    <p className="text-[11px] text-muted-foreground mt-1">{t("hosting.plan.iconFormat")}</p>
                  </div>
                </div>
              </div>

              {/* Thumbnail / Banner */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground block">
                  {t("hosting.plan.thumbnailLabel")}
                </label>
                <div className="flex items-center gap-3">
                  {formData.thumbnail_url ? (
                    <div className="relative w-24 h-14 rounded-xl border border-border bg-muted/30 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={getImageUrl(formData.thumbnail_url)}
                        alt={t("hosting.plan.thumbnailPreviewAlt")}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, thumbnail_url: "" }))}
                        className="absolute top-1 right-1 size-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs hover:opacity-90 cursor-pointer"
                        title={t("hosting.plan.removeBanner")}
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-14 rounded-xl border border-dashed border-border bg-muted/20 flex items-center justify-center text-muted-foreground shrink-0">
                      <ImageIcon className="size-6 opacity-40" />
                    </div>
                  )}

                  <div className="flex-1">
                    <label className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl border border-border bg-secondary hover:bg-secondary/80 text-foreground cursor-pointer transition">
                      {uploadingField === "thumbnail" ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Upload className="size-3.5" />
                      )}
                      <span>{formData.thumbnail_url ? t("hosting.plan.changeBanner") : t("hosting.plan.chooseBanner")}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "thumbnail")}
                        disabled={uploadingField !== null}
                      />
                    </label>
                    <p className="text-[11px] text-muted-foreground mt-1">{t("hosting.plan.bannerRatio")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Docker Image & Runtime Config */}
          <div className="space-y-4 pt-3 border-t border-border/50">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              {t("hosting.plan.imageExecSection")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  {t("hosting.dockerImage")}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t("hosting.plan.dockerImagePlaceholder")}
                  value={formData.image_name}
                  onChange={(e) => setFormData({ ...formData, image_name: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">{t("hosting.plan.imageTagLabel")}</label>
                <input
                  type="text"
                  required
                  placeholder={t("hosting.plan.imageTagPlaceholder")}
                  value={formData.image_tag}
                  onChange={(e) => setFormData({ ...formData, image_tag: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  {t("hosting.plan.customCommandLabel")}
                </label>
                <input
                  type="text"
                  placeholder={t("hosting.plan.customCommandPlaceholder")}
                  value={formData.command || ""}
                  onChange={(e) => setFormData({ ...formData, command: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  {t("hosting.plan.customEntrypointLabel")}
                </label>
                <input
                  type="text"
                  placeholder={t("hosting.plan.customEntrypointPlaceholder")}
                  value={formData.entrypoint || ""}
                  onChange={(e) => setFormData({ ...formData, entrypoint: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Open / Exposed Ports Configuration */}
          <div className="space-y-3 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Network className="size-4 text-primary" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {t("hosting.plan.portsSection")}
                </h3>
              </div>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleAddPort}
                className="gap-1 cursor-pointer font-semibold text-xs"
              >
                <Plus className="size-3" />
                <span>{t("hosting.plan.addPort")}</span>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              {t("hosting.plan.portsHint")}
            </p>

            <div className="space-y-2.5">
              {(formData.port_config || []).length === 0 ? (
                <div className="p-4 bg-muted/40 rounded-xl text-center text-xs text-muted-foreground">
                  {t("hosting.plan.noPorts")}
                </div>
              ) : (
                (formData.port_config || []).map((port, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-muted/40 border border-border/70 rounded-xl flex flex-col md:flex-row items-stretch md:items-end gap-3"
                  >
                    <div className="w-full md:w-32 shrink-0">
                      <label className="text-[11px] font-medium text-muted-foreground block mb-1 whitespace-nowrap">
                        {t("hosting.plan.internalPortLabel")}
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="65535"
                        placeholder={t("hosting.plan.internalPortPlaceholder")}
                        value={port.container_port}
                        onChange={(e) =>
                          handlePortChange(
                            idx,
                            "container_port",
                            e.target.value === "" ? ("" as any) : Number(e.target.value)
                          )
                        }
                        className="w-full h-8 px-2.5 py-1 bg-background border border-border rounded-lg text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div className="w-full md:w-28 shrink-0">
                      <label className="text-[11px] font-medium text-muted-foreground block mb-1 whitespace-nowrap">
                        {t("hosting.plan.protocolLabel")}
                      </label>
                      <Select
                        value={port.protocol || "tcp"}
                        onValueChange={(val: any) => handlePortChange(idx, "protocol", val)}
                      >
                        <SelectTrigger size="sm" className="w-full h-8 text-xs bg-background border-border">
                          <SelectValue placeholder={t("hosting.plan.protocolPlaceholder")} />
                        </SelectTrigger>
                        <SelectContent className="z-[10000]">
                          <SelectItem value="tcp">TCP</SelectItem>
                          <SelectItem value="udp">UDP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-full md:w-36 shrink-0">
                      <label className="text-[11px] font-medium text-muted-foreground block mb-1 whitespace-nowrap">
                        {t("hosting.plan.labelKey")}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={t("hosting.plan.labelKeyPlaceholder")}
                        value={port.name || ""}
                        onChange={(e) => handlePortChange(idx, "name", e.target.value)}
                        className="w-full h-8 px-2.5 py-1 bg-background border border-border rounded-lg text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div className="w-full md:flex-1 min-w-0">
                      <label className="text-[11px] font-medium text-muted-foreground block mb-1 whitespace-nowrap">
                        {t("hosting.plan.portDescLabel")}
                      </label>
                      <input
                        type="text"
                        placeholder={t("hosting.plan.portDescPlaceholder")}
                        value={port.description || ""}
                        onChange={(e) => handlePortChange(idx, "description", e.target.value)}
                        className="w-full h-8 px-2.5 py-1 bg-background border border-border rounded-lg text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemovePort(idx)}
                      className="self-end md:self-end text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer shrink-0 h-8 w-8 mb-0.5"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Resources & Pricing */}
          <div className="space-y-4 pt-3 border-t border-border/50">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              {t("hosting.plan.resourceSection")}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  {t("hosting.plan.vcpuLabel")}
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  placeholder="e.g. 1"
                  value={formData.cpu_limit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cpu_limit: e.target.value === "" ? ("" as any) : Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  {t("hosting.plan.ramLabel")}
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 1024"
                  value={formData.memory_limit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      memory_limit: e.target.value === "" ? ("" as any) : Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  {t("hosting.plan.diskLabel")}
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 20"
                  value={formData.disk_limit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      disk_limit: e.target.value === "" ? ("" as any) : Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                {t("hosting.plan.pricingLabel")}
              </label>
              <input
                type="number"
                required
                placeholder={t("hosting.plan.pricingPlaceholder")}
                value={formData.price_monthly}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price_monthly: e.target.value === "" ? ("" as any) : Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </form>
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} className="cursor-pointer">
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            form="plan-form"
            disabled={isPending}
            className="font-semibold cursor-pointer"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {t("hosting.plan.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
