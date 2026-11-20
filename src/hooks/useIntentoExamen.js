import { useState } from 'react';

/** Respuestas del estudiante durante un intento de examen. */
export function useIntentoExamen() {
  const [respuestas, setRespuestas] = useState({});
  const [terminado, setTerminado] = useState(false);

  // Siempre crea un objeto nuevo: VistaExamen reinicia el cronómetro al ver respuestas vacías nuevas.
  const reiniciar = () => {
    setRespuestas({});
    setTerminado(false);
  };

  const seleccionar = (indicePregunta, opcion) => {
    if (terminado) return;
    setRespuestas((previas) => ({ ...previas, [indicePregunta]: opcion }));
  };

  const entregar = () => setTerminado(true);

  return { respuestas, terminado, seleccionar, entregar, reiniciar };
}

export default useIntentoExamen;
