#!/bin/bash
# ============================================
# Moxie AI — Launch Everything
# Starts Ollama AI + Next.js Frontend together
# ============================================

set -e

echo "╔═══════════════════════════════════════╗"
echo "║    🚀 Moxie AI — Starting Up...       ║"
echo "╚═══════════════════════════════════════╝"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# --- 1. Start Ollama in background ---
echo "🧠 [1/2] Starting AI engine (Ollama)..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "   ✅ Ollama already running."
else
    OLLAMA_HOST=0.0.0.0:11434 ollama serve > "$SCRIPT_DIR/ai/ollama.log" 2>&1 &
    OLLAMA_PID=$!
    echo "   ⏳ Waiting for Ollama to start..."
    
    # Wait up to 15 seconds for Ollama
    for i in $(seq 1 15); do
        if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
            echo "   ✅ Ollama started (PID: $OLLAMA_PID)"
            break
        fi
        sleep 1
    done
    
    if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "   ❌ Ollama failed to start. Check ai/ollama.log"
        exit 1
    fi
fi

echo ""

# --- 2. Install frontend deps if needed ---
if [ ! -d "$SCRIPT_DIR/frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd "$SCRIPT_DIR/frontend" && npm install
    cd "$SCRIPT_DIR"
fi

# --- 3. Start Next.js frontend ---
echo "🌐 [2/2] Starting Frontend (Next.js)..."
cd "$SCRIPT_DIR/frontend"
npm run dev &
NEXT_PID=$!

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║    ✅ Moxie AI is running!            ║"
echo "║                                       ║"
echo "║    Frontend:  http://localhost:3000    ║"
echo "║    Ollama:    http://localhost:11434   ║"
echo "╚═══════════════════════════════════════╝"
echo ""
echo "Press Ctrl+C to stop everything."

# --- Cleanup on exit ---
cleanup() {
    echo ""
    echo "🛑 Shutting down Moxie AI..."
    kill $NEXT_PID 2>/dev/null
    if [ -n "$OLLAMA_PID" ]; then
        kill $OLLAMA_PID 2>/dev/null
    fi
    echo "   Goodbye! 👋"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for processes
wait
