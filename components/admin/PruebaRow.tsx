"use client";

import { useState } from "react";
import { Pencil, RotateCcw, Trash2 } from "lucide-react";
import EstadoSelector from "@/components/admin/EstadoSelector";
import type { EstadoPrueba, Prueba } from "@/types/admin";

function updatedTime(date: string) {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? "Hora no disponible" : `Actualizada ${parsed.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}`;
}

export default function PruebaRow({ prueba, busy, onStatus, onEdit, onHide, onRestore }: {
  prueba: Prueba; busy: boolean;
  onStatus: (estado: EstadoPrueba, nota?: string) => Promise<void>;
  onEdit: () => void; onHide: () => void; onRestore: () => void;
}) {
  const [nota, setNota] = useState(prueba.nota ?? "");
  const [savingNote, setSavingNote] = useState(false);
  const active = prueba.activo === true || prueba.activo === 1;
  const saveNote = async () => {
    if (prueba.estado === "DISPONIBLE" || nota === (prueba.nota ?? "") || savingNote) return;
    setSavingNote(true);
    try { await onStatus(prueba.estado, nota); } catch { /* the API error is surfaced by the parent toast */ } finally { setSavingNote(false); }
  };
  return (
    <article className="test-row">
      <div className="test-main">
        <div className="test-title-line"><strong>{prueba.nombre}</strong>{!prueba.indicaciones && <span className="missing-chip">Faltan indicaciones</span>}</div>
        <div className="test-details"><span className="fasting">{prueba.tiempo_ayunas?.trim() || "Ayuno no indicado"}</span><span>{updatedTime(prueba.actualizado_en)}</span></div>
      </div>
      <div className="test-controls">
        <EstadoSelector value={prueba.estado} disabled={busy || !active} onChange={(state) => void onStatus(state)} />
        {prueba.estado !== "DISPONIBLE" && active && <label className="note-label">Nota para el paciente
          <input value={nota} maxLength={255} onChange={(event) => setNota(event.target.value)} onBlur={() => void saveNote()} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); event.currentTarget.blur(); } }} placeholder="Ej. Reactivo en reposición" />
          <span className="sr-only">{savingNote ? "Guardando nota" : "La nota se guarda al salir del campo o pulsar Enter"}</span>
        </label>}
      </div>
      <div className="row-actions">
        {active ? <>
          <button type="button" className="icon-button" aria-label={`Editar ${prueba.nombre}`} onClick={onEdit}><Pencil size={17} aria-hidden="true" /></button>
          <button type="button" className="icon-button danger-action" aria-label={`Eliminar ${prueba.nombre}`} onClick={onHide}><Trash2 size={17} aria-hidden="true" /></button>
        </> : <button type="button" className="button button-quiet restore-button" onClick={onRestore}><RotateCcw size={16} aria-hidden="true" />Restaurar</button>}
      </div>
    </article>
  );
}
