import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import VistaCrearExamen from '../components/dashboard/VistaCrearExamen'; 
import VistaHistorialDocente from '../components/dashboard/VistaHistorialDocente'; 
import VistaPanelEstudiante from '../components/dashboard/VistaPanelEstudiante';   

function EvaluacionesIA() {
  const navigate = useNavigate();

  // --- ESTADOS DE SESIÓN Y VISTAS ---
  const [rol, setRol] = useState(null);
  const [vista, setVista] = useState('inicio'); 
  const [listaHistorial, setListaHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  
  // Estados para UI general
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  
  // --- ESTADOS PARA MODALES (DOCENTE Y GENERAL) ---
  const [modalPublicar, setModalPublicar] = useState({ abierto: false, id: null });
  const [modalAlertaEdicion, setModalAlertaEdicion] = useState(false);

  // --- NUEVOS ESTADOS PARA MODALES (ESTUDIANTE) ---
  const [modalConfirmarInicio, setModalConfirmarInicio] = useState({ abierto: false, registro: null });
  const [modalAdvertenciaSalida, setModalAdvertenciaSalida] = useState(false);
  const [modalConfirmarEntrega, setModalConfirmarEntrega] = useState(false);

  // Estados del generador
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
      const usuario = JSON.parse(usuarioGuardado);
      setRol(usuario.rol);
      setVista(usuario.rol === 'docente' ? 'dashboard' : 'panel_estudiante');
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
    if (!archivo) return setError("⚠️ Selecciona un archivo PDF.");
    setCargando(true); setError(null);
    const usuario = JSON.parse(localStorage.getItem("usuarioQuizAI"));
    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("usuario_id", usuario.id); 
    formData.append("num_preguntas", numPreguntas);

    try {
      const respuesta = await fetch("https://backend-tesis-x187.onrender.com/api/generar-cuestionario", { method: "POST", body: formData });
      if (!respuesta.ok) throw new Error("Fallo en el servidor.");
      alert("✅ ¡Cuestionario generado! Ve a tu historial para publicarlo.");
      setArchivo(null);
      setVista('historial'); 
      cargarHistorial(); 
    } catch (err) { setError("❌ Error: " + err.message); } 
    finally { setCargando(false); }
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
  const eliminarExamen = async (id) => {
    if (!window.confirm("⚠️ ¿Eliminar para siempre?")) return;
    try {
      await fetch(`https://backend-tesis-x187.onrender.com/api/cuestionarios/${id}`, { method: 'DELETE' });
      cargarHistorial(); 
    } catch (err) { alert("Error al eliminar."); }
  };
  const exportarExamen = (registro) => {
    let contenido = `📝 EXAMEN: ${registro.nombre_documento}\nGenerado por QuizAI\n========================\n\n`;
    registro.preguntas_json.forEach((p, index) => {
      contenido += `${index + 1}. ${p.pregunta}\n`;
      p.opciones.forEach(op => { contenido += `   [  ] ${op}\n`; });
      contenido += `\n   ✅ CLAVE: ${p.respuesta_correcta}\n   💡 Retroalimentación: ${p.justificacion_pedagogica}\n------------------------\n\n`;
    });
    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url; enlace.download = `Clave_${registro.nombre_documento}.txt`;
    document.body.appendChild(enlace); enlace.click(); document.body.removeChild(enlace);
  };

  // --- LÓGICA DE EDICIÓN ---
  const actualizarPregunta = (i, c, v) => { let ex = {...examenActivo}; ex.preguntas_json[i][c] = v; setExamenActivo(ex); };
  const actualizarOpcion = (qi, oi, v) => { let ex = {...examenActivo}; ex.preguntas_json[qi].opciones[oi] = v; setExamenActivo(ex); };
  const agregarPreguntaVacia = () => { let ex = {...examenActivo}; ex.preguntas_json.push({pregunta: "Nueva pregunta...", opciones: ["Opción 1", "Opción 2", "Opción 3", "Opción 4"], respuesta_correcta: "Opción 1", justificacion_pedagogica: "..."}); setExamenActivo(ex); };
  const eliminarPregunta = (index) => { if (!window.confirm("¿Borrar?")) return; let ex = {...examenActivo}; ex.preguntas_json.splice(index, 1); setExamenActivo(ex); };
  const guardarEdicionEnBackend = async () => {
    try {
      await fetch(`https://backend-tesis-x187.onrender.com/api/cuestionarios/${examenActivo.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ preguntas_json: examenActivo.preguntas_json }) });
      alert("✅ ¡Cambios guardados!"); setModoEdicion(false); cargarHistorial(); 
    } catch (error) { alert("❌ " + error.message); }
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
  
  const calcularCalificacion = () => { 
    let c = 0; 
    examenActivo.preguntas_json.forEach((p, i) => { if (respuestasUsuario[i] === p.respuesta_correcta) c++; }); 
    return c; 
  };

  const intentarEntregarEvaluacion = () => {
    if (Object.keys(respuestasUsuario).length < examenActivo.preguntas_json.length) {
      alert("⚠️ Por favor responde todas las preguntas antes de entregar.");
      return;
    }
    setModalConfirmarEntrega(true);
  };

  const confirmarEntregaExamen = () => {
    setExamenTerminado(true);
    setModalConfirmarEntrega(false);
    // Hace scroll suave hacia arriba para ver la calificación
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const modoExamenActivo = vista === 'examen' && examenActivo && !examenTerminado && rol === 'estudiante';

  // ==========================================
  // RENDERIZADO DE LA INTERFAZ
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
      {/* ZONA DE MODALES (DOCENTE)       */ }
      {/* ========================================== */}
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
      {/* ZONA DE MODALES (ESTUDIANTE)       */ }
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
              📄 {modalConfirmarInicio.registro.nombre_documento}
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

      {/* --- MODAL CONFIRMAR ENTREGA --- */}
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

      {/* ========================================== */}
      {/* ZONA DE INTERFAZ (NAVBAR)       */ }
      {/* ========================================== */}
      <nav className={`fixed top-0 left-0 right-0 h-16 ${modoExamenActivo ? 'bg-white' : 'bg-white/90 backdrop-blur-md'} z-50 flex items-center justify-between px-8 ${modoExamenActivo ? 'border-none' : 'border-b border-gray-200'}`}>
        <div className="flex items-center gap-8">
          <span 
            className={`text-2xl font-extrabold text-blue-700 tracking-tight cursor-pointer ${modoExamenActivo ? 'select-none' : ''}`}
            onClick={modoExamenActivo ? intentarSalirExamen : () => setVista(rol === 'docente' ? 'dashboard' : 'panel_estudiante')}
          >
            QuizAI
          </span>
        </div>

        {!modoExamenActivo && (
          <div className="flex items-center gap-5">
            <button className="text-gray-500 hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-none flex items-center justify-center p-2 rounded-full hover:bg-gray-100">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="text-gray-500 hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-none flex items-center justify-center p-2 rounded-full hover:bg-gray-100">
              <span className="material-symbols-outlined">help</span>
            </button>

            <div className="relative">
              <img 
                onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${JSON.parse(localStorage.getItem("usuarioQuizAI"))?.nombre || "Felix"}`}
                alt="Avatar" 
                className="w-9 h-9 rounded-full cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all object-cover bg-blue-100"
              />

              {menuUsuarioAbierto && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden">
                  <button className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium cursor-pointer flex items-center gap-3 border-none bg-transparent">
                    <span className="material-symbols-outlined text-lg">person</span> Ver perfil
                  </button>
                  <button className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium cursor-pointer flex items-center gap-3 border-none bg-transparent">
                    <span className="material-symbols-outlined text-lg">settings</span> Configuración
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button onClick={cerrarSesion} className="w-full text-left px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-bold cursor-pointer flex items-center gap-3 border-none bg-transparent">
                    <span className="material-symbols-outlined text-lg">logout</span> Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* --- CONTENEDOR PRINCIPAL --- */}
      <div className={`flex flex-1 overflow-hidden mt-16 ${modoExamenActivo ? 'justify-center' : ''}`}>
        
        {!modoExamenActivo && (
          <aside className="fixed left-0 top-16 bottom-0 w-64 bg-gray-50 p-4 flex flex-col z-40 border-r border-gray-200 hidden md:flex">
            <div className="flex flex-col gap-1 mt-4">
              {rol === 'docente' ? (
                <>
                  <button onClick={() => setVista('dashboard')} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all cursor-pointer border-none text-left ${vista === 'dashboard' ? 'bg-white text-blue-700 shadow-sm font-bold' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}>
                    <span className="material-symbols-outlined">dashboard</span> Dashboard
                  </button>
                  <button onClick={() => setVista('nuevo')} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all cursor-pointer border-none text-left ${vista === 'nuevo' ? 'bg-white text-blue-700 shadow-sm font-bold' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}>
                    <span className="material-symbols-outlined">add_circle</span> Crear Cuestionario
                  </button>
                  <button onClick={() => setVista('historial')} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all cursor-pointer border-none text-left ${vista === 'historial' ? 'bg-white text-blue-700 shadow-sm font-bold' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}>
                    <span className="material-symbols-outlined">quiz</span> Historial de Exámenes
                  </button>
                  <button onClick={() => setVista('clases')} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all cursor-pointer border-none text-left ${vista === 'clases' ? 'bg-white text-blue-700 shadow-sm font-bold' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}>
                    <span className="material-symbols-outlined">school</span> Clases
                  </button>
                </>
              ) : (
                <button onClick={() => setVista('panel_estudiante')} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all cursor-pointer border-none text-left ${vista === 'panel_estudiante' ? 'bg-white text-blue-700 shadow-sm font-bold' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}>
                  <span className="material-symbols-outlined">school</span> Mis Evaluaciones
                </button>
              )}
            </div>
          </aside>
        )}

        <main className={`${modoExamenActivo ? 'ml-0 max-w-4xl' : 'ml-0 md:ml-64'} flex-1 overflow-y-auto p-8 bg-[#f8f9fa] min-h-[calc(100vh-64px)] transition-all`}>
          <div className={`${modoExamenActivo ? 'w-full' : 'max-w-6xl'} mx-auto`}>

            {vista === 'dashboard' && (
              <div className="flex flex-col items-center justify-center pt-32 text-center bg-white p-16 rounded-3xl border border-gray-100 shadow-sm">
                <span className="material-symbols-outlined text-7xl text-gray-300 mb-5 animate-pulse">construction</span>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Sección en proceso</h2>
                <p className="text-gray-500 max-w-md">Esta sección de analíticas se encuentra en desarrollo. Próximamente podrás ver las métricas de tus clases aquí.</p>
              </div>
            )}

            {vista === 'clases' && (
              <div className="flex flex-col items-center justify-center pt-32 text-center bg-white p-16 rounded-3xl border border-gray-100 shadow-sm">
                <span className="material-symbols-outlined text-7xl text-gray-300 mb-5 animate-pulse">construction</span>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Sección en proceso</h2>
                <p className="text-gray-500 max-w-md">La gestión y creación de grupos llegará en las próximas actualizaciones de QuizAI.</p>
              </div>
            )}

            {/* VISTA 2: CREAR EXAMEN (DOCENTE) */}
            {vista === 'nuevo' && rol === 'docente' && (
              <VistaCrearExamen 
                numPreguntas={numPreguntas}
                setNumPreguntas={setNumPreguntas}
                setArchivo={setArchivo}
                generarCuestionario={generarCuestionario}
                cargando={cargando}
                error={error}
              />
            )}

            {/* VISTA 3: HISTORIAL DEL DOCENTE */}
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
              />
            )}

            {/* VISTA 4: PANEL DEL ESTUDIANTE */}
            {vista === 'panel_estudiante' && rol === 'estudiante' && (
              <VistaPanelEstudiante 
                listaHistorial={listaHistorial}
                cargandoHistorial={cargandoHistorial}
                intentarIniciarExamen={intentarIniciarExamen}
              />
            )}

            {vista === 'examen' && examenActivo && (
              <div className={`text-left ${modoExamenActivo ? 'bg-transparent' : 'bg-white p-10 rounded-3xl shadow-sm border border-gray-200'}`}>
                
                {/* CABECERA DINÁMICA */}
                {!modoExamenActivo && (
                  <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
                    <div>
                      <span className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-1 block">
                        {modoEdicion ? '✏️ Modo Edición (Docente)' : '👁️ Vista Previa del Docente'}
                      </span>
                      <h2 className="text-3xl font-extrabold text-gray-900 m-0">{examenActivo.nombre_documento}</h2>
                    </div>
                    
                    {/* BOTÓN DE EDITAR (SÓLO VISIBLE PARA EL DOCENTE) */}
                    {rol === 'docente' && !modoEdicion && (
                      <button 
                        onClick={() => {
                          if (examenActivo.publicado) {
                            setModalAlertaEdicion(true);
                          } else {
                            setModoEdicion(true); 
                          }
                        }} 
                        className={`flex items-center gap-2 py-2.5 px-5 font-bold border rounded-xl cursor-pointer transition-colors shadow-sm outline-none ${examenActivo.publicado ? 'bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200' : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border-yellow-200'}`}
                      >
                        <span className="material-symbols-outlined text-[21px]">{examenActivo.publicado ? 'lock' : 'edit'}</span> 
                        {examenActivo.publicado ? 'Edición Bloqueada' : 'Editar Cuestionario'}
                      </button>
                    )}
                  </div>
                )}

                {/* RETROALIMENTACIÓN FINAL */}
                {examenTerminado && (
                  <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 mb-10">
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                      <div>
                        <div className="flex items-center gap-2 text-blue-600 mb-3">
                          <span className="text-xs font-bold uppercase tracking-wider">Resultados Obtenidos</span>
                          <span className="material-symbols-outlined text-xs">chevron_right</span>
                          <span className="text-xs font-bold uppercase tracking-wider">Retroalimentación IA</span>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 m-0">{examenActivo.nombre_documento}</h1>
                        <p className="text-gray-500 mt-2.5 max-w-lg">Revisa tus aciertos, errores y la retroalimentación basada en el material de estudio proporcionado.</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest block mb-1">Tu Puntuación</span>
                        <div className='flex items-end justify-end gap-1.5'>
                          <span className="text-6xl font-extrabold text-blue-700 leading-none">{calcularCalificacion()}</span>
                          <span className="text-3xl font-extrabold text-blue-200 pb-1">/ {examenActivo.preguntas_json.length}</span>
                        </div>
                      </div>
                    </header>
                  </div>
                )}


                {/* RENDERIZADO DE PREGUNTAS */}
                {examenActivo.preguntas_json.map((pregunta, index) => {
                  const respuestaUsuarioElegida = respuestasUsuario[index];
                  const esCorrectaUsuario = respuestaUsuarioElegida === pregunta.respuesta_correcta;

                  return (
                    <div 
                      key={index} 
                      className={`
                        border rounded-2xl mb-8 group transition-all relative
                        ${modoExamenActivo ? 'bg-gray-50 border-gray-200 p-8' : ''}
                        ${!examenTerminado && !modoExamenActivo ? 'bg-white p-8 border-gray-200' : ''}
                        ${modoEdicion ? 'border-yellow-200 border-2 border-dashed' : ''}
                        ${!modoEdicion && !modoExamenActivo && rol === 'docente' ? 'bg-white border-dashed border-2 p-8' : ''}
                        ${examenTerminado && esCorrectaUsuario ? 'border-green-300 bg-green-50/20 p-8 shadow-sm' : ''}
                        ${examenTerminado && !esCorrectaUsuario ? 'border-red-300 bg-red-50/20 p-8 shadow-sm' : ''}
                      `}
                    >
                      
                      {modoEdicion && (
                        <button onClick={() => eliminarPregunta(index)} className="absolute top-4 right-4 bg-white text-red-500 hover:bg-red-50 hover:text-red-600 border border-red-200 rounded-lg p-2 cursor-pointer font-bold shadow-sm transition-colors opacity-0 group-hover:opacity-100 outline-none"><span className="material-symbols-outlined">delete</span></button>
                      )}

                      {/* PREGUNTA */}
                      <div className="mb-4">
                        {modoEdicion ? (
                          <textarea value={pregunta.pregunta} onChange={(e) => actualizarPregunta(index, 'pregunta', e.target.value)} className="w-full p-4 mt-3 rounded-xl border border-gray-300 font-bold text-lg outline-none focus:ring-2 focus:ring-blue-500 resize-y bg-white text-gray-800" rows="2" />
                        ) : (
                          <h3 className={`mt-4 text-xl font-bold ${examenTerminado && !esCorrectaUsuario ? 'text-red-900' : examenTerminado && esCorrectaUsuario ? 'text-green-950' : 'text-gray-800'} leading-relaxed`}><span className={`${examenTerminado && !esCorrectaUsuario ? 'text-red-600' : examenTerminado && esCorrectaUsuario ? 'text-green-600' : 'text-blue-600'} mr-2`}>{index + 1}.</span> {pregunta.pregunta}</h3>
                        )}
                      </div>
                      
                      {/* OPCIONES */}
                      <div className="flex flex-col gap-3 mt-6">
                        {pregunta.opciones.map((opcion, i) => {
                          const esCorrectaOpcion = opcion === pregunta.respuesta_correcta;
                          const esElegidaPorUsuario = respuestaUsuarioElegida === opcion;
                          
                          let bgClass = 'bg-white hover:bg-blue-50'; 
                          let borderClass = 'border-gray-300'; 
                          let textClass = 'text-gray-700';
                          let iconOpcion = null;

                          if (examenTerminado && rol === 'estudiante') {
                            bgClass = 'bg-white';
                            if (esCorrectaOpcion) {
                              bgClass = 'bg-green-100'; borderClass = 'border-green-400'; textClass = 'text-green-900 font-bold';
                              iconOpcion = <span className="material-symbols-outlined text-green-600 text-2xl">check_circle</span>;
                            } else if (esElegidaPorUsuario && !esCorrectaOpcion) {
                              bgClass = 'bg-red-100'; borderClass = 'border-red-400'; textClass = 'text-red-900 font-bold';
                              iconOpcion = <span className="material-symbols-outlined text-red-600 text-2xl">cancel</span>;
                            } else {
                              bgClass = 'bg-white opacity-60'; textClass = 'text-gray-500';
                            }
                          } 
                          else if ((rol === 'docente' || modoEdicion) && !modoExamenActivo) {
                            if (esCorrectaOpcion) {
                              bgClass = 'bg-green-50 border-green-500 text-green-800 font-bold';
                              iconOpcion = <span className="material-symbols-outlined text-green-500">check_circle</span>;
                            }
                          }
                          else if (modoExamenActivo) {
                             if (esElegidaPorUsuario) {
                              bgClass = 'bg-blue-100 border-blue-500 text-blue-900 font-bold';
                              iconOpcion = <span className="material-symbols-outlined text-blue-600">radio_button_checked</span>;
                             } else {
                              bgClass = 'bg-white border-gray-300 hover:border-blue-300 hover:bg-blue-50';
                              iconOpcion = <span className="material-symbols-outlined text-gray-300 group-hover:text-blue-400">radio_button_unchecked</span>;
                             }
                          }

                          return (
                            <div key={i} className="flex gap-3 items-center group/opt">
                               {modoEdicion ? (
                                 <div className="flex w-full gap-3 items-center p-2 rounded-xl bg-white border border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                                   <input type="radio" name={`correcta-${index}`} checked={pregunta.respuesta_correcta === opcion} onChange={() => actualizarPregunta(index, 'respuesta_correcta', opcion)} className="w-5 h-5 ml-2 cursor-pointer accent-green-600" title="Marcar como correcta"/>
                                   <input type="text" value={opcion} onChange={(e) => actualizarOpcion(index, i, e.target.value)} className={`flex-1 p-2 border-none outline-none bg-transparent ${pregunta.respuesta_correcta === opcion ? 'font-bold text-green-700' : 'text-gray-700'}`}/>
                                   {pregunta.respuesta_correcta === opcion && <span className="material-symbols-outlined text-green-500 mr-2">check_circle</span>}
                                 </div>
                               ) : (
                                 <button 
                                  onClick={() => { if (rol !== 'docente') seleccionarOpcion(index, opcion) }} 
                                  className={`w-full text-left p-4 ${bgClass} border-2 ${borderClass} rounded-xl ${textClass} transition-all ${(!examenTerminado && rol !== 'docente') ? 'hover:border-blue-400 hover:bg-blue-50 cursor-pointer shadow-sm' : 'cursor-default'} flex items-center justify-between outline-none group-opt/btn`}
                                  disabled={examenTerminado || rol === 'docente'}
                                  >
                                   <span>{opcion}</span>
                                   {iconOpcion}
                                 </button>
                               )}
                            </div>
                          )
                        })}
                      </div>

                      {/* JUSTIFICACIÓN (ESTUDIANTE) */}
                      {(examenTerminado && rol === 'estudiante') && (
                        <div className={`mt-7 p-6 bg-white rounded-2xl border-l-4 shadow-inner ${esCorrectaUsuario ? 'border-green-500 border border-gray-100 bg-green-50/10' : 'border-red-500 border border-gray-100 bg-red-50/10'}`}>
                          <strong className={`flex items-center gap-2 mb-3 font-bold text-base ${esCorrectaUsuario ? 'text-green-900' : 'text-red-900'}`}>
                            <span className="material-symbols-outlined text-[20px]">{esCorrectaUsuario ? 'check_circle' : 'cancel'}</span> 
                            {esCorrectaUsuario ? 'Excelente acierto' : 'Respuesta incorrecta'}
                          </strong>
                          <div className={`text-sm leading-relaxed p-4 rounded-xl ${esCorrectaUsuario ? 'bg-white text-green-900 border border-green-100' : 'bg-white text-red-900 border border-red-100'}`}>
                            <p className='m-0'><strong className='block mb-1 text-gray-800'>Tu respuesta:</strong> "{respuestaUsuarioElegida}" {esCorrectaUsuario ? '' : <><span className='text-red-500'>(Incorrecta)</span>. La respuesta correcta es "{pregunta.respuesta_correcta}".</>}</p>
                            <p className='m-0 mt-3 pt-3 border-t border-gray-100'>💡 <strong>Retroalimentación:</strong> {pregunta.justificacion_pedagogica}</p>
                          </div>
                        </div>
                      )}

                      {/* JUSTIFICACIÓN (DOCENTE) */}
                      {(rol === 'docente' || modoEdicion) && (
                        <div className={`mt-6 p-5 bg-white rounded-xl border-dashed border ${modoEdicion ? 'border-yellow-300 bg-yellow-50/50' : 'border-blue-200 bg-blue-50/30'}`}>
                          {modoEdicion ? (
                             <>
                               <strong className="flex items-center gap-2 text-gray-700 mb-2 font-bold"><span className="material-symbols-outlined text-[18px]">lightbulb</span> Retroalimentación:</strong>
                               <textarea value={pregunta.justificacion_pedagogica} onChange={(e) => actualizarPregunta(index, 'justificacion_pedagogica', e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 text-gray-700 resize-y" rows="2" />
                             </>
                          ) : (
                             <p className="m-0 text-sm text-gray-700 leading-relaxed flex items-start gap-2">
                               <span className="material-symbols-outlined text-yellow-500">lightbulb</span> 
                               <span><strong>Retroalimentación Docente (Clave):</strong> {pregunta.justificacion_pedagogica}</span>
                             </p>
                          )}
                        </div>
                      )}

                    </div>
                  )
                })}

                {modoEdicion && (
                  <div className="flex justify-center mb-10 border-2 border-dashed border-gray-300 rounded-2xl p-6 bg-gray-50">
                     <button onClick={agregarPreguntaVacia} className="flex items-center gap-2 py-3 px-6 bg-white text-gray-700 font-bold border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-sm outline-none">
                       <span className="material-symbols-outlined">add</span> Añadir Nueva Pregunta
                     </button>
                  </div>
                )}

                {/* --- BOTONERA INFERIOR --- */}
                {rol === 'docente' ? (
                    modoEdicion ? (
                      <div className="flex gap-4 pt-6 border-t border-gray-100">
                         <button onClick={() => setModoEdicion(false)} className="flex-1 py-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-bold rounded-xl cursor-pointer transition-colors outline-none">Cancelar Edición</button>
                         <button onClick={guardarEdicionEnBackend} className="flex-[2] flex items-center justify-center gap-2 py-4 bg-green-600 hover:bg-green-700 text-white font-bold border-none rounded-xl cursor-pointer shadow-md transition-colors w-full outline-none"><span className="material-symbols-outlined">save</span> Guardar Cambios en Base de Datos</button>
                      </div>
                    ) : (
                      <button onClick={() => setVista('historial')} className="w-full mt-4 flex justify-center items-center gap-2 py-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold rounded-xl cursor-pointer transition-colors outline-none">
                        <span className="material-symbols-outlined">arrow_back</span> Regresar al Historial
                      </button>
                    )
                ) : (
                    rol === 'estudiante' && (
                      !examenTerminado ? (
                        <button onClick={intentarEntregarEvaluacion} disabled={Object.keys(respuestasUsuario).length < examenActivo.preguntas_json.length} className={`w-full mt-4 py-4 text-xl font-extrabold text-white border-none rounded-xl shadow-md transition-all flex justify-center items-center gap-2 outline-none ${Object.keys(respuestasUsuario).length < examenActivo.preguntas_json.length ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-green-600 hover:bg-green-700 cursor-pointer'}`}>
                          <span className="material-symbols-outlined">send</span> Entregar Evaluación
                        </button>
                      ) : (
                        <button onClick={salirDelExamen} className="w-full mt-10 flex justify-center items-center gap-2 py-4.5 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl cursor-pointer shadow-md transition-colors outline-none text-xl">
                          <span className="material-symbols-outlined">home</span> Volver al Panel de Evaluaciones
                        </button>
                      )
                    )
                )}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

export default EvaluacionesIA;