"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import type { HistorialItem } from "@/types/admin";

function displayValue(value: string | null) {
  if (!value) return "—";
  try { return JSON.stringify(JSON.parse(value)); } catch { return value; }
}

export default function HistorialList({ token }: { token: string }) {
  const [items, setItems] = useState<HistorialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setItems(await adminApi.getHistorial(token)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo cargar el historial."); }
    finally { setLoading(false); }
  }, [token]);
  useEffect(() => {
    let current = true;
    adminApi.getHistorial(token).then((data) => {
      if (current) setItems(data);
    }).catch((cause: unknown) => {
      if (current) setError(cause instanceof Error ? cause.message : "No se pudo cargar el historial.");
    }).finally(() => {
      if (current) setLoading(false);
    });
    return () => { current = false; };
  }, [token]);
  if (loading) return <p className="state-message" role="status">Cargando historial…</p>;
  if (error) return <div className="state-message error-state" role="alert"><p>{error}</p><button className="button button-secondary" onClick={() => void load()}>Reintentar</button></div>;
  if (!items.length) return <p className="empty-state">Todavía no hay cambios registrados.</p>;
  return <section className="history-list" aria-label="Cambios recientes">{items.map((item, index) => {
    const date = new Date(item.creado_en);
    const created = Number.isNaN(date.getTime()) ? "Fecha no disponible" : date.toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" });
    return <article className="history-item" key={item.id ?? `${item.creado_en}-${index}`}><span className="history-marker" aria-hidden="true" /><div className="history-content"><div className="history-top"><strong>{item.accion}</strong><time dateTime={item.creado_en}>{created}</time></div><p>Por <b>{item.usuario || "Usuario administrador"}</b></p><div className="history-diff"><span><b>Antes</b>{displayValue(item.antes)}</span><span><b>Después</b>{displayValue(item.despues)}</span></div></div></article>;
  })}</section>;
}
