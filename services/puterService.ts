import { AttachedFile, Message } from '../types';

// Utility: Convert URL/Blob to Base64
export const urlToBase64 = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });
    } catch(e) { 
        return url; 
    }
};

export const puterService = {
    isAuthenticated: () => window.puter.auth.isSignedIn(),
    
    getUser: async () => window.puter.auth.getUser(),
    
    signIn: async () => {
        try {
            await window.puter.auth.signIn({ attempt_temp_user_creation: true });
            return window.puter.auth.getUser();
        } catch(e) {
            throw e;
        }
    },
    
    signOut: async () => window.puter.auth.signOut(),

    listModels: async () => {
        try {
            return await window.puter.ai.listModels();
        } catch (e) {
            return [];
        }
    },

    streamChat: async (
        messages: Message[], 
        model: string, 
        systemPrompt: string,
        onChunk: (text: string) => void,
        signal?: AbortSignal
    ) => {
        // Prepare history for Puter API (handles multimodal content)
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
            throw new Error("Failed to connect to AI service.");
        }
        
        let fullText = "";
        try {
            for await (const part of stream) {
                if (signal?.aborted) {
                    const err = new Error("Aborted");
                    err.name = "AbortError";
                    throw err;
                }
                
                const text = part?.message?.content || part?.text || '';
                fullText += text;
                onChunk(fullText);
            }
        } catch (e: any) {
            if (e.name === "AbortError" || signal?.aborted) throw e;
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
        // Handle Puter v2 response variations (Audio object vs URL)
        let src = typeof aud === 'object' ? aud.src : aud;
        
        // Convert data URI to Blob URL for better playback performance
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
            
            let mimeType = file.type;
            const ext = file.name.split('.').pop()?.toLowerCase();

            // Robust MIME type fallback
            const typeMap: Record<string, string> = {
                'aac': 'audio/aac', 'mp3': 'audio/mpeg', 'wav': 'audio/wav',
                'm4a': 'audio/mp4', 'ogg': 'audio/ogg', 'webm': 'audio/webm',
                'flac': 'audio/flac'
            };

            if (!mimeType || mimeType === 'application/octet-stream' || mimeType === '') {
                mimeType = (ext && typeMap[ext]) ? typeMap[ext] : 'audio/mpeg';
            }

            const fileObj = new File([blob], file.name, { type: mimeType });
            const result = await window.puter.ai.speech2txt(fileObj);
            
            if (!result) throw new Error("No transcription received from service");
            
            return result;
        } catch (e: any) {
            // Handle non-standard error objects from backend
            const errorMessage = e instanceof Error ? e.message : (typeof e === 'string' ? e : JSON.stringify(e));
            throw new Error("Transcription Failed: " + errorMessage);
        }
    }
};