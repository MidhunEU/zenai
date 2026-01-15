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
        fill="currentColor"
        className={className} 
        dangerouslySetInnerHTML={{ __html: path }}
    />
);

// Helper for stroked icons (Lucide style)
const StrokedIcon: React.FC<IconProps> = ({ path, size = 20, className = "" }) => (
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
    Menu: (p: any) => <StrokedIcon path='<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>' {...p} />,
    MenuOpen: (p: any) => <StrokedIcon path='<path d="M18 6 6 18"/><path d="m6 6 12 12"/>' {...p} />,
    Settings: (p: any) => <StrokedIcon path='<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>' {...p} />,
    Plus: (p: any) => <StrokedIcon path='<path d="M5 12h14"/><path d="M12 5v14"/>' {...p} />,
    Trash: (p: any) => <StrokedIcon path='<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>' {...p} />,
    Edit: (p: any) => <StrokedIcon path='<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>' {...p} />,
    X: (p: any) => <StrokedIcon path='<path d="M18 6 6 18"/><path d="m6 6 12 12"/>' {...p} />,
    Check: (p: any) => <StrokedIcon path='<path d="M20 6 9 17l-5-5"/>' {...p} />,
    Search: (p: any) => <StrokedIcon path='<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>' {...p} />,
    ChevronDown: (p: any) => <StrokedIcon path='<path d="m6 9 6 6 6-6"/>' {...p} />,
    Download: (p: any) => <StrokedIcon path='<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>' {...p} />,
    Send: (p: any) => <StrokedIcon path='<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>' {...p} />,
    Paperclip: (p: any) => <StrokedIcon path='<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>' {...p} />,
    Mic: (p: any) => <StrokedIcon path='<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>' {...p} />,
    MicOff: (p: any) => <StrokedIcon path='<line x1="1" x2="23" y1="1" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="15" x2="15.01" y1="9.39" y2="9.39"/><path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/>' {...p} />,
    Sun: (p: any) => <StrokedIcon path='<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>' {...p} />,
    Moon: (p: any) => <StrokedIcon path='<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>' {...p} />,
    YinYang: (p: any) => <StrokedIcon path='<circle cx="12" cy="12" r="10"/><path d="M12 2a5 5 0 1 1 0 10 5 5 0 1 0 0 10"/><circle cx="12" cy="7" r="1" fill="currentColor"/><circle cx="12" cy="17" r="1" fill="currentColor"/>' {...p} />,
    Ghost: (p: any) => <StrokedIcon path='<path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/>' {...p} />,
    LogOut: (p: any) => <StrokedIcon path='<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>' {...p} />,
    Info: (p: any) => <StrokedIcon path='<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>' {...p} />,
    Mail: (p: any) => <StrokedIcon path='<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>' {...p} />,
    MessageSquare: (p: any) => <StrokedIcon path='<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' {...p} />,
    Image: (p: any) => <StrokedIcon path='<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>' {...p} />,
    Video: (p: any) => <StrokedIcon path='<path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>' {...p} />,
    Volume2: (p: any) => <StrokedIcon path='<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>' {...p} />,
    ScanText: (p: any) => <StrokedIcon path='<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 8h10"/><path d="M7 12h10"/><path d="M7 16h6"/>' {...p} />,
    Laptop: (p: any) => <StrokedIcon path='<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="2" x2="22" y1="21" y2="21"/><path d="M12 17v4"/>' {...p} />,
    Copy: (p: any) => <StrokedIcon path='<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>' {...p} />,
    Volume1: (p: any) => <StrokedIcon path='<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>' {...p} />,
    File: (p: any) => <StrokedIcon path='<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/>' {...p} />,
    Square: (p: any) => <StrokedIcon path='<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>' {...p} />,
    Sparkles: (p: any) => <StrokedIcon path='<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />' {...p} />, 
    Bot: (p: any) => <StrokedIcon path='<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>' {...p} />,
    Share: (p: any) => <StrokedIcon path='<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/>' {...p} />,
    Alert: (p: any) => <StrokedIcon path='<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>' {...p} />,
    
    // Brand Icons
    Github: (p: any) => <Icon path='<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>' {...p} />,
    Linkedin: (p: any) => <Icon path='<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>' {...p} />,
    Bluesky: (p: any) => <Icon path='<path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.169 1.897.05 2.254.05 2.777c0 2.668 1.308 5.633 4.197 7.575 1.12.75 2.36 1.14 3.73 1.173-1.63.22-3.32.72-4.43 1.56-2.28 1.71-2.94 4.35-2.94 5.37 0 .9.07 2.31.44 2.87.62.95 2.44 1.34 3.82.38 3.02-2.11 4.79-6.39 5.23-7.55.44 1.16 2.21 5.44 5.23 7.55 1.38.96 3.2.57 3.82-.38.37-.56.44-1.97.44-2.87 0-1.02-.66-3.66-2.94-5.37-1.11-.84-2.8-1.34-4.43-1.56 1.37-.033 2.61-.423 3.73-1.173 2.889-1.942 4.197-4.907 4.197-7.575 0-.523-.119-.88-.852-1.212-.659-.299-1.664-.621-4.3 1.24C16.046 4.748 13.087 8.686 12 10.8z"/>' {...p} />,
    EmailEnvelope: (p: any) => <Icon path='<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>' {...p} />,
};