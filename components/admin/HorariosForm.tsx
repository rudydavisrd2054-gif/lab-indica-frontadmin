"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ApiError, adminApi } from "@/lib/admin-api";
import type { Configuracion } from "@/types/admin";

const blank: Configuracion = {
  toma_inicio: "07:30", toma_fin: "08:40", atencion_inicio: "07:30", atencion_fin: "19:00",
  nombre: "", telefono: "", direccion: "",
};
const fields: { key: keyof Configuracion; label: string; type?: string }[] = [
  { key: "toma_inicio", label: "Toma de muestras · desde", type: "time" },
  { key: "toma_fin", label: "Toma de muestras · hasta", type: "time" },
  { key: "atencion_inicio", label: "Atención · desde", type: "time" },
  { key: "atencion_fin", label: "Atención · hasta", type: "time" },
  { key: "nombre", label: "Nombre del establecimiento" },
  { key: "telefono", label: "Teléfono", type: "tel" },
  { key: "direccion", label: "Dirección" },
];

export default function HorariosForm({ token }: { token: string }) {
  const [config, setConfig] = useState(blank);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    setLoading(true); setError(""); setMissing(false);
    try { setConfig({ ...blank, ...await adminApi.getConfiguracion() }); }
    catch (cause) {
      if (cause instanceof ApiError && cause.status === 404) setMissing(true);
      else setError(cause instanceof Error ? cause.message : "No se pudo cargar la configuración.");
    } finally { setLoading(false); }
  }, []);
  useEffect(() => {
    let current = true;
    adminApi.getConfiguracion().then((data) => {
      if (current) setConfig({ ...blank, ...data });
    }).catch((cause: unknown) => {
      if (!current) return;
      if (cause instanceof ApiError && cause.status === 404) setMissing(true);
      else setError(cause instanceof Error ? cause.message : "No se pudo cargar la configuración.");
    }).finally(() => {
      if (current) setLoading(false);
    });
    return () => { current = false; };
  }, []);
  function setValue(key: keyof Configuracion, value: string) {
    setConfig((current) => ({ ...current, [key]: value }));
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    const phoneDigits = config.telefono.replace(/\D/g, "").length;
    if (config.atencion_inicio >= config.atencion_fin || config.toma_inicio >= config.toma_fin) {
      setError("La hora de inicio debe ser anterior a la hora de fin.");
    } else if (config.toma_inicio < config.atencion_inicio || config.toma_fin > config.atencion_fin) {
      setError("La toma de muestras debe quedar dentro del horario de atención.");
    } else if (phoneDigits < 7) setError("El teléfono debe contener al menos 7 dígitos.");
    else {
      setBusy(true);
      try { await adminApi.saveConfiguracion(token, config); setSuccess("Horarios y contacto actualizados."); }
      catch (cause) {
        if (cause instanceof ApiError && cause.status === 404) setMissing(true);
        else setError(cause instanceof Error ? cause.message : "No se pudo guardar la configuración.");
      } finally { setBusy(false); }
    }
  }
  const start = Number(config.toma_inicio.slice(0, 2)) * 60 + Number(config.toma_inicio.slice(3, 5));
  const end = Number(config.toma_fin.slice(0, 2)) * 60 + Number(config.toma_fin.slice(3, 5));
  const duration = Math.max(0, end - start);
  const width = Math.min(100, (duration / 720) * 100);
  if (loading) return <p className="state-message" role="status">Cargando horarios y contacto…</p>;
  if (missing) return <p className="notice" role="status">Esta sección se activará cuando el servidor tenga la configuración de horarios</p>;
  if (error && !config.nombre && !config.telefono && !config.direccion) return <div className="state-message error-state" role="alert"><p>{error}</p><button className="button button-secondary" onClick={() => void load()}>Reintentar</button></div>;
  return (
    <section className="config-layout">
      <form className="config-card" onSubmit={submit}>
        <div className="section-title"><p className="eyebrow">INFORMACIÓN PÚBLICA</p><h2>Horarios y contacto</h2></div>
        <div className="config-fields">{fields.map(({ key, label, type }) => <label key={key}>{label}<input type={type ?? "text"} value={config[key]} onChange={(event) => setValue(key, event.target.value)} required maxLength={key === "telefono" ? 50 : undefined} /></label>)}</div>
        {error && <p className="form-error" role="alert">{error}</p>}
        {success && <p className="success-message" role="status">{success}</p>}
        <button className="button button-primary" type="submit" disabled={busy}>{busy ? "Guardando…" : "Guardar cambios"}</button>
      </form>
      <aside className="preview-card" aria-label="Vista previa de la información para pacientes">
        <p className="eyebrow">VISTA PREVIA</p><h2>Así lo verá el paciente</h2>
        <div className="patient-preview"><strong>{config.nombre || "Nombre del establecimiento"}</strong><span>{config.direccion || "Dirección del laboratorio"}</span><span>{config.telefono || "Teléfono"}</span>
          <div className="preview-hours"><b>Toma de muestras</b><span className="font-mono">{config.toma_inicio} – {config.toma_fin}</span><div className="hours-track"><span style={{ width: `${width}%`, marginLeft: `${Math.min(100 - width, (start / 1440) * 100)}%` }} /></div><small>Atención {config.atencion_inicio} – {config.atencion_fin}</small></div>
        </div>
      </aside>
    </section>
  );
}
