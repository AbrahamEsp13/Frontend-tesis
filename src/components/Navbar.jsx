import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ onOpenAuth }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Arreglo del Scroll: Le damos tiempo al navegador para procesar el clic antes de cerrar el menú
    const handleMobileNav = (e, targetId) => {
        e.preventDefault(); // Evitamos el salto brusco por defecto
        const targetElement = document.querySelector(targetId);

        // Cerramos el menú
        setIsOpen(false);

        // Esperamos a que la animación de cierre termine (aprox 300ms) y luego hacemos el scroll
        setTimeout(() => {
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        }, 300);
    };

    // Función para volver al inicio de la página suavemente
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        // Si el menú móvil está abierto, lo cerramos también
        setIsOpen(false);
    };

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="fixed top-0 z-50 w-full bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm"
        >
            <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">

                {/* LADO IZQUIERDO: Logo y Enlaces */}
                <div className="flex items-center space-x-10">
                    <span onClick={scrollToTop} className="text-blue-600 font-bold text-xl cursor-pointer relative z-50">
                        QuizAI
                    </span>

                    {/* Enlaces de Escritorio (Agrupados junto al logo) */}
                    <div className="hidden md:flex items-center space-x-6">
                        <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Caracteristicas</a>
                        <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Como funciona</a>
                    </div>
                </div>

                {/* LADO DERECHO: Login / Sign Up */}
                <div className="hidden md:flex items-center space-x-6">
                    <button onClick={() => onOpenAuth('login')} className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Iniciar Sesion</button>
                    <button onClick={() => onOpenAuth('signup')} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg transition-colors shadow-md">
                        Registrarse
                    </button>
                </div>

                {/* BOTÓN DE HAMBURGUESA (Móvil) */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden text-gray-700 focus:outline-none relative z-50 cursor-pointer p-2"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* MENÚ DESPLEGABLE MÓVIL */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-100 overflow-hidden"
                    >
                        <div className="flex flex-col px-6 py-6 space-y-4">
                            <a
                                href="#features"
                                // Usamos la nueva función para asegurar el scroll
                                onClick={(e) => handleMobileNav(e, '#features')}
                                className="text-gray-800 font-medium text-lg border-b border-gray-100 pb-2"
                            >
                                Features
                            </a>
                            <a
                                href="#how-it-works"
                                onClick={(e) => handleMobileNav(e, '#how-it-works')}
                                className="text-gray-800 font-medium text-lg border-b border-gray-100 pb-2"
                            >
                                How it Works
                            </a>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    onOpenAuth('login');
                                }}
                                className="text-gray-600 font-medium text-lg pt-4 text-left cursor-pointer">
                                Login
                            </button>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    onOpenAuth('signup');
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors w-full text-center mt-2 shadow-sm cursor-pointer">
                                Sign Up
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </motion.nav>
    );
};

export default Navbar;