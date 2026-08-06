import React from 'react';

function VistaCrearExamen({ 
  nombreExamen, setNombreExamen, 
  materia, setMateria, 
  numPreguntas, setNumPreguntas, 
  setArchivo, generarCuestionario, 
  cargando, error, 
  creditos 
}) {
  
  // Constante lógica para saber si bloqueamos todo
  const sinCreditos = creditos <= 0;

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Crear Nuevo Examen Mágico</h2>
      
      {/* ALERTA DE CRÉDITOS AGOTADOS */}
      {sinCreditos && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="bg-red-100 text-red-600 rounded-full w-12 h-12 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">timer</span>
          </div>
          <div>
            <h3 className="text-red-800 font-bold text-lg">Has agotado tus créditos por hoy</h3>
            <p className="text-red-600 mt-1">
              Para proteger los recursos del sistema, tienes un límite diario de 
              generaciones con Inteligencia Artificial. Tus créditos se regenerarán 
              automáticamente a la <strong>medianoche (00:00 hrs)</strong>.
            </p>
          </div>
        </div>
      )}

      {/* CONTENEDOR DEL FORMULARIO (Se opaca si no hay créditos) */}
      <div className={`space-y-6 ${sinCreditos ? 'opacity-50 pointer-events-none' : ''}`}>
        
        {/* INPUT: Nombre del Examen */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Nombre del Examen</label>
          <input 
            type="text" 
            value={nombreExamen}
            onChange={(e) => setNombreExamen(e.target.value)}
            placeholder="Ej. Parcial 1: Historia Universal"
            className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />
        </div>

        {/* INPUT: Materia */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Materia</label>
          <select 
            value={materia}
            onChange={(e) => setMateria(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
          >
            <option value="">Selecciona una materia...</option>
            <option value="Matemáticas">Matemáticas</option>
            <option value="Historia">Historia</option>
            <option value="Ciencias">Ciencias</option>
            <option value="Lenguaje">Lenguaje</option>
            <option value="Programación">Programación</option>
            <option value="Otra">Otra</option>
          </select>
        </div>

        {/* INPUT: Número de Preguntas */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Número de Preguntas ({numPreguntas})</label>
          <input 
            type="range" 
            min="1" 
            max="20" 
            value={numPreguntas}
            onChange={(e) => setNumPreguntas(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        {/* INPUT: Archivo PDF */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Documento Base (PDF)</label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <span className="material-symbols-outlined text-3xl text-gray-400 mb-2">upload_file</span>
                <p className="text-sm text-gray-500 font-semibold">Haz clic para subir tu PDF</p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept=".pdf"
                onChange={(e) => setArchivo(e.target.files[0])}
              />
            </label>
          </div>
          {/* Muestra el nombre del archivo si ya se subió uno */}
          <div className="mt-2 text-sm text-gray-500 font-medium text-center">
             {/* eslint-disable-next-line react/prop-types */}
             {/* (Nota: en un entorno real validamos si "archivo" existe antes de imprimir su nombre) */}
          </div>
        </div>
        
        {/* BOTÓN DE GENERAR */}
        <button 
          onClick={generarCuestionario} 
          disabled={cargando || sinCreditos} 
          className={`w-full py-4 text-white font-bold rounded-xl transition-colors shadow-md flex justify-center items-center gap-2 text-lg outline-none ${
            sinCreditos ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
          }`}
        >
          {cargando ? (
            <><span className="material-symbols-outlined animate-spin">sync</span> Procesando PDF con IA...</>
          ) : (
            <><span className="material-symbols-outlined">auto_awesome</span> Generar Examen</>
          )}
        </button>

      </div>
    </div>
  );
}

export default VistaCrearExamen;