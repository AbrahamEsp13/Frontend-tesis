import React from 'react';

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

  // LISTA COMPLETA DE MATERIAS
  const listaMaterias = [
    "Matemáticas", "Física", "Química", "Biología", 
    "Historia", "Geografía", "Literatura y Lenguaje", 
    "Inglés", "Programación / Informática", "Ingeniería de Software", 
    "Filosofía", "Artes", "Educación Física", "Otro"
  ];

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 items-start mt-4">
      
      {/* ========================================== */}
      {/* COLUMNA IZQUIERDA: TEXTO Y CARACTERÍSTICAS */}
      {/* ========================================== */}
      <div className="w-full md:w-5/12">
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

        <div className={`space-y-8 ${sinCreditos ? 'opacity-50 pointer-events-none' : ''}`}>
          
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
                {listaMaterias.map((mat, i) => (
                  <option key={i} value={mat}>{mat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* FILA 2: Input Numérico de Preguntas */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Cantidad de preguntas a generar:</label>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-4">
              <div className="flex items-center bg-white border border-gray-200 rounded-2xl w-48 sm:w-52 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all shrink-0 overflow-hidden">
                <input 
                  type="number" 
                  min="1" 
                  max="15" 
                  value={numPreguntas} 
                  onChange={(e) => setNumPreguntas(Number(e.target.value))} 
                  className="w-full p-3 rounded-l-xl border-none text-xl outline-none text-center font-extrabold text-gray-700 bg-transparent" 
                />
                <span className="px-4 text-gray-500 font-bold border-l border-gray-200 text-sm shrink-0 bg-gray-50 py-4">preguntas</span>
              </div>
              <p className="text-sm text-gray-500 m-0 leading-tight">
                Recomendado: 5 a 15 reactivos para mayor precisión.
              </p>
            </div>
          </div>

          {/* FILA 3: Drag & Drop PDF (NUEVO DISEÑO INTELIGENTE) */}
          <div className={`w-full border-2 border-dashed rounded-[2rem] p-10 text-center transition-all relative shadow-sm flex flex-col items-center justify-center min-h-[280px] ${archivo ? 'bg-blue-50/40 border-blue-400' : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 group'}`}>
            
            {archivo ? (
              // --- ESTADO 1: CUANDO YA HAY UN ARCHIVO ---
              <div className="flex flex-col items-center justify-center z-20 w-full">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-blue-100">
                  <span className="material-symbols-outlined text-5xl text-blue-600">picture_as_pdf</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 truncate max-w-[280px]">{archivo.name}</h3>
                
                {/* Formateamos el tamaño del archivo a Megabytes */}
                <p className="text-sm font-bold text-blue-700 bg-blue-100/70 px-4 py-1.5 rounded-full mb-8 border border-blue-200">
                  {(archivo.size / (1024 * 1024)).toFixed(2)} MB
                </p>

                {/* Botón para quitar archivo */}
                <button 
                  onClick={() => setArchivo(null)} 
                  className="flex items-center gap-2 px-6 py-3 bg-white text-red-500 hover:bg-red-50 hover:text-red-700 font-bold rounded-xl transition-colors shadow-sm border border-red-100 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">delete</span>
                  Quitar archivo
                </button>
              </div>
            ) : (
              // --- ESTADO 2: CUANDO ESTÁ VACÍO (ESPERANDO ARCHIVO) ---
              <>
                <span className="material-symbols-outlined text-7xl text-gray-400 group-hover:text-blue-500 transition-colors mb-5">
                  cloud_upload
                </span>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Sube tu PDF aquí</h3>
                <p className="text-gray-500 mb-6 m-0">o haz clic para explorar tus archivos</p>
                <p className="text-xs text-gray-400 mt-5 m-0 font-bold uppercase tracking-widest">Máx. 25MB</p>

                {/* INPUT TRANSPARENTE: Solo existe si no hay archivo, así evitamos que suban dos */}
                <input 
                  type="file" 
                  accept=".pdf" 
                  disabled={cargando}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setArchivo(e.target.files[0]);
                      e.target.value = null; // Resetea el input para poder subir el mismo archivo después
                    }
                  }} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                
                <label className="mt-6 py-3 px-8 bg-gray-100 group-hover:bg-blue-600 text-gray-700 group-hover:text-white font-bold rounded-full transition-colors shadow-sm text-sm z-20 relative pointer-events-none">
                  Seleccionar archivo
                </label>
              </>
            )}
          </div>

          {/* BOTÓN DE GENERAR */}
          <button 
            onClick={generarCuestionario} 
            disabled={cargando || sinCreditos || !archivo || !nombreExamen.trim() || !materia} 
            className={`w-full py-5 text-white font-bold rounded-2xl transition-all shadow-lg flex justify-center items-center gap-3 text-lg outline-none mt-2 ${
              (cargando || sinCreditos || !archivo || !nombreExamen.trim() || !materia) ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30 cursor-pointer'
            }`}
          >
            {cargando ? (
              <><span className="material-symbols-outlined animate-spin text-2xl">sync</span> Analizando estructura...</>
            ) : (
              <><span className="material-symbols-outlined text-2xl">auto_awesome</span> Generar Examen</>
            )}
          </button>

          {/* MENSAJE DE ERROR */}
          {error && (
            <div className="text-red-700 p-5 bg-red-50 rounded-2xl border border-red-200 flex items-center gap-3 shadow-inner">
              <span className="material-symbols-outlined text-3xl">error</span> 
              <div className='flex flex-col'>
                <span className='font-bold'>Ocurrió un problema:</span> 
                <span className='text-sm'>{error}</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default VistaCrearExamen;