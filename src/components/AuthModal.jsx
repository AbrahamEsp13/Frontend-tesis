import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AuthModal = ({ isOpen, onClose, initialMode }) => {
    const [isLogin, setIsLogin] = useState(initialMode === 'login');
    const navigate = useNavigate();

    // --- NUEVOS ESTADOS PARA CAPTURAR LOS DATOS DEL FORMULARIO ---
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('estudiante'); // Por defecto seleccionamos estudiante

    // --- NUEVO ESTADO PARA EL MENSAJE VISUAL ---
    const [feedback, setFeedback] = useState({ tipo: '', texto: '' });

    useEffect(() => {
        setIsLogin(initialMode === 'login');
    }, [initialMode]);

    const handleAuth = async (e) => {
        e.preventDefault(); 
        setFeedback({ tipo: '', texto: '' }); // Limpiamos mensajes anteriores
        
        try {
            if (isLogin) {
                // --- LÓGICA DE INICIAR SESIÓN ---
                const response = await fetch("http://127.0.0.1:8000/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ correo, password })
                });
                
                const data = await response.json();
                if (!response.ok) throw new Error(data.detail || "Error al iniciar sesión");

                // Quitamos el alert y guardamos en memoria
                localStorage.setItem("usuarioQuizAI", JSON.stringify(data.usuario));
                
                onClose(); 
                navigate('/evaluaciones-ia');

            } else {
                // --- LÓGICA DE REGISTRO ---
                const response = await fetch("http://127.0.0.1:8000/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nombre, correo, password, rol })
                });
                
                const data = await response.json();
                if (!response.ok) throw new Error(data.detail || "Error al registrar");

                // Reemplazamos el alert con nuestro feedback verde
                setFeedback({ tipo: 'exito', texto: "🎉 ¡Cuenta creada! Ya puedes iniciar sesión." });
                
                setPassword('');
                
                // Le damos 2 segundos para que lea el mensaje antes de cambiar a la pantalla de login
                setTimeout(() => {
                    setIsLogin(true);
                    setFeedback({ tipo: '', texto: '' });
                }, 2000);
            }
        } catch (error) {
            // Reemplazamos el alert de error con nuestro feedback rojo
            setFeedback({ tipo: 'error', texto: "❌ " + error.message });
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative overflow-hidden"
                    >
                        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h3 className="text-3xl font-extrabold text-gray-900 mb-2">
                            {isLogin ? 'Bienvenido de nuevo' : 'Crea una cuenta nueva'}
                        </h3>
                        <p className="text-gray-500 mb-8">
                            {isLogin ? 'Por favor, introduce tus datos para iniciar sesión.' : 'Comienza a transformar tus PDFs en cuestionarios hoy.'}
                        </p>

                        {/* --- CAJA DE MENSAJES DE FEEDBACK --- */}
                            {feedback.texto && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }} 
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-4 mb-6 text-sm font-medium rounded-xl border ${
                                        feedback.tipo === 'exito' 
                                        ? 'bg-green-50 border-green-200 text-green-700' 
                                        : 'bg-red-50 border-red-200 text-red-700'
                                    }`}
                                >
                                    {feedback.texto}
                                </motion.div>
                            )}
                            {/* ------------------------------------- */}

                        <form className="space-y-5" onSubmit={handleAuth}>

                            {!isLogin && (
                                <>
                                    {/* Campo Nombre */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                                        <input 
                                            type="text" 
                                            placeholder="John Doe" 
                                            value={nombre}
                                            onChange={(e) => setNombre(e.target.value)}
                                            required={!isLogin}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white" 
                                        />
                                    </div>

                                    {/* --- NUEVO: SELECCIÓN DE ROL --- */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">¿Cómo usarás QuizAI?</label>
                                        <div className="flex gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setRol('docente')}
                                                className={`flex-1 py-3 px-4 border-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${rol === 'docente' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 text-gray-600'}`}
                                            >
                                                <span className="text-2xl mb-1"></span>
                                                <span className="font-semibold text-sm">Soy Docente</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setRol('estudiante')}
                                                className={`flex-1 py-3 px-4 border-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${rol === 'estudiante' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 text-gray-600'}`}
                                            >
                                                <span className="text-2xl mb-1"></span>
                                                <span className="font-semibold text-sm">Soy Estudiante</span>
                                            </button>
                                        </div>
                                    </div>
                                    {/* ------------------------------- */}
                                </>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
                                <input 
                                    type="email" 
                                    placeholder="tuNombre@ejemplo.com" 
                                    value={correo}
                                    onChange={(e) => setCorreo(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white" 
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                                    {isLogin && <a href="#" className="text-xs text-blue-600 hover:underline">¿Olvidaste tu contraseña?</a>}
                                </div>
                                <input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white" 
                                />
                            </div>

                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-600/30 mt-4 cursor-pointer">
                                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm text-gray-600">
                            {isLogin ? "¿No tienes una cuenta? " : "¿Ya tienes una cuenta? "}
                            <button 
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    // Limpiamos el formulario al cambiar de modo
                                    setNombre(''); setCorreo(''); setPassword('');
                                }} 
                                className="text-blue-600 font-bold hover:underline cursor-pointer"
                            >
                                {isLogin ? 'Regístrate ahora' : 'Inicia sesión'}
                            </button>
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AuthModal;