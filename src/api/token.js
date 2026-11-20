// Token JWT de la sesión.
// Vive en memoria (lo lee cliente.js en cada petición) y en localStorage (para sobrevivir recargas).
// Se actualiza de forma síncrona: así ninguna petición sale sin token justo después del login.

const CLAVE = 'tokenQuizAI';

function leerGuardado() {
  try {
    return localStorage.getItem(CLAVE);
  } catch {
    return null;
  }
}

let token = leerGuardado();

export const obtenerToken = () => token;

export function guardarToken(nuevo) {
  token = nuevo || null;
  try {
    if (token) localStorage.setItem(CLAVE, token);
    else localStorage.removeItem(CLAVE);
  } catch {
    // Sin localStorage la sesión dura mientras la pestaña esté abierta.
  }
}
