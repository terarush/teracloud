import { AuthLayout } from "./layouts/AuthLayout"
import { LoginForm } from "./components/LoginForm"
import { Seo } from "@/components/seo"
import { getSeoMeta } from "@/meta"

export default function Login() {
  const seo = getSeoMeta()
  return (
    <>
      <Seo title="Masuk" description={seo.description} path="/login" />
      <AuthLayout title="Masuk">
        <LoginForm />
      </AuthLayout>
    </>
  )
}
