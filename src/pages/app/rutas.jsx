import React, { useEffect } from 'react';
import { Navigate, useOutletContext, useParams } from 'react-router-dom';
import { useSesion } from '../../context/sesion';
import { rutaInicio } from '../../rutas';
import { calcularCalificacion } from '../../utils/calificar';
import { exportarExamen } from '../../utils/exportarExamen';

import VistaDashboard from '../../components/dashboard/VistaDashboard';
import VistaCrearExamen from '../../components/dashboard/VistaCrearExamen';
import VistaHistorialDocente from '../../components/dashboard/VistaHistorialDocente';
import VistaPanelEstudiante from '../../components/dashboard/VistaPanelEstudiante';
import VistaExamen from '../../components/dashboard/VistaExamen';
import VistaConfiguracion from '../../components/dashboard/VistaConfiguracion';

// Cada ruta es un envoltorio delgado: toma lo que necesita del layout (useOutletContext)
// y renderiza la vista correspondiente. La lógica vive en los hooks del layout.

// ---------- Guardias ----------

/** /app sin subruta (o una desconocida): manda a la pantalla inicial del rol. */
export function InicioSegunRol() {
  const { rol } = useSesion();
  return <Navigate to={rutaInicio(rol)} replace />;
}

/** Solo deja pasar al rol indicado; a los demás los manda a su pantalla inicial. */
export function SoloRol({ rol: requerido, children }) {
  const { rol } = useSesion();
  return rol === requerido ? children : <Navigate to={rutaInicio(rol)} replace />;
}

// ---------- Efectos compartidos ----------

// Los créditos se regeneran cada día en el backend: el docente consulta su saldo real
// en las pantallas donde los usa, en lugar de confiar en el valor guardado.
// (No en todas: VistaPerfil recarga su formulario cuando cambia el usuario.)
function useRefrescarCreditos() {
  const { refrescarCreditos } = useSesion();
  useEffect(() => { refrescarCreditos(); }, [refrescarCreditos]);
}

function useCargarHistorial() {
  const { historial } = useOutletContext();
  const { cargar } = historial;
  useEffect(() => { cargar(); }, [cargar]);
  return historial;
}

// ---------- Docente ----------

export function RutaComunidad() {
  const { clonarDesdeComunidad } = useOutletContext();
  useRefrescarCreditos();
  return <VistaDashboard clonarCuestionario={clonarDesdeComunidad} />;
}

export function RutaCrearExamen() {
  const { generador } = useOutletContext();
  const { creditos } = useSesion();
  useRefrescarCreditos();
  return <VistaCrearExamen {...generador} creditos={creditos} />;
}

export function RutaHistorial() {
  const { setVista, abrirExamen, setModalPublicar, setModalConfirmarEliminar } = useOutletContext();
  const historial = useCargarHistorial();
  return (
    <VistaHistorialDocente
      listaHistorial={historial.lista}
      cargandoHistorial={historial.cargando}
      setVista={setVista}
      iniciarExamen={abrirExamen}
      exportarExamen={exportarExamen}
      despublicarCuestionario={historial.despublicar}
      abrirModalPublicar={(id) => setModalPublicar({ abierto: true, id })}
      eliminarExamen={(id) => setModalConfirmarEliminar({ abierto: true, id })}
      compartirEnComunidad={historial.compartir}
    />
  );
}

export function RutaClases() {
  return (
    <div className="flex flex-col items-center justify-center pt-32 text-center bg-white p-16 rounded-3xl border border-gray-100 shadow-sm">
      <span className="material-symbols-outlined text-7xl text-gray-300 mb-5 animate-pulse">construction</span>
      <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Sección en proceso</h2>
      <p className="text-gray-500 max-w-md">La gestión y creación de grupos llegará en las próximas actualizaciones de QuizAI.</p>
    </div>
  );
}

// ---------- Estudiante ----------

export function RutaMisEvaluaciones() {
  const { setModalConfirmarInicio } = useOutletContext();
  const historial = useCargarHistorial();
  return (
    <VistaPanelEstudiante
      listaHistorial={historial.lista}
      cargandoHistorial={historial.cargando}
      intentarIniciarExamen={(registro) => setModalConfirmarInicio({ abierto: true, registro })}
    />
  );
}

// ---------- Ambos roles ----------

export function RutaConfiguracion() {
  const { usuario } = useSesion();
  return <VistaConfiguracion usuario={usuario} />;
}

/**
 * Examen abierto. Si se entra directo por URL (o se recarga la página) no hay examen en memoria:
 * se regresa a la pantalla inicial. Así el estudiante siempre pasa por el modal de confirmación.
 */
export function RutaExamen() {
  const { id } = useParams();
  const { rol } = useSesion();
  const {
    editor, intento, modoExamenActivo,
    setModalAlertaEdicion, setModalConfirmarEliminarPregunta, setModalConfirmarReinicio,
    intentarEntregarEvaluacion, salirDelExamen,
  } = useOutletContext();

  const examen = editor.examen;
  if (!examen || String(examen.id) !== id) {
    return <Navigate to={rutaInicio(rol)} replace />;
  }

  return (
    <VistaExamen
      rol={rol}
      examenActivo={examen}
      modoEdicion={editor.modoEdicion}
      setModoEdicion={editor.setModoEdicion}
      setModalAlertaEdicion={setModalAlertaEdicion}
      examenTerminado={intento.terminado}
      calcularCalificacion={() => calcularCalificacion(examen.preguntas_json, intento.respuestas)}
      respuestasUsuario={intento.respuestas}
      eliminarPregunta={(index) => setModalConfirmarEliminarPregunta({ abierto: true, index })}
      actualizarPregunta={editor.actualizarPregunta}
      actualizarOpcion={editor.actualizarOpcion}
      seleccionarOpcion={intento.seleccionar}
      agregarPreguntaVacia={editor.agregarPregunta}
      guardarEdicionEnBackend={editor.guardar}
      intentarEntregarEvaluacion={intentarEntregarEvaluacion}
      salirDelExamen={salirDelExamen}
      modoExamenActivo={modoExamenActivo}
      reiniciarExamen={() => setModalConfirmarReinicio(true)}
    />
  );
}
