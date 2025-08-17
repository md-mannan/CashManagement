# CashManagement Deployment Guide

## 🚀 Quick Start

1. **Clone your repository on the cloud server:**
   ```bash
   git clone https://github.com/yourusername/CashManagement.git
   cd CashManagement
   ```

2. **Run the deployment script:**
   ```bash
   sudo bash .ssh/deploy.sh
   ```

3. **Start the server:**
   ```bash
   sudo bash .ssh/start-server.sh
   ```

4. **Access your application:**
   - Open browser: `http://141.144.235.74`

## 📁 File Permissions Guide

### Directory Structure
```
/var/www/cashmanagement/          # Main project directory
├── .ssh/                         # Deployment scripts
├── storage/                      # Laravel storage (775)
├── bootstrap/cache/              # Laravel cache (775)
├── database/                     # Database files
└── ...                          # Other project files
```

### Permission Settings

| Path | Permission | Owner | Group | Purpose |
|------|------------|-------|-------|---------|
| `/var/www/cashmanagement/` | 755 | user | www-data | Main directory |
| `storage/` | 775 | user | www-data | File uploads, logs |
| `bootstrap/cache/` | 775 | user | www-data | Laravel cache |
| `database/database.sqlite` | 664 | user | www-data | SQLite database |
| `.env` | 644 | user | www-data | Environment config |
| `artisan` | 755 | user | www-data | Laravel CLI |
| `.ssh/*.sh` | 755 | user | www-data | Deployment scripts |

### Commands for Manual Permission Setup
```bash
# Set directory permissions
sudo find /var/www/cashmanagement -type d -exec chmod 755 {} \;

# Set file permissions
sudo find /var/www/cashmanagement -type f -exec chmod 644 {} \;

# Set storage permissions
sudo chmod -R 775 /var/www/cashmanagement/storage
sudo chmod -R 775 /var/www/cashmanagement/bootstrap/cache

# Set ownership
sudo chown -R $USER:www-data /var/www/cashmanagement

# Make scripts executable
sudo chmod +x /var/www/cashmanagement/.ssh/*.sh
sudo chmod +x /var/www/cashmanagement/artisan
```

## 🖥️ Server Management

### Start Server
```bash
sudo bash .ssh/start-server.sh
```

### Stop Server
```bash
sudo bash .ssh/stop-server.sh
```

### Check Status
```bash
sudo bash .ssh/status.sh
```

### View Logs
```bash
# Server logs
sudo tail -f /var/log/cashmanagement.log

# Queue logs
sudo tail -f /var/log/cashmanagement-queue.log
```

## 💾 Memory Optimization (1GB RAM)

The deployment is optimized for 1GB RAM systems:

- **PHP Memory Limit:** 256MB for main server
- **Queue Worker Memory:** 128MB
- **No npm install on server:** Build locally, commit built assets
- **Optimized Laravel caching:** Config and route caching enabled

### Local Development Workflow
1. Develop locally with full npm/node setup
2. Build production assets: `npm run build`
3. Commit built assets to git
4. Deploy to cloud server (no npm install needed)

## 🔧 Troubleshooting

### Port 80 Access Issues

**Problem:** `Permission denied` on port 80

**Solution Options:**

#### Option 1: Use Port 8080 (Automatic Fallback)
The start script automatically falls back to port 8080:
```bash
sudo bash .ssh/start-server.sh
# Access via: http://141.144.235.74:8080
```

#### Option 2: Setup Port 80 Redirect (Recommended)
```bash
# Run the port 80 setup script
sudo bash .ssh/setup-port80.sh
# Choose option 1 for iptables redirect
```

#### Option 3: Manual iptables Redirect
```bash
# Redirect port 80 to 8080
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080
sudo iptables -t nat -A OUTPUT -p tcp --dport 80 -o lo -j REDIRECT --to-port 8080

# Start server on 8080 (will be accessible via port 80)
sudo bash .ssh/start-server.sh
```

