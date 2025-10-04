export interface User {
  id: string
  email: string
  name: string
  role: "cliente" | "trabajador" | "administrador"
}

export interface AuthResponse {
  token: string
  user: User
}

// Store token in localStorage
export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token)
  }
}

// Get token from localStorage
export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token")
  }
  return null
}

// Remove token from localStorage
export function removeAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token")
  }
}

// Store user data
export function setUserData(user: User) {
  if (typeof window !== "undefined") {
    localStorage.setItem("user_data", JSON.stringify(user))
  }
}

// Get user data
export function getUserData(): User | null {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem("user_data")
    return data ? JSON.parse(data) : null
  }
  return null
}

// Remove user data
export function removeUserData() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user_data")
  }
}

// Logout function
export function logout() {
  removeAuthToken()
  removeUserData()
  window.location.href = "/login"
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getAuthToken()
}

// Check if user has specific role
export function hasRole(role: User["role"]): boolean {
  const user = getUserData()
  return user?.role === role
}
