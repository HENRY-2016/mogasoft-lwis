// src/apiServices/authService.js
import axios from 'axios';
import { APIUserLogin, APIUserLogout, BASE_URL } from './APIs';

// Storage keys
const USER_INFO_KEY = 'userInfo';

class AuthService {
    constructor() {
        this.api = axios.create({
            baseURL: BASE_URL,
            timeout: 30000,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });
    }

    /**
     * Login user
     */
    async login(email, password) {
        try {
            const response = await this.api.post(APIUserLogin, {
                email,
                password
            });

            if (response.data.success) {
                // Store user info in sessionStorage
                const userData = response.data.data;
                if (userData) {
                    userData.role = 'admin'; // Add role for admin users
                    sessionStorage.setItem(USER_INFO_KEY, JSON.stringify(userData));
                }
                
                return {
                    success: true,
                    data: userData,
                    message: response.data.message
                };
            } else {
                return {
                    success: false,
                    message: response.data.message
                };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            await this.api.post(APIUserLogout);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearUserData();
        }
    }

    /**
     * Clear user data from storage
     */
    clearUserData() {
        sessionStorage.removeItem(USER_INFO_KEY);
    }

    /**
     * Get current user from storage
     */
    getCurrentUser() {
        const userInfo = sessionStorage.getItem(USER_INFO_KEY);
        if (!userInfo) return null;
        
        try {
            return JSON.parse(userInfo);
        } catch (error) {
            console.error('Error parsing user info:', error);
            return null;
        }
    }

    /**
     * Get user role
     */
    getUserRole() {
        const user = this.getCurrentUser();
        return user ? user.role : null;
    }

    /**
     * Get user ID
     */
    getUserId() {
        const user = this.getCurrentUser();
        return user ? user.id : null;
    }

    /**
     * Get user name
     */
    getUserName() {
        const user = this.getCurrentUser();
        return user ? user.name : null;
    }

    /**
     * Get user email
     */
    getUserEmail() {
        const user = this.getCurrentUser();
        return user ? user.email : null;
    }

    /**
     * Get user token
     */
    getUserToken() {
        const user = this.getCurrentUser();
        return user ? user.token : null;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const user = this.getCurrentUser();
        return !!user;
    }

    /**
     * Check if user has specific role
     */
    hasRole(role) {
        return this.getUserRole() === role;
    }

    /**
     * Check if user is admin
     */
    isAdmin() {
        return this.hasRole('admin');
    }

    /**
     * Check if user is employee
     */
    isEmployee() {
        return this.hasRole('employee');
    }

    /**
     * Check if user is finance
     */
    isFinance() {
        return this.hasRole('finance');
    }

    /**
     * Get axios instance
     */
    getApi() {
        return this.api;
    }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;