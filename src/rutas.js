// Rutas de la sección privada (/app).
// Las claves son los nombres de "vista" que usan Navbar, Sidebar y VistaHistorialDocente.
export const RUTAS = {
  dashboard: '/app/comunidad',
  nuevo: '/app/nuevo',
  historial: '/app/historial',
  clases: '/app/clases',
  panel_estudiante: '/app/evaluaciones',
  perfil: '/app/perfil',
  configuracion: '/app/configuracion',
};

export const rutaExamen = (id) => `/app/examen/${id}`;

/** Pantalla inicial de cada rol. */
export const rutaInicio = (rol) => (rol === 'docente' ? RUTAS.dashboard : RUTAS.panel_estudiante);

/** Nombre de la vista actual a partir de la URL (null si no corresponde a ninguna). */
export function vistaDesdeRuta(pathname) {
  const ruta = pathname.replace(/\/+$/, '');
  if (ruta.startsWith('/app/examen/')) return 'examen';
  return Object.keys(RUTAS).find((vista) => RUTAS[vista] === ruta) ?? null;
}
