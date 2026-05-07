import React from 'react';

function Sidebar({ rol, vista, setVista, modoExamenActivo }) {
  // Si estamos en modo examen, la barra no debe existir
  if (modoExamenActivo) return null;

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-gray-50 p-4 flex flex-col z-40 border-r border-gray-200 hidden md:flex">
      <div className="flex flex-col gap-1 mt-4">
        {rol === 'docente' ? (
          <>
            <button onClick={() => setVista('dashboard')} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all cursor-pointer border-none text-left outline-none ${vista === 'dashboard' ? 'bg-white text-blue-700 shadow-sm font-bold' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}>
              <span className="material-symbols-outlined">dashboard</span> Dashboard
            </button>
            <button onClick={() => setVista('nuevo')} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all cursor-pointer border-none text-left outline-none ${vista === 'nuevo' ? 'bg-white text-blue-700 shadow-sm font-bold' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}>
              <span className="material-symbols-outlined">add_circle</span> Crear Cuestionario
            </button>
            <button onClick={() => setVista('historial')} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all cursor-pointer border-none text-left outline-none ${vista === 'historial' ? 'bg-white text-blue-700 shadow-sm font-bold' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}>
              <span className="material-symbols-outlined">quiz</span> Historial de Exámenes
            </button>
            <button onClick={() => setVista('clases')} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all cursor-pointer border-none text-left outline-none ${vista === 'clases' ? 'bg-white text-blue-700 shadow-sm font-bold' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}>
              <span className="material-symbols-outlined">school</span> Clases
            </button>
          </>
        ) : (
          <button onClick={() => setVista('panel_estudiante')} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all cursor-pointer border-none text-left outline-none ${vista === 'panel_estudiante' ? 'bg-white text-blue-700 shadow-sm font-bold' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}>
            <span className="material-symbols-outlined">school</span> Mis Evaluaciones
          </button>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;