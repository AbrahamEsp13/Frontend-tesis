import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function EvaluacionesIA() {
  const navigate = useNavigate();

  // --- ESTADOS DE SESIÓN Y VISTAS ---
  const [rol, setRol] = useState(null);
  const [vista, setVista] = useState('inicio'); 
  const [listaHistorial, setListaHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  
  // Estados para UI
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  
  // --- NUEVOS ESTADOS PARA MODALES ---
  const [modalPublicar, setModalPublicar] = useState({ abierto: false, id: null });
  const [modalAlertaEdicion, setModalAlertaEdicion] = useState(false);

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

  // Lógica actualizada para mostrar el Modal en vez de window.confirm
  const abrirModalPublicar = (id) => {
    setModalPublicar({ abierto: true, id: id });
  };

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
    let contenido = `📝 EXAMEN: ${registro.nombre_documento}\n========================\n\n`;
    registro.preguntas_json.forEach((p, index) => {
      contenido += `${index + 1}. ${p.pregunta}\n`;
      p.opciones.forEach(op => { contenido += `   [  ] ${op}\n`; });
      contenido += `\n   ✅ CLAVE: ${p.respuesta_correcta}\n   💡 Justificación: ${p.justificacion_pedagogica}\n------------------------\n\n`;
    });
    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url; enlace.download = `Clave_${registro.nombre_documento}.txt`;
    document.body.appendChild(enlace); enlace.click(); document.body.removeChild(enlace);
  };

  // --- LÓGICA DE EDICIÓN Y EXAMEN ---
  const actualizarPregunta = (i, c, v) => { let ex = {...examenActivo}; ex.preguntas_json[i][c] = v; setExamenActivo(ex); };
  const actualizarOpcion = (qi, oi, v) => { let ex = {...examenActivo}; ex.preguntas_json[qi].opciones[oi] = v; setExamenActivo(ex); };
  const agregarPreguntaVacia = () => { let ex = {...examenActivo}; ex.preguntas_json.push({pregunta: "Nueva pregunta...", opciones: ["Opción 1", "Opción 2", "Opción 3", "Opción 4"], respuesta_correcta: "Opción 1", justificacion_pedagogica: "...", nivel_bloom: "Recordar"}); setExamenActivo(ex); };
  const eliminarPregunta = (index) => { if (!window.confirm("¿Borrar?")) return; let ex = {...examenActivo}; ex.preguntas_json.splice(index, 1); setExamenActivo(ex); };
  const guardarEdicionEnBackend = async () => {
    try {
      await fetch(`https://backend-tesis-x187.onrender.com/api/cuestionarios/${examenActivo.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ preguntas_json: examenActivo.preguntas_json }) });
      alert("✅ ¡Cambios guardados!"); setModoEdicion(false); cargarHistorial(); 
    } catch (error) { alert("❌ " + error.message); }
  };

  const iniciarExamen = (registro) => { setExamenActivo(registro); setRespuestasUsuario({}); setExamenTerminado(false); setVista('examen'); };
  const seleccionarOpcion = (pi, op) => { if (!examenTerminado) setRespuestasUsuario({ ...respuestasUsuario, [pi]: op }); };
  const calcularCalificacion = () => { let c = 0; examenActivo.preguntas_json.forEach((p, i) => { if (respuestasUsuario[i] === p.respuesta_correcta) c++; }); return c; };


  // ==========================================
  // RENDERIZADO DE LA INTERFAZ
  // ==========================================

  // 1. PANTALLA DE SELECCIÓN DE ROL
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

  // 2. SHELL DE LA APLICACIÓN
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans text-gray-800 relative">
      
      {/* --- MODAL PARA PUBLICAR CUESTIONARIO --- */}
      {modalPublicar.abierto && (
        <div className="fixed inset-0 z-[100] bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative overflow-hidden transform transition-all">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full mb-4">
              <span className="material-symbols-outlined text-blue-600 text-2xl">rocket_launch</span>
            </div>
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">¿Publicar Evaluación?</h3>
            <p className="text-center text-gray-500 mb-8">
              Una vez publicado, este cuestionario será visible para tus estudiantes y <strong className="text-gray-700">no podrá ser editado</strong> mientras esté en vivo.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setModalPublicar({ abierto: false, id: null })} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl cursor-pointer transition-colors">
                Cancelar
              </button>
              <button onClick={confirmarPublicacion} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer transition-colors shadow-md">
                Sí, Publicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE ALERTA DE EDICIÓN --- */}
      {modalAlertaEdicion && (
        <div className="fixed inset-0 z-[100] bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 relative overflow-hidden transform transition-all text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-yellow-100 rounded-full mb-4">
              <span className="material-symbols-outlined text-yellow-600 text-3xl">lock</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Examen Bloqueado</h3>
            <p className="text-gray-500 mb-6 text-sm">
              No puedes editar un cuestionario que ya está publicado para los estudiantes. Para hacer cambios, primero debes <strong className="text-gray-700">Ocultarlo</strong> desde tu Panel de Control.
            </p>
            <button onClick={() => setModalAlertaEdicion(false)} className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl cursor-pointer transition-colors">
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* --- NAVBAR SUPERIOR --- */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md z-50 flex items-center justify-between px-8 border-b border-gray-200">
        <div className="flex items-center gap-8">
          <span className="text-2xl font-extrabold text-blue-700 tracking-tight cursor-pointer" onClick={() => setVista(rol === 'docente' ? 'dashboard' : 'panel_estudiante')}>
            QuizAI
          </span>
        </div>

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
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
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
      </nav>

      {/* --- CONTENEDOR PRINCIPAL --- */}
      <div className="flex flex-1 overflow-hidden mt-16">
        
        {/* SIDEBAR LATERAL IZQUIERDO */}
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

        {/* --- ÁREA DE CONTENIDO (MAIN) --- */}
        <main className="ml-0 md:ml-64 flex-1 overflow-y-auto p-8 bg-[#f8f9fa] min-h-[calc(100vh-64px)]">
          <div className="max-w-6xl mx-auto">

            {/* VISTA 1: DASHBOARD SIMPLIFICADO */}
            {vista === 'dashboard' && (
              <div className="flex flex-col items-center justify-center pt-32 text-center">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4 animate-pulse">construction</span>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Sección en proceso</h2>
                <p className="text-gray-500 max-w-md">Esta sección de analíticas se encuentra en desarrollo. Próximamente podrás ver las métricas de tus clases aquí.</p>
              </div>
            )}

            {/* VISTA: CLASES EN CONSTRUCCIÓN */}
            {vista === 'clases' && (
              <div className="flex flex-col items-center justify-center pt-32 text-center">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4 animate-pulse">construction</span>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Sección en proceso</h2>
                <p className="text-gray-500">La gestión de clases llegará en las próximas actualizaciones.</p>
              </div>
            )}

            {/* VISTA 2: CREAR EXAMEN (SÓLO DOCENTE) */}
            {vista === 'nuevo' && rol === 'docente' && (
              <div className="max-w-3xl">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Crear Nuevo Examen</h2>
                <p className="text-gray-500 mb-8">Sube tus apuntes, elige cuántas preguntas necesitas y la Inteligencia Artificial generará la evaluación.</p>
                
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                  <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <label className="flex items-center gap-2 font-bold mb-3 text-gray-800">
                      <span className="material-symbols-outlined text-blue-600">format_list_numbered</span>
                      Cantidad de preguntas:
                    </label>
                    <div className="flex items-center">
                      <input type="number" min="1" max="15" value={numPreguntas} onChange={(e) => setNumPreguntas(e.target.value)} className="p-3 rounded-lg border border-gray-300 w-24 text-lg outline-none focus:ring-2 focus:ring-blue-500 text-center font-bold text-gray-700" />
                      <span className="ml-3 text-gray-500 text-sm font-medium">reactivos (Máximo 15 recomendados)</span>
                    </div>
                  </div>
                  
                  <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <label className="flex items-center gap-2 font-bold mb-3 text-gray-800">
                      <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                      Documento Base (PDF):
                    </label>
                    <input type="file" accept=".pdf" onChange={(e) => setArchivo(e.target.files[0])} className="block w-full text-gray-600 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                  </div>
                  
                  <button onClick={generarCuestionario} disabled={cargando} className={`w-full py-4 px-6 text-lg font-bold text-white border-none rounded-xl shadow-md transition-all flex justify-center items-center gap-2 ${cargando ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'}`}>
                    {cargando ? <span className="material-symbols-outlined animate-spin">sync</span> : <span className="material-symbols-outlined">auto_awesome</span>}
                    {cargando ? "Analizando PDF e IA trabajando..." : "Generar Examen"}
                  </button>
                </div>
                {error && <div className="text-red-700 p-4 bg-red-50 rounded-lg mt-4 border border-red-200 flex items-center gap-2"><span className="material-symbols-outlined">error</span> {error}</div>}
              </div>
            )}

            {/* VISTA 3: HISTORIAL DEL DOCENTE */}
            {vista === 'historial' && rol === 'docente' && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">Historial de Exámenes</h2>
                    <p className="text-gray-500">Administra tus evaluaciones, edítalas y publícalas a tus estudiantes.</p>
                  </div>
                </div>

                {cargandoHistorial ? (
                  <div className="flex items-center gap-3 text-gray-500 font-bold p-8 justify-center"><span className="material-symbols-outlined animate-spin">sync</span> Cargando documentos...</div>
                ) : listaHistorial.map((registro) => (
                  <div key={registro.id} className="bg-white border p-6 rounded-2xl mb-5 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="m-0 text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-400">description</span> {registro.nombre_documento}
                      </h3>
                      <span className={`text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1 border ${registro.publicado ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                        {registro.publicado ? <><span className="material-symbols-outlined text-[14px]">check_circle</span> Publicado</> : <><span className="material-symbols-outlined text-[14px]">edit_document</span> Borrador</>}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-6 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">calendar_today</span> Creado el: {new Date(registro.fecha_creacion).toLocaleDateString()}</p>

                    <div className="flex gap-3 flex-wrap items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <button onClick={() => iniciarExamen(registro)} className="flex items-center gap-2 py-2 px-4 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer font-bold transition-colors shadow-sm text-sm"><span className="material-symbols-outlined text-[18px]">visibility</span> Vista Previa</button>
                      <button onClick={() => exportarExamen(registro)} className="flex items-center gap-2 py-2 px-4 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer font-bold transition-colors shadow-sm text-sm"><span className="material-symbols-outlined text-[18px]">download</span> Exportar Txt</button>
                      
                      <div className="flex-1"></div> 

                      {registro.publicado ? (
                        <button onClick={() => despublicarCuestionario(registro.id)} className="flex items-center gap-2 py-2 px-4 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-lg cursor-pointer font-bold transition-colors text-sm"><span className="material-symbols-outlined text-[18px]">visibility_off</span> Ocultar a Alumnos</button>
                      ) : (
                        <button onClick={() => abrirModalPublicar(registro.id)} className="flex items-center gap-2 py-2 px-4 bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer font-bold transition-colors shadow-sm text-sm"><span className="material-symbols-outlined text-[18px]">rocket_launch</span> Publicar a Alumnos</button>
                      )}
                      
                      <button onClick={() => eliminarExamen(registro.id)} className="flex items-center gap-2 py-2 px-3 bg-transparent text-gray-400 hover:text-red-600 border-none rounded-lg cursor-pointer transition-colors" title="Eliminar"><span className="material-symbols-outlined">delete</span></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* VISTA 4: PANEL DEL ESTUDIANTE */}
            {vista === 'panel_estudiante' && rol === 'estudiante' && (
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">🎓 Evaluaciones Disponibles</h2>
                <p className="text-gray-500 mb-8">Selecciona una evaluación para comenzar. ¡Mucho éxito!</p>
                {cargandoHistorial ? <p className="text-gray-500 font-bold">⏳ Buscando evaluaciones...</p> : listaHistorial.length === 0 ? <div className="bg-white border p-8 rounded-2xl shadow-sm text-center"><span className="material-symbols-outlined text-4xl text-gray-300 mb-3 block">inbox</span><p className="text-gray-500 font-medium m-0">No hay exámenes publicados por tus maestros en este momento.</p></div> : listaHistorial.map((registro) => (
                  <div key={registro.id} className="bg-white border border-gray-200 p-6 rounded-2xl mb-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="m-0 text-xl font-bold text-blue-800 flex items-center gap-2"><span className="material-symbols-outlined">assignment</span> {registro.nombre_documento}</h3>
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">{registro.preguntas_json.length} Preguntas</span>
                    </div>
                    <button onClick={() => iniciarExamen(registro)} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white border-none rounded-xl cursor-pointer font-bold text-lg shadow-sm transition-colors flex justify-center items-center gap-2">
                      <span className="material-symbols-outlined">play_circle</span> Iniciar Evaluación
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* VISTA 5: EXAMEN INTERACTIVO / EDITOR */}
            {vista === 'examen' && examenActivo && (
              <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-200">
                
                <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
                  <div>
                    <span className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-1 block">
                      {rol === 'docente' ? (modoEdicion ? 'Modo Edición' : 'Vista Previa del Docente') : 'Evaluación en curso'}
                    </span>
                    <h2 className="text-3xl font-extrabold text-gray-900 m-0">{examenActivo.nombre_documento}</h2>
                  </div>
                  
                  {/* BOTÓN DE EDITAR CON LÓGICA DE BLOQUEO */}
                  {rol === 'docente' && !modoEdicion && (
                    <button 
                      onClick={() => {
                        if (examenActivo.publicado) {
                          setModalAlertaEdicion(true);
                        } else {
                          setModoEdicion(true);
                        }
                      }} 
                      className={`flex items-center gap-2 py-2 px-5 font-bold border rounded-xl cursor-pointer transition-colors shadow-sm ${examenActivo.publicado ? 'bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200' : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border-yellow-200'}`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{examenActivo.publicado ? 'lock' : 'edit'}</span> 
                      {examenActivo.publicado ? 'Edición Bloqueada' : 'Editar Cuestionario'}
                    </button>
                  )}
                </div>

                {/* Calificación: Solo estudiantes */}
                {examenTerminado && rol === 'estudiante' && (
                  <div className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl mb-10 border border-blue-100 flex items-center justify-between shadow-sm">
                    <div>
                      <h3 className="m-0 text-2xl font-bold text-gray-800 mb-1">¡Evaluación completada!</h3>
                      <p className="text-gray-500 m-0 font-medium">Revisa tu retroalimentación abajo.</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-blue-600 uppercase tracking-widest block mb-1">Tu Calificación</span>
                      <span className="text-5xl font-extrabold text-blue-700">{calcularCalificacion()} <span className="text-2xl text-blue-300">/ {examenActivo.preguntas_json.length}</span></span>
                    </div>
                  </div>
                )}

                {/* RENDERIZADO DE PREGUNTAS */}
                {examenActivo.preguntas_json.map((pregunta, index) => {
                  const respuestaElegida = respuestasUsuario[index];
                  const esCorrecta = respuestaElegida === pregunta.respuesta_correcta;

                  return (
                    <div key={index} className="border border-gray-200 p-8 rounded-2xl mb-8 bg-gray-50 relative group">
                      
                      {modoEdicion && (
                        <button onClick={() => eliminarPregunta(index)} className="absolute top-4 right-4 bg-white text-red-500 hover:bg-red-50 hover:text-red-600 border border-red-200 rounded-lg p-2 cursor-pointer font-bold shadow-sm transition-colors opacity-0 group-hover:opacity-100"><span className="material-symbols-outlined">delete</span></button>
                      )}

                      {/* NIVEL BLOOM Y PREGUNTA */}
                      <div className="mb-4">
                        {modoEdicion ? (
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm font-bold text-gray-500">Nivel:</span>
                            <input type="text" value={pregunta.nivel_bloom} onChange={(e) => actualizarPregunta(index, 'nivel_bloom', e.target.value)} className="p-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-700 bg-white" placeholder="Nivel Bloom"/>
                          </div>
                        ) : (
                          <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-xs font-bold tracking-widest uppercase">{pregunta.nivel_bloom}</span>
                        )}

                        {modoEdicion ? (
                          <textarea value={pregunta.pregunta} onChange={(e) => actualizarPregunta(index, 'pregunta', e.target.value)} className="w-full p-4 mt-3 rounded-xl border border-gray-300 font-bold text-lg outline-none focus:ring-2 focus:ring-blue-500 resize-y bg-white text-gray-800" rows="2" />
                        ) : (
                          <h3 className="mt-4 text-xl font-bold text-gray-800 leading-relaxed"><span className="text-blue-600 mr-2">{index + 1}.</span> {pregunta.pregunta}</h3>
                        )}
                      </div>
                      
                      {/* OPCIONES */}
                      <div className="flex flex-col gap-3 mt-6">
                        {pregunta.opciones.map((opcion, i) => {
                          let bg = 'bg-white'; let border = 'border-gray-200'; let text = 'text-gray-700';
                          let esCorrectaDocente = rol === 'docente' && !modoEdicion && opcion === pregunta.respuesta_correcta;

                          if (esCorrectaDocente) { bg = 'bg-green-50'; border = 'border-green-500'; text='text-green-800 font-bold'; }
                          else if (rol === 'estudiante') {
                              if (examenTerminado) {
                                if (opcion === pregunta.respuesta_correcta) { bg = 'bg-green-50'; border = 'border-green-500'; text='text-green-800 font-bold'; }
                                else if (respuestaElegida === opcion && !esCorrecta) { bg = 'bg-red-50'; border = 'border-red-400'; text='text-red-700 font-bold'; }
                              } else if (respuestaElegida === opcion) { bg = 'bg-blue-50'; border = 'border-blue-500'; text='text-blue-800 font-bold'; }
                          }

                          return (
                            <div key={i} className="flex gap-3 items-center">
                               {modoEdicion ? (
                                 <div className="flex w-full gap-3 items-center p-2 rounded-xl bg-white border border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                                   <input type="radio" name={`correcta-${index}`} checked={pregunta.respuesta_correcta === opcion} onChange={() => actualizarPregunta(index, 'respuesta_correcta', opcion)} className="w-5 h-5 ml-2 cursor-pointer accent-green-600" title="Marcar como correcta"/>
                                   <input type="text" value={opcion} onChange={(e) => actualizarOpcion(index, i, e.target.value)} className={`flex-1 p-2 border-none outline-none bg-transparent ${pregunta.respuesta_correcta === opcion ? 'font-bold text-green-700' : 'text-gray-700'}`}/>
                                   {pregunta.respuesta_correcta === opcion && <span className="material-symbols-outlined text-green-500 mr-2">check_circle</span>}
                                 </div>
                               ) : (
                                 <button onClick={() => { if (rol !== 'docente') seleccionarOpcion(index, opcion) }} className={`w-full text-left p-4 ${bg} border-2 ${border} rounded-xl ${text} transition-all ${(!examenTerminado && rol !== 'docente') ? 'hover:border-blue-300 hover:bg-blue-50 cursor-pointer shadow-sm' : 'cursor-default'} flex items-center justify-between`}>
                                   <span>{opcion}</span>
                                   {esCorrectaDocente && <span className="material-symbols-outlined text-green-600">check_circle</span>}
                                 </button>
                               )}
                            </div>
                          )
                        })}
                      </div>

                      {/* JUSTIFICACIÓN */}
                      {(examenTerminado || rol === 'docente') && (
                        <div className={`mt-6 p-5 bg-white rounded-xl border ${modoEdicion ? 'border-gray-200' : (esCorrecta ? 'border-green-200 bg-green-50/30' : (rol === 'docente' ? 'border-blue-200 bg-blue-50/30' : 'border-red-200 bg-red-50/30'))}`}>
                          {modoEdicion ? (
                             <>
                               <strong className="flex items-center gap-2 text-gray-700 mb-2 font-bold"><span className="material-symbols-outlined text-[18px]">lightbulb</span> Retroalimentación Pedagógica:</strong>
                               <textarea value={pregunta.justificacion_pedagogica} onChange={(e) => actualizarPregunta(index, 'justificacion_pedagogica', e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 text-gray-700" rows="2" />
                             </>
                          ) : (
                             <p className="m-0 text-sm text-gray-700 leading-relaxed flex items-start gap-2">
                               <span className="material-symbols-outlined text-yellow-500">lightbulb</span> 
                               <span><strong>Por qué esta respuesta es correcta:</strong><br/>{pregunta.justificacion_pedagogica}</span>
                             </p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* BOTÓN EXTRA MODO EDICIÓN */}
                {modoEdicion && (
                  <div className="flex justify-center mb-10 border-2 border-dashed border-gray-300 rounded-2xl p-6 bg-gray-50">
                     <button onClick={agregarPreguntaVacia} className="flex items-center gap-2 py-3 px-6 bg-white text-gray-700 font-bold border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-sm">
                       <span className="material-symbols-outlined">add</span> Añadir Nueva Pregunta
                     </button>
                  </div>
                )}

                {/* --- BOTONERA INFERIOR --- */}
                {rol === 'docente' ? (
                    modoEdicion ? (
                      <div className="flex gap-4 pt-6 border-t border-gray-100">
                         <button onClick={() => setModoEdicion(false)} className="flex-1 py-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-bold rounded-xl cursor-pointer transition-colors">Cancelar Edición</button>
                         <button onClick={guardarEdicionEnBackend} className="flex-[2] flex items-center justify-center gap-2 py-4 bg-green-600 hover:bg-green-700 text-white font-bold border-none rounded-xl cursor-pointer shadow-md transition-colors"><span className="material-symbols-outlined">save</span> Guardar Cambios en Base de Datos</button>
                      </div>
                    ) : (
                      <button onClick={() => setVista('historial')} className="w-full mt-4 flex justify-center items-center gap-2 py-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold rounded-xl cursor-pointer transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span> Regresar al Historial
                      </button>
                    )
                ) : (
                    !examenTerminado ? (
                      <button onClick={() => setExamenTerminado(true)} disabled={Object.keys(respuestasUsuario).length < examenActivo.preguntas_json.length} className={`w-full mt-4 py-4 text-lg font-bold text-white border-none rounded-xl shadow-md transition-all flex justify-center items-center gap-2 ${Object.keys(respuestasUsuario).length < examenActivo.preguntas_json.length ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'}`}>
                        <span className="material-symbols-outlined">send</span> Entregar Evaluación
                      </button>
                    ) : (
                      <button onClick={() => setVista('panel_estudiante')} className="w-full mt-4 flex justify-center items-center gap-2 py-4 bg-gray-800 hover:bg-gray-900 text-white font-bold border-none rounded-xl cursor-pointer shadow-md transition-colors">
                        <span className="material-symbols-outlined">home</span> Volver al Panel Principal
                      </button>
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