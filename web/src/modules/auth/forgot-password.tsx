import { AuthLayout } from "./layouts/AuthLayout"
import { ForgotPasswordForm } from "./components/ForgotPasswordForm"
import { authContent } from "./content/auth"
import { Seo } from "@/components/seo"
import { getSeoMeta } from "@/meta"

export default function ForgotPassword() {
  const seo = getSeoMeta()
  const title = authContent.forgotPassword.title
  return (
    <>
      <Seo title={title} description={seo.description} path="/forgot-password" />
      <AuthLayout title={title}>
        <ForgotPasswordForm />
      </AuthLayout>
    </>
  )
}
