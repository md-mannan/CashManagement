<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ProfilePhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'is_current',
    ];

    protected $casts = [
        'is_current' => 'boolean',
    ];

    /**
     * Get the user that owns the profile photo.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the photo URL.
     */
    public function getUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->file_path);
    }

    /**
     * Scope to get current photo.
     */
    public function scopeCurrent($query)
    {
        return $query->where('is_current', true);
    }

    /**
     * Scope to get non-current photos.
     */
    public function scopeHistory($query)
    {
        return $query->where('is_current', false);
    }
}
