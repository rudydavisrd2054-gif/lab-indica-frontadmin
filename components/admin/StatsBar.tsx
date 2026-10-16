import type { Prueba } from "@/types/admin";

const isActive = (item: Prueba) => item.activo === true || item.activo === 1;

export default function StatsBar({ pruebas }: { pruebas: Prueba[] }) {
  const visible = pruebas.filter(isActive);
  const stats = [
    ["Pruebas visibles", visible.length, "stat-blue"],
    ["Disponibles", visible.filter((item) => item.estado === "DISPONIBLE").length, "stat-green"],
    ["Sin reactivo", visible.filter((item) => item.estado === "SIN_REACTIVO").length, "stat-amber"],
    ["Suspendidas", visible.filter((item) => item.estado === "SUSPENDIDA").length, "stat-slate"],
    ["Ocultas", pruebas.length - visible.length, "stat-muted"],
  ];
  return (
    <section className="stats-grid" aria-label="Resumen de pruebas">
      {stats.map(([label, value, color]) => (
        <article className={`stat-card ${color}`} key={label as string}>
          <span>{label}</span><strong>{value}</strong>
        </article>
      ))}
    </section>
  );
}
