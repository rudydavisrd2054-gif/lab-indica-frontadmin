"use client";

import { useMemo, useState } from "react";
import { Beaker, Droplets, Microscope, ScanSearch } from "lucide-react";
import PruebaRow from "@/components/admin/PruebaRow";
import PruebaDialog from "@/components/admin/PruebaDialog";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import PruebasToolbar from "@/components/admin/PruebasToolbar";
import type { Area, EstadoPrueba, Prueba, PruebaInput } from "@/types/admin";
import type { StatusFilter, VisibilityFilter } from "@/components/admin/PruebasToolbar";

const areas: { id: Area; name: string; icon: typeof Beaker; key: string }[] = [
  { id: "bioquimica", name: "Bioquímica", icon: Beaker, key: "1" },
  { id: "inmunologia", name: "Inmunología", icon: ScanSearch, key: "2" },
  { id: "hematologia", name: "Hematología", icon: Droplets, key: "3" },
  { id: "microbiologia", name: "Microbiología", icon: Microscope, key: "4" },
];

export default function PruebasList({ pruebas, loading, error, onRetry, onStatus, onSave, onVisibility }: {
  pruebas: Prueba[]; loading: boolean; error: string; onRetry: () => void;
  onStatus: (id: Prueba["id"], state: EstadoPrueba, note?: string) => Promise<void>;
  onSave: (input: PruebaInput, id?: Prueba["id"]) => Promise<void>;
  onVisibility: (prueba: Prueba, active: 0 | 1) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<Area | "todas">("todas");
  const [status, setStatus] = useState<StatusFilter>("TODOS");
  const [visibility, setVisibility] = useState<VisibilityFilter>("activas");
  const [editing, setEditing] = useState<Prueba | null | undefined>(undefined);
  const [hiding, setHiding] = useState<Prueba | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [busyId, setBusyId] = useState<Prueba["id"] | null>(null);
  const filtered = useMemo(() => pruebas.filter((item) => {
    const active = item.activo === true || item.activo === 1;
    return (visibility === "todas" || (visibility === "activas" ? active : !active))
      && (area === "todas" || item.area === area)
      && (status === "TODOS" || item.estado === status)
      && item.nombre.toLocaleLowerCase("es").includes(query.toLocaleLowerCase("es"));
  }), [area, pruebas, query, status, visibility]);

  async function runRowAction(id: Prueba["id"], action: () => Promise<void>) {
    setBusyId(id);
    try { await action(); } catch { /* the hook has already surfaced the API error */ } finally { setBusyId(null); }
  }

  if (loading) return <p className="state-message" role="status">Cargando pruebas…</p>;
  if (error) return <div className="state-message error-state" role="alert"><p>{error}</p><button className="button button-secondary" onClick={onRetry}>Reintentar</button></div>;
  return (
    <>
      <PruebasToolbar search={query} onSearch={setQuery} area={area} onArea={setArea} status={status} onStatus={setStatus} visibility={visibility} onVisibility={setVisibility} onCreate={() => setCreateOpen(true)} />
      <section className="area-list" aria-label="Pruebas agrupadas por área">
        {areas.filter((item) => area === "todas" || area === item.id).map(({ id, name, icon: Icon, key }) => {
          const entries = filtered.filter((item) => item.area === id).sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, "es"));
          if (!entries.length) return null;
          return <article key={id} data-area={key} className="area-card">
            <header className="area-heading"><span className="area-icon"><Icon size={21} aria-hidden="true" /></span><h2>{name}</h2><span className="area-count">{String(entries.length).padStart(2, "0")} pruebas</span></header>
            <div className="area-rows">{entries.map((prueba) => <PruebaRow key={prueba.id} prueba={prueba} busy={busyId === prueba.id} onStatus={(state, note) => runRowAction(prueba.id, () => onStatus(prueba.id, state, note))} onEdit={() => setEditing(prueba)} onHide={() => setHiding(prueba)} onRestore={() => void runRowAction(prueba.id, () => onVisibility(prueba, 1))} />)}</div>
          </article>;
        })}
      </section>
      {!filtered.length && <p className="empty-state">No hay pruebas que coincidan con estos filtros.</p>}
      {(editing !== undefined || createOpen) && <PruebaDialog key={editing?.id ?? "new"} open prueba={editing ?? null} onClose={() => { setEditing(undefined); setCreateOpen(false); }} onSave={onSave} />}
      <ConfirmDialog open={Boolean(hiding)} title="¿Ocultar esta prueba a los pacientes?" message={`“${hiding?.nombre ?? ""}” dejará de aparecer al público. Se conservará en “Ocultas” con su historial y podrás restaurarla.`} onCancel={() => setHiding(null)} onConfirm={async () => {
        if (hiding) { await runRowAction(hiding.id, async () => { await onVisibility(hiding, 0); setHiding(null); }); }
      }} />
    </>
  );
}
