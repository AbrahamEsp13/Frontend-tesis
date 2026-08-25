import React, { useState, useEffect } from 'react';

function VistaConfiguracion({ usuario }) {
  const [pestanaActiva, setPestanaActiva] = useState('apariencia');
  const [modoOscuro, setModoOscuro] = useState(false);

  // Al cargar, revisamos si el usuario ya tenía el modo oscuro activado
  useEffect(() => {
    if (localStorage.getItem('temaQuizAI') === 'dark' || document.documentElement.classList.contains('dark')) {
      setModoOscuro(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Función mágica que cambia el tema
  const alternarTema = () => {
    if (modoOscuro) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('temaQuizAI', 'light');
      setModoOscuro(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('temaQuizAI', 'dark');
      setModoOscuro(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 flex flex-col md:flex-row gap-8">
      
      {/* MENÚ LATERAL DE CONFIGURACIÓN */}
      <div className="w-full md:w-1/4">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Configuración</h2>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
          
          <button 
            onClick={() => setPestanaActiva('apariencia')}
            className={`flex items-center gap-3 px-6 py-4 text-left font-bold transition-colors cursor-pointer outline-none border-none ${pestanaActiva === 'apariencia' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-l-4 border-blue-600' : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            <span className="material-symbols-outlined">palette</span> Apariencia
          </button>
          
          {usuario?.rol === 'docente' && (
            <button 
              onClick={() => setPestanaActiva('ia')}
              className={`flex items-center gap-3 px-6 py-4 text-left font-bold transition-colors cursor-pointer outline-none border-none ${pestanaActiva === 'ia' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-l-4 border-blue-600' : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <span className="material-symbols-outlined">psychology</span> Preferencias IA
            </button>
          )}
          
          <button 
            onClick={() => setPestanaActiva('seguridad')}
            className={`flex items-center gap-3 px-6 py-4 text-left font-bold transition-colors cursor-pointer outline-none border-none ${pestanaActiva === 'seguridad' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-l-4 border-blue-600' : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            <span className="material-symbols-outlined">lock</span> Seguridad
          </button>
          
        </div>
      </div>

      {/* ÁREA DE CONTENIDO */}
      <div className="w-full md:w-3/4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[400px]">
          
          {/* --- PESTAÑA: APARIENCIA --- */}
          {pestanaActiva === 'apariencia' && (
            <div className="animate-fade-in">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tema de la Interfaz</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8">Personaliza cómo se ve QuizAI en este dispositivo.</p>
              
              <div className="flex items-center justify-between p-6 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${modoOscuro ? 'bg-indigo-900 text-indigo-300' : 'bg-yellow-100 text-yellow-600'}`}>
                    <span className="material-symbols-outlined text-2xl">
                      {modoOscuro ? 'dark_mode' : 'light_mode'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">Modo Oscuro</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Reduce el cansancio visual en entornos sin luz.</p>
                  </div>
                </div>
                
                {/* INTERRUPTOR (TOGGLE) */}
                <button 
                  onClick={alternarTema}
                  className={`w-16 h-8 rounded-full transition-colors relative cursor-pointer outline-none border-none ${modoOscuro ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform shadow-md ${modoOscuro ? 'translate-x-9' : 'translate-x-1'}`}></div>
                </button>
              </div>
            </div>
          )}

          {/* --- PESTAÑA: PREFERENCIAS IA --- */}
          {pestanaActiva === 'ia' && (
            <div className="animate-fade-in">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ajustes del Generador IA</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8">Configura los parámetros predeterminados para tus cuestionarios.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nivel de complejidad preferido</label>
                  <select className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none dark:text-white cursor-pointer">
                    <option>Equilibrado (Recomendado)</option>
                    <option>Básico (Conceptos y memorización)</option>
                    <option>Avanzado (Análisis crítico y síntesis)</option>
                  </select>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 flex items-start gap-3">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 mt-0.5">info</span>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Estos ajustes se aplicarán automáticamente la próxima vez que subas un PDF. (Funcionalidad en desarrollo para conectar con el backend).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* --- PESTAÑA: SEGURIDAD --- */}
          {pestanaActiva === 'seguridad' && (
            <div className="animate-fade-in">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Seguridad de la Cuenta</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8">Administra tus credenciales y datos personales.</p>
              
              <div className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Contraseña Actual</label>
                  <input type="password" placeholder="••••••••" className="w-full p-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nueva Contraseña</label>
                  <input type="password" placeholder="Mínimo 8 caracteres" className="w-full p-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none dark:text-white" />
                </div>
                <button className="px-6 py-3 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-bold rounded-xl transition-colors cursor-pointer outline-none border-none">
                  Actualizar Contraseña
                </button>
              </div>

              <div className="mt-12 pt-8 border-t border-red-100 dark:border-red-900/30">
                <h4 className="font-bold text-red-600 dark:text-red-400 mb-2">Zona de Peligro</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Una vez que elimines tu cuenta, no hay vuelta atrás.</p>
                <button className="px-6 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-bold rounded-xl transition-colors cursor-pointer border border-red-200 dark:border-red-800/50 outline-none">
                  Eliminar cuenta permanentemente
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default VistaConfiguracion;