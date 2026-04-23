import React from 'react';
import { motion } from 'framer-motion';
import heroImage from '../assets/hero.png';

const Hero = () => {
    return (
        <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 flex flex-col md:flex-row items-center gap-12 overflow-hidden">

            {/* Columna Izquierda: Animamos desde abajo (y: 30) hacia su posición original (y: 0) */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full md:w-1/2 flex flex-col items-start"
            >
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-6">
                    Aprendizaje impulsado por IA
                </span>

                <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
                    Convierte tus PDF en cuestionarios interactivos con IA.
                </h1>

                <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed">
                    QuizAI utiliza aprendizaje automático avanzado para transformar tus materiales de estudio en evaluaciones personalizadas en cuestión de segundos.
                </p>

                <div className="flex items-center space-x-6">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm cursor-pointer">
                        Comienza gratis
                    </button>

                    <a href="#funcionamiento" className="text-blue-600 font-semibold hover:text-blue-800 transition-colors flex items-center gap-2 cursor-pointer">
                        Mira cómo funciona
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </a>
                </div>
            </motion.div>

            {/* Columna Derecha: Imagen. Animamos desde la derecha (x: 50) y le ponemos un retraso (delay: 0.2) */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="w-full md:w-1/2"
            >
                <div className="bg-white p-2 rounded-2xl shadow-xl border border-gray-100">
                    <img
                        src={heroImage}
                        alt="Interfaz de QuizAI"
                        className="w-full h-auto rounded-xl object-cover"
                    />
                </div>
            </motion.div>

        </section>
    );
};

export default Hero;