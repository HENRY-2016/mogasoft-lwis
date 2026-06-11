<?php
// app/Models/EmployeesModel.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class EmployeesModel extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'employees';

    protected $fillable = [
        'employee_number',
        'name',
        'email',
        'password',
        'phone',
        'department',
        'position',
        'is_active',
        'last_login_at'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'last_login_at' => 'datetime'
    ];

    public function welfareAllocations()
    {
        return $this->hasMany(AllocationsModel::class);
    }

    public function redemptions()
    {
        return $this->hasMany(RedemptionsModel::class, 'redeemed_by');
    }

    public function departmentRelation()
    {
        return $this->belongsTo(DepartmentModel::class, 'department_id');
    }

    public function getTotalAllocatedAttribute()
    {
        return $this->welfareAllocations()->sum('amount');
    }

    public function getTotalRedeemedAttribute()
    {
        return $this->redemptions()->sum('amount_redeemed');
    }

    public function getBalanceAttribute()
    {
        return $this->total_allocated - $this->total_redeemed;
    }
}
