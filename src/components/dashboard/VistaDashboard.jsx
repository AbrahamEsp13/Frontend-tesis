import React, { useState } from 'react';

function VistaDashboard() {
  const [busqueda, setBusqueda] = useState('');

  // Datos simulados (Mocks) para visualizar el diseño antes de conectar la Base de Datos
  const cuestionariosDestacados = [
    {
      id: 1,
      titulo: "Historia de México: Revolución y Porfiriato",
      autor: "Profr. Carlos Mendoza",
      materia: "Historia",
      preguntas: 15,
      descargas: 342,
      verificado: true
    },
    {
      id: 2,
      titulo: "Fundamentos de Programación Orientada a Objetos",
      autor: "Dra. Elena Ruiz",
      materia: "Ingeniería de Software",
      preguntas: 10,
      descargas: 856,
      verificado: true
    },
    {
      id: 3,
      titulo: "Biología Celular: Estructura y Función",
      autor: "Mtro. Javier Silva",
      materia: "Biología",
      preguntas: 12,
      descargas: 124,
      verificado: false
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      
      {/* --- SECCIÓN HERO Y BÚSQUEDA --- */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-10 md:p-14 text-center shadow-lg text-white mb-10 relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <span className="material-symbols-outlined absolute -top-10 -left-10 text-[150px]">public</span>
          <span className="material-symbols-outlined absolute bottom-10 -right-10 text-[120px]">school</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Encuentra recursos educativos al instante
          </h1>
          <p className="text-blue-100 text-lg md:text-xl mb-8 max-w-2xl mx-auto font-medium">
            Explora cientos de cuestionarios validados por la comunidad docente. Úsalos tal como están o adáptalos a tu clase en segundos.
          </p>

          {/* BARRA DE BÚSQUEDA */}
          <div className="max-w-3xl mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-gray-400 group-focus-within:text-blue-500 transition-colors text-2xl">search</span>
            </div>
            <input 
              type="text" 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Ej. Álgebra lineal, Revolución Francesa, Anatomía..." 
              className="w-full pl-12 pr-32 py-5 rounded-2xl text-gray-900 font-medium text-lg outline-none shadow-xl focus:ring-4 focus:ring-blue-400/30 transition-all border-none"
            />
            <button className="absolute inset-y-2 right-2 bg-gray-900 hover:bg-black text-white px-6 rounded-xl font-bold transition-colors shadow-sm cursor-pointer outline-none">
              Buscar
            </button>
          </div>
        </div>
      </div>

      {/* --- SECCIÓN DE DESTACADOS --- */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-500 text-3xl">star</span>
            Cuestionarios Destacados
          </h2>
          <button className="text-blue-600 font-bold hover:text-blue-800 transition-colors flex items-center gap-1 cursor-pointer bg-transparent border-none outline-none">
            Ver todos <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cuestionariosDestacados.map((quiz) => (
            <div key={quiz.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
              
              <div className="flex justify-between items-start mb-4">
                <span className="bg-blue-50 text-blue-700 text-xs font-black px-3 py-1 rounded-lg uppercase tracking-wider">
                  {quiz.materia}
                </span>
                {quiz.verificado && (
                  <span className="material-symbols-outlined text-blue-500" title="Verificado por la plataforma">
                    verified
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                {quiz.titulo}
              </h3>
              
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <span className="material-symbols-outlined text-[18px]">person</span>
                {quiz.autor}
              </div>

              <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[18px] text-gray-400">format_list_numbered</span>
                  {quiz.preguntas} reactivos
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[18px] text-gray-400">download</span>
                  {quiz.descargas} usos
                </span>
              </div>

              <button className="w-full py-3 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 border border-gray-200 hover:border-blue-200 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer outline-none">
                <span className="material-symbols-outlined text-[20px]">content_copy</span>
                Guardar y Editar
              </button>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default VistaDashboard;