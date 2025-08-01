#!/bin/bash

# Load nvm and use Node.js v22
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 22.17.1

echo "Starting Auto-HR Services..."

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

# Start FastAPI LLM Service
echo "Starting FastAPI LLM Service..."
cd ../fastapi-llm
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
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
kill $FRONTEND_PID $API_PID $FASTAPI_PID 2>/dev/null
echo "Services stopped."