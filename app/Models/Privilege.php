<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Models\ActiveModel;

class Privilege extends ActiveModel
{

    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $table = 'privileges'; // Table name
    protected $primaryKey = 'id';    // Primary key field
    protected $fillable = [
        'name',
        'description',
    ];

    public function privileges_ids()
    {
        return $this->hasMany(PrivilegeRole::class);
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'privilege_role', 'privilege_id', 'role_id');
    }
}
