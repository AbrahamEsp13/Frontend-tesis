import { request } from './cliente';

/** Devuelve { status, usuario } con el usuario actualizado. */
export const actualizarPerfil = (usuarioId, datos) =>
  request(`/api/usuarios/${usuarioId}/perfil`, { method: 'PUT', body: datos });
