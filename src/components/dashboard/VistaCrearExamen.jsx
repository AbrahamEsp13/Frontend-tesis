import React from 'react';

// Asegúrate de recibir 'creditos' en los parámetros
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
              Para proteger los recursos del sistema, tienes un límite diario de generaciones con Inteligencia Artificial. 
              Tus créditos se regenerarán automáticamente a la **medianoche (00:00 hrs)**.
            </p>
          </div>
        </div>
      )}

      {/* EL RESTO DE TU FORMULARIO... */}
      <div className={`space-y-6 ${sinCreditos ? 'opacity-50 pointer-events-none' : ''}`}>
        
        {/* Aquí van tus inputs normales (Nombre del examen, Materia, etc.) */}
        
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