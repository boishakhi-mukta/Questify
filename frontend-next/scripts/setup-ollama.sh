#!/bin/bash
set -e

echo "Setting up Ollama for development..."

if ! command -v ollama &> /dev/null; then
  echo "Ollama not found. Please install from https://ollama.ai"
  exit 1
fi

if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
  echo "Ollama is not running. Start it with: ollama serve"
  exit 1
fi

echo "Checking models..."
curl -s http://localhost:11434/api/tags | jq '.models[].name' 2>/dev/null || true

if ! curl -s http://localhost:11434/api/tags | grep -q "mistral"; then
  echo "Pulling Mistral model... (this takes ~5 minutes)"
  ollama pull mistral
fi

echo "Ollama ready!"
echo "API URL: http://localhost:11434"
echo "Model: mistral"
