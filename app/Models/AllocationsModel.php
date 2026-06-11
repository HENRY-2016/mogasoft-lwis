<?php
// app/Models/AllocationsModel.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AllocationsModel extends Model
{
    protected $table = 'allocations';

    protected $fillable = [
        'employee_id',
        'amount',
        'allocation_date',
        'status',
        'qr_code',
        'notes',
        'issued_at',
        'redeemed_at'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'allocation_date' => 'date',
        'issued_at' => 'datetime',
        'redeemed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function employee()
    {
        return $this->belongsTo(EmployeesModel::class, 'employee_id');
    }

    // Fix: Change from hasOne to hasMany since an allocation can have one redemption
    // But we're keeping it as a collection for consistency
    public function redemptions()
    {
        return $this->hasMany(RedemptionsModel::class, 'welfare_allocation_id');
    }

    // Add this for getting the single redemption
    public function redemption()
    {
        return $this->hasOne(RedemptionsModel::class, 'welfare_allocation_id')->latest();
    }
}
