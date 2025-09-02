<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category_id',
        'transaction_type_id',
        'related_transaction_id',
        'date',
        'description',
        'type',
        'amount',
        'currency',
        'source',
        'notes',
        'status',

        'metadata',
        'settled_amount',
        'settled_at',
    ];

    protected $casts = [
        'settled_amount' => 'decimal:2',
        'settled_at' => 'datetime',
        'date' => 'date:Y-m-d',
        'amount' => 'decimal:2',

        'metadata' => 'array',
    ];

    /**
     * Get the user that owns the transaction.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the category that owns the transaction.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function transactionType(): BelongsTo
    {
        return $this->belongsTo(TransactionType::class);
    }

    public function relatedTransaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class, 'related_transaction_id');
    }

    public function settlements(): HasMany
    {
        return $this->hasMany(Transaction::class, 'related_transaction_id');
    }

    public function scopePayable($query)
    {
        return $query->whereHas('transactionType', function ($q) {
            $q->where('name', 'payable');
        });
    }

    public function scopeReceivable($query)
    {
        return $query->whereHas('transactionType', function ($q) {
            $q->where('name', 'receivable');
        });
    }

    /**
     * Scope a query to only include transactions of a given type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope a query to only include transactions for a given user.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope a query to only include transactions within a date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Get the formatted amount with currency symbol.
     */
    public function getFormattedAmountAttribute()
    {
        // You can customize this based on currency
        $symbols = [
            'USD' => '$',
            'EUR' => '€',
            'KWD' => 'د.ك',
            'GBP' => '£',
        ];

        $symbol = $symbols[$this->currency] ?? $this->currency;
        return $symbol . number_format($this->amount, 2);
    }
}
