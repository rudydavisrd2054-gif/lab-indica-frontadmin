"use client";

import { useState, type FormEvent } from "react";
import { LockKeyhole } from "lucide-react";
import type { LoginResponse } from "@/types/admin";

type Props = {
  onLogin: (usuario: string, password: string) => Promise<LoginResponse>;
  initialMessage?: string;
};

export default function LoginForm({ onLogin, initialMessage = "" }: Props) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(initialMessage);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await onLogin(usuario.trim(), password);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo iniciar sesión.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-mark"><LockKeyhole size={23} aria-hidden="true" /></div>
        <p className="eyebrow">LABORATORIO CLÍNICO</p>
        <h1 id="login-title">Panel de administración</h1>
        <p className="muted">Inicia sesión para gestionar las pruebas y la información del establecimiento.</p>
        <form onSubmit={submit} className="login-form">
          <label htmlFor="usuario">Usuario</label>
          <input id="usuario" autoComplete="username" value={usuario} onChange={(event) => setUsuario(event.target.value)} required />
          <label htmlFor="password">Contraseña</label>
          <input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {message && <p className="form-error" role="alert">{message}</p>}
          <button className="button button-primary login-submit" type="submit" disabled={busy}>
            {busy ? "Ingresando…" : "Ingresar"}
          </button>
          <p className="login-rate-note">Máximo 10 intentos cada 15 minutos.</p>
        </form>
      </section>
    </main>
  );
}
