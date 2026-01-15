import React from 'react';
import { Icons } from './Icons';
import { AppMode, ThemeMode } from '../types';

export const ModalOverlay: React.FC<{children: React.ReactNode, onClick: () => void}> = ({children, onClick}) => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in" onClick={onClick}>
        {children}
    </div>
);

export const SettingsModal: React.FC<{
    onClose: () => void;
    themeMode: ThemeMode;
    changeThemeMode: (m: ThemeMode) => void;
    enabledModes: Record<string, boolean>;
    toggleModeEnabled: (id: string) => void;
    allModes: { id: AppMode; label: string; icon: React.ReactNode }[];
    model: string;
    setModel: (m: string) => void;
    availableModels: {id: string}[];
    systemPrompt: string;
    setSystemPrompt: (s: string) => void;
    onClearHistory: () => void;
}> = ({ onClose, themeMode, changeThemeMode, enabledModes, toggleModeEnabled, allModes, model, setModel, availableModels, systemPrompt, setSystemPrompt, onClearHistory }) => (
    <ModalOverlay onClick={onClose}>
        <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 relative animate-slide-up max-h-[85vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-5 right-5 opacity-50 hover:opacity-100 text-zinc-900 dark:text-zinc-100"><Icons.X size={20}/></button>
            <h2 className="text-xl font-bold mb-8 text-zinc-900 dark:text-zinc-100">Settings</h2>
            <div className="space-y-8">
                
                <div className="space-y-3">
                    <label className="text-xs font-bold opacity-70 uppercase tracking-wider ml-1 text-zinc-800 dark:text-zinc-200">Assistant Persona</label>
                    <div className="relative">
                        <textarea 
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            placeholder="Roleplay as Jeffrey Epstein..."
                            className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl pl-10 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-zinc-500 min-h-[80px] resize-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-500 placeholder:opacity-100"
                        />
                        <div className="absolute top-3 left-3 text-zinc-500 dark:text-zinc-400 pointer-events-none"><Icons.Sparkles size={16}/></div>
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 px-1">Instructions for how the AI should behave.</p>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-bold opacity-70 uppercase tracking-wider ml-1 text-zinc-800 dark:text-zinc-200">Appearance</label>
                    <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
                        {['system', 'light', 'dark'].map((t) => (
                            <button key={t} onClick={() => changeThemeMode(t as ThemeMode)} className={`flex-1 py-2 text-xs font-medium rounded-lg capitalize transition-all ${themeMode === t ? 'bg-zinc-900 dark:bg-zinc-100 shadow-sm text-white dark:text-zinc-900' : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'}`}>
                                {t === 'system' && <span className="flex items-center justify-center gap-1"><Icons.Laptop size={12}/> Auto</span>}
                                {t === 'light' && <span className="flex items-center justify-center gap-1"><Icons.Sun size={12}/> Light</span>}
                                {t === 'dark' && <span className="flex items-center justify-center gap-1"><Icons.Moon size={12}/> Dark</span>}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-bold opacity-70 uppercase tracking-wider ml-1 text-zinc-800 dark:text-zinc-200">Chat Modes</label>
                    <div className="grid grid-cols-2 gap-2">
                        {allModes.map(m => (
                            <button key={m.id} onClick={() => toggleModeEnabled(m.id)} className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border ${enabledModes[m.id] ? 'bg-zinc-900 dark:bg-zinc-100 border-transparent text-white dark:text-zinc-900 shadow-sm' : 'bg-transparent border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 opacity-80'}`}>
                                <span className="opacity-70">{m.icon}</span> {m.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-bold opacity-70 uppercase tracking-wider ml-1 text-zinc-800 dark:text-zinc-200">Default Chat Model</label>
                    <div className="relative">
                        <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-zinc-500 appearance-none text-zinc-900 dark:text-zinc-100">
                            {availableModels.length > 0 ? availableModels.map(m => <option key={m.id} value={m.id}>{m.id}</option>) : <><option value="gpt-4o-mini">gpt-4o-mini</option><option value="gpt-4o">gpt-4o</option></>}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-zinc-600 dark:text-zinc-400"><Icons.ChevronDown size={16} /></div>
                    </div>
                </div>

                <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
                    <button onClick={onClearHistory} className="w-full py-3 text-red-600 dark:text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-xl transition-colors">Clear History</button>
                </div>
            </div>
        </div>
    </ModalOverlay>
);

export const OnboardingModal: React.FC<{onLogin: () => void}> = ({ onLogin }) => (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 text-center animate-slide-up relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-zinc-900 dark:via-zinc-100 to-transparent opacity-20"></div>
            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6"><Icons.YinYang size={32} className="opacity-50 text-zinc-900 dark:text-zinc-100"/></div>
            <h2 className="text-2xl font-bold mb-3 text-zinc-900 dark:text-zinc-100">Welcome to Zen AI</h2>
            <p className="opacity-70 mb-8 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">Keep your body and mind focused with a truly minimal assistant which will never give you up or let you down.</p>
            <div className="space-y-3">
                <button onClick={onLogin} className="w-full py-3.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-transform">Get started</button>
                <div className="text-[10px] opacity-40 pt-4 text-zinc-600 dark:text-zinc-400">
                    By proceeding you accept our{" "}
                    <a
                        href="/terms.html"
                        rel="noopener noreferrer"
                        className="underline hover:opacity-100"
                        >
                        Terms of Service
                    </a>
                    {" "}and{" "}
                    <a
                        href="/privacy.html"
                        rel="noopener noreferrer"
                        className="underline hover:opacity-100"
                        >
                        Privacy Policy
                    </a>
                </div>
            </div>
        </div>
    </div>
);
