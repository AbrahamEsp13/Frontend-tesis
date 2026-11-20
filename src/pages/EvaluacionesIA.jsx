import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useSesion } from '../context/sesion';

// --- LÓGICA (hooks y utilidades) ---
import { useHistorial } from '../hooks/useHistorial';
import { useEditorExamen } from '../hooks/useEditorExamen';
import { useIntentoExamen } from '../hooks/useIntentoExamen';
import { useGenerador } from '../hooks/useGenerador';
import { calcularCalificacion, todasRespondidas } from '../utils/calificar';
import { exportarExamen } from '../utils/exportarExamen';

// --- COMPONENTES MODULARES (LAYOUT) ---
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';

// --- COMPONENTES MODULARES (VISTAS) ---
import VistaCrearExamen from '../components/dashboard/VistaCrearExamen'; 
import VistaHistorialDocente from '../components/dashboard/VistaHistorialDocente'; 
import VistaPanelEstudiante from '../components/dashboard/VistaPanelEstudiante';
import VistaExamen from '../components/dashboard/VistaExamen';
import VistaDashboard from '../components/dashboard/VistaDashboard';
import VistaPerfil from '../components/dashboard/VistaPerfil';
import VistaConfiguracion from '../components/dashboard/VistaConfiguracion';

// --- COMPONENTES DE UI ---
import Dialogo from '../components/ui/Dialogo';

