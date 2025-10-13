"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CartItemComponent } from "@/components/cart/cart-item"
import { CartSummary } from "@/components/cart/cart-summary"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import { formatCurrency } from "@/lib/currency"

export default function CarritoPage() {
  const router = useRouter()
  const { cart, updateQuantity, removeItem, getTotal, isLoading } = useCart()
  const { isAuthenticated } = useAuth()

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout")
      return
    }
    router.push("/checkout")
  }

  if (isLoading) {
    return (
      <main className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-rose-50 to-amber-100 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950">
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl dark:bg-amber-400/10" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-400/10" />
        <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center px-4 py-24">
          <div className="mb-4 animate-spin text-amber-500/80">
            <ShoppingBag className="h-14 w-14" />
          </div>
          <p className="text-xl text-stone-700 dark:text-stone-200">Cargando tu carrito...</p>
        </div>
      </main>
    )
  }

  if (cart.length === 0) {
    return (
      <main className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-rose-50 to-amber-100 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950 px-4">
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl dark:bg-amber-400/10" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-400/10" />
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 mx-auto w-full max-w-lg rounded-2xl border border-white/60 bg-white/80 p-10 text-center shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-stone-950/60"
        >
          <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-rose-400 text-white shadow-lg">
            <ShoppingBag className="h-12 w-12" />
          </div>
          <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
            ¡Carrito vacío!
          </h1>
          <p className="mb-8 text-stone-600 dark:text-stone-300">
            Agrega productos artesanales y endulza tu día.
          </p>
          <Button asChild variant="brand" size="lg" className="w-full rounded-xl">
            <Link href="/catalogo">Ver Catálogo</Link>
          </Button>
        </motion.section>
      </main>
    )
  }

  const subtotal = getTotal()
  const FREE_SHIPPING = 50
  const shipping = subtotal >= FREE_SHIPPING ? 0 : 5
  const tax = subtotal * 0.1
  const total = subtotal + shipping + tax

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-rose-50 to-amber-100 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 md:py-10">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 rounded-lg px-3 py-2 text-stone-700 hover:bg-white/70 dark:text-stone-200 dark:hover:bg-stone-900/60"
        >
          <ArrowLeft className="h-5 w-5" />
          Seguir comprando
        </Button>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-balance text-4xl font-extrabold tracking-tight text-stone-900 drop-shadow-sm dark:text-stone-100 sm:text-5xl"
        >
          Carrito de Compras
        </motion.h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <div className="rounded-2xl border border-white/60 bg-white/80 p-2 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-stone-950/60 sm:p-3">
              <AnimatePresence initial={false}>
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 14, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.2 } }}
                    className="rounded-xl"
                  >
                    <CartItemComponent
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          <aside className="lg:sticky lg:top-24">
            <CartSummary
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              total={total}
              onCheckout={handleCheckout}
              isCheckoutDisabled={cart.length === 0}
            />
            {subtotal < FREE_SHIPPING && (
              <p className="mt-4 text-center text-sm text-stone-600 dark:text-stone-300">
                ¡Agrega{" "}
                <span className="font-semibold text-amber-700 dark:text-amber-300">
                  {formatCurrency(FREE_SHIPPING - subtotal)}
                </span>{" "}
                más para envío gratis!
              </p>
            )}
          </aside>
        </div>
      </div>
    </main>
  )
}