import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SesionContext } from './sesion';
import { obtenerCreditos } from '../api/usuarios';

const CLAVE = 'usuarioQuizAI';

// localStorage puede fallar (modo privado, almacenamiento bloqueado): la app debe seguir funcionando.
function leerUsuarioGuardado() {
  try {
    const texto = localStorage.getItem(CLAVE);
    return texto ? JSON.parse(texto) : null;
  } catch {
    return null;
  }
}

function guardarUsuario(usuario) {
  try {
    if (usuario) localStorage.setItem(CLAVE, JSON.stringify(usuario));
    else localStorage.removeItem(CLAVE);
  } catch {
    // Sin persistencia: la sesión dura mientras la pestaña esté abierta.
  }
}

/** Única fuente de verdad del usuario en sesión. Persiste en localStorage. */
export function SesionProvider({ children }) {
  const [usuario, setUsuario] = useState(leerUsuarioGuardado);

  // Mantiene localStorage sincronizado con el estado
  useEffect(() => {
    guardarUsuario(usuario);
  }, [usuario]);

  const iniciarSesion = useCallback((datosUsuario) => setUsuario(datosUsuario), []);
  const cerrarSesion = useCallback(() => setUsuario(null), []);

  /** Mezcla cambios en el usuario actual (p. ej. perfil editado o créditos nuevos). */
  const actualizarUsuario = useCallback((cambios) => {
    setUsuario((previo) => (previo ? { ...previo, ...cambios } : previo));
  }, []);

  const usuarioId = usuario?.id;

  /** Pide al backend el saldo de créditos del día (ya regenerado si cambió la fecha). */
  const refrescarCreditos = useCallback(async () => {
    if (!usuarioId) return;
    try {
      const { creditos_disponibles } = await obtenerCreditos(usuarioId);
      actualizarUsuario({ creditos_disponibles });
    } catch {
      // Si falla, se conserva el valor que ya teníamos.
    }
  }, [usuarioId, actualizarUsuario]);

  const valor = useMemo(() => ({
    usuario,
    rol: usuario?.rol ?? null,
    creditos: usuario?.creditos_disponibles ?? 0,
    iniciarSesion,
    cerrarSesion,
    actualizarUsuario,
    refrescarCreditos,
  }), [usuario, iniciarSesion, cerrarSesion, actualizarUsuario, refrescarCreditos]);

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
}

export default SesionProvider;
