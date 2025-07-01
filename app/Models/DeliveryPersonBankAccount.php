<?php

namespace App\Models;

use App\Models\ActiveModel;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliveryPersonBankAccount extends ActiveModel
{
    use SoftDeletes, HasUuids;

    protected $table = 'delivery_person_bank_accounts';

    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'delivery_person_id',
        'account_holder_name',
        'account_number',
        'bank_name',
        'branch_name',
        'ifsc_code',
        'account_type',
        'upi_id',
        'is_verified'
    ];

    protected $casts = [
        'is_verified' => 'boolean',
    ];

    /**
     * Get the delivery person that owns the bank account.
     */
    public function deliveryPerson(): BelongsTo
    {
        return $this->belongsTo(DeliveryPerson::class, 'delivery_person_id', 'id');
    }

    /**
     * Get the masked account number for display.
     */
    public function getMaskedAccountNumberAttribute(): string
    {
        return 'XXXXXX' . substr($this->account_number, -4);
    }

    /**
     * Scope a query to only include verified accounts.
     */
    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }
}
