import React from 'react';

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
  reiniciarExamen // <-- NUEVA PROP
}) {
  return (
    <div className={`text-left ${modoExamenActivo ? 'bg-transparent' : 'bg-white p-10 rounded-3xl shadow-sm border border-gray-200'}`}>
      
      {/* CABECERA DINÁMICA (SÓLO VISIBLE PARA DOCENTES) */}
      {rol === 'docente' && !modoExamenActivo && (
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
          <div>
            <span className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-1 block">
              {modoEdicion ? '✏️ Modo Edición (Docente)' : '👁️ Vista Previa del Docente'}
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 m-0">
              {examenActivo.nombre_examen || examenActivo.nombre_documento}
            </h2>
          </div>
          
          {!modoEdicion && (
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
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100 mb-10">
          <header className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-2">
            <div>
              <div className="flex items-center gap-2 text-blue-600 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Resultados Obtenidos</span>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="text-xs font-bold uppercase tracking-wider">Retroalimentación IA</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 m-0">
                 {examenActivo.nombre_examen || examenActivo.nombre_documento}
              </h1>
              <p className="text-gray-500 mt-2.5 max-w-lg">Revisa tus aciertos, errores y la retroalimentación basada en el material de estudio proporcionado.</p>
            </div>
            
            {/* CONTENEDOR DERECHO: BOTONES Y PUNTUACIÓN */}
            <div className="flex flex-col items-end gap-6">
              
              {/* NUEVOS BOTONES ESTILO IMAGEN */}
              {rol === 'estudiante' && (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => alert("El visor del PDF original estará disponible en la próxima actualización del sistema.")}
                    className="px-5 py-2.5 bg-white border border-gray-200 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors text-sm shadow-sm outline-none cursor-pointer"
                  >
                    Ver documento
                  </button>
                  <button 
                    onClick={reiniciarExamen}
                    className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md text-sm outline-none cursor-pointer"
                  >
                    Volver a intentar
                  </button>
                </div>
              )}

              <div className="text-right mt-2">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest block mb-1">Tu Puntuación</span>
                <div className='flex items-end justify-end gap-1.5'>
                  <span className="text-6xl font-extrabold text-blue-700 leading-none">{calcularCalificacion()}</span>
                  <span className="text-3xl font-extrabold text-blue-200 pb-1">/ {examenActivo.preguntas_json.length}</span>
                </div>
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
  );
}

export default VistaExamen;