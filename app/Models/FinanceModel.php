<?php
// app/Models/FinanceModel.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class FinanceModel extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'finance_users';

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

    /**
     * Get the department that the finance user belongs to.
     */
    public function departmentRelation()
    {
        return $this->belongsTo(DepartmentModel::class, 'department_id');
    }

    /**
     * Scope a query to only include active users.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to filter by department.
     */
    public function scopeByDepartment($query, $departmentId)
    {
        return $query->where('department', $departmentId);
    }
}