#### Option 4: Give PHP Port Binding Capability
```bash
# Allow PHP to bind to port 80
sudo setcap CAP_NET_BIND_SERVICE=+eip $(which php)
sudo bash .ssh/start-server.sh
```

#### Option 5: Use Nginx Reverse Proxy
```bash
# Install nginx
sudo apt install nginx

# Run setup script and choose option 4
sudo bash .ssh/setup-port80.sh
```

**Check Current Status:**
```bash
# Check if port 80 is in use
sudo netstat -tuln | grep :80

# Check if port 8080 is in use  
sudo netstat -tuln | grep :8080

# Kill processes using port 80
sudo lsof -ti:80 | xargs sudo kill -9
```

### Permission Issues

#### Common Permission Problems:

**1. Git Repository Ownership Error:**
```
fatal: detected dubious ownership in repository at '/var/www/cashmanagement'
```
**Solution:**
```bash
sudo git config --global --add safe.directory /var/www/cashmanagement
sudo chown -R $USER:www-data /var/www/cashmanagement/.git
```

**2. Vendor Directory Permission Denied:**
```
unlink(/var/www/cashmanagement/vendor/...): Permission denied
```
**Solution:**
```bash
sudo rm -rf /var/www/cashmanagement/vendor
sudo bash .ssh/deploy.sh  # Redeploy
```

**3. Database File Creation Issues:**
```
touch: cannot touch '.../database.sqlite': Permission denied
```
**Solution:**
```bash
sudo mkdir -p /var/www/cashmanagement/database
sudo chown -R $USER:www-data /var/www/cashmanagement/database
sudo chmod 775 /var/www/cashmanagement/database
```

**4. Complete Permission Reset (Nuclear Option):**
```bash
# Use this when multiple permission issues exist
sudo bash .ssh/cleanup-and-redeploy.sh
```

#### Manual Permission Fix:
```bash
# Fix storage permissions
sudo chmod -R 775 storage bootstrap/cache
sudo chown -R $USER:www-data storage bootstrap/cache

# Fix all project permissions
sudo chown -R $USER:www-data /var/www/cashmanagement
sudo find /var/www/cashmanagement -type d -exec chmod 755 {} \;
sudo find /var/www/cashmanagement -type f -exec chmod 644 {} \;
sudo chmod -R 775 /var/www/cashmanagement/storage
sudo chmod -R 775 /var/www/cashmanagement/bootstrap/cache
```

### Memory Issues
```bash
# Check memory usage
free -h

# Restart with lower memory limits
sudo bash .ssh/stop-server.sh
sudo bash .ssh/start-server.sh
```

### Database Issues
```bash
# Reset database
php artisan migrate:fresh --seed

# Check database permissions
ls -la database/database.sqlite
```

## 🌐 Production Checklist

- [ ] `.env` configured with production settings
- [ ] `APP_DEBUG=false` in `.env`
- [ ] Database configured and migrated
- [ ] File permissions set correctly
- [ ] Server running on port 80
- [ ] Application accessible via public IP
- [ ] SSL certificate (optional but recommended)

## 📦 Deployment Without npm install

Since your server has limited RAM (1GB), follow this workflow:

### On Local Machine:
```bash
# Install dependencies and build
npm install
npm run build

# Commit built assets
git add public/build/
git commit -m "Add built assets"
git push origin main
```

### On Cloud Server:
```bash
# Just pull and deploy
git pull origin main
sudo bash .ssh/deploy.sh
sudo bash .ssh/start-server.sh
```

This way, you avoid running `npm install` on the low-memory server!

## 🔐 Security Notes

- Change default passwords in `.env`
- Use strong `APP_KEY`
- Consider setting up a firewall
- Regular backups of database
- Keep Laravel and PHP updated

## 📞 Support

If you encounter issues:
1. Check logs: `sudo bash .ssh/status.sh`
2. Verify permissions: `ls -la /var/www/cashmanagement/`
3. Check memory: `free -h`
4. Restart services: `sudo bash .ssh/stop-server.sh && sudo bash .ssh/start-server.sh`
