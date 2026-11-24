import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Printer, X } from "lucide-react";
import InstructionsDocument, { PaperSelect, type PaperSize } from "./InstructionsDocument";
import type { Configuracion, Prueba } from "@/types/admin";

export default function InstructionsPreview({ pruebas, config, paper, onPaperChange, onClose }: {
  pruebas: Prueba[];
  config: Configuracion;
  paper: PaperSize;
  onPaperChange: (paper: PaperSize) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const previewBody = useRef<HTMLDivElement>(null);
  const measurement = useRef<HTMLDivElement>(null);
  const [pagination, setPagination] = useState<{ paper: PaperSize; pages: Prueba[][]; scale: number } | null>(null);
  const layout = pagination?.paper === paper ? pagination : null;
  const printRoot = useRef<HTMLDivElement>(null);
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  useEffect(() => {
    const body = previewBody.current;
    const sheet = measurement.current?.querySelector("article");
    if (!body || !sheet) return;

    function paginate() {
      if (!body || !sheet) return;
      const style = getComputedStyle(sheet);
      const pageHeight = parseFloat(style.minHeight);
      const capacity = pageHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom) - 1;
      const [letterhead, title, ...content] = Array.from(sheet.children);
      const titleStyle = getComputedStyle(title);
      const headingHeight = letterhead.getBoundingClientRect().height + title.getBoundingClientRect().height
        + parseFloat(titleStyle.marginTop) + parseFloat(titleStyle.marginBottom);
      const heights = content.map((item) => item.getBoundingClientRect().height);
      const footerHeight = heights[pruebas.length];
      const pages: Prueba[][] = [[]];
      let used = headingHeight + footerHeight;

      pruebas.forEach((exam, index) => {
        if (pages.at(-1)!.length && used + heights[index] > capacity) {
          pages.push([]);
          used = headingHeight + footerHeight;
        }
        pages.at(-1)!.push(exam);
        used += heights[index];
      });

      const insetX = parseFloat(getComputedStyle(body).paddingLeft) + parseFloat(getComputedStyle(body).paddingRight);
      const scale = Math.min(1, (body.clientWidth - insetX) / sheet.offsetWidth);
      if (scale > 0) setPagination({ paper, pages, scale });
    }

    const observer = new ResizeObserver(paginate);
    observer.observe(body);
    observer.observe(sheet);
    Array.from(sheet.children).forEach((item) => observer.observe(item));
    paginate();
    return () => observer.disconnect();
  }, [paper, pruebas]);

  const sheets = layout?.pages.map((exams, index) => (
    <InstructionsDocument key={index} pruebas={exams} config={config} paper={paper} />
  ));

  async function print() {
    const root = printRoot.current;
    if (!root || printing) return;
    setPrinting(true);
    setError("");
    try {
      await Promise.all(Array.from(root.querySelectorAll("img"), (image) => image.decode()));
      if (root.isConnected) window.print();
    } catch {
      setError("No se pudieron cargar las imágenes del documento. Cierra y vuelve a abrir la vista previa.");
    } finally {
      setPrinting(false);
    }
  }

  return (
    <>
      <dialog ref={dialog} className="admin-dialog instructions-dialog" aria-labelledby="instructions-preview-title"
        onCancel={(event) => { event.preventDefault(); onClose(); }}>
        <div className="instructions-preview-layout">
          <header className="dialog-heading">
            <h2 id="instructions-preview-title">Vista previa de impresión</h2>
            <PaperSelect paper={paper} onChange={onPaperChange} />
            <button type="button" className="icon-button dialog-close" aria-label="Cerrar vista previa" onClick={onClose}><X size={20} aria-hidden="true" /></button>
          </header>
          <div ref={previewBody} className="instructions-preview-body" tabIndex={0} role="region" aria-label="Documento de vista previa">
            <div className="instructions-pages" style={{ zoom: layout?.scale }}>
              {sheets}
            </div>
          </div>
          <footer className="dialog-actions">
            {error && <p className="form-error" role="alert">{error}</p>}
            <button type="button" className="button button-secondary" onClick={onClose}>Volver</button>
            <button type="button" className="button button-primary" disabled={printing || !layout} onClick={() => void print()}>
              <Printer size={17} aria-hidden="true" />{printing ? "Preparando…" : "Imprimir"}
            </button>
          </footer>
        </div>
      </dialog>
      <div className="instructions-measurement" ref={measurement} aria-hidden="true">
        <InstructionsDocument pruebas={pruebas} config={config} paper={paper} />
      </div>
      {createPortal(
        <div className="instructions-print-root" ref={printRoot} aria-hidden="true">
          {sheets}
        </div>,
        document.body,
      )}
    </>
  );
}
