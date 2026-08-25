import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

function EvaluacionesIA() {
  const navigate = useNavigate();

  // --- ESTADOS DE SESIÓN Y VISTAS ---
  const [usuario, setUsuario] = useState(null);
  const [rol, setRol] = useState(null);
  const [creditos, setCreditos] = useState(0);
  const [vista, setVista] = useState('inicio'); 
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

  // --- EFECTOS INICIALES ---
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuarioQuizAI");
    if (usuarioGuardado) {
      // 1. Extraemos los datos y los metemos en una variable limpia
      const datosUsuario = JSON.parse(usuarioGuardado);
      
      // 2. Repartimos la información en todos los estados de React
      setUsuario(datosUsuario);
      setRol(datosUsuario.rol);
      setCreditos(datosUsuario.creditos_disponibles || 0);
      setVista(datosUsuario.rol === 'docente' ? 'dashboard' : 'panel_estudiante');
    }
  }, []);

  useEffect(() => {
    if (vista === 'historial' || vista === 'panel_estudiante') {
      cargarHistorial();
    }
  }, [vista]);

  const cerrarSesion = () => {
    localStorage.removeItem("usuarioQuizAI"); 
    navigate('/'); 
    setRol(null); 
    setUsuario(null);
    setExamenActivo(null); 
    setMenuUsuarioAbierto(false);
  };

  const cargarHistorial = async () => {
    setCargandoHistorial(true);
    try {
      const usuarioString = localStorage.getItem("usuarioQuizAI");
      if (!usuarioString) return;
      const usuario = JSON.parse(usuarioString);
      
      const url = `https://backend-tesis-x187.onrender.com/api/cuestionarios?usuario_id=${usuario.id}&rol=${usuario.rol}`;
      const respuesta = await fetch(url);
      if (!respuesta.ok) throw new Error("Fallo en servidor");
      const resultado = await respuesta.json();
      setListaHistorial(resultado.data || []); 
    } catch (err) {
      setListaHistorial([]);
    } finally {
      setCargandoHistorial(false);
    }
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
    const usuario = JSON.parse(localStorage.getItem("usuarioQuizAI"));
    const formData = new FormData();
    formData.append("nombre_examen", nombreExamen); 
    formData.append("materia", materia); 
    formData.append("archivo", archivo);
    formData.append("usuario_id", usuario.id); 
    formData.append("num_preguntas", numPreguntas);

    try {
      const respuesta = await fetch("https://backend-tesis-x187.onrender.com/api/generar-cuestionario", { method: "POST", body: formData });
      
      // --- ESTA ES LA MAGIA QUE LEE EL ERROR DEL BACKEND ---
      if (!respuesta.ok) {
        const errorData = await respuesta.json().catch(() => ({}));
        // Si el backend mandó un 'detail' (como el de los créditos), lo usamos. Si no, usamos un genérico.
        throw new Error(errorData.detail || "Fallo en el servidor al conectar con la IA.");
      }
      // -----------------------------------------------------

      setModalInfo({ abierto: true, titulo: '¡Cuestionario Generado!', mensaje: 'La IA ha procesado el PDF. Ve a tu historial para revisarlo y publicarlo.', tipo: 'exito' });
      
      // ACTUALIZAMOS LOS CRÉDITOS EN MEMORIA
      const nuevosCreditos = creditos - 1;
      setCreditos(nuevosCreditos);
      usuario.creditos_disponibles = nuevosCreditos;
      localStorage.setItem("usuarioQuizAI", JSON.stringify(usuario));

      setNombreExamen(''); 
      setMateria('');
      setArchivo(null);
      setVista('historial'); 
      cargarHistorial(); 
      
    } catch (err) { 
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
    try {
      await fetch(`https://backend-tesis-x187.onrender.com/api/cuestionarios/${modalPublicar.id}/publicar`, { method: "PUT" });
      setModalPublicar({ abierto: false, id: null });
      cargarHistorial(); 
    } catch (err) { console.error(err); }
  };
  
  const despublicarCuestionario = async (id) => {
    try {
      await fetch(`https://backend-tesis-x187.onrender.com/api/cuestionarios/${id}/despublicar`, { method: "PUT" });
      cargarHistorial(); 
    } catch (err) { console.error(err); }
  };

  const eliminarExamen = (id) => {
    setModalConfirmarEliminar({ abierto: true, id: id });
  };

  const confirmarEliminacionExamen = async () => {
    const id = modalConfirmarEliminar.id;
    setModalConfirmarEliminar({ abierto: false, id: null });
    try {
      await fetch(`https://backend-tesis-x187.onrender.com/api/cuestionarios/${id}`, { method: 'DELETE' });
      cargarHistorial(); 
      setModalInfo({ abierto: true, titulo: 'Examen Eliminado', mensaje: 'El examen fue borrado permanentemente de tu historial.', tipo: 'exito' });
    } catch (err) { 
      setModalInfo({ abierto: true, titulo: 'Error', mensaje: 'No se pudo eliminar el examen.', tipo: 'error' });
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
      await fetch(`https://backend-tesis-x187.onrender.com/api/cuestionarios/${examenActivo.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ preguntas_json: examenActivo.preguntas_json }) });
      setModalInfo({ abierto: true, titulo: '¡Cambios Guardados!', mensaje: 'El examen se ha actualizado correctamente.', tipo: 'exito' });
      setModoEdicion(false); 
      cargarHistorial(); 
    } catch (error) { 
      setModalInfo({ abierto: true, titulo: 'Error al Guardar', mensaje: error.message, tipo: 'error' });
    }
  };

  const compartirEnComunidad = async (id) => {
    try {
      const respuesta = await fetch(`https://backend-tesis-x187.onrender.com/api/cuestionarios/${id}/compartir`, { method: "PUT" });
      if (respuesta.ok) {
        setModalInfo({ 
          abierto: true, 
          titulo: '¡Examen Compartido!', 
          mensaje: 'Tu evaluación ahora está disponible en el Mercado Comunitario. ¡Gracias por aportar a otros docentes!', 
          tipo: 'exito' 
        });
        cargarHistorial(); 
      }
    } catch (error) {
      console.error(error);
      setModalInfo({ abierto: true, titulo: 'Error', mensaje: 'No se pudo compartir en la comunidad.', tipo: 'error' });
    }
  };

  const clonarCuestionarioDelDashboard = async (cuestionarioSeleccionado) => {
    setCargandoHistorial(true);
    const usuarioString = localStorage.getItem("usuarioQuizAI");
    if (!usuarioString) return;
    const usuario = JSON.parse(usuarioString);

    try {
      const respuesta = await fetch(`https://backend-tesis-x187.onrender.com/api/cuestionarios/${cuestionarioSeleccionado.id}/clonar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario_id: usuario.id })
      });

      if (respuesta.ok) {
        setModalInfo({ 
          abierto: true, 
          titulo: '¡Examen Guardado!', 
          mensaje: `Se ha creado una copia en tu historial personal con el sufijo (Copia). Ya puedes modificarlo libremente.`, 
          tipo: 'exito' 
        });
        setVista('historial');
        cargarHistorial();
      } else {
        throw new Error("No se pudo clonar el recurso comunitario.");
      }
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

  if (!rol) {
    return (
      <div className="max-w-xl mx-auto mt-24 text-center font-sans">
        <h1 className="text-4xl font-extrabold text-blue-700 mb-4">🧠 QuizAI</h1>
        <p className="text-gray-500 mb-10">Selecciona tu perfil para ingresar a la plataforma</p>
        <div className="flex gap-6 justify-center">
          <button onClick={() => { setRol('docente'); setVista('dashboard'); }} className="p-8 text-xl w-52 cursor-pointer bg-gray-800 text-white border-none rounded-2xl shadow-lg hover:bg-gray-700 transition-colors">👨‍🏫 Soy Docente</button>
          <button onClick={() => { setRol('estudiante'); setVista('panel_estudiante'); }} className="p-8 text-xl w-52 cursor-pointer bg-blue-600 text-white border-none rounded-2xl shadow-lg hover:bg-blue-700 transition-colors">🎓 Soy Estudiante</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${modoExamenActivo ? 'bg-white' : 'bg-[#f8f9fa]'} flex flex-col font-sans text-gray-800 relative`}>
      
      {/* ========================================== */}
      {/* ZONA DE MODALES (DOCENTE Y GENERAL)        */}
      {/* ========================================== */}
      
      {modalInfo.abierto && (
        <div className="fixed inset-0 z-[120] bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center overflow-hidden transform transition-all border border-gray-100">
            <div className={`flex items-center justify-center w-16 h-16 mx-auto rounded-full mb-4 ${
              modalInfo.tipo === 'exito' ? 'bg-green-100 text-green-600' : 
              modalInfo.tipo === 'error' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
            }`}>
              <span className="material-symbols-outlined text-4xl">
                {modalInfo.tipo === 'exito' ? 'check_circle' : modalInfo.tipo === 'error' ? 'error' : 'warning'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{modalInfo.titulo}</h3>
            <p className="text-gray-500 mb-6 text-sm">{modalInfo.mensaje}</p>
            <button onClick={() => setModalInfo({ abierto: false, titulo: '', mensaje: '', tipo: 'exito' })} className={`w-full py-3 text-white font-bold rounded-xl cursor-pointer transition-colors border-none outline-none ${
              modalInfo.tipo === 'exito' ? 'bg-green-600 hover:bg-green-700' : 
              modalInfo.tipo === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-500 hover:bg-yellow-600'
            }`}>
              Entendido
            </button>
          </div>
        </div>
      )}

      {modalConfirmarEliminar.abierto && (
        <div className="fixed inset-0 z-[120] bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 overflow-hidden transform transition-all border border-gray-100">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
              <span className="material-symbols-outlined text-red-600 text-3xl">delete_forever</span>
            </div>
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">¿Eliminar Examen?</h3>
            <p className="text-center text-gray-500 mb-8">Esta acción borrará el examen para siempre de tu historial. <strong className="text-gray-700">No se puede deshacer.</strong></p>
            <div className="flex gap-3">
              <button onClick={() => setModalConfirmarEliminar({ abierto: false, id: null })} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl cursor-pointer transition-colors border-none outline-none">Cancelar</button>
              <button onClick={confirmarEliminacionExamen} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl cursor-pointer transition-colors shadow-md border-none outline-none">Sí, Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {modalConfirmarEliminarPregunta.abierto && (
        <div className="fixed inset-0 z-[120] bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center overflow-hidden transform transition-all border border-gray-100">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
              <span className="material-symbols-outlined text-red-600 text-3xl">remove_selection</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Borrar Pregunta?</h3>
            <p className="text-gray-500 mb-6 text-sm">Esta pregunta será removida del cuestionario actual.</p>
            <div className="flex gap-3">
              <button onClick={() => setModalConfirmarEliminarPregunta({ abierto: false, index: null })} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl cursor-pointer transition-colors border-none outline-none">Cancelar</button>
              <button onClick={confirmarEliminarPregunta} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl cursor-pointer transition-colors border-none outline-none">Borrar</button>
            </div>
          </div>
        </div>
      )}

      {modalPublicar.abierto && (
        <div className="fixed inset-0 z-[100] bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 overflow-hidden transform transition-all border border-gray-100">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full mb-4">
              <span className="material-symbols-outlined text-blue-600 text-2xl">rocket_launch</span>
            </div>
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">¿Publicar Evaluación?</h3>
            <p className="text-center text-gray-500 mb-8">Una vez publicado, este cuestionario será visible para tus estudiantes y <strong className="text-gray-700">no podrá ser editado</strong> mientras esté en vivo.</p>
            <div className="flex gap-3">
              <button onClick={() => setModalPublicar({ abierto: false, id: null })} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl cursor-pointer transition-colors border-none outline-none">Cancelar</button>
              <button onClick={confirmarPublicacion} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer transition-colors shadow-md border-none outline-none">Sí, Publicar</button>
            </div>
          </div>
        </div>
      )}

      {modalAlertaEdicion && (
        <div className="fixed inset-0 z-[100] bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center overflow-hidden transform transition-all border border-gray-100">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-yellow-100 rounded-full mb-4">
              <span className="material-symbols-outlined text-yellow-600 text-3xl">lock</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Examen Bloqueado</h3>
            <p className="text-gray-500 mb-6 text-sm">No puedes editar un cuestionario que ya está publicado. Para hacer cambios, primero debes <strong className="text-gray-700">Ocultarlo</strong> desde tu Historial.</p>
            <button onClick={() => setModalAlertaEdicion(false)} className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl cursor-pointer transition-colors border-none outline-none">Entendido</button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* ZONA DE MODALES (ESTUDIANTE)               */}
      {/* ========================================== */}
      
      {modalConfirmarInicio.abierto && modalConfirmarInicio.registro && (
        <div className="fixed inset-0 z-[100] bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-10 overflow-hidden transform transition-all border border-gray-100">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-100 rounded-full mb-6">
              <span className="material-symbols-outlined text-blue-600 text-3xl">play_circle</span>
            </div>
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">¿Comenzar Evaluación?</h3>
            <p className="text-center text-gray-600 mb-3">Has seleccionado el examen:</p>
            <div className="bg-blue-50 border border-blue-100 text-blue-800 font-bold p-4 rounded-xl text-center text-lg mb-8">
              📄 {modalConfirmarInicio.registro.nombre_examen || modalConfirmarInicio.registro.nombre_documento}
            </div>
            <p className="text-center text-gray-500 mb-8 text-sm bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              ⚠️ Asegúrate de tener una conexión estable y tiempo suficiente. Una vez iniciado, el intento se registrará y no podrás pausarlo.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setModalConfirmarInicio({ abierto: false, registro: null })} className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl cursor-pointer transition-colors border-none outline-none">
                Cancelar
              </button>
              <button onClick={confirmarInicioExamen} className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer transition-colors shadow-lg shadow-blue-500/30 border-none outline-none">
                Sí, Comenzar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalAdvertenciaSalida && (
        <div className="fixed inset-0 z-[110] bg-gray-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-10 text-center overflow-hidden transform transition-all border border-gray-100">
            <div className="flex items-center justify-center w-20 h-20 mx-auto bg-red-100 rounded-full mb-6">
              <span className="material-symbols-outlined text-red-600 text-5xl">warning</span>
            </div>
            <h3 className="text-3xl font-extrabold text-gray-900 mb-3">¡Alto ahí!</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Si sales ahora, <strong className="text-red-700">tus respuestas no se guardarán</strong> y perderás tu progreso en este intento de evaluación. ¿Estás seguro de que quieres abandonar?
            </p>
            <div className="flex gap-4 flex-col">
              <button onClick={() => setModalAdvertenciaSalida(false)} className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-2xl cursor-pointer transition-colors border-none outline-none text-lg">
                No, Volver al Examen
              </button>
              <button onClick={salirDelExamen} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl cursor-pointer transition-colors shadow-md border-none outline-none text-lg">
                Sí, Salir y Perder Progreso
              </button>
            </div>
          </div>
        </div>
      )}

      {modalConfirmarEntrega && (
        <div className="fixed inset-0 z-[100] bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-10 text-center overflow-hidden transform transition-all border border-gray-100">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full mb-6">
              <span className="material-symbols-outlined text-green-600 text-3xl">send</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">¿Entregar Evaluación?</h3>
            <p className="text-gray-500 mb-8 text-sm">
              Una vez que entregues, el examen será calificado automáticamente y <strong className="text-gray-700">no podrás cambiar tus respuestas</strong>.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setModalConfirmarEntrega(false)} className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl cursor-pointer transition-colors border-none outline-none">
                Cancelar
              </button>
              <button onClick={confirmarEntregaExamen} className="flex-1 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl cursor-pointer transition-colors shadow-lg shadow-green-500/30 border-none outline-none">
                Sí, Entregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REINICIAR EXAMEN (Si aplica) */}
      {modalConfirmarReinicio && (
        <div className="fixed inset-0 z-[120] bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center overflow-hidden transform transition-all border border-gray-100">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-yellow-100 rounded-full mb-4">
              <span className="material-symbols-outlined text-yellow-600 text-3xl">replay</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Intentar de nuevo?</h3>
            <p className="text-gray-500 mb-6 text-sm">Se borrarán tus resultados actuales y empezarás desde cero.</p>
            <div className="flex gap-3">
              <button onClick={() => setModalConfirmarReinicio(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl cursor-pointer transition-colors border-none outline-none">Cancelar</button>
              <button onClick={confirmarReinicio} className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl cursor-pointer transition-colors border-none outline-none">Reintentar</button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* NAVBAR SUPERIOR MODULAR                  */}
      {/* ========================================== */}
      <Navbar 
        rol={rol}
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

        <main className={`${modoExamenActivo ? 'ml-0 max-w-4xl' : 'ml-0 md:ml-64'} flex-1 overflow-y-auto p-8 bg-[#f8f9fa] min-h-[calc(100vh-64px)] transition-all`}>
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
                <VistaPerfil usuario={usuario} setUsuario={setUsuario} />
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