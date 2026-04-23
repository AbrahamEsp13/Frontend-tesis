import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import EvaluacionesIA from './pages/EvaluacionesIA';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública: Tu Landing Page */}
        <Route path="/" element={<Home />} />

        {/* Ruta de la aplicación: El generador que construimos hoy */}
        <Route path="/evaluaciones-ia" element={<EvaluacionesIA />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;