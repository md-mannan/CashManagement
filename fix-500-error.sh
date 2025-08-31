#!/bin/bash

# Fix 500 Error in cPanel Production
# Run this script via SSH on your cPanel hosting

echo "🔧 Fixing 500 Error in Production..."

# Step 1: Clear all Laravel caches
echo "📋 Clearing Laravel caches..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan optimize:clear

# Step 2: Regenerate application key
echo "🔑 Regenerating application key..."
php artisan key:generate

# Step 3: Run database migrations
echo "🗄️ Running database migrations..."
php artisan migrate --force

# Step 4: Check if activity_logs table exists
echo "📊 Checking database tables..."
if ! php artisan tinker --execute="echo 'Checking activity_logs table...'; try { \App\Models\ActivityLog::count(); echo 'OK'; } catch(Exception \$e) { echo 'ERROR: ' . \$e->getMessage(); }" 2>/dev/null; then
    echo "⚠️ Activity logs table may not exist, creating it..."
    php artisan migrate --force
fi

# Step 5: Check if sessions table exists
echo "📋 Checking sessions table..."
if ! php artisan tinker --execute="echo 'Checking sessions table...'; try { \DB::table('sessions')->count(); echo 'OK'; } catch(Exception \$e) { echo 'ERROR: ' . \$e->getMessage(); }" 2>/dev/null; then
    echo "⚠️ Sessions table may not exist, creating it..."
    php artisan session:table
    php artisan migrate --force
fi

# Step 6: Set proper permissions
echo "📁 Setting file permissions..."
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
chmod -R 755 build/
chmod 644 .env

# Step 7: Rebuild caches
echo "🏗️ Rebuilding caches..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Step 8: Test database connection
echo "🔍 Testing database connection..."
php artisan tinker --execute="echo 'Database connection test: '; try { \DB::connection()->getPdo(); echo 'SUCCESS'; } catch(Exception \$e) { echo 'FAILED: ' . \$e->getMessage(); }"

# Step 9: Test basic functionality
echo "🧪 Testing basic functionality..."
php artisan tinker --execute="echo 'Testing User model: '; try { \App\Models\User::count(); echo 'SUCCESS'; } catch(Exception \$e) { echo 'FAILED: ' . \$e->getMessage(); }"

echo "✅ 500 Error fix completed!"
echo "📝 Next steps:"
echo "1. Check error logs: tail -f storage/logs/laravel.log"
echo "2. Test the user management page"
echo "3. If still having issues, check cPanel error logs"
