import type { EstadoPrueba } from "@/types/admin";

const options: { value: EstadoPrueba; label: string }[] = [
  { value: "DISPONIBLE", label: "Disponible" },
  { value: "SIN_REACTIVO", label: "Sin reactivo" },
  { value: "SUSPENDIDA", label: "Suspendida" },
];

export default function EstadoSelector({ value, disabled, onChange }: { value: EstadoPrueba; disabled: boolean; onChange: (value: EstadoPrueba) => void }) {
  function moveSelection(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    const next = (index + direction + options.length) % options.length;
    const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    buttons?.[next]?.focus();
    onChange(options[next].value);
  }
  return (
    <div className="state-options" role="radiogroup" aria-label="Estado de la prueba" aria-busy={disabled}>
      {options.map((option, index) => (
        <button key={option.value} type="button" role="radio" aria-checked={value === option.value} disabled={disabled} className={`state-option state-${option.value.toLowerCase().replace("_", "-")} ${value === option.value ? "selected" : ""}`} onKeyDown={(event) => moveSelection(event, index)} onClick={() => onChange(option.value)}>
          <span className="state-dot" aria-hidden="true" />{option.label}
        </button>
      ))}
    </div>
  );
}
