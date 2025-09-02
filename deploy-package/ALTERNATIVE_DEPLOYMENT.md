# Alternative Deployment Method (No SSH Required)

If your cPanel hosting doesn't provide SSH access, you can use these alternative methods:

## Method 1: Browser-based Migration
1. Upload all files to your cPanel hosting
2. Create a temporary route for migrations by adding this to your routes/web.php:
   ```php
   Route::get('/migrate', function () {
       Artisan::call('migrate', ['--force' => true]);
       return 'Migrations completed successfully!';
   });
   ```
3. Visit https://yourdomain.com/migrate
4. Remove the migration route after successful migration

## Method 2: phpMyAdmin Import
1. Export your local database structure and data
2. Import via phpMyAdmin in cPanel
3. Update .env file with your database credentials

## Method 3: Contact Hosting Support
Many hosting providers can run migrations for you if you provide the migration files.

## Important:
- Always backup your database before making changes
- Test on a staging environment first if possible
- Remove any temporary routes after deployment
