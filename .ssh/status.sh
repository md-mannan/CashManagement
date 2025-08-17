#!/bin/bash

# CashManagement Server Status Script

echo "📊 CashManagement Server Status"
echo "================================"

# Check server process
if [ -f "/var/run/cashmanagement-server.pid" ]; then
    SERVER_PID=$(cat /var/run/cashmanagement-server.pid)
    if kill -0 $SERVER_PID 2>/dev/null; then
        echo "🟢 Server: RUNNING (PID: $SERVER_PID)"
        
        # Check which port is listening
        if netstat -tuln | grep -q ":80 "; then
            echo "🌐 Port 80: LISTENING"
        elif netstat -tuln | grep -q ":8080 "; then
            echo "🌐 Port 8080: LISTENING"
            echo "ℹ️  Access via: http://141.144.235.74:8080"
        else
            echo "🔴 No web ports listening"
        fi
    else
        echo "🔴 Server: NOT RUNNING"
        rm -f /var/run/cashmanagement-server.pid
    fi
else
    echo "🔴 Server: NOT RUNNING (no PID file)"
fi

# Check queue worker
if [ -f "/var/run/cashmanagement-queue.pid" ]; then
    QUEUE_PID=$(cat /var/run/cashmanagement-queue.pid)
    if kill -0 $QUEUE_PID 2>/dev/null; then
        echo "🟢 Queue Worker: RUNNING (PID: $QUEUE_PID)"
    else
        echo "🔴 Queue Worker: NOT RUNNING"
        rm -f /var/run/cashmanagement-queue.pid
    fi
else
    echo "🔴 Queue Worker: NOT RUNNING (no PID file)"
fi

# Show memory usage
echo ""
echo "💾 Memory Usage:"
free -h

# Show disk usage
echo ""
echo "💿 Disk Usage:"
df -h /var/www/cashmanagement 2>/dev/null || df -h .

# Show recent logs
echo ""
echo "📝 Recent Logs (last 5 lines):"
if [ -f "/var/log/cashmanagement.log" ]; then
    tail -n 5 /var/log/cashmanagement.log
else
    echo "No log file found"
fi

# Show active PHP processes
echo ""
echo "🔍 Active PHP Processes:"
ps aux | grep php | grep -v grep || echo "No PHP processes found"

echo ""
echo "🌐 Access your app at:"
if netstat -tuln | grep -q ":80 "; then
    echo "   http://141.144.235.74"
elif netstat -tuln | grep -q ":8080 "; then
    echo "   http://141.144.235.74:8080"
else
    echo "   Server not running or no ports listening"
fi
