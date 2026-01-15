export type Role = 'user' | 'assistant' | 'system';
export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'user-media' | 'error';
export type AppMode = 'chat' | 'txt2img' | 'txt2vid' | 'txt2speech' | 'img2txt' | 'speech2txt';
export type ThemeMode = 'system' | 'light' | 'dark';

export interface AttachedFile {
    name: string;
    type: string;
    content: string; // Base64 or URL
}

export interface Message {
    id?: string;
    role: Role;
    content: string;
    type: MessageType;
    files?: AttachedFile[];
    isOCR?: boolean;
    isTranscribe?: boolean;
}

export interface ChatSession {
    id: string;
    title: string;
    date: string;
    messages: Message[];
}

export interface User {
    username: string;
    [key: string]: any;
}

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

// Global declaration for Puter.js
declare global {
    interface Window {
        puter: {
            auth: {
                isSignedIn: () => boolean;
                getUser: () => Promise<User>;
                signIn: (options?: any) => Promise<any>;
                signOut: () => Promise<void>;
            };
            ai: {
                chat: (messages: any[], options?: any) => Promise<any>;
                txt2img: (prompt: string) => Promise<any>;
                txt2vid: (prompt: string) => Promise<any>;
                txt2speech: (prompt: string) => Promise<any>;
                img2txt: (file: File) => Promise<string>;
                speech2txt: (file: File) => Promise<string>;
                listModels: () => Promise<{id: string}[]>;
            };
        };
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}