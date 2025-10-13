import { jwtDecode } from "jwt-decode";

export type AuthResponse = {
  token: string;
};
export type UserData = {
  email: string;
  name?: string;
  role?: string;
  [key: string]: any;
};

export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("authToken", token);
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
}

export function decodeUserFromToken(token: string): UserData | null {
  try {
    return jwtDecode<UserData>(token);
  } catch {
    return null;
  }
}

export function setUserData(user: UserData) {
  if (typeof window !== "undefined") {
    localStorage.setItem("userData", JSON.stringify(user));
  }
}

export function getUserData(): UserData | null {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("userData");
    return user ? JSON.parse(user) : null;
  }
  return null;
}

export function isAuthenticated(): boolean {
  const token = getAuthToken();
  return !!token;
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
  }
}

// NUEVO: Obtiene el rol actual del usuario desde el JWT
export function getCurrentUserRole(): string | null {
  const token = getAuthToken();
  if (!token) return null;
  const user = decodeUserFromToken(token);
  return user?.role ?? null; // Puede ser "ROLE_ADMIN", "ROLE_CLIENTE", etc.
}

// NUEVO: Helpers para usar en rutas protegidas o componentes
export function isAdmin(): boolean {
  return getCurrentUserRole() === "ROLE_ADMIN";
}
export function isTrabajador(): boolean {
  return getCurrentUserRole() === "ROLE_TRABAJADOR";
}
export function isCliente(): boolean {
  return getCurrentUserRole() === "ROLE_CLIENTE";
}