#!/usr/bin/env python3
"""
Moxie AI — DeepSeek API Server
A lightweight API server that bridges Ollama with OpenAI-compatible endpoints.
Supports both Ollama models and can be extended for DeepSeek cloud API.
"""

import os
import sys
import json
import logging
from typing import Optional
from flask import Flask, request, jsonify, Response
from flask_cors import CORS

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
PORT = int(os.environ.get("PORT", 8080))
API_KEY = os.environ.get("API_KEY", "moxie-dev-key")

MODEL_MAPPING = {
    "moxie-qwen-vl": "qwen2.5-vl:7b",
    "moxie-deepseek-v3": "deepseek-v3.2:16b",
}

def require_auth():
    key = request.headers.get("x-api-key")
    if key != API_KEY:
        return False
    return True

def map_model(model_id: str) -> str:
    return MODEL_MAPPING.get(model_id, model_id)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "moxie-ai", "version": "1.0.0"})

@app.route("/v1/models", methods=["GET"])
def list_models():
    return jsonify({
        "object": "list",
        "data": [
            {"id": "moxie-qwen-vl", "object": "model", "created": 1700000000, "owned_by": "moxie"},
            {"id": "moxie-deepseek-v3", "object": "model", "created": 1700000000, "owned_by": "moxie"},
        ]
    })

@app.route("/v1/chat/completions", methods=["POST"])
def chat_completions():
    if not require_auth():
        return jsonify({"error": {"message": "Invalid API key", "type": "authentication_error"}}), 401

    data = request.json
    model = map_model(data.get("model", "moxie-deepseek-v3"))
    messages = data.get("messages", [])
    stream = data.get("stream", False)

    ollama_messages = []
    for msg in messages:
        role = msg.get("role", "user")
        if role == "system":
            role = "system"
        elif role == "assistant":
            role = "assistant"
        else:
            role = "user"
        ollama_messages.append({
            "role": role,
            "content": msg.get("content", "")
        })

    if stream:
        def generate():
            try:
                payload = {
                    "model": model,
                    "messages": ollama_messages,
                    "stream": True
                }
                image = data.get("image")
                if image:
                    payload["images"] = [image]

                resp = requests.post(
                    f"{OLLAMA_BASE_URL}/api/chat",
                    json=payload,
                    stream=True,
                    timeout=300
                )
                for line in resp.iter_lines():
                    if line:
                        try:
                            chunk = json.loads(line)
                            if "message" in chunk:
                                delta = chunk["message"].get("content", "")
                                yield f'data: {json.dumps({"choices":[{"delta":{"content":delta}}]})}\n\n'
                            if chunk.get("done", False):
                                yield f'data: [DONE]\n\n'
                                break
                        except json.JSONDecodeError:
                            continue
            except Exception as e:
                yield f'data: {json.dumps({"error":{"message":str(e)}})}\n\n'

        return Response(generate(), mimetype='text/event-stream')

    try:
        import requests
        payload = {
            "model": model,
            "messages": ollama_messages,
            "stream": False
        }
        image = data.get("image")
        if image:
            payload["images"] = [image]

        resp = requests.post(
            f"{OLLAMA_BASE_URL}/api/chat",
            json=payload,
            timeout=300
        )
        result = resp.json()

        return jsonify({
            "id": f"chatcmpl-{os.urandom(12).hex()}",
            "object": "chat.completion",
            "created": 1700000000,
            "model": data.get("model", "moxie-deepseek-v3"),
            "choices": [{
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": result.get("message", {}).get("content", "")
                },
                "finish_reason": "stop"
            }],
            "usage": {
                "prompt_tokens": 0,
                "completion_tokens": 0,
                "total_tokens": 0
            }
        })
    except Exception as e:
        logger.error(f"Error: {e}")
        return jsonify({"error": {"message": str(e), "type": "internal_error"}}), 500

@app.route("/v1/completions", methods=["POST"])
def completions():
    if not require_auth():
        return jsonify({"error": {"message": "Invalid API key", "type": "authentication_error"}}), 401

    data = request.json
    model = map_model(data.get("model", "moxie-deepseek-v3"))
    prompt = data.get("prompt", "")
    stream = data.get("stream", False)

    if stream:
        def generate():
            try:
                payload = {"model": model, "prompt": prompt, "stream": True}
                resp = requests.post(
                    f"{OLLAMA_BASE_URL}/api/generate",
                    json=payload,
                    stream=True,
                    timeout=300
                )
                for line in resp.iter_lines():
                    if line:
                        try:
                            chunk = json.loads(line)
                            if "response" in chunk:
                                yield f'data: {json.dumps({"choices":[{"delta":{"content":chunk["response"]}}]})}\n\n'
                            if chunk.get("done", False):
                                yield f'data: [DONE]\n\n'
                                break
                        except json.JSONDecodeError:
                            continue
            except Exception as e:
                yield f'data: {json.dumps({"error":{"message":str(e)}})}\n\n'
        return Response(generate(), mimetype='text/event-stream')

    try:
        import requests
        resp = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={"model": model, "prompt": prompt, "stream": False},
            timeout=300
        )
        result = resp.json()
        return jsonify({
            "id": f"cmpl-{os.urandom(12).hex()}",
            "object": "text_completion",
            "created": 1700000000,
            "model": data.get("model", "moxie-deepseek-v3"),
            "choices": [{
                "text": result.get("response", ""),
                "index": 0,
                "finish_reason": "stop"
            }]
        })
    except Exception as e:
        logger.error(f"Error: {e}")
        return jsonify({"error": {"message": str(e), "type": "internal_error"}}), 500

if __name__ == "__main__":
    logger.info(f"Starting Moxie AI API Server on port {PORT}")
    logger.info(f"Ollama base URL: {OLLAMA_BASE_URL}")
    app.run(host="0.0.0.0", port=PORT, debug=False)
