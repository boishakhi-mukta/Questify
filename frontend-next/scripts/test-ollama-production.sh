#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

OLLAMA_URL="${1:-http://localhost:11434}"

echo "Testing Ollama at: $OLLAMA_URL"
echo "=================================="

echo -e "\n${YELLOW}Test 1: Health Check${NC}"
if curl -s "$OLLAMA_URL/api/tags" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Ollama is responding${NC}"
else
  echo -e "${RED}✗ Ollama not responding${NC}"
  exit 1
fi

echo -e "\n${YELLOW}Test 2: Available Models${NC}"
MODELS=$(curl -s "$OLLAMA_URL/api/tags" | jq -r '.models[].name' 2>/dev/null)
if [ -z "$MODELS" ]; then
  echo -e "${RED}✗ No models found${NC}"
  exit 1
else
  echo -e "${GREEN}✓ Models available:${NC}"
  echo "$MODELS"
fi

echo -e "\n${YELLOW}Test 3: Generate Response${NC}"
RESPONSE=$(curl -s "$OLLAMA_URL/api/generate" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"model":"mistral","prompt":"Hello, respond in one sentence.","stream":false}' \
  | jq -r '.response' 2>/dev/null)

if [ -z "$RESPONSE" ] || [ "$RESPONSE" = "null" ]; then
  echo -e "${RED}✗ No response from model${NC}"
  exit 1
else
  echo -e "${GREEN}✓ Model responded:${NC}"
  echo "$RESPONSE" | head -c 120
  echo ""
fi

echo -e "\n${YELLOW}Test 4: Response Time${NC}"
START=$(date +%s%N)
curl -s "$OLLAMA_URL/api/generate" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"model":"mistral","prompt":"Test","stream":false}' > /dev/null
END=$(date +%s%N)
TIME=$(( (END - START) / 1000000 ))
echo -e "${GREEN}✓ Response time: ${TIME}ms${NC}"

echo -e "\n${GREEN}All tests passed!${NC}"
