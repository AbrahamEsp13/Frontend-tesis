import React from 'react';

const StatsOverview = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((item, index) => (
                <div key={index} className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">{item.label}</h3>
                        <span className="text-4xl font-extrabold text-gray-900">{item.value}</span>
                    </div>
                    <p className="text-gray-500 text-sm mt-4 pt-4 border-t border-gray-100 leading-relaxed">
                        {item.details}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default StatsOverview;