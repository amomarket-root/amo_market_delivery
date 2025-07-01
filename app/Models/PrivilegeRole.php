<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Models\ActiveModel;
class PrivilegeRole extends ActiveModel
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $table = 'privilege_role'; // Table name
    protected $primaryKey = 'id';    // Primary key field
    protected $fillable = [
        'role_id',
        'privilege_id',
    ];
}
