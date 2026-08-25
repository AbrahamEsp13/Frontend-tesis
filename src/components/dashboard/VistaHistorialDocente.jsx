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
  compartirEnComunidad // <--- ACEPTAMOS LA PROP
}) {
  return (
    <div>
      <div className="dark:bg-gray-800 dark:border-gray-700 dark:text-white flex justify-between items-center mb-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="dark:bg-gray-800 dark:border-gray-700 dark:text-white text-3xl font-bold tracking-tight text-gray-900 mb-1">Historial de Exámenes</h2>
          <p className="text-gray-500">Administra tus evaluaciones, edítalas y publícalas a tus estudiantes.</p>
        </div>
        <button onClick={() => setVista('nuevo')} className="dark:bg-gray-800 dark:border-gray-700 dark:text-white bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-7 rounded-2xl shadow-lg shadow-blue-500/30 transition-all cursor-pointer flex items-center gap-2 border-none outline-none text-base">
          ✨ Crear Nuevo
        </button>
      </div>

      {cargandoHistorial ? (
        <div className="dark:bg-gray-800 dark:border-gray-700 dark:text-white flex flex-col items-center gap-4 text-gray-500 font-bold p-20 justify-center bg-white rounded-3xl border border-gray-100">
          <span className="material-symbols-outlined animate-spin text-5xl">sync</span> Cargando tus documentos...
        </div>
      ) : listaHistorial.map((registro) => (
        <div key={registro.id} className={`bg-white border ${registro.publicado ? 'border-green-100 border-l-4 border-l-green-500' : 'border-yellow-100 border-l-4 border-l-yellow-400'} p-7 rounded-2xl mb-5 shadow-sm hover:shadow-md transition-shadow`}>
          <div className="flex justify-between items-start mb-2 gap-4">
            
            {/* TÍTULO PRINCIPAL */}
            <h3 className="dark:bg-gray-800 dark:border-gray-700 dark:text-white m-0 text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500">quiz</span> {registro.nombre_examen || "Examen sin título"}
            </h3>
            
            <span className={`text-xs px-3.5 py-2 rounded-full font-bold flex items-center gap-1.5 border whitespace-nowrap ${registro.publicado ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
              {registro.publicado ? <><span className="material-symbols-outlined text-[15px]">check_circle</span> Publicado</> : <><span className="material-symbols-outlined text-[15px]">edit_document</span> Borrador</>}
            </span>
          </div>
          
          {/* SUBTÍTULOS: FECHA Y NOMBRE DEL PDF */}
          <div className="text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 font-medium">
              <span className="material-symbols-outlined text-[18px]">category</span> {registro.materia || 'Materia General'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span> {new Date(registro.fecha_creacion).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-gray-400">picture_as_pdf</span> Archivo base: {registro.nombre_documento}
            </span>
          </div>

          <div className="flex gap-3.5 flex-wrap items-center bg-gray-50/50 p-3.5 rounded-xl border border-gray-100">
            <button onClick={() => iniciarExamen(registro)} className="flex items-center gap-2 py-2.5 px-4.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 rounded-lg cursor-pointer font-bold transition-colors shadow-sm text-sm outline-none">
              <span className="material-symbols-outlined text-[19px]">visibility</span> Vista Previa
            </button>
            <button onClick={() => exportarExamen(registro)} className="flex items-center gap-2 py-2.5 px-4.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 rounded-lg cursor-pointer font-bold transition-colors shadow-sm text-sm outline-none">
              <span className="material-symbols-outlined text-[19px]">download</span> Exportar
            </button>
            
            <div className="flex-1"></div> 

            {/* NUEVO BOTÓN: COMPARTIR EN COMUNIDAD */}
            {registro.compartido_comunidad ? (
              <span className="flex items-center gap-2 py-2.5 px-4.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg font-bold text-sm cursor-default">
                <span className="material-symbols-outlined text-[19px]">public</span> En Comunidad
              </span>
            ) : (
              <button onClick={() => compartirEnComunidad(registro.id)} className="flex items-center gap-2.5 py-2.5 px-4 bg-white border border-purple-300 text-purple-700 hover:bg-purple-50 rounded-lg cursor-pointer font-bold transition-colors shadow-sm text-sm outline-none">
                <span className="material-symbols-outlined text-[19px]">share</span> Compartir a Comunidad
              </button>
            )}

            {/* BOTONES ORIGINALES DE PUBLICAR Y ELIMINAR */}
            {registro.publicado ? (
              <button onClick={() => despublicarCuestionario(registro.id)} className="flex items-center gap-2.5 py-2.5 px-5 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-lg cursor-pointer font-bold transition-colors text-sm outline-none">
                <span className="material-symbols-outlined text-[19px]">visibility_off</span> Ocultar a Alumnos
              </button>
            ) : (
              <button onClick={() => abrirModalPublicar(registro.id)} className="flex items-center gap-2.5 py-2.5 px-5 bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer font-bold transition-colors shadow-sm text-sm outline-none">
                <span className="material-symbols-outlined text-[19px]">rocket_launch</span> Publicar a Alumnos
              </button>
            )}
            
            <button onClick={() => eliminarExamen(registro.id)} className="flex items-center gap-2.5 py-2.5 px-4 bg-transparent text-gray-300 hover:text-red-600 border-none rounded-lg cursor-pointer transition-colors outline-none" title="Eliminar">
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default VistaHistorialDocente;