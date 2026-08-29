import { Helmet } from "react-helmet-async"
import { AuthLayout } from "./layouts/AuthLayout"
import { ResetPasswordForm } from "./components/ResetPasswordForm"
import { companyMeta, getSeoMeta } from "@/meta"

export default function ResetPassword() {
  const seo = getSeoMeta()
  return (
    <>
      <Helmet>
        <title>Reset Password — {companyMeta.name}</title>
        <meta name="description" content={seo.description} />
      </Helmet>
      <AuthLayout>
        <ResetPasswordForm />
      </AuthLayout>
    </>
  )
}
