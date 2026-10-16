"use client";

import { useEffect } from "react";
import { CircleCheck, CircleX, X } from "lucide-react";
import type { ToastMessage } from "@/types/admin";

export default function Toast({ message, onDismiss }: { message: ToastMessage; onDismiss: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 4500);
    return () => window.clearTimeout(timer);
  }, [message.id, onDismiss]);
  const Icon = message.kind === "success" ? CircleCheck : CircleX;
  return (
    <div className={`toast toast-${message.kind}`} role={message.kind === "error" ? "alert" : "status"}>
      <Icon size={19} aria-hidden="true" /><span>{message.text}</span>
      <button type="button" aria-label="Cerrar aviso" onClick={onDismiss}><X size={17} aria-hidden="true" /></button>
    </div>
  );
}
