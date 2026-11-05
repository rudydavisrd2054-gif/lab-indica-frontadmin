"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import type { EstadoPrueba, Prueba, PruebaInput, ToastMessage } from "@/types/admin";

export function useAdminPruebas(token: string, onToast: (toast: Omit<ToastMessage, "id">) => void) {
  const [pruebas, setPruebas] = useState<Prueba[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setPruebas(await adminApi.getPruebas(token));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudieron cargar las pruebas.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let current = true;
    adminApi.getPruebas(token).then((items) => {
      if (current) setPruebas(items);
    }).catch((cause: unknown) => {
      if (current) setError(cause instanceof Error ? cause.message : "No se pudieron cargar las pruebas.");
    }).finally(() => {
      if (current) setLoading(false);
    });
    return () => { current = false; };
  }, [token]);

  const updateStatus = useCallback(async (id: Prueba["id"], estado: EstadoPrueba, nota?: string) => {
    try {
      const updated = await adminApi.setEstado(token, id, estado, nota);
      setPruebas((items) => items.map((item) => item.id === id ? {
        ...item,
        ...updated,
        estado,
        nota: estado === "DISPONIBLE" ? null : nota ?? updated?.nota ?? item.nota,
        actualizado_en: updated?.actualizado_en ?? new Date().toISOString(),
      } : item));
      onToast({ text: "Estado actualizado.", kind: "success" });
    } catch (cause) {
      onToast({ text: cause instanceof Error ? cause.message : "No se pudo actualizar el estado.", kind: "error" });
      throw cause;
    }
  }, [onToast, token]);

  const save = useCallback(async (input: PruebaInput, id?: Prueba["id"]) => {
    const saved = await adminApi.savePrueba(token, input, id);
    setPruebas((items) => id === undefined
      ? [...items, saved]
      : items.map((item) => item.id === id ? { ...item, ...saved } : item));
    onToast({ text: id === undefined ? "Prueba creada." : "Prueba actualizada.", kind: "success" });
  }, [onToast, token]);

  const setActive = useCallback(async (prueba: Prueba, activo: 0 | 1) => {
    try {
      const updated = await adminApi.savePrueba(token, {
        nombre: prueba.nombre,
        descripcion: prueba.descripcion ?? "",
        cuando_hacerlo: prueba.cuando_hacerlo ?? "",
        interpretacion: prueba.interpretacion ?? "",
        tipo_muestra: prueba.tipo_muestra ?? "",
        preparacion: prueba.preparacion ?? "",

        indicaciones: prueba.indicaciones ?? "",
        tiempo_ayunas: prueba.tiempo_ayunas ?? "",
        area: prueba.area,
        orden: prueba.orden,
        activo,
      }, prueba.id);
      setPruebas((items) => items.map((item) => item.id === prueba.id ? { ...item, ...updated, activo } : item));
      onToast({ text: activo ? "Prueba restaurada." : "Prueba movida a Ocultas.", kind: "success" });
    } catch (cause) {
      onToast({ text: cause instanceof Error ? cause.message : "No se pudo cambiar la visibilidad.", kind: "error" });
      throw cause;
    }
  }, [onToast, token]);

  return { pruebas, loading, error, load, updateStatus, save, setActive };
}
