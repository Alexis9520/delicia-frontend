const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

function getAuthHeader(): Record<string, string> {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  }
  return {};
}

function mergeHeaders(...headersArr: (HeadersInit | undefined)[]): Record<string, string> {
  const result: Record<string, string> = {};
  headersArr.forEach((h) => {
    if (!h) return;
    if (h instanceof Headers) {
      h.forEach((value, key) => {
        result[key] = value;
      });
    } else if (Array.isArray(h)) {
      h.forEach(([key, value]) => {
        result[key] = value;
      });
    } else if (typeof h === "object") {
      Object.entries(h).forEach(([key, value]) => {
        result[key] = String(value);
      });
    }
  });
  return result;
}

export const api = {
  get: async (path: string, options: RequestInit = {}) => {
    const headers = mergeHeaders(options.headers, getAuthHeader());
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
      headers,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  post: async (path: string, body: any, options: RequestInit = {}) => {
    let headers: Record<string, string> = {};
    let realBody: BodyInit;

    if (body instanceof FormData) {
      // No setees Content-Type (el navegador lo pone)
      headers = mergeHeaders(options.headers, getAuthHeader());
      realBody = body;
    } else {
      headers = mergeHeaders(
        { "Content-Type": "application/json" },
        options.headers,
        getAuthHeader()
      );
      realBody = JSON.stringify(body);
    }

    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers,
      body: realBody,
      credentials: "include",
      ...options,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  put: async (path: string, body: any, options: RequestInit = {}) => {
    let headers: Record<string, string> = {};
    let realBody: BodyInit;

    if (body instanceof FormData) {
      headers = mergeHeaders(options.headers, getAuthHeader());
      realBody = body;
    } else {
      headers = mergeHeaders(
        { "Content-Type": "application/json" },
        options.headers,
        getAuthHeader()
      );
      realBody = JSON.stringify(body);
    }

    const res = await fetch(`${API_URL}${path}`, {
      method: "PUT",
      headers,
      body: realBody,
      credentials: "include",
      ...options,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  delete: async (path: string, options: RequestInit = {}) => {
    const headers = mergeHeaders(options.headers, getAuthHeader());
    const res = await fetch(`${API_URL}${path}`, {
      method: "DELETE",
      credentials: "include",
      headers,
      ...options,
    });
    if (!res.ok) throw new Error(await res.text());
    try {
      return await res.json();
    } catch {
      return null;
    }
  },
};
export { API_URL };