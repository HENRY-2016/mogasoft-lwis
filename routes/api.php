<?php

use App\Http\Controllers\EmployeesController;
use App\Http\Controllers\WelfareController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\FinanceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Employee routes
Route::prefix('employees')->group(function () {
    Route::get('/list', [EmployeesController::class, 'index']);
    Route::get('/names', [EmployeesController::class, 'names']);
    Route::post('/store', [EmployeesController::class, 'store']);
    Route::get('/departments', [EmployeesController::class, 'getDepartments']);
    Route::get('/show/{id}', [EmployeesController::class, 'show']);
    Route::post('/update', [EmployeesController::class, 'update']);
    Route::post('/delete', [EmployeesController::class, 'destroy']);
});

// Employee routes
Route::prefix('employees')->group(function () {
        // Public routes
        Route::post('/login', [EmployeesController::class, 'login']);
        Route::get('/list', [EmployeesController::class, 'index']);
        Route::get('/names', [EmployeesController::class, 'names']);
        Route::post('/store', [EmployeesController::class, 'store']);
        Route::get('/departments', [EmployeesController::class, 'getDepartments']);
        Route::get('/show/{id}', [EmployeesController::class, 'show']);
        Route::post('/update', [EmployeesController::class, 'update']);
        Route::post('/delete', [EmployeesController::class, 'destroy']);

        // Auth routes
        Route::post('/logout', [EmployeesController::class, 'logout']);
        Route::post('/logout-all', [EmployeesController::class, 'logoutAll']);
        Route::get('/profile', [EmployeesController::class, 'profile']);
});


// User routes
Route::prefix('user')->group(function () {
    Route::post('/login', [UserController::class, 'login']);
    Route::post('/register', [UserController::class, 'register']);
    Route::post('/logout', [UserController::class, 'logout']);
    Route::get('/users', [UserController::class, 'index']);
});

// Welfare routes
Route::prefix('welfare')->group(function () {
    Route::get('/dashboard', [WelfareController::class, 'dashboard']);

    // Allocations
    Route::get('/allocations', [WelfareController::class, 'allocations']);
    Route::post('/allocations', [WelfareController::class, 'storeAllocation']);
    Route::post('/allocations/issue', [WelfareController::class, 'issueAllocation']);
    Route::get('/allocations/qr/{qrCode}', [WelfareController::class, 'getAllocationByQR']);
    Route::get('/allocations-by-employee/{number}', [WelfareController::class, 'allocationsByEmployee']);

    // Redemptions
    Route::post('/redeem', [WelfareController::class, 'redeemWelfare']);
    Route::get('/redemptions', [WelfareController::class, 'redemptions']);
    Route::get('/redemptions/today', [WelfareController::class, 'todaysRedemptions']);
    Route::get('/redemptions-by-employee/{number}', [WelfareController::class, 'redemptionsByEmployee']);
});

// Department routes
Route::prefix('department')->group(function () {
    Route::get('/list', [DepartmentController::class, 'index']);
    Route::get('/names', [DepartmentController::class, 'names']);
    Route::post('/store', [DepartmentController::class, 'store']);
    Route::get('/show/{id}', [DepartmentController::class, 'show']);
    Route::post('/update', [DepartmentController::class, 'update']);
    Route::post('/delete', [DepartmentController::class, 'destroy']);
});

// Finance routes
Route::prefix('finance')->group(function () {
    Route::post('/login', [FinanceController::class, 'login']);
    Route::get('/list', [FinanceController::class, 'index']);
    Route::post('/store', [FinanceController::class, 'store']);
    Route::get('/show/{id}', [FinanceController::class, 'show']);
    Route::post('/update', [FinanceController::class, 'update']);
    Route::post('/delete', [FinanceController::class, 'destroy']);

    // Auth routes
    Route::post('/logout', [FinanceController::class, 'logout']);
    Route::get('/profile', [FinanceController::class, 'profile']);
    Route::post('/change-password', [FinanceController::class, 'changePassword']);
});
