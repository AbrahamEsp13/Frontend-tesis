import React from 'react';

const ActiveCourses = ({ courses }) => {
    return (
        <section>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Active Courses</h2>
                <a href="#" className="text-blue-600 font-medium text-sm hover:text-blue-800 transition-colors">View All Courses</a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                    <div key={course.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:border-blue-200 transition-colors cursor-pointer">
                        <div>
                            <div className="flex justify-between items-start mb-5">
                                <div className={`p-3 rounded-xl ${course.categoryBg}`}>
                                    <svg className={`w-5 h-5 ${course.categoryText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                </div>
                                <span className={`text-xs font-bold tracking-wider px-3 py-1.5 rounded-full ${course.categoryBg} ${course.categoryText}`}>{course.category}</span>
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2 leading-snug">{course.title}</h4>
                            <p className="text-gray-600 text-sm leading-relaxed mb-6">{course.description}</p>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-2.5">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-bold text-gray-900">{course.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                <div style={{ width: `${course.progress}%` }} className="bg-blue-600 h-2.5 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ActiveCourses;