function EvaluacionesIA() {
  const navigate = useNavigate();

  // --- SESIÓN (compartida por toda la app) ---
  const { usuario, rol, creditos, cerrarSesion: terminarSesion, refrescarCreditos } = useSesion();

  // --- NAVEGACIÓN Y UI GENERAL ---
  const [vista, setVista] = useState(rol === 'docente' ? 'dashboard' : 'panel_estudiante');
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);

  // --- MODALES ---
  const [modalInfo, setModalInfo] = useState({ abierto: false, titulo: '', mensaje: '', tipo: 'exito' });
  const [modalPublicar, setModalPublicar] = useState({ abierto: false, id: null });
  const [modalConfirmarEliminar, setModalConfirmarEliminar] = useState({ abierto: false, id: null });
  const [modalConfirmarEliminarPregunta, setModalConfirmarEliminarPregunta] = useState({ abierto: false, index: null });
  const [modalAlertaEdicion, setModalAlertaEdicion] = useState(false);
  const [modalConfirmarInicio, setModalConfirmarInicio] = useState({ abierto: false, registro: null });
  const [modalAdvertenciaSalida, setModalAdvertenciaSalida] = useState(false);
  const [modalConfirmarEntrega, setModalConfirmarEntrega] = useState(false);
  const [modalConfirmarReinicio, setModalConfirmarReinicio] = useState(false);

  /** Muestra el modal de aviso. tipo: 'exito' | 'error' | 'warning'. */
  const notificar = useCallback((titulo, mensaje, tipo = 'exito') => {
    setModalInfo({ abierto: true, titulo, mensaje, tipo });
  }, []);

  // --- LÓGICA (hooks) ---
  const historial = useHistorial({ usuarioId: usuario?.id, rol, notificar });
  const editor = useEditorExamen({ notificar, onGuardado: historial.cargar });
  const intento = useIntentoExamen();
  const generador = useGenerador({
    notificar,
    onGenerado: () => { setVista('historial'); historial.cargar(); },
  });

  const examenActivo = editor.examen;
  const modoExamenActivo = vista === 'examen' && examenActivo && !intento.terminado && rol === 'estudiante';

  // --- EFECTOS ---
  // Los créditos se regeneran cada día en el backend: el docente consulta su saldo
  // real al entrar (dashboard) y al abrir el generador, en lugar de confiar en el valor guardado.
  // (No en todas las vistas: VistaPerfil recarga su formulario cuando cambia el usuario.)
  useEffect(() => {
    if (rol === 'docente' && (vista === 'dashboard' || vista === 'nuevo')) refrescarCreditos();
  }, [rol, vista, refrescarCreditos]);

  const cargarHistorial = historial.cargar;
  useEffect(() => {
    if (vista === 'historial' || vista === 'panel_estudiante') cargarHistorial();
  }, [vista, cargarHistorial]);

  const cerrarSesion = () => {
    navigate('/');
    terminarSesion();
    editor.cerrar();
    setMenuUsuarioAbierto(false);
  };

  // --- HISTORIAL (DOCENTE) ---
  const confirmarPublicacion = () => {
    const id = modalPublicar.id;
    setModalPublicar({ abierto: false, id: null });
    historial.publicar(id);
  };

  const confirmarEliminacionExamen = () => {
    const id = modalConfirmarEliminar.id;
    setModalConfirmarEliminar({ abierto: false, id: null });
    historial.eliminar(id);
  };

  const clonarDesdeComunidad = async (cuestionario) => {
    if (await historial.clonar(cuestionario)) setVista('historial');
  };

  // --- EDICIÓN (DOCENTE) ---
  const confirmarEliminarPregunta = () => {
    editor.eliminarPregunta(modalConfirmarEliminarPregunta.index);
    setModalConfirmarEliminarPregunta({ abierto: false, index: null });
  };

  // --- ABRIR Y CERRAR UN EXAMEN ---
  const abrirExamen = (registro) => {
    editor.abrir(registro);
    intento.reiniciar();
    setVista('examen');
  };

  const confirmarInicioExamen = () => {
    abrirExamen(modalConfirmarInicio.registro);
    setModalConfirmarInicio({ abierto: false, registro: null });
  };

  const salirDelExamen = () => {
    setModalAdvertenciaSalida(false);
    editor.cerrar();
    intento.reiniciar();
    setVista(rol === 'docente' ? 'historial' : 'panel_estudiante');
  };

  const intentarSalirExamen = () => {
    if (intento.terminado) salirDelExamen();
    else setModalAdvertenciaSalida(true);
  };

  // --- INTENTO (ESTUDIANTE) ---
  const intentarEntregarEvaluacion = () => {
    if (!todasRespondidas(examenActivo.preguntas_json, intento.respuestas)) {
      notificar('Evaluación Incompleta', 'Por favor responde todas las preguntas antes de entregar tu examen.', 'warning');
      return;
    }
    setModalConfirmarEntrega(true);
  };

  const confirmarEntregaExamen = () => {
    intento.entregar();
    setModalConfirmarEntrega(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmarReinicio = () => {
    intento.reiniciar();
    setModalConfirmarReinicio(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==========================================
  // RENDERIZADO DEL SHELL DE LA APLICACIÓN
  // ==========================================

  // Sin sesión no hay nada que mostrar: de vuelta a la página de inicio para iniciar sesión
  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={`min-h-screen ${modoExamenActivo ? 'bg-white dark:bg-gray-900' : 'bg-[#f8f9fa] dark:bg-gray-900'} flex flex-col font-sans text-gray-800 dark:text-gray-100 relative transition-colors duration-300`}>
      
      {/* ========================================== */}
      {/* ZONA DE MODALES (DOCENTE Y GENERAL)        */}
      {/* ========================================== */}

      <Dialogo
        abierto={modalInfo.abierto}
        icono={modalInfo.tipo === 'exito' ? 'check_circle' : modalInfo.tipo === 'error' ? 'error' : 'warning'}
        color={modalInfo.tipo === 'exito' ? 'green' : modalInfo.tipo === 'error' ? 'red' : 'yellow'}
        titulo={modalInfo.titulo}
        textoConfirmar="Entendido"
        onConfirmar={() => setModalInfo({ abierto: false, titulo: '', mensaje: '', tipo: 'exito' })}
      >
        {modalInfo.mensaje}
      </Dialogo>

      <Dialogo
        abierto={modalConfirmarEliminar.abierto}
        icono="delete_forever"
        color="red"
        ancho="md"
        titulo="¿Eliminar Examen?"
        textoConfirmar="Sí, Eliminar"
        onConfirmar={confirmarEliminacionExamen}
        onCancelar={() => setModalConfirmarEliminar({ abierto: false, id: null })}
      >
        Esta acción borrará el examen para siempre de tu historial. <strong className="text-gray-700">No se puede deshacer.</strong>
      </Dialogo>

      <Dialogo
        abierto={modalConfirmarEliminarPregunta.abierto}
        icono="remove_selection"
        color="red"
        titulo="¿Borrar Pregunta?"
        textoConfirmar="Borrar"
        onConfirmar={confirmarEliminarPregunta}
        onCancelar={() => setModalConfirmarEliminarPregunta({ abierto: false, index: null })}
      >
        Esta pregunta será removida del cuestionario actual.
      </Dialogo>

      <Dialogo
        abierto={modalPublicar.abierto}
        icono="rocket_launch"
        color="blue"
        ancho="md"
        titulo="¿Publicar Evaluación?"
        textoConfirmar="Sí, Publicar"
        onConfirmar={confirmarPublicacion}
        onCancelar={() => setModalPublicar({ abierto: false, id: null })}
      >
        Una vez publicado, este cuestionario será visible para tus estudiantes y <strong className="text-gray-700">no podrá ser editado</strong> mientras esté en vivo.
      </Dialogo>

      <Dialogo
        abierto={modalAlertaEdicion}
        icono="lock"
        color="yellow"
        titulo="Examen Bloqueado"
        textoConfirmar="Entendido"
        onConfirmar={() => setModalAlertaEdicion(false)}
      >
        No puedes editar un cuestionario que ya está publicado. Para hacer cambios, primero debes <strong className="text-gray-700">Ocultarlo</strong> desde tu Historial.
      </Dialogo>

      {/* ========================================== */}
      {/* ZONA DE MODALES (ESTUDIANTE)               */}
      {/* ========================================== */}

      <Dialogo
        abierto={modalConfirmarInicio.abierto && !!modalConfirmarInicio.registro}
        icono="play_circle"
        color="blue"
        variante="destacado"
        ancho="lg"
        titulo="¿Comenzar Evaluación?"
        textoConfirmar="Sí, Comenzar"
        onConfirmar={confirmarInicioExamen}
        onCancelar={() => setModalConfirmarInicio({ abierto: false, registro: null })}
      >
        <p className="text-gray-600 text-base mb-3">Has seleccionado el examen:</p>
        <div className="bg-blue-50 border border-blue-100 text-blue-800 font-bold p-4 rounded-xl text-lg mb-8">
          📄 {modalConfirmarInicio.registro?.nombre_examen || modalConfirmarInicio.registro?.nombre_documento}
        </div>
        <p className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          ⚠️ Asegúrate de tener una conexión estable y tiempo suficiente. Una vez iniciado, el intento se registrará y no podrás pausarlo.
        </p>
      </Dialogo>

      <Dialogo
        abierto={modalAdvertenciaSalida}
        icono="warning"
        color="red"
        variante="alerta"
        ancho="md"
        overlayFuerte
        titulo="¡Alto ahí!"
        textoCancelar="No, Volver al Examen"
        onCancelar={() => setModalAdvertenciaSalida(false)}
        textoConfirmar="Sí, Salir y Perder Progreso"
        onConfirmar={salirDelExamen}
      >
        Si sales ahora, <strong className="text-red-700">tus respuestas no se guardarán</strong> y perderás tu progreso en este intento de evaluación. ¿Estás seguro de que quieres abandonar?
      </Dialogo>

      <Dialogo
        abierto={modalConfirmarEntrega}
        icono="send"
        color="green"
        variante="destacado"
        ancho="md"
        titulo="¿Entregar Evaluación?"
        textoConfirmar="Sí, Entregar"
        onConfirmar={confirmarEntregaExamen}
        onCancelar={() => setModalConfirmarEntrega(false)}
      >
        Una vez que entregues, el examen será calificado automáticamente y <strong className="text-gray-700">no podrás cambiar tus respuestas</strong>.
      </Dialogo>

      <Dialogo
        abierto={modalConfirmarReinicio}
        icono="replay"
        color="yellow"
        titulo="¿Intentar de nuevo?"
        textoConfirmar="Reintentar"
        onConfirmar={confirmarReinicio}
        onCancelar={() => setModalConfirmarReinicio(false)}
      >
        Se borrarán tus resultados actuales y empezarás desde cero.
      </Dialogo>

      {/* ========================================== */}
      {/* NAVBAR SUPERIOR MODULAR                  */}
      {/* ========================================== */}
      <Navbar 
        rol={rol}
        usuario={usuario}
        setVista={setVista}
        modoExamenActivo={modoExamenActivo}
        intentarSalirExamen={intentarSalirExamen}
        menuUsuarioAbierto={menuUsuarioAbierto}
        setMenuUsuarioAbierto={setMenuUsuarioAbierto}
        cerrarSesion={cerrarSesion}
      />

      {/* --- CONTENEDOR PRINCIPAL --- */}
      <div className={`flex flex-1 overflow-hidden mt-16 ${modoExamenActivo ? 'justify-center' : ''}`}>
        
        {/* ========================================== */}
        {/* SIDEBAR LATERAL IZQUIERDO MODULAR        */}
        {/* ========================================== */}
        <Sidebar 
          rol={rol}
          vista={vista}
          setVista={setVista}
          modoExamenActivo={modoExamenActivo}
          creditos={creditos}
        />

        <main className={`${modoExamenActivo ? 'ml-0 max-w-4xl' : 'ml-0 md:ml-64'} flex-1 overflow-y-auto p-8 bg-[#f8f9fa] dark:bg-gray-900 min-h-[calc(100vh-64px)] transition-all duration-300`}>
          <div className={`${modoExamenActivo ? 'w-full' : 'max-w-6xl'} mx-auto`}>

            {/* SECCIÓN DEL MERCADO COMUNITARIO (DASHBOARD DOCENTE) */}
            {vista === 'dashboard' && rol === 'docente' && (
              <VistaDashboard 
                clonarCuestionario={clonarDesdeComunidad}
              />
            )}

            {vista === 'clases' && (
              <div className="flex flex-col items-center justify-center pt-32 text-center bg-white p-16 rounded-3xl border border-gray-100 shadow-sm">
                <span className="material-symbols-outlined text-7xl text-gray-300 mb-5 animate-pulse">construction</span>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Sección en proceso</h2>
                <p className="text-gray-500 max-w-md">La gestión y creación de grupos llegará en las próximas actualizaciones de QuizAI.</p>
              </div>
            )}

            {/* VISTAS MODULARES */}
            {vista === 'nuevo' && rol === 'docente' && (
              <VistaCrearExamen {...generador} creditos={creditos} />
            )}

            {vista === 'historial' && rol === 'docente' && (
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
            )}

            {vista === 'perfil' && (
                <VistaPerfil />
            )}

            {vista === 'configuracion' && (
                <VistaConfiguracion usuario={usuario} />
            )}

            {vista === 'panel_estudiante' && rol === 'estudiante' && (
              <VistaPanelEstudiante 
                listaHistorial={historial.lista}
                cargandoHistorial={historial.cargando}
                intentarIniciarExamen={(registro) => setModalConfirmarInicio({ abierto: true, registro })}
              />
            )}

            {vista === 'examen' && examenActivo && (
              <VistaExamen
                rol={rol}
                examenActivo={examenActivo}
                modoEdicion={editor.modoEdicion}
                setModoEdicion={editor.setModoEdicion}
                setModalAlertaEdicion={setModalAlertaEdicion}
                examenTerminado={intento.terminado}
                calcularCalificacion={() => calcularCalificacion(examenActivo.preguntas_json, intento.respuestas)}
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
            )}


          </div>
        </main>
      </div>
    </div>
  );
}

export default EvaluacionesIA;