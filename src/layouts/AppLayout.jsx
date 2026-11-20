import React, { useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation, useBlocker, Navigate, Outlet } from 'react-router-dom';
import { useSesion } from '../context/sesion';
import { RUTAS, rutaExamen, vistaDesdeRuta } from '../rutas';

// --- LÓGICA (hooks y utilidades) ---
import { useHistorial } from '../hooks/useHistorial';
import { useEditorExamen } from '../hooks/useEditorExamen';
import { useIntentoExamen } from '../hooks/useIntentoExamen';
import { useGenerador } from '../hooks/useGenerador';
import { todasRespondidas } from '../utils/calificar';

// --- COMPONENTES ---
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Dialogo from '../components/ui/Dialogo';

/**
 * Estructura de la sección privada (/app): Navbar + Sidebar + modales + <Outlet>.
 * Mantiene el estado compartido entre rutas (historial, examen abierto, borrador del generador)
 * y lo pasa a cada ruta con el contexto del Outlet (ver pages/app/rutas.jsx).
 */
function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- SESIÓN (compartida por toda la app) ---
  const { usuario, rol, creditos, cerrarSesion: terminarSesion } = useSesion();

  // --- NAVEGACIÓN ---
  // Navbar, Sidebar y VistaHistorialDocente trabajan con nombres de vista; aquí se traducen a URLs.
  const vista = vistaDesdeRuta(location.pathname);
  const setVista = useCallback((nombre) => navigate(RUTAS[nombre]), [navigate]);
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
  const historial = useHistorial({ usuarioId: usuario?.id, notificar });
  const editor = useEditorExamen({ notificar, onGuardado: historial.cargar });
  const intento = useIntentoExamen();
  const generador = useGenerador({ notificar, onGenerado: () => navigate(RUTAS.historial) });

  const examenActivo = editor.examen;
  const modoExamenActivo = vista === 'examen' && !!examenActivo && !intento.terminado && rol === 'estudiante';

  // --- PROTECCIÓN DEL EXAMEN ---
  // Si el estudiante intenta salir a mitad del examen (botón Atrás, enlaces, etc.)
  // la navegación se detiene y aparece el modal "¡Alto ahí!".
  const saliendoDelExamen = useRef(false);
  const bloqueo = useBlocker(({ currentLocation, nextLocation }) =>
    modoExamenActivo && !saliendoDelExamen.current && currentLocation.pathname !== nextLocation.pathname
  );
  const salidaBloqueada = bloqueo.state === 'blocked';

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
    if (await historial.clonar(cuestionario)) navigate(RUTAS.historial);
  };

  // --- EDICIÓN (DOCENTE) ---
  const confirmarEliminarPregunta = () => {
    editor.eliminarPregunta(modalConfirmarEliminarPregunta.index);
    setModalConfirmarEliminarPregunta({ abierto: false, index: null });
  };

  // --- ABRIR Y CERRAR UN EXAMEN ---
  const abrirExamen = (registro) => {
    saliendoDelExamen.current = false;
    editor.abrir(registro);
    intento.reiniciar();
    navigate(rutaExamen(registro.id));
  };

  const confirmarInicioExamen = () => {
    abrirExamen(modalConfirmarInicio.registro);
    setModalConfirmarInicio({ abierto: false, registro: null });
  };

  // El examen se queda en memoria al salir: la ruta ya no lo muestra y se reemplaza al abrir otro.
  const salirDelExamen = () => {
    saliendoDelExamen.current = true; // esta salida es intencional: no la bloquees
    setModalAdvertenciaSalida(false);
    navigate(rol === 'docente' ? RUTAS.historial : RUTAS.panel_estudiante);
  };

  const intentarSalirExamen = () => {
    if (intento.terminado) salirDelExamen();
    else setModalAdvertenciaSalida(true);
  };

  const confirmarSalida = () => {
    if (salidaBloqueada) {
      // Iba a otra parte (p. ej. botón Atrás): lo dejamos continuar
      saliendoDelExamen.current = true;
      setModalAdvertenciaSalida(false);
      bloqueo.proceed();
    } else {
      salirDelExamen();
    }
  };

  const cancelarSalida = () => {
    setModalAdvertenciaSalida(false);
    if (salidaBloqueada) bloqueo.reset();
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
  // RENDERIZADO
  // ==========================================

  // Sin sesión no hay nada que mostrar: de vuelta a la página de inicio para iniciar sesión
  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  // Lo que cada ruta necesita del layout (se lee con useOutletContext)
  const contextoRutas = {
    setVista, historial, editor, intento, generador, modoExamenActivo,
    abrirExamen, salirDelExamen, clonarDesdeComunidad, intentarEntregarEvaluacion,
    setModalPublicar, setModalConfirmarEliminar, setModalConfirmarEliminarPregunta,
    setModalAlertaEdicion, setModalConfirmarInicio, setModalConfirmarReinicio,
  };

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
        abierto={modalAdvertenciaSalida || salidaBloqueada}
        icono="warning"
        color="red"
        variante="alerta"
        ancho="md"
        overlayFuerte
        titulo="¡Alto ahí!"
        textoCancelar="No, Volver al Examen"
        onCancelar={cancelarSalida}
        textoConfirmar="Sí, Salir y Perder Progreso"
        onConfirmar={confirmarSalida}
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
      {/* NAVBAR SUPERIOR                            */}
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
        {/* SIDEBAR LATERAL IZQUIERDO                  */}
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
            {/* La vista de la ruta actual (ver pages/app/rutas.jsx) */}
            <Outlet context={contextoRutas} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
