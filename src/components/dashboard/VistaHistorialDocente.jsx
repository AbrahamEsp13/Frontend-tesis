import React, { useState, useEffect } from 'react';

const HistorialCuestionarios = () => {
  const [cuestionarios, setCuestionarios] = useState([]);
  const [modalEliminar, setModalEliminar] = useState({ visible: false, id: null });
  const [modalExito, setModalExito] = useState({ visible: false, mensaje: '' });

  const fetchCuestionarios = async () => {
    const usuario = JSON.parse(localStorage.getItem("usuarioQuizAI"));
    const response = await fetch(`http://localhost:8000/api/cuestionarios?usuario_id=${usuario.id}&rol=docente`);
    const data = await response.json();
    if (data.status === 'success') setCuestionarios(data.data);
  };

  useEffect(() => { fetchCuestionarios(); }, []);

  const abrirConfirmacion = (id) => {
    setModalEliminar({ visible: true, id: id });
  };

  const ejecutarEliminacion = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/cuestionarios/${modalEliminar.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setModalEliminar({ visible: false, id: null });
        setModalExito({ visible: true, mensaje: 'El cuestionario ha sido borrado permanentemente.' });
        fetchCuestionarios();
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Historial de Exámenes</h2>
      
      <div className="overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 font-bold text-gray-600 text-sm">Documento</th>
              <th className="p-4 font-bold text-gray-600 text-sm text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cuestionarios.map((quiz) => (
              <tr key={quiz.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="p-4 text-gray-700 font-medium">{quiz.nombre_documento}</td>
                <td className="p-4 flex justify-center gap-3">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                  <button 
                    onClick={() => abrirConfirmacion(quiz.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE CONFIRMACIÓN DE ELIMINAR */}
      {modalEliminar.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-red-600 text-5xl">warning</span>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">¿Estás seguro?</h3>
              <p className="text-gray-500 leading-relaxed">
                Esta acción eliminará el cuestionario y los resultados de los alumnos. No se puede deshacer.
              </p>
            </div>
            <div className="p-6 bg-gray-50 flex gap-3">
              <button
                onClick={() => setModalEliminar({ visible: false, id: null })}
                className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarEliminacion}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-md transition-colors"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ÉXITO TRAS ELIMINAR */}
      {modalExito.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
             <span className="material-symbols-outlined text-green-500 text-6xl mb-4">check_circle</span>
             <p className="text-lg font-bold text-gray-800 mb-6">{modalExito.mensaje}</p>
             <button 
               onClick={() => setModalExito({ visible: false, mensaje: '' })}
               className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold"
             >
               Cerrar
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialCuestionarios;