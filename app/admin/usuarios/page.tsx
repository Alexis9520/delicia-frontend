"use client"

import { useEffect, useMemo, useState } from "react"
import { Mail, Phone, Edit2, Trash2, Key, Eye, RefreshCw, UserPlus, Search } from "lucide-react"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import type { User } from "@/lib/types"
import { formatCurrency } from "@/lib/currency"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Crear usuario
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "ROLE_TRABAJADOR",
    phone: "",
  })
  const [isRegistering, setIsRegistering] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)

  // Modales: editar
  const [editUser, setEditUser] = useState<User | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "ROLE_TRABAJADOR",
  })

  // Modales: cambiar contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ password: "" })
  const [passwordUserId, setPasswordUserId] = useState<string | null>(null)

  // Historial
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [userHistory, setUserHistory] = useState<any[]>([])
  const [historyUserName, setHistoryUserName] = useState("")

  // Filtros
  const [search, setSearch] = useState("")
  // Cambiado: usar "all" en lugar de "" para evitar error en SelectItem
  const [roleFilter, setRoleFilter] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Debounce de búsqueda
  useEffect(() => {
    const t = setTimeout(() => {
      fetchUsers()
    }, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, search])

  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      // Solo enviar role si no es "all"
      if (roleFilter !== "all") params.append("role", roleFilter)
      if (search) params.append("search", search)
      const response = await api.get(`/users?${params.toString()}`)
      const data = (response as any)?.data ?? response
      setUsers(Array.isArray(data) ? data : [])
    } catch (error) {
      // Mock si backend falla
      setUsers([
        {
          id: "1",
          email: "admin@panaderia.com",
          name: "Administrador Principal",
          role: "ROLE_ADMIN",
          phone: "+51 999 999 999",
        },
        {
          id: "2",
          email: "trabajador@panaderia.com",
          name: "Juan Pérez",
          role: "ROLE_TRABAJADOR",
          phone: "+51 988 888 888",
        },
        {
          id: "3",
          email: "cliente@example.com",
          name: "María García",
          role: "ROLE_CLIENTE",
          phone: "+51 977 777 777",
        },
        {
          id: "4",
          email: "cliente2@example.com",
          name: "Carlos López",
          role: "ROLE_CLIENTE",
          phone: "+51 955 555 555",
        },
      ])
      toast({
        title: "Modo demostración",
        description: "No se pudo cargar desde el servidor. Mostrando usuarios de ejemplo.",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const refresh = () => {
    setIsRefreshing(true)
    fetchUsers()
  }

  // Cambiar rol de usuario
  const handleRoleChange = async (userId: string, newRole: User["role"]) => {
    const prev = users
    setUsers((curr) => curr.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
    try {
      await api.put(`/users/${userId}/role`, { role: newRole })
      toast({ title: "Rol actualizado", description: "El rol del usuario ha sido actualizado exitosamente" })
    } catch (error) {
      setUsers(prev)
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol del usuario",
        variant: "destructive",
      })
    }
  }

  // Eliminar usuario
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return
    try {
      await api.delete(`/users/${userId}`)
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      toast({ title: "Usuario eliminado", description: "El usuario fue eliminado correctamente." })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario.",
        variant: "destructive",
      })
    }
  }

  // Editar usuario
  const openEditModal = (user: User) => {
    setEditUser(user)
    setEditForm({
      name: user.name ?? "",
      email: user.email,
      phone: user.phone || "",
      role: user.role,
    })
    setShowEditModal(true)
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editUser) return
    try {
      await api.put(`/users/${editUser.id}`, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        role: editForm.role,
      })
      setShowEditModal(false)
      fetchUsers()
      toast({ title: "Usuario editado", description: "Los datos del usuario han sido actualizados." })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo editar el usuario.",
        variant: "destructive",
      })
    }
  }

  // Registrar usuario
  const handleRegisterInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setRegisterForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsRegistering(true)
    try {
      await api.post("/users", {
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        role: registerForm.role,
        phone: registerForm.phone,
      })
      toast({
        title: "Usuario creado",
        description: `El usuario ${registerForm.email} fue registrado correctamente.`,
      })
      setRegisterForm({ name: "", email: "", password: "", role: "ROLE_TRABAJADOR", phone: "" })
      // Cerrar modal tras registro exitoso
      setShowRegisterModal(false)
      fetchUsers()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "No se pudo crear el usuario.",
        variant: "destructive",
      })
    } finally {
      setIsRegistering(false)
    }
  }

  // Cambiar contraseña
  const openPasswordModal = (userId: string) => {
    setPasswordUserId(userId)
    setPasswordForm({ password: "" })
    setShowPasswordModal(true)
  }

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordUserId) return
    try {
      await api.put(`/users/${passwordUserId}/password`, { password: passwordForm.password })
      setShowPasswordModal(false)
      toast({ title: "Contraseña actualizada", description: "La contraseña ha sido cambiada exitosamente." })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cambiar la contraseña.",
        variant: "destructive",
      })
    }
  }

  // Ver historial
  const openHistoryModal = async (user: User) => {
    setHistoryUserName(user.name ?? user.email)
    setShowHistoryModal(true)
    try {
      const history = await api.get(`/users/${user.id}/orders`)
      const data = (history as any)?.data ?? history
      setUserHistory(Array.isArray(data) ? data : [])
    } catch {
      setUserHistory([])
    }
  }

  const getRoleBadgeVariant = (role: User["role"]) => {
    switch (role) {
      case "ROLE_ADMIN":
        return "destructive"
      case "ROLE_TRABAJADOR":
        return "default"
      case "ROLE_CLIENTE":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getRoleLabel = (role: User["role"]) => {
    switch (role) {
      case "ROLE_ADMIN":
        return "Administrador"
      case "ROLE_TRABAJADOR":
        return "Trabajador"
      case "ROLE_CLIENTE":
        return "Cliente"
      default:
        return role
    }
  }

  // KPIs
  const totalUsuarios = users.length
  const totalClientes = useMemo(() => users.filter((u) => u.role === "ROLE_CLIENTE").length, [users])
  const totalTrabajadores = useMemo(() => users.filter((u) => u.role === "ROLE_TRABAJADOR").length, [users])

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
        <main className="flex min-h-[60vh] items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-rose-50 to-amber-100 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950">
          <Spinner className="h-8 w-8" />
        </main>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
      <main className="min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-rose-50 to-amber-100 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 md:py-12">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-balance text-4xl font-extrabold tracking-tight text-stone-900 drop-shadow-sm dark:text-stone-100">
              Gestión de Usuarios
            </h1>
            <Button onClick={refresh} variant="outline" className="rounded-xl" disabled={isRefreshing}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {isRefreshing ? "Actualizando..." : "Refrescar"}
            </Button>
          </div>

          {/* Buscador y filtro */}
          <Card className="mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">Buscar y filtrar</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="col-span-2">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative mt-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <Input
                    id="search"
                    placeholder="Buscar por nombre o correo..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-11 pl-10"
                  />
                </div>
              </div>
              <div>
                <Label>Rol</Label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="mt-1 h-11">
                    <SelectValue placeholder="Todos los roles" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Cambiado: usar 'all' en lugar de '' */}
                    <SelectItem value="all">Todos los roles</SelectItem>
                    <SelectItem value="ROLE_ADMIN">Administrador</SelectItem>
                    <SelectItem value="ROLE_TRABAJADOR">Trabajador</SelectItem>
                    <SelectItem value="ROLE_CLIENTE">Cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* KPIs */}
          <div className="mb-8 grid gap-6 md:grid-cols-3">
            <Card className="transition-all hover:-translate-y-[2px] hover:shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalUsuarios}</div>
              </CardContent>
            </Card>
            <Card className="transition-all hover:-translate-y-[2px] hover:shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">{totalClientes}</div>
              </CardContent>
            </Card>
            <Card className="transition-all hover:-translate-y-[2px] hover:shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Trabajadores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-rose-600">{totalTrabajadores}</div>
              </CardContent>
            </Card>
          </div>

          {/* Registro de usuario (ahora en modal) */}
          <Card className="mb-8">
            <CardHeader className="pb-3 flex items-center justify-between gap-4">
              <CardTitle className="text-lg font-bold">Registrar nuevo usuario</CardTitle>
              <div>
                <Dialog open={showRegisterModal} onOpenChange={(v) => setShowRegisterModal(v)}>
                  <DialogTrigger asChild>
                    <Button variant="brand" className="rounded-xl">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Nuevo usuario
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Registrar nuevo usuario</DialogTitle>
                      <DialogDescription>Completa los datos para crear un nuevo usuario.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRegisterUser} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Nombre</Label>
                        <Input
                          type="text"
                          name="name"
                          required
                          value={registerForm.name}
                          onChange={handleRegisterInput}
                          disabled={isRegistering}
                          placeholder="Nombre completo"
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Correo</Label>
                        <Input
                          type="email"
                          name="email"
                          required
                          value={registerForm.email}
                          onChange={handleRegisterInput}
                          disabled={isRegistering}
                          placeholder="correo@ejemplo.com"
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Contraseña</Label>
                        <Input
                          type="password"
                          name="password"
                          required
                          value={registerForm.password}
                          onChange={handleRegisterInput}
                          disabled={isRegistering}
                          placeholder="••••••••"
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Rol</Label>
                        <Select
                          value={registerForm.role}
                          onValueChange={(v) => setRegisterForm((prev) => ({ ...prev, role: v }))}
                          disabled={isRegistering}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ROLE_ADMIN">Administrador</SelectItem>
                            <SelectItem value="ROLE_TRABAJADOR">Trabajador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label>Teléfono</Label>
                        <Input
                          type="text"
                          name="phone"
                          value={registerForm.phone}
                          onChange={handleRegisterInput}
                          disabled={isRegistering}
                          placeholder="+51 999 999 999"
                          className="h-11"
                        />
                      </div>
                      <div className="sm:col-span-2 flex gap-2">
                        <Button type="submit" disabled={isRegistering} variant="brand" className="flex-1 rounded-xl">
                          {isRegistering ? (
                            <>Registrando...</>
                          ) : (
                            <>Registrar usuario</>
                          )}
                        </Button>
                        <DialogClose asChild>
                          <Button type="button" variant="outline" className="flex-0 rounded-xl" onClick={() => setShowRegisterModal(false)}>
                            Cancelar
                          </Button>
                        </DialogClose>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
          </Card>

          {/* Tabla de usuarios */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">Todos los usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Rol actual</TableHead>
                      <TableHead>Cambiar rol</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {user.id ? `#${String(user.id).slice(0, 8)}` : ""}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{user.email}</span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>{getRoleLabel(user.role)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value) => user.id && handleRoleChange(user.id, value as User["role"])}
                          >
                            <SelectTrigger className="w-[170px]">
                              <SelectValue placeholder="Seleccionar rol" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ROLE_CLIENTE">Cliente</SelectItem>
                              <SelectItem value="ROLE_TRABAJADOR">Trabajador</SelectItem>
                              <SelectItem value="ROLE_ADMIN">Administrador</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5">
                            <Button
                              title="Editar usuario"
                              variant="outline"
                              size="icon"
                              className="rounded-full"
                              onClick={() => openEditModal(user)}
                            >
                              <Edit2 className="h-4 w-4 text-amber-600" />
                            </Button>
                            <Button
                              title="Cambiar contraseña"
                              variant="outline"
                              size="icon"
                              className="rounded-full"
                              onClick={() => openPasswordModal(user.id as string)}
                            >
                              <Key className="h-4 w-4 text-sky-600" />
                            </Button>
                            <Button
                              title="Ver historial"
                              variant="outline"
                              size="icon"
                              className="rounded-full"
                              onClick={() => openHistoryModal(user)}
                            >
                              <Eye className="h-4 w-4 text-stone-500" />
                            </Button>
                            <Button
                              title="Eliminar usuario"
                              variant="ghost"
                              size="icon"
                              className="rounded-full"
                              onClick={() => handleDeleteUser(user.id as string)}
                            >
                              <Trash2 className="h-4 w-4 text-rose-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Modal de edición */}
          {showEditModal && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl border border-white/60 bg-white/90 p-6 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-stone-950/70">
                <h2 className="mb-4 text-xl font-bold">Editar usuario</h2>
                <form onSubmit={handleEditUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input type="text" name="name" required value={editForm.name} onChange={handleEditInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label>Correo</Label>
                    <Input type="email" name="email" required value={editForm.email} onChange={handleEditInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input type="text" name="phone" value={editForm.phone} onChange={handleEditInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label>Rol</Label>
                    <Select value={editForm.role} onValueChange={(v) => setEditForm((p) => ({ ...p, role: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ROLE_ADMIN">Administrador</SelectItem>
                        <SelectItem value="ROLE_TRABAJADOR">Trabajador</SelectItem>
                        <SelectItem value="ROLE_CLIENTE">Cliente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button type="submit" variant="brand" className="flex-1 rounded-xl">
                      Guardar cambios
                    </Button>
                    <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setShowEditModal(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal de cambiar contraseña */}
          {showPasswordModal && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl border border-white/60 bg-white/90 p-6 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-stone-950/70">
                <h2 className="mb-4 text-xl font-bold">Cambiar contraseña</h2>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nueva contraseña</Label>
                    <Input
                      type="password"
                      name="password"
                      required
                      value={passwordForm.password}
                      onChange={handlePasswordInputChange}
                    />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button type="submit" variant="brand" className="flex-1 rounded-xl">
                      Cambiar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 rounded-xl"
                      onClick={() => setShowPasswordModal(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal de historial/actividad */}
          {showHistoryModal && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
              <div className="w-full max-w-2xl rounded-2xl border border-white/60 bg-white/90 p-6 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-stone-950/70">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold">Historial de {historyUserName}</h2>
                  <Button variant="outline" size="sm" onClick={() => setShowHistoryModal(false)}>
                    Cerrar
                  </Button>
                </div>
                {userHistory.length === 0 ? (
                  <p className="text-sm text-stone-600 dark:text-stone-300">No hay historial disponible.</p>
                ) : (
                  <div className="max-h-[420px] space-y-2 overflow-y-auto">
                    {userHistory.map((item: any, idx: number) => (
                      <div key={idx} className="rounded-xl border border-white/60 bg-white/80 p-3 dark:border-white/10 dark:bg-stone-900/60">
                        <p className="font-semibold">Pedido #{item.id ?? item.orderId}</p>
                        <p className="text-sm text-stone-600 dark:text-stone-300">
                          Fecha:{" "}
                          {item.fecha
                            ? new Date(item.fecha).toLocaleString("es-PE")
                            : item.createdAt
                            ? new Date(item.createdAt).toLocaleString("es-PE")
                            : "-"}
                        </p>
                        {typeof item.total === "number" && (
                          <p className="text-sm">Total: {formatCurrency(item.total)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  )
}