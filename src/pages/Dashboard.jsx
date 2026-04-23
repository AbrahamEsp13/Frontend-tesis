import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import Sidebar from '../components/dashboard/Sidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import StatsOverview from '../components/dashboard/StatsOverview';
import ActiveCourses from '../components/dashboard/ActiveCourses';
import RightSidebar from '../components/dashboard/RightSidebar';

// Definimos la animación del contenedor (el que orquestra)
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1, // Cada hijo tardará 0.1s más que el anterior en aparecer
            delayChildren: 0.2    // Esperamos un poco antes de empezar
        }
    }
};

// Definimos la animación de cada bloque (el hijo)
const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.5, ease: "easeOut" }
    }
};

const Dashboard = () => {
    const navigate = useNavigate();
    const handleLogout = () => navigate('/');

    // Datos Mock...
    const userStats = [{ label: "Quizzes Completed", value: "24", details: "+3 this week" }, { label: "Average Score", value: "92%", details: "Top 5%" }, { label: "Study Hours", value: "12.5", details: "Weekly goal: 15h" }];
    const coursesData = [{ id: 1, title: 'Biology 101', progress: 65, category: 'SCIENCE', categoryBg: 'bg-green-100/50', categoryText: 'text-green-800' }, { id: 2, title: 'Intro to Psychology', progress: 40, category: 'SOCIAL SCIENCE', categoryBg: 'bg-blue-100/50', categoryText: 'text-blue-800' }];
    const upcomingQuizzesData = [{ id: 1, title: 'Cellular Division & ATP', details: 'Biology 101', dueDate: 'TOMORROW, 10:00 AM' }];

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
            <Sidebar onLogout={handleLogout} />

            {/* El contenedor principal ahora es un motion.div animado */}
            <motion.main
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex-1 overflow-y-auto p-4 md:p-8"
            >
                <motion.div variants={itemVariants}>
                    <DashboardHeader userName="Alex" streakDays={5} />
                </motion.div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    <div className="xl:col-span-3 space-y-10">
                        {/* Envolvemos cada sección en un motion.div con itemVariants */}
                        <motion.div variants={itemVariants}>
                            <StatsOverview stats={userStats} />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <ActiveCourses courses={coursesData} />
                        </motion.div>
                    </div>

                    <motion.div variants={itemVariants} className="xl:col-span-1">
                        <RightSidebar quizzes={upcomingQuizzesData} />
                    </motion.div>
                </div>
            </motion.main>
        </div>
    );
};

export default Dashboard;