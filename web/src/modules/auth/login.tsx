import { AuthLayout } from "./layouts/AuthLayout"
import { LoginForm } from "./components/LoginForm"
import { authContent } from "./content/auth"
import { Seo } from "@/components/seo"
import { getSeoMeta } from "@/meta"

export default function Login() {
  const seo = getSeoMeta()
  const title = authContent.login.title
  return (
    <>
      <Seo title={title} description={seo.description} path="/login" />
      <AuthLayout title={title}>
        <LoginForm />
      </AuthLayout>
    </>
  )
}
