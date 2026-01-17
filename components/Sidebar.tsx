import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';
import { ChatSession, User, Message } from '../types';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
    privateMode: boolean;
    history: ChatSession[];
    sessionId: string | null;
    loadChat: (id: string) => void;
    createNewChat: () => void;
    deleteChat: (id: string) => void;
    updateChatTitle: (id: string, title: string) => void;
    user: User | null;
    onLogin: () => void;
    onLogout: () => void;
    onOpenSettings: () => void;
    installPrompt: any;
    onInstall: () => void;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    exportAllChats: () => void;
    messages: Message[];
}

const Sidebar: React.FC<SidebarProps> = ({
    isOpen, setIsOpen, privateMode, history, sessionId, loadChat, createNewChat, deleteChat, updateChatTitle,
    user, onLogin, onLogout, onOpenSettings, installPrompt, onInstall, searchQuery, setSearchQuery, exportAllChats, messages
}) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const sidebarRef = useRef<HTMLElement>(null);
    const touchStart = useRef<number>(0);

    const startEdit = (e: React.MouseEvent, s: ChatSession) => { e.stopPropagation(); setEditingId(s.id); setEditTitle(s.title); };
    const saveEdit = (e: React.MouseEvent) => { e.stopPropagation(); if (editingId) updateChatTitle(editingId, editTitle); setEditingId(null); };
    const cancelEdit = (e: React.MouseEvent) => { e.stopPropagation(); setEditingId(null); };

    const filteredHistory = searchQuery.trim() === '' ? history : history.filter(h => h.title.toLowerCase().includes(searchQuery.toLowerCase()));

    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => { touchStart.current = e.touches[0].clientX; };
        const handleTouchEnd = (e: TouchEvent) => {
            const touchEnd = e.changedTouches[0].clientX;
            if (isOpen && touchStart.current - touchEnd > 50) setIsOpen(false); 
        };
        const el = sidebarRef.current;
        if (el) {
            el.addEventListener('touchstart', handleTouchStart);
            el.addEventListener('touchend', handleTouchEnd);
        }
        return () => {
            if (el) {
                el.removeEventListener('touchstart', handleTouchStart);
                el.removeEventListener('touchend', handleTouchEnd);
            }
        };
    }, [isOpen, setIsOpen]);

    return (
        <>
            <div className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)} />
            <aside ref={sidebarRef} className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r pt-24 transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] whitespace-nowrap overflow-hidden shadow-2xl w-[85vw] md:w-72 ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${privateMode ? 'bg-[#f4f4f5] dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800' : 'bg-white/95 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'}`}>
                <div className="absolute top-0 left-20 right-0 h-20 flex items-center px-4"><h1 className="text-xl font-bold tracking-tight flex items-center gap-2 text-zinc-900 dark:text-zinc-100">Zen AI</h1></div>
                {privateMode ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center opacity-60">
                        <div className="text-zinc-500 mb-4"><Icons.Ghost size={32}/></div>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Private Mode</p>
                        <p className="text-xs mt-1 text-zinc-600 dark:text-zinc-400">Chat history paused.</p>
                    </div>
                ) : (
                    <>
                        <div className="px-3 pb-2">
                            {installPrompt && (
                                <button onClick={onInstall} title="Install App" className="w-full flex items-center justify-center gap-2 py-3 mb-4 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium shadow-sm hover:scale-[1.02] transition-transform animate-fade-in">
                                    <Icons.Download size={18}/> Install App
                                </button>
                            )}
                            <div className="relative group mb-3">
                                <input type="text" placeholder="Search chats..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full border-none rounded-lg pl-9 pr-8 py-2 text-sm focus:ring-1 outline-none bg-zinc-100 dark:bg-zinc-800 focus:ring-zinc-300 dark:focus:ring-zinc-700 placeholder:text-zinc-500 dark:placeholder:text-zinc-500 text-zinc-900 dark:text-zinc-100 placeholder:opacity-100" />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-500"><Icons.Search size={14} /></div>
                                {searchQuery && <button onClick={() => setSearchQuery('')} title="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"><Icons.X size={14}/></button>}
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 pt-0 space-y-1 custom-scrollbar flex flex-col">
                            <button onClick={createNewChat} title="Start new chat" className="w-full flex items-center justify-center gap-2 py-3 mb-4 rounded-xl transition font-medium shadow-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90"><Icons.Plus size={18} /> New Chat</button>
                            
                            {history.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center text-center text-sm text-zinc-500 dark:text-zinc-500 font-medium">No chat history found.</div>
                            ) : (
                                filteredHistory.map(h => (
                                    <div key={h.id} onClick={() => loadChat(h.id)} title={`Chat: ${h.title}`} className={`group relative flex items-center p-3 rounded-xl cursor-pointer text-sm transition-all ${sessionId === h.id ? 'bg-zinc-100 dark:bg-zinc-800 font-medium text-zinc-900 dark:text-zinc-100' : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100 text-zinc-700 dark:text-zinc-300'}`}>
                                        {editingId === h.id ? (
                                            <div className="flex items-center w-full gap-1 animate-fade-in" onClick={e => e.stopPropagation()}>
                                                <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 rounded px-2 py-1 text-xs outline-none text-zinc-900 dark:text-zinc-100" autoFocus />
                                                <button onClick={saveEdit} title="Save title" className="text-green-600 p-1"><Icons.Check size={14}/></button>
                                                <button onClick={cancelEdit} title="Cancel" className="text-red-500 p-1"><Icons.X size={14}/></button>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="truncate flex-1 pr-8">{h.title}</span>
                                                <div className="absolute right-2 opacity-0 group-hover:opacity-100 flex gap-1 bg-white/90 dark:bg-zinc-800/90 rounded backdrop-blur-sm transition-opacity shadow-sm z-10">
                                                    <button onClick={e => startEdit(e, h)} title="Rename chat" className="p-1.5 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"><Icons.Edit size={13}/></button>
                                                    <button onClick={(e) => { e.stopPropagation(); deleteChat(h.id); }} title="Delete chat" className="p-1.5 text-zinc-600 hover:text-red-500 dark:text-zinc-400"><Icons.Trash size={13}/></button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
                <div className="p-3 border-t border-inherit bg-black/5 dark:bg-white/5">
                    {user ? (
                        <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-white/50 dark:bg-black/20 rounded-xl cursor-pointer hover:bg-white/80 dark:hover:bg-black/40 transition-colors" title={`Manage Account: ${user.username}`} onClick={() => window.open('https://puter.com/dashboard', '_blank')}>
                            <div className="w-8 h-8 rounded-full bg-zinc-300 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-200 flex items-center justify-center text-xs font-bold">{user.username.substring(0,2).toUpperCase()}</div>
                            <div className="flex-1 overflow-hidden">
                                <div className="text-sm font-medium truncate text-zinc-900 dark:text-zinc-100">{user.username}</div>
                                <button onClick={(e) => { e.stopPropagation(); onLogout(); }} title="Sign Out" className="text-[10px] text-red-500 font-bold hover:underline cursor-pointer tracking-wide">Sign out</button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={onLogin} title="Sign in with Puter.js" className="w-full py-3 mb-2 text-xs font-medium border border-zinc-300 dark:border-zinc-700 rounded-xl hover:bg-white dark:hover:bg-zinc-800 transition text-zinc-800 dark:text-zinc-200">Sign in</button>
                    )}
                    <button onClick={exportAllChats} disabled={history.length === 0 && messages.length === 0} title="Export all data to ZIP" className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition mb-1 text-zinc-800 dark:text-zinc-200"><Icons.Share size={18} /> Export your data</button>
                    <button onClick={onOpenSettings} title="Open settings" className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition text-zinc-800 dark:text-zinc-200"><Icons.Settings size={18} /> Settings</button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
