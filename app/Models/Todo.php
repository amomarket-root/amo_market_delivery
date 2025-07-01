<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Models\ActiveModel;

class Todo extends ActiveModel
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $table = 'todos'; // Table name
    protected $primaryKey = 'id';    // Primary key field

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'completed',
        'user_id',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'completed' => 'boolean',
    ];

    /**
     * Define the relationship to the user who owns the to-do.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
