export type Area =
  | "bioquimica"
  | "inmunologia"
  | "hematologia"
  | "microbiologia";

export type EstadoPrueba = "DISPONIBLE" | "SIN_REACTIVO" | "SUSPENDIDA";

export interface Usuario {
  id: number | string;
  nombre: string;
}

export interface Prueba {
  id: number | string;
  nombre: string;
  descripcion: string | null;
  cuando_hacerlo?: string | null;
  interpretacion?: string | null;
  tipo_muestra?: string | null;
  preparacion?: string | null;
  indicaciones: string | null;
  tiempo_ayunas: string | null;
  area: Area;
  estado: EstadoPrueba;
  nota: string | null;
  orden: number;
  activo: boolean | 0 | 1;
  actualizado_en: string;
}

export interface PruebaInput {
  descripcion: string;
  cuando_hacerlo: string;
  interpretacion: string;
  tipo_muestra: string;
  preparacion: string;

  nombre: string;
  indicaciones: string;
  tiempo_ayunas: string;
  area: Area;
  orden: number;
  activo: 0 | 1;
}

export interface HistorialItem {
  id?: number | string;
  accion: string;
  antes: string | null;
  despues: string | null;
  creado_en: string;
  usuario: string;
}

export interface Configuracion {
  toma_inicio: string;
  toma_fin: string;
  atencion_inicio: string;
  atencion_fin: string;
  nombre: string;
  telefono: string;
  direccion: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export type ToastMessage = {
  id: number;
  text: string;
  kind: "success" | "error";
};
