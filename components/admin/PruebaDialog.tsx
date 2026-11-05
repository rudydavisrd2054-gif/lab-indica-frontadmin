"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { Area, Prueba, PruebaInput } from "@/types/admin";

type Props = { open: boolean; prueba: Prueba | null; onClose: () => void; onSave: (input: PruebaInput, id?: Prueba["id"]) => Promise<void> };
type Fields = { nombre: string; area: Area; tiempo_ayunas: string; indicaciones: string; descripcion: string; cuando_hacerlo: string; interpretacion: string; tipo_muestra: string; preparacion: string; };
const empty: Fields = { nombre: "", area: "bioquimica", tiempo_ayunas: "", indicaciones: "", descripcion: "", cuando_hacerlo: "", interpretacion: "", tipo_muestra: "", preparacion: "", };

export default function PruebaDialog({ open, prueba, onClose, onSave }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [fields, setFields] = useState<Fields>(() => prueba ? {
    nombre: prueba.nombre, area: prueba.area,
    descripcion: prueba.descripcion ?? "",
    cuando_hacerlo: prueba.cuando_hacerlo ?? "",
    interpretacion: prueba.interpretacion ?? "",
    tipo_muestra: prueba.tipo_muestra ?? "",
    preparacion: prueba.preparacion ?? "",
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
    const order = prueba?.orden ?? 0;
    if (!fields.nombre.trim() || fields.nombre.trim().length > 100 || !Number.isInteger(order) || order < 0 || order > 999) {
      setError("Revisa el nombre (obligatorio, máximo 100 caracteres).");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onSave({ nombre: fields.nombre.trim(), area: fields.area, orden: order, tiempo_ayunas: fields.tiempo_ayunas, indicaciones: fields.indicaciones, descripcion: fields.descripcion.trim(), cuando_hacerlo: fields.cuando_hacerlo.trim(), interpretacion: fields.interpretacion.trim(), tipo_muestra: fields.tipo_muestra.trim(), preparacion: fields.preparacion.trim(),  activo: prueba?.activo === false || prueba?.activo === 0 ? 0 : 1 }, prueba?.id);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar la prueba.");
    } finally { setBusy(false); }
  }
  return (
    <dialog ref={dialog} className="admin-dialog edit-dialog" aria-labelledby="prueba-dialog-title" aria-describedby="prueba-dialog-description" onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}>
      <form onSubmit={submit} className="dialog-form" aria-busy={busy}>
        <div className="dialog-heading"><p className="eyebrow">{prueba ? "EDITAR PRUEBA" : "NUEVA PRUEBA"}</p><h2 id="prueba-dialog-title">{prueba ? "Editar prueba" : "Crear prueba"}</h2><p id="prueba-dialog-description" className="dialog-description">Completa los datos de la prueba de laboratorio.</p><button type="button" className="icon-button dialog-close" aria-label="Cerrar" onClick={onClose} disabled={busy}><X size={20} aria-hidden="true" /></button></div>
        <div className="prueba-form-body">
        <fieldset className="prueba-section"><legend>01 · Datos generales</legend>
        <label>Nombre de la prueba<input autoFocus value={fields.nombre} maxLength={100} onChange={(event) => change("nombre", event.target.value)} required placeholder="Nombre del examen" /></label>
        <div className="form-two-col">
          <label>Área<select value={fields.area} onChange={(event) => change("area", event.target.value as Area)}><option value="bioquimica">Bioquímica</option><option value="inmunologia">Inmunología</option><option value="hematologia">Hematología</option><option value="microbiologia">Microbiología</option></select></label>
          <label>Tipo de muestra<input value={fields.tipo_muestra} maxLength={2000} onChange={(event) => change("tipo_muestra", event.target.value)} placeholder="Ej. Suero, orina, sangre total" /></label>
        </div></fieldset>
        <fieldset className="prueba-section"><legend>02 · Información para el paciente</legend>
        <p className="section-help">Usa un lenguaje claro y fácil de entender. Los campos de información son opcionales.</p>
        {([
          ["descripcion", "¿Qué es?", "Describe en qué consiste la prueba y qué evalúa."],
          ["cuando_hacerlo", "¿Cuándo hacerlo?", "Explica en qué situaciones se solicita el examen."],
          ["interpretacion", "¿Cómo interpretar los resultados?", "Explica el significado general y cuándo consultar al profesional."],
        ] as const).map(([key, title, placeholder]) => <label key={key}><span className="field-caption">{title}<span className="limit-label">{fields[key].length}/2000</span></span><textarea value={fields[key]} maxLength={2000} rows={3} placeholder={placeholder} onChange={(event) => change(key, event.target.value)} /></label>)}
        </fieldset>
        <fieldset className="prueba-section"><legend>03 · Preparación y toma de muestra</legend>
        <label>Tiempo de ayuno<input value={fields.tiempo_ayunas} maxLength={20} onChange={(event) => change("tiempo_ayunas", event.target.value)} placeholder="Ej. 8 horas o No requiere" /></label>
        {([
          ["preparacion", "Preparación para el examen", "Describe los pasos que debe seguir el paciente antes del examen."],
          ["indicaciones", "Condiciones preanalíticas", "Detalla las condiciones de recolección, conservación y transporte de la muestra."],
        ] as const).map(([key, title, placeholder]) => <label key={key}><span className="field-caption">{title}<span className="limit-label">{fields[key].length}/2000</span></span><textarea value={fields[key]} maxLength={2000} rows={3} placeholder={placeholder} onChange={(event) => change(key, event.target.value)} /></label>)}
        </fieldset>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="dialog-actions"><button type="button" className="button button-secondary" onClick={onClose} disabled={busy}>Cancelar</button><button type="submit" className="button button-primary" disabled={busy}>{busy ? "Guardando…" : "Guardar prueba"}</button></div>
      </form>
    </dialog>
  );
}
