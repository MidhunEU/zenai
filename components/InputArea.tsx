import React, { useRef, useEffect } from 'react';
import { Icons } from './Icons';
import { AppMode, AttachedFile } from '../types';

interface InputAreaProps {
    input: string;
    setInput: (val: string) => void;
    handleSend: () => void;
    files: AttachedFile[];
    onRemoveFile: (idx: number) => void;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isListening: boolean;
    toggleMic: () => void;
    mode: AppMode;
    setMode: (m: AppMode) => void;
    renderModes: { id: AppMode; label: string; icon: React.ReactNode }[];
    isLoading: boolean;
    privateMode: boolean;
    isSpeechSupported: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({
    input, setInput, handleSend, files, onRemoveFile, onFileSelect,
    isListening, toggleMic, mode, setMode, renderModes, isLoading, privateMode, isSpeechSupported
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const el = textareaRef.current;
        if (el) {
            el.style.height = 'auto';
            if (input) el.style.height = Math.min(el.scrollHeight, 120) + 'px';
            else el.style.height = '40px'; // Set exact initial height to match buttons
        }
    }, [input]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={`absolute bottom-0 left-0 right-0 p-3 md:p-6 z-30 transition-all duration-500 glass-dock ${privateMode ? 'bg-stripes' : ''} pb-[max(12px,env(safe-area-inset-bottom))]`}>
            <div className="max-w-3xl mx-auto flex flex-col gap-3">
                {/* Mode Pills */}
                <div className="flex justify-start md:justify-center gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
                    {renderModes.map(m => (
                        <button key={m.id} onClick={() => setMode(m.id)} title={`Switch to ${m.label} mode`} className={`group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border whitespace-nowrap active:scale-95 ${mode === m.id ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-transparent shadow-sm' : 'bg-white/50 dark:bg-black/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-500'}`}>
                            <span className={`${mode === m.id ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>{m.icon}</span>{m.label}
                        </button>
                    ))}
                </div>

                {/* Input Container */}
                <div className={`relative flex flex-col p-2 rounded-3xl shadow-sm border transition-all focus-within:ring-2 focus-within:ring-zinc-300 dark:focus-within:ring-zinc-600 bg-white/95 dark:bg-zinc-900/95 border-zinc-200 dark:border-zinc-800`}>
                    
                    {/* File Previews */}
                    {files.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto p-2 pb-2 mb-1 border-b border-zinc-100 dark:border-zinc-800 no-scrollbar">
                            {files.map((f, i) => (
                                <div key={i} className="relative shrink-0 w-16 h-16 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 overflow-hidden group">
                                    {f.type.startsWith('image/') 
                                        ? <img src={f.content} className="w-full h-full object-cover opacity-90" />
                                        : <div className="w-full h-full flex items-center justify-center"><Icons.File size={24} className="opacity-50"/></div>
                                    }
                                    <button onClick={(e) => { e.stopPropagation(); onRemoveFile(i); }} title="Remove file" className="absolute top-0 right-0 w-6 h-6 bg-black/60 hover:bg-red-500 text-white flex items-center justify-center rounded-bl-xl backdrop-blur-sm transition cursor-pointer z-10 p-1"><Icons.X size={12}/></button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-end gap-2">
                        <div className="relative shrink-0 w-10 h-10 flex items-center justify-center">
                            <input type="file" multiple onChange={onFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept={mode === 'img2txt' ? "image/*" : (mode === 'speech2txt' ? "audio/*" : "*/*")} title="Attach files" />
                            <button className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 active:bg-zinc-200 dark:active:bg-zinc-700"><Icons.Paperclip size={20} /></button>
                        </div>
                        
                        <textarea 
                            ref={textareaRef} 
                            value={input} 
                            onChange={e => setInput(e.target.value)} 
                            onKeyDown={handleKeyDown} 
                            enterKeyHint="send"
                            placeholder={files.length > 0 ? `${files.length} file(s) attached` : (isListening ? "Listening..." : (privateMode ? "Private chat..." : "Type a message..."))} 
                            className="w-full bg-transparent border-none focus:ring-0 resize-none py-2 px-1 text-base min-h-[40px] max-h-[140px] outline-none leading-relaxed custom-scrollbar text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-600 dark:placeholder:text-zinc-500 placeholder:opacity-100" 
                            rows={1} 
                        />
                        
                        <div className="flex items-center gap-1 pb-0">
                            {mode !== 'img2txt' && mode !== 'speech2txt' && files.length === 0 && isSpeechSupported && (
                                <button onClick={toggleMic} title={isListening ? "Stop listening" : "Start voice input"} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isListening ? 'bg-red-500 text-white animate-pulse shadow-md ring-2 ring-red-200 dark:ring-red-900' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 active:bg-zinc-200'}`}>
                                    {isListening ? <Icons.MicOff size={20} /> : <Icons.Mic size={20} />}
                                </button>
                            )}
                            <button onClick={handleSend} title="Send message" disabled={isLoading || (!input.trim() && files.length === 0)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 ${ (input.trim() || files.length > 0) && !isLoading ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md hover:shadow-lg' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 opacity-50 cursor-not-allowed'}`}><Icons.Send size={18} /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InputArea;