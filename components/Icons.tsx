import React from 'react';

interface IconProps {
    size?: number;
    className?: string;
    path: string;
}

const Icon: React.FC<IconProps> = ({ path, size = 20, className = "" }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className} 
        dangerouslySetInnerHTML={{ __html: path }}
    />
);

export const Icons = {
    Menu: (p: any) => <Icon path='<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>' {...p} />,
    MenuOpen: (p: any) => <Icon path='<path d="M18 6 6 18"/><path d="m6 6 12 12"/>' {...p} />,
    Settings: (p: any) => <Icon path='<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>' {...p} />,
    Plus: (p: any) => <Icon path='<path d="M5 12h14"/><path d="M12 5v14"/>' {...p} />,
    Trash: (p: any) => <Icon path='<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>' {...p} />,
    Edit: (p: any) => <Icon path='<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>' {...p} />,
    X: (p: any) => <Icon path='<path d="M18 6 6 18"/><path d="m6 6 12 12"/>' {...p} />,
    Check: (p: any) => <Icon path='<path d="M20 6 9 17l-5-5"/>' {...p} />,
    Search: (p: any) => <Icon path='<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>' {...p} />,
    ChevronDown: (p: any) => <Icon path='<path d="m6 9 6 6 6-6"/>' {...p} />,
    Download: (p: any) => <Icon path='<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>' {...p} />,
    Send: (p: any) => <Icon path='<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>' {...p} />,
    Paperclip: (p: any) => <Icon path='<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>' {...p} />,
    Mic: (p: any) => <Icon path='<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>' {...p} />,
    MicOff: (p: any) => <Icon path='<line x1="1" x2="23" y1="1" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="15" x2="15.01" y1="9.39" y2="9.39"/><path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/>' {...p} />,
    Sun: (p: any) => <Icon path='<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>' {...p} />,
    Moon: (p: any) => <Icon path='<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>' {...p} />,
    YinYang: (p: any) => <Icon path='<circle cx="12" cy="12" r="10"/><path d="M12 2a5 5 0 1 1 0 10 5 5 0 1 0 0 10"/><circle cx="12" cy="7" r="1" fill="currentColor"/><circle cx="12" cy="17" r="1" fill="currentColor"/>' {...p} />,
    Ghost: (p: any) => <Icon path='<path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/>' {...p} />,
    LogOut: (p: any) => <Icon path='<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>' {...p} />,
    Info: (p: any) => <Icon path='<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>' {...p} />,
    Github: (p: any) => <Icon path='<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>' {...p} />,
    Mail: (p: any) => <Icon path='<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>' {...p} />,
    MessageSquare: (p: any) => <Icon path='<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' {...p} />,
    Image: (p: any) => <Icon path='<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>' {...p} />,
    Video: (p: any) => <Icon path='<path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>' {...p} />,
    Volume2: (p: any) => <Icon path='<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>' {...p} />,
    ScanText: (p: any) => <Icon path='<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 8h10"/><path d="M7 12h10"/><path d="M7 16h6"/>' {...p} />,
    Laptop: (p: any) => <Icon path='<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="2" x2="22" y1="21" y2="21"/><path d="M12 17v4"/>' {...p} />,
    Copy: (p: any) => <Icon path='<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>' {...p} />,
    Volume1: (p: any) => <Icon path='<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>' {...p} />,
    File: (p: any) => <Icon path='<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/>' {...p} />,
    Linkedin: (p: any) => <Icon path='<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>' {...p} />,
    Bluesky: (p: any) => <svg xmlns="http://www.w3.org/2000/svg" width={p.size || 20} height={p.size || 20} viewBox="0 0 24 24" fill="currentColor" className={p.className}><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566 0.944 1.561 1.266 0.902 1.565 0.169 1.897 0.05 2.254 0.05 2.777c0 2.668 1.308 5.633 4.197 7.575 1.12 0.75 2.36 1.14 3.73 1.173-1.63 0.22-3.32 0.72-4.43 1.56-2.28 1.71-2.94 4.35-2.94 5.37 0 0.9 0.07 2.31 0.44 2.87 0.62 0.95 2.44 1.34 3.82 0.38 3.02-2.11 4.79-6.39 5.23-7.55 0.44 1.16 2.21 5.44 5.23 7.55 1.38 0.96 3.2 0.57 3.82-0.38 0.37-0.56 0.44-1.97 0.44-2.87 0-1.02-0.66-3.66-2.94-5.37-1.11-0.84-2.8-1.34-4.43-1.56 1.37-0.033 2.61-0.423 3.73-1.173 2.889-1.942 4.197-4.907 4.197-7.575 0-0.523-0.119-0.88-0.852-1.212-0.659-0.299-1.664-0.621-4.3 1.24C16.046 4.748 13.087 8.686 12 10.8z"/></svg>,
    Square: (p: any) => <Icon path='<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>' {...p} />,
    Sparkles: (p: any) => <Icon path='<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>' {...p} />,
    Share: (p: any) => <Icon path='<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/>' {...p} />,
    Alert: (p: any) => <Icon path='<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>' {...p} />,
};