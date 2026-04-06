# Moxie AI

A private, self-hosted AI Command Center powered by **Ollama** (local LLMs) with a **Next.js** frontend and **Firebase** for chat persistence.

## Models
- **DeepSeek-V3.2 (16B)** — Logic, coding, and general tasks
- **Qwen2.5-VL (7B)** — Vision/multimodal (image analysis)

## Architecture
```
Browser → Next.js Frontend (port 3000)
              ↓
         API Routes (streaming)
              ↓
         Ollama (port 11434)
         ├── deepseek-v3.2:16b
         └── qwen2.5-vl:7b
              ↓
         Firebase Realtime DB (chat storage)
```

## First-Time Setup (on your server)

```bash
# 1. Clone the repo
git clone <your-repo-url> && cd moxie-ai

# 2. Install Ollama and pull models (~25 GB download)
cd ai && bash setup.sh && cd ..

# 3. Install frontend deps
cd frontend && npm install && cd ..

# 4. Launch everything
bash start.sh
```

Open `http://localhost:3000` and start chatting.

## Launch (after setup)

```bash
# From the project root:
bash start.sh

# This starts:
# - Ollama AI engine on :11434
# - Next.js frontend on :3000
```

## Project Structure
```
moxie-ai/
├── ai/                      # AI engine scripts
│   ├── setup.sh             # Install Ollama + pull models
│   └── start.sh             # Start Ollama server
├── frontend/                # Next.js app
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── chat/route.ts    # Streaming Ollama proxy
│   │   │   │   └── models/route.ts  # List available models
│   │   │   ├── page.tsx             # Main Workbench UI
│   │   │   └── layout.tsx           # Root layout
│   │   ├── components/chat/         # Chat UI components
│   │   ├── hooks/                   # React hooks (useChat, etc.)
│   │   └── lib/                     # Firebase config & DB helpers
│   └── .env                         # Environment variables
├── start.sh                 # Launch everything together
└── README.md
```

## Environment Variables

Copy `.env` in the `frontend/` directory. Key vars:
- `OLLAMA_BASE_URL` — Ollama API endpoint (default: `http://localhost:11434`)
- `NEXT_PUBLIC_FIREBASE_*` — Firebase project config
