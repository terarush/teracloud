import { AuthLayout } from "./layouts/AuthLayout"
import { RegisterForm } from "./components/RegisterForm"
import { authContent } from "./content/auth"
import { Seo } from "@/components/seo"
import { getSeoMeta } from "@/meta"

export default function Register() {
  const seo = getSeoMeta()
  const title = authContent.register.title
  return (
    <>
      <Seo title={title} description={seo.description} path="/register" />
      <AuthLayout title={title}>
        <RegisterForm />
      </AuthLayout>
    </>
  )
}
