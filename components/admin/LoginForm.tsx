"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { Eye, EyeOff, UserRound } from "lucide-react";
import callaoLogo from "@/public/logocallao.png";
import type { LoginResponse } from "@/types/admin";

type Props = {
  onLogin: (usuario: string, password: string) => Promise<LoginResponse>;
  initialMessage?: string;
};

export default function LoginForm({ onLogin, initialMessage = "" }: Props) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        <div className="login-mark">
          <Image src={callaoLogo} alt="Gobierno Regional del Callao" sizes="188px" preload />
        </div>
        <p className="eyebrow">Laboratorio Clínico Acapulco</p>
        <h1 id="login-title">Panel de administración</h1>
        <p className="muted">Inicia sesión para gestionar las pruebas y la información del establecimiento.</p>
        <form onSubmit={submit} className="login-form">
          <label htmlFor="usuario">Usuario</label>
          <div className="login-input-wrap">
            <UserRound className="login-input-icon" size={18} aria-hidden="true" />
            <input id="usuario" className="login-username" autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="Nombre de usuario o admin" value={usuario} onChange={(event) => setUsuario(event.target.value)} required />
          </div>
          <label htmlFor="password">Contraseña</label>
          <div className="login-input-wrap">
            <input id="password" className="login-password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Ingresa tu contraseña" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <button
              type="button"
              className="login-password-toggle"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-controls="password"
              title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
            </button>
          </div>
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
