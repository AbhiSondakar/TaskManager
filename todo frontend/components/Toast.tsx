import React, {useEffect} from 'react';
import {CheckIcon, XIcon} from './icons';

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
    action?: { label: string; callback: () => void };
}

export const Toast: React.FC<ToastProps> = ({message, type, onClose, action}) => {
    useEffect(() => {
        if (!action) {
            const timer = setTimeout(onClose, 5000);
            return () => clearTimeout(timer);
        }
    }, [action, onClose]);

    const colors = type === 'success'
        ? 'bg-green-100 text-green-800'
        : 'bg-red-100 text-red-800';

    return (
        <div className={`${colors} w-full shadow-lg rounded-lg p-4 animate-in slide-in-from-bottom-5 duration-300`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {type === 'success' ? <CheckIcon className="w-5 h-5"/> : <XIcon className="w-5 h-5"/>}
                    <p className="text-sm font-medium">{message}</p>
                </div>
                {action && (
                    <button onClick={() => {
                        action.callback();
                        onClose();
                    }} className="font-bold text-indigo-600 hover:text-indigo-800 ml-4 text-sm flex-shrink-0">
                        {action.label}
                    </button>
                )}
            </div>
        </div>
    );
};
