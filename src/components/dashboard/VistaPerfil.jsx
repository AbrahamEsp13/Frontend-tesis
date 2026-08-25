import React, { useState, useEffect } from 'react';

function VistaPerfil({ usuario, setUsuario }) {
  const [modoEdicion, setModoEdicion] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  
  // Nuevo estado para mostrar/ocultar el menú de avatares
  const [mostrarAvatares, setMostrarAvatares] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    biografia: '',
    institucion: '',
    especialidad: '',
    foto_perfil: ''
  });

  // Colección de avatares predeterminados generados al instante (Robots, Pixel Art, Ilustraciones)
  const avataresPredefinidos = [
    "https://api.dicebear.com/7.x/bottts/svg?seed=Quiz",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Inteligencia",
    "https://api.dicebear.com/7.x/pixel-art/svg?seed=Gamer",
    "https://api.dicebear.com/7.x/pixel-art/svg?seed=Code",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Abraham",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Mochis",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Sinaloa"
  ];

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre || '',
        biografia: usuario.biografia || '',
        institucion: usuario.institucion || '',
        especialidad: usuario.especialidad || '',
        foto_perfil: usuario.foto_perfil || ''
      });
    }
  }, [usuario]);

  // Convierte la imagen a Base64
  const manejarSubidaFoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMensaje({ texto: 'La imagen es muy pesada (Máx 2MB)', tipo: 'error' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, foto_perfil: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const seleccionarAvatar = (url) => {
    setFormData({ ...formData, foto_perfil: url });
    setMostrarAvatares(false);
  };

  const guardarCambios = async () => {
    setCargando(true);
    setMensaje({ texto: '', tipo: '' });

    try {
      const response = await fetch(`https://backend-tesis-x187.onrender.com/api/usuarios/${usuario.id}/perfil`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Error al guardar el perfil');

      const data = await response.json();
      
      setUsuario(data.usuario);
      localStorage.setItem("usuarioQuizAI", JSON.stringify(data.usuario));
      
      setMensaje({ texto: '¡Perfil actualizado con éxito!', tipo: 'exito' });
      setModoEdicion(false);
      setMostrarAvatares(false);
    } catch (error) {
      setMensaje({ texto: error.message, tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  if (!usuario) {
    return (
      <div className="flex justify-center items-center h-64 mt-10">
        <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">sync</span>
        <p className="ml-3 text-gray-500 font-bold">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Cabecera / Banner */}
        <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
          <div className="absolute -bottom-16 left-10 flex items-end gap-6">
            
            {/* Contenedor de Foto de Perfil y Botones */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden flex items-center justify-center shadow-md">
                {formData.foto_perfil ? (
                  <img src={formData.foto_perfil} alt="Perfil" className="w-full h-full object-cover bg-white" />
                ) : (
                  <span className="material-symbols-outlined text-6xl text-gray-400">person</span>
                )}
              </div>
              
              {modoEdicion && (
                <>
                  {/* Botón 1: Subir Foto (Derecha) */}
                  <label className="absolute bottom-0 right-0 bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center text-white border-2 border-white cursor-pointer hover:bg-blue-700 transition-colors shadow-sm z-10 title='Subir foto'">
                    <span className="material-symbols-outlined text-xl">photo_camera</span>
                    <input type="file" accept="image/*" className="hidden" onChange={manejarSubidaFoto} />
                  </label>

                  {/* Botón 2: Elegir Avatar (Izquierda) */}
                  <button 
                    onClick={() => setMostrarAvatares(!mostrarAvatares)}
                    className="absolute bottom-0 left-0 bg-indigo-500 w-10 h-10 rounded-full flex items-center justify-center text-white border-2 border-white cursor-pointer hover:bg-indigo-600 transition-colors shadow-sm z-10"
                    title="Elegir avatar"
                  >
                    <span className="material-symbols-outlined text-xl">sentiment_satisfied</span>
                  </button>

                  {/* Menú Desplegable de Avatares */}
                  {mostrarAvatares && (
                    <div className="absolute top-36 left-0 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 w-72 z-50 animate-fade-in">
                      <p className="text-xs font-bold text-gray-500 mb-3 text-center uppercase tracking-wider">Elige un avatar</p>
                      <div className="grid grid-cols-4 gap-3">
                        {avataresPredefinidos.map((url, index) => (
                          <img 
                            key={index} 
                            src={url} 
                            alt={`Avatar ${index}`} 
                            onClick={() => seleccionarAvatar(url)}
                            className="w-12 h-12 rounded-full cursor-pointer hover:scale-110 hover:ring-2 hover:ring-blue-500 transition-all bg-gray-50 p-1 border border-gray-100 shadow-sm"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="mb-4">
              <h2 className="text-3xl font-extrabold text-gray-900">{usuario.nombre}</h2>
              <p className="text-blue-600 font-bold uppercase tracking-wider text-sm">{usuario.rol === 'docente' ? 'Profesor' : 'Estudiante'}</p>
            </div>
          </div>
          
          {/* Botones Superiores (Editar / Guardar) */}
          <div className="absolute top-6 right-6">
            {!modoEdicion ? (
              <button onClick={() => setModoEdicion(true)} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-xl font-bold backdrop-blur-sm transition-all border border-white/30 cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">edit</span> Editar Perfil
              </button>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => { setModoEdicion(false); setMostrarAvatares(false); }} className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold backdrop-blur-sm transition-all border border-white/30 cursor-pointer">
                  Cancelar
                </button>
                <button onClick={guardarCambios} disabled={cargando} className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 cursor-pointer">
                  {cargando ? <span className="material-symbols-outlined animate-spin text-[20px]">sync</span> : <span className="material-symbols-outlined text-[20px]">save</span>}
                  Guardar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Formulario / Información */}
        <div className="pt-24 px-10 pb-10">
          
          {mensaje.texto && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-medium ${mensaje.tipo === 'exito' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              <span className="material-symbols-outlined">{mensaje.tipo === 'exito' ? 'check_circle' : 'error'}</span>
              {mensaje.texto}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nombre Completo</label>
                <input 
                  type="text" 
                  value={formData.nombre} 
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  disabled={!modoEdicion}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed font-medium text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Correo Institucional / Principal</label>
                <input 
                  type="email" 
                  value={usuario.correo} 
                  disabled={true} 
                  className="w-full p-3.5 bg-gray-100 border border-gray-200 rounded-xl outline-none text-gray-500 cursor-not-allowed font-medium"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Institución Educativa</label>
                <input 
                  type="text" 
                  value={formData.institucion} 
                  onChange={(e) => setFormData({...formData, institucion: e.target.value})}
                  disabled={!modoEdicion}
                  placeholder="Ej. Facultad de Ingeniería"
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed font-medium text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{usuario.rol === 'docente' ? 'Especialidad / Departamento' : 'Carrera'}</label>
                <input 
                  type="text" 
                  value={formData.especialidad} 
                  onChange={(e) => setFormData({...formData, especialidad: e.target.value})}
                  disabled={!modoEdicion}
                  placeholder="Ej. Ingeniería en Software"
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed font-medium text-gray-800"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Biografía / Acerca de mí</label>
              <textarea 
                value={formData.biografia} 
                onChange={(e) => setFormData({...formData, biografia: e.target.value})}
                disabled={!modoEdicion}
                placeholder="Cuenta un poco sobre ti, tus intereses o tu experiencia académica..."
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed min-h-[120px] resize-none font-medium text-gray-800"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VistaPerfil;