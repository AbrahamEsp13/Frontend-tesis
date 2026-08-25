import React, { useState, useEffect } from 'react';

function VistaDashboard({ clonarCuestionario }) {
  const [busqueda, setBusqueda] = useState('');
  const [cuestionariosComunidad, setCuestionariosComunidad] = useState([]);
  const [cargandoComunidad, setCargandoComunidad] = useState(false);

  // CARGAR EXÁMENES REALES DESDE LA API DE LA COMUNIDAD
  const cargarCuestionariosComunidad = async () => {
    setCargandoComunidad(true);
    try {
      const respuesta = await fetch("https://backend-tesis-x187.onrender.com/api/comunidad/cuestionarios");
      if (respuesta.ok) {
        const resultado = await respuesta.json();
        setCuestionariosComunidad(resultado.data || []);
      }
    } catch (error) {
      console.error("Error al cargar la comunidad:", error);
    } finally {
      setCargandoComunidad(false);
    }
  };

  useEffect(() => {
    cargarCuestionariosComunidad();
  }, []);

  // FILTRADO DINÁMICO POR BARRA DE BÚSQUEDA
  const cuestionariosFiltrados = cuestionariosComunidad.filter((quiz) => {
    const termino = busqueda.toLowerCase().trim();
    if (!termino) return true;
    return (
      quiz.nombre_examen?.toLowerCase().includes(termino) ||
      quiz.materia?.toLowerCase().includes(termino) ||
      quiz.autor?.toLowerCase().includes(termino)
    );
  });

  return (
    <div className="max-w-6xl mx-auto text-left">
      
      {/* --- SECCIÓN HERO Y BÚSQUEDA CENTRADA --- */}
      <div className="dark:bg-gray-800 dark:border-gray-700 dark:text-white bg-white p-10 md:p-12 rounded-3xl border border-gray-100 shadow-sm mb-10 relative overflow-hidden text-center">
        <div className="dark:bg-gray-800 dark:border-gray-700 dark:text-white absolute top-0 left-0 w-full h-full overflow-hidden opacity-[0.03] pointer-events-none text-blue-900">
          <span className="dark:bg-gray-800 dark:border-gray-700 dark:text-white material-symbols-outlined absolute -top-10 -left-10 text-[150px]">public</span>
          <span className="dark:bg-gray-800 dark:border-gray-700 dark:text-white material-symbols-outlined absolute bottom-10 -right-10 text-[120px]">school</span>
        </div>

        <div className="dark:bg-gray-800 dark:border-gray-700 dark:text-white relative z-10 flex flex-col items-center">
          <h1 className="dark:bg-gray-800 dark:border-gray-700 dark:text-white text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-gray-950 m-0">
            Encuentra recursos educativos al instante
          </h1>
          <p className="dark:bg-gray-800 dark:border-gray-700 dark:text-white text-gray-500 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-medium m-0 leading-relaxed">
            Explora cientos de cuestionarios validados por la comunidad docente. Úsalos tal como están o adáptalos a tu clase en segundos.
          </p>

          {/* BARRA DE BÚSQUEDA CENTRADA */}
          <div className="w-full max-w-3xl mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-gray-400 group-focus-within:text-blue-500 transition-colors text-2xl">search</span>
            </div>
            <input 
              type="text" 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Ej. Matemáticas, Programación, Historia de México..." 
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white w-full pl-14 pr-32 py-5 rounded-2xl text-gray-900 font-medium text-lg outline-none border border-gray-200 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 bg-white transition-all shadow-sm"
            />
            <button className="absolute inset-y-2 right-2 bg-gray-900 hover:bg-black text-white px-8 rounded-xl font-bold transition-colors shadow-sm cursor-pointer outline-none border-none text-base">
              Buscar
            </button>
          </div>
        </div>
      </div>

      {/* --- SECCIÓN DE RESULTADOS / DESTACADOS --- */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 m-0">
            <span className="material-symbols-outlined text-yellow-500 text-3xl">star</span>
            {busqueda ? 'Resultados de Búsqueda' : 'Cuestionarios Disponibles'}
          </h2>
        </div>

        {cargandoComunidad ? (
          <div className="dark:bg-gray-800 dark:border-gray-700 dark:text-white flex flex-col items-center gap-3 text-gray-500 font-bold p-16 justify-center bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
            <span className="dark:bg-gray-800 dark:border-gray-700 dark:text-white material-symbols-outlined animate-spin text-4xl text-blue-600">sync</span>
            Conectando con la comunidad global...
          </div>
        ) : cuestionariosFiltrados.length === 0 ? (
          <div className="dark:bg-gray-800 dark:border-gray-700 dark:text-white bg-white border p-12 rounded-3xl shadow-sm text-center border-gray-100">
            <span className="dark:bg-gray-800 dark:border-gray-700 dark:text-white material-symbols-outlined text-5xl text-gray-300 mb-3 block">search_off</span>
            <p className="text-gray-500 font-medium m-0">No se encontraron cuestionarios que coincidan con tu búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cuestionariosFiltrados.map((quiz) => (
              <div key={quiz.id} className="dark:bg-gray-800 dark:border-gray-700 dark:text-white bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full text-left">
                
                <div className="flex justify-between items-start mb-4">
                  <span className="dark:bg-gray-800 dark:border-gray-700 dark:text-white bg-blue-50 text-blue-700 text-xs font-black px-3 py-1 rounded-lg uppercase tracking-wider">
                    {quiz.materia || "General"}
                  </span>
                  <span className="dark:bg-gray-800 dark:border-gray-700 dark:text-white material-symbols-outlined text-blue-500" title="Verificado">
                    verified
                  </span>
                </div>

                <h3 className="dark:bg-gray-800 dark:border-gray-700 dark:text-white text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors m-0 h-14 line-clamp-2">
                  {quiz.nombre_examen}
                </h3>
                
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                  <span className="dark:bg-gray-800 dark:border-gray-700 dark:text-white material-symbols-outlined text-[18px]">person</span>
                  {quiz.autor}
                </div>

                <div className="dark:bg-gray-800 dark:border-gray-700 dark:text-white mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="dark:bg-gray-800 dark:border-gray-700 dark:text-white flex items-center gap-1.5 font-medium">
                    <span className="dark:bg-gray-800 dark:border-gray-700 dark:text-white material-symbols-outlined text-[18px] text-gray-400">format_list_numbered</span>
                    {quiz.num_preguntas} reactivos
                  </span>
                  <span className="dark:bg-gray-800 dark:border-gray-700 dark:text-white flex items-center gap-1.5 font-medium">
                    <span className="dark:bg-gray-800 dark:border-gray-700 dark:text-white material-symbols-outlined text-[18px] text-gray-400">article</span>
                    Ref: PDF
                  </span>
                </div>

                <button 
                  onClick={() => clonarCuestionario(quiz)} 
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-white w-full py-3.5 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 border border-gray-200 hover:border-blue-200 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer outline-none text-base"
                >
                  <span className="dark:bg-gray-800 dark:border-gray-700 dark:text-white material-symbols-outlined text-[20px]">content_copy</span>
                  Guardar y Editar
                </button>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default VistaDashboard;