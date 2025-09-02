<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificationSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $notification;

    /**
     * Create a new event instance.
     */
    public function __construct(Notification $notification)
    {
        $this->notification = $notification;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        // Broadcast to specific user's private channel
        $channels = [
            new PrivateChannel('user.' . $this->notification->user_id),
        ];

        // If it's an admin notification, also broadcast to admin channels
        if (in_array($this->notification->type, ['user_created', 'user_updated', 'user_deleted', 'role_changed'])) {
            $channels[] = new PrivateChannel('admin.notifications');
            $channels[] = new PrivateChannel('super-admin.notifications');
        }

        return $channels;
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->notification->id,
            'type' => $this->notification->type,
            'title' => $this->notification->title,
            'message' => $this->notification->message,
            'color' => $this->notification->color,
            'is_important' => $this->notification->is_important,
            'is_read' => $this->notification->is_read,
            'time_ago' => $this->notification->created_at->diffForHumans(),
            'created_at' => $this->notification->created_at->toISOString(),
            'user' => [
                'id' => $this->notification->user->id,
                'name' => $this->notification->user->name,
                'email' => $this->notification->user->email,
                'role' => $this->notification->user->role,
            ],
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'notification.sent';
    }
}
