#!/bin/bash

# Default values
PATH_TO_BENCH="${1:-/}"
PORT=54321
DURATION="10s"
THREADS=2
CONNECTIONS=100

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if server binary exists
if [ ! -f "./dist/server" ]; then
    echo -e "${RED}Error: Server binary not found at ./dist/server.${NC}"
    echo "Please run 'bun run build' first."
    exit 1
fi

# Check if wrk is installed
if ! command -v wrk &> /dev/null; then
    echo -e "${RED}Error: wrk is not installed.${NC}"
    echo "Please install it (e.g., 'sudo apt install wrk' or 'brew install wrk')."
    exit 1
fi

echo -e "${GREEN}Starting server in production mode on port $PORT...${NC}"
NODE_ENV=production PORT=$PORT ./dist/server > /dev/null 2>&1 &
SERVER_PID=$!

# Graceful shutdown handler
cleanup() {
    echo -e "\n${GREEN}Shutting down server (PID: $SERVER_PID)...${NC}"
    kill $SERVER_PID
    wait $SERVER_PID 2>/dev/null
    exit
}
trap cleanup SIGINT SIGTERM

# Wait for server to be healthy
echo -ne "Waiting for server to become healthy..."
MAX_RETRIES=20
COUNT=0
until curl -s "http://localhost:$PORT/api/health" > /dev/null; do
    sleep 0.5
    echo -ne "."
    COUNT=$((COUNT+1))
    if [ $COUNT -ge $MAX_RETRIES ]; then
        echo -e "\n${RED}Error: Server health check timed out.${NC}"
        kill $SERVER_PID
        exit 1
    fi
done
echo -e " ${GREEN}Ready!${NC}"

# Run benchmark
echo -e "${GREEN}Benchmarking path: http://localhost:$PORT$PATH_TO_BENCH${NC}"
echo "Threads: $THREADS, Connections: $CONNECTIONS, Duration: $DURATION"
echo "----------------------------------------------------------------"

wrk -t$THREADS -c$CONNECTIONS -d$DURATION "http://localhost:$PORT$PATH_TO_BENCH"

# Final cleanup
cleanup
