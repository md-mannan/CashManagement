# Social Authentication Setup Guide

This guide will help you set up social authentication for Facebook, Google, and GitHub in your Cash Management application.

## Prerequisites

- Laravel Socialite is already installed and configured
- Social authentication routes are set up
- Database migrations have been run

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Social Authentication
ENABLE_SOCIAL_LOGIN=true

# Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
FACEBOOK_REDIRECT_URI=http://localhost:8000/auth/facebook/callback

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:8000/auth/github/callback
```

## Setup Instructions

### 1. Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Add Facebook Login product to your app
4. Configure OAuth redirect URIs
5. Copy the App ID and App Secret to your `.env` file

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
5. Configure OAuth consent screen
6. Add authorized redirect URIs
7. Copy the Client ID and Client Secret to your `.env` file

### 3. GitHub OAuth Setup

1. Go to [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details
4. Set the Authorization callback URL
5. Copy the Client ID and Client Secret to your `.env` file

## Testing

1. Clear your configuration cache: `php artisan config:clear`
2. Visit the login or register page
3. Click on any social authentication button
4. You should be redirected to the respective OAuth provider
5. After authorization, you'll be redirected back and logged in

## Troubleshooting

### Common Issues

1. **"Social authentication failed" error**
    - Check if all environment variables are set correctly
    - Verify OAuth redirect URIs match exactly
    - Check Laravel logs for detailed error messages

2. **"Unable to connect to provider" error**
    - Verify the OAuth app is properly configured
    - Check if the provider's API is accessible
    - Ensure the app is not in development mode (for production)

3. **User creation fails**
    - Check database migrations have been run
    - Verify the User model has all required fields
    - Check database connection and permissions

### Debug Mode

Enable debug mode in your `.env` file to see detailed error messages:

```env
APP_DEBUG=true
```

### Logs

Check Laravel logs for detailed error information:

```bash
tail -f storage/logs/laravel.log
```

## Security Notes

- Never commit your OAuth credentials to version control
- Use environment variables for all sensitive information
- Regularly rotate your OAuth secrets
- Monitor OAuth usage and implement rate limiting if needed
- Consider implementing additional security measures like 2FA

## Production Deployment

When deploying to production:

1. Update redirect URIs to use your production domain
2. Ensure HTTPS is enabled
3. Set `APP_ENV=production` and `APP_DEBUG=false`
4. Verify all environment variables are set on your production server
5. Test social authentication thoroughly before going live
