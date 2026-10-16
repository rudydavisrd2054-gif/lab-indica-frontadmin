import { Clock3, History, TestTube2 } from "lucide-react";

export type AdminTab = "pruebas" | "horarios" | "historial";
const tabs: { id: AdminTab; label: string; Icon: typeof TestTube2 }[] = [
  { id: "pruebas", label: "Pruebas", Icon: TestTube2 },
  { id: "horarios", label: "Horarios y contacto", Icon: Clock3 },
  { id: "historial", label: "Historial", Icon: History },
];

export default function AdminTabs({ active, onChange }: { active: AdminTab; onChange: (tab: AdminTab) => void }) {
  return (
    <nav className="admin-tabs" aria-label="Secciones de administración">
      {tabs.map(({ id, label, Icon }) => (
        <button key={id} type="button" className={`admin-tab ${active === id ? "is-active" : ""}`} aria-current={active === id ? "page" : undefined} onClick={() => onChange(id)}>
          <Icon size={17} aria-hidden="true" />{label}
        </button>
      ))}
    </nav>
  );
}
