import { AuthLayout } from "./layouts/AuthLayout"
import { LoginForm } from "./components/LoginForm"

export default function Login() {
  return (
    <AuthLayout title="Masuk">
      <LoginForm />
    </AuthLayout>
  )
}
