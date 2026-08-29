import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import type { UserResponse } from "@/service/api/auth"
import { resolveAssetUrl } from "@/lib/asset-url"

interface UserAvatarProps {
  user: UserResponse | null
  className?: string
}

export function UserAvatar({ user, className = "h-8 w-8" }: UserAvatarProps) {
  const initials = (user?.first_name ?? "").slice(0, 2).toUpperCase()

  return (
    <Avatar className={className}>
      {user?.avatar && (
        <AvatarImage
          src={resolveAssetUrl(user.avatar)}
          alt={user.first_name}
          referrerPolicy="no-referrer"
        />
      )}
      <AvatarFallback className="font-semibold bg-primary/10 text-primary text-xs">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
