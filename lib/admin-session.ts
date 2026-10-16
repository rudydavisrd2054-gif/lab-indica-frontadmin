const TOKEN_KEY = "lab-indica-admin-token";

export function readAdminToken(): string | null {
  try {
    return window.sessionStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error("No se pudo leer la sesión de administración.", error);
    return null;
  }
}

export function saveAdminToken(token: string): void {
  try {
    window.sessionStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error("No se pudo guardar la sesión de administración.", error);
    throw new Error("Este navegador no permite guardar la sesión.");
  }
}

export function clearAdminToken(): void {
  try {
    window.sessionStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error("No se pudo borrar la sesión de administración.", error);
  }
}
