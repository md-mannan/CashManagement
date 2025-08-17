#!/bin/bash

# Setup Port 80 Access for CashManagement
# This script configures your system to allow Laravel to run on port 80

echo "🔧 Setting up Port 80 access for CashManagement..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ This script needs to run as root"
    echo "Run: sudo bash .ssh/setup-port80.sh"
    exit 1
fi

echo "📋 Available options for port 80 access:"
echo "1. Use iptables to redirect port 80 to 8080 (Recommended)"
echo "2. Give PHP binary CAP_NET_BIND_SERVICE capability"
echo "3. Use authbind (if available)"
echo "4. Setup nginx reverse proxy"
echo ""

read -p "Choose option (1-4): " choice

case $choice in
    1)
        echo "🔄 Setting up iptables redirect..."
        # Redirect port 80 to 8080
        iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080
        iptables -t nat -A OUTPUT -p tcp --dport 80 -o lo -j REDIRECT --to-port 8080
        
        # Save iptables rules
        if command -v iptables-save &> /dev/null; then
            iptables-save > /etc/iptables/rules.v4 2>/dev/null || echo "⚠️ Could not save iptables rules permanently"
        fi
        
        echo "✅ Port redirection configured!"
        echo "   Port 80 → 8080 redirect active"
        echo "   Start server with: sudo bash .ssh/start-server.sh"
        echo "   Access via: http://141.144.235.74"
        ;;
        
    2)
        echo "🔧 Setting up PHP capabilities..."
        PHP_BINARY=$(which php)
        if [ -n "$PHP_BINARY" ]; then
            setcap CAP_NET_BIND_SERVICE=+eip $PHP_BINARY
            echo "✅ PHP capability set!"
            echo "   PHP can now bind to port 80"
            echo "   Start server with: sudo bash .ssh/start-server.sh"
        else
            echo "❌ PHP binary not found"
        fi
        ;;
        
    3)
        echo "🔧 Setting up authbind..."
        if command -v authbind &> /dev/null; then
            touch /etc/authbind/byport/80
            chmod 755 /etc/authbind/byport/80
            chown $SUDO_USER /etc/authbind/byport/80
            echo "✅ Authbind configured!"
            echo "   Use: authbind --deep php artisan serve --host=0.0.0.0 --port=80"
        else
            echo "❌ Authbind not available. Install with:"
            echo "   apt-get install authbind"
        fi
        ;;
        
    4)
        echo "🔧 Setting up nginx reverse proxy..."
        if command -v nginx &> /dev/null; then
            cat > /etc/nginx/sites-available/cashmanagement << 'EOF'
server {
    listen 80;
    server_name 141.144.235.74;
    
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
            
            # Enable site
            ln -sf /etc/nginx/sites-available/cashmanagement /etc/nginx/sites-enabled/
            
            # Test and reload nginx
            nginx -t && systemctl reload nginx
            
            echo "✅ Nginx reverse proxy configured!"
            echo "   Start Laravel on port 8080: sudo bash .ssh/start-server.sh"
            echo "   Nginx will proxy port 80 → 8080"
            echo "   Access via: http://141.144.235.74"
        else
            echo "❌ Nginx not available. Install with:"
            echo "   apt-get install nginx"
        fi
        ;;
        
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "🎯 Port 80 setup complete!"
echo "ℹ️  Remember to start your application after this setup"
