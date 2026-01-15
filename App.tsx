import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { puterService, urlToBase64 } from './services/puterService';
import { Message, ChatSession, AttachedFile, AppMode, User, ThemeMode, Toast as ToastType } from './types';
import { Icons } from './components/Icons';
import Sidebar from './components/Sidebar';
import MessageItem from './components/MessageItem';
import InputArea from './components/InputArea';
import { SettingsModal, OnboardingModal } from './components/Modals';
import { ToastContainer } from './components/Toast';
import JSZip from 'jszip';

const uuid = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const ALL_MODES: { id: AppMode; label: string; icon: React.ReactNode }[] = [
    { id: 'chat', label: 'Chat', icon: <Icons.MessageSquare size={16} /> },
    { id: 'txt2img', label: 'Image', icon: <Icons.Image size={16} /> },
    { id: 'txt2vid', label: 'Video', icon: <Icons.Video size={16} /> },
    { id: 'txt2speech', label: 'Speech', icon: <Icons.Volume2 size={16} /> },
    { id: 'img2txt', label: 'OCR', icon: <Icons.ScanText size={16} /> },
    { id: 'speech2txt', label: 'Transcribe', icon: <Icons.Mic size={16} /> },
];

function App() {
    // --- State ---
    const [user, setUser] = useState<User | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [privateMode, setPrivateMode] = useState(false);
    
    // Chat & Data
    const [history, setHistory] = useState<ChatSession[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    
    // Inputs & Processing
    const [input, setInput] = useState('');
    const [files, setFiles] = useState<AttachedFile[]>([]);
    const [mode, setMode] = useState<AppMode>('chat');
    const [isLoading, setIsLoading] = useState(false);
    const [previewMedia, setPreviewMedia] = useState<{type: string, content: string} | null>(null);
    
    // Config
    const [themeMode, setThemeMode] = useState<ThemeMode>('system'); 
    const [enabledModes, setEnabledModes] = useState<Record<string, boolean>>(ALL_MODES.reduce((acc, m) => ({...acc, [m.id]: true}), {}));
    const [model, setModel] = useState('gpt-4o-mini');
    const [systemPrompt, setSystemPrompt] = useState('');
    const [availableModels, setAvailableModels] = useState<{id: string}[]>([]);
    
    // Speech & Interaction
    const [isSpeechSupported, setIsSpeechSupported] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [toasts, setToasts] = useState<ToastType[]>([]);
    const [showScrollDown, setShowScrollDown] = useState(false);

    // Refs
    const bottomRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const isAutoScrolling = useRef(true);
    const recognitionRef = useRef<any>(null);
    const appRef = useRef<HTMLDivElement>(null);
    const abortController = useRef<AbortController | null>(null);
    const dragCounter = useRef(0);

    // --- Helpers ---
    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = uuid();
        setToasts(prev => {
            const newToasts = [...prev, { id, message, type }];
            return newToasts.length > 3 ? newToasts.slice(newToasts.length - 3) : newToasts;
        });
    }, []);
    
    const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

    // --- Effects ---

    // Theme Management
    useLayoutEffect(() => {
        const savedThemeMode = (localStorage.getItem('zen_theme_mode') as ThemeMode) || 'system';
        setThemeMode(savedThemeMode);
        
        const updateTheme = (isDark: boolean) => {
            document.documentElement.classList.toggle('dark', isDark);
            document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#18181b' : '#fafafa');
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

    // Viewport & Mobile Height Fixes
    useEffect(() => {
        const handleVisualViewport = () => {
            if (!window.visualViewport || !appRef.current) return;
            // On mobile, sync app height with visual viewport to avoid keyboard overlap issues
            if (window.matchMedia('(pointer: coarse)').matches) {
                 appRef.current.style.height = `${window.visualViewport.height}px`;
                 appRef.current.style.overflow = 'hidden';
                 window.scrollTo(0, 0);
                 if(isAutoScrolling.current) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'auto' }), 50);
            } else {
                appRef.current.style.height = '100%';
            }
        };

        window.visualViewport?.addEventListener('resize', handleVisualViewport);
        window.visualViewport?.addEventListener('scroll', handleVisualViewport);
        handleVisualViewport();
        return () => {
            window.visualViewport?.removeEventListener('resize', handleVisualViewport);
            window.visualViewport?.removeEventListener('scroll', handleVisualViewport);
        };
    }, []);

    // Speech Recognition Setup
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
                setIsListening(false);
                if (e.error !== 'no-speech') showToast("Speech input failed", 'error');
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

    // Initialization
    useEffect(() => {
        const init = async () => {
            const handleResize = () => setIsMobile(window.innerWidth < 768);
            window.addEventListener('resize', handleResize);
            window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); setInstallPrompt(e); });
            
            // Load Local Data
            try {
                setHistory(JSON.parse(localStorage.getItem('zen_history') || '[]'));
            } catch (e) { /* Ignore corrupt history */ }

            setModel(localStorage.getItem('zen_model') || 'gpt-4o-mini');
            setSystemPrompt(localStorage.getItem('zen_system_prompt') || '');
            const savedModes = localStorage.getItem('zen_enabled_modes');
            if (savedModes) setEnabledModes(JSON.parse(savedModes));
            if (!localStorage.getItem('zen_onboarding_complete')) setShowOnboarding(true);

            // Puter Check
            if (puterService.isAuthenticated()) puterService.getUser().then(setUser);
            puterService.listModels().then(m => { if (Array.isArray(m)) setAvailableModels(m); });
            
            return () => window.removeEventListener('resize', handleResize);
        };
        init();
    }, []);

    // Auto-Scroll Logic
    const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    useEffect(() => { 
        if (isAutoScrolling.current) scrollToBottom(); 
    }, [messages, isLoading]);

    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
        const nearBottom = dist < 100;
        isAutoScrolling.current = nearBottom;
        setShowScrollDown(dist > 150);
    };

    // Persistence
    useEffect(() => {
        if (!privateMode) localStorage.setItem('zen_history', JSON.stringify(history));
    }, [history, privateMode]);

    // --- Handlers ---

    const handleLogin = async () => { 
        try {
            const u = await puterService.signIn(); 
            setUser(u); 
            completeOnboarding();
        } catch(e: any) { 
            // Recover session if technically authenticated despite error
            if (puterService.isAuthenticated()) {
                try {
                    const u = await puterService.getUser();
                    setUser(u);
                    completeOnboarding();
                    return;
                } catch(err) { console.error(err); }
            }

            // Ignorable user cancellation
            if (e?.error === 'auth_window_closed') return;
            
            showToast("Login failed", 'error'); 
        }
    };

    const completeOnboarding = () => {
        if (showOnboarding) {
            localStorage.setItem('zen_onboarding_complete', 'true'); 
            setShowOnboarding(false); 
        }
    };

    const createNewChat = () => { 
        setPrivateMode(false); 
        setSessionId(null); 
        setMessages([]); 
        setInput(''); 
        setFiles([]); 
        if (isMobile) setSidebarOpen(false); 
    };

    const loadChat = (id: string) => {
        setPrivateMode(false);
        const s = history.find(h => h.id === id);
        if (s) { 
            setSessionId(id); 
            setMessages(s.messages); 
            if (isMobile) setSidebarOpen(false); 
        }
    };

    const handleSend = async () => {
        if ((!input.trim() && files.length === 0) || isLoading) return;
        if (!user) { setShowOnboarding(true); return; }

        isAutoScrolling.current = true;
        scrollToBottom();

        // New Session?
        let currentId = sessionId;
        if (!privateMode && !currentId) {
            currentId = uuid();
            const newSess: ChatSession = { 
                id: currentId, 
                title: input.slice(0, 30) || (files.length ? "Media Upload" : 'New Chat'), 
                date: new Date().toISOString(), 
                messages: [] 
            };
            setHistory(prev => [newSess, ...prev]);
            setSessionId(currentId);
        }

        // Process Attachments
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

        abortController.current = new AbortController();
        const signal = abortController.current.signal;

        try {
            if (mode === 'chat') { 
                const botMsgId = uuid();
                const botMsg: Message = { role: 'assistant', content: '', type: 'text', id: botMsgId };
                setMessages([...updatedMsgs, botMsg]);

                const fullText = await puterService.streamChat(updatedMsgs, model, systemPrompt, (partial) => {
                     if (signal.aborted) return;
                     setMessages(prev => {
                        const newArr = [...prev];
                        const idx = newArr.findIndex(m => m.id === botMsgId);
                        if (idx !== -1) newArr[idx] = { ...newArr[idx], content: partial };
                        return newArr;
                    });
                }, signal);
                
                if (!privateMode && currentId && !signal.aborted) {
                     setHistory(prev => prev.map(h => h.id === currentId ? { ...h, messages: [...updatedMsgs, { role: 'assistant', content: fullText, type: 'text' }] } : h));
                }
            } else {
                // Generative Modes
                let resContent = '', resType: any = 'text', isOCR=false, isTranscribe=false;
                
                if (mode === 'txt2img') { 
                    resContent = await urlToBase64(await puterService.generateImage(userMsg.content));
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
                     if(!attachedFiles.length) throw new Error("Image needed");
                     resContent = await puterService.performOCR(attachedFiles[0]); 
                     isOCR = true; 
                }
                else if (mode === 'speech2txt') { 
                    if(!attachedFiles.length) throw new Error("Audio needed");
                    resContent = await puterService.transcribeAudio(attachedFiles[0]); 
                    isTranscribe = true; 
                }

                if (!signal.aborted) {
                    const botMsg: Message = { role: 'assistant', content: resContent, type: resType, isOCR, isTranscribe };
                    const finalMsgs = [...updatedMsgs, botMsg];
                    setMessages(finalMsgs);
                    if (!privateMode && currentId) setHistory(prev => prev.map(h => h.id === currentId ? { ...h, messages: finalMsgs } : h));
                }
            }
        } catch (err: any) {
            // Gracefully handle abort without error toast
            if (err.name === 'AbortError' || signal.aborted) {
                // We can optionally leave the partial message or remove it. 
                // Currently, the partial message remains in state (setMessages in callback), which is desired behavior.
                return;
            }
            
            console.error(err);
            setMessages(prev => [...prev, { role: 'assistant', content: "Error: " + err.message, type: 'error' }]);
            showToast("Generation failed: " + err.message, 'error');
        } finally { 
            // Cleanup controller if it matches the current session
            if (abortController.current?.signal === signal) {
                 setIsLoading(false); 
                 abortController.current = null;
            }
        }
    };

    const stopGeneration = () => {
        if (abortController.current) {
            abortController.current.abort();
            // Force state update immediately for UI responsiveness
            setIsLoading(false);
            abortController.current = null;
            showToast("Generation stopped", 'info');
        }
    };

    // Drag & Drop
    useEffect(() => {
        const handleDrag = (e: DragEvent, type: 'enter'|'leave'|'drop'|'over') => {
            e.preventDefault(); e.stopPropagation();
            if (type === 'enter') { dragCounter.current++; setIsDragging(true); }
            else if (type === 'leave') { dragCounter.current--; if(dragCounter.current === 0) setIsDragging(false); }
            else if (type === 'drop') {
                setIsDragging(false); dragCounter.current = 0;
                if (e.dataTransfer?.files?.length) {
                    const newFiles = Array.from(e.dataTransfer.files).map(f => ({ name: f.name, type: f.type, content: URL.createObjectURL(f) }));
                    setFiles(prev => [...prev, ...newFiles]);
                    showToast(`${newFiles.length} file(s) added`, 'success');
                }
            }
        };
        const de = (e:DragEvent) => handleDrag(e,'enter'), dl = (e:DragEvent) => handleDrag(e,'leave'), do_ = (e:DragEvent) => handleDrag(e,'over'), dd = (e:DragEvent) => handleDrag(e,'drop');
        window.addEventListener('dragenter', de); window.addEventListener('dragleave', dl); window.addEventListener('dragover', do_); window.addEventListener('drop', dd);
        return () => { window.removeEventListener('dragenter', de); window.removeEventListener('dragleave', dl); window.removeEventListener('dragover', do_); window.removeEventListener('drop', dd); };
    }, []);

    // Active Modes
    const activeModes = ALL_MODES.filter(m => enabledModes[m.id]);
    const renderModes = activeModes.length > 0 ? activeModes : [ALL_MODES[0]];
    useEffect(() => { if (!enabledModes[mode]) setMode(renderModes[0].id); }, [enabledModes, mode, renderModes]);

    // Export Logic
    const exportAllChats = async () => {
        if (!history.length && !messages.length) { showToast("No data to export", 'info'); return; }
        showToast("Preparing export...", 'info');
        
        const zip = new JSZip();
        const chatsToExport = [...history];
        if (messages.length > 0 && !sessionId) {
            chatsToExport.push({ id: 'current', title: 'Current Session', date: new Date().toISOString(), messages });
        }

        try {
            const mediaFolder = zip.folder("media");
            for (const chat of chatsToExport) {
                let content = `# ${chat.title}\nDate: ${new Date(chat.date).toLocaleString()}\n\n`;
                for (const msg of chat.messages) {
                    content += `### ${msg.role.toUpperCase()}\n`;
                    if (msg.type === 'text') content += `${msg.content}\n\n`;
                    else if (['image', 'video', 'audio'].includes(msg.type)) {
                        const ext = msg.type === 'image' ? 'png' : msg.type === 'video' ? 'mp4' : 'mp3';
                        const filename = `${chat.id}_${Date.now()}_${Math.random().toString(36).substr(2,5)}.${ext}`;
                        if (msg.content.startsWith('data:')) {
                            mediaFolder?.file(filename, msg.content.split(',')[1], {base64: true});
                            content += `![${msg.type}](media/${filename})\n\n`;
                        } else content += `[Link to ${msg.type}](${msg.content})\n\n`;
                    }
                    else if (msg.type === 'user-media' && msg.files) {
                        msg.files.forEach(f => content += `[Attached: ${f.name}]\n`);
                        content += `\n${msg.content}\n\n`;
                    }
                }
                zip.file(`${chat.title.replace(/[^a-z0-9]/gi, '_').slice(0, 50)}.md`, content);
            }
            const blob = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `zen-export-${new Date().toISOString().slice(0,10)}.zip`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
            showToast("Export complete!", 'success');
        } catch (e) { console.error(e); showToast("Export failed", 'error'); }
    };

    const showTypingIndicator = isLoading && (mode !== 'chat' || !messages.length || messages[messages.length - 1].role !== 'assistant' || !messages[messages.length - 1].content);

    return (
        <div ref={appRef} className={`fixed inset-0 flex flex-col font-sans selection:bg-zinc-300 dark:selection:bg-zinc-700 transition-colors duration-500 ${privateMode ? 'bg-stripes' : ''} bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100`}>
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* Drag Overlay */}
            {isDragging && (
                <div className="fixed inset-0 z-[100] bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center border-4 border-dashed border-zinc-500 m-4 rounded-3xl animate-fade-in pointer-events-none">
                    <div className="text-white text-2xl font-bold flex flex-col items-center gap-4"><Icons.Download size={48} />Drop your files here</div>
                </div>
            )}

            {/* Header / Nav */}
            <div className="absolute top-4 left-4 z-[60] flex gap-3">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} title="Menu" className={`w-12 h-12 rounded-full glass-btn flex items-center justify-center transition-all text-zinc-800 dark:text-zinc-200 hover:scale-105 active:scale-95`}>
                    {sidebarOpen ? <Icons.MenuOpen size={20} /> : <Icons.Menu size={20} />}
                </button>
                <button onClick={createNewChat} title="New Chat" className={`w-12 h-12 rounded-full glass-btn flex items-center justify-center transition-all text-zinc-800 dark:text-zinc-200 hover:scale-105 active:scale-95 duration-300 ${sidebarOpen ? 'opacity-0 pointer-events-none -translate-x-5' : 'opacity-100 translate-x-0'}`}>
                    <Icons.Plus size={20} />
                </button>
            </div>

            <div className="absolute top-4 right-4 z-[60] flex gap-3">
                <button onClick={() => setInfoOpen(true)} title="About" className={`w-12 h-12 rounded-full glass-btn flex items-center justify-center transition-all text-zinc-800 dark:text-zinc-200 hover:scale-105 active:scale-95`}>
                    <Icons.Info size={20} />
                </button>
                <button onClick={() => {
                    setPrivateMode(!privateMode); setMessages([]); setSessionId(null); setFiles([]); setInput(''); if (!privateMode && isMobile) setSidebarOpen(false);
                    showToast(privateMode ? "Private mode disabled" : "Private mode enabled", 'info');
                }} className={`w-12 h-12 rounded-full glass-btn flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${privateMode ? 'text-zinc-900 dark:text-zinc-100 border-2 border-zinc-900 dark:border-zinc-100' : 'text-zinc-800 dark:text-zinc-200'}`} title={privateMode ? "Exit Private Mode" : "Private Chat"}>
                    {privateMode ? <Icons.LogOut size={18} /> : <Icons.Ghost size={22} />}
                </button>
            </div>

            {/* Sidebar */}
            <Sidebar 
                isOpen={sidebarOpen} setIsOpen={setSidebarOpen} privateMode={privateMode} history={history} sessionId={sessionId}
                loadChat={loadChat} createNewChat={createNewChat} deleteChat={(id) => { if(confirm("Delete?")) { setHistory(prev => prev.filter(h => h.id !== id)); if(sessionId === id) createNewChat(); showToast("Chat deleted", 'info'); } }} 
                updateChatTitle={(id, title) => setHistory(prev => prev.map(h => h.id === id ? { ...h, title } : h))}
                user={user} onLogin={handleLogin} onLogout={async () => { await puterService.signOut(); setUser(null); showToast("Logged out", 'info'); }} 
                onOpenSettings={() => setSettingsOpen(true)} installPrompt={installPrompt} onInstall={() => { installPrompt?.prompt(); setInstallPrompt(null); }}
                searchQuery={searchQuery} setSearchQuery={setSearchQuery} exportAllChats={exportAllChats} messages={messages}
            />

            {/* Media Preview Modal */}
            {previewMedia && (
                <div className="fixed inset-0 z-[80] bg-black/90 flex flex-col animate-fade-in backdrop-blur-md" onClick={() => setPreviewMedia(null)}>
                    <div className="flex justify-between items-center p-4">
                        <div className="text-white font-medium opacity-80">Media Preview</div>
                        <button onClick={() => setPreviewMedia(null)} className="p-2 text-white/70 hover:text-white bg-white/10 rounded-full hover:bg-white/20 transition"><Icons.X size={24}/></button>
                    </div>
                    <div className="flex-1 flex items-center justify-center p-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                        {previewMedia.type === 'image' && <img src={previewMedia.content} className="max-w-full max-h-full object-contain rounded shadow-2xl" alt="Preview"/>}
                        {previewMedia.type === 'video' && <video src={previewMedia.content} controls autoPlay className="max-w-full max-h-full rounded shadow-2xl" />}
                    </div>
                    <div className="p-6 flex justify-center pb-8" onClick={e => e.stopPropagation()}>
                        <a href={previewMedia.content} download={`zen-ai-${Date.now()}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"><Icons.Download size={20} /> Download</a>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className={`flex-1 flex flex-col h-full relative min-w-0 transition-all duration-300`}>
                <main ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-3 md:p-8 pt-24 pb-36 md:pb-44 scroll-smooth z-0">
                    {!messages.length && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 select-none pointer-events-none pb-24">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 text-zinc-400 dark:text-zinc-600 animate-fade-in`}>{privateMode ? <Icons.Ghost size={56}/> : <Icons.YinYang size={56}/>}</div>
                            <p className="text-2xl font-semibold tracking-tight animate-slide-up text-zinc-800 dark:text-zinc-200">{privateMode ? 'Your secrets are safe' : 'Zen is ready to chat'}</p>
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
                        
                        {showTypingIndicator && (
                            <div className="flex items-center gap-2 p-2 ml-1 animate-fade-in h-8 self-start">
                                <div className="flex items-center gap-1.5 bg-zinc-200 dark:bg-zinc-800 px-4 py-2.5 rounded-2xl rounded-tl-none">
                                    <div className="w-1.5 h-1.5 bg-zinc-500 dark:bg-zinc-400 rounded-full animate-bounce delay-0" />
                                    <div className="w-1.5 h-1.5 bg-zinc-500 dark:bg-zinc-400 rounded-full animate-bounce delay-150" />
                                    <div className="w-1.5 h-1.5 bg-zinc-500 dark:bg-zinc-400 rounded-full animate-bounce delay-300" />
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} className="h-1"></div>
                    </div>
                </main>

                {showScrollDown && (
                    <button onClick={() => { isAutoScrolling.current = true; scrollToBottom(); }} className="absolute bottom-36 md:bottom-40 left-1/2 -translate-x-1/2 z-50 w-10 h-10 flex items-center justify-center bg-zinc-800/90 dark:bg-zinc-200/90 backdrop-blur-md text-white dark:text-black rounded-full shadow-lg hover:scale-110 transition-transform">
                        <Icons.ChevronDown size={20}/>
                    </button>
                )}

                <InputArea 
                    input={input} setInput={setInput} handleSend={handleSend} stopGeneration={stopGeneration} files={files}
                    onRemoveFile={(idx) => setFiles(prev => prev.filter((_, i) => i !== idx))}
                    onFileSelect={(e) => { if(e.target.files) { const nf=Array.from(e.target.files); setFiles(p=>[...p, ...nf.map(f=>({name:f.name, type:f.type, content:URL.createObjectURL(f)}))]); e.target.value=''; } }}
                    isListening={isListening} toggleMic={toggleMic}
                    mode={mode} setMode={setMode} renderModes={renderModes} isLoading={isLoading}
                    privateMode={privateMode} isSpeechSupported={isSpeechSupported}
                />
            </div>

            {showOnboarding && !user && <OnboardingModal onLogin={handleLogin} />}

            {settingsOpen && (
                <SettingsModal 
                    onClose={() => setSettingsOpen(false)} 
                    themeMode={themeMode} changeThemeMode={(m) => { setThemeMode(m); localStorage.setItem('zen_theme_mode', m); }}
                    enabledModes={enabledModes} toggleModeEnabled={(id) => { const n={...enabledModes, [id]:!enabledModes[id]}; setEnabledModes(n); localStorage.setItem('zen_enabled_modes', JSON.stringify(n)); }}
                    allModes={ALL_MODES} model={model} setModel={(m) => { setModel(m); localStorage.setItem('zen_model', m); }} availableModels={availableModels}
                    systemPrompt={systemPrompt} setSystemPrompt={(s) => { setSystemPrompt(s); localStorage.setItem('zen_system_prompt', s); }}
                    onClearHistory={() => { if(confirm("Clear local history?")) { localStorage.removeItem('zen_history'); setHistory([]); setMessages([]); setSessionId(null); setSettingsOpen(false); } }}
                />
            )}

            {infoOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setInfoOpen(false)}>
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 relative animate-slide-up text-center" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setInfoOpen(false)} className="absolute top-5 right-5 opacity-50 hover:opacity-100"><Icons.X size={20}/></button>
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4"><Icons.YinYang size={32} className="opacity-80"/></div>
                        <h2 className="text-xl font-bold mb-1">Zen AI</h2>
                        <p className="text-sm opacity-60 mb-6">Designed by Midhun</p>
                        
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {['GitHub', 'LinkedIn', 'Bluesky', 'Email'].map(l => (
                                    <a key={l} 
                                    href={l === 'GitHub' ? 'https://github.com/MidhunEU' : l === 'LinkedIn' ? 'https://linkedin.com/in/MidhunEU' : l === 'Bluesky' ? 'https://bsky.app/profile/midhuneu.bsky.social' : 'mailto:biz.midhun@proton.me'}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-center gap-2 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition font-medium text-xs"
                                    >
                                    {l === 'GitHub' && <Icons.Github size={16} />}
                                    {l === 'LinkedIn' && <Icons.Linkedin size={16} />}
                                    {l === 'Bluesky' && <Icons.Bluesky size={16} />}
                                    {l === 'Email' && <Icons.EmailEnvelope size={16} />}
                                    {l}
                                    </a>
                        ))}
                        </div>
                        <div className="mt-4 text-[10px] opacity-40 uppercase tracking-widest">Last updated on Jan 15, 2026</div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
