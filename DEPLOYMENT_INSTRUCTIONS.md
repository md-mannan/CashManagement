# CashManagement Deployment Instructions

## Prerequisites

### Server Requirements
- Ubuntu 20.04+ or CentOS 8+ (Oracle Cloud Free Tier compatible)
- PHP 8.1 or higher
- Apache 2.4+
- MySQL 8.0+
- At least 1GB RAM (Oracle Free Tier: 1GB)
- At least 10GB disk space

### Required PHP Extensions
- PDO
- pdo_mysql
- mbstring
- xml
- ctype
- json
- bcmath
- fileinfo
- tokenizer

## Deployment Steps

### 1. Prepare Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y apache2 mysql-server php8.1 php8.1-cli php8.1-common \
    php8.1-mysql php8.1-mbstring php8.1-xml php8.1-bcmath php8.1-json \
    php8.1-tokenizer php8.1-fileinfo php8.1-ctype unzip curl

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer
```

### 2. Setup MySQL
```bash
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p
```

```sql
CREATE DATABASE cashmanagement_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cashmanagement_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON cashmanagement_db.* TO 'cashmanagement_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Deploy Application
```bash
# Upload and extract the archive
cd /var/www/html
sudo mkdir -p cashmanagement
cd cashmanagement
sudo wget YOUR_ARCHIVE_URL  # or upload via SCP/FTP
sudo tar -xzf cashmanagement_production_*.tar.gz
sudo rm cashmanagement_production_*.tar.gz

# Make deploy script executable
sudo chmod +x deploy.sh

# Run deployment script
sudo ./deploy.sh
```

### 4. Configure Firewall (if needed)
```bash
# For Ubuntu with UFW
sudo ufw allow 'Apache Full'
sudo ufw enable

# For CentOS with firewalld
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload
```

### 5. Access Application
Your application will be available at: `http://YOUR_SERVER_IP/cashmanagement`

## Maintenance

### Backup Database
```bash
cd /var/www/html/cashmanagement
sudo ./backup.sh
```

### Update Application
```bash
cd /var/www/html/cashmanagement
sudo ./update.sh
```

### Monitor Logs
```bash
sudo tail -f /var/www/html/cashmanagement/storage/logs/laravel.log
sudo tail -f /var/log/apache2/error.log
```

## Troubleshooting

### Common Issues

1. **Permission Issues**
   ```bash
   sudo chown -R www-data:www-data /var/www/html/cashmanagement
   sudo chmod -R 775 /var/www/html/cashmanagement/storage
   sudo chmod -R 775 /var/www/html/cashmanagement/bootstrap/cache
   ```

2. **Database Connection Issues**
   - Check `.env` file for correct database credentials
   - Ensure MySQL is running: `sudo systemctl status mysql`
   - Test connection: `mysql -u cashmanagement_user -p cashmanagement_db`

3. **Apache Issues**
   - Check Apache status: `sudo systemctl status apache2`
   - Check error logs: `sudo tail -f /var/log/apache2/error.log`
   - Restart Apache: `sudo systemctl restart apache2`

4. **Application Errors**
   - Check Laravel logs: `sudo tail -f /var/www/html/cashmanagement/storage/logs/laravel.log`
   - Clear caches: `sudo php artisan cache:clear`

### Oracle Cloud Free Tier Specific

1. **Open Ports in Security List**
   - Go to Oracle Cloud Console
   - Navigate to Networking > Virtual Cloud Networks
   - Select your VCN > Security Lists > Default Security List
   - Add Ingress Rule: Source CIDR: 0.0.0.0/0, Destination Port: 80

2. **Resource Optimization**
   - The application is optimized for 1GB RAM
   - Database queries are optimized for performance
   - Static assets are cached and compressed

## Support

For issues and support, check the application logs and refer to Laravel documentation.
