"use client";

import { useCallback, useRef, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminTabs, { type AdminTab } from "@/components/admin/AdminTabs";
import StatsBar from "@/components/admin/StatsBar";
import PruebasList from "@/components/admin/PruebasList";
import HorariosForm from "@/components/admin/HorariosForm";
import HistorialList from "@/components/admin/HistorialList";
import Toast from "@/components/admin/Toast";
import { useAdminPruebas } from "@/hooks/useAdminPruebas";
import type { ToastMessage, Usuario } from "@/types/admin";

export default function AdminWorkspace({ usuario, token, onLogout }: { usuario: Usuario; token: string; onLogout: () => void }) {
  const [tab, setTab] = useState<AdminTab>("pruebas");
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastId = useRef(0);
  const notify = useCallback((message: Omit<ToastMessage, "id">) => {
    toastId.current += 1;
    setToast({ ...message, id: toastId.current });
  }, []);
  const dismiss = useCallback(() => setToast(null), []);
  const data = useAdminPruebas(token, notify);
  return (
    <div className="admin-shell">
      <AdminHeader usuario={usuario} onLogout={onLogout} />
      <main className="admin-main">
        <div className="page-intro"><div><p className="eyebrow">GESTIÓN DEL LABORATORIO</p><h1>Panel de administración</h1><p className="muted">Administra las pruebas y la información que ve el paciente.</p></div></div>
        <AdminTabs active={tab} onChange={setTab} />
        {tab === "pruebas" && <>
          <StatsBar pruebas={data.pruebas} />
          <PruebasList pruebas={data.pruebas} loading={data.loading} error={data.error} onRetry={() => void data.load()} onStatus={data.updateStatus} onSave={data.save} onVisibility={data.setActive} />
        </>}
        {tab === "horarios" && <HorariosForm token={token} />}
        {tab === "historial" && <HistorialList token={token} />}
      </main>
      <footer className="admin-footer">Centro de Salud Acapulco <span>·</span> Administración</footer>
      {toast && <Toast message={toast} onDismiss={dismiss} />}
    </div>
  );
}
