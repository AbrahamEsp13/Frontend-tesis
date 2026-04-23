import React from 'react';
import { motion } from 'framer-motion';

const HowItWorks = () => {
    return (
        <section id="how-it-works" className="bg-white py-24 px-6">
            <div className="max-w-7xl mx-auto">

                {/* PARTE SUPERIOR: La Inteligencia Detrás */}
                <div className="flex flex-col lg:flex-row gap-16 items-center mb-32">

                    {/* Columna Izquierda: Texto y Lista */}
                    <div className="w-full lg:w-1/2">
                        <motion.h2
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl font-extrabold text-gray-900 mb-12 leading-tight"
                        >
                            The Intelligence Behind Every Question
                        </motion.h2>

                        <div className="space-y-8">
                            {/* Item 01 */}
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="flex gap-6">
                                <span className="text-2xl font-bold text-blue-600">01</span>
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">Semantic Extraction</h4>
                                    <p className="text-gray-600 leading-relaxed">Our LLM parses your PDF to identify core definitions, relationships, and essential facts.</p>
                                </div>
                            </motion.div>

                            {/* Item 02 */}
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="flex gap-6">
                                <span className="text-2xl font-bold text-blue-600">02</span>
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">Pedagogical Alignment</h4>
                                    <p className="text-gray-600 leading-relaxed">Questions are mapped to Bloom's Taxonomy, ensuring you're tested on comprehension, not just memorization.</p>
                                </div>
                            </motion.div>

                            {/* Item 03 */}
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="flex gap-6">
                                <span className="text-2xl font-bold text-blue-600">03</span>
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">Adaptive Feedback</h4>
                                    <p className="text-gray-600 leading-relaxed">The system learns where you struggle and reinforces those concepts in future quizzes.</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Columna Derecha: Tarjeta Simulador de UI */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="w-full lg:w-1/2"
                    >
                        <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100">
                            <div className="flex justify-between items-center mb-8">
                                <h5 className="font-bold text-gray-900 text-sm">Subject Mastery: Psychology 101</h5>
                                <span className="text-xs font-bold text-blue-600 tracking-wider">LIVE DATA</span>
                            </div>

                            {/* Barras de Progreso */}
                            <div className="space-y-6 mb-8">
                                {[
                                    { label: "Cognitive Bias", score: "88%" },
                                    { label: "Neural Plasticity", score: "64%" },
                                    { label: "Memory Retention", score: "92%" }
                                ].map((item, index) => (
                                    <div key={index}>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600">{item.label}</span>
                                            <span className="font-bold text-gray-900">{item.score}</span>
                                        </div>
                                        <div className="w-full bg-blue-100 rounded-full h-2.5 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: item.score }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                                                className="bg-blue-600 h-2.5 rounded-full"
                                            ></motion.div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Caja de sugerencia (AI Insight) */}
                            <div className="bg-gray-50 border-l-4 border-blue-600 rounded-r-lg p-4">
                                <p className="text-sm text-gray-600 italic">
                                    "The AI suggests focusing on 'Neural Plasticity' in your next study session to bridge the gap."
                                </p>
                            </div>
                        </div>
                    </motion.div>

                </div>

                {/* PARTE INFERIOR: Call to Action (CTA) Gigante */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-12 md:p-20 text-center shadow-2xl shadow-blue-600/20"
                >
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                        Ready to master your material?
                    </h2>
                    <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-10">
                        Join thousands of students and educators using QuizAI to simplify their workflow.
                    </p>
                    <button className="bg-white text-blue-600 font-bold py-4 px-8 rounded-lg hover:bg-blue-50 transition-colors shadow-lg cursor-pointer">
                        Create Your First Quiz
                    </button>
                </motion.div>

            </div>
        </section>
    );
};

export default HowItWorks;