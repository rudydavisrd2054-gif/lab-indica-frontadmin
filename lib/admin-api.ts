import type {
  Configuracion,
  EstadoPrueba,
  HistorialItem,
  LoginResponse,
  Prueba,
  PruebaInput,
  Usuario,
} from "@/types/admin";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });
  const raw = await response.text();
  let payload: unknown;
  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      if (response.ok) {
        throw new ApiError("El servidor devolvió una respuesta no válida.", response.status);
      }
    }
  }

  if (response.status === 401 && token && typeof window !== "undefined") {
    window.dispatchEvent(new Event("admin:unauthorized"));
  }
  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : `Error del servidor (${response.status}).`;
    throw new ApiError(message, response.status);
  }
  return payload as T;
}

export const adminApi = {
  login(usuario: string, password: string) {
    return request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ usuario, password }),
    });
  },
  me(token: string) {
    return request<Usuario>("/api/auth/me", {}, token);
  },
  getPruebas(token: string) {
    return request<Prueba[]>("/api/admin/pruebas", {}, token);
  },
  setEstado(
    token: string,
    id: Prueba["id"],
    estado: EstadoPrueba,
    nota?: string,
  ) {
    return request<Prueba>(`/api/admin/pruebas/${id}/estado`, {
      method: "PATCH",
      body: JSON.stringify({ estado, ...(nota === undefined ? {} : { nota }) }),
    }, token);
  },
  savePrueba(token: string, input: PruebaInput, id?: Prueba["id"]) {
    return request<Prueba>(id === undefined ? "/api/admin/pruebas" : `/api/admin/pruebas/${id}`, {
      method: id === undefined ? "POST" : "PUT",
      body: JSON.stringify(input),
    }, token);
  },
  getHistorial(token: string) {
    return request<HistorialItem[]>("/api/admin/historial", {}, token);
  },
  getConfiguracion() {
    return request<Configuracion>("/api/configuracion");
  },
  saveConfiguracion(token: string, config: Configuracion) {
    return request<Configuracion>("/api/admin/configuracion", {
      method: "PUT",
      body: JSON.stringify(config),
    }, token);
  },
};
