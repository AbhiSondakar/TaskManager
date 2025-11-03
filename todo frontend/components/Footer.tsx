import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-white py-4 mt-8 border-t border-slate-200">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-sm">
                <p>&copy; {new Date().getFullYear()} Task Manager. All rights reserved.</p>
                <p className="mt-1">
                    Built with React &amp; Tailwind CSS.
                </p>
            </div>
        </footer>
    );
};
