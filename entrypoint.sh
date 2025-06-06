#!/bin/sh
set -e

echo "Uruchamianie aplikacji Next.js na porcie ${PORT:-8000}..."
npm start -- -p ${PORT:-8000} &

NEXTJS_PID=$!
echo "PID aplikacji Next.js: $NEXTJS_PID"

echo "Uruchamianie skryptu script:connector..."
npm run script:connector &

CONNECTOR_PID=$!
echo "PID skryptu script:connector: $CONNECTOR_PID"

cleanup() {
    echo "Otrzymano sygnał, czyszczenie procesów..."
    
    kill -TERM -$NEXTJS_PID -$CONNECTOR_PID 2>/dev/null
    
    wait $NEXTJS_PID $CONNECTOR_PID 2>/dev/null
    echo "Czyszczenie zakończone."
    exit 0 
}

trap cleanup SIGINT SIGTERM

echo "Oczekiwanie na proces Next.js (PID: $NEXTJS_PID)..."
wait $NEXTJS_PID
EXIT_CODE=$? 
echo "Proces Next.js zakończył działanie z kodem: $EXIT_CODE"

if kill -0 $CONNECTOR_PID 2>/dev/null; then
    echo "Zatrzymywanie skryptu script:connector, ponieważ aplikacja Next.js się zakończyła..."
    kill -TERM -$CONNECTOR_PID 2>/dev/null
    wait $CONNECTOR_PID 2>/dev/null
fi

echo "Skrypt entrypoint zakończony."

exit $EXIT_CODE