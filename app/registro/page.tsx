"use client"
import { RegisterForm } from "@/components/auth/register-form"
import { motion } from "framer-motion"

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-rose-50 to-amber-100 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950">
      {/* Decorativos suaves */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl dark:bg-amber-400/10" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-400/10" />

      <div className="relative z-10 w-full max-w-lg px-4 py-10 md:py-16">
        <motion.div
          className="mb-10 text-center md:mb-14"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-rose-300 text-white shadow-lg shadow-rose-200/40 ring-8 ring-white/60 dark:shadow-none dark:ring-white/5">
            {/* Ícono (trigo/pan) */}
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8"
              aria-hidden="true"
              fill="currentColor"
            >
              <path d="M11 2a1 1 0 0 1 2 0v5.09a7.5 7.5 0 0 1 4.91 4.91H23a1 1 0 1 1 0 2h-5.09a7.5 7.5 0 0 1-4.91 4.91V22a1 1 0 1 1-2 0v-3.09a7.5 7.5 0 0 1-4.91-4.91H1a1 1 0 1 1 0-2h5.09A7.5 7.5 0 0 1 11 7.09V2zm1 7a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z" />
            </svg>
          </div>
          <h1 className="mb-3 text-balance text-4xl font-extrabold tracking-tight text-stone-900 drop-shadow-sm dark:text-stone-100 md:text-5xl">
            Panadería Delicia
          </h1>
          <p className="text-pretty text-stone-600 dark:text-stone-300">
            El sabor artesanal de siempre
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <RegisterForm />
        </motion.div>
      </div>
    </div>
  )
}