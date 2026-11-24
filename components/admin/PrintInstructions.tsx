"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { ApiError, adminApi } from "@/lib/admin-api";
import type { Area, Configuracion, Prueba } from "@/types/admin";
import { areaNames, PaperSelect, type PaperSize } from "./InstructionsDocument";
import InstructionsPreview from "./InstructionsPreview";

const publishedLabConfig: Configuracion = {
  toma_inicio: "07:30",
  toma_fin: "08:40",
  atencion_inicio: "07:30",
  atencion_fin: "19:00",
  nombre: "Centro de Salud Acapulco",
  telefono: "924 465 543",
  direccion: "Callao - Callao",
};

function searchText(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("es");
}

export default function PrintInstructions({ pruebas, loading, error, onRetry }: {
  pruebas: Prueba[];
  loading: boolean;
  error: string;
  onRetry: () => void;
}) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<Area | "todas">("todas");
  const [selected, setSelected] = useState(new Set<string>());
  const [paper, setPaper] = useState<PaperSize>("A4");
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [opening, setOpening] = useState(false);
  const [configError, setConfigError] = useState("");

  const available = Array.from(new Map(pruebas
    .filter((item) => (item.activo === true || item.activo === 1) && item.estado === "DISPONIBLE")
    .map((item) => [String(item.id), item])).values());
  const groups = (Object.keys(areaNames) as Area[]).map((id) => ({
    id,
    exams: available.filter((item) => item.area === id)
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base", numeric: true })),
  }));
  const chosen = groups.flatMap(({ exams }) => exams.filter((item) => selected.has(String(item.id))));
  const term = searchText(query.trim());
  const shown = groups
    .filter(({ id }) => area === "todas" || area === id)
    .map((group) => ({ ...group, matches: group.exams.filter((item) => searchText(item.nombre).includes(term)) }))
    .filter(({ matches }) => matches.length);

  function toggle(exams: Prueba[], checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      for (const { id } of exams) {
        if (checked) next.add(String(id));
        else next.delete(String(id));
      }
      return next;
    });
  }

  async function openPreview() {
    setOpening(true);
    setConfigError("");
    try {
      setConfig(await adminApi.getConfiguracion());
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 404) {
        setConfig(publishedLabConfig);
        return;
      }
      setConfigError("No se pudo cargar la configuración de horarios y contacto. Vuelve a intentar abrir la vista previa.");
    } finally {
      setOpening(false);
    }
  }

  return (
    <section aria-labelledby="instructions-title">
      <div className="section-title">
        <h2 id="instructions-title">Impresión de indicaciones</h2>
        <p className="muted">Selecciona uno o varios exámenes para entregar sus indicaciones al paciente</p>
      </div>
      <div className="toolbar instructions-toolbar">
        <label className="filter-label instructions-search">
          Buscar por nombre
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <label className="filter-label">
          Área de laboratorio
          <select value={area} onChange={(event) => setArea(event.target.value as Area | "todas")}>
            <option value="todas">Todas las áreas</option>
            {groups.map(({ id }) => <option key={id} value={id}>{areaNames[id]}</option>)}
          </select>
        </label>
        <PaperSelect paper={paper} onChange={setPaper} />
      </div>
      <div className="instructions-selection">
        <span role="status">{chosen.length} {chosen.length === 1 ? "examen seleccionado" : "exámenes seleccionados"}</span>
        <button type="button" className="button button-secondary" disabled={!selected.size} onClick={() => setSelected(new Set())}>Limpiar selección</button>
        <button type="button" className="button button-primary" disabled={!chosen.length || opening || loading || Boolean(error)} onClick={() => void openPreview()}>
          <Eye size={17} aria-hidden="true" />{opening ? "Cargando…" : "Vista previa"}
        </button>
      </div>
      {configError && <p className="form-error" role="alert">{configError}</p>}
      {loading ? <p className="state-message" role="status">Cargando pruebas…</p> : error ? (
        <div className="state-message error-state" role="alert">
          <p>{error}</p><button type="button" className="button button-secondary" onClick={onRetry}>Reintentar</button>
        </div>
      ) : shown.length ? (
        <div className="area-list">
          {shown.map(({ id, exams, matches }) => {
            const allSelected = exams.every((item) => selected.has(String(item.id)));
            return (
              <section className="area-card" key={id} aria-label={areaNames[id]}>
                <header className="area-heading instructions-area-heading">
                  <h3>{areaNames[id]}</h3>
                  <button type="button" className="button button-secondary" onClick={() => toggle(exams, !allSelected)}>
                    {allSelected ? "Deseleccionar toda el área" : "Seleccionar toda el área"}
                  </button>
                </header>
                <div className="instructions-exam-options">
                  {matches.map((exam) => (
                    <label key={exam.id}>
                      <input type="checkbox" checked={selected.has(String(exam.id))} onChange={(event) => toggle([exam], event.target.checked)} />
                      <span>{exam.nombre}</span>
                    </label>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : <p className="empty-state">No hay pruebas disponibles que coincidan con estos filtros.</p>}
      {config && chosen.length > 0 && <InstructionsPreview pruebas={chosen} config={config} paper={paper} onPaperChange={setPaper} onClose={() => setConfig(null)} />}
    </section>
  );
}
