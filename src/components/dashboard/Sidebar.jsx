import React from 'react';

// Recibimos 'onLogout' como una Propiedad (prop) desde el padre
const Sidebar = ({ onLogout }) => {
    const menuItems = [
        { name: 'Dashboard', icon: 'M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z', active: true },
        { name: 'My Courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', active: false },
        { name: 'Exams', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', active: false },
        { name: 'Grades', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', active: false },
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden lg:flex sticky top-0 h-screen">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <span className="text-gray-900 font-bold text-2xl">EduAI</span>
            </div>

            <nav className="flex-1 p-4 space-y-2 mt-4">
                {menuItems.map((item) => (
                    <a key={item.name} href="#" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${item.active ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <svg className="w-5 h-5" fill={item.active ? "currentColor" : "none"} stroke={item.active ? "none" : "currentColor"} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
                        {item.name}
                    </a>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100 mt-auto">
                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                    <img src="https://via.placeholder.com/40" alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                        <p className="font-bold text-gray-900">Alex Johnson</p>
                        <p className="text-sm text-gray-500">Premium Plan</p>
                    </div>
                </div>
                <button onClick={onLogout} className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors w-full cursor-pointer mt-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Log Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;