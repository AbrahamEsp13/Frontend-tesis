import { API_URL } from '../config';
import { obtenerToken } from './token';

// Lo registra SesionProvider: cierra la sesión cuando el backend rechaza el token (vencido o inválido).
let alExpirar = null;
export function alExpirarSesion(manejador) {
  alExpirar = manejador;
}

/** Error de la API con el mensaje para el usuario y el código HTTP (0 = sin conexión). */
export class ApiError extends Error {
  constructor(mensaje, status) {
    super(mensaje);
    this.name = 'ApiError';
    this.status = status;
  }
}

// FastAPI responde { detail: "texto" } o, en errores de validación (422),
// { detail: [{ msg: "..." }, ...] }.
function mensajeDeError(datos, status) {
  const detalle = datos?.detail;
  if (typeof detalle === 'string') return detalle;
  if (Array.isArray(detalle) && detalle.length > 0) {
    return detalle.map((d) => d.msg).filter(Boolean).join('. ');
  }
  return `Error del servidor (${status}). Intenta de nuevo más tarde.`;
}

/**
 * Hace una petición al backend.
 * - `body` puede ser un objeto (se envía como JSON) o un FormData (se envía tal cual).
 * - Si hay sesión, envía el token: `Authorization: Bearer <token>`.
 * - Si la respuesta no es 2xx, lanza ApiError con el `detail` del backend.
 *   Un 401 con token enviado significa sesión vencida: se avisa a SesionProvider para cerrarla.
 * - Devuelve el JSON de la respuesta (o null si no trae cuerpo).
 */
export async function request(ruta, { method = 'GET', body, headers = {} } = {}) {
  const opciones = { method, headers: { ...headers } };

  const token = obtenerToken();
  if (token) opciones.headers.Authorization = `Bearer ${token}`;

  if (body instanceof FormData) {
    opciones.body = body;
  } else if (body !== undefined) {
    opciones.body = JSON.stringify(body);
    opciones.headers['Content-Type'] = 'application/json';
  }

  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, opciones);
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Revisa tu conexión a internet.', 0);
  }

  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    if (respuesta.status === 401 && token) alExpirar?.();
    throw new ApiError(mensajeDeError(datos, respuesta.status), respuesta.status);
  }
  return datos;
}
