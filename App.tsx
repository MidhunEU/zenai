import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { puterService } from './services/puterService';
import { Message, ChatSession, AttachedFile, AppMode, User, ThemeMode, Toast as ToastType } from './types';
import { Icons } from './components/Icons';
import Sidebar from './components/Sidebar';
import MessageItem from './components/MessageItem';
import InputArea from './components/InputArea';
import { SettingsModal, OnboardingModal } from './components/Modals';
import { ToastContainer } from './components/Toast';
import JSZip from 'jszip';

const uuid = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
const urlToBase64 = async (url: string) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });
    } catch(e) { return url; }
};

const ALL_MODES: { id: AppMode; label: string; icon: React.ReactNode }[] = [
    { id: 'chat', label: 'Chat', icon: <Icons.MessageSquare size={16} /> },
    { id: 'txt2img', label: 'Image', icon: <Icons.Image size={16} /> },
    { id: 'txt2vid', label: 'Video', icon: <Icons.Video size={16} /> },
    { id: 'txt2speech', label: 'Speech', icon: <Icons.Volume2 size={16} /> },
    { id: 'img2txt', label: 'OCR', icon: <Icons.ScanText size={16} /> },
    { id: 'speech2txt', label: 'Transcribe', icon: <Icons.Mic size={16} /> },
];

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [privateMode, setPrivateMode] = useState(false);
    const [previewMedia, setPreviewMedia] = useState<{type: string, content: string} | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [toasts, setToasts] = useState<ToastType[]>([]);
    
    const [history, setHistory] = useState<ChatSession[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    
    const [input, setInput] = useState('');
    const [files, setFiles] = useState<AttachedFile[]>([]);
    const [mode, setMode] = useState<AppMode>('chat');
    const [isLoading, setIsLoading] = useState(false);
    
    const [themeMode, setThemeMode] = useState<ThemeMode>('system'); 
    const [enabledModes, setEnabledModes] = useState<Record<string, boolean>>(ALL_MODES.reduce((acc, m) => ({...acc, [m.id]: true}), {}));
    const [model, setModel] = useState('gpt-4o-mini');
    const [systemPrompt, setSystemPrompt] = useState('');
    const [availableModels, setAvailableModels] = useState<{id: string}[]>([]);
    const [isSpeechSupported, setIsSpeechSupported] = useState(false);
    
    const [showScrollDown, setShowScrollDown] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const isAutoScrolling = useRef(true);
    const recognitionRef = useRef<any>(null);
    const appRef = useRef<HTMLDivElement>(null);

    // Toast Helper - Capped at 3
    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = uuid();
        setToasts(prev => {
            const newToasts = [...prev, { id, message, type }];
            // Keep only the last 3 toasts
            if (newToasts.length > 3) {
                return newToasts.slice(newToasts.length - 3);
            }
            return newToasts;
        });
    }, []);
    const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

    // Theme Logic & Meta Color
    useLayoutEffect(() => {
        const savedThemeMode = (localStorage.getItem('zen_theme_mode') as ThemeMode) || 'system';
        setThemeMode(savedThemeMode);
        
        const updateTheme = (isDark: boolean) => {
            document.documentElement.classList.toggle('dark', isDark);
            // Update Android/Browser Theme Color
            const metaThemeColor = document.querySelector('meta[name="theme-color"]');
            if (metaThemeColor) {
                metaThemeColor.setAttribute('content', isDark ? '#18181b' : '#fafafa');
            }
        };

        const handleSystemChange = (e: MediaQueryListEvent) => { if (themeMode === 'system') updateTheme(e.matches); };
        
        if (savedThemeMode === 'system') {
            const media = window.matchMedia('(prefers-color-scheme: dark)');
            updateTheme(media.matches);
            media.addEventListener('change', handleSystemChange);
            return () => media.removeEventListener('change', handleSystemChange);
        } else {
            updateTheme(savedThemeMode === 'dark');
        }
    }, [themeMode]);

    const changeThemeMode = (mode: ThemeMode) => { setThemeMode(mode); localStorage.setItem('zen_theme_mode', mode); };

    // Viewport Logic
    useEffect(() => {
        const handleVisualViewport = () => {
            if (!window.visualViewport || !appRef.current) return;
            
            if (window.matchMedia('(pointer: coarse)').matches) {
                 const viewportHeight = window.visualViewport.height;
                 appRef.current.style.height = `${viewportHeight}px`;
                 appRef.current.style.overflow = 'hidden';
                 window.scrollTo(0, 0);
                 
                 if(isAutoScrolling.current) {
                     setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'auto' }), 50);
                 }
            } else {
                appRef.current.style.height = '100%';
            }
        };

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleVisualViewport);
            window.visualViewport.addEventListener('scroll', handleVisualViewport);
            handleVisualViewport();
        }
        return () => {
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleVisualViewport);
                window.visualViewport.removeEventListener('scroll', handleVisualViewport);
            }
        };
    }, []);

    // Speech Logic
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setIsSpeechSupported(true);
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false; 
            recognition.interimResults = true;
            recognition.lang = 'en-US';
            
            recognition.onstart = () => setIsListening(true);
            recognition.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
                }
                if (finalTranscript) setInput(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + finalTranscript);
            };
            recognition.onerror = (e: any) => {
                console.error("Speech error", e);
                setIsListening(false);
                if (e.error !== 'no-speech') showToast("Speech recognition failed", 'error');
            };
            recognition.onend = () => setIsListening(false);
            recognitionRef.current = recognition;
        }
    }, []);

    const toggleMic = () => {
        if (!isSpeechSupported || !recognitionRef.current) return;
        if (isListening) recognitionRef.current.stop();
        else try { recognitionRef.current.start(); } catch (e) { setIsListening(false); }
    };

    // Init Logic
    useEffect(() => {
        const init = async () => {
            const handleResize = () => setIsMobile(window.innerWidth < 768);
            window.addEventListener('resize', handleResize);
            window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); setInstallPrompt(e); });
            
            try {
                setHistory(JSON.parse(localStorage.getItem('zen_history') || '[]'));
            } catch (e) { console.error(e); }

            setModel(localStorage.getItem('zen_model') || 'gpt-4o-mini');
            setSystemPrompt(localStorage.getItem('zen_system_prompt') || '');
            const savedModes = localStorage.getItem('zen_enabled_modes');
            if (savedModes) setEnabledModes(JSON.parse(savedModes));
            if (!localStorage.getItem('zen_onboarding_complete')) setShowOnboarding(true);

            if (puterService.isAuthenticated()) puterService.getUser().then(setUser);
            puterService.listModels().then(m => { if (Array.isArray(m)) setAvailableModels(m); });
            
            return () => window.removeEventListener('resize', handleResize);
        };
        init();
    }, []);

    const scrollToBottom = () => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); };
    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        const isNearBottom = distanceToBottom < 100;
        isAutoScrolling.current = isNearBottom;
        setShowScrollDown(distanceToBottom > 150);
    };
    useEffect(() => { if (isAutoScrolling.current) scrollToBottom(); }, [messages, isLoading]);

    useEffect(() => {
        if (!privateMode) localStorage.setItem('zen_history', JSON.stringify(history));
    }, [history, privateMode]);

    const handleLogin = async () => { 
        try {
            const u = await puterService.signIn(); 
            setUser(u); 
            if (showOnboarding) {
                 localStorage.setItem('zen_onboarding_complete', 'true'); 
                 setShowOnboarding(false); 
            }
        } catch(e) { showToast("Login failed", 'error'); }
    };
    const handleLogout = async () => { await puterService.signOut(); setUser(null); showToast("Logged out", 'info'); };

    const handleSidebarToggle = (open: boolean) => {
        if (open) {
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
        }
        setSidebarOpen(open);
    };

    const createNewChat = () => { 
        setPrivateMode(false); 
        setSessionId(null); 
        setMessages([]); 
        setInput(''); 
        setFiles([]); 
        if (isMobile) handleSidebarToggle(false); 
    };
    
    const loadChat = (id: string) => {
        setPrivateMode(false);
        const s = history.find(h => h.id === id);
        if (s) { 
            setSessionId(id); 
            setMessages(s.messages); 
            if (isMobile) handleSidebarToggle(false); 
        }
    };
    
    const deleteChat = (id: string) => { 
        if(!confirm("Delete?")) return; 
        const nh = history.filter(h => h.id !== id); 
        setHistory(nh); 
        if (sessionId === id) createNewChat(); 
        showToast("Chat deleted", 'info');
    };
    
    const updateChatTitle = (id: string, title: string) => {
        setHistory(prev => prev.map(h => h.id === id ? { ...h, title } : h));
    };

    // EXPORT FUNCTIONALITY
    const exportAllChats = async () => {
        if (!history.length && !messages.length) {
            showToast("No data to export", 'info');
            return;
        }

        const zip = new JSZip();
        
        // Add current chat if active and not saved
        let chatsToExport = [...history];
        if (messages.length > 0 && !sessionId) {
            chatsToExport.push({
                id: 'current',
                title: 'Current Session',
                date: new Date().toISOString(),
                messages: messages
            });
        }

        if(chatsToExport.length === 0) return;

        showToast("Preparing export...", 'info');

        try {
            const mediaFolder = zip.folder("media");
            
            for (const chat of chatsToExport) {
                let chatContent = `# ${chat.title}\nDate: ${new Date(chat.date).toLocaleString()}\n\n`;
                
                for (const msg of chat.messages) {
                    chatContent += `### ${msg.role.toUpperCase()}\n`;
                    
                    if (msg.type === 'text') {
                        chatContent += `${msg.content}\n\n`;
                    } 
                    else if (msg.type === 'image' || msg.type === 'video' || msg.type === 'audio') {
                         // Attempt to save media files
                         const ext = msg.type === 'image' ? 'png' : msg.type === 'video' ? 'mp4' : 'mp3';
                         const filename = `${chat.id}_${Date.now()}_${Math.random().toString(36).substr(2,5)}.${ext}`;
                         
                         // If base64
                         if (msg.content.startsWith('data:')) {
                             const base64Data = msg.content.split(',')[1];
                             mediaFolder?.file(filename, base64Data, {base64: true});
                             chatContent += `![${msg.type}](media/${filename})\n\n`;
                         } else {
                             chatContent += `[Link to ${msg.type}](${msg.content})\n\n`;
                         }
                    } 
                    else if (msg.type === 'user-media' && msg.files) {
                         for(const f of msg.files) {
                            chatContent += `[Attached: ${f.name}]\n`;
                         }
                         chatContent += `\n${msg.content}\n\n`;
                    }
                }
                
                // Sanitize filename
                const safeTitle = chat.title.replace(/[^a-z0-9]/gi, '_').slice(0, 50);
                zip.file(`${safeTitle}_${chat.id.slice(0,4)}.md`, chatContent);
            }
            
            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `zen-ai-export-${new Date().toISOString().slice(0,10)}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast("Export complete!", 'success');
        } catch (e) {
            console.error(e);
            showToast("Export failed", 'error');
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles.map(f => ({ name: f.name, type: f.type, content: URL.createObjectURL(f) } as any))]);
        }
        e.target.value = '';
    };

    const handleSend = async () => {
        if ((!input.trim() && files.length === 0) || isLoading) return;
        if (!user) { setShowOnboarding(true); return; }

        isAutoScrolling.current = true;
        scrollToBottom();

        let currentId = sessionId;
        if (!privateMode && !currentId) {
            currentId = uuid();
            const newSess: ChatSession = { id: currentId, title: input.slice(0, 30) || (files.length ? "Media Upload" : 'New Chat'), date: new Date().toISOString(), messages: [] };
            setHistory(prev => [newSess, ...prev]);
            setSessionId(currentId);
        }

        const attachedFiles: AttachedFile[] = [];
        for (const f of files) {
            const content = await urlToBase64(f.content);
            attachedFiles.push({ name: f.name, type: f.type, content });
        }

        const userMsg: Message = { role: 'user', content: input, type: 'text' };
        if (attachedFiles.length > 0) {
            userMsg.type = 'user-media'; 
            userMsg.files = attachedFiles;
        }
        
        const updatedMsgs = [...messages, userMsg];
        setMessages(updatedMsgs);
        setInput('');
        setFiles([]);
        setIsLoading(true);

        try {
            let resContent = '', resType: any = 'text', isOCR=false, isTranscribe=false;

            if (mode === 'chat') { 
                const botMsgId = uuid();
                const botMsg: Message = { role: 'assistant', content: '', type: 'text', id: botMsgId };
                setMessages([...updatedMsgs, botMsg]);

                const fullText = await puterService.streamChat(updatedMsgs, model, systemPrompt, (partial) => {
                     setMessages(prev => {
                        const newArr = [...prev];
                        const idx = newArr.findIndex(m => m.id === botMsgId);
                        if (idx !== -1) newArr[idx] = { ...newArr[idx], content: partial };
                        return newArr;
                    });
                });
                
                if (!privateMode && currentId) {
                     setHistory(prev => prev.map(h => h.id === currentId ? { ...h, messages: [...updatedMsgs, { role: 'assistant', content: fullText, type: 'text' }] } : h));
                }
            } else {
                if (mode === 'txt2img') { 
                    resContent = await puterService.generateImage(userMsg.content); 
                    resContent = await urlToBase64(resContent);
                    resType = 'image'; 
                }
                else if (mode === 'txt2vid') { 
                    resContent = await puterService.generateVideo(userMsg.content); 
                    resType = 'video'; 
                }
                else if (mode === 'txt2speech') { 
                    resContent = await puterService.generateSpeech(userMsg.content); 
                    resType = 'audio'; 
                }
                else if (mode === 'img2txt') {
                     if(attachedFiles.length === 0) throw new Error("Image needed");
                     resContent = await puterService.performOCR(attachedFiles[0]); 
                     isOCR = true; 
                }
                else if (mode === 'speech2txt') { 
                    if(attachedFiles.length === 0) throw new Error("Audio needed");
                    resContent = await puterService.transcribeAudio(attachedFiles[0]); 
                    isTranscribe = true; 
                }

                const botMsg: Message = { role: 'assistant', content: resContent, type: resType, isOCR, isTranscribe };
                const finalMsgs = [...updatedMsgs, botMsg];
                setMessages(finalMsgs);
                if (!privateMode && currentId) setHistory(prev => prev.map(h => h.id === currentId ? { ...h, messages: finalMsgs } : h));
            }
        } catch (err: any) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'assistant', content: "Error: " + err.message, type: 'error' }]);
            showToast("Generation failed: " + err.message, 'error');
        } finally { setIsLoading(false); }
    };

    const activeModes = ALL_MODES.filter(m => enabledModes[m.id]);
    const renderModes = activeModes.length > 0 ? activeModes : [ALL_MODES[0]];
    useEffect(() => { if (!enabledModes[mode]) setMode(renderModes[0].id); }, [enabledModes]);

    // Derived State for Typing Indicator
    const showTypingIndicator = isLoading && (
        mode !== 'chat' || 
        messages.length === 0 || 
        messages[messages.length - 1].role !== 'assistant' || 
        !messages[messages.length - 1].content
    );

    return (
        <div ref={appRef} className={`fixed inset-0 flex flex-col font-sans selection:bg-zinc-300 dark:selection:bg-zinc-700 transition-colors duration-500 ${privateMode ? 'bg-stripes' : ''} bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100`}>
            
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* CONTROLS */}
            <div className="absolute top-4 left-4 z-[60] flex gap-3">
                <button onClick={() => handleSidebarToggle(!sidebarOpen)} title="Menu" className={`w-12 h-12 rounded-full glass-btn flex items-center justify-center transition-all text-zinc-800 dark:text-zinc-200 hover:scale-105 active:scale-95`}>
                    {sidebarOpen ? <Icons.MenuOpen size={20} /> : <Icons.Menu size={20} />}
                </button>
                <button onClick={createNewChat} title="New Chat" className={`w-12 h-12 rounded-full glass-btn flex items-center justify-center transition-all text-zinc-800 dark:text-zinc-200 hover:scale-105 active:scale-95 duration-300 ${sidebarOpen ? 'opacity-0 pointer-events-none translate-x-[-20px]' : 'opacity-100 translate-x-0'}`}>
                    <Icons.Plus size={20} />
                </button>
            </div>

            <div className="absolute top-4 right-4 z-[60] flex gap-3">
                <button onClick={() => setInfoOpen(true)} title="About" className={`w-12 h-12 rounded-full glass-btn flex items-center justify-center transition-all text-zinc-800 dark:text-zinc-200 hover:scale-105 active:scale-95`}>
                    <Icons.Info size={20} />
                </button>
                <button onClick={() => {
                    setPrivateMode(!privateMode); setMessages([]); setSessionId(null); setFiles([]); setInput(''); if (!privateMode && isMobile) handleSidebarToggle(false);
                    showToast(privateMode ? "Private mode disabled" : "Private mode enabled", 'info');
                }} className={`w-12 h-12 rounded-full glass-btn flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${privateMode ? 'text-zinc-900 dark:text-zinc-100 border-2 border-zinc-900 dark:border-zinc-100' : 'text-zinc-800 dark:text-zinc-200'}`} title={privateMode ? "Exit Private Mode" : "Private Chat"}>
                    {privateMode ? <Icons.LogOut size={18} /> : <Icons.Ghost size={22} />}
                </button>
            </div>

            {/* PREVIEW */}
            {previewMedia && (
                <div className="fixed inset-0 z-[80] bg-black/90 flex flex-col animate-fade-in backdrop-blur-md" onClick={() => setPreviewMedia(null)}>
                    <div className="flex justify-between items-center p-4" onClick={e => e.stopPropagation()}>
                        <div className="text-white font-medium opacity-80">Media Preview</div>
                        <button onClick={() => setPreviewMedia(null)} className="p-2 text-white/70 hover:text-white bg-white/10 rounded-full hover:bg-white/20 transition"><Icons.X size={24}/></button>
                    </div>
                    <div className="flex-1 flex items-center justify-center p-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                        {previewMedia.type === 'image' && <img src={previewMedia.content} className="max-w-full max-h-full object-contain rounded shadow-2xl" />}
                        {previewMedia.type === 'video' && <video src={previewMedia.content} controls autoPlay className="max-w-full max-h-full rounded shadow-2xl" />}
                    </div>
                    <div className="p-6 flex justify-center pb-8" onClick={e => e.stopPropagation()}>
                        <a href={previewMedia.content} download={`zen-ai-${Date.now()}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"><Icons.Download size={20} /> Download</a>
                    </div>
                </div>
            )}

            <Sidebar 
                isOpen={sidebarOpen} setIsOpen={handleSidebarToggle} privateMode={privateMode} history={history} sessionId={sessionId}
                loadChat={loadChat} createNewChat={createNewChat} deleteChat={deleteChat} updateChatTitle={updateChatTitle}
                user={user} onLogin={handleLogin} onLogout={handleLogout} onOpenSettings={() => setSettingsOpen(true)}
                installPrompt={installPrompt} onInstall={() => { if(installPrompt) installPrompt.prompt(); setInstallPrompt(null); }}
                searchQuery={searchQuery} setSearchQuery={setSearchQuery} exportAllChats={exportAllChats}
                messages={messages}
            />

            {/* MAIN */}
            <div className={`flex-1 flex flex-col h-full relative min-w-0 transition-all duration-300`}>
                <main ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-3 md:p-8 pt-24 pb-36 md:pb-44 scroll-smooth z-0">
                    {!messages.length && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 select-none pointer-events-none pb-24">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 text-zinc-400 dark:text-zinc-600 animate-fade-in`}>{privateMode ? <Icons.Ghost size={56}/> : <Icons.YinYang size={56}/>}</div>
                            <p className="text-2xl font-semibold tracking-tight animate-slide-up text-zinc-800 dark:text-zinc-200">{privateMode ? 'Private Mode' : 'Your Zen is ready'}</p>
                        </div>
                    )}
                    <div className="max-w-3xl mx-auto space-y-6 pb-4">
                        {messages.map((msg, i) => {
                            if(!msg.content && msg.type === 'text') return null; 
                            return (
                                <div key={i} className={`flex gap-3 md:gap-4 animate-slide-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-full md:max-w-[85%] group relative ${msg.isOCR || msg.isTranscribe ? 'w-full' : msg.role === 'user' ? 'self-end' : 'self-start'}`}>
                                        <MessageItem msg={msg} onMediaClick={setPreviewMedia} showToast={showToast} />
                                    </div>
                                </div>
                            );
                        })}
                        
                        {/* Dynamic Typing Indicator */}
                        {showTypingIndicator && (
                            <div className="flex items-center gap-2 p-2 ml-1 animate-fade-in h-8 self-start">
                                <div className="flex items-center gap-1.5 bg-zinc-200 dark:bg-zinc-800 px-4 py-2.5 rounded-2xl rounded-tl-none">
                                    <div className="w-1.5 h-1.5 bg-zinc-500 dark:bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-1.5 h-1.5 bg-zinc-500 dark:bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-1.5 h-1.5 bg-zinc-500 dark:bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} className="h-1"></div>
                    </div>
                </main>

                {showScrollDown && (
                    <button onClick={() => { isAutoScrolling.current = true; scrollToBottom(); }} className="absolute bottom-32 md:bottom-36 left-1/2 -translate-x-1/2 z-40 w-10 h-10 flex items-center justify-center bg-zinc-800/90 dark:bg-zinc-200/90 backdrop-blur text-white dark:text-black rounded-full shadow-lg hover:scale-110 transition-transform">
                        <Icons.ChevronDown size={20}/>
                    </button>
                )}

                <InputArea 
                    input={input} setInput={setInput} handleSend={handleSend} files={files}
                    onRemoveFile={(idx) => setFiles(prev => prev.filter((_, i) => i !== idx))}
                    onFileSelect={handleFileSelect} isListening={isListening} toggleMic={toggleMic}
                    mode={mode} setMode={setMode} renderModes={renderModes} isLoading={isLoading}
                    privateMode={privateMode} isSpeechSupported={isSpeechSupported}
                />
            </div>

            {showOnboarding && !user && <OnboardingModal onLogin={handleLogin} />}

            {settingsOpen && (
                <SettingsModal 
                    onClose={() => setSettingsOpen(false)} 
                    themeMode={themeMode} changeThemeMode={changeThemeMode}
                    enabledModes={enabledModes} toggleModeEnabled={(id) => {
                        const newState = { ...enabledModes, [id]: !enabledModes[id] };
                        setEnabledModes(newState);
                        localStorage.setItem('zen_enabled_modes', JSON.stringify(newState));
                    }}
                    allModes={ALL_MODES}
                    model={model} setModel={(m) => { setModel(m); localStorage.setItem('zen_model', m); }}
                    availableModels={availableModels}
                    systemPrompt={systemPrompt}
                    setSystemPrompt={(s) => { setSystemPrompt(s); localStorage.setItem('zen_system_prompt', s); }}
                    onClearHistory={() => { 
                        if(confirm("Clear local history?")) { 
                            localStorage.removeItem('zen_history'); setHistory([]); setMessages([]); setSessionId(null); setSettingsOpen(false); 
                        }
                    }}
                />
            )}

            {infoOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setInfoOpen(false)}>
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 relative animate-slide-up text-center" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setInfoOpen(false)} className="absolute top-5 right-5 opacity-50 hover:opacity-100"><Icons.X size={20}/></button>
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4"><Icons.YinYang size={32} className="opacity-80"/></div>
                        <h2 className="text-xl font-bold mb-1">Zen AI</h2>
                        <p className="text-sm opacity-60 mb-6">Refactored Version</p>
                        
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition font-medium text-xs">
                                <Icons.Github size={16}/> GitHub
                            </a>
                            <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition font-medium text-xs">
                                <Icons.Linkedin size={16}/> LinkedIn
                            </a>
                            <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition font-medium text-xs">
                                <Icons.Bluesky size={16}/> Bluesky
                            </a>
                            <a href="mailto:contact@example.com" className="flex items-center justify-center gap-2 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition font-medium text-xs">
                                <Icons.Mail size={16}/> Email
                            </a>
                        </div>
                        
                        <div className="mt-4 text-[10px] opacity-40 uppercase tracking-widest">v2.1.0 &bull; Powered by Puter.js</div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;