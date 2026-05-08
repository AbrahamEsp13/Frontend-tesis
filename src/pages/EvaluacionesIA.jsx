import React, { useState } from 'react';

const EvaluacionesIA = () => {
  const [archivo, setArchivo] = useState(null);
  const [numPreguntas, setNumPreguntas] = useState(5);
  const [cargando, setCargando] = useState(false);
  const [modalExito, setModalExito] = useState({ visible: false, titulo: '', mensaje: '' });

  const handleFileChange = (e) => {
    setArchivo(e.target.files[0]);
  };

  const generarCuestionario = async () => {
    if (!archivo) return;
    
    setCargando(true);
    const usuario = JSON.parse(localStorage.getItem("usuarioQuizAI"));
    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("usuario_id", usuario.id);
    formData.append("num_preguntas", numPreguntas);

    try {
      const response = await fetch("http://localhost:8000/api/generar-cuestionario", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setModalExito({
          visible: true,
          titulo: '¡Generación Exitosa!',
          mensaje: 'La IA ha analizado el PDF y creado tu cuestionario. Ya puedes revisarlo en tu historial.'
        });
        setArchivo(null);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Generar Cuestionario con IA</h1>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Sube tu material de estudio (PDF)</label>
          <input 
            type="file" 
            accept=".pdf"
            onChange={handleFileChange}
            className="w-full p-3 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 transition-colors cursor-pointer"
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Cantidad de preguntas: {numPreguntas}</label>
          <input 
            type="range" min="1" max="20" 
            value={numPreguntas}
            onChange={(e) => setNumPreguntas(e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <button
          onClick={generarCuestionario}
          disabled={cargando || !archivo}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${
            cargando ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
          }`}
        >
          {cargando ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando PDF con Gemini...
            </span>
          ) : 'Generar con IA'}
        </button>
      </div>

      {/* MODAL DE ÉXITO */}
      {modalExito.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-green-600 text-5xl">task_alt</span>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">{modalExito.titulo}</h3>
              <p className="text-gray-500 leading-relaxed">{modalExito.mensaje}</p>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setModalExito({ ...modalExito, visible: false })}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluacionesIA;