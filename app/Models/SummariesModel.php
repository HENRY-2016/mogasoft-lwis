<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SummariesModel extends Model
{
    protected $table = 'summaries';

    protected $fillable = [
        'summary_date',
        'total_allocations',
        'total_amount_allocated',
        'total_redeemed',
        'total_amount_redeemed',
        'total_pending',
        'total_amount_pending'
    ];

    protected $casts = [
        'summary_date' => 'date',
        'total_amount_allocated' => 'decimal:2',
        'total_amount_redeemed' => 'decimal:2',
        'total_amount_pending' => 'decimal:2'
    ];
}
