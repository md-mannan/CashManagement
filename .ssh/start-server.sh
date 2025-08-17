#!/bin/bash

# CashManagement Server Start Script
# Optimized for 1GB RAM systems

echo "🚀 Starting CashManagement on port 80..."

# Check if running as root for port 80
if [ "$EUID" -ne 0 ]; then
    echo "❌ Need root access for port 80"
    echo "Run: sudo bash .ssh/start-server.sh"
    exit 1
fi

# Get actual user
ACTUAL_USER=${SUDO_USER:-$USER}
PROJECT_DIR="/var/www/cashmanagement"

# Change to project directory
cd $PROJECT_DIR

# Check if we're in the right directory
if [ ! -f "artisan" ]; then
    echo "❌ Not in Laravel project directory"
    echo "Make sure you're in: $PROJECT_DIR"
    exit 1
fi

# Stop any existing PHP servers
echo "🛑 Stopping existing servers..."
pkill -f "php artisan serve"
pkill -f "php artisan queue"

# Set memory limit for 1GB system
export PHP_MEMORY_LIMIT=256M

echo "⚙️ Starting Laravel application..."

# Try to start on port 80, fallback to 8080 if permission denied
echo "🔍 Attempting to start on port 80..."
if sudo -u $ACTUAL_USER php -d memory_limit=256M artisan serve --host=0.0.0.0 --port=80 --timeout=5 2>/dev/null &
then
    SERVER_PID=$!
    sleep 2
    if kill -0 $SERVER_PID 2>/dev/null; then
        echo "✅ Server started successfully on port 80"
        PORT=80
    else
        echo "⚠️ Port 80 failed, trying port 8080..."
        nohup sudo -u $ACTUAL_USER php -d memory_limit=256M artisan serve --host=0.0.0.0 --port=8080 > /var/log/cashmanagement.log 2>&1 &
        SERVER_PID=$!
        PORT=8080
    fi
else
    echo "⚠️ Port 80 permission denied, using port 8080..."
    nohup sudo -u $ACTUAL_USER php -d memory_limit=256M artisan serve --host=0.0.0.0 --port=8080 > /var/log/cashmanagement.log 2>&1 &
    SERVER_PID=$!
    PORT=8080
fi

# Start queue worker (optional, for background jobs)
echo "🔄 Starting queue worker..."
nohup sudo -u $ACTUAL_USER php -d memory_limit=128M artisan queue:work --tries=3 --timeout=60 > /var/log/cashmanagement-queue.log 2>&1 &
QUEUE_PID=$!

# Save PIDs for later stopping
echo $SERVER_PID > /var/run/cashmanagement-server.pid
echo $QUEUE_PID > /var/run/cashmanagement-queue.pid

echo "✅ CashManagement started successfully!"
echo "🌐 Server running on: http://141.144.235.74:$PORT"
echo "📊 Server PID: $SERVER_PID"
echo "🔄 Queue PID: $QUEUE_PID"
echo "📝 Logs: /var/log/cashmanagement.log"
echo ""
if [ "$PORT" = "8080" ]; then
    echo "⚠️ Note: Running on port 8080 due to port 80 permissions"
    echo "   Access via: http://141.144.235.74:8080"
    echo "   To use port 80, see README.md for setup instructions"
fi
echo ""
echo "To stop the server, run: sudo bash .ssh/stop-server.sh"
echo "To check status: sudo bash .ssh/status.sh"

# Show initial log output
echo "📋 Initial server output:"
sleep 2
tail -n 10 /var/log/cashmanagement.log
