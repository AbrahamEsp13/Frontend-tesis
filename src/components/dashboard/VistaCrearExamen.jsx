import React from 'react';

function VistaCrearExamen({ 
  nombreExamen, 
  setNombreExamen, 
  numPreguntas, 
  setNumPreguntas, 
  setArchivo, 
  generarCuestionario, 
  cargando 
}) {
  
  const manejarCambioArchivo = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setArchivo(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Generar Nuevo Examen</h2>
        <p className="text-gray-500">
          Sube tu material en PDF, ponle un nombre a la evaluación y la IA de Gemini se encargará de crear el cuestionario automáticamente.
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        
        {/* INPUT: NOMBRE DEL EXAMEN */}
        <div className="mb-8">
          <label className="block text-sm font-bold text-gray-700 mb-2">Título de la Evaluación <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            value={nombreExamen}
            onChange={(e) => setNombreExamen(e.target.value)}
            placeholder="Ej. Primer Parcial de Programación Orientada a Objetos"
            className="w-full p-4 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-gray-800"
            disabled={cargando}
          />
        </div>

        {/* INPUT: ARCHIVO PDF */}
        <div className="mb-8">
          <label className="block text-sm font-bold text-gray-700 mb-2">Documento Base (PDF) <span className="text-red-500">*</span></label>
          <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:bg-blue-50/50 hover:border-blue-300 transition-colors">
            <input 
              type="file" 
              accept="application/pdf"
              onChange={manejarCambioArchivo}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={cargando}
            />
            <div className="pointer-events-none">
              <span className="material-symbols-outlined text-4xl text-blue-500 mb-3">upload_file</span>
              <p className="font-bold text-gray-700 text-lg mb-1">Haz clic para subir tu PDF</p>
              <p className="text-gray-400 text-sm">El texto será extraído para generar las preguntas.</p>
            </div>
          </div>
        </div>

        {/* INPUT: CANTIDAD DE PREGUNTAS */}
        <div className="mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <span className="material-symbols-outlined text-gray-400">format_list_numbered</span>
              Cantidad de reactivos a generar
            </label>
            <span className="bg-blue-100 text-blue-700 font-black px-4 py-1.5 rounded-lg text-lg">
              {numPreguntas}
            </span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="20" 
            value={numPreguntas}
            onChange={(e) => setNumPreguntas(e.target.value)}
            className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            disabled={cargando}
          />
          <div className="flex justify-between text-xs font-bold text-gray-400 mt-2 px-1">
            <span>1</span>
            <span>20 MAX</span>
          </div>
        </div>

        {/* BOTÓN GENERAR */}
        <button
          onClick={generarCuestionario}
          disabled={cargando}
          className={`w-full py-4.5 rounded-2xl font-extrabold text-white transition-all text-lg shadow-lg flex items-center justify-center gap-3 border-none outline-none ${
            cargando ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30 active:scale-[0.98] cursor-pointer'
          }`}
        >
          {cargando ? (
            <>
              <span className="material-symbols-outlined animate-spin text-2xl">sync</span>
              Analizando documento con IA...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-2xl">auto_awesome</span>
              Generar Evaluación Ahora
            </>
          )}
        </button>

      </div>
    </div>
  );
}

export default VistaCrearExamen;