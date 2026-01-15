import React, { useEffect } from 'react';
import { Icons } from './Icons';
import { Toast as ToastType } from '../types';

interface ToastContainerProps {
    toasts: ToastType[];
    removeToast: (id: string) => void;
}

const Toast: React.FC<{ toast: ToastType; remove: () => void }> = ({ toast, remove }) => {
    useEffect(() => {
        const timer = setTimeout(remove, 3000);
        return () => clearTimeout(timer);
    }, [remove]);

    return (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-slide-up backdrop-blur-md bg-white/90 dark:bg-zinc-800/90 border-zinc-200 dark:border-zinc-700 min-w-[300px]">
            <div className={`shrink-0 ${toast.type === 'error' ? 'text-red-500' : toast.type === 'success' ? 'text-green-500' : 'text-blue-500'}`}>
                {toast.type === 'error' ? <Icons.Alert size={18}/> : toast.type === 'success' ? <Icons.Check size={18}/> : <Icons.Info size={18}/>}
            </div>
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 flex-1">{toast.message}</p>
            <button onClick={remove} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"><Icons.X size={14}/></button>
        </div>
    );
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto">
                <Toast toast={t} remove={() => removeToast(t.id)} />
            </div>
        ))}
    </div>
);