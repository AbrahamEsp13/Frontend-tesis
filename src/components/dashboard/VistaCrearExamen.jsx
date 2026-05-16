import React, { useState } from 'react';

function VistaCrearExamen({ 
  nombreExamen,       // <-- NUEVA PROP
  setNombreExamen,    // <-- NUEVA PROP
  numPreguntas, 
  setNumPreguntas, 
  setArchivo, 
  generarCuestionario, 
  cargando, 
  error 
}) {
  const [nombreArchivoMostrado, setNombreArchivoMostrado] = useState(null);

  const manejarCambioArchivo = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivo(file); 
      setNombreArchivoMostrado(file.name); 
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-start">
      
      {/* --- COLUMNA IZQUIERDA: TEXTO INFORMATIVO --- */}
      <div className="md:col-span-2 space-y-6 pt-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-2xl text-blue-700">
            <span className="material-symbols-outlined text-3xl">auto_awesome</span>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 m-0">
            Genera tu examen mágico
          </h2>
        </div>
        
        <p className="text-lg text-gray-600 leading-relaxed">
          Sube tus apuntes, presentaciones o libros en formato PDF. Nuestra Inteligencia Artificial analizará el contenido y creará una evaluación personalizada en cuestión de segundos.
        </p>

        <div className="space-y-5 pt-4">
          <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold border border-blue-100 shrink-0">1</span>
            <p className="font-semibold text-gray-700 m-0">Dale un nombre a tu evaluación</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold border border-blue-100 shrink-0">2</span>
            <p className="font-semibold text-gray-700 m-0">Carga tus documentos PDF base</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold border border-blue-100 shrink-0">3</span>
            <p className="font-semibold text-gray-700 m-0">¡Deja que la IA haga la magia!</p>
          </div>
        </div>
      </div>

      {/* --- COLUMNA DERECHA: ACCIONES --- */}
      <div className="md:col-span-3 space-y-8">

        {/* 0. NUEVO INPUT: NOMBRE DEL EXAMEN */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <label className="block font-bold text-gray-800 text-lg mb-3">
            Título de la evaluación:
          </label>
          <input 
            type="text"
            value={nombreExamen}
            onChange={(e) => setNombreExamen(e.target.value)}
            placeholder="Ej. Parcial de Programación Orientada a Objetos"
            className="w-full p-4 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-700 font-medium"
            disabled={cargando}
          />
        </div>
        
        {/* 1. DROPZONE ORIGINAL */}
        <div className="bg-white p-10 rounded-3xl shadow-lg border-2 border-dashed border-gray-300 flex flex-col items-center text-center group hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer relative">
          <span className="material-symbols-outlined text-7xl text-gray-400 group-hover:text-blue-500 transition-colors mb-5">
            cloud_upload
          </span>
          
          {nombreArchivoMostrado ? (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center gap-3 w-full justify-center">
              <span className="material-symbols-outlined text-red-500 text-3xl">picture_as_pdf</span>
              <span className="font-bold text-blue-900 truncate max-w-xs">{nombreArchivoMostrado}</span>
              <span className="material-symbols-outlined text-green-500">check_circle</span>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-bold text-gray-800 mb-2 m-0">Arrastra y suelta tu PDF aquí</h3>
              <p className="text-gray-500 mb-6 m-0">o haz clic para explorar tus archivos</p>
            </>
          )}

          <p className="text-xs text-gray-400 mt-5 m-0">Solo archivos PDF (Máx. 25MB)</p>

          <input 
            type="file" 
            accept=".pdf" 
            onChange={manejarCambioArchivo} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            id="fileUpload"
            disabled={cargando}
          />
          
          {!nombreArchivoMostrado && (
             <label htmlFor="fileUpload" className="mt-6 py-3 px-8 bg-gray-100 group-hover:bg-blue-600 text-gray-700 group-hover:text-white font-bold rounded-full transition-colors cursor-pointer shadow-sm text-sm">
               Seleccionar archivo
             </label>
          )}
        </div>

        {/* 2. TARJETA DE CONFIGURACIÓN ORIGINAL */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-5">
            <span className="material-symbols-outlined text-blue-600">settings</span>
            <h3 className="text-xl font-bold text-gray-900 m-0">Configuración del examen</h3>
          </div>

          <div className="space-y-3">
            <label htmlFor="numPreguntas" className="block font-bold text-gray-800 text-lg">
              Cantidad de preguntas a generar:
            </label>
            
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 mt-2">
              <div className="flex items-center bg-gray-50 border border-gray-300 rounded-xl w-48 sm:w-52 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all shrink-0">
                <input 
                  id="numPreguntas"
                  type="number" 
                  min="1" 
                  max="15" 
                  value={numPreguntas} 
                  onChange={(e) => setNumPreguntas(e.target.value)} 
                  className="w-full p-4 rounded-l-xl border-none text-2xl outline-none text-center font-extrabold text-gray-700 bg-transparent" 
                  disabled={cargando}
                />
                <span className="px-4 text-gray-500 font-bold border-l border-gray-200 text-sm shrink-0">preguntas</span>
              </div>
              <p className="text-sm text-gray-500 m-0 leading-tight">
                Recomendado: 5 a 15 reactivos para mayor precisión.
              </p>
            </div>

          </div>
        </div>
        
        {/* BOTÓN DE GENERAR (AQUÍ REVISAMOS QUE ESTÉ EL NOMBRE Y EL ARCHIVO) */}
        <button 
          onClick={generarCuestionario} 
          disabled={cargando || !nombreArchivoMostrado || !nombreExamen.trim()} 
          className={`w-full py-5 px-6 text-xl font-bold text-white border-none rounded-2xl shadow-xl transition-all flex justify-center items-center gap-3 outline-none shadow-blue-500/20 ${cargando || !nombreArchivoMostrado || !nombreExamen.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer hover:-translate-y-0.5'}`}
        >
          {cargando ? <span className="material-symbols-outlined animate-spin text-2xl">sync</span> : <span className="material-symbols-outlined text-2xl">auto_awesome</span>}
          {cargando ? "La IA está analizando tu PDF..." : "¡Generar Examen Mágico!"}
        </button>

        {error && (
          <div className="text-red-700 p-5 bg-red-50 rounded-2xl mt-6 border border-red-200 flex items-center gap-3 shadow-inner">
            <span className="material-symbols-outlined text-3xl">error</span> 
            <div className='flex flex-col'>
              <span className='font-bold'>Ocurrió un pequeño problema:</span> 
              <span className='text-sm'>{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VistaCrearExamen;