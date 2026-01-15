# Zen AI

A minimalist, multimodal AI assistant powered by [Puter.js](https://docs.puter.com/).

## Features

- **Chat**: Text-based conversation with AI.
- **Image Generation**: Create images from text prompts.
- **Video Generation**: Create short videos from text prompts.
- **Speech Synthesis**: Convert text to speech.
- **OCR**: Extract text from images.
- **Transcription**: Convert audio to text.
- **Privacy Mode**: Incognito mode that doesn't save history to local storage.
- **PWA Support**: Installable as a progressive web app.

## Tech Stack

- **Framework**: React + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Backend**: Puter.js (v2)
- **Markdown**: react-markdown (GFM, KaTeX, Highlight.js)

## Getting Started

1.  **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/zen-ai.git
    cd zen-ai
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Run development server**

    ```bash
    npm run dev
    ```

4.  **Build for production**

    ```bash
    npm run build
    ```

## Deployment

This project is optimized for **Cloudflare Pages**.

1.  Push to your Git repository.
2.  Connect Cloudflare Pages to the repo.
3.  Set **Build Command** to `npm run build`.
4.  Set **Output Directory** to `dist`.
5.  Set **Framework preset** to `Vite`.

## License

MIT
