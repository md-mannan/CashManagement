<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TransactionType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'direction',
    ];

    /**
     * Get the transactions for this type.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Scope a query to only include incoming transaction types.
     */
    public function scopeIncoming($query)
    {
        return $query->where('direction', 'incoming');
    }

    /**
     * Scope a query to only include outgoing transaction types.
     */
    public function scopeOutgoing($query)
    {
        return $query->where('direction', 'outgoing');
    }

    /**
     * Scope a query to only include neutral transaction types.
     */
    public function scopeNeutral($query)
    {
        return $query->where('direction', 'neutral');
    }
}
