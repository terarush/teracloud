import { AuthLayout } from "./layouts/AuthLayout"
import { ResetPasswordForm } from "./components/ResetPasswordForm"
import { Seo } from "@/components/seo"
import { getSeoMeta } from "@/meta"

export default function ResetPassword() {
  const seo = getSeoMeta()
  return (
    <>
      <Seo title="Reset Password" description={seo.description} path="/reset-password" />
      <AuthLayout>
        <ResetPasswordForm />
      </AuthLayout>
    </>
  )
}
