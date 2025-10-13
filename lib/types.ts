export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  stock: number
  available: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface CartItem extends Product {
  quantity: number
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
}

// --- AGREGA LOS CAMPOS PARA MOSTRADOR Y ESTADÍSTICAS ---
export interface Order {
  id: string
  userId: string
  items: CartItem[]
  total: number
  status: "pendiente" | "en_preparacion" | "en_camino" | "entregado" | "cancelado"
  address: Address
  paymentMethod: string
  createdAt: string
  updatedAt: string

  /** NUEVOS CAMPOS **/
  canal?: "online" | "mostrador"
  nombreCliente?: string
  documentoCliente?: string
}

/** AGREGA ESTA INTERFAZ PARA USUARIOS */
export interface User {
  id?: string
  email: string
  name?: string
  role: string
  phone?: string
  address?: string
}