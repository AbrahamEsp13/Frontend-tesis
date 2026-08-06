import React from 'react';

// Nota: Agregué 'archivo' a los parámetros para poder mostrar el nombre del PDF cuando se seleccione
function VistaCrearExamen({ 
  nombreExamen, setNombreExamen, 
  materia, setMateria, 
  numPreguntas, setNumPreguntas, 
  archivo, setArchivo, 
  generarCuestionario, 
  cargando, error, 
  creditos 
}) {
  
  const sinCreditos = creditos <= 0;

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 items-start mt-4">
      
      {/* ========================================== */}
      {/* COLUMNA IZQUIERDA: TEXTO Y CARACTERÍSTICAS */}
      {/* ========================================== */}
      <div className="w-full md:w-5/12">
        <span className="text-blue-600 font-bold tracking-wider text-sm uppercase">Paso 01</span>
        <h2 className="text-5xl font-extrabold text-gray-900 mt-2 mb-6 leading-tight">
          Transforma tu <br />Material de Estudio.
        </h2>
        
        <p className="text-gray-500 text-lg mb-10 leading-relaxed pr-4">
          Sube tus apuntes, libros de texto o investigaciones en formato PDF. Nuestra IA analizará la estructura y extraerá los conceptos clave para construir una ruta de aprendizaje personalizada.
        </p>
        
        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-blue-50/50 p-3 rounded-2xl border border-blue-50/0 hover:border-blue-100 transition-colors w-max pr-6">
             <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
               <span className="material-symbols-outlined">check_circle</span>
             </div>
             <span className="font-bold text-gray-800">Extracción de temas automática</span>
          </div>
          
          <div className="flex items-center gap-4 bg-blue-50/50 p-3 rounded-2xl border border-blue-50/0 hover:border-blue-100 transition-colors w-max pr-6">
             <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
               <span className="material-symbols-outlined">contact_support</span>
             </div>
             <span className="font-bold text-gray-800">Generación adaptativa de preguntas</span>
          </div>
          
          <div className="flex items-center gap-4 bg-blue-50/50 p-3 rounded-2xl border border-blue-50/0 hover:border-blue-100 transition-colors w-max pr-6">
             <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
               <span className="material-symbols-outlined">auto_awesome</span>
             </div>
             <span className="font-bold text-gray-800">Creador de retroalimentación IA</span>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* COLUMNA DERECHA: FORMULARIO Y DRAG & DROP  */}
      {/* ========================================== */}
      <div className="w-full md:w-7/12">
        
        {/* ALERTA DE CRÉDITOS AGOTADOS */}
        {sinCreditos && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-3xl p-6 flex items-start gap-4 shadow-sm">
            <div className="bg-red-100 text-red-600 rounded-full w-12 h-12 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">timer</span>
            </div>
            <div>
              <h3 className="text-red-800 font-bold text-lg">Has agotado tus créditos por hoy</h3>
              <p className="text-red-600 mt-1 leading-relaxed">
                Para proteger los recursos del sistema, tienes un límite diario de generaciones. 
                Tus créditos se regenerarán a la <strong>medianoche (00:00 hrs)</strong>.
              </p>
            </div>
          </div>
        )}

        <div className={`space-y-6 ${sinCreditos ? 'opacity-50 pointer-events-none' : ''}`}>
          
          {/* FILA 1: Nombre y Materia */}
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-2">Nombre del Examen</label>
              <input 
                type="text" 
                value={nombreExamen}
                onChange={(e) => setNombreExamen(e.target.value)}
                placeholder="Ej. Parcial 1: Historia Universal"
                className="w-full p-4 bg-white border border-gray-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-2">Materia</label>
              <select 
                value={materia}
                onChange={(e) => setMateria(e.target.value)}
                className="w-full p-4 bg-white border border-gray-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium cursor-pointer"
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
          </div>

          {/* FILA 2: Slider de Preguntas */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex justify-between">
              <span>Cantidad de reactivos</span>
              <span className="text-blue-600">{numPreguntas} Preguntas</span>
            </label>
            <input 
              type="range" 
              min="1" 
              max="20" 
              value={numPreguntas}
              onChange={(e) => setNumPreguntas(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* FILA 3: Drag & Drop PDF */}
          <label className="block w-full border-2 border-dashed border-gray-300 rounded-[2rem] p-12 text-center bg-white hover:bg-gray-50/80 transition-all cursor-pointer relative shadow-sm group">
            
            {/* Indicador de archivo seleccionado */}
            {archivo ? (
              <div className="flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-100 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-4xl text-green-600">task</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">¡Archivo cargado listo!</h3>
                <p className="text-blue-600 font-bold bg-blue-50 px-4 py-2 rounded-lg truncate max-w-[250px] inline-block">{archivo.name}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100 group-hover:scale-105 transition-transform group-hover:bg-blue-50 group-hover:border-blue-100">
                  <span className="material-symbols-outlined text-4xl text-blue-600">upload_file</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Sube tu PDF aquí</h3>
                <p className="text-gray-500 mb-8">O haz clic para buscar en tu dispositivo</p>
                <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">Tamaño máximo: 50MB</p>
              </div>
            )}
            
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf"
              onChange={(e) => setArchivo(e.target.files[0])}
            />
          </label>

          {/* BOTÓN DE GENERAR */}
          <button 
            onClick={generarCuestionario} 
            disabled={cargando || sinCreditos} 
            className={`w-full py-5 text-white font-bold rounded-2xl transition-all shadow-lg flex justify-center items-center gap-3 text-lg outline-none mt-2 ${
              sinCreditos ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30 cursor-pointer'
            }`}
          >
            {cargando ? (
              <><span className="material-symbols-outlined animate-spin text-2xl">sync</span> Analizando estructura...</>
            ) : (
              <><span className="material-symbols-outlined text-2xl">auto_awesome</span> Generar Examen con IA</>
            )}
          </button>

        </div>
      </div>
    </div>
  );
}

export default VistaCrearExamen;