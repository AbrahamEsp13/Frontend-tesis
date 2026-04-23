import React from 'react';

const RightSidebar = ({ quizzes }) => {
    return (
        <aside className="space-y-8">

            {/* Widget 1: Upcoming Quizzes */}
            <section className="bg-white p-7 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Upcoming Quizzes</h3>
                <div className="space-y-5">
                    {quizzes.map(quiz => (
                        <div key={quiz.id} className="p-5 border border-gray-100 rounded-xl bg-gray-50/50">
                            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2.5">{quiz.dueDate}</p>
                            <h5 className="font-bold text-gray-900 text-lg mb-1 leading-snug">{quiz.title}</h5>
                            <p className="text-sm text-gray-600 mb-5 leading-relaxed">{quiz.details}</p>
                            <div className="flex gap-3">
                                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm cursor-pointer shadow-sm">Start</button>
                                <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm cursor-pointer">Topics</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Widget 2: Study Tip */}
            <div className="bg-white p-7 rounded-3xl border border-gray-100 shadow-sm flex gap-4">
                <div className="text-blue-600 bg-blue-100 rounded-lg p-2.5 h-10 w-10 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-xl">💡</span>
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 mb-1 text-base">Study Tip</h4>
                    <p className="text-gray-600 text-sm leading-relaxed mb-1.5">Our AI predicts you might need a refresher on "Mitochondrial Structure".</p>
                    <a href="#" className="text-sm font-semibold text-blue-600 hover:underline">Review Lesson</a>
                </div>
            </div>

            {/* Widget 3: Need Help? */}
            <div className="bg-gray-900 text-white p-8 rounded-3xl text-center relative overflow-hidden shadow-lg">
                <div className="absolute -bottom-10 -right-10 bg-gray-800 w-40 h-40 rounded-full opacity-60"></div>
                <div className="absolute top-10 -left-10 bg-gray-700 w-20 h-20 rounded-full opacity-40"></div>
                <div className="relative z-10">
                    <h4 className="font-extrabold text-2xl mb-2">Need Help?</h4>
                    <p className="text-gray-400 text-sm leading-relaxed mb-7 max-w-sm mx-auto">Connect with a tutor or use our AI assistant for instant clarification.</p>
                    <button className="bg-white text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer w-full">Ask QuizAI</button>
                </div>
            </div>

        </aside>
    );
};

export default RightSidebar;