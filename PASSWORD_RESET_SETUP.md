# Password Reset Setup Guide

This guide will help you set up the password reset functionality with email support for the Cash Management System.

## ✅ What's Already Implemented

The following components are already set up and ready to use:

### 1. **Frontend Pages**
- **Forgot Password Page**: `/forgot-password` - Users enter their email
- **Reset Password Page**: `/reset-password` - Users set new password with token
- **Custom Email Template**: Professional design matching the system branding

### 2. **Backend Controllers**
- **PasswordResetLinkController**: Handles email requests
- **NewPasswordController**: Handles password reset with token
- **Custom Notification**: `ResetPasswordNotification` with custom email template

### 3. **User Model**
- Password reset functionality enabled
- Custom notification method implemented
- Proper interfaces and traits added

## 🔧 Setup Instructions

### Step 1: Configure Email Settings

#### For Local Development (Testing)
```bash
# Use log driver to see emails in Laravel log files
MAIL_MAILER=log
MAIL_FROM_ADDRESS="noreply@cashmanagement.com"
MAIL_FROM_NAME="Cash Management System"
```

#### For Production (Gmail Example)
```bash
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@cashmanagement.com"
MAIL_FROM_NAME="Cash Management System"
```

### Step 2: Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in your `.env` file

### Step 3: Test Email Functionality

```bash
# Test the email setup
php artisan mail:test your-email@example.com
```

### Step 4: Verify Routes

The following routes should be available:
- `GET /forgot-password` - Forgot password form
- `POST /forgot-password` - Send reset email
- `GET /reset-password/{token}` - Reset password form
- `POST /reset-password` - Update password

## 🧪 Testing the Password Reset Flow

### 1. **Request Password Reset**
1. Go to `/forgot-password`
2. Enter your email address
3. Click "Send Reset Link"
4. Check your email (and spam folder)

### 2. **Reset Password**
1. Click the reset link in your email
2. Enter your new password
3. Confirm the password
4. Click "Reset Password"
5. You'll be redirected to login

## 📧 Email Template Features

The custom email template includes:
- **Professional Design**: Matches system branding
- **Security Warnings**: Clear security notices
- **Expiry Information**: 60-minute link expiry
- **Fallback URL**: Text link if button doesn't work
- **Responsive Design**: Works on all devices

## 🔒 Security Features

- **Token Expiry**: Links expire after 60 minutes
- **One-time Use**: Tokens are invalidated after use
- **Secure Tokens**: Cryptographically secure random tokens
- **Rate Limiting**: Built-in protection against abuse
- **Email Validation**: Only sends to registered emails

## 🛠️ Troubleshooting

### Email Not Sending
1. **Check Mail Configuration**:
   ```bash
   php artisan config:clear
   php artisan mail:test your-email@example.com
   ```

2. **Gmail Issues**:
   - Use App Password instead of regular password
   - Enable "Less secure app access" (not recommended)
   - Check if 2FA is properly configured

3. **Check Logs**:
   ```bash
   tail -f storage/logs/laravel.log
   ```

### Password Reset Link Not Working
1. **Check Token Validity**: Links expire after 60 minutes
2. **Verify Email**: Ensure email matches registered account
3. **Check URL**: Make sure the reset URL is correct

### Frontend Issues
1. **Clear Cache**:
   ```bash
   php artisan route:clear
   php artisan config:clear
   npm run build
   ```

2. **Check Console**: Look for JavaScript errors in browser console

## 📝 Environment Variables

Add these to your `.env` file:

```bash
# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@cashmanagement.com"
MAIL_FROM_NAME="Cash Management System"

# App Configuration
APP_URL=http://localhost:8000
APP_NAME="Cash Management System"
```

## 🚀 Production Deployment

For production deployment:

1. **Use Professional Email Service**:
   - Amazon SES
   - Mailgun
   - Postmark
   - SendGrid

2. **Configure Environment**:
   ```bash
   MAIL_MAILER=smtp
   MAIL_HOST=your-smtp-host
   MAIL_PORT=587
   MAIL_USERNAME=your-email
   MAIL_PASSWORD=your-password
   MAIL_ENCRYPTION=tls
   ```

3. **Test Thoroughly**:
   ```bash
   php artisan mail:test admin@yourdomain.com
   ```

## 📞 Support

If you encounter issues:
1. Check the Laravel logs: `storage/logs/laravel.log`
2. Verify email configuration in `.env`
3. Test with the mail test command
4. Ensure all routes are properly registered

The password reset functionality is now fully implemented and ready to use!
