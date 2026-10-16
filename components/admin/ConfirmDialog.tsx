"use client";

import { useEffect, useRef, useState } from "react";

export default function ConfirmDialog({ open, title, message, onCancel, onConfirm }: {
  open: boolean; title: string; message: string; onCancel: () => void; onConfirm: () => Promise<void>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);
  async function confirm() {
    setBusy(true);
    try { await onConfirm(); } finally { setBusy(false); }
  }
  return (
    <dialog ref={dialog} className="admin-dialog confirm-dialog" onCancel={(event) => { event.preventDefault(); if (!busy) onCancel(); }}>
      <div className="dialog-heading"><p className="eyebrow">CONFIRMACIÓN</p><h2>{title}</h2></div>
      <p className="dialog-copy">{message}</p>
      <div className="dialog-actions"><button type="button" className="button button-secondary" onClick={onCancel} disabled={busy}>Cancelar</button><button type="button" className="button button-danger" onClick={() => void confirm()} disabled={busy}>{busy ? "Procesando…" : "Eliminar"}</button></div>
    </dialog>
  );
}
