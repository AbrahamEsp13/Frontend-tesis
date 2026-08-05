import React, { useState, useEffect } from 'react';

function VistaExamen({
  rol,
  examenActivo,
  modoEdicion,
  setModoEdicion,
  setModalAlertaEdicion,
  examenTerminado,
  calcularCalificacion,
  respuestasUsuario,
  eliminarPregunta,
  actualizarPregunta,
  actualizarOpcion,
  seleccionarOpcion,
  agregarPreguntaVacia,
  guardarEdicionEnBackend,
  setVista,
  intentarEntregarEvaluacion,
  salirDelExamen,
  modoExamenActivo,
  reiniciarExamen
}) {

  // --- LÓGICA DEL CRONÓMETRO ---
  const [tiempoSegundos, setTiempoSegundos] = useState(0);

  // Reiniciar el reloj si se reintenta el examen (cuando se limpian las respuestas)
  useEffect(() => {
    if (!examenTerminado && Object.keys(respuestasUsuario).length === 0) {
      setTiempoSegundos(0);
    }
  }, [examenTerminado, respuestasUsuario]);

  // Ejecutar el reloj solo si es estudiante, está en el examen y no ha terminado
  useEffect(() => {
    let intervalo = null;
    if (modoExamenActivo && !examenTerminado) {
      intervalo = setInterval(() => {
        setTiempoSegundos((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalo); // Detener el reloj
    }
    return () => clearInterval(intervalo); // Limpieza de memoria
  }, [modoExamenActivo, examenTerminado]);

  // Convertir segundos a formato MM:SS
  const formatearTiempo = (totalSegundos) => {
    const minutos = Math.floor(totalSegundos / 60).toString().padStart(2, '0');
    const segundos = (totalSegundos % 60).toString().padStart(2, '0');
    return `${minutos}:${segundos}`;
  };

  // --- LÓGICA DE CALIFICACIONES ---
  const resultados = examenTerminado ? calcularCalificacion() : { obtenido: 0, total: 0 };
  const porcentaje = resultados.total > 0 ? Math.round((resultados.obtenido / resultados.total) * 100) : 0;
  const calificacionBase10 = resultados.total > 0 ? ((resultados.obtenido / resultados.total) * 10).toFixed(1) : "0.0";

  return (
    <div className={`mx-auto ${modoExamenActivo ? 'max-w-4xl py-6' : 'max-w-4xl'}`}>
      
      {/* CABECERA DEL EXAMEN */}
      <div className={`bg-white rounded-3xl p-8 mb-6 ${modoExamenActivo ? 'border-b-4 border-b-blue-600 shadow-sm' : 'border border-gray-100 shadow-sm'}`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{examenActivo.nombre_examen || examenActivo.nombre_documento}</h2>
            <div className="flex items-center gap-4 text-gray-500 font-medium text-sm">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">category</span> {examenActivo.materia || 'General'}</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">format_list_numbered</span> {examenActivo.preguntas_json.length} Preguntas</span>
            </div>
          </div>
          
          {/* Reloj en vivo para el estudiante */}
          {modoExamenActivo && !examenTerminado && (
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold border border-blue-100 text-lg">
              <span className="material-symbols-outlined">timer</span>
              {formatearTiempo(tiempoSegundos)}
            </div>
          )}

          {rol === 'docente' && !modoExamenActivo && (
            <div className="flex items-center gap-3">
              <button onClick={salirDelExamen} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors outline-none cursor-pointer">
                Volver
              </button>
              {modoEdicion ? (
                <button onClick={guardarEdicionEnBackend} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors shadow-md outline-none cursor-pointer">
                  <span className="material-symbols-outlined text-[20px]">save</span> Guardar
                </button>
              ) : (
                <button onClick={() => { examenActivo.publicado ? setModalAlertaEdicion(true) : setModoEdicion(true) }} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-md outline-none cursor-pointer">
                  <span className="material-symbols-outlined text-[20px]">edit</span> Editar
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* PANTALLA DE RESULTADOS DEL ESTUDIANTE */}
      {examenTerminado && rol === 'estudiante' && (
        <div className="bg-white rounded-3xl p-10 mb-8 text-center border border-gray-100 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-blue-500 to-purple-600"></div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Evaluación Finalizada</h2>
          <p className="text-gray-500 mb-8 text-lg">Aquí tienes el resumen de tu desempeño</p>
          
          {/* RESULTADO PRINCIPAL: SOBRE 10 */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200 w-64 shadow-inner">
              <div className={`text-7xl font-black mb-2 ${calificacionBase10 >= 6.0 ? 'text-green-500' : 'text-red-500'}`}>
                {calificacionBase10}
              </div>
              <div className="text-gray-500 font-bold text-sm uppercase tracking-wider">Calificación Final</div>
            </div>
          </div>

          {/* MÉTRICAS COMPLEMENTARIAS (MOCKUP EXACTO) */}
          <div className="flex justify-center gap-6 mb-10">
            {/* Tarjeta 1: Puntos */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 w-48 shadow-sm">
              <div className="text-3xl font-bold text-blue-800">{resultados.obtenido} <span className="text-xl text-gray-400">/ {resultados.total}</span></div>
              <div className="text-gray-400 font-bold text-xs uppercase tracking-wider mt-2">Puntos Netos</div>
            </div>
            
            {/* Tarjeta 2: Precisión */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 w-48 shadow-sm">
              <div className="text-3xl font-bold text-blue-800">{porcentaje}%</div>
              <div className="text-gray-400 font-bold text-xs uppercase tracking-wider mt-2">Precisión</div>
            </div>

            {/* Tarjeta 3: Cronómetro */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 w-48 shadow-sm">
              <div className="text-3xl font-bold text-blue-600">{formatearTiempo(tiempoSegundos)}</div>
              <div className="text-gray-400 font-bold text-xs uppercase tracking-wider mt-2">Tiempo Total</div>
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            <button onClick={salirDelExamen} className="px-8 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors outline-none cursor-pointer text-lg border border-gray-200">
              Volver al Inicio
            </button>
            <button onClick={reiniciarExamen} className="px-8 py-3.5 bg-blue-600 text-white hover:bg-blue-700 font-bold rounded-xl transition-colors shadow-md outline-none cursor-pointer text-lg">
              Reintentar Examen
            </button>
          </div>
        </div>
      )}

      {/* LISTA DE PREGUNTAS */}
      <div className="space-y-6 pb-20">
        {examenActivo.preguntas_json.map((pregunta, index) => (
          <div key={index} className={`bg-white rounded-3xl p-8 border ${examenTerminado ? (respuestasUsuario[index] === pregunta.respuesta_correcta ? 'border-green-200 shadow-sm' : 'border-red-200 shadow-sm') : 'border-gray-100 shadow-sm'}`}>
            
            <div className="flex justify-between items-start mb-6 gap-4">
              <div className="flex gap-4 w-full">
                <div className="w-10 h-10 shrink-0 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
                <div className="w-full">
                  
                  {/* EDITAR PUNTAJE O MOSTRAR PUNTAJE */}
                  {modoEdicion ? (
                    <div className="flex items-center gap-2 mb-3 bg-gray-50 p-2 rounded-lg border border-gray-200 w-max">
                      <span className="text-sm font-bold text-gray-500 ml-2">Valor (Puntos):</span>
                      <input 
                        type="number" 
                        min="1"
                        max="100"
                        value={pregunta.puntuacion || 1} 
                        onChange={(e) => {
                          let valor = Number(e.target.value);
                          if (valor > 100) valor = 100; // Límite máximo
                          if (valor < 1) valor = 1;     // Límite mínimo
                          actualizarPregunta(index, 'puntuacion', valor);
                        }}
                        className="w-16 p-1 text-center border border-gray-300 rounded font-bold text-blue-600 outline-none focus:border-blue-500"
                      />
                    </div>
                  ) : (
                    <div className="mb-2">
                      <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-100">
                        💎 {pregunta.puntuacion || 1} {Number(pregunta.puntuacion || 1) === 1 ? 'Punto' : 'Puntos'}
                      </span>
                    </div>
                  )}

                  {/* TEXTO DE LA PREGUNTA */}
                  {modoEdicion ? (
                    <textarea 
                      value={pregunta.pregunta} 
                      onChange={(e) => actualizarPregunta(index, 'pregunta', e.target.value)}
                      className="w-full p-4 border border-blue-300 rounded-xl mb-4 text-lg font-bold text-gray-900 bg-blue-50/30 outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[100px]"
                    />
                  ) : (
                    <h3 className="text-xl font-bold text-gray-900 mt-1">{pregunta.pregunta}</h3>
                  )}
                </div>
              </div>

              {modoEdicion && (
                <button onClick={() => eliminarPregunta(index)} className="w-10 h-10 shrink-0 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 rounded-full cursor-pointer transition-colors outline-none" title="Eliminar pregunta">
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              )}
            </div>

            {/* OPCIONES DE RESPUESTA */}
            <div className="pl-14 space-y-3">
              {pregunta.opciones.map((opcion, i) => {
                const esSeleccionada = respuestasUsuario[index] === opcion;
                const esCorrecta = opcion === pregunta.respuesta_correcta;
                
                let clasesOpcion = "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 cursor-pointer outline-none ";
                
                if (modoEdicion) {
                  clasesOpcion += esCorrecta ? "border-green-500 bg-green-50" : "border-gray-200 bg-white hover:border-gray-300";
                } else if (examenTerminado) {
                  if (esCorrecta) clasesOpcion += "border-green-500 bg-green-50 text-green-800 font-bold";
                  else if (esSeleccionada && !esCorrecta) clasesOpcion += "border-red-500 bg-red-50 text-red-800";
                  else clasesOpcion += "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed";
                } else {
                  clasesOpcion += esSeleccionada ? "border-blue-500 bg-blue-50 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50";
                }

                return (
                  <div key={i} className="relative flex items-center gap-2">
                    {modoEdicion && (
                      <input 
                        type="radio" 
                        name={`correcta-${index}`} 
                        checked={esCorrecta} 
                        onChange={() => actualizarPregunta(index, 'respuesta_correcta', opcion)}
                        className="w-5 h-5 cursor-pointer accent-green-600"
                        title="Marcar como respuesta correcta"
                      />
                    )}
                    
                    <button 
                      disabled={examenTerminado || modoEdicion} 
                      onClick={() => seleccionarOpcion(index, opcion)} 
                      className={clasesOpcion}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex shrink-0 items-center justify-center ${
                        examenTerminado ? (esCorrecta ? 'border-green-500 bg-green-500' : (esSeleccionada ? 'border-red-500 bg-red-500' : 'border-gray-300')) : 
                        (esSeleccionada || (modoEdicion && esCorrecta) ? 'border-blue-600 bg-blue-600' : 'border-gray-300')
                      }`}>
                        {(examenTerminado && esCorrecta) || (esSeleccionada && !examenTerminado) || (modoEdicion && esCorrecta) ? <div className="w-2 h-2 bg-white rounded-full"></div> : null}
                      </div>
                      
                      {modoEdicion ? (
                        <input 
                          type="text" 
                          value={opcion} 
                          onChange={(e) => actualizarOpcion(index, i, e.target.value)}
                          className="w-full bg-transparent outline-none text-gray-800"
                        />
                      ) : (
                        <span className="text-gray-800">{opcion}</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* RETROALIMENTACIÓN / JUSTIFICACIÓN */}
            {(modoEdicion || (examenTerminado && rol !== 'estudiante')) && (
              <div className="mt-6 pl-14">
                <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
                  <h4 className="flex items-center gap-2 font-bold text-yellow-800 mb-2">
                    <span className="material-symbols-outlined text-[20px]">lightbulb</span> 
                    {modoEdicion ? 'Retroalimentación Pedagógica (Visible al evaluar):' : 'Justificación de la IA:'}
                  </h4>
                  {modoEdicion ? (
                    <textarea 
                      value={pregunta.justificacion_pedagogica} 
                      onChange={(e) => actualizarPregunta(index, 'justificacion_pedagogica', e.target.value)}
                      className="w-full p-3 border border-yellow-200 rounded-lg text-sm text-yellow-900 bg-white outline-none focus:ring-2 focus:ring-yellow-400 resize-none min-h-[80px]"
                    />
                  ) : (
                    <p className="text-sm text-yellow-900 leading-relaxed">{pregunta.justificacion_pedagogica}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* BOTÓN PARA AGREGAR PREGUNTA (MODO EDICIÓN) */}
      {modoEdicion && (
        <button onClick={agregarPreguntaVacia} className="w-full py-4 mb-10 border-2 border-dashed border-gray-300 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 outline-none cursor-pointer">
          <span className="material-symbols-outlined">add_circle</span> Agregar Pregunta Manual
        </button>
      )}

      {/* BOTÓN DE ENTREGAR PARA ESTUDIANTE */}
      {modoExamenActivo && !examenTerminado && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-50 flex justify-center">
          <button onClick={intentarEntregarEvaluacion} className="w-full max-w-md py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl transition-colors shadow-lg shadow-green-500/30 text-lg outline-none cursor-pointer">
            Entregar Evaluación
          </button>
        </div>
      )}
    </div>
  );
}

export default VistaExamen;