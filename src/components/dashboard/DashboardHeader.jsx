import React from 'react';

const DashboardHeader = ({ userName, streakDays }) => {
    return (
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-gray-100 gap-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Good Morning, {userName}.</h1>
                <p className="text-gray-500 mt-1 max-w-xl leading-relaxed">
                    You're on a {streakDays}-day streak! Consistency is the key to mastering complex subjects. Ready to tackle today's challenges?
                </p>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 text-gray-400">
                    <svg className="w-5 h-5 cursor-pointer hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <div className="relative">
                        <svg className="w-5 h-5 cursor-pointer hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        <span className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full border border-white"></span>
                    </div>
                    <img src="https://via.placeholder.com/32" alt="Avatar" className="w-8 h-8 rounded-full" />
                </div>

                <div className="flex items-center gap-3 bg-white p-3 px-5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-orange-500 bg-orange-100 rounded-lg p-2.5">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.433A1 1 0 005.355 6.88c-.33.313-.61.685-.805 1.122-.199.446-.312.96-.312 1.543 0 1.5.875 3.193 2.1 4.3 1.225 1.107 2.863 1.693 4.5 1.693 1.637 0 3.275-.586 4.5-1.693 1.225-1.107 2.1-2.8 2.1-4.3 0-1.571-.605-2.898-1.195-3.834-.59-.936-1.195-1.566-1.195-1.566z" clipRule="evenodd" /></svg>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">DAILY STREAK</p>
                        <p className="text-2xl font-extrabold text-gray-900">{streakDays} Days</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;