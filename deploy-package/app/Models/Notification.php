<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Events\NotificationSent;
use App\Events\NotificationRead;
use App\Events\NotificationDeleted;
use Carbon\Carbon;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'icon',
        'color',
        'data',
        'read_at',
        'is_important',
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
        'is_important' => 'boolean',
    ];

    /**
     * Get the user that owns the notification.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to only include unread notifications.
     */
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    /**
     * Scope a query to only include read notifications.
     */
    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    /**
     * Scope a query to only include important notifications.
     */
    public function scopeImportant($query)
    {
        return $query->where('is_important', true);
    }

    /**
     * Mark the notification as read.
     */
    public function markAsRead()
    {
        $this->update(['read_at' => Carbon::now()]);

        // Dispatch real-time notification read event
        event(new NotificationRead($this));
    }

    /**
     * Mark the notification as unread.
     */
    public function markAsUnread()
    {
        $this->update(['read_at' => null]);
    }

    /**
     * Check if the notification is read.
     */
    public function isRead(): bool
    {
        return !is_null($this->read_at);
    }

    /**
     * Check if the notification is unread.
     */
    public function isUnread(): bool
    {
        return is_null($this->read_at);
    }

    /**
     * Get formatted time ago.
     */
    public function getTimeAgoAttribute(): string
    {
        return $this->created_at->diffForHumans();
    }

    /**
     * Create a new notification for a user.
     */
    public static function createForUser(
        int $userId,
        string $type,
        string $title,
        string $message,
        array $options = []
    ): self {
        $notification = self::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'icon' => $options['icon'] ?? null,
            'color' => $options['color'] ?? self::getDefaultColor($type),
            'data' => $options['data'] ?? null,
            'is_important' => $options['is_important'] ?? false,
        ]);

        // Dispatch real-time notification event
        event(new NotificationSent($notification));

        return $notification;
    }

    /**
     * Get default color based on notification type.
     */
    private static function getDefaultColor(string $type): string
    {
        return match ($type) {
            'success' => 'green',
            'error' => 'red',
            'warning' => 'yellow',
            'info' => 'blue',
            default => 'blue',
        };
    }

    /**
     * Boot method to handle model events
     */
    protected static function boot()
    {
        parent::boot();

        static::deleted(function ($notification) {
            // Dispatch real-time notification deleted event
            event(new NotificationDeleted($notification->id, $notification->user_id));
        });
    }
}
