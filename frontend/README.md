# Moxie AI Frontend

Next.js frontend for the Moxie AI chat application.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create `.env.local` in the frontend directory:

```env
OLLAMA_BASE_URL=http://localhost:11434

# Firebase config
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Structure

```
src/
├── app/
│   ├── api/chat/route.ts      # Streaming Ollama proxy
│   ├── api/models/route.ts    # List available models
│   ├── chat/[id]/page.tsx     # Chat interface
│   ├── auth/                  # Login/signup pages
│   └── layout.tsx             # Root layout
├── components/chat/           # Chat UI components
├── hooks/                     # useChat, useChatHistory, useModels
├── stores/                    # authStore (Zustand)
└── lib/                       # Firebase config & DB helpers
```

## Features

- Chat with local Ollama models (DeepSeek, Qwen-VL)
- Multimodal support (images with vision models)
- Chat history with Firebase Realtime DB
- Auth with Firebase Authentication
- Streaming responses
- Model selector
- Responsive sidebar
