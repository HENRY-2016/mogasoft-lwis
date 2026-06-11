<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RedemptionsModel extends Model
{
    protected $table = 'redemptions';
    protected $fillable = [
        'welfare_allocation_id',
        'redeemed_by',
        'amount_redeemed',
        'redemption_time',
        'redemption_location',
        'remarks'
    ];

    protected $casts = [
        'amount_redeemed' => 'decimal:2',
        'redemption_time' => 'datetime'
    ];

    public function welfareAllocation()
    {
        return $this->belongsTo(AllocationsModel::class);
    }

    public function redeemer()
    {
        return $this->belongsTo(EmployeesModel::class, 'redeemed_by');
    }
}

