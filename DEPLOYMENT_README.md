# CashManagement - Production Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the CashManagement Laravel React application on Apache server, specifically optimized for Oracle Cloud Free Tier and resource-limited servers.

## 🚀 Quick Start

### Option 1: Pre-built Deployment (Recommended for Limited Resources)

1. **Prepare locally** (with Node.js and npm):
   ```bash
   ./pre-deploy.sh
   ```
   This creates a production-ready archive with pre-built assets.

2. **Deploy on server**:
   ```bash
   # Upload the generated .tar.gz file to your server
   tar -xzf cashmanagement_production_*.tar.gz -C /var/www/html/cashmanagement
   cd /var/www/html/cashmanagement
   ./deploy.sh
   ```

### Option 2: Direct Deployment

```bash
# On your server (requires all dependencies)
git clone your-repo
cd CashManagement
./deploy.sh
```

### Option 3: Docker Deployment

```bash
./docker-deploy.sh
```

## 📋 Server Requirements

### Minimum Requirements (Oracle Free Tier Compatible)
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: 1GB (Oracle Free Tier provides 1GB)
- **Storage**: 10GB available space
- **CPU**: 1 vCPU (Oracle Free Tier provides 1 OCPU)

### Software Requirements
- **Web Server**: Apache 2.4+
- **PHP**: 8.1+ with extensions:
  - pdo, pdo_mysql, mbstring, xml, ctype, json, bcmath, fileinfo, tokenizer
- **Database**: MySQL 8.0+
- **Composer**: Latest version

## 🔧 Deployment Scripts

### 1. `deploy.sh` - Main Deployment Script
- **Purpose**: Complete server deployment with Apache configuration
- **Features**:
  - Database setup and migration
  - Apache virtual host configuration
  - File permissions setup
  - Laravel optimization
  - Maintenance scripts creation

**Usage**:
```bash
chmod +x deploy.sh
./deploy.sh
```

### 2. `pre-deploy.sh` - Pre-deployment Build Script
- **Purpose**: Build assets locally for resource-limited servers
- **Features**:
  - Frontend asset building
  - Laravel optimization
  - Production package creation
  - Compressed archive generation

**Usage**:
```bash
chmod +x pre-deploy.sh
./pre-deploy.sh
```

### 3. `docker-deploy.sh` - Docker Deployment
- **Purpose**: Containerized deployment option
- **Features**:
  - Dockerfile generation
  - Docker Compose configuration
  - MySQL container setup
  - Automated deployment

**Usage**:
```bash
chmod +x docker-deploy.sh
./docker-deploy.sh
```

## 🌐 Apache Configuration

The deployment creates a subdirectory configuration allowing access via:
```
http://YOUR_SERVER_IP/cashmanagement
```

### Key Features:
- **URL Rewriting**: Handles React Router properly
- **Security Headers**: X-Frame-Options, XSS Protection, etc.
- **Asset Caching**: Optimized caching for static assets
- **Gzip Compression**: Reduces bandwidth usage

## 🗄️ Database Configuration

### MySQL Setup
The script automatically:
1. Creates database: `cashmanagement_db`
2. Creates user with appropriate permissions
3. Runs Laravel migrations
4. Optionally seeds initial data

### Connection Details
- **Host**: localhost (or your MySQL host)
- **Database**: cashmanagement_db
- **User**: Created during deployment
- **Charset**: utf8mb4_unicode_ci

## 🔒 Security Features

### File Permissions
- Application files: `644`
- Directories: `755`
- Storage directories: `775`
- Executable files: `755`

### Apache Security
- Sensitive file blocking (.env, .log, etc.)
- Directory traversal protection
- Security headers implementation

### Laravel Security
- Production environment settings
- Debug mode disabled
- Optimized autoloader
- Cached configurations

## 📊 Performance Optimizations

### Frontend
- Pre-built React assets
- Minified and compressed JavaScript/CSS
- Optimized images and fonts
- Browser caching headers

### Backend
- Composer autoloader optimization
- Laravel configuration caching
- Route caching
- View caching
- OPcache enabled (if available)

### Database
- Optimized migrations
- Proper indexing
- Connection pooling ready

## 🔧 Maintenance

