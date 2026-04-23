import React from 'react';

const Footer = () => {
    // Obtenemos el año actual automáticamente para que no tengas que cambiarlo a mano cada año
    const currentYear = new Date().getFullYear();

    return (
        // Usamos bg-gray-200 para igualar el tono gris de tu imagen
        <footer className="bg-gray-200 py-16 px-6">
            <div className="max-w-7xl mx-auto">

                {/* PARTE SUPERIOR: Logo y Columnas de Enlaces */}
                <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">

                    {/* Bloque Izquierdo: Logo y Descripción */}
                    <div className="max-w-sm">
                        <span className="text-blue-600 font-bold text-xl block mb-4">
                            QuizAI
                        </span>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Redefining the boundaries of personalized education through human-centric artificial intelligence.
                        </p>
                    </div>

                    {/* Bloque Derecho: Agrupación de enlaces */}
                    <div className="flex flex-wrap gap-12 md:gap-24">

                        {/* Columna 1: PLATFORM */}
                        <div>
                            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-6">
                                Platform
                            </h4>
                            <ul className="space-y-4">
                                <li><a href="#features" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Features</a></li>
                                <li><a href="#pricing" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Pricing</a></li>
                                <li><a href="#integrations" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Integrations</a></li>
                            </ul>
                        </div>

                        {/* Columna 2: COMPANY */}
                        <div>
                            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-6">
                                Company
                            </h4>
                            <ul className="space-y-4">
                                <li><a href="#privacy" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Privacy Policy</a></li>
                                <li><a href="#terms" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Terms of Service</a></li>
                                <li><a href="#contact" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Contact Us</a></li>
                            </ul>
                        </div>

                        {/* Columna 3: SOCIAL */}
                        <div>
                            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-6">
                                Social
                            </h4>
                            <ul className="space-y-4">
                                <li><a href="#twitter" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Twitter</a></li>
                                <li><a href="#linkedin" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">LinkedIn</a></li>
                            </ul>
                        </div>

                    </div>
                </div>

                {/* LÍNEA SEPARADORA */}
                <div className="border-t border-gray-300 mb-8"></div>

                {/* PARTE INFERIOR: Copyright e Idioma */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">

                    {/* Copyright */}
                    <p className="text-gray-500 text-sm">
                        © {currentYear} QuizAI. All rights reserved.
                    </p>

                    {/* Selector de Idioma (Visual) */}
                    <div className="flex items-center gap-2 text-gray-500 hover:text-gray-800 cursor-pointer transition-colors">
                        {/* Ícono de globo terráqueo */}
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        <span className="text-sm">English (US)</span>
                    </div>

                </div>

            </div>
        </footer>
    );
};

export default Footer;