import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import EvaluacionesIA from './pages/EvaluacionesIA';
import SesionProvider from './context/SesionProvider';

function App() {
  return (
    <SesionProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública: Landing Page */}
          <Route path="/" element={<Home />} />

          {/* Ruta de la aplicación: El generador */}
          <Route path="/evaluaciones-ia" element={<EvaluacionesIA />} />
        </Routes>
      </BrowserRouter>
    </SesionProvider>
  );
}

export default App;