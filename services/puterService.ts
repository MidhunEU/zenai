import { AttachedFile, Message } from '../types';

export const puterService = {
    isAuthenticated: () => window.puter.auth.isSignedIn(),
    
    getUser: async () => window.puter.auth.getUser(),
    
    signIn: async () => {
        try {
            await window.puter.auth.signIn({ attempt_temp_user_creation: true });
            return window.puter.auth.getUser();
        } catch(e) {
            console.error("Sign in failed", e);
            throw e;
        }
    },
    
    signOut: async () => window.puter.auth.signOut(),

    listModels: async () => {
        try {
            return await window.puter.ai.listModels();
        } catch (e) {
            console.error("Failed to list models", e);
            return [];
        }
    },

    streamChat: async (
        messages: Message[], 
        model: string, 
        systemPrompt: string,
        onChunk: (text: string) => void
    ) => {
        const historyPayload = messages.map(m => {
            if (m.type === 'user-media') {
                const contentArr: any[] = [{ type: 'text', text: m.content || " " }];
                m.files?.forEach(f => {
                    if (f.type.startsWith('image')) {
                        contentArr.push({ type: 'image_url', image_url: { url: f.content } });
                    }
                });
                return { role: m.role, content: contentArr };
            }
            return { role: m.role, content: m.content };
        });

        if (systemPrompt.trim()) {
            historyPayload.unshift({ role: 'system' as any, content: systemPrompt });
        }

        let stream;
        try {
            stream = await window.puter.ai.chat(historyPayload, { model, stream: true });
        } catch (e) {
            throw new Error("Failed to connect to AI service. Please try again.");
        }
        
        let fullText = "";
        try {
            for await (const part of stream) {
                const text = part?.message?.content || part?.text || '';
                fullText += text;
                onChunk(fullText);
            }
        } catch (e) {
            console.warn("Stream interrupted", e);
        }
        return fullText;
    },

    generateImage: async (prompt: string) => {
        const img = await window.puter.ai.txt2img(prompt);
        return typeof img === 'object' ? img.src : img;
    },

    generateVideo: async (prompt: string) => {
        const vid = await window.puter.ai.txt2vid(prompt);
        return typeof vid === 'object' ? vid.src : vid;
    },

    generateSpeech: async (prompt: string) => {
        const aud = await window.puter.ai.txt2speech(prompt);
        // Puter v2 often returns an Audio object where .src is a base64 string
        // We convert this to a Blob URL for better performance and compatibility
        let src = typeof aud === 'object' ? aud.src : aud;
        if (src.startsWith('data:audio')) {
            const res = await fetch(src);
            const blob = await res.blob();
            return URL.createObjectURL(blob);
        }
        return src;
    },

    performOCR: async (file: AttachedFile) => {
        try {
            const blob = await (await fetch(file.content)).blob();
            const fileObj = new File([blob], file.name, { type: file.type });
            return await window.puter.ai.img2txt(fileObj);
        } catch (e) {
            throw new Error("OCR Failed: " + (e as Error).message);
        }
    },

    transcribeAudio: async (file: AttachedFile) => {
        try {
            const blob = await (await fetch(file.content)).blob();
            const fileObj = new File([blob], file.name, { type: file.type });
            return await window.puter.ai.speech2txt(fileObj);
        } catch (e) {
            throw new Error("Transcription Failed: " + (e as Error).message);
        }
    }
};