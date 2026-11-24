import type { Area, Configuracion, Prueba } from "@/types/admin";

export const areaNames: Record<Area, string> = {
  bioquimica: "Bioquímica",
  inmunologia: "Inmunología",
  hematologia: "Hematología",
  microbiologia: "Microbiología",
};

export type PaperSize = "A4" | "A5";

export function PaperSelect({ paper, onChange }: { paper: PaperSize; onChange: (paper: PaperSize) => void }) {
  return (
    <label className="filter-label instructions-paper">
      Tamaño de papel
      <select value={paper} onChange={(event) => onChange(event.target.value === "A5" ? "A5" : "A4")}>
        <option value="A4">A4 (210 × 297 mm)</option>
        <option value="A5">A5 (148 × 210 mm)</option>
      </select>
    </label>
  );
}

function formatTime(value: string) {
  const parts = /^(\d{1,2}):([0-5]\d)(?::[0-5]\d)?$/.exec(value?.trim() ?? "");
  if (!parts || Number(parts[1]) > 23) return null;

  const hour = Number(parts[1]);
  return { time: `${hour % 12 || 12}:${parts[2]}`, period: hour < 12 ? "a. m." : "p. m." };
}

function hours(start: string, end: string) {
  const from = formatTime(start);
  const to = formatTime(end);
  if (!from || !to) {
    const time = from ?? to;
    return time ? `${time.time} ${time.period}` : "";
  }

  const first = from.period === to.period ? from.time : `${from.time} ${from.period}`;
  return `${first} \u2013 ${to.time} ${to.period}`;
}

export default function InstructionsDocument({ pruebas, config, paper }: {
  pruebas: Prueba[];
  config: Configuracion;
  paper: PaperSize;
}) {
  const reception = hours(config.toma_inicio, config.toma_fin);
  const service = hours(config.atencion_inicio, config.atencion_fin);

  return (
    <article className="instructions-sheet" data-paper={paper} aria-label="Indicaciones de laboratorio">
      <header className="instructions-letterhead">
        {/* eslint-disable-next-line @next/next/no-img-element -- Preserve the original local artwork for print. */}
        <img src="/logocallao.png" alt="Gobierno Regional del Callao" />
        <div><strong>LABORATORIO CLÍNICO ACAPULCO</strong><p>Centro de Salud Acapulco</p></div>
      </header>
      <h3 className="instructions-document-title">INDICACIONES DE LABORATORIO</h3>
      {pruebas.map((prueba) => (
        <section className="instructions-exam" key={prueba.id}>
          <header>
            <h4>{prueba.nombre}</h4>
            <p>{areaNames[prueba.area]}</p>
            {prueba.tiempo_ayunas?.trim() && <p><strong>Ayuno</strong> · {prueba.tiempo_ayunas}</p>}
          </header>
          {prueba.preparacion?.trim() && <><h5>Preparación</h5><p>{prueba.preparacion}</p></>}
          {prueba.indicaciones?.trim() && <><h5>Indicaciones preanalíticas</h5><p>{prueba.indicaciones}</p></>}
        </section>
      ))}
      <footer className="instructions-page-footer">
        <div className="instructions-footer-hours">
          <strong>Toma de muestras</strong>
          <span>{reception}</span>
        </div>
        <div className="instructions-footer-hours">
          <strong>Atención del laboratorio</strong>
          <span>{service}</span>
        </div>
        <div className="instructions-credit">
          <span>Desarrollado por</span>
          {/* eslint-disable-next-line @next/next/no-img-element -- Preserve the original local artwork for print. */}
          <img src="/logo-adark.jpg" alt="ADARK Solutions" />
        </div>
        <figure className="instructions-footer-qr">
          {/* eslint-disable-next-line @next/next/no-img-element -- Preserve the original QR pixels. */}
          <img src="/QR-Laboratorio-Clinico-Acapulco.png" alt="Código QR de las indicaciones en línea" />
        </figure>
      </footer>
    </article>
  );
}
