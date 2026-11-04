"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { Area, Prueba, PruebaInput } from "@/types/admin";

type Props = { open: boolean; prueba: Prueba | null; onClose: () => void; onSave: (input: PruebaInput, id?: Prueba["id"]) => Promise<void> };
type Fields = { nombre: string; area: Area; orden: string; tiempo_ayunas: string; indicaciones: string };
const empty: Fields = { nombre: "", area: "bioquimica", orden: "0", tiempo_ayunas: "", indicaciones: "" };

export default function PruebaDialog({ open, prueba, onClose, onSave }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [fields, setFields] = useState<Fields>(() => prueba ? {
    nombre: prueba.nombre, area: prueba.area, orden: String(prueba.orden),
    tiempo_ayunas: prueba.tiempo_ayunas ?? "", indicaciones: prueba.indicaciones ?? "",
  } : empty);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const element = dialog.current;
    if (open && element && !element.open) element.showModal();
    if (!open && element?.open) element.close();
  }, [open]);
  function change<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((current) => ({ ...current, [key]: value }));
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const order = Number(fields.orden);
    if (!fields.nombre.trim() || fields.nombre.trim().length > 100 || !Number.isInteger(order) || order < 0 || order > 999) {
      setError("Revisa el nombre (obligatorio, máximo 100 caracteres) y el orden (0–999).");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onSave({ nombre: fields.nombre.trim(), area: fields.area, orden: order, tiempo_ayunas: fields.tiempo_ayunas, indicaciones: fields.indicaciones, activo: prueba?.activo === false || prueba?.activo === 0 ? 0 : 1 }, prueba?.id);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar la prueba.");
    } finally { setBusy(false); }
  }
  return (
    <dialog ref={dialog} className="admin-dialog edit-dialog" aria-labelledby="prueba-dialog-title" aria-describedby="prueba-dialog-description" onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}>
      <form onSubmit={submit} className="dialog-form" aria-busy={busy}>
        <div className="dialog-heading"><p className="eyebrow">{prueba ? "EDITAR PRUEBA" : "NUEVA PRUEBA"}</p><h2 id="prueba-dialog-title">{prueba ? "Editar prueba" : "Crear prueba"}</h2><p id="prueba-dialog-description" className="dialog-description">Completa los datos de la prueba de laboratorio.</p><button type="button" className="icon-button dialog-close" aria-label="Cerrar" onClick={onClose} disabled={busy}><X size={20} aria-hidden="true" /></button></div>
        <label><span className="field-caption">Nombre <span className="limit-label">máx. 100</span></span><input autoFocus value={fields.nombre} maxLength={100} onChange={(event) => change("nombre", event.target.value)} required /></label>
        <div className="form-two-col">
          <label>Área<select value={fields.area} onChange={(event) => change("area", event.target.value as Area)}><option value="bioquimica">Bioquímica</option><option value="inmunologia">Inmunología</option><option value="hematologia">Hematología</option><option value="microbiologia">Microbiología</option></select></label>
          <label>Orden<input type="number" min={0} max={999} step={1} value={fields.orden} onChange={(event) => change("orden", event.target.value)} required /></label>
        </div>
        <label><span className="field-caption">Tiempo de ayuno <span className="limit-label">opcional - máx. 20</span></span><input value={fields.tiempo_ayunas} maxLength={20} onChange={(event) => change("tiempo_ayunas", event.target.value)} placeholder="Ej. 8 horas" /></label>
        <label><span className="field-caption">Indicaciones <span className="limit-label">opcional - {fields.indicaciones.length}/2000</span></span><textarea value={fields.indicaciones} maxLength={2000} rows={3} onChange={(event) => change("indicaciones", event.target.value)} /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="dialog-actions"><button type="button" className="button button-secondary" onClick={onClose} disabled={busy}>Cancelar</button><button type="submit" className="button button-primary" disabled={busy}>{busy ? "Guardando…" : "Guardar prueba"}</button></div>
      </form>
    </dialog>
  );
}
