import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function EvaluacionesIA() {
  const navigate = useNavigate();

  // --- ESTADOS DE SESIÓN Y VISTAS ---
  const [rol, setRol] = useState(null); // 'docente' o 'estudiante'
  const [vista, setVista] = useState('inicio'); // inicio, historial, nuevo, panel_estudiante, examen, dashboard, clases
  const [listaHistorial, setListaHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  
  // Estado para el menú desplegable del avatar
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);

  // Estados del generador (Solo Docente)
  const [archivo, setArchivo] = useState(null);
  const [numPreguntas, setNumPreguntas] = useState(5); // Por defecto 5 preguntas
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Estados del Examen (Estudiante y Vista Previa Docente)
  const [examenActivo, setExamenActivo] = useState(null);
  const [respuestasUsuario, setRespuestasUsuario] = useState({});
  const [examenTerminado, setExamenTerminado] = useState(false);

  // --- NUEVOS ESTADOS Y FUNCIONES PARA EDITAR ---
  const [modoEdicion, setModoEdicion] = useState(false);

  // Leer la sesión al iniciar
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuarioQuizAI");
    if (usuarioGuardado) {
      const usuario = JSON.parse(usuarioGuardado);
      setRol(usuario.rol);
      // Lo mandamos directo a su panel principal según su rol
      setVista(usuario.rol === 'docente' ? 'historial' : 'panel_estudiante');
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
      
      if (!respuesta.ok) throw new Error("El servidor falló al pedir los datos");
      
      const resultado = await respuesta.json();
      setListaHistorial(resultado.data || []); 
    } catch (err) {
      console.error("Error al cargar historial:", err);
      setListaHistorial([]);
    } finally {
      setCargandoHistorial(false);
    }
  };

  // --- LÓGICA DEL DOCENTE ---
  const generarCuestionario = async () => {
    if (!archivo) return setError("⚠️ Selecciona un archivo PDF.");
    setCargando(true); setError(null);
    
    const usuarioString = localStorage.getItem("usuarioQuizAI");
    const usuario = JSON.parse(usuarioString);

    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("usuario_id", usuario.id); 
    formData.append("num_preguntas", numPreguntas); // Mandamos la cantidad seleccionada

    try {
      const respuesta = await fetch("https://backend-tesis-x187.onrender.com/api/generar-cuestionario", { 
        method: "POST", 
        body: formData 
      });
      
      if (!respuesta.ok) throw new Error("Fallo en el servidor.");
      alert("✅ ¡Cuestionario generado! Ve a tu historial para publicarlo.");
      setArchivo(null);
      setVista('historial'); // Lo regresamos al historial para ver su nuevo examen
      cargarHistorial(); 
    } catch (err) {
      setError("❌ Error: " + err.message);
    } finally {
      setCargando(false);
    }
  };

  const publicarCuestionario = async (id) => {
    const confirmacion = window.confirm(
      "⚠️ ¿Estás seguro de que quieres publicar este examen?\n\nUna vez publicado, los estudiantes podrán verlo y resolverlo."
    );
    if (!confirmacion) return;

    try {
      const respuesta = await fetch(`https://backend-tesis-x187.onrender.com/api/cuestionarios/${id}/publicar`, { method: "PUT" });
      if (!respuesta.ok) throw new Error("Error al publicar");
      cargarHistorial(); 
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const despublicarCuestionario = async (id) => {
    try {
      const respuesta = await fetch(`https://backend-tesis-x187.onrender.com/api/cuestionarios/${id}/despublicar`, { method: "PUT" });
      if (!respuesta.ok) throw new Error("Error al quitar publicación");
      cargarHistorial(); 
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const eliminarExamen = async (id) => {
    if (!window.confirm("⚠️ ¿Estás seguro de que deseas eliminar este examen para siempre?")) return;
    try {
      await fetch(`https://backend-tesis-x187.onrender.com/api/cuestionarios/${id}`, { method: 'DELETE' });
      alert("🗑️ Examen eliminado de la base de datos.");
      cargarHistorial(); 
    } catch (err) {
      alert("Error al eliminar el examen.");
    }
  };

  const exportarExamen = (registro) => {
    let contenido = `📝 EXAMEN: ${registro.nombre_documento}\nGenerado por QuizAI\n=================================================\n\n`;
    registro.preguntas_json.forEach((p, index) => {
      contenido += `${index + 1}. ${p.pregunta} (Nivel: ${p.nivel_bloom})\n`;
      p.opciones.forEach(op => { contenido += `   [  ] ${op}\n`; });
      contenido += `\n   ✅ CLAVE: ${p.respuesta_correcta}\n   💡 Justificación: ${p.justificacion_pedagogica}\n-------------------------------------------------\n\n`;
    });

    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `Clave_Examen_${registro.nombre_documento}.txt`;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
  };

  // --- LÓGICA DE EDICIÓN ---
  const actualizarPregunta = (index, campo, valor) => {
    const examenActualizado = { ...examenActivo };
    examenActualizado.preguntas_json[index][campo] = valor;
    setExamenActivo(examenActualizado);
  };

  const actualizarOpcion = (qIndex, optIndex, valor) => {
    const examenActualizado = { ...examenActivo };
    examenActualizado.preguntas_json[qIndex].opciones[optIndex] = valor;
    setExamenActivo(examenActualizado);
  };

  const agregarPreguntaVacia = () => {
    const examenActualizado = { ...examenActivo };
    examenActualizado.preguntas_json.push({
      pregunta: "Escribe la nueva pregunta aquí...",
      opciones: ["Opción 1", "Opción 2", "Opción 3", "Opción 4"],
      respuesta_correcta: "Opción 1",
      justificacion_pedagogica: "Explica por qué esta es la correcta...",
      nivel_bloom: "Recordar"
    });
    setExamenActivo(examenActualizado);
  };

  const eliminarPregunta = (index) => {
    if (!window.confirm("¿Borrar esta pregunta?")) return;
    const examenActualizado = { ...examenActivo };
    examenActualizado.preguntas_json.splice(index, 1);
    setExamenActivo(examenActualizado);
  };

  const guardarEdicionEnBackend = async () => {
    try {
      const respuesta = await fetch(`https://backend-tesis-x187.onrender.com/api/cuestionarios/${examenActivo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preguntas_json: examenActivo.preguntas_json })
      });
      if (!respuesta.ok) throw new Error("Error al guardar en la base de datos");
      alert("✅ ¡Cambios guardados permanentemente!");
      setModoEdicion(false); 
      cargarHistorial(); 
    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  // --- LÓGICA DEL EXAMEN INTERACTIVO ---
  const iniciarExamen = (registro) => {
    setExamenActivo(registro); setRespuestasUsuario({}); setExamenTerminado(false); setVista('examen');
  };

  const seleccionarOpcion = (preguntaIndex, opcionElegida) => {
    if (examenTerminado) return;
    setRespuestasUsuario({ ...respuestasUsuario, [preguntaIndex]: opcionElegida });
  };

  const calcularCalificacion = () => {
    let correctas = 0;
    examenActivo.preguntas_json.forEach((pregunta, index) => {
      if (respuestasUsuario[index] === pregunta.respuesta_correcta) correctas++;
    });
    return correctas;
  };


  // ==========================================
  // RENDERIZADO DE LA INTERFAZ
  // ==========================================

  // 1. PANTALLA DE SELECCIÓN DE ROL (Para usuarios que recién inician sin rol)
  if (!rol) {
    return (
      <div className="max-w-xl mx-auto mt-24 text-center font-sans">
        <h1 className="text-4xl font-extrabold text-blue-700 mb-4">🧠 QuizAI</h1>
        <p className="text-gray-500 mb-10">Selecciona tu perfil para ingresar a la plataforma</p>
        <div className="flex gap-6 justify-center">
          <button onClick={() => { setRol('docente'); setVista('historial'); }} className="p-8 text-xl w-52 cursor-pointer bg-gray-800 text-white border-none rounded-2xl shadow-lg hover:bg-gray-700 transition-colors">👨‍🏫 Soy Docente</button>
          <button onClick={() => { setRol('estudiante'); setVista('panel_estudiante'); }} className="p-8 text-xl w-52 cursor-pointer bg-blue-600 text-white border-none rounded-2xl shadow-lg hover:bg-blue-700 transition-colors">🎓 Soy Estudiante</button>
        </div>
      </div>
    );
  }

  // 2. SHELL DE LA APLICACIÓN (DASHBOARD)
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* --- BARRA DE NAVEGACIÓN SUPERIOR --- */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center z-20 shadow-sm relative">
        {/* LOGO CENTRADO CON EL RESTO */}
        <div className="text-3xl font-extrabold text-blue-700 tracking-tight flex items-center select-none cursor-pointer" onClick={() => setVista(rol === 'docente' ? 'historial' : 'panel_estudiante')}>
          🧠 QuizAI
        </div>

        {/* BOTONES DERECHA */}
        <div className="flex items-center gap-6">
          <button className="text-gray-400 hover:text-blue-600 text-2xl transition-colors cursor-pointer bg-transparent border-none">🔔</button>
          <button className="text-gray-400 hover:text-blue-600 text-2xl transition-colors cursor-pointer bg-transparent border-none">❓</button>

          {/* MENÚ DESPLEGABLE DEL USUARIO */}
          <div className="relative">
            <button 
              onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
              className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center border-2 border-transparent hover:border-blue-500 transition-all text-2xl cursor-pointer shadow-sm"
            >
              👤
            </button>

            {menuUsuarioAbierto && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden">
                <button className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium cursor-pointer flex items-center gap-3 border-none bg-transparent">
                  <span className="text-lg">👤</span> Ver perfil
                </button>
                <button className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium cursor-pointer flex items-center gap-3 border-none bg-transparent">
                  <span className="text-lg">⚙️</span> Configuración
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button onClick={cerrarSesion} className="w-full text-left px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-bold cursor-pointer flex items-center gap-3 border-none bg-transparent">
                  <span className="text-lg">🚪</span> Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* --- CONTENEDOR PRINCIPAL (SIDEBAR + CONTENIDO) --- */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR LATERAL IZQUIERDO */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col py-6 px-4 hidden md:flex z-10">
          <div className="flex flex-col gap-2">
            {rol === 'docente' ? (
              <>
                <button onClick={() => setVista('dashboard')} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all cursor-pointer border-none text-left ${vista === 'dashboard' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}>
                  📊 Dashboard
                </button>
                {/* Modificado para que vaya directo a crear un nuevo cuestionario como lo pediste */}
                <button onClick={() => setVista('nuevo')} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all cursor-pointer border-none text-left ${vista === 'nuevo' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}>
                  ✨ Crear Cuestionario
                </button>
                <button onClick={() => setVista('historial')} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all cursor-pointer border-none text-left ${vista === 'historial' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}>
                  📁 Mis Cuestionarios
                </button>
                <button onClick={() => setVista('clases')} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all cursor-pointer border-none text-left ${vista === 'clases' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}>
                  🎓 Clases
                </button>
              </>
            ) : (
              <button onClick={() => setVista('panel_estudiante')} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all cursor-pointer border-none text-left ${vista === 'panel_estudiante' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}>
                🎓 Mis Evaluaciones
              </button>
            )}
          </div>
        </aside>

        {/* --- ÁREA DE CONTENIDO DINÁMICO --- */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
          <div className="max-w-4xl mx-auto">

            {/* VISTA: DASHBOARD O CLASES (MOCKUP) */}
            {(vista === 'dashboard' || vista === 'clases') && (
              <div className="text-center mt-20">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Próximamente</h2>
                <p className="text-gray-500">Esta sección se encuentra en desarrollo.</p>
              </div>
            )}

            {/* VISTA: CREAR EXAMEN (SÓLO DOCENTE) */}
            {vista === 'nuevo' && rol === 'docente' && (
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Crear Nuevo Examen</h2>
                <p className="text-gray-500 mb-8">Sube tus apuntes, elige cuántas preguntas necesitas y la IA creará un examen interactivo.</p>
                
                <div className="my-5 p-8 border-2 border-dashed border-gray-300 rounded-2xl bg-white shadow-sm">
                  <div className="mb-6">
                    <label className="block font-bold mb-2 text-gray-800">Cantidad de preguntas a generar:</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="15" 
                      value={numPreguntas} 
                      onChange={(e) => setNumPreguntas(e.target.value)} 
                      className="p-3 rounded-lg border border-gray-300 w-24 text-lg outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                    <span className="ml-3 text-gray-500 text-sm">preguntas (Máximo 15)</span>
                  </div>
                  
                  <input type="file" accept=".pdf" onChange={(e) => setArchivo(e.target.files[0])} className="block mb-6 w-full text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                  
                  <button onClick={generarCuestionario} disabled={cargando} className={`py-3 px-6 text-lg font-bold text-white border-none rounded-xl shadow-md transition-all ${cargando ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 cursor-pointer'}`}>
                    {cargando ? "⏳ Analizando PDF e IA trabajando..." : "Generar Examen con IA"}
                  </button>
                </div>
                {error && <div className="text-red-700 p-4 bg-red-50 rounded-lg mt-4 border border-red-200">{error}</div>}
              </div>
            )}

            {/* VISTA: HISTORIAL DEL DOCENTE */}
            {vista === 'historial' && rol === 'docente' && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-1">Mis Cuestionarios</h2>
                    <p className="text-gray-500">Administra tus evaluaciones y publícalas a tus estudiantes.</p>
                  </div>
                  <button onClick={() => setVista('nuevo')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg border-none transition-all cursor-pointer">
                    ✨ Crear Nuevo
                  </button>
                </div>

                {cargandoHistorial ? <p className="text-gray-500 font-bold">⏳ Cargando tus documentos...</p> : listaHistorial.map((registro) => (
                  <div key={registro.id} className={`border p-6 rounded-2xl mb-4 bg-white shadow-sm flex flex-col ${registro.publicado ? 'border-l-4 border-l-green-500 border-gray-200' : 'border-l-4 border-l-yellow-400 border-gray-200'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="m-0 text-xl font-bold text-gray-800">📄 {registro.nombre_documento}</h3>
                      <span className={`text-xs px-3 py-1.5 rounded-md font-bold ${registro.publicado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {registro.publicado ? '✅ Publicado' : '📝 Borrador'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-5">Creado: {new Date(registro.fecha_creacion).toLocaleDateString()}</p>

                    <div className="flex gap-3 flex-wrap items-center">
                      <button onClick={() => iniciarExamen(registro)} className="py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white border-none rounded-lg cursor-pointer font-semibold transition-colors">👁️ Vista Previa</button>
                      <button onClick={() => exportarExamen(registro)} className="py-2 px-4 bg-cyan-600 hover:bg-cyan-700 text-white border-none rounded-lg cursor-pointer font-semibold transition-colors">📥 Descargar Txt</button>
                      
                      {registro.publicado ? (
                        <button onClick={() => despublicarCuestionario(registro.id)} className="py-2 px-4 bg-red-500 hover:bg-red-600 text-white border-none rounded-lg cursor-pointer font-semibold transition-colors">🚫 Ocultar Examen</button>
                      ) : (
                        <button onClick={() => publicarCuestionario(registro.id)} className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white border-none rounded-lg cursor-pointer font-semibold transition-colors">🚀 Publicar</button>
                      )}
                      
                      <button onClick={() => eliminarExamen(registro.id)} className="py-2 px-4 bg-transparent text-red-600 border border-red-600 hover:bg-red-50 rounded-lg cursor-pointer ml-auto font-semibold transition-colors">🗑️ Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* VISTA: PANEL DEL ESTUDIANTE */}
            {vista === 'panel_estudiante' && rol === 'estudiante' && (
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">🎓 Evaluaciones Disponibles</h2>
                <p className="text-gray-500 mb-8">Selecciona una evaluación para comenzar. ¡Mucho éxito!</p>
                {cargandoHistorial ? <p className="text-gray-500 font-bold">⏳ Buscando evaluaciones...</p> : listaHistorial.length === 0 ? <div className="bg-blue-50 text-blue-700 p-6 rounded-xl font-bold text-center border border-blue-100">No hay exámenes publicados por tus maestros en este momento.</div> : listaHistorial.map((registro) => (
                  <div key={registro.id} className="border border-blue-200 p-6 rounded-2xl mb-5 bg-blue-50/50 shadow-sm transition-transform hover:-translate-y-1">
                    <h3 className="m-0 text-xl font-extrabold text-blue-800 mb-2">📝 {registro.nombre_documento}</h3>
                    <p className="text-sm text-blue-600 font-semibold mb-4">Preguntas: {registro.preguntas_json.length}</p>
                    <button onClick={() => iniciarExamen(registro)} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white border-none rounded-xl cursor-pointer font-bold text-lg shadow-md transition-colors">
                      Iniciar Evaluación ▶️
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* VISTA: EXAMEN INTERACTIVO / EDITOR */}
            {vista === 'examen' && examenActivo && (
              <div className="text-left bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                
                {/* CABECERA DINÁMICA */}
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                  <h2 className="text-2xl font-extrabold text-gray-800 m-0">
                    {rol === 'docente' ? (modoEdicion ? '✏️ Modo Editor: ' : '👁️ Vista Previa: ') : '📝 Evaluación: '} 
                    {examenActivo.nombre_documento}
                  </h2>
                  {rol === 'docente' && !modoEdicion && (
                    <button onClick={() => setModoEdicion(true)} className="py-2 px-5 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-extrabold border-none rounded-lg cursor-pointer shadow-sm transition-colors">
                      ✏️ Editar Cuestionario
                    </button>
                  )}
                </div>

                {/* Calificación: Solo estudiantes */}
                {examenTerminado && rol === 'estudiante' && (
                  <div className="p-6 bg-blue-50 rounded-xl mb-8 border-l-4 border-blue-600 flex items-center justify-between">
                    <h3 className="m-0 text-xl text-blue-900">Calificación Final:</h3>
                    <span className="text-3xl font-extrabold text-blue-700">{calcularCalificacion()} / {examenActivo.preguntas_json.length}</span>
                  </div>
                )}

                {/* RENDERIZADO DE PREGUNTAS */}
                {examenActivo.preguntas_json.map((pregunta, index) => {
                  const respuestaElegida = respuestasUsuario[index];
                  const esCorrecta = respuestaElegida === pregunta.respuesta_correcta;

                  return (
                    <div key={index} className="border border-gray-200 p-6 rounded-xl mb-6 bg-gray-50 relative">
                      
                      {/* Botón borrar pregunta (Solo Editor) */}
                      {modoEdicion && (
                        <button onClick={() => eliminarPregunta(index)} className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white border-none rounded-md px-3 py-1 cursor-pointer font-bold text-sm">🗑️ Borrar</button>
                      )}

                      {/* NIVEL BLOOM Y PREGUNTA */}
                      {modoEdicion ? (
                         <input type="text" value={pregunta.nivel_bloom} onChange={(e) => actualizarPregunta(index, 'nivel_bloom', e.target.value)} className="mb-3 p-2 w-40 block rounded border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nivel Bloom"/>
                      ) : (
                         <span className="bg-gray-600 text-white px-3 py-1 rounded text-xs font-bold shadow-sm">Nivel: {pregunta.nivel_bloom}</span>
                      )}

                      {modoEdicion ? (
                         <textarea value={pregunta.pregunta} onChange={(e) => actualizarPregunta(index, 'pregunta', e.target.value)} className="w-full p-3 mt-3 rounded border border-blue-500 font-bold outline-none focus:ring-2 focus:ring-blue-500 resize-y" rows="2" />
                      ) : (
                         <h3 className="mt-4 text-lg font-bold text-gray-800">{index + 1}. {pregunta.pregunta}</h3>
                      )}
                      
                      {/* OPCIONES */}
                      <div className="flex flex-col gap-3 mt-5">
                        {pregunta.opciones.map((opcion, i) => {
                          let bgColor = 'bg-white'; let borderColor = 'border-gray-300'; let textColor = 'text-gray-700';
                          let esCorrectaDocente = rol === 'docente' && opcion === pregunta.respuesta_correcta;

                          if (rol === 'docente' && !modoEdicion && esCorrectaDocente) { bgColor = 'bg-green-50'; borderColor = 'border-green-500'; textColor='text-green-800 font-bold'; }
                          else if (rol === 'estudiante') {
                              if (examenTerminado) {
                                if (opcion === pregunta.respuesta_correcta) { bgColor = 'bg-green-100'; borderColor = 'border-green-400'; textColor='text-green-800 font-bold'; }
                                else if (respuestaElegida === opcion && !esCorrecta) { bgColor = 'bg-red-50'; borderColor = 'border-red-300'; textColor='text-red-700'; }
                              } else if (respuestaElegida === opcion) { bgColor = 'bg-blue-50'; borderColor = 'border-blue-400'; textColor='text-blue-800 font-bold'; }
                          }

                          return (
                            <div key={i} className="flex gap-3 items-center">
                               {modoEdicion ? (
                                 <>
                                   <input type="radio" name={`correcta-${index}`} checked={pregunta.respuesta_correcta === opcion} onChange={() => actualizarPregunta(index, 'respuesta_correcta', opcion)} className="w-5 h-5 cursor-pointer accent-green-600" title="Marcar como correcta"/>
                                   <input type="text" value={opcion} onChange={(e) => actualizarOpcion(index, i, e.target.value)} className={`flex-1 p-3 rounded-lg border outline-none focus:ring-2 focus:ring-blue-500 ${pregunta.respuesta_correcta === opcion ? 'border-green-500 bg-green-50 font-bold text-green-900' : 'border-gray-300 bg-white'}`}/>
                                 </>
                               ) : (
                                 <button onClick={() => { if (rol !== 'docente') seleccionarOpcion(index, opcion) }} className={`w-full text-left p-4 ${bgColor} border-2 ${borderColor} rounded-xl ${textColor} transition-all ${(!examenTerminado && rol !== 'docente') ? 'hover:border-blue-500 hover:bg-blue-50 cursor-pointer' : 'cursor-default'}`}>
                                   {opcion} {esCorrectaDocente && " ✅"}
                                 </button>
                               )}
                            </div>
                          )
                        })}
                      </div>

                      {/* JUSTIFICACIÓN */}
                      {(examenTerminado || rol === 'docente') && (
                        <div className={`mt-6 p-4 bg-white rounded-lg border border-gray-100 border-l-4 shadow-sm ${rol === 'docente' ? 'border-l-cyan-500' : (esCorrecta ? 'border-l-green-500' : 'border-l-red-500')}`}>
                          {modoEdicion ? (
                             <>
                               <strong className="text-gray-600 text-sm block mb-1">Retroalimentación:</strong>
                               <textarea value={pregunta.justificacion_pedagogica} onChange={(e) => actualizarPregunta(index, 'justificacion_pedagogica', e.target.value)} className="w-full p-2 rounded border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 text-sm" rows="2" />
                             </>
                          ) : (
                             <p className="m-0 text-sm text-gray-700 leading-relaxed"><strong>💡 Retroalimentación:</strong> {pregunta.justificacion_pedagogica}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* BOTONES DE EDICIÓN EXTRAS */}
                {modoEdicion && (
                  <div className="flex justify-center mb-8 mt-4">
                     <button onClick={agregarPreguntaVacia} className="py-3 px-6 bg-cyan-50 text-cyan-700 font-extrabold border-2 border-dashed border-cyan-500 rounded-xl cursor-pointer hover:bg-cyan-100 transition-colors">
                       ➕ Añadir Nueva Pregunta
                     </button>
                  </div>
                )}

                {/* --- BOTONERA INFERIOR DINÁMICA --- */}
                {rol === 'docente' ? (
                    modoEdicion ? (
                      <div className="flex gap-4 pt-4 border-t border-gray-200">
                         <button onClick={() => setModoEdicion(false)} className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white text-lg font-bold border-none rounded-xl cursor-pointer shadow-md transition-colors">Cancelar Edición</button>
                         <button onClick={guardarEdicionEnBackend} className="flex-2 py-4 bg-green-600 hover:bg-green-700 text-white text-lg font-bold border-none rounded-xl cursor-pointer shadow-md transition-colors w-full">💾 Guardar Cambios</button>
                      </div>
                    ) : (
                      <button onClick={() => setVista('historial')} className="w-full mt-4 py-4 bg-gray-800 hover:bg-gray-900 text-white text-lg font-bold border-none rounded-xl cursor-pointer shadow-md transition-colors">
                        Cerrar Vista Previa
                      </button>
                    )
                ) : (
                    !examenTerminado ? (
                      <button onClick={() => setExamenTerminado(true)} disabled={Object.keys(respuestasUsuario).length < examenActivo.preguntas_json.length} className={`w-full mt-4 py-4 text-xl font-extrabold text-white border-none rounded-xl shadow-lg transition-all ${Object.keys(respuestasUsuario).length < examenActivo.preguntas_json.length ? 'bg-gray-400 cursor-not-allowed opacity-60' : 'bg-green-600 hover:bg-green-700 cursor-pointer'}`}>
                        Entregar Evaluación
                      </button>
                    ) : (
                      <button onClick={() => setVista('panel_estudiante')} className="w-full mt-4 py-4 bg-gray-800 hover:bg-gray-900 text-white text-lg font-bold border-none rounded-xl cursor-pointer shadow-md transition-colors">
                        Volver a mis Evaluaciones
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