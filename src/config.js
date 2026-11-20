// URL base del backend.
// En desarrollo se toma de .env.development (VITE_API_URL=http://localhost:8000).
// En producción (Vercel), si no se define VITE_API_URL, se usa el backend de Render.
export const API_URL = (import.meta.env.VITE_API_URL || 'https://backend-tesis-x187.onrender.com').replace(/\/$/, '');
