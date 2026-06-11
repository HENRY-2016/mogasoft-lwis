<?php
// app/Http/Controllers/WelfareController.php

namespace App\Http\Controllers;

use App\Models\AllocationsModel;
use App\Models\EmployeesModel;
use App\Models\RedemptionsModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class WelfareController extends Controller
{
    public function allocations(Request $request)
    {
        try {
            $query = AllocationsModel::with('employee');

            if ($request->has('status') && !empty($request->status)) {
                $query->where('status', $request->status);
            }

            if ($request->has('employee_id') && !empty($request->employee_id)) {
                $query->where('employee_id', $request->employee_id);
            }

            if ($request->has('date_from') && !empty($request->date_from)) {
                $query->where('allocation_date', '>=', $request->date_from);
            }

            if ($request->has('date_to') && !empty($request->date_to)) {
                $query->where('allocation_date', '<=', $request->date_to);
            }

            $allocations = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'message' => 'Allocations fetched successfully',
                'data' => $allocations
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching allocations: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch allocations',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get allocations by employee number
     */
    public function allocationsByEmployee(Request $request, $number)
    {
        try {
            $employee = EmployeesModel::where('employee_number', $number)->first();

            if (!$employee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employee not found'
                ], 404);
            }

            $query = AllocationsModel::with('employee')
                ->where('employee_id', $employee->id);

            if ($request->has('status') && !empty($request->status)) {
                $query->where('status', $request->status);
            }

            if ($request->has('date_from') && !empty($request->date_from)) {
                $query->where('allocation_date', '>=', $request->date_from);
            }

            if ($request->has('date_to') && !empty($request->date_to)) {
                $query->where('allocation_date', '<=', $request->date_to);
            }

            $allocations = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'message' => 'Employee allocations fetched successfully',
                'data' => $allocations
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching employee allocations: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch allocations',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get redemptions by employee number
     */
    public function redemptionsByEmployee(Request $request, $number)
    {
        try {
            $employee = EmployeesModel::where('employee_number', $number)->first();

            if (!$employee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employee not found'
                ], 404);
            }

            $query = RedemptionsModel::with(['welfareAllocation.employee', 'redeemer'])
                ->where('redeemed_by', $employee->id);

            if ($request->has('date_from') && !empty($request->date_from)) {
                $query->whereDate('redemption_time', '>=', $request->date_from);
            }

            if ($request->has('date_to') && !empty($request->date_to)) {
                $query->whereDate('redemption_time', '<=', $request->date_to);
            }

            $redemptions = $query->orderBy('redemption_time', 'desc')->get();

            return response()->json([
                'success' => true,
                'message' => 'Employee redemptions fetched successfully',
                'data' => $redemptions
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching employee redemptions: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch redemptions',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function storeAllocation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'amount' => 'required|numeric|min:0',
            'allocation_date' => 'required|date',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $qrCode = Str::random(32) . time();

            $allocation = AllocationsModel::create([
                'employee_id' => $request->employee_id,
                'amount' => $request->amount,
                'allocation_date' => $request->allocation_date,
                'status' => 'pending',
                'qr_code' => $qrCode,
                'notes' => $request->notes
            ]);

            $allocation->load('employee');

            return response()->json([
                'success' => true,
                'message' => 'Welfare allocation created successfully',
                'data' => $allocation
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating allocation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create allocation',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function issueAllocation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'allocation_id' => 'required|exists:allocations,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $allocation = AllocationsModel::find($request->allocation_id);

            if ($allocation->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Allocation cannot be issued in current status'
                ], 400);
            }

            $allocation->update([
                'status' => 'issued',
                'issued_at' => now()
            ]);

            $allocation->load('employee');

            return response()->json([
                'success' => true,
                'message' => 'Welfare allocation issued successfully',
                'data' => $allocation
            ]);
        } catch (\Exception $e) {
            Log::error('Error issuing allocation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to issue allocation',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Redeem welfare using QR code - FIXED VERSION
     */
    public function redeemWelfare(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'qr_code' => 'required|string|exists:allocations,qr_code',
            'redemption_location' => 'nullable|string|max:255',
            'remarks' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Find the allocation by QR code
            $allocation = AllocationsModel::where('qr_code', $request->qr_code)
                ->lockForUpdate() // Prevent race conditions
                ->first();

            if (!$allocation) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid QR code. Allocation not found.'
                ], 404);
            }

            // Check if allocation is in 'issued' status
            if ($allocation->status !== 'issued') {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'This welfare allocation is not available for redemption. Current status: ' . $allocation->status
                ], 400);
            }

            // Update allocation status
            $allocation->update([
                'status' => 'redeemed',
                'redeemed_at' => now()
            ]);

            // Create redemption record
            $redemption = RedemptionsModel::create([
                'welfare_allocation_id' => $allocation->id,
                'redeemed_by' => $allocation->employee_id,
                'amount_redeemed' => $allocation->amount,
                'redemption_time' => now(),
                'redemption_location' => $request->redemption_location ?? 'Not specified',
                'remarks' => $request->remarks ?? ''
            ]);

            DB::commit();

            // Load relationships for response
            $allocation->load('employee');

            return response()->json([
                'success' => true,
                'message' => 'Welfare redeemed successfully',
                'data' => [
                    'allocation' => $allocation,
                    'redemption' => $redemption
                ]
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error redeeming welfare: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to redeem welfare. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get allocation by QR code
     */
    public function getAllocationByQR($qrCode)
    {
        try {
            $allocation = AllocationsModel::with('employee')
                ->where('qr_code', $qrCode)
                ->first();

            if (!$allocation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Allocation not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $allocation
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching allocation by QR: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch allocation',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function redemptions(Request $request)
    {
        try {
            $query = RedemptionsModel::with(['welfareAllocation.employee', 'redeemer']);

            if ($request->has('date_from') && !empty($request->date_from)) {
                $query->whereDate('redemption_time', '>=', $request->date_from);
            }

            if ($request->has('date_to') && !empty($request->date_to)) {
                $query->whereDate('redemption_time', '<=', $request->date_to);
            }

            if ($request->has('employee_id') && !empty($request->employee_id)) {
                $query->where('redeemed_by', $request->employee_id);
            }

            $redemptions = $query->orderBy('redemption_time', 'desc')->get();

            return response()->json([
                'success' => true,
                'message' => 'Redemptions fetched successfully',
                'data' => $redemptions
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching redemptions: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch redemptions',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get today's redemptions for finance dashboard
     */
    public function todaysRedemptions(Request $request)
    {
        try {
            $today = date('Y-m-d');

            $query = RedemptionsModel::with(['welfareAllocation.employee', 'redeemer'])
                ->whereDate('redemption_time', $today);

            if ($request->has('location') && !empty($request->location)) {
                $query->where('redemption_location', $request->location);
            }

            $redemptions = $query->orderBy('redemption_time', 'desc')->get();

            $totalAmount = $redemptions->sum('amount_redeemed');
            $totalCount = $redemptions->count();

            return response()->json([
                'success' => true,
                'message' => "Today's redemptions fetched successfully",
                'data' => $redemptions,
                'summary' => [
                    'total_count' => $totalCount,
                    'total_amount' => $totalAmount,
                    'date' => $today
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching today\'s redemptions: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch redemptions',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function dashboard()
    {
        try {
            $today = date('Y-m-d');

            $totalEmployees = EmployeesModel::count();
            $activeEmployees = EmployeesModel::where('is_active', true)->count();

            $totalAllocated = AllocationsModel::sum('amount');
            $totalRedeemed = RedemptionsModel::sum('amount_redeemed');
            $pendingAmount = AllocationsModel::where('status', 'pending')->sum('amount');
            $issuedAmount = AllocationsModel::where('status', 'issued')->sum('amount');

            $todayAllocations = AllocationsModel::whereDate('allocation_date', $today)->count();
            $todayRedemptions = RedemptionsModel::whereDate('redemption_time', $today)->count();
            $todayAmountRedeemed = RedemptionsModel::whereDate('redemption_time', $today)->sum('amount_redeemed');

            $recentRedemptions = RedemptionsModel::with(['welfareAllocation.employee'])
                ->orderBy('redemption_time', 'desc')
                ->limit(10)
                ->get();

            $recentAllocations = AllocationsModel::with('employee')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            $statusBreakdown = [
                'pending' => AllocationsModel::where('status', 'pending')->count(),
                'issued' => AllocationsModel::where('status', 'issued')->count(),
                'redeemed' => AllocationsModel::where('status', 'redeemed')->count(),
                'expired' => AllocationsModel::where('status', 'expired')->count()
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'employees' => [
                        'total' => $totalEmployees,
                        'active' => $activeEmployees
                    ],
                    'welfare' => [
                        'total_allocated' => $totalAllocated,
                        'total_redeemed' => $totalRedeemed,
                        'pending_amount' => $pendingAmount,
                        'issued_amount' => $issuedAmount,
                        'unredeemed_balance' => $totalAllocated - $totalRedeemed
                    ],
                    'today' => [
                        'allocations' => $todayAllocations,
                        'redemptions' => $todayRedemptions,
                        'amount_redeemed' => $todayAmountRedeemed
                    ],
                    'status_breakdown' => $statusBreakdown,
                    'recent_redemptions' => $recentRedemptions,
                    'recent_allocations' => $recentAllocations
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching dashboard: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard data',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}
