import * as api from '../api/cuestionarios';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useSesion } from '../context/sesion';

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
  const { usuario, rol, creditos, cerrarSesion: terminarSesion, actualizarUsuario, refrescarCreditos } = useSesion();

  // --- ESTADOS DE VISTAS ---
  const [vista, setVista] = useState(rol === 'docente' ? 'dashboard' : 'panel_estudiante');
  const [listaHistorial, setListaHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  
  // Estados para UI general
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  
  // --- ESTADOS PARA MODALES (DOCENTE Y GENERAL) ---
  const [modalPublicar, setModalPublicar] = useState({ abierto: false, id: null });
  const [modalAlertaEdicion, setModalAlertaEdicion] = useState(false);

  const [modalInfo, setModalInfo] = useState({ abierto: false, titulo: '', mensaje: '', tipo: 'exito' });
  const [modalConfirmarEliminar, setModalConfirmarEliminar] = useState({ abierto: false, id: null });
  const [modalConfirmarEliminarPregunta, setModalConfirmarEliminarPregunta] = useState({ abierto: false, index: null });

  // --- ESTADOS PARA MODALES (ESTUDIANTE) ---
  const [modalConfirmarInicio, setModalConfirmarInicio] = useState({ abierto: false, registro: null });
  const [modalAdvertenciaSalida, setModalAdvertenciaSalida] = useState(false);
  const [modalConfirmarEntrega, setModalConfirmarEntrega] = useState(false);
  const [modalConfirmarReinicio, setModalConfirmarReinicio] = useState(false);

  // Estados del generador
  const [nombreExamen, setNombreExamen] = useState(''); 
  const [materia, setMateria] = useState(''); 
  const [archivo, setArchivo] = useState(null);
  const [numPreguntas, setNumPreguntas] = useState(5);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Estados del Examen
  const [examenActivo, setExamenActivo] = useState(null);
  const [respuestasUsuario, setRespuestasUsuario] = useState({});
  const [examenTerminado, setExamenTerminado] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  // --- EFECTOS ---
  // Los créditos se regeneran cada día en el backend: el docente consulta su saldo
  // real al entrar (dashboard) y al abrir el generador, en lugar de confiar en el valor guardado.
  // (No en todas las vistas: VistaPerfil recarga su formulario cuando cambia el usuario.)
  useEffect(() => {
    if (rol === 'docente' && (vista === 'dashboard' || vista === 'nuevo')) refrescarCreditos();
  }, [rol, vista, refrescarCreditos]);

  const usuarioId = usuario?.id;

  const cargarHistorial = useCallback(async () => {
    if (!usuarioId) return;
    setCargandoHistorial(true);
    try {
      setListaHistorial(await api.listarCuestionarios(usuarioId, rol));
    } catch {
      setListaHistorial([]);
    } finally {
      setCargandoHistorial(false);
    }
  }, [usuarioId, rol]);

  useEffect(() => {
    if (vista === 'historial' || vista === 'panel_estudiante') {
      cargarHistorial();
    }
  }, [vista, cargarHistorial]);

  const cerrarSesion = () => {
    navigate('/');
    terminarSesion();
    setExamenActivo(null);
    setMenuUsuarioAbierto(false);
  };

  // --- LÓGICA DEL DOCENTE ---
  const generarCuestionario = async () => {
    if (!nombreExamen.trim()) { 
      setModalInfo({ abierto: true, titulo: 'Atención', mensaje: 'Por favor, dale un título a tu examen.', tipo: 'warning' });
      return;
    }
    if (!materia) { 
      setModalInfo({ abierto: true, titulo: 'Atención', mensaje: 'Por favor, selecciona una materia.', tipo: 'warning' });
      return;
    }
    if (!archivo) {
      setModalInfo({ abierto: true, titulo: 'Atención', mensaje: 'Por favor, selecciona un archivo PDF primero.', tipo: 'warning' });
      return;
    }
    setCargando(true); setError(null);

    try {
      // Si el backend responde con error (p. ej. créditos agotados), api lanza su 'detail'
      const resultado = await api.generarCuestionario({ archivo, usuarioId: usuario.id, numPreguntas, nombreExamen, materia });

      setModalInfo({ abierto: true, titulo: '¡Cuestionario Generado!', mensaje: 'La IA ha procesado el PDF. Ve a tu historial para revisarlo y publicarlo.', tipo: 'exito' });

      // El backend devuelve el saldo restante; si no viene, descontamos uno localmente
      actualizarUsuario({ creditos_disponibles: resultado?.creditos_disponibles ?? creditos - 1 });

      setNombreExamen(''); 
      setMateria('');
      setArchivo(null);
      setVista('historial'); 
      cargarHistorial(); 
      
    } catch (err) {
      // 403 = créditos agotados: sincronizamos el saldo para que el formulario se bloquee
      if (err.status === 403) refrescarCreditos();
      // MOSTRAMOS EL MENSAJE DINÁMICO EN EL MODAL
      setModalInfo({
        abierto: true, 
        titulo: err.message.includes('créditos') ? 'Créditos Agotados' : 'Error en la Generación', 
        mensaje: err.message, 
        tipo: err.message.includes('créditos') ? 'warning' : 'error' 
      });
    } finally { 
      setCargando(false); 
    }
  };

  const abrirModalPublicar = (id) => { setModalPublicar({ abierto: true, id: id }); };
  const confirmarPublicacion = async () => {
    const id = modalPublicar.id;
    setModalPublicar({ abierto: false, id: null });
    try {
      await api.publicarCuestionario(id);
      cargarHistorial();
    } catch (err) {
      setModalInfo({ abierto: true, titulo: 'No se pudo publicar', mensaje: err.message, tipo: 'error' });
    }
  };

  const despublicarCuestionario = async (id) => {
    try {
      await api.despublicarCuestionario(id);
      cargarHistorial();
    } catch (err) {
      setModalInfo({ abierto: true, titulo: 'No se pudo ocultar', mensaje: err.message, tipo: 'error' });
    }
  };

  const eliminarExamen = (id) => {
    setModalConfirmarEliminar({ abierto: true, id: id });
  };

  const confirmarEliminacionExamen = async () => {
    const id = modalConfirmarEliminar.id;
    setModalConfirmarEliminar({ abierto: false, id: null });
    try {
      await api.eliminarCuestionario(id);
      cargarHistorial();
      setModalInfo({ abierto: true, titulo: 'Examen Eliminado', mensaje: 'El examen fue borrado permanentemente de tu historial.', tipo: 'exito' });
    } catch (err) {
      setModalInfo({ abierto: true, titulo: 'No se pudo eliminar el examen', mensaje: err.message, tipo: 'error' });
    }
  };

  const exportarExamen = (registro) => {
    const titulo = registro.nombre_examen || registro.nombre_documento;
    let contenido = `📝 EXAMEN: ${titulo}\nGenerado por QuizAI\n========================\n\n`;
    registro.preguntas_json.forEach((p, index) => {
      contenido += `${index + 1}. ${p.pregunta}\n`;
      p.opciones.forEach(op => { contenido += `   [  ] ${op}\n`; });
      const valor = p.puntuacion || 1; // Exportamos con el valor de los puntos
      contenido += `\n   ✅ CLAVE: ${p.respuesta_correcta}\n   💎 Valor: ${valor} puntos\n   💡 Retroalimentación: ${p.justificacion_pedagogica}\n------------------------\n\n`;
    });
    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url; enlace.download = `Clave_${titulo}.txt`;
    document.body.appendChild(enlace); enlace.click(); document.body.removeChild(enlace);
  };

  // --- LÓGICA DE EDICIÓN Y CLONADO COMUNITARIO ---
  const actualizarPregunta = (i, c, v) => { let ex = {...examenActivo}; ex.preguntas_json[i][c] = v; setExamenActivo(ex); };
  const actualizarOpcion = (qi, oi, v) => { let ex = {...examenActivo}; ex.preguntas_json[qi].opciones[oi] = v; setExamenActivo(ex); };
  
  // MODIFICADO: Agregamos el campo "puntuacion: 1" por defecto al crear una nueva pregunta manualmente
  const agregarPreguntaVacia = () => { 
    let ex = {...examenActivo}; 
    ex.preguntas_json.push({
      pregunta: "Nueva pregunta...", 
      opciones: ["Opción 1", "Opción 2", "Opción 3", "Opción 4"], 
      respuesta_correcta: "Opción 1", 
      justificacion_pedagogica: "...",
      puntuacion: 1
    }); 
    setExamenActivo(ex); 
  };
  
  const eliminarPregunta = (index) => { 
    setModalConfirmarEliminarPregunta({ abierto: true, index: index });
  };
  const confirmarEliminarPregunta = () => {
    let ex = {...examenActivo}; 
    ex.preguntas_json.splice(modalConfirmarEliminarPregunta.index, 1); 
    setExamenActivo(ex);
    setModalConfirmarEliminarPregunta({ abierto: false, index: null });
  }

  const guardarEdicionEnBackend = async () => {
    try {
      await api.actualizarPreguntas(examenActivo.id, examenActivo.preguntas_json);
      setModalInfo({ abierto: true, titulo: '¡Cambios Guardados!', mensaje: 'El examen se ha actualizado correctamente.', tipo: 'exito' });
      setModoEdicion(false); 
      cargarHistorial(); 
    } catch (error) { 
      setModalInfo({ abierto: true, titulo: 'Error al Guardar', mensaje: error.message, tipo: 'error' });
    }
  };

  const compartirEnComunidad = async (id) => {
    try {
      await api.compartirCuestionario(id);
      setModalInfo({
        abierto: true,
        titulo: '¡Examen Compartido!',
        mensaje: 'Tu evaluación ahora está disponible en el Mercado Comunitario. ¡Gracias por aportar a otros docentes!',
        tipo: 'exito'
      });
      cargarHistorial();
    } catch (err) {
      setModalInfo({ abierto: true, titulo: 'No se pudo compartir en la comunidad', mensaje: err.message, tipo: 'error' });
    }
  };

  const clonarCuestionarioDelDashboard = async (cuestionarioSeleccionado) => {
    if (!usuario) return;
    setCargandoHistorial(true);

    try {
      await api.clonarCuestionario(cuestionarioSeleccionado.id, usuario.id);
      setModalInfo({
        abierto: true,
        titulo: '¡Examen Guardado!',
        mensaje: `Se ha creado una copia en tu historial personal con el sufijo (Copia). Ya puedes modificarlo libremente.`,
        tipo: 'exito'
      });
      setVista('historial');
      cargarHistorial();
    } catch (err) {
      setModalInfo({ abierto: true, titulo: 'Error al clonar', mensaje: err.message, tipo: 'error' });
    } finally {
      setCargandoHistorial(false);
    }
  };

  // --- LÓGICA DE VISTA PREVIA (DOCENTE) ---
  const iniciarExamen = (registro) => {
    setExamenActivo(registro); 
    setRespuestasUsuario({}); 
    setExamenTerminado(false); 
    setModoEdicion(false);
    setVista('examen'); 
  };

  // --- LÓGICA DEL ESTUDIANTE ---
  const intentarIniciarExamen = (registro) => {
    setModalConfirmarInicio({ abierto: true, registro: registro });
  };

  const confirmarInicioExamen = () => {
    const registro = modalConfirmarInicio.registro;
    setExamenActivo(registro); 
    setRespuestasUsuario({}); 
    setExamenTerminado(false); 
    setModoEdicion(false);
    setModalConfirmarInicio({ abierto: false, registro: null });
    setVista('examen'); 
  };

  const intentarSalirExamen = () => {
    if (examenTerminado) {
      salirDelExamen();
      return;
    }
    setModalAdvertenciaSalida(true);
  };

  const salirDelExamen = () => {
    setModalAdvertenciaSalida(false);
    setExamenActivo(null);
    setRespuestasUsuario({});
    setVista(rol === 'docente' ? 'historial' : 'panel_estudiante');
  };

  const seleccionarOpcion = (pi, op) => { if (!examenTerminado) setRespuestasUsuario({ ...respuestasUsuario, [pi]: op }); };
  
  // MODIFICADO: Ahora el cálculo suma la puntuación de cada reactivo en lugar de contar de 1 en 1.
  const calcularCalificacion = () => { 
    let obtenido = 0;
    let total = 0;
    examenActivo.preguntas_json.forEach((p, i) => { 
      const valorPuntos = Number(p.puntuacion) || 1; // Si no tiene puntos asignados, vale 1
      total += valorPuntos;
      if (respuestasUsuario[i] === p.respuesta_correcta) {
        obtenido += valorPuntos;
      }
    }); 
    return { obtenido, total }; // Devuelve un objeto con lo que sacó vs lo que valía el examen
  };

  const intentarEntregarEvaluacion = () => {
    if (Object.keys(respuestasUsuario).length < examenActivo.preguntas_json.length) {
      setModalInfo({ abierto: true, titulo: 'Evaluación Incompleta', mensaje: 'Por favor responde todas las preguntas antes de entregar tu examen.', tipo: 'warning' });
      return;
    }
    setModalConfirmarEntrega(true);
  };

  const confirmarEntregaExamen = () => {
    setExamenTerminado(true);
    setModalConfirmarEntrega(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reiniciarExamen = () => {
    setModalConfirmarReinicio(true);
  };
  const confirmarReinicio = () => {
    setRespuestasUsuario({});
    setExamenTerminado(false);
    setModalConfirmarReinicio(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const modoExamenActivo = vista === 'examen' && examenActivo && !examenTerminado && rol === 'estudiante';

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
                clonarCuestionario={clonarCuestionarioDelDashboard} 
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
              <VistaCrearExamen 
                nombreExamen={nombreExamen}         
                setNombreExamen={setNombreExamen}
                materia={materia}                   
                setMateria={setMateria}             
                numPreguntas={numPreguntas}
                setNumPreguntas={setNumPreguntas}
                archivo={archivo}
                setArchivo={setArchivo}
                generarCuestionario={generarCuestionario}
                cargando={cargando}
                error={error}
                creditos={creditos}
              />
            )}

            {vista === 'historial' && rol === 'docente' && (
              <VistaHistorialDocente 
                listaHistorial={listaHistorial}
                cargandoHistorial={cargandoHistorial}
                setVista={setVista}
                iniciarExamen={iniciarExamen}
                exportarExamen={exportarExamen}
                despublicarCuestionario={despublicarCuestionario}
                abrirModalPublicar={abrirModalPublicar}
                eliminarExamen={eliminarExamen}
                compartirEnComunidad={compartirEnComunidad} 
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
                listaHistorial={listaHistorial}
                cargandoHistorial={cargandoHistorial}
                intentarIniciarExamen={intentarIniciarExamen}
              />
            )}

            {vista === 'examen' && examenActivo && (
              <VistaExamen 
                rol={rol}
                examenActivo={examenActivo}
                modoEdicion={modoEdicion}
                setModoEdicion={setModoEdicion}
                setModalAlertaEdicion={setModalAlertaEdicion}
                examenTerminado={examenTerminado}
                calcularCalificacion={calcularCalificacion}
                respuestasUsuario={respuestasUsuario}
                eliminarPregunta={eliminarPregunta}
                actualizarPregunta={actualizarPregunta}
                actualizarOpcion={actualizarOpcion}
                seleccionarOpcion={seleccionarOpcion}
                agregarPreguntaVacia={agregarPreguntaVacia}
                guardarEdicionEnBackend={guardarEdicionEnBackend}
                setVista={setVista}
                intentarEntregarEvaluacion={intentarEntregarEvaluacion}
                salirDelExamen={salirDelExamen}
                modoExamenActivo={modoExamenActivo}
                reiniciarExamen={reiniciarExamen}
              />
            )}


          </div>
        </main>
      </div>
    </div>
  );
}

export default EvaluacionesIA;