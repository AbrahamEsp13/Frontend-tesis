import React from 'react';

function Navbar({ 
  rol, 
  setVista, 
  modoExamenActivo, 
  intentarSalirExamen,
  menuUsuarioAbierto,
  setMenuUsuarioAbierto,
  cerrarSesion
}) {
  // Obtenemos el nombre del usuario para el avatar
  const usuarioLocal = localStorage.getItem("usuarioQuizAI");
  const nombreUsuario = usuarioLocal ? JSON.parse(usuarioLocal).nombre : "Felix";

  return (
    <nav className={`fixed top-0 left-0 right-0 h-16 ${modoExamenActivo ? 'bg-white' : 'bg-white/90 backdrop-blur-md'} z-50 flex items-center justify-between px-8 ${modoExamenActivo ? 'border-none' : 'border-b border-gray-200'}`}>
      <div className="flex items-center gap-8">
        <span 
          className={`text-2xl font-extrabold text-blue-700 tracking-tight cursor-pointer ${modoExamenActivo ? 'select-none' : ''}`}
          onClick={modoExamenActivo ? intentarSalirExamen : () => setVista(rol === 'docente' ? 'dashboard' : 'panel_estudiante')}
        >
          QuizAI
        </span>
      </div>

      {!modoExamenActivo && (
        <div className="flex items-center gap-5">
          <button className="text-gray-500 hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-none flex items-center justify-center p-2 rounded-full hover:bg-gray-100 outline-none">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="text-gray-500 hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-none flex items-center justify-center p-2 rounded-full hover:bg-gray-100 outline-none">
            <span className="material-symbols-outlined">help</span>
          </button>

          <div className="relative">
            <img 
              onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${nombreUsuario}`}
              alt="Avatar" 
              className="w-9 h-9 rounded-full cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all object-cover bg-blue-100"
            />

            {menuUsuarioAbierto && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden">
                
                {/* CORRECCIÓN: El onClick va dentro de la etiqueta <button ...> */}
                <button 
                  onClick={() => {
                    setVista('perfil');
                    // Opcional: También podrías querer cerrar el menú aquí agregando setMenuUsuarioAbierto(false)
                  }} 
                  className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium cursor-pointer flex items-center gap-3 border-none bg-transparent outline-none"
                >
                  <span className="material-symbols-outlined text-lg">person</span> Ver perfil
                </button>
                
                <button className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium cursor-pointer flex items-center gap-3 border-none bg-transparent outline-none">
                  <span className="material-symbols-outlined text-lg">settings</span> Configuración
                </button>
                
                <div className="border-t border-gray-100 my-1"></div>
                
                <button onClick={cerrarSesion} className="w-full text-left px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-bold cursor-pointer flex items-center gap-3 border-none bg-transparent outline-none">
                  <span className="material-symbols-outlined text-lg">logout</span> Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;