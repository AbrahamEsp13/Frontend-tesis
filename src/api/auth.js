import { request } from './cliente';

/** Devuelve { mensaje, usuario }. */
export const iniciarSesion = (correo, password) =>
  request('/api/auth/login', { method: 'POST', body: { correo, password } });

export const registrarUsuario = ({ nombre, correo, password, rol }) =>
  request('/api/auth/register', { method: 'POST', body: { nombre, correo, password, rol } });
