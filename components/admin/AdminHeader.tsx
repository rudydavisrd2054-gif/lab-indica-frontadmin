"use client";

import Image from "next/image";
import { LogOut } from "lucide-react";
import type { Usuario } from "@/types/admin";

export default function AdminHeader({ usuario, onLogout }: { usuario: Usuario; onLogout: () => void }) {
  return (
    <header className="admin-header">
      <div className="header-inner">
        <div className="brand-lockup">
          <Image src="/logocallao.png" alt="Gobierno Regional del Callao" width={110} height={60} priority />
          <div><strong>Centro de Salud Acapulco</strong><span>Administración del laboratorio</span></div>
        </div>
        <div className="header-user">
          <span className="user-name">{usuario.nombre}</span>
          <button type="button" className="button button-quiet" onClick={onLogout}>
            <LogOut size={17} aria-hidden="true" /><span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
}
