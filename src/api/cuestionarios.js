import { request } from './cliente';

// El backend identifica al usuario por el token: ninguna función envía usuario_id.

/** Docente: sus exámenes. Estudiante: los publicados. Devuelve un arreglo. */
export const listarCuestionarios = async () => {
  const resultado = await request('/api/cuestionarios');
  return resultado?.data || [];
};

export const listarComunidad = async () => {
  const resultado = await request('/api/comunidad/cuestionarios');
  return resultado?.data || [];
};

export const generarCuestionario = ({ archivo, numPreguntas, nombreExamen, materia }) => {
  const formData = new FormData();
  formData.append('nombre_examen', nombreExamen);
  formData.append('materia', materia);
  formData.append('archivo', archivo);
  formData.append('num_preguntas', numPreguntas);
  return request('/api/generar-cuestionario', { method: 'POST', body: formData });
};

export const actualizarPreguntas = (id, preguntas) =>
  request(`/api/cuestionarios/${id}`, { method: 'PUT', body: { preguntas_json: preguntas } });

export const publicarCuestionario = (id) =>
  request(`/api/cuestionarios/${id}/publicar`, { method: 'PUT' });

export const despublicarCuestionario = (id) =>
  request(`/api/cuestionarios/${id}/despublicar`, { method: 'PUT' });

export const compartirCuestionario = (id) =>
  request(`/api/cuestionarios/${id}/compartir`, { method: 'PUT' });

export const eliminarCuestionario = (id) =>
  request(`/api/cuestionarios/${id}`, { method: 'DELETE' });

/** La copia queda a nombre del docente del token. */
export const clonarCuestionario = (id) =>
  request(`/api/cuestionarios/${id}/clonar`, { method: 'POST' });
