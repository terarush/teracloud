import { useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Camera, Loader2, Save, Lock } from "lucide-react"
import { useProfile } from "../hooks/useProfile"
import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { authApi } from "@/service/api/auth"

export const ProfileView: React.FC = () => {
  const { t } = useTranslation()
  const {
    user, form, isSavingProfile, handleSaveProfile,
    isChangingPassword, oldPassword, setOldPassword,
    newPassword, setNewPassword, confirmPassword, setConfirmPassword,
    handleChangePassword,
  } = useProfile()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingAvatar(true)
    try {
      const url = await authApi.uploadFile(file)
      form.setAvatar(url)
      toast.success(t("profile.avatarUploaded", "Avatar uploaded — save your profile to apply"))
    } catch {
      toast.error(t("profile.avatarUploadFailed", "Failed to upload avatar"))
    } finally {
      setIsUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const inputProps = "disabled:opacity-60 disabled:cursor-not-allowed"

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t("nav.userProfile", "User Profile")}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {t("auth.profile.subtitle", "Kelola informasi akun dan kata sandi Anda.")}
        </p>
      </div>

      {/* Profile info */}
      <Card className="ring-1 ring-foreground/10">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {t("auth.profile.profileInfo", "Informasi Profil")}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {t("auth.profile.profileInfoDesc", "Perbarui identitas dan detail kontak akun Anda.")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <UserAvatar user={{ ...user, avatar: form.avatar || user?.avatar }} className="size-16 text-base" />
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer gap-1.5"
                  disabled={isUploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploadingAvatar ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5" />}
                  <span>{t("auth.profile.changeAvatar", "Ubah Foto")}</span>
                </Button>
                {form.avatar !== (user?.avatar ?? "") && (
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    {t("auth.profile.unsavedAvatarHint", "Foto baru akan tersimpan saat Anda menyimpan profil.")}
                  </div>
                )}
              </div>
            </div>

            <Separator className="bg-border/60" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">{t("auth.profile.firstName", "Nama Depan")}</Label>
                <Input id="firstName" value={form.firstName} onChange={(e) => form.setFirstName(e.target.value)} className={inputProps} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">{t("auth.profile.lastName", "Nama Belakang")}</Label>
                <Input id="lastName" value={form.lastName} onChange={(e) => form.setLastName(e.target.value)} className={inputProps} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username">{t("auth.profile.username", "Username")}</Label>
              <Input id="username" value={form.username} onChange={(e) => form.setUsername(e.target.value)} className={inputProps} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">{t("auth.profile.email", "Email")}</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => form.setEmail(e.target.value)} className={inputProps} required />
            </div>

            <div className="flex justify-end">
              <Button type="submit" size="sm" className="gap-1.5 cursor-pointer font-semibold" disabled={isSavingProfile}>
                {isSavingProfile ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                <span>{t("auth.profile.saveProfile", "Simpan Profil")}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card className="ring-1 ring-foreground/10">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Lock className="size-4 text-primary" />
            <span>{t("auth.profile.changePassword", "Ubah Kata Sandi")}</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {t("auth.profile.changePasswordDesc", "Gunakan kata sandi yang kuat dan simpan di tempat aman.")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="oldPassword">{t("auth.profile.currentPassword", "Kata Sandi Saat Ini")}</Label>
              <Input id="oldPassword" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className={inputProps} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">{t("auth.profile.newPassword", "Kata Sandi Baru")}</Label>
                <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputProps} required minLength={6} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">{t("auth.profile.confirmPassword", "Konfirmasi Kata Sandi")}</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputProps} required />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" size="sm" className="gap-1.5 cursor-pointer font-semibold" disabled={isChangingPassword}>
                {isChangingPassword ? <Loader2 className="size-3.5 animate-spin" /> : <Lock className="size-3.5" />}
                <span>{t("auth.profile.updatePassword", "Perbarui Kata Sandi")}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
