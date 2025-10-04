import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background via-secondary/20 to-accent/20">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-balance mb-2">Panadería Delicia</h1>
          <p className="text-muted-foreground">El sabor artesanal de siempre</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
