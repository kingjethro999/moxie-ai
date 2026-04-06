#!/bin/bash
# ============================================
# Moxie AI — Ollama Setup Script
# Run this ONCE on your server to install
# Ollama, pull models, and setup API server.
# ============================================

set -e

echo "╔═══════════════════════════════════════╗"
echo "║      Moxie AI — Server Setup          ║"
echo "╚═══════════════════════════════════════╝"
echo ""

# --- 1. Install Ollama ---
if command -v ollama &> /dev/null; then
    echo "✅ Ollama is already installed: $(ollama --version)"
else
    echo "📦 Installing Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
    echo "✅ Ollama installed."
fi

echo ""

# --- 2. Install Python dependencies for API server ---
if command -v python3 &> /dev/null; then
    echo "📦 Installing Python dependencies..."
    pip3 install flask flask-cors requests --quiet 2>/dev/null || pip install flask flask-cors requests --quiet 2>/dev/null
    echo "✅ Python dependencies installed."
else
    echo "⚠️  Python3 not found. Please install Python 3.8+ for the API server."
fi

echo ""

# --- 3. Start Ollama server in background (if not running) ---
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama server is already running."
else
    echo "🚀 Starting Ollama server..."
    ollama serve &
    sleep 3
    echo "✅ Ollama server started."
fi

echo ""

# --- 4. Pull AI Models ---
echo "📥 Pulling DeepSeek-V3.2 (16B) — Logic & Coding model..."
ollama pull deepseek-v3.2:16b
echo "✅ DeepSeek-V3.2 ready."

echo ""

echo "📥 Pulling Qwen2.5-VL (7B) — Vision & Multimodal model..."
ollama pull qwen2.5-vl:7b
echo "✅ Qwen2.5-VL ready."

echo ""

# --- 5. Verify ---
echo "╔═══════════════════════════════════════╗"
echo "║      Setup Complete!                  ║"
echo "╚═══════════════════════════════════════╝"
echo ""
echo "Installed models:"
ollama list
echo ""
echo "API Server: python3 server.py"
echo "Run './start.sh' to launch Moxie AI with both Ollama and API server."
