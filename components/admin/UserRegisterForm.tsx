"use client"

import type React from "react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { getAuthToken } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface UserRegisterFormProps {
  onSuccess?: () => void
}

export function UserRegisterForm({ onSuccess }: UserRegisterFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState("trabajador")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await api.post("/admin/users/register", {
        email,
        password,
        name,
        role, // trabajador o admin
      }, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      })
      toast({ title: "Usuario creado" })
      if (onSuccess) onSuccess()
      setEmail("")
      setPassword("")
      setName("")
      setRole("trabajador")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo registrar el usuario",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Correo</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Rol</Label>
        <select
          id="role"
          value={role}
          onChange={e => setRole(e.target.value)}
          required
          disabled={isLoading}
          className="w-full p-2 border rounded"
        >
          <option value="trabajador">Trabajador</option>
          <option value="admin">Administrador</option>
        </select>
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creando usuario..." : "Crear usuario"}
      </Button>
    </form>
  )
}