# Dynamic Environment Configuration System

## Overview

The Cash Management application now features an intelligent **Dynamic Environment Configuration System** that automatically detects your hosting environment and optimizes Laravel settings accordingly. This eliminates the need for manual environment configuration and ensures optimal performance across different hosting platforms.

## 🎯 **Key Features**

### **Automatic Environment Detection**
- **Local Development**: Detects localhost, .local, .test domains
- **Shared Hosting**: Identifies cPanel, Plesk, DirectAdmin environments
- **VPS/Dedicated**: Recognizes servers with full control and process capabilities
- **Cloud Hosting**: Detects AWS, GCP, Azure, DigitalOcean, Linode platforms

### **Smart Configuration Optimization**
- **Database**: Auto-selects SQLite for local, MySQL for production
- **Broadcasting**: Uses Reverb for VPS, Pusher for shared hosting
- **Caching**: Chooses Redis for VPS, database for shared hosting
- **Queue Management**: Adapts to hosting limitations
- **Security Settings**: Applies appropriate security headers and HTTPS settings

## 🚀 **Getting Started**

### **1. Environment Detection**

Check your current environment:
```bash
php artisan env:detect
```

This will display:
- Detected environment type
- Detection details and indicators
- Recommended configuration
- Environment-specific tips

### **2. Generate Optimized Configuration**

Create an optimized `.env` file:
```bash
php artisan env:config --generate
```

Options:
- `--force`: Overwrite existing .env file
- `--show`: Display current configuration
- `--export`: Export configuration to JSON file

### **3. View Configuration Details**

```bash
# Show current configuration
php artisan env:config --show

# Export detailed configuration
php artisan env:config --export
```

## 🔧 **Environment Types**

### **Local Development**
**Detected when:**
- Domain contains: `localhost`, `127.0.0.1`, `.local`, `.test`
- APP_ENV is set to `local`

**Optimizations:**
- SQLite database for easy setup
- File-based caching and sessions
- Reverb WebSockets enabled
- Debug mode enabled
- Detailed logging

### **Shared Hosting**
**Detected when:**
- Control panels: cPanel, Plesk, DirectAdmin found
- PHP SAPI: `apache2handler`, `cgi-fcgi`
- Limited resources and restricted functions

**Optimizations:**
- MySQL database
- Pusher for WebSockets (Reverb fallback)
- Database-based caching and sessions
- Database queue (limited background processes)
- Error-level logging only

### **VPS/Dedicated Server**
**Detected when:**
- Can execute system commands
- PHP SAPI: `fpm-fcgi`, `cli`
- Full server control available

**Optimizations:**
- MySQL database
- Reverb WebSockets server
- Redis for caching, sessions, and queues
- Background process support
- Comprehensive logging

### **Cloud Hosting**
**Detected when:**
- Cloud provider environment variables detected
- Metadata endpoints accessible
- Container environment indicators

**Optimizations:**
- Managed database services
- Pusher/Ably for WebSockets
- Redis for caching and sessions
- Cloud queue services (SQS)
- Cloud email services (SES)

## 📋 **Configuration Files**

### **Main Configuration**
- `config/environment.php` - Environment detection rules and configurations
- `app/Services/EnvironmentDetectionService.php` - Core detection logic
- `app/Providers/DynamicEnvironmentServiceProvider.php` - Service registration

### **Artisan Commands**
- `app/Console/Commands/EnvironmentDetectCommand.php` - Detection command
- `app/Console/Commands/EnvironmentConfigCommand.php` - Configuration management

## 🛠 **Customization**

### **Adding Custom Environment Types**

Edit `config/environment.php`:

```php
'environments' => [
    'custom_hosting' => [
        'indicators' => [
            'domain_patterns' => ['myhost.com'],
            'server_names' => ['custom-server'],
        ],
        'config' => [
            'app' => [
                'debug' => false,
                'log_level' => 'info',
            ],
            'database' => [
                'default' => 'mysql',
            ],
            // ... more config
        ],
    ],
],
```

### **Disabling Auto-Detection**

In your `.env` file:
```env
AUTO_DETECT_ENVIRONMENT=false
```

### **Override Specific Settings**

The system respects existing `.env` values and only sets defaults for missing configurations.

## 🔄 **Integration with Deployment**

### **Production Deployment Script**
The updated `deploy-production.sh` now includes:
```bash
# Detect environment and generate configuration
php artisan env:detect
php artisan env:config --generate --force
```

### **Manual Deployment Steps**
1. Upload your application files
2. Run: `php artisan env:detect`
3. Run: `php artisan env:config --generate`
4. Review and customize the generated `.env` file
5. Run: `php artisan migrate --force`

## 🎛 **Advanced Usage**

### **Programmatic Access**

```php
use App\Facades\EnvironmentDetector;

// Get environment type
$environment = EnvironmentDetector::getEnvironmentType();

// Get detection details
$details = EnvironmentDetector::getDetectionDetails();

// Get recommendations
$recommendations = EnvironmentDetector::getConfigurationRecommendations();

// Apply dynamic configuration
EnvironmentDetector::applyDynamicConfiguration();
```

### **Service Injection**

```php
use App\Services\EnvironmentDetectionService;

class MyController extends Controller
{
    public function index(EnvironmentDetectionService $detector)
    {
        $environment = $detector->getEnvironmentType();
        
        if ($environment === 'shared_hosting') {
            // Handle shared hosting specific logic
        }
    }
}
```

## 🔍 **Troubleshooting**

### **Detection Issues**
If environment detection is incorrect:

1. **Check detection details:**
   ```bash
   php artisan env:detect --json
   ```

2. **Manual override in `.env`:**
   ```env
   APP_ENV=production
   AUTO_DETECT_ENVIRONMENT=false
   ```

3. **Custom indicators:**
   Edit `config/environment.php` to add your hosting-specific indicators.

### **Configuration Problems**
If generated configuration doesn't work:

1. **Review current config:**
   ```bash
   php artisan env:config --show
   ```

2. **Export for analysis:**
   ```bash
   php artisan env:config --export
   ```

3. **Manual adjustment:**
   Edit the generated `.env` file to match your hosting requirements.

### **Performance Issues**
The detection runs once and caches results. To refresh:

```bash
php artisan cache:clear
```

## 📊 **Environment-Specific Tips**

### **Shared Hosting**
- Use Pusher for WebSockets (most reliable)
- Database sessions prevent permission issues
- Monitor resource usage and limits
- Consider CDN for static assets

### **VPS/Dedicated**
- Set up Supervisor for queue workers
- Use Redis for better performance
- Configure proper firewall rules
- Monitor server resources

### **Cloud Hosting**
- Leverage managed services
- Use environment-specific scaling
- Implement proper monitoring
- Consider multi-region deployment

## 🚀 **Benefits**

1. **Zero Configuration**: Works out of the box on any hosting platform
2. **Optimal Performance**: Automatically selects best services for your environment
3. **Reduced Errors**: Eliminates common configuration mistakes
4. **Easy Deployment**: One-command environment setup
5. **Hosting Agnostic**: Works across different hosting providers
6. **Future Proof**: Easily extensible for new hosting types

## 🔗 **Related Commands**

```bash
# Environment detection and configuration
php artisan env:detect
php artisan env:config --generate

# Standard Laravel commands (still work)
php artisan config:cache
php artisan route:cache
php artisan migrate

# WebSocket setup (environment-aware)
php artisan reverb:install
php artisan reverb:start
```

The Dynamic Environment Configuration System makes your Cash Management application truly portable and self-configuring across any hosting environment!
