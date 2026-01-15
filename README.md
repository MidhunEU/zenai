# Zen AI

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-v18-blue)
![Puter.js](https://img.shields.io/badge/puter.js-v2-orange)

A minimalist, multimodal AI assistant powered by [Puter.js](https://docs.puter.com/).

## Features

- **Chat**: Text-based conversation with AI (GPT-4o mini).
- **Multimodal**:
    - **Text-to-Image**: Generate images from prompts.
    - **Text-to-Video**: Create short videos.
    - **Text-to-Speech**: Synthesize audio.
    - **OCR**: Extract text from uploaded images.
    - **Transcription**: Transcribe uploaded audio files.
- **Privacy Mode**: "Incognito" mode where history is not saved to local storage.
- **Responsive**: Mobile-first design with PWA capabilities.
- **Export**: Download entire chat history as a ZIP file containing Markdown and media.

## Tech Stack

- **Framework**: React + Vite
- **Styling**: Tailwind CSS
- **AI Integration**: Puter.js (v2)
- **Markdown Rendering**: react-markdown (GFM, KaTeX, Highlight.js)

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

## Building for Production

To create a production build (optimized for static hosting):

```bash
npm run build
```

The output will be in the `dist` directory.

## Deployment

This project is optimized for **Cloudflare Pages**, **Vercel**, or **Puter.com** hosting.

## License

MIT
