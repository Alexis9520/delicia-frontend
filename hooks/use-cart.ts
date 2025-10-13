"use client"

import { useState, useEffect } from "react"
import type { CartItem, Product } from "@/lib/types"

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const savedCart = typeof window !== "undefined" ? localStorage.getItem("cart") : null
      if (savedCart) setCart(JSON.parse(savedCart))
    } catch {
      // si localStorage falla, seguimos con un carrito vacío
      setCart([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("cart", JSON.stringify(cart))
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