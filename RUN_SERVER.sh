#!/bin/bash
# Holiday Basics Order App - Simple Server Startup Script

cd "$(dirname "$0")"

echo "================================"
echo "Holiday Basics Order App Server"
echo "================================"
echo ""
echo "Starting Python HTTP server..."
echo ""

python3 -m http.server 8000 --directory .

# After server starts, this will be printed
echo ""
echo "Server running!"
echo "Open your browser to: http://localhost:8000/src/order_app.html"
echo ""
echo "To access from another device on your network:"
echo "http://10.8.0.176:8000/src/order_app.html"
echo ""
echo "Press Ctrl+C to stop the server"
