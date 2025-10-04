"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CartItemComponent } from "@/components/cart/cart-item"
import { CartSummary } from "@/components/cart/cart-summary"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import { ShoppingBag, ArrowLeft } from "lucide-react"
import Link from "next/link"

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
      <div className="max-w-4xl w-full mx-auto px-4 py-8">
        <p className="text-center">Cargando carrito...</p>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <ShoppingBag className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
        <h1 className="text-3xl font-bold mb-4">Tu carrito está vacío</h1>
        <p className="text-muted-foreground mb-8">Agrega productos a tu carrito para comenzar tu pedido</p>
        <Button asChild size="lg">
          <Link href="/catalogo">Ver Catálogo</Link>
        </Button>
      </div>
    )
  }

  const subtotal = getTotal()
  const shipping = subtotal > 50 ? 0 : 5
  const tax = subtotal * 0.1
  const total = subtotal + shipping + tax

  return (
    <div className="max-w-4xl w-full mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Seguir comprando
      </Button>

      <h1 className="text-4xl font-bold mb-8">Carrito de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg p-6">
            {cart.map((item) => (
              <CartItemComponent key={item.id} item={item} onUpdateQuantity={updateQuantity} onRemove={removeItem} />
            ))}
          </div>
        </div>

        <div>
          <CartSummary
            subtotal={subtotal}
            shipping={shipping}
            tax={tax}
            total={total}
            onCheckout={handleCheckout}
            isCheckoutDisabled={cart.length === 0}
          />
          {subtotal < 50 && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Agrega ${(50 - subtotal).toFixed(2)} más para envío gratis
            </p>
          )}
        </div>
      </div>
    </div>
  )
}