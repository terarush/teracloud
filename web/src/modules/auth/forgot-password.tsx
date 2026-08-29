import { AuthLayout } from "./layouts/AuthLayout"
import { ForgotPasswordForm } from "./components/ForgotPasswordForm"
import { authContent } from "./content/auth"

export default function ForgotPassword() {
  return (
    <AuthLayout title={authContent.forgotPassword.title}>
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
