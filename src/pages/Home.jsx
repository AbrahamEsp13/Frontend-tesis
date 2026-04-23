import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';
import { Link } from 'react-router-dom';

const Home = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('login');

    const openModal = (mode) => {
        setModalMode(mode);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-white font-sans overflow-x-hidden relative">
            <Navbar onOpenAuth={openModal} />
            <main>
                <Hero />
                <Features />
                <HowItWorks />
            </main>
            <Footer />
            <AuthModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialMode={modalMode}
            />
        </div>
    );
};

export default Home;