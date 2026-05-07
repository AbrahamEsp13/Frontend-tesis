import React from 'react';

function VistaPanelEstudiante({ listaHistorial, cargandoHistorial, intentarIniciarExamen }) {
  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">🎓 Evaluaciones Disponibles</h2>
      <p className="text-gray-500 mb-8 max-w-xl">A continuación encontrarás las evaluaciones publicadas por tus docentes. Selecciona una para comenzar. ¡Mucho éxito!</p>
      
      {cargandoHistorial ? (
        <div className="flex flex-col items-center gap-4 text-gray-500 font-bold p-20 justify-center bg-white rounded-3xl border border-gray-100 shadow-sm">
          <span className="material-symbols-outlined animate-spin text-5xl">sync</span> Buscando evaluaciones...
        </div>
      ) : listaHistorial.length === 0 ? (
        <div className="bg-white border p-10 rounded-3xl shadow-sm text-center border-gray-100">
          <span className="material-symbols-outlined text-5xl text-gray-300 mb-4 block animate-pulse">inbox</span>
          <p className="text-gray-500 font-medium m-0 max-w-sm mx-auto">No hay exámenes publicados por tus maestros en este momento. Vuelve a intentarlo más tarde.</p>
        </div>
      ) : (
        listaHistorial.map((registro) => (
          <div key={registro.id} className="bg-white border border-blue-100 p-8 rounded-2xl mb-5 shadow-lg shadow-blue-500/5 transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-center mb-5 gap-4">
              <h3 className="m-0 text-2xl font-bold text-blue-800 flex items-center gap-3 leading-tight">
                <span className="material-symbols-outlined text-3xl">assignment</span> Evaluación: {registro.nombre_documento}
              </h3>
              <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold border border-blue-100 whitespace-nowrap">
                {registro.preguntas_json.length} Preguntas
              </span>
            </div>
            <button onClick={() => intentarIniciarExamen(registro)} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white border-none rounded-xl cursor-pointer font-bold text-xl shadow-md transition-colors flex justify-center items-center gap-2 outline-none">
              <span className="material-symbols-outlined text-2xl">play_circle</span> Iniciar Evaluación
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default VistaPanelEstudiante;