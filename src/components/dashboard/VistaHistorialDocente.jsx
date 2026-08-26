import React from 'react';

function VistaHistorialDocente({
  listaHistorial,
  cargandoHistorial,
  setVista,
  iniciarExamen,
  exportarExamen,
  despublicarCuestionario,
  abrirModalPublicar,
  eliminarExamen,
  compartirEnComunidad
}) {
  return (
    <div>
      {/* CABECERA PRINCIPAL */}
      <div className="flex justify-between items-center mb-8 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">Historial de Exámenes</h2>
          <p className="text-gray-500 dark:text-gray-400">Administra tus evaluaciones, edítalas y publícalas a tus estudiantes.</p>
        </div>
        <button onClick={() => setVista('nuevo')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-7 rounded-2xl shadow-lg shadow-blue-500/30 transition-all cursor-pointer flex items-center gap-2 border-none outline-none text-base">
          ✨ Crear Nuevo
        </button>
      </div>

      {/* ESTADO DE CARGA */}
      {cargandoHistorial ? (
        <div className="flex flex-col items-center gap-4 text-gray-500 dark:text-gray-400 font-bold p-20 justify-center bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 transition-colors">
          <span className="material-symbols-outlined animate-spin text-5xl">sync</span> Cargando tus documentos...
        </div>
      ) : listaHistorial.map((registro) => (
        
        {/* TARJETA DE EXAMEN */}
        <div key={registro.id} className={`bg-white dark:bg-gray-800 border ${registro.publicado ? 'border-green-100 dark:border-green-900/30 border-l-4 border-l-green-500' : 'border-yellow-100 dark:border-yellow-900/30 border-l-4 border-l-yellow-400'} p-7 rounded-2xl mb-5 shadow-sm hover:shadow-md transition-all`}>
          <div className="flex justify-between items-start mb-2 gap-4">
            
            {/* TÍTULO PRINCIPAL */}
            <h3 className="m-0 text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500 dark:text-blue-400">quiz</span> {registro.nombre_examen || "Examen sin título"}
            </h3>
            
            {/* ETIQUETA DE ESTADO */}
            <span className={`text-xs px-3.5 py-2 rounded-full font-bold flex items-center gap-1.5 border whitespace-nowrap ${registro.publicado ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'}`}>
              {registro.publicado ? <><span className="material-symbols-outlined text-[15px]">check_circle</span> Publicado</> : <><span className="material-symbols-outlined text-[15px]">edit_document</span> Borrador</>}
            </span>
          </div>
          
          {/* SUBTÍTULOS: FECHA Y NOMBRE DEL PDF */}
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-3 py-1 rounded-lg border border-gray-100 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300">
              <span className="material-symbols-outlined text-[18px]">category</span> {registro.materia || 'Materia General'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span> {new Date(registro.fecha_creacion).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-gray-400 dark:text-gray-500">picture_as_pdf</span> Archivo base: {registro.nombre_documento}
            </span>
          </div>

          {/* BARRA INFERIOR DE BOTONES */}
          <div className="flex gap-3.5 flex-wrap items-center bg-gray-50/50 dark:bg-gray-900/50 p-3.5 rounded-xl border border-gray-100 dark:border-gray-700">
            <button onClick={() => iniciarExamen(registro)} className="flex items-center gap-2 py-2.5 px-4.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg cursor-pointer font-bold transition-colors shadow-sm text-sm outline-none">
              <span className="material-symbols-outlined text-[19px]">visibility</span> Vista Previa
            </button>
            <button onClick={() => exportarExamen(registro)} className="flex items-center gap-2 py-2.5 px-4.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg cursor-pointer font-bold transition-colors shadow-sm text-sm outline-none">
              <span className="material-symbols-outlined text-[19px]">download</span> Exportar
            </button>
            
            <div className="flex-1"></div> 

            {/* BOTÓN: COMPARTIR EN COMUNIDAD */}
            {registro.compartido_comunidad ? (
              <span className="flex items-center gap-2 py-2.5 px-4.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50 rounded-lg font-bold text-sm cursor-default">
                <span className="material-symbols-outlined text-[19px]">public</span> En Comunidad
              </span>
            ) : (
              <button onClick={() => compartirEnComunidad(registro.id)} className="flex items-center gap-2.5 py-2.5 px-4 bg-white dark:bg-gray-800 border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg cursor-pointer font-bold transition-colors shadow-sm text-sm outline-none">
                <span className="material-symbols-outlined text-[19px]">share</span> Compartir a Comunidad
              </button>
            )}

            {/* BOTONES DE PUBLICAR / OCULTAR */}
            {registro.publicado ? (
              <button onClick={() => despublicarCuestionario(registro.id)} className="flex items-center gap-2.5 py-2.5 px-5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg cursor-pointer font-bold transition-colors text-sm outline-none">
                <span className="material-symbols-outlined text-[19px]">visibility_off</span> Ocultar a Alumnos
              </button>
            ) : (
              <button onClick={() => abrirModalPublicar(registro.id)} className="flex items-center gap-2.5 py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 rounded-lg cursor-pointer font-bold transition-colors shadow-sm text-sm outline-none">
                <span className="material-symbols-outlined text-[19px]">rocket_launch</span> Publicar a Alumnos
              </button>
            )}
            
            {/* BOTÓN ELIMINAR */}
            <button onClick={() => eliminarExamen(registro.id)} className="flex items-center gap-2.5 py-2.5 px-4 bg-transparent text-gray-300 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 border-none rounded-lg cursor-pointer transition-colors outline-none" title="Eliminar">
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default VistaHistorialDocente;