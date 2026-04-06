#!/bin/bash
# ============================================
# Moxie AI — Start Ollama & API Server
# ============================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"
mkdir -p "$LOG_DIR"

echo "🧠 Starting Moxie AI Engine..."

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama is not installed. Run ./setup.sh first."
    exit 1
fi

# Start Ollama if not running
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama is already running on port 11434"
else
    echo "🚀 Launching Ollama server on port 11434..."
    OLLAMA_HOST=0.0.0.0:11434 nohup ollama serve > "$LOG_DIR/ollama.log" 2>&1 &
    sleep 3
    
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "✅ Ollama server started successfully."
    else
        echo "❌ Failed to start Ollama. Check $LOG_DIR/ollama.log"
    fi
fi

echo ""
echo "🤖 Starting Moxie API Server on port 8080..."

# Start API server if not running
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ API Server is already running on port 8080"
else
    nohup python3 "$SCRIPT_DIR/server.py" > "$LOG_DIR/api.log" 2>&1 &
    sleep 2
    
    if curl -s http://localhost:8080/health > /dev/null 2>&1; then
        echo "✅ API Server started successfully."
    else
        echo "❌ Failed to start API Server. Check $LOG_DIR/api.log"
    fi
fi

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║      Moxie AI — All Services Ready    ║"
echo "╚═══════════════════════════════════════╝"
echo ""
echo "Services:"
echo "  • Ollama API:     http://localhost:11434"
echo "  • Moxie Gateway:  http://localhost:8080"
echo ""
echo "Models available:"
curl -s http://localhost:11434/api/tags | python3 -m json.tool 2>/dev/null || curl -s http://localhost:11434/api/tags
echo ""
echo "Logs: $LOG_DIR/"
