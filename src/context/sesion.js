import { createContext, useContext } from 'react';

export const SesionContext = createContext(null);

/**
 * Sesión del usuario: { usuario, rol, creditos, iniciarSesion, cerrarSesion,
 * actualizarUsuario, refrescarCreditos }.
 * Debe usarse dentro de <SesionProvider>.
 */
export function useSesion() {
  const sesion = useContext(SesionContext);
  if (!sesion) throw new Error('useSesion() debe usarse dentro de <SesionProvider>');
  return sesion;
}
