
import React from 'react';
import { AppView } from '../types';

interface SignalingScreenLayoutProps {
    title: string;
    description: string;
    children: React.ReactNode;
    onBack: () => void;
}

export const SignalingScreenLayout: React.FC<SignalingScreenLayoutProps> = ({ title, description, children, onBack }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white">{title}</h1>
                    <p className="mt-2 text-gray-400">{description}</p>
                </div>
                {children}
                <div className="text-center mt-6">
                    <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
                        &larr; Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};
