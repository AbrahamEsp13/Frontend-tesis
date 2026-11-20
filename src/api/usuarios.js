import { request } from './cliente';

/** Devuelve { creditos_disponibles } ya regenerados por el backend si cambió el día. */
export const obtenerCreditos = (usuarioId) =>
  request(`/api/usuarios/${usuarioId}/creditos`);

/** Devuelve { status, usuario } con el usuario actualizado. */
export const actualizarPerfil = (usuarioId, datos) =>
  request(`/api/usuarios/${usuarioId}/perfil`, { method: 'PUT', body: datos });
