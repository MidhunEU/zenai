import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { Message, AttachedFile } from '../types';
import { Icons } from './Icons';

interface MessageItemProps {
    msg: Message;
    onMediaClick: (media: { type: string; content: string }) => void;
    showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const MessageItem: React.FC<MessageItemProps> = React.memo(({ msg, onMediaClick, showToast }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Monitor global speech state to reset icon if speech stops elsewhere
    useEffect(() => {
        const onEnd = () => setIsSpeaking(false);
        const onStart = () => { /* Check if *this* text is what is being spoken is hard without ID, 
                                   so we rely on local logic mostly, but reset if global stops */ };
        
        // Simple polling to sync state if cancelled externally
        const interval = setInterval(() => {
             if (!window.speechSynthesis.speaking && isSpeaking) {
                 setIsSpeaking(false);
             }
        }, 500);

        return () => clearInterval(interval);
    }, [isSpeaking]);

    const copyContent = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast("Copied to clipboard", 'success');
    };

    const toggleSpeech = (text: string) => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            // Cancel any ongoing speech first
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            
            window.speechSynthesis.speak(utterance);
            setIsSpeaking(true);
        }
    };

    // Preprocess content to ensure LaTeX delimiters are standard ($ and $$)
    const processedContent = useMemo(() => {
        if (msg.type !== 'text' || !msg.content) return '';
        let content = msg.content;
        
        // Convert \[ ... \] to $$ ... $$
        content = content.replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$');
        
        // Convert \( ... \) to $ ... $
        content = content.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');
        
        return content;
    }, [msg.content, msg.type]);

    if (msg.type === 'image') return (
        <div className="group relative cursor-zoom-in" onClick={() => onMediaClick({ type: 'image', content: msg.content })}>
            <img src={msg.content} className="rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-700" alt="Generated" />
            <a href={msg.content} download={`zen-${Date.now()}.png`} target="_blank" rel="noopener noreferrer" className="absolute bottom-2 right-2 w-8 h-8 flex items-center justify-center bg-black/60 backdrop-blur-sm text-white rounded-full transition-opacity hover:bg-black/80" onClick={e=>e.stopPropagation()} title="Download Image"><Icons.Download size={14}/></a>
        </div>
    );

    if (msg.type === 'video') return (
        <div className="group relative cursor-zoom-in" onClick={() => onMediaClick({ type: 'video', content: msg.content })}>
            <video src={msg.content} controls className="rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-700 w-full" />
        </div>
    );

    if (msg.type === 'audio') return (
        <div className="group relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-4 shadow-sm" onClick={e => e.stopPropagation()}>
            <audio src={msg.content} controls className="w-full h-8 mb-3" />
            <div className="flex justify-end">
                <a href={msg.content} download={`zen-audio-${Date.now()}.mp3`} className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full" title="Download Audio">
                    <Icons.Download size={14}/> MP3
                </a>
            </div>
        </div>
    );

    if (msg.type === 'user-media') {
        return (
            <div className="flex flex-wrap gap-2">
                {msg.files?.map((f, idx) => (
                    <div key={idx} className="group relative cursor-zoom-in overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm" onClick={() => f.type.startsWith('image') && onMediaClick({ type: 'image', content: f.content })}>
                        {f.type.startsWith('image') ? <img src={f.content} className="h-32 w-auto object-cover" /> : <div className="h-20 w-32 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800"><Icons.File size={24} className="opacity-50"/></div>}
                    </div>
                ))}
            </div>
        );
    }

    if (msg.type === 'error') return (
        <div className="text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/20">
            {msg.content}
        </div>
    );

    if (msg.isOCR || msg.isTranscribe) {
        return (
            <div className="relative group w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-zinc-200 dark:border-zinc-800 opacity-60 text-xs font-medium uppercase tracking-wider">
                    {msg.isOCR ? <><Icons.ScanText size={14}/> Scanned Text</> : <><Icons.Mic size={14}/> Transcript</>}
                </div>
                <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap opacity-90 text-zinc-800 dark:text-zinc-200 selectable">{msg.content}</div>
                <div className="mt-3 flex justify-end gap-3 opacity-80 hover:opacity-100 transition-opacity">
                    <button onClick={() => copyContent(msg.content)} className="flex items-center gap-1.5 text-xs font-medium hover:text-zinc-600 dark:hover:text-zinc-300" title="Copy Text"><Icons.Copy size={12}/> Copy</button>
                </div>
            </div>
        );
    }

    // Standard Text
    return (
        <div className="flex flex-col gap-1.5 max-w-full">
            <div className={`rounded-2xl px-5 py-3 shadow-sm leading-relaxed break-words overflow-hidden ${msg.role === 'user' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-tr-md self-end' : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-tl-md self-start text-zinc-800 dark:text-zinc-200'}`}>
                <div className="markdown-body selectable">
                    <ReactMarkdown
                        remarkPlugins={[remarkMath, remarkGfm]}
                        rehypePlugins={[rehypeRaw, rehypeKatex, rehypeHighlight]}
                        components={{
                            table: ({ node, ...props }) => (
                                <div className="table-wrapper">
                                    <table {...props} />
                                </div>
                            ),
                            pre: ({ node, children, ...props }) => (
                                <div className="code-wrapper my-3 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-[#1e1e1e] shadow-sm">
                                    <div className="flex justify-between items-center px-4 py-2 bg-zinc-100 dark:bg-[#2d2d2d] border-b border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500 font-mono select-none">
                                        <span>Code</span>
                                        <button 
                                            className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors font-sans opacity-70 hover:opacity-100"
                                            onClick={(e) => {
                                                const code = (e.currentTarget.parentElement?.nextElementSibling as HTMLElement)?.innerText;
                                                if(code) copyContent(code);
                                            }}
                                            title="Copy Code"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                    <pre {...props} className="!m-0 !bg-transparent !p-4 overflow-x-auto custom-scrollbar selectable">{children}</pre>
                                </div>
                            ),
                            code: ({ node, className, children, ...props }: any) => {
                                return <code className={className} {...props}>{children}</code>;
                            }
                        }}
                    >
                        {processedContent}
                    </ReactMarkdown>
                </div>
            </div>
            {msg.content && (
                <div className={`flex items-center gap-3 px-1 text-zinc-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 justify-end`}>
                    <button onClick={() => toggleSpeech(msg.content)} title={isSpeaking ? "Stop Speaking" : "Read Aloud"} className={`transition-colors ${isSpeaking ? 'text-red-500' : 'hover:text-zinc-600 dark:hover:text-zinc-300'}`}>
                        {isSpeaking ? <Icons.Square size={12} className="fill-current"/> : <Icons.Volume1 size={14}/>}
                    </button>
                    <button onClick={() => copyContent(msg.content)} title="Copy Message" className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"><Icons.Copy size={14}/></button>
                </div>
            )}
        </div>
    );
});

export default MessageItem;