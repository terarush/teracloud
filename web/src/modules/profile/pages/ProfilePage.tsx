import { ProfileView } from "../views/ProfileView"
import { Seo } from "@/components/seo"

export const ProfilePage = () => {
  return (
    <>
      <Seo title="Profile" path="/app/profile" robots="noindex, follow" />
      <ProfileView />
    </>
  )
}
