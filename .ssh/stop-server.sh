#!/bin/bash

# CashManagement Server Stop Script

echo "🛑 Stopping CashManagement server..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Need root access to stop server"
    echo "Run: sudo bash .ssh/stop-server.sh"
    exit 1
fi

# Stop server using PID files
if [ -f "/var/run/cashmanagement-server.pid" ]; then
    SERVER_PID=$(cat /var/run/cashmanagement-server.pid)
    if kill -0 $SERVER_PID 2>/dev/null; then
        echo "🔄 Stopping server (PID: $SERVER_PID)..."
        kill $SERVER_PID
        rm /var/run/cashmanagement-server.pid
        echo "✅ Server stopped"
    else
        echo "⚠️ Server process not found"
        rm /var/run/cashmanagement-server.pid
    fi
else
    echo "⚠️ Server PID file not found"
fi

# Stop queue worker
if [ -f "/var/run/cashmanagement-queue.pid" ]; then
    QUEUE_PID=$(cat /var/run/cashmanagement-queue.pid)
    if kill -0 $QUEUE_PID 2>/dev/null; then
        echo "🔄 Stopping queue worker (PID: $QUEUE_PID)..."
        kill $QUEUE_PID
        rm /var/run/cashmanagement-queue.pid
        echo "✅ Queue worker stopped"
    else
        echo "⚠️ Queue worker process not found"
        rm /var/run/cashmanagement-queue.pid
    fi
else
    echo "⚠️ Queue worker PID file not found"
fi

# Kill any remaining PHP artisan processes
echo "🧹 Cleaning up any remaining processes..."
pkill -f "php artisan serve"
pkill -f "php artisan queue"

echo "✅ All CashManagement processes stopped"
