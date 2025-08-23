#!/bin/bash

# Load nvm and use Node.js v22
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 22.17.1

echo "Starting Auto-HR Services..."

# Clean up any existing processes
echo "Cleaning up any existing processes..."
pkill -f "nest start" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f "uvicorn" 2>/dev/null || true

# Wait a moment for processes to fully stop
sleep 2

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -i:$port >/dev/null 2>&1; then
        echo "Error: Port $port is already in use. Please free up the port and try again."
        exit 1
    fi
}

# Check if required ports are available
echo "Checking port availability..."
check_port 3000  # Frontend
check_port 3001  # API Gateway
check_port 8000  # LLM Service

# Start Frontend
echo "Starting Frontend (Next.js)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait a bit for frontend to start
sleep 5

# Start API Gateway
echo "Starting API Gateway (Nest.js)..."
cd ../api-gateway
npm run start:dev &
API_PID=$!
echo "API Gateway PID: $API_PID"

# Wait a bit for API to start
sleep 5

# Start LLM Service
echo "Starting LLM Service (FastAPI)..."
cd ../llm-service

# Check if Python3 is available and working
if ! command -v python3 &> /dev/null; then
    echo "Error: python3 command not found. Please install Python 3."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "Error: Failed to create virtual environment"
        exit 1
    fi
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "Installing Python requirements..."
python3 -m pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "Error: Failed to install requirements"
    exit 1
fi

# Start the LLM service
echo "Starting LLM service..."
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
FASTAPI_PID=$!
echo "FastAPI PID: $FASTAPI_PID"

# Start MongoDB (if not running)
echo "Starting MongoDB..."
docker run -d -p 27017:27017 --name mongodb mongo:6.0 2>/dev/null || echo "MongoDB already running"

echo ""
echo "Services started!"
echo "Frontend: http://localhost:3000"
echo "API Gateway: http://localhost:3001"
echo "FastAPI LLM: http://localhost:8000"
echo "MongoDB: localhost:27017"
echo ""
echo "To stop all services, run: pkill -f 'next\|nest\|uvicorn'"

# Wait for user input to stop
read -p "Press Enter to stop all services..."

# Cleanup function
cleanup() {
    echo "Stopping all services..."
    kill $FRONTEND_PID $API_PID $FASTAPI_PID 2>/dev/null
    pkill -f "nest start" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "uvicorn" 2>/dev/null || true
    echo "Services stopped."
}

# Set trap to cleanup on script exit
trap cleanup EXIT

cleanup