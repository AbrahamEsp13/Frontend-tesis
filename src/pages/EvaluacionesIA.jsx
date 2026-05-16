import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';

import VistaCrearExamen from '../components/dashboard/VistaCrearExamen'; 
import VistaHistorialDocente from '../components/dashboard/VistaHistorialDocente'; 
import VistaPanelEstudiante from '../components/dashboard/VistaPanelEstudiante';
import VistaExamen from '../components/dashboard/VistaExamen';

function EvaluacionesIA() {
  const navigate = useNavigate();

  const [rol, setRol] = useState(null);
  const [vista, setVista] = useState('inicio'); 
  const [listaHistorial, setListaHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  
  // Modales de control de UI
  const [modalPublicar, setModalPublicar] = useState({ abierto: false, id: null });
  const [modalAlertaEdicion, setModalAlertaEdicion] = useState(false);
  const [modalInfo, setModalInfo] = useState({ abierto: false, titulo: '', mensaje: '', tipo: 'exito' });
  const [modalConfirmarEliminar, setModalConfirmarEliminar] = useState({ abierto: false, id: null });
  const [modalConfirmarEliminarPregunta, setModalConfirmarEliminarPregunta] = useState({ abierto: false, index: null });
  const [modalConfirmarInicio, setModalConfirmarInicio] = useState({ abierto: false, registro: null });
  const [modalAdvertenciaSalida, setModalAdvertenciaSalida] = useState(false);
  const [modalConfirmarEntrega, setModalConfirmarEntrega] = useState(false);
  const [modalConfirmarReinicio, setModalConfirmarReinicio] = useState(false);

  // Estados de los datos del cuestionario
  const [nombreExamen, setNombreExamen] = useState(''); // <-- NUEVO ESTADO
  const [archivo, setArchivo] = useState(null);
  const [numPreguntas, setNumPreguntas] = useState(5);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const [examenActivo, setExamenActivo] = useState(null);
  const [respuestasUsuario, setRespuestasUsuario] = useState({});
  const [examenTerminado, setExamenTerminado] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

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
    navigate('/'); setRol(null); setExamenActivo(null); setMenuUsuarioAbierto(false);
  };

  const cargarHistorial = async () => {
    setCargandoHistorial(true);
    try {
      const usuarioString = localStorage.getItem("usuarioQuizAI");
      if (!usuarioString) return;
      const usuario = JSON.parse(usuarioString);
      
      const url = `https://backend-tesis-x187.onrender.com/api/cuestionarios?usuario_id=${usuario.id}&rol=${usuario.rol}`;
      const respuesta = await fetch(url);
      const resultado = await respuesta.json();
      setListaHistorial(resultado.data || []); 
    } catch (err) {
      setListaHistorial([]);
    } finally {
      setCargandoHistorial(false);
    }
  };

  const generarCuestionario = async () => {
    if (!nombreExamen.trim()) {
      setModalInfo({ abierto: true, titulo: 'Atención', mensaje: 'Por favor, asigna un título al examen antes de continuar.', tipo: 'warning' });
      return;
    }
    if (!archivo) {
      setModalInfo({ abierto: true, titulo: 'Atención', mensaje: 'Por favor, selecciona un archivo PDF.', tipo: 'warning' });
      return;
    }

    setCargando(true); setError(null);
    const usuario = JSON.parse(localStorage.getItem("usuarioQuizAI"));
    const formData = new FormData();
    formData.append("nombre_examen", nombreExamen); // <-- ENVIAR NOMBRE
    formData.append("archivo", archivo);
    formData.append("usuario_id", usuario.id); 
    formData.append("num_preguntas", numPreguntas);

    try {
      const respuesta = await fetch("https://backend-tesis-x187.onrender.com/api/generar-cuestionario", { method: "POST", body: formData });
      if (!respuesta.ok) throw new Error("Error en el servidor backend.");
      
      setModalInfo({ abierto: true, titulo: '¡Éxito!', mensaje: 'Cuestionario generado correctamente.', tipo: 'exito' });
      setNombreExamen(''); 
      setArchivo(null);
      setVista('historial'); 
      cargarHistorial(); 
    } catch (err) { 
      setModalInfo({ abierto: true, titulo: 'Error', mensaje: err.message, tipo: 'error' });
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

  const eliminarExamen = (id) => { setModalConfirmarEliminar({ abierto: true, id: id }); };

  const confirmarEliminacionExamen = async () => {
    const id = modalConfirmarEliminar.id;
    setModalConfirmarEliminar({ abierto: false, id: null });
    try {
      await fetch(`https://backend-tesis-x187.onrender.com/api/cuestionarios/${id}`, { method: 'DELETE' });
      cargarHistorial(); 
      setModalInfo({ abierto: true, titulo: 'Examen Eliminado', mensaje: 'Eliminado correctamente de tu historial y base de datos.', tipo: 'exito' });
    } catch (err) { 
      setModalInfo({ abierto: true, titulo: 'Error', mensaje: 'No se pudo eliminar.', tipo: 'error' });
    }
  };

  const exportarExamen = (registro) => {
    let titulo = registro.nombre_examen || registro.nombre_documento;
    let contenido = `📝 EXAMEN: ${titulo}\nGenerado por QuizAI\n========================\n\n`;
    registro.preguntas_json.forEach((p, index) => {
      contenido += `${index + 1}. ${p.pregunta}\n`;
      p.opciones.forEach(op => { contenido += `   [  ] ${op}\n`; });
      contenido += `\n   ✅ CLAVE: ${p.respuesta_correcta}\n   💡 Retroalimentación: ${p.justificacion_pedagogica}\n------------------------\n\n`;
    });
    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url; enlace.download = `Clave_${titulo}.txt`;
    document.body.appendChild(enlace); enlace.click(); document.body.removeChild(enlace);
  };

  const actualizarPregunta = (i, c, v) => { let ex = {...examenActivo}; ex.preguntas_json[i][c] = v; setExamenActivo(ex); };
  const actualizarOpcion = (qi, oi, v) => { let ex = {...examenActivo}; ex.preguntas_json[qi].opciones[oi] = v; setExamenActivo(ex); };
  const agregarPreguntaVacia = () => { let ex = {...examenActivo}; ex.preguntas_json.push({pregunta: "Nueva pregunta...", opciones: ["Opción 1", "Opción 2", "Opción 3", "Opción 4"], respuesta_correcta: "Opción 1", justificacion_pedagogica: "..."}); setExamenActivo(ex); };
  
  const eliminarPregunta = (index) => { setModalConfirmarEliminarPregunta({ abierto: true, index: index }); };
  const confirmarEliminarPregunta = () => {
    let ex = {...examenActivo}; ex.preguntas_json.splice(modalConfirmarEliminarPregunta.index, 1); setExamenActivo(ex);
    setModalConfirmarEliminarPregunta({ abierto: false, index: null });
  }

  const guardarEdicionEnBackend = async () => {
    try {
      await fetch(`https://backend-tesis-x187.onrender.com/api/cuestionarios/${examenActivo.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ preguntas_json: examenActivo.preguntas_json }) });
      setModalInfo({ abierto: true, titulo: '¡Cambios Guardados!', mensaje: 'El examen se ha actualizado correctamente.', tipo: 'exito' });
      setModoEdicion(false); cargarHistorial(); 
    } catch (error) { 
      setModalInfo({ abierto: true, titulo: 'Error al Guardar', mensaje: error.message, tipo: 'error' });
    }
  };

  const iniciarExamen = (registro) => {
    setExamenActivo(registro); setRespuestasUsuario({}); setExamenTerminado(false); setModoEdicion(false); setVista('examen'); 
  };

  const intentarIniciarExamen = (registro) => { setModalConfirmarInicio({ abierto: true, registro: registro }); };
  const confirmarInicioExamen = () => {
    const registro = modalConfirmarInicio.registro;
    setExamenActivo(registro); setRespuestasUsuario({}); setExamenTerminado(false); setModoEdicion(false);
    setModalConfirmarInicio({ abierto: false, registro: null }); setVista('examen'); 
  };

  const intentarSalirExamen = () => { if (examenTerminado) { salirDelExamen(); return; } setModalAdvertenciaSalida(true); };
  const salirDelExamen = () => {
    setModalAdvertenciaSalida(false); setExamenActivo(null); setRespuestasUsuario({});
    setVista(rol === 'docente' ? 'historial' : 'panel_estudiante');
  };

  const seleccionarOpcion = (pi, op) => { if (!examenTerminado) setRespuestasUsuario({ ...respuestasUsuario, [pi]: op }); };
  const calcularCalificacion = () => { 
    let c = 0; examenActivo.preguntas_json.forEach((p, i) => { if (respuestasUsuario[i] === p.respuesta_correcta) c++; }); return c; 
  };

  const intentarEntregarEvaluacion = () => {
    if (Object.keys(respuestasUsuario).length < examenActivo.preguntas_json.length) {
      setModalInfo({ abierto: true, titulo: 'Evaluación Incompleta', mensaje: 'Por favor responde todas las preguntas antes de entregar tu examen.', tipo: 'warning' });
      return;
    }
    setModalConfirmarEntrega(true);
  };

  const confirmarEntregaExamen = () => {
    setExamenTerminado(true); setModalConfirmarEntrega(false); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reiniciarExamen = () => { setModalConfirmarReinicio(true); };
  const confirmarReinicio = () => {
    setRespuestasUsuario({}); setExamenTerminado(false); setModalConfirmarReinicio(false); window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const modoExamenActivo = vista === 'examen' && examenActivo && !examenTerminado && rol === 'estudiante';

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
      
      {/* --- RENDERIZADO DE TODOS LOS MODALES REUTILIZABLES --- */}
      {modalInfo.abierto && (
        <div className="fixed inset-0 z-[120] bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center border border-gray-100">
            <div className={`flex items-center justify-center w-16 h-16 mx-auto rounded-full mb-4 ${modalInfo.tipo === 'exito' ? 'bg-green-100 text-green-600' : modalInfo.tipo === 'error' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
              <span className="material-symbols-outlined text-4xl">{modalInfo.tipo === 'exito' ? 'check_circle' : modalInfo.tipo === 'error' ? 'error' : 'warning'}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{modalInfo.titulo}</h3>
            <p className="text-gray-500 mb-6 text-sm">{modalInfo.mensaje}</p>
            <button onClick={() => setModalInfo({ abierto: false, titulo: '', mensaje: '', tipo: 'exito' })} className={`w-full py-3 text-white font-bold rounded-xl cursor-pointer border-none ${modalInfo.tipo === 'exito' ? 'bg-green-600 hover:bg-green-700' : modalInfo.tipo === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-500 hover:bg-yellow-600'}`}>Entendido</button>
          </div>
        </div>
      )}

      {modalConfirmarEliminar.abierto && (
        <div className="fixed inset-0 z-[120] bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border border-gray-100">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
              <span className="material-symbols-outlined text-red-600 text-3xl">delete_forever</span>
            </div>
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">¿Eliminar Examen?</h3>
            <p className="text-center text-gray-500 mb-8">Esta acción borrará el examen permanentemente de tu base de datos de Neon. No se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setModalConfirmarEliminar({ abierto: false, id: null })} className="flex-1 py-3 bg-gray-100 text-gray-800 font-bold rounded-xl cursor-pointer border-none">Cancelar</button>
              <button onClick={confirmarEliminacionExamen} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl cursor-pointer border-none shadow-md">Sí, Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {modalConfirmarEliminarPregunta.abierto && (
        <div className="fixed inset-0 z-[120] bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center border border-gray-100">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
              <span className="material-symbols-outlined text-red-600 text-3xl">remove_selection</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Borrar Pregunta?</h3>
            <p className="text-gray-500 mb-6 text-sm">Esta pregunta será removida del cuestionario actual.</p>
            <div className="flex gap-3">
              <button onClick={() => setModalConfirmarEliminarPregunta({ abierto: false, index: null })} className="flex-1 py-3 bg-gray-100 text-gray-800 font-bold rounded-xl cursor-pointer border-none">Cancelar</button>
              <button onClick={confirmarEliminarPregunta} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl cursor-pointer border-none">Borrar</button>
            </div>
          </div>
        </div>
      )}

      {modalPublicar.abierto && (
        <div className="fixed inset-0 z-[100] bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border border-gray-100">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full mb-4">
              <span className="material-symbols-outlined text-blue-600 text-2xl">rocket_launch</span>
            </div>
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">¿Publicar Evaluación?</h3>
            <p className="text-center text-gray-500 mb-8">Los estudiantes podrán responderla en tiempo real y ver sus calificaciones.</p>
            <div className="flex gap-3">
              <button onClick={() => setModalPublicar({ abierto: false, id: null })} className="flex-1 py-3 bg-gray-100 text-gray-800 font-bold rounded-xl cursor-pointer border-none">Cancelar</button>
              <button onClick={confirmarPublicacion} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl cursor-pointer border-none shadow-md">Sí, Publicar</button>
            </div>
          </div>
        </div>
      )}

      {modalAlertaEdicion && (
        <div className="fixed inset-0 z-[100] bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center border border-gray-100">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-yellow-100 rounded-full mb-4">
              <span className="material-symbols-outlined text-yellow-600 text-3xl">lock</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Examen Publicado</h3>
            <p className="text-gray-500 mb-6 text-sm">Oculta primero el cuestionario a los alumnos para poder editar los reactivos.</p>
            <button onClick={() => setModalAlertaEdicion(false)} className="w-full py-3 bg-yellow-500 text-white font-bold rounded-xl cursor-pointer border-none">Entendido</button>
          </div>
        </div>
      )}

      {modalConfirmarInicio.abierto && modalConfirmarInicio.registro && (
        <div className="fixed inset-0 z-[100] bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-10 border border-gray-100">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-100 rounded-full mb-6">
              <span className="material-symbols-outlined text-blue-600 text-3xl">play_circle</span>
            </div>
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">¿Comenzar Evaluación?</h3>
            <p className="text-center text-gray-600 mb-3">Has seleccionado el examen:</p>
            <div className="bg-blue-50 border border-blue-100 text-blue-800 font-bold p-4 rounded-xl text-center text-lg mb-8">
              📄 {modalConfirmarInicio.registro.nombre_examen || modalConfirmarInicio.registro.nombre_documento}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setModalConfirmarInicio({ abierto: false, registro: null })} className="flex-1 py-3.5 bg-gray-100 text-gray-800 font-bold rounded-xl cursor-pointer border-none">Cancelar</button>
              <button onClick={confirmarInicioExamen} className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl cursor-pointer border-none shadow-lg shadow-blue-500/30">Sí, Comenzar</button>
            </div>
          </div>
        </div>
      )}

      {modalAdvertenciaSalida && (
        <div className="fixed inset-0 z-[110] bg-gray-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-10 text-center border border-gray-100">
            <div className="flex items-center justify-center w-20 h-20 mx-auto bg-red-100 rounded-full mb-6">
              <span className="material-symbols-outlined text-red-600 text-5xl">warning</span>
            </div>
            <h3 className="text-3xl font-extrabold text-gray-900 mb-3">Examen en Progreso</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">Si sales ahora, perderás las respuestas seleccionadas en este intento.</p>
            <div className="flex gap-4 flex-col">
              <button onClick={() => setModalAdvertenciaSalida(false)} className="w-full py-4 bg-gray-100 text-gray-800 font-bold rounded-2xl cursor-pointer border-none text-lg">Volver al Examen</button>
              <button onClick={salirDelExamen} className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl cursor-pointer border-none text-lg">Abandonar</button>
            </div>
          </div>
        </div>
      )}

      {modalConfirmarEntrega && (
        <div className="fixed inset-0 z-[100] bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-10 text-center border border-gray-100">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full mb-6">
              <span className="material-symbols-outlined text-green-600 text-3xl">send</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">¿Entregar Evaluación?</h3>
            <p className="text-gray-500 mb-8 text-sm">Se enviarán tus respuestas finales y recibirás tu retroalimentación guiada por IA.</p>
            <div className="flex gap-4">
              <button onClick={() => setModalConfirmarEntrega(false)} className="flex-1 py-3.5 bg-gray-100 text-gray-800 font-bold rounded-xl cursor-pointer border-none">Cancelar</button>
              <button onClick={confirmarEntregaExamen} className="flex-1 py-3.5 bg-green-600 text-white font-bold rounded-xl cursor-pointer border-none shadow-lg shadow-green-500/30">Sí, Entregar</button>
            </div>
          </div>
        </div>
      )}

      {modalConfirmarReinicio && (
        <div className="fixed inset-0 z-[120] bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center border border-gray-100">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-yellow-100 rounded-full mb-4">
              <span className="material-symbols-outlined text-yellow-600 text-3xl">replay</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Intentar de nuevo?</h3>
            <p className="text-gray-500 mb-6 text-sm">Reiniciarás las casillas del examen para resolverlo nuevamente.</p>
            <div className="flex gap-3">
              <button onClick={() => setModalConfirmarReinicio(false)} className="flex-1 py-3 bg-gray-100 text-gray-800 font-bold rounded-xl cursor-pointer border-none">Cancelar</button>
              <button onClick={confirmarReinicio} className="flex-1 py-3 bg-yellow-500 text-white font-bold rounded-xl cursor-pointer border-none">Reintentar</button>
            </div>
          </div>
        </div>
      )}

      <Navbar 
        rol={rol} setVista={setVista} modoExamenActivo={modoExamenActivo} intentarSalirExamen={intentarSalirExamen}
        menuUsuarioAbierto={menuUsuarioAbierto} setMenuUsuarioAbierto={setMenuUsuarioAbierto} cerrarSesion={cerrarSesion}
      />

      <div className={`flex flex-1 overflow-hidden mt-16 ${modoExamenActivo ? 'justify-center' : ''}`}>
        <Sidebar rol={rol} vista={vista} setVista={setVista} modoExamenActivo={modoExamenActivo} />

        <main className={`${modoExamenActivo ? 'ml-0 max-w-4xl' : 'ml-0 md:ml-64'} flex-1 overflow-y-auto p-8 bg-[#f8f9fa] min-h-[calc(100vh-64px)] transition-all`}>
          <div className={`${modoExamenActivo ? 'w-full' : 'max-w-6xl'} mx-auto`}>

            {vista === 'nuevo' && rol === 'docente' && (
              <VistaCrearExamen 
                nombreExamen={nombreExamen}         
                setNombreExamen={setNombreExamen}   
                numPreguntas={numPreguntas}
                setNumPreguntas={setNumPreguntas}
                setArchivo={setArchivo}
                generarCuestionario={generarCuestionario}
                cargando={cargando}
                error={error}
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
              />
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
                rol={rol} examenActivo={examenActivo} modoEdicion={modoEdicion} setModoEdicion={setModoEdicion}
                setModalAlertaEdicion={setModalAlertaEdicion} examenTerminado={examenTerminado} calcularCalificacion={calcularCalificacion}
                respuestasUsuario={respuestasUsuario} eliminarPregunta={eliminarPregunta} actualizarPregunta={actualizarPregunta}
                actualizarOpcion={actualizarOpcion} seleccionarOpcion={seleccionarOpcion} agregarPreguntaVacia={agregarPreguntaVacia}
                guardarEdicionEnBackend={guardarEdicionEnBackend} setVista={setVista} intentarEntregarEvaluacion={intentarEntregarEvaluacion}
                salirDelExamen={salirDelExamen} modoExamenActivo={modoExamenActivo} reiniciarExamen={reiniciarExamen}
              />
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

export default EvaluacionesIA;