### Backup Script
```bash
cd /var/www/html/cashmanagement
./backup.sh
```
Creates database and file backups in `/var/backups/cashmanagement/`

### Update Script
```bash
cd /var/www/html/cashmanagement
./update.sh
```
Handles application updates with minimal downtime.

### Log Monitoring
```bash
# Application logs
tail -f /var/www/html/cashmanagement/storage/logs/laravel.log

# Apache logs
sudo tail -f /var/log/apache2/error.log
sudo tail -f /var/log/apache2/access.log
```

## 🌩️ Oracle Cloud Free Tier Setup

### 1. Instance Configuration
- **Shape**: VM.Standard.E2.1.Micro (1 OCPU, 1GB RAM)
- **OS**: Ubuntu 20.04 Minimal
- **Boot Volume**: 47GB (Free Tier limit)

### 2. Network Configuration
```bash
# Open HTTP port in security list
# Oracle Cloud Console > Networking > Virtual Cloud Networks
# Security Lists > Default Security List > Ingress Rules
# Add: Source CIDR: 0.0.0.0/0, Destination Port: 80
```

### 3. Firewall Configuration
```bash
# Ubuntu UFW
sudo ufw allow 'Apache Full'
sudo ufw enable

# Or iptables
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Permission Denied Errors
```bash
sudo chown -R www-data:www-data /var/www/html/cashmanagement
sudo chmod -R 775 /var/www/html/cashmanagement/storage
sudo chmod -R 775 /var/www/html/cashmanagement/bootstrap/cache
```

#### 2. Database Connection Issues
- Verify MySQL is running: `sudo systemctl status mysql`
- Check credentials in `.env` file
- Test connection: `mysql -u username -p database_name`

#### 3. Apache Issues
- Check status: `sudo systemctl status apache2`
- Restart: `sudo systemctl restart apache2`
- Check configuration: `sudo apache2ctl configtest`

#### 4. Laravel Errors
- Clear caches: `php artisan cache:clear`
- Check logs: `tail -f storage/logs/laravel.log`
- Verify permissions on storage directories

#### 5. Frontend Assets Not Loading
- Verify build directory exists: `ls -la public/build/`
- Check Apache configuration for static file serving
- Verify .htaccess file in public directory

### Resource Optimization for Free Tier

#### Memory Optimization
- Disabled development tools
- Optimized Composer autoloader
- Minimal logging in production
- Efficient database queries

#### Storage Optimization
- Removed unnecessary files
- Compressed assets
- Optimized images
- Log rotation configured

## 📈 Monitoring

### Application Health
```bash
# Check application status
curl -I http://YOUR_SERVER_IP/cashmanagement

# Monitor resource usage
htop
df -h
free -h
```

### Database Health
```bash
# MySQL status
sudo systemctl status mysql

# Database size
mysql -u root -p -e "SELECT table_schema AS 'Database', 
ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' 
FROM information_schema.tables GROUP BY table_schema;"
```

## 🔄 Updates and Maintenance

### Regular Maintenance Tasks
1. **Weekly**: Run backup script
2. **Monthly**: Update system packages
3. **As needed**: Monitor logs and performance

### Update Process
1. Backup current installation
2. Pull latest changes
3. Run update script
4. Verify functionality

## 📞 Support

### Logs Location
- **Laravel**: `/var/www/html/cashmanagement/storage/logs/`
- **Apache**: `/var/log/apache2/`
- **MySQL**: `/var/log/mysql/`

### Configuration Files
- **Apache**: `/etc/apache2/conf-available/cashmanagement.conf`
- **Laravel**: `/var/www/html/cashmanagement/.env`
- **Database**: `/etc/mysql/mysql.conf.d/mysqld.cnf`

## 🎯 Production Checklist

- [ ] Server meets minimum requirements
- [ ] All dependencies installed
- [ ] Database created and configured
- [ ] Application deployed and optimized
- [ ] Apache configured with security headers
- [ ] Firewall rules configured
- [ ] Backup scripts in place
- [ ] Monitoring configured
- [ ] SSL certificate installed (recommended)
- [ ] Regular maintenance scheduled

---

**Your CashManagement application is now ready for production!**

Access your application at: `http://YOUR_SERVER_IP/cashmanagement`
