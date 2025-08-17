# CashManagement - Complete Deployment Guide

## 🖥️ **LOCAL PC SETUP (Development & Build)**

### Step 1: Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/CashManagement.git
cd CashManagement
```

### Step 2: Install Dependencies
```bash
# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install
```

### Step 3: Environment Setup
```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure your local database in .env file
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_DATABASE=cashmanagement_local
# DB_USERNAME=your_username
# DB_PASSWORD=your_password
```

### Step 4: Database Setup (Local)
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE cashmanagement_local;"

# Run migrations
php artisan migrate

# Seed database (optional)
php artisan db:seed
```

### Step 5: Build for Production
```bash
# Build frontend assets for production
npm run build

# Create production deployment package
./pre-deploy.sh
```

This creates a `cashmanagement_production_YYYYMMDD_HHMMSS.tar.gz` file ready for server deployment.

---

## 🌐 **SERVER PC SETUP (Production Deployment)**

### Option A: Pre-built Deployment (Recommended for Oracle Free Tier)

#### Step 1: Upload Build Package
```bash
# Upload the .tar.gz file to your server
scp cashmanagement_production_*.tar.gz user@your-server-ip:/tmp/

# Or use FTP/SFTP to upload to /tmp/
```

#### Step 2: Extract on Server
```bash
# SSH into your server
ssh user@your-server-ip

# Create application directory
sudo mkdir -p /var/www/html/cashmanagement

# Extract the package
cd /var/www/html/cashmanagement
sudo tar -xzf /tmp/cashmanagement_production_*.tar.gz

# Make scripts executable
sudo chmod +x deploy.sh verify-deployment.sh
```

#### Step 3: Run Deployment
```bash
# Run the deployment script
sudo ./deploy.sh

# Follow the prompts to:
# - Set up MySQL database
# - Configure database credentials
# - Set up Apache virtual host
# - Configure file permissions
```

#### Step 4: Verify Deployment
```bash
# Run verification script
./verify-deployment.sh

# Check if site is accessible
curl -I http://your-server-ip/cashmanagement
```

### Option B: Direct Git Deployment

#### Step 1: Clone on Server
```bash
# SSH into your server
ssh user@your-server-ip

# Clone repository
cd /var/www/html
sudo git clone https://github.com/YOUR_USERNAME/CashManagement.git cashmanagement
cd cashmanagement
```

#### Step 2: Install Dependencies
```bash
# Install PHP dependencies (production only)
sudo composer install --optimize-autoloader --no-dev

# Build frontend assets (requires Node.js on server)
npm ci
npm run build
```

#### Step 3: Run Deployment
```bash
# Make deployment script executable
sudo chmod +x deploy.sh

# Run deployment
sudo ./deploy.sh
```

---

## 🔧 **SERVER REQUIREMENTS**

### Minimum System Requirements
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: 1GB (Oracle Free Tier compatible)
- **Storage**: 10GB available
- **CPU**: 1 vCPU

### Required Software
```bash
# For Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y apache2 mysql-server php8.3 php8.3-cli \
    php8.3-mysql php8.3-mbstring php8.3-xml php8.3-bcmath \
    php8.3-json php8.3-ctype php8.3-fileinfo php8.3-tokenizer \
    libapache2-mod-php8.3 composer unzip curl

# For CentOS/RHEL
sudo yum install -y httpd mysql-server php php-cli php-mysql \
    php-mbstring php-xml php-bcmath php-json composer
```

---

## 🗄️ **DATABASE SETUP**

### MySQL Configuration
```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p
```

```sql
CREATE DATABASE cashmanagement_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cashmanagement_user'@'localhost' IDENTIFIED BY 'secure_password_123';
GRANT ALL PRIVILEGES ON cashmanagement_db.* TO 'cashmanagement_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 🔐 **SECURITY SETUP**

### Firewall Configuration
```bash
# Ubuntu with UFW
sudo ufw allow 'Apache Full'
sudo ufw enable

# CentOS with firewalld  
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload
```

### Oracle Cloud Specific
1. **Security List Configuration**:
   - Go to Oracle Cloud Console
   - Navigate to Networking > Virtual Cloud Networks
   - Select your VCN > Security Lists > Default Security List
   - Add Ingress Rule: Source CIDR: `0.0.0.0/0`, Destination Port: `80`

2. **Instance Firewall**:
   ```bash
   sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
   sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
   sudo iptables-save | sudo tee /etc/iptables/rules.v4
   ```

---

## 🚀 **DEPLOYMENT WORKFLOW**

### Complete Workflow Summary

**Local PC (Development):**
1. Clone repo → Install deps → Configure → Build → Package

**Server PC (Production):**  
1. Upload package → Extract → Deploy → Verify

### Quick Commands Summary

**Local PC:**
```bash
git clone https://github.com/YOUR_USERNAME/CashManagement.git
cd CashManagement
composer install && npm install
cp .env.example .env && php artisan key:generate
npm run build
./pre-deploy.sh
```

**Server PC:**
```bash
# Upload cashmanagement_production_*.tar.gz to server
sudo mkdir -p /var/www/html/cashmanagement
cd /var/www/html/cashmanagement
sudo tar -xzf /tmp/cashmanagement_production_*.tar.gz
sudo chmod +x deploy.sh
sudo ./deploy.sh
./verify-deployment.sh
```

---

## 🌐 **ACCESS YOUR APPLICATION**

After successful deployment, access your application at:
```
http://YOUR_SERVER_IP/cashmanagement
```

Example: `http://141.144.235.74/cashmanagement`

---

## 🔧 **MAINTENANCE COMMANDS**

### Regular Maintenance
```bash
# Backup database and files
cd /var/www/html/cashmanagement
./backup.sh

# Update application
./update.sh

# Check logs
tail -f storage/logs/laravel.log
sudo tail -f /var/log/apache2/error.log
```

### Troubleshooting
```bash
# Fix permissions
sudo chown -R www-data:www-data /var/www/html/cashmanagement
sudo chmod -R 775 storage bootstrap/cache

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Restart services
sudo systemctl restart apache2
sudo systemctl restart mysql
```

---

## ✅ **VERIFICATION CHECKLIST**

- [ ] Repository cloned successfully
- [ ] Dependencies installed (Composer + npm)
- [ ] Frontend assets built
- [ ] Production package created
- [ ] Package uploaded to server
- [ ] Deployment script executed
- [ ] Database created and migrated
- [ ] Apache configured
- [ ] Firewall rules set
- [ ] Application accessible via browser
- [ ] All features working correctly

---

**🎉 Your CashManagement application is now live and ready for production use!**
