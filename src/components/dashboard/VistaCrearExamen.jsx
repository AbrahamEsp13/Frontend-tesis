// archivo: VistaCrearExamen.jsx
import React from 'react';

function VistaCrearExamen({ 
  numPreguntas, 
  setNumPreguntas, 
  setArchivo, 
  generarCuestionario, 
  cargando, 
  error 
}) {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Crear Nuevo Examen</h2>
      <p className="text-gray-500 mb-8 max-w-xl">Sube tus apuntes en PDF, elige cuántas preguntas necesitas y la Inteligencia Artificial generará la evaluación completa en segundos.</p>
      
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-200">
        <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
          <label className="flex items-center gap-2 font-bold mb-3 text-gray-800 text-lg">
            <span className="material-symbols-outlined text-blue-600">format_list_numbered</span>
            Cantidad de preguntas:
          </label>
          <div className="flex items-center bg-white border border-gray-300 rounded-xl w-36 focus-within:ring-2 focus-within:ring-blue-500">
            <input 
              type="number" min="1" max="15" 
              value={numPreguntas} 
              onChange={(e) => setNumPreguntas(e.target.value)} 
              className="flex-1 p-4 rounded-l-xl border-none text-xl outline-none text-center font-bold text-gray-700" 
            />
            <span className="px-4 text-gray-400 font-bold border-l border-gray-200 text-sm">MAX 15</span>
          </div>
        </div>
        
        <div className="mb-10 bg-gray-50 p-6 rounded-xl border border-gray-100">
          <label className="flex items-center gap-2 font-bold mb-4 text-gray-800 text-lg">
            <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
            Documento Base (PDF):
          </label>
          <input 
            type="file" accept=".pdf" 
            onChange={(e) => setArchivo(e.target.files[0])} 
            className="block w-full text-gray-600 file:mr-4 file:py-3.5 file:px-7 file:rounded-full file:border-0 file:text-base file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer shadow-inner bg-white border border-gray-300 rounded-xl" 
          />
        </div>
        
        <button 
          onClick={generarCuestionario} 
          disabled={cargando} 
          className={`w-full py-4.5 px-6 text-xl font-bold text-white border-none rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex justify-center items-center gap-3 outline-none ${cargando ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'}`}
        >
          {cargando ? <span className="material-symbols-outlined animate-spin">sync</span> : <span className="material-symbols-outlined">auto_awesome</span>}
          {cargando ? "Analizando PDF e IA trabajando..." : "Generar Examen con IA"}
        </button>
      </div>
      {error && (
        <div className="text-red-700 p-5 bg-red-50 rounded-xl mt-6 border border-red-200 flex items-center gap-3">
          <span className="material-symbols-outlined text-3xl">error</span> 
          <div className='flex flex-col'><span className='font-bold'>Ocurrió un error:</span> {error}</div>
        </div>
      )}
    </div>
  );
}

export default VistaCrearExamen;