import { useState } from 'react';
import * as api from '../api/cuestionarios';
import { useSesion } from '../context/sesion';

/**
 * Formulario "Crear examen" y la llamada a la IA.
 * Devuelve las mismas props que espera <VistaCrearExamen> (excepto `creditos`).
 */
export function useGenerador({ notificar, onGenerado }) {
  const { usuario, creditos, actualizarUsuario, refrescarCreditos } = useSesion();

  const [nombreExamen, setNombreExamen] = useState('');
  const [materia, setMateria] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [numPreguntas, setNumPreguntas] = useState(5);
  const [cargando, setCargando] = useState(false);

  const validar = () => {
    if (!nombreExamen.trim()) return 'Por favor, dale un título a tu examen.';
    if (!materia) return 'Por favor, selecciona una materia.';
    if (!archivo) return 'Por favor, selecciona un archivo PDF primero.';
    return null;
  };

  const generarCuestionario = async () => {
    const problema = validar();
    if (problema) {
      notificar('Atención', problema, 'warning');
      return;
    }

    setCargando(true);
    try {
      // Si el backend responde con error (p. ej. créditos agotados), api lanza su 'detail'
      const resultado = await api.generarCuestionario({ archivo, usuarioId: usuario.id, numPreguntas, nombreExamen, materia });

      notificar('¡Cuestionario Generado!', 'La IA ha procesado el PDF. Ve a tu historial para revisarlo y publicarlo.', 'exito');

      // El backend devuelve el saldo restante; si no viene, descontamos uno localmente
      actualizarUsuario({ creditos_disponibles: resultado?.creditos_disponibles ?? creditos - 1 });

      setNombreExamen('');
      setMateria('');
      setArchivo(null);
      onGenerado?.();
    } catch (err) {
      // 403 = créditos agotados: sincronizamos el saldo para que el formulario se bloquee
      if (err.status === 403) refrescarCreditos();
      const sinCreditos = err.message.includes('créditos');
      notificar(sinCreditos ? 'Créditos Agotados' : 'Error en la Generación', err.message, sinCreditos ? 'warning' : 'error');
    } finally {
      setCargando(false);
    }
  };

  return {
    nombreExamen, setNombreExamen,
    materia, setMateria,
    numPreguntas, setNumPreguntas,
    archivo, setArchivo,
    cargando,
    generarCuestionario,
  };
}

export default useGenerador;
