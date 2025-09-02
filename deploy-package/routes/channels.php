<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

// User-specific notification channel
Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Admin notifications channel
Broadcast::channel('admin.notifications', function ($user) {
    return in_array($user->role, ['admin', 'super_admin']);
});

// Super admin notifications channel
Broadcast::channel('super-admin.notifications', function ($user) {
    return $user->role === 'super_admin';
});

// User presence channel (for online status)
Broadcast::channel('user.presence.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Admin presence channel
Broadcast::channel('admin.presence', function ($user) {
    return in_array($user->role, ['admin', 'super_admin']);
});
