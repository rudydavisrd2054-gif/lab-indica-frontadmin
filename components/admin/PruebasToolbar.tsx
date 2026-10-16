import { Plus, Search } from "lucide-react";
import type { Area, EstadoPrueba } from "@/types/admin";

export type VisibilityFilter = "activas" | "ocultas" | "todas";
export type StatusFilter = EstadoPrueba | "TODOS";

export default function PruebasToolbar(props: {
  search: string; onSearch: (value: string) => void;
  area: Area | "todas"; onArea: (value: Area | "todas") => void;
  status: StatusFilter; onStatus: (value: StatusFilter) => void;
  visibility: VisibilityFilter; onVisibility: (value: VisibilityFilter) => void;
  onCreate: () => void;
}) {
  return (
    <section className="toolbar" aria-label="Buscar y filtrar pruebas">
      <label className="search-box"><Search size={18} aria-hidden="true" /><span className="sr-only">Buscar prueba</span>
        <input type="search" placeholder="Buscar prueba…" value={props.search} onChange={(event) => props.onSearch(event.target.value)} />
      </label>
      <label className="filter-label">Área
        <select value={props.area} onChange={(event) => props.onArea(event.target.value as Area | "todas")}>
          <option value="todas">Todas</option><option value="bioquimica">Bioquímica</option><option value="inmunologia">Inmunología</option><option value="hematologia">Hematología</option><option value="microbiologia">Microbiología</option>
        </select>
      </label>
      <label className="filter-label">Estado
        <select value={props.status} onChange={(event) => props.onStatus(event.target.value as StatusFilter)}>
          <option value="TODOS">Todos</option><option value="DISPONIBLE">Disponible</option><option value="SIN_REACTIVO">Sin reactivo</option><option value="SUSPENDIDA">Suspendida</option>
        </select>
      </label>
      <label className="filter-label">Visibilidad
        <select value={props.visibility} onChange={(event) => props.onVisibility(event.target.value as VisibilityFilter)}>
          <option value="activas">Visibles</option><option value="ocultas">Ocultas</option><option value="todas">Todas</option>
        </select>
      </label>
      <button type="button" className="button button-primary new-test" onClick={props.onCreate}><Plus size={18} aria-hidden="true" />Nueva prueba</button>
    </section>
  );
}
