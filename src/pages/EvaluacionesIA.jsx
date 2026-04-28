import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function EvaluacionesIA() {

  const navigate = useNavigate()

  // --- ESTADOS DE SESIÓN Y VISTAS ---
  const [rol, setRol] = useState(null) // 'docente' o 'estudiante'
  const [vista, setVista] = useState('inicio')
  const [listaHistorial, setListaHistorial] = useState([])
  const [cargandoHistorial, setCargandoHistorial] = useState(false)

  // Estados del generador (Solo Docente)
  const [archivo, setArchivo] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  // Estados del Examen (Estudiante y Vista Previa Docente)
  const [examenActivo, setExamenActivo] = useState(null)
  const [respuestasUsuario, setRespuestasUsuario] = useState({})
  const [examenTerminado, setExamenTerminado] = useState(false)

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
      cargarHistorial()
    }
  }, [vista])

  const cargarHistorial = async () => {
    setCargandoHistorial(true)
    try {
      const usuarioString = localStorage.getItem("usuarioQuizAI");
      if (!usuarioString) return;
      const usuario = JSON.parse(usuarioString);
      
      const url = `https://backend-tesis-x187.onrender.com/api/cuestionarios?usuario_id=${usuario.id}&rol=${usuario.rol}`;
      
      const respuesta = await fetch(url);
      
      // ¡NUEVA LÓGICA DE SEGURIDAD!
      if (!respuesta.ok) {
        throw new Error("El servidor falló al pedir los datos");
      }
      
      const resultado = await respuesta.json();
      
      // Nos aseguramos de que SIEMPRE sea un arreglo, incluso si falla
      setListaHistorial(resultado.data || []); 
      
    } catch (err) {
      console.error("Error al cargar historial:", err)
      setListaHistorial([]); // Si hay error, ponemos lista vacía para evitar la pantalla blanca
    } finally {
      setCargandoHistorial(false)
    }
  }


  // --- LÓGICA DEL DOCENTE ---
 const generarCuestionario = async () => {
    if (!archivo) return setError("⚠️ Selecciona un archivo PDF.")
    setCargando(true); setError(null);
    
    // 1. Extraemos los datos del usuario que guardamos en el login
    const usuarioString = localStorage.getItem("usuarioQuizAI");
    const usuario = JSON.parse(usuarioString);

    const formData = new FormData()
    formData.append("archivo", archivo)
    
    // 2. Le mandamos el ID al backend (el nombre debe ser igual al que pusimos en Python: usuario_id)
    formData.append("usuario_id", usuario.id) 

    try {
      const respuesta = await fetch("https://backend-tesis-x187.onrender.com/api/generar-cuestionario", { 
        method: "POST", 
        body: formData 
      });
      
      if (!respuesta.ok) throw new Error("Fallo en el servidor.")
      alert("✅ ¡Cuestionario generado! Ve a tu historial para publicarlo.")
      setArchivo(null)
      cargarHistorial() // Recargamos para ver el nuevo examen en nuestra lista
    } catch (err) {
      setError("❌ Error: " + err.message)
    } finally {
      setCargando(false)
    }
  }

  const publicarExamen = async (id) => {
    try {
      await fetch(`https://backend-tesis-x187.onrender.com/api/cuestionarios/${id}/publicar`, { method: 'PUT' })
      alert("🚀 ¡Examen publicado! Los estudiantes ya pueden verlo.")
      cargarHistorial() // Recargamos la lista para actualizar el estado
    } catch (err) {
      alert("Error al publicar.")
    }
  }

  const eliminarExamen = async (id) => {
    // Confirmación de seguridad para evitar borrados por accidente
    if (!window.confirm("⚠️ ¿Estás seguro de que deseas eliminar este examen para siempre?")) return;

    try {
      await fetch(`https://backend-tesis-x187.onrender.com/api/cuestionarios/${id}`, { method: 'DELETE' })
      alert("🗑️ Examen eliminado de la base de datos.");
      cargarHistorial(); // Recargar la lista
    } catch (err) {
      alert("Error al eliminar el examen.");
    }
  }

  const exportarExamen = (registro) => {
    // Generamos un formato de texto limpio
    let contenido = `📝 EXAMEN: ${registro.nombre_documento}\n`;
    contenido += `Generado por QuizAI\n`;
    contenido += `=================================================\n\n`;

    registro.preguntas_json.forEach((p, index) => {
      contenido += `${index + 1}. ${p.pregunta} (Nivel: ${p.nivel_bloom})\n`;
      p.opciones.forEach(op => {
        contenido += `   [  ] ${op}\n`;
      });
      contenido += `\n   ✅ CLAVE: ${p.respuesta_correcta}\n`;
      contenido += `   💡 Justificación: ${p.justificacion_pedagogica}\n`;
      contenido += `-------------------------------------------------\n\n`;
    });

    // Creamos un archivo virtual y forzamos la descarga
    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `Clave_Examen_${registro.nombre_documento}.txt`;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
  }

  // --- LÓGICA DEL EXAMEN INTERACTIVO ---
  const iniciarExamen = (registro) => {
    setExamenActivo(registro); setRespuestasUsuario({}); setExamenTerminado(false); setVista('examen');
  }

  const seleccionarOpcion = (preguntaIndex, opcionElegida) => {
    if (examenTerminado) return
    setRespuestasUsuario({ ...respuestasUsuario, [preguntaIndex]: opcionElegida })
  }

  const calcularCalificacion = () => {
    let correctas = 0;
    examenActivo.preguntas_json.forEach((pregunta, index) => {
      if (respuestasUsuario[index] === pregunta.respuesta_correcta) correctas++;
    });
    return correctas;
  }

  // --- NUEVOS ESTADOS Y FUNCIONES PARA EDITAR ---
  const [modoEdicion, setModoEdicion] = useState(false);

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
      // Usamos el ID del examen activo para decirle a FastAPI cuál actualizar
      const respuesta = await fetch(`https://backend-tesis-x187.onrender.com/api/cuestionarios/${examenActivo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // Enviamos la lista de preguntas ya editada
        body: JSON.stringify({ preguntas_json: examenActivo.preguntas_json })
      });
      
      if (!respuesta.ok) throw new Error("Error al guardar en la base de datos");
      
      alert("✅ ¡Cambios guardados permanentemente!");
      setModoEdicion(false); // Salimos del modo editor
      cargarHistorial(); // Recargamos el historial por si acaso
      
    } catch (error) {
      alert("❌ " + error.message);
    }
  };
  // ----------------------------------------------

  // --- COMPONENTES DE INTERFAZ ---
  const navStyle = { display: 'flex', gap: '15px', padding: '12px 20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '30px', justifyContent: 'space-between' }

  // 1. PANTALLA DE SELECCIÓN DE ROL
  if (!rol) {
    return (
      <div style={{ maxWidth: '600px', margin: '100px auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🧠 QuizAI</h1>
        <p style={{ color: '#666', marginBottom: '40px' }}>Selecciona tu perfil para ingresar a la plataforma</p>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <button onClick={() => { setRol('docente'); setVista('nuevo'); }} style={{ padding: '30px', fontSize: '18px', width: '200px', cursor: 'pointer', backgroundColor: '#343a40', color: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            👨‍🏫 Soy Docente
          </button>
          <button onClick={() => { setRol('estudiante'); setVista('panel_estudiante'); }} style={{ padding: '30px', fontSize: '18px', width: '200px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            🎓 Soy Estudiante
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>

      {/* BARRA DE NAVEGACIÓN DINÁMICA */}
      <nav style={navStyle}>
        <div style={{ display: 'flex', gap: '10px' }}>
          {rol === 'docente' ? (
            <>
              <button
                style={{ padding: '8px 15px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: vista === 'nuevo' ? '#fff' : 'transparent', color: vista === 'nuevo' ? '#333' : '#aaa' }}
                onClick={() => setVista('nuevo')}
              >
                ✨ Crear Examen
              </button>
              <button
                style={{ padding: '8px 15px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: vista === 'historial' ? '#fff' : 'transparent', color: vista === 'historial' ? '#333' : '#aaa' }}
                onClick={() => setVista('historial')}
              >
                📚 Panel de Control
              </button>
            </>
          ) : (
            <button
              style={{ padding: '8px 15px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#fff', color: '#333' }}
              onClick={() => setVista('panel_estudiante')}
            >
              🎓 Mis Evaluaciones
            </button>
          )}
        </div>
        <button 
          onClick={() => { 
            // 1. Limpiamos la memoria del navegador
            localStorage.removeItem("usuarioQuizAI"); 
            
            // 2. Mandamos al usuario al Landing Page (Home) PRIMERO
            navigate('/'); 
            
            // 3. Limpiamos los estados de la aplicación
            setRol(null); 
            setExamenActivo(null); 
          }} 
          style={{ 
            padding: '8px 15px', 
            border: '1px solid #dc3545', 
            backgroundColor: 'transparent', 
            color: '#dc3545', 
            borderRadius: '6px', 
            cursor: 'pointer' 
          }}
        >
          Cerrar Sesión
      </button>
      </nav>

      {/* VISTA: CREAR EXAMEN (SÓLO DOCENTE) */}
      {vista === 'nuevo' && rol === 'docente' && (
        <div>
          <h2>Panel de Docente</h2>
          <p>Sube tus apuntes y la IA creará un examen interactivo en estado de Borrador.</p>
          <div style={{ margin: '20px 0', padding: '20px', border: '2px dashed #ccc', borderRadius: '10px' }}>
            <input type="file" accept=".pdf" onChange={(e) => setArchivo(e.target.files[0])} style={{ display: 'block', marginBottom: '15px' }} />
            <button onClick={generarCuestionario} disabled={cargando} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: cargando ? 'not-allowed' : 'pointer' }}>
              {cargando ? "⏳ Analizando PDF y generando preguntas..." : "Generar Examen"}
            </button>
          </div>
          {error && <div style={{ color: 'red', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '5px' }}>{error}</div>}
        </div>
      )}

      {/* VISTA: HISTORIAL DEL DOCENTE */}
      {vista === 'historial' && rol === 'docente' && (
        <div>
          <h2>📚 Panel de Control de Exámenes</h2>
          {cargandoHistorial ? <p>⏳ Cargando...</p> : listaHistorial.map((registro) => (
            <div key={registro.id} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', marginBottom: '15px', backgroundColor: '#fff', borderLeft: registro.publicado ? '5px solid #28a745' : '5px solid #ffc107' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: '0 0 5px 0' }}>📄 {registro.nombre_documento}</h3>
                <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', backgroundColor: registro.publicado ? '#d4edda' : '#fff3cd', color: registro.publicado ? '#155724' : '#856404', fontWeight: 'bold' }}>
                  {registro.publicado ? '✅ Publicado' : '📝 Borrador'}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#888' }}>Creado: {new Date(registro.fecha_creacion).toLocaleDateString()}</p>

              <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={() => iniciarExamen(registro)} style={{ padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  👁️ Vista Previa
                </button>

                <button onClick={() => exportarExamen(registro)} style={{ padding: '8px 15px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  📥 Descargar PDF/TXT
                </button>

                {!registro.publicado && (
                  <button onClick={() => publicarExamen(registro.id)} style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    🚀 Publicar a Estudiantes
                  </button>
                )}

                <button onClick={() => eliminarExamen(registro.id)} style={{ padding: '8px 15px', backgroundColor: 'transparent', color: '#dc3545', border: '1px solid #dc3545', borderRadius: '4px', cursor: 'pointer', marginLeft: 'auto' }}>
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VISTA: PANEL DEL ESTUDIANTE */}
      {vista === 'panel_estudiante' && rol === 'estudiante' && (
        <div>
          <h2>🎓 Exámenes Disponibles</h2>
          <p>Selecciona una evaluación para comenzar.</p>
          {cargandoHistorial ? <p>⏳ Cargando...</p> : listaHistorial.length === 0 ? <p>No hay exámenes publicados en este momento.</p> : listaHistorial.map((registro) => (
            <div key={registro.id} style={{ border: '1px solid #007bff', padding: '20px', borderRadius: '8px', marginBottom: '15px', backgroundColor: '#f4f9ff' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#0056b3' }}>📝 Evaluación: {registro.nombre_documento}</h3>
              <p style={{ fontSize: '14px', color: '#555' }}>Preguntas: {registro.preguntas_json.length}</p>
              <button onClick={() => iniciarExamen(registro)} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', width: '100%', fontWeight: 'bold' }}>
                Iniciar Examen ▶️
              </button>
            </div>
          ))}
        </div>
      )}

      {/* VISTA: PRESENTANDO EXAMEN / EDITOR DOCENTE */}
      {vista === 'examen' && examenActivo && (
        <div style={{ textAlign: 'left' }}>
          
          {/* CABECERA DINÁMICA */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>
              📝 {rol === 'docente' ? (modoEdicion ? 'Modo Editor: ' : 'Vista Previa: ') : 'Evaluación: '} 
              {examenActivo.nombre_documento}
            </h2>
            {rol === 'docente' && !modoEdicion && (
              <button onClick={() => setModoEdicion(true)} style={{ padding: '8px 15px', backgroundColor: '#ffc107', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                ✏️ Editar Cuestionario
              </button>
            )}
          </div>

          {/* Calificación: Solo estudiantes */}
          {examenTerminado && rol === 'estudiante' && (
            <div style={{ padding: '20px', backgroundColor: '#e6f2ff', borderRadius: '8px', marginBottom: '20px', borderLeft: '5px solid #007bff' }}>
              <h3 style={{ margin: 0 }}>Calificación Final: {calcularCalificacion()} / {examenActivo.preguntas_json.length}</h3>
            </div>
          )}

          {/* RENDERIZADO DE PREGUNTAS */}
          {examenActivo.preguntas_json.map((pregunta, index) => {
            const respuestaElegida = respuestasUsuario[index];
            const esCorrecta = respuestaElegida === pregunta.respuesta_correcta;

            return (
              <div key={index} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#f9f9f9', color: '#333', position: 'relative' }}>
                
                {/* Botón borrar pregunta (Solo Editor) */}
                {modoEdicion && (
                  <button onClick={() => eliminarPregunta(index)} style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer' }}>🗑️ Borrar</button>
                )}

                {/* NIVEL BLOOM Y PREGUNTA */}
                {modoEdicion ? (
                   <input type="text" value={pregunta.nivel_bloom} onChange={(e) => actualizarPregunta(index, 'nivel_bloom', e.target.value)} style={{ marginBottom: '10px', padding: '5px', width: '150px', display: 'block', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="Nivel Bloom"/>
                ) : (
                   <span style={{ backgroundColor: '#6c757d', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Nivel: {pregunta.nivel_bloom}</span>
                )}

                {modoEdicion ? (
                   <textarea value={pregunta.pregunta} onChange={(e) => actualizarPregunta(index, 'pregunta', e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '10px', borderRadius: '4px', border: '1px solid #007bff', fontWeight: 'bold' }} rows="2" />
                ) : (
                   <h3 style={{ marginTop: '15px' }}>{index + 1}. {pregunta.pregunta}</h3>
                )}
                
                {/* OPCIONES */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                  {pregunta.opciones.map((opcion, i) => {
                    let bgColor = 'white'; let borderColor = '#ccc';
                    let esCorrectaDocente = rol === 'docente' && opcion === pregunta.respuesta_correcta;

                    if (rol === 'docente' && !modoEdicion && esCorrectaDocente) { bgColor = '#d4edda'; borderColor = '#28a745'; }
                    else if (rol === 'estudiante') {
                        if (examenTerminado) {
                          if (opcion === pregunta.respuesta_correcta) { bgColor = '#d4edda'; borderColor = '#c3e6cb'; }
                          else if (respuestaElegida === opcion && !esCorrecta) { bgColor = '#f8d7da'; borderColor = '#f5c6cb'; }
                        } else if (respuestaElegida === opcion) { bgColor = '#e6f2ff'; borderColor = '#b8daff'; }
                    }

                    return (
                      <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                         {modoEdicion ? (
                           <>
                             {/* Radio button para que el maestro elija cuál es la correcta */}
                             <input type="radio" name={`correcta-${index}`} checked={pregunta.respuesta_correcta === opcion} onChange={() => actualizarPregunta(index, 'respuesta_correcta', opcion)} style={{ cursor: 'pointer' }} title="Marcar como correcta"/>
                             <input type="text" value={opcion} onChange={(e) => actualizarOpcion(index, i, e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: pregunta.respuesta_correcta === opcion ? '2px solid #28a745' : '1px solid #ccc', backgroundColor: pregunta.respuesta_correcta === opcion ? '#f0fff4' : '#fff' }}/>
                           </>
                         ) : (
                           <button onClick={() => { if (rol !== 'docente') seleccionarOpcion(index, opcion) }} style={{ width: '100%', textAlign: 'left', padding: '12px', backgroundColor: bgColor, border: `2px solid ${borderColor}`, borderRadius: '6px', cursor: (examenTerminado || rol === 'docente') ? 'default' : 'pointer', fontSize: '15px', color: '#333', fontWeight: esCorrectaDocente ? 'bold' : 'normal' }}>
                             {opcion} {esCorrectaDocente && " ✅"}
                           </button>
                         )}
                      </div>
                    )
                  })}
                </div>

                {/* JUSTIFICACIÓN */}
                {(examenTerminado || rol === 'docente') && (
                  <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff', borderLeft: `4px solid ${rol === 'docente' ? '#17a2b8' : (esCorrecta ? '#28a745' : '#dc3545')}`, borderRadius: '4px' }}>
                    {modoEdicion ? (
                       <>
                         <strong style={{ color: '#555', fontSize: '14px' }}>Retroalimentación:</strong>
                         <textarea value={pregunta.justificacion_pedagogica} onChange={(e) => actualizarPregunta(index, 'justificacion_pedagogica', e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} rows="2" />
                       </>
                    ) : (
                       <p style={{ margin: 0, fontSize: '14px', color: '#555' }}><strong>Retroalimentación:</strong> {pregunta.justificacion_pedagogica}</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* BOTONES DE EDICIÓN EXTRAS */}
          {modoEdicion && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
               <button onClick={agregarPreguntaVacia} style={{ padding: '10px 20px', backgroundColor: '#17a2b8', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', borderStyle: 'dashed', borderWidth: '2px' }}>
                 ➕ Añadir Nueva Pregunta
               </button>
            </div>
          )}

          {/* --- BOTONERA INFERIOR DINÁMICA --- */}
          {rol === 'docente' ? (
              modoEdicion ? (
                <div style={{ display: 'flex', gap: '10px' }}>
                   <button onClick={() => setModoEdicion(false)} style={{ flex: 1, padding: '15px', backgroundColor: '#dc3545', color: 'white', fontSize: '18px', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancelar Edición</button>
                   <button onClick={guardarEdicionEnBackend} style={{ flex: 2, padding: '15px', backgroundColor: '#28a745', color: 'white', fontSize: '18px', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>💾 Guardar Cambios en Base de Datos</button>
                </div>
              ) : (
                <button onClick={() => setVista('historial')} style={{ width: '100%', padding: '15px', backgroundColor: '#6c757d', color: 'white', fontSize: '18px', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Cerrar Vista Previa
                </button>
              )
          ) : (
              !examenTerminado ? (
                <button onClick={() => setExamenTerminado(true)} disabled={Object.keys(respuestasUsuario).length < examenActivo.preguntas_json.length} style={{ width: '100%', padding: '15px', fontSize: '18px', fontWeight: 'bold', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '8px', cursor: Object.keys(respuestasUsuario).length < examenActivo.preguntas_json.length ? 'not-allowed' : 'pointer', opacity: Object.keys(respuestasUsuario).length < examenActivo.preguntas_json.length ? 0.5 : 1 }}>
                  Entregar Evaluación
                </button>
              ) : (
                <button onClick={() => setVista('panel_estudiante')} style={{ width: '100%', padding: '15px', fontSize: '18px', fontWeight: 'bold', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Volver a mis Evaluaciones
                </button>
              )
          )}
        </div>
      )}
    </div>
  )
}

export default EvaluacionesIA;