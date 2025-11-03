import React, {useEffect} from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({isOpen, onClose, title, children}) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in-25 duration-200"
            onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200"
                 onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-medium leading-6 text-slate-900 mb-4">{title}</h3>
                {children}
            </div>
        </div>
    );
};
