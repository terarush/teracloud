import { useAuth } from "@/contexts/auth-context"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Shield, Server } from "lucide-react"

export default function AppPage() {
  const { user } = useAuth()

  const firstName = user?.first_name ?? "Developer"
  const role = user?.role ?? "user"
  const lastName = user?.last_name ?? ""
  const fullName = user ? `${firstName} ${lastName}`.trim() : "-"
  const username = user?.username ?? "no-username"
  const email = user?.email ?? "-"
  const authProvider = user?.auth_provider ?? "local"
  const joinedDate = user?.created_at ? new Date(user.created_at).toLocaleDateString("id-ID") : "-"

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="rounded-2xl ring-1 ring-foreground/10 bg-card p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Selamat datang kembali, {firstName}
            </h2>
            <p className="text-sm text-muted-foreground">
              Kelola container, docker host online, dan monitoring resource cloud Anda dari satu console.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1 text-xs bg-primary/10 text-primary border-primary/20">
              Role: {role}
            </Badge>
          </div>
        </div>
      </div>

      {/* Cloud & Docker Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Docker Host</CardTitle>
            <Server className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Online
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Engine ready & running
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Identitas Developer</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate">
              {fullName}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              @{username} • {email}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status Akun Cloud</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              Aktif
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Provider: {authProvider} • Sejak {joinedDate}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
