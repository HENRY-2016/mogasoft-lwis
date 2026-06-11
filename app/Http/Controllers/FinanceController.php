<?php
// app/Http/Controllers/FinanceController.php

namespace App\Http\Controllers;

use App\Models\FinanceModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;

class FinanceController extends Controller
{
    /**
     * Display a listing of finance users.
     */
    public function index(Request $request)
    {
        try {
            $query = FinanceModel::query();

            // Search filter
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('employee_number', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // Department filter
            if ($request->has('department') && !empty($request->department)) {
                $query->where('department', $request->department);
            }

            // Status filter
            if ($request->has('is_active') && $request->is_active !== '') {
                $query->where('is_active', $request->is_active);
            }

            $users = $query->orderBy('name')->get()
                ->makeHidden(['password', 'remember_token']);

            return response()->json([
                'success' => true,
                'message' => 'Finance users fetched successfully',
                'data' => $users
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching finance users: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch finance users',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Store a new finance user.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_number' => 'required|unique:finance_users,employee_number',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:finance_users,email',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
            'department' => 'required',
            'position' => 'nullable|string|max:100',
            'is_active' => 'boolean'
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
            $userData = $request->all();
            $userData['password'] = Hash::make($request->password);

            $user = FinanceModel::create($userData);

            DB::commit();

            // Hide sensitive data in response
            $user->makeHidden(['password', 'remember_token']);

            return response()->json([
                'success' => true,
                'message' => 'Finance user created successfully',
                'data' => $user
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating finance user: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create finance user',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Display the specified finance user.
     */
    public function show($id)
    {
        try {
            $user = FinanceModel::find($id);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Finance user not found'
                ], 404);
            }

            // Hide sensitive data
            $user->makeHidden(['password', 'remember_token']);

            return response()->json([
                'success' => true,
                'message' => 'Finance user fetched successfully',
                'data' => $user
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching finance user: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch finance user',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Update the specified finance user.
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_number' => 'required|unique:finance_users,employee_number,' . $request->updateId,
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:finance_users,email,' . $request->updateId,
            'phone' => 'nullable|string|max:20',
            'department' => 'required',
            'position' => 'nullable|string|max:100',
            'is_active' => 'boolean',
            'password' => 'nullable|string|min:8',
            'updateId' => 'required|exists:finance_users,id'
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
            $user = FinanceModel::find($request->updateId);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Finance user not found'
                ], 404);
            }

            $userData = $request->except('password', 'updateId');

            // Only update password if provided
            if ($request->filled('password')) {
                $userData['password'] = Hash::make($request->password);
            }

            $user->update($userData);

            DB::commit();

            // Hide sensitive data
            $user->makeHidden(['password', 'remember_token']);

            return response()->json([
                'success' => true,
                'message' => 'Finance user updated successfully',
                'data' => $user
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating finance user: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update finance user',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Remove the specified finance user.
     */
    public function destroy(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'updateId' => 'required|exists:finance_users,id'
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
            $user = FinanceModel::find($request->updateId);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Finance user not found'
                ], 404);
            }

            // Revoke all tokens before deleting
            $user->tokens()->delete();
            $user->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Finance user deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting finance user: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete finance user',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Finance user login.
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
            'device_name' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = FinanceModel::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials'
                ], 401);
            }

            if (!$user->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your account has been deactivated. Please contact administrator.'
                ], 403);
            }

            // Update last login timestamp
            $user->update(['last_login_at' => now()]);

            // Create token
            $deviceName = $request->device_name ?? 'web';
            $token = $user->createToken($deviceName)->plainTextToken;

            $userData = $user->fresh();
            $userData->makeHidden(['password', 'remember_token']);

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'user' => $userData,
                    'token' => $token,
                    'token_type' => 'Bearer'
                ]
            ], 200);
        } catch (\Exception $e) {
            Log::error('Finance user login error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Login failed',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Finance user logout.
     */
    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Finance user logout error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Logout failed'
            ], 500);
        }
    }

    /**
     * Change password.
     */
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
            'user_id' => 'required|exists:finance_users,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = FinanceModel::find($request->user_id);

            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current password is incorrect'
                ], 400);
            }

            $user->update([
                'password' => Hash::make($request->new_password)
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Password changed successfully'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error changing finance user password: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to change password'
            ], 500);
        }
    }

    /**
     * Get finance user profile.
     */
    public function profile(Request $request)
    {
        try {
            $user = $request->user();
            $user->makeHidden(['password', 'remember_token']);

            return response()->json([
                'success' => true,
                'message' => 'Profile fetched successfully',
                'data' => $user
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching finance user profile: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch profile'
            ], 500);
        }
    }
}
