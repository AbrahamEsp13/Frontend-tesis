import React from 'react';
import { motion } from 'framer-motion';

const Features = () => {
    return (
        // Usamos un fondo gris muy suave (bg-gray-50) para separarlo del Hero blanco
        <section id="features" className="bg-gray-50 py-24 px-6">
            <div className="max-w-7xl mx-auto">

                {/* Cabecera de la sección */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl font-extrabold text-gray-900 mb-4"
                    >
                        Estudia de forma más inteligente con el aprendizaje automático.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-gray-600"
                    >
                        Nuestra plataforma utiliza tecnología de procesamiento del lenguaje natural de última generación para comprender sus documentos.
                    </motion.p>
                </div>

                {/* Cuadrícula (Grid) Asimétrica */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Tarjeta Izquierda (Grande - Ocupa 2 columnas en pantallas grandes) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 lg:col-span-2 flex flex-col justify-between"
                    >
                        <div>
                            {/* Ícono */}
                            <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Análisis de PDF</h3>
                            <p className="text-gray-600 mb-8 max-w-md leading-relaxed">
                                Sube cualquier PDF y nuestra IA extraerá automáticamente los conceptos clave. No es necesario etiquetar manualmente; comprendemos la jerarquía de tu texto.
                            </p>
                        </div>
                        {/* Espacio para la ilustración gráfica */}
                        <div className="bg-gray-200/50 rounded-2xl h-48 w-full mt-auto flex items-end justify-center overflow-hidden">
                            {/* Dibujamos un "documento" simple con Tailwind para rellenar el espacio */}
                            <div className="bg-gray-300 w-48 h-40 rounded-t-xl border-t-[8px] border-l-[8px] border-r-[8px] border-gray-400"></div>
                        </div>
                    </motion.div>

                    {/* Columna Derecha (Contiene 2 tarjetas apiladas) */}
                    <div className="flex flex-col gap-8 lg:col-span-1">

                        {/* Tarjeta Arriba Derecha */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex-1"
                        >
                            <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Generación instantánea</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Genera preguntas de opción múltiple, verdadero/falso al instante, basándote en tu material.
                            </p>
                        </motion.div>

                        {/* Tarjeta Abajo Derecha */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex-1"
                        >
                            <div className="bg-gray-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Seguimiento del progreso</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Supervisa tu dominio de las materias a lo largo del tiempo con análisis detallados y rutas de aprendizaje personalizadas.
                            </p>
                        </motion.div>

                    </div>

                </div>
            </div>
        </section>
    );
};

export default Features;