#!/bin/sh
set -e

echo "Running Next.js on port ${PORT:-8000}..."
npm start -- -p ${PORT:-8000} &

NEXTJS_PID=$!
echo "PID Next.js: $NEXTJS_PID"

echo "Starting TNC connector..."
npm run script:connector &

CONNECTOR_PID=$!
echo "PID connector: $CONNECTOR_PID"

cleanup() {
    echo "Cleaning..."
    
    kill -TERM -$NEXTJS_PID -$CONNECTOR_PID 2>/dev/null
    
    wait $NEXTJS_PID $CONNECTOR_PID 2>/dev/null
    exit 0 
}

trap cleanup SIGINT SIGTERM

echo "Waiting for Next.js (PID: $NEXTJS_PID)..."
wait $NEXTJS_PID
EXIT_CODE=$? 
echo "Next.js stopped with code: $EXIT_CODE"

if kill -0 $CONNECTOR_PID 2>/dev/null; then
    echo "Stopping TNC connector..."
    kill -TERM -$CONNECTOR_PID 2>/dev/null
    wait $CONNECTOR_PID 2>/dev/null
fi

echo "Script stopped."

exit $EXIT_CODE