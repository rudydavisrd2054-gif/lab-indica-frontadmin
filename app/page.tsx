"use client";

import { useCallback, useEffect, useState } from "react";
import AdminWorkspace from "@/components/admin/AdminWorkspace";
import LoginForm from "@/components/admin/LoginForm";
import { ApiError, adminApi } from "@/lib/admin-api";
import { clearAdminToken, readAdminToken, saveAdminToken } from "@/lib/admin-session";
import type { Usuario } from "@/types/admin";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [checking, setChecking] = useState(true);
  const [loginMessage, setLoginMessage] = useState("");

  const expireSession = useCallback(() => {
    clearAdminToken();
    setToken(null);
    setUsuario(null);
    setLoginMessage("Tu sesión expiró");
    setChecking(false);
  }, []);

  useEffect(() => {
    window.addEventListener("admin:unauthorized", expireSession);
    const stored = readAdminToken();
    if (!stored) {
      queueMicrotask(() => setChecking(false));
      return () => window.removeEventListener("admin:unauthorized", expireSession);
    }
    void adminApi.me(stored).then((currentUser) => {
      setToken(stored);
      setUsuario(currentUser);
    }).catch((error: unknown) => {
      clearAdminToken();
      setLoginMessage(error instanceof ApiError && error.status === 401
        ? "Tu sesión expiró"
        : error instanceof Error ? `No se pudo validar la sesión: ${error.message}` : "No se pudo validar la sesión.");
    }).finally(() => setChecking(false));
    return () => window.removeEventListener("admin:unauthorized", expireSession);
  }, [expireSession]);

  async function login(username: string, password: string) {
    const response = await adminApi.login(username, password);
    saveAdminToken(response.token);
    setToken(response.token);
    setUsuario(response.usuario);
    setLoginMessage("");
    return response;
  }

  function logout() {
    clearAdminToken();
    setToken(null);
    setUsuario(null);
    setLoginMessage("");
  }

  if (checking) return <main className="loading-screen" role="status">Verificando sesión…</main>;
  if (token && usuario) return <AdminWorkspace usuario={usuario} token={token} onLogout={logout} />;
  return <LoginForm onLogin={login} initialMessage={loginMessage} />;
}
