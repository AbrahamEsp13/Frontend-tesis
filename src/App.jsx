import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AppLayout from './layouts/AppLayout';
import SesionProvider from './context/SesionProvider';
import VistaPerfil from './components/dashboard/VistaPerfil';
import {
  InicioSegunRol, SoloRol,
  RutaComunidad, RutaCrearExamen, RutaHistorial, RutaClases,
  RutaMisEvaluaciones, RutaConfiguracion, RutaExamen,
} from './pages/app/rutas';

// createBrowserRouter (en lugar de <BrowserRouter>) habilita useBlocker,
// que protege al estudiante de salir del examen con el botón Atrás.
const router = createBrowserRouter([
  // Ruta pública: Landing Page
  { path: '/', element: <Home /> },

  // Enlace anterior a la aplicación
  { path: '/evaluaciones-ia', element: <Navigate to="/app" replace /> },

  // Aplicación (requiere sesión; AppLayout redirige al inicio si no la hay)
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      { index: true, element: <InicioSegunRol /> },

      // Docente
      { path: 'comunidad', element: <SoloRol rol="docente"><RutaComunidad /></SoloRol> },
      { path: 'nuevo', element: <SoloRol rol="docente"><RutaCrearExamen /></SoloRol> },
      { path: 'historial', element: <SoloRol rol="docente"><RutaHistorial /></SoloRol> },
      { path: 'clases', element: <SoloRol rol="docente"><RutaClases /></SoloRol> },

      // Estudiante
      { path: 'evaluaciones', element: <SoloRol rol="estudiante"><RutaMisEvaluaciones /></SoloRol> },

      // Ambos roles
      { path: 'perfil', element: <VistaPerfil /> },
      { path: 'configuracion', element: <RutaConfiguracion /> },
      { path: 'examen/:id', element: <RutaExamen /> },

      // Cualquier otra subruta: pantalla inicial del rol
      { path: '*', element: <InicioSegunRol /> },
    ],
  },

  // Cualquier otra URL: landing
  { path: '*', element: <Navigate to="/" replace /> },
]);

function App() {
  return (
    <SesionProvider>
      <RouterProvider router={router} />
    </SesionProvider>
  );
}

export default App;
