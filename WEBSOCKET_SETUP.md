# WebSocket Setup Guide

## Quick Fix for Console Errors

The console errors you're seeing are because WebSocket is disabled by default. Here's how to fix them:

### Option 1: Enable WebSocket (Recommended)

1. **Create a `.env.local` file in your project root:**

    ```bash
    touch .env.local
    ```

2. **Add these lines to `.env.local`:**

    ```env
    VITE_ENABLE_WEBSOCKET=true
    VITE_REVERB_APP_KEY=your-reverb-key
    VITE_REVERB_HOST=localhost
    VITE_REVERB_PORT=8080
    VITE_REVERB_SCHEME=ws
    VITE_REVERB_FORCE_TLS=false
    ```

3. **Start the Laravel Reverb server:**

    ```bash
    php artisan reverb:start
    ```

4. **Restart your frontend development server:**
    ```bash
    npm run dev
    ```

### Option 2: Disable WebSocket (Fallback)

If you don't want to use WebSocket right now, you can disable it:

1. **Create a `.env.local` file in your project root:**

    ```bash
    touch .env.local
    ```

2. **Add this line to `.env.local`:**

    ```env
    VITE_ENABLE_WEBSOCKET=false
    ```

3. **Restart your frontend development server:**
    ```bash
    npm run dev
    ```

## What This Fixes

- ✅ **WebSocket not initialized** errors
- ✅ **TypeError: Cannot read properties of null** errors
- ✅ **AppSidebarHeader component** crashes
- ✅ **Real-time notification** functionality

## Current Status

The system now has **graceful fallback** - if WebSocket fails, it automatically falls back to polling-based notifications. This means:

- 🔄 **Polling Fallback**: Notifications still work (updates every 30 seconds)
- 🚫 **No More Crashes**: App continues to function even if WebSocket fails
- 📱 **Better UX**: Users get notifications regardless of WebSocket status

## Testing

After setup, you should see:

- ✅ No more console errors
- ✅ Smooth app functionality
- ✅ Real-time notifications (if WebSocket enabled)
- ✅ Fallback notifications (if WebSocket disabled)

## Troubleshooting

If you still see errors:

1. **Check browser console** for specific error messages
2. **Verify environment variables** are set correctly
3. **Ensure Reverb server** is running (if using WebSocket)
4. **Clear browser cache** and refresh the page

The system is now **robust and error-resistant**! 🎉
