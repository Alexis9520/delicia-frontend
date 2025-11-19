"use client"

import { useState, useEffect, useRef } from "react"
import type { CartItem, Product } from "@/lib/types"

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const cartRef = useRef<CartItem[]>([])

  useEffect(() => {
    try {
      const savedCart = typeof window !== "undefined" ? localStorage.getItem("cart") : null
      if (savedCart) {
        const parsed = JSON.parse(savedCart)
        setCart(parsed)
        cartRef.current = parsed
      }
    } catch {
      // si localStorage falla, seguimos con un carrito vacío
      setCart([])
      cartRef.current = []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Escuchar eventos externos 'cartUpdated' (otros componentes que manipulan localStorage)
  useEffect(() => {
    const handler = (ev: Event) => {
      try {
        const saved = typeof window !== "undefined" ? localStorage.getItem("cart") : null
        if (saved) {
          const parsed: CartItem[] = JSON.parse(saved)
          // sólo actualizar si el contenido realmente cambió (evita bucles)
          if (JSON.stringify(parsed) !== JSON.stringify(cartRef.current)) {
            setCart(parsed)
            cartRef.current = parsed
          }
        } else {
          if (cartRef.current.length !== 0) {
            setCart([])
            cartRef.current = []
          }
        }
      } catch {
        // ignorar errores de parseo
      }
    }

    window.addEventListener("cartUpdated", handler as EventListener)
    return () => window.removeEventListener("cartUpdated", handler as EventListener)
  }, [])

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("cart", JSON.stringify(cart))
      // Mantener referencia actualizada para evitar que el evento re-provoque actualizaciones locales
      cartRef.current = cart
      // Notificar posibles listeners (microinteracciones)
      window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { count: getItemCount() } }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, isLoading])

  const addItem = (product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: Math.min(item.quantity + quantity, item.stock) } : item,
        )
      }

      return [...prevCart, { ...product, quantity: Math.min(quantity, product.stock) }]
    })
  }

  const removeItem = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }

    setCart((prevCart) =>
      prevCart.map((item) => (item.id === productId ? { ...item, quantity: Math.min(quantity, item.stock) } : item)),
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const getTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0)
  }

  return {
    cart,
    isLoading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
  }
}