// src/lib/api.ts
// Cliente HTTP ligero usando fetch, compatible con los helpers existentes (get/post).
// Base URL por defecto: http://localhost:8080/api (puedes sobrescribir con NEXT_PUBLIC_API_URL)

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://51.161.10.179:8080/api").replace(/\/+$/, "");
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO === "true";

/**
 * Construye el header Authorization si hay token en localStorage.
 * Si el entorno está en DEMO_MODE evitamos añadir Authorization.
 */
function getAuthHeader(): Record<string, string> {
  if (DEMO_MODE) return {};
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("authToken") || localStorage.getItem("token");
  if (token) {
    const hdr: Record<string, string> = { Authorization: `Bearer ${token}` };
    // Dev-only debug header: añade un prefijo del token para que el backend pueda
    // identificar si el token llegó en la petición (habilitar con NEXT_PUBLIC_DEBUG_AUTH=true).
    try {
      if (typeof process !== "undefined" && (process.env as any)?.NEXT_PUBLIC_DEBUG_AUTH === "true") {
        hdr["X-Debug-Auth"] = String(token).slice(0, 12);
      }
    } catch (e) {
      // ignore
    }
    return hdr;
  }
  return {};
}

/**
 * Fusiona múltiples HeadersInit en un objeto plano { key: value }.
 * Normaliza claves para evitar duplicados por capitalización.
 */
function mergeHeaders(...headersArr: (HeadersInit | undefined)[]): Record<string, string> {
  const result: Record<string, string> = {};
  headersArr.forEach((h) => {
    if (!h) return;
    if (h instanceof Headers) {
      h.forEach((value, key) => {
        if (value !== undefined && value !== null) result[key] = String(value);
      });
    } else if (Array.isArray(h)) {
      (h as Array<[string, string]>).forEach(([key, value]) => {
        if (value !== undefined && value !== null) result[key] = String(value);
      });
    } else if (typeof h === "object") {
      Object.entries(h as Record<string, any>).forEach(([key, value]) => {
        if (value !== undefined && value !== null) result[key] = String(value);
      });
    }
  });
  // Normalizar keys: asegurar 'Authorization' capitalizado correctamente si viene con otra case
  if (result['authorization'] && !result['Authorization']) {
    result['Authorization'] = result['authorization'];
    delete result['authorization'];
  }
  return result;
}

async function buildApiError(res: Response) {
  // Leer body como texto (no destructivo gracias a clone)
  let rawText = ""
  try {
    rawText = await res.clone().text()
  } catch (e) {
    rawText = "<no body>"
  }

  let payload: any = rawText
  try {
    payload = JSON.parse(rawText)
  } catch {
    // si no es JSON, mantenemos el texto
  }

  // Construir mensaje legible
  const serverMsg = payload && (payload.message || payload.msg || payload.error || payload.detail)
  const message = serverMsg || (typeof payload === "string" && payload.length > 0 ? payload : `HTTP ${res.status} ${res.statusText}`)

  // Log para depuración en entorno de desarrollo
  if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
    try {
      // Evitar logging excesivo para errores 4xx (client-side)
      if (res.status >= 500) {
        // eslint-disable-next-line no-console
        console.error("[api] Server error:", {
          url: res.url,
          status: res.status,
          statusText: res.statusText,
          payload
        })
      } else {
        // 4xx errors - usar warn o info
        // eslint-disable-next-line no-console
        console.warn(`[api] Client error ${res.status}: ${res.url}`, payload || rawText)
      }
    } catch (e) {
      // ignore logging errors
    }
  }

  const error: any = new Error(message)
  error.status = res.status
  error.payload = payload
  error.rawBody = rawText
  return error
}

async function parseResponse(res: Response) {
  const text = await res.text();
  if (!text || text.trim() === "") return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function buildUrl(path: string, params?: Record<string, any>) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = API_URL.replace(/\/+$/, "");
  const url = new URL(`${base}${p}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (Array.isArray(v)) {
        v.forEach((x) => url.searchParams.append(k, String(x)));
      } else {
        url.searchParams.set(k, String(v));
      }
    });
  }
  return url.toString();
}

function looksLikeRequestInit(obj: any): obj is RequestInit {
  if (!obj || typeof obj !== "object") return false;
  const requestInitKeys = ["method", "headers", "body", "signal", "credentials", "cache", "mode"];
  return requestInitKeys.some((k) => Object.prototype.hasOwnProperty.call(obj, k));
}

export const api = {
  /**
   * GET:
   * - api.get("/products", { page: 1, pageSize: 50 })  <-- params object
   * - api.get("/path", { headers: {...} })             <-- RequestInit
   */
  get: async <T = any>(path: string, optionsOrParams: any = {}) => {
    let options: RequestInit = {};
    let params: Record<string, any> | undefined = undefined;

    if (looksLikeRequestInit(optionsOrParams)) {
      options = optionsOrParams as RequestInit;
    } else {
      params = optionsOrParams;
    }

    const headersObj = mergeHeaders(options.headers, getAuthHeader());
    if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.debug("[api.get] URL:", buildUrl(path, params), "Headers:", headersObj);
    }
    const headers = new Headers(headersObj);

    const url = buildUrl(path, params);

    const res = await fetch(url, {
      ...options,
      method: "GET",
      credentials: "include",
      headers,
    });
    if (!res.ok) throw await buildApiError(res);
    return parseResponse(res) as Promise<T>;
  },

  /**
   * POST genérico: envía JSON o FormData según el body.
   * Si body es un objeto plano lo convierte a JSON y añade Content-Type.
   */
  post: async <T = any>(path: string, body?: any, options: RequestInit = {}) => {
    let headersObj: Record<string, string> = {};
    let realBody: BodyInit | undefined;

    if (body instanceof FormData) {
      headersObj = mergeHeaders(options.headers, getAuthHeader());
      realBody = body;
    } else if (body === undefined || body === null) {
      headersObj = mergeHeaders(options.headers, getAuthHeader());
      realBody = undefined;
    } else {
      headersObj = mergeHeaders({ "Content-Type": "application/json" }, options.headers, getAuthHeader());
      realBody = JSON.stringify(body);
    }

    if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.debug("[api.post] POST", `${API_URL.replace(/\/+$/, "")}${path.startsWith("/") ? path : `/${path}`}`, "Headers:", headersObj, "Body:", realBody);
    }

    const headers = new Headers(headersObj);

    const p = path.startsWith("/") ? path : `/${path}`;
    const url = `${API_URL.replace(/\/+$/, "")}${p}`;

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: realBody,
      credentials: "include",
      ...options,
    });
    if (!res.ok) throw await buildApiError(res);
    return parseResponse(res) as Promise<T>;
  },

  put: async <T = any>(path: string, body?: any, options: RequestInit = {}) => {
    let headersObj: Record<string, string> = {};
    let realBody: BodyInit | undefined;

    if (body instanceof FormData) {
      headersObj = mergeHeaders(options.headers, getAuthHeader());
      realBody = body;
    } else if (body === undefined || body === null) {
      headersObj = mergeHeaders(options.headers, getAuthHeader());
      realBody = undefined;
    } else {
      headersObj = mergeHeaders({ "Content-Type": "application/json" }, options.headers, getAuthHeader());
      realBody = JSON.stringify(body);
    }

    if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.debug("[api.put] PUT", path, "Headers:", headersObj, "Body:", realBody);
    }

    const headers = new Headers(headersObj);

    const p = path.startsWith("/") ? path : `/${path}`;
    const url = `${API_URL.replace(/\/+$/, "")}${p}`;

    const res = await fetch(url, {
      method: "PUT",
      headers,
      body: realBody,
      credentials: "include",
      ...options,
    });
    if (!res.ok) throw await buildApiError(res);
    return parseResponse(res) as Promise<T>;
  },

  delete: async <T = any>(path: string, options: RequestInit = {}) => {
    const headersObj = mergeHeaders(options.headers, getAuthHeader());
    if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.debug("[api.delete] DELETE", path, "Headers:", headersObj);
    }
    const headers = new Headers(headersObj);
    const p = path.startsWith("/") ? path : `/${path}`;
    const url = `${API_URL.replace(/\/+$/, "")}${p}`;
    const res = await fetch(url, {
      method: "DELETE",
      credentials: "include",
      headers,
      ...options,
    });
    if (!res.ok) throw await buildApiError(res);
    return parseResponse(res) as Promise<T>;
  },
};

/** Convenience wrappers (compatibles con el código existente) */
export async function get<T = any>(url: string, params?: Record<string, any>) {
  return api.get(url, params) as Promise<T>;
}

export async function post<T = any>(url: string, data?: any) {
  return api.post(url, data) as Promise<T>;
}

/** High-level helpers usados en la app */

/**
 * createOrder / createMostradorOrder mantienen el comportamiento previo.
 */
export async function createOrder(orderPayload: any) {
  return api.post("/orders", orderPayload);
}

export async function createMostradorOrder(orderPayload: any) {
  return api.post("/orders/mostrador", orderPayload);
}

/**
 * postProductionBatch:
 * - Por compatibilidad envía { items: [...], loteGlobalId?: string }
 * - items: Array<{ productoId:number; cantidad:number; loteId?:string }>
 */
export async function postProductionBatch(
  items: Array<{ productoId: number; cantidad: number; loteId?: string }>,
  loteGlobalId?: string
) {
  // Si el backend espera lista plana, puedes enviar items directamente; aquí usamos la forma { items }
  const payload: any = { items };
  if (loteGlobalId) payload.loteGlobalId = loteGlobalId;
  try {
    return await api.post("/inventario/lote-produccion", payload);
  } catch (err: any) {
    // Log para ayudar a diagnosticar problemas 403/compatibilidad
    // Si el backend no acepta el objeto { items } intentamos enviar el array plano
    // Esto es un reintento de compatibilidad y puede eliminarse cuando el backend sea consistente.
    // eslint-disable-next-line no-console
    console.warn("postProductionBatch: primary request failed, attempting fallback. Error:", err)
    if (err?.status === 403) {
      // Intentar enviar array plano como fallback
      try {
        // eslint-disable-next-line no-console
        console.info("postProductionBatch: retrying with array payload for compatibility")
        return await api.post("/inventario/lote-produccion", items)
      } catch (err2: any) {
        // eslint-disable-next-line no-console
        console.error("postProductionBatch: fallback also failed:", err2)
        throw err2
      }
    }
    throw err
  }
}

export { API_URL };
export default api;