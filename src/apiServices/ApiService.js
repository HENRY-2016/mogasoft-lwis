// src/services/ApiService.js
import { authService } from './authService';
import { getUserDetails } from "../utils/helpers";

import {
    connectionErrorMsg,
    Message_400,
    Message_401,
    Message_403,
    Message_404,
    Message_405,
    Message_409,
    Message_422,
    Message_500,
    Message_503
} from './errorMsgs';

class ApiService {
    constructor() {
        this.showToast = null;
    }

    /**
     * Get the authenticated axios instance
     */
    getApi() {
        return authService.getApi();
    }

    /**
     * Set the toast function from useToast hook
     */
    setToastFunction(toastFunction) {
        this.showToast = toastFunction;
    }

    /**
     * Handle API errors consistently based on backend controller structure
     */
    handleError(error, defaultMessage = 'Operation failed') {
        let message = defaultMessage;
        let statusCode = null;
        let errors = null;
        let isIntegrityConstraint = false;
        let isDatabaseError = false;
        let errorData = null;

        if (error.response) {
            statusCode = error.response.status;
            const responseData = error.response.data || {};
            errorData = responseData;
            message = responseData.message || defaultMessage;
            errors = responseData.errors || null;

            const backendError = responseData.error || '';
            isIntegrityConstraint = backendError.includes('Integrity constraint violation') ||
                                backendError.includes('foreign key constraint fails') ||
                                backendError.includes('1451') ||
                                backendError.includes('Integrity constraint');
            
            isDatabaseError = backendError.includes('Database Error') || 
                           responseData.message?.includes('Database Error') ||
                           backendError.includes('SQLSTATE') ||
                           backendError.includes('QueryException');

            switch (statusCode) {
                case 400:
                    if (responseData.message) {message = responseData.message;}
                    else {message = Message_400;}
                    break;
                case 401:
                    message = message || Message_401;
                    break;
                case 403:
                    message = message || Message_403;
                    break;
                case 404:
                    message = message || Message_404;
                    break;
                case 405:
                    message = message || Message_405;
                    break;
                case 409:
                    if (responseData.message && responseData.message.includes('already exists')) {
                        message = responseData.message;
                    } else {
                        message = message || Message_409;
                    }
                    break;
                case 422:
                    if (errors) {
                        const errorMessages = Object.values(errors)
                            .flat()
                            .map(err => `• ${err}`)
                            .join('\n');
                        message = `${responseData.message || 'Validation failed'}:\n${errorMessages}`;
                    }
                    else {message = responseData.message || Message_422;}
                    break;
                case 500:
                    if (isIntegrityConstraint) {
                        message = 'Cannot perform this action because it has related records. ' +
                                'Please delete the related records first.';
                    } 
                    else if (isDatabaseError) {
                        message = 'A database error occurred. Please try again.';
                        
                        if (backendError) {
                            const dbErrorMatch = backendError.match(/(?:SQLSTATE\[\d+\]\s*\[.*?\]\s*)?(.*)/);
                            if (dbErrorMatch && dbErrorMatch[1]) {
                                const dbMessage = dbErrorMatch[1];
                                message = this.extractUserFriendlyErrorMessage(dbMessage);
                            }
                        }
                    }
                    else {message = message || Message_500;}
                    break;
                case 503:
                    message = message || Message_503;
                    break;
                default:
                    message = message || `Server error (${statusCode})`;
            }
        } else if (error.request) {
            message = connectionErrorMsg;
        } else {
            message = error.message || defaultMessage;
        }

        if (this.showToast) {
            this.showToast("Error", message, "error");
        } else {
            console.warn('Toast function not set. Message:', message);
        }

        return {
            success: false,
            message,
            statusCode,
            errors,
            isIntegrityConstraint,
            isDatabaseError,
            error: errorData || error
        };
    }

    /**
     * Extract user-friendly error message from database error
     */
    extractUserFriendlyErrorMessage(dbMessage) {
        const errorPatterns = [
            { pattern: /cannot be null/i, message: 'Required field cannot be empty' },
            { pattern: /duplicate entry/i, message: 'This record already exists' },
            { pattern: /foreign key constraint/i, message: 'Cannot delete this record because it has related records' },
            { pattern: /data too long/i, message: 'Input is too long for the field' },
            { pattern: /invalid date/i, message: 'Invalid date format' },
            { pattern: /incorrect integer value/i, message: 'Invalid number format' },
            { pattern: /unknown column/i, message: 'Unknown column in the table' },
            { pattern: /table.*?doesn't exist/i, message: 'System configuration error' },
            { pattern: /connection refused/i, message: 'Cannot connect to database' },
            { pattern: /access denied/i, message: 'Database access denied' },
            { pattern: /out of range/i, message: 'Value is out of acceptable range' },
            { pattern: /division by zero/i, message: 'Mathematical calculation error' },
            { pattern: /unique constraint/i, message: 'This value must be unique' },
        ];

        for (const pattern of errorPatterns) {
            if (pattern.pattern.test(dbMessage)) {
                return pattern.message;
            }
        }

        return 'A database error occurred. Please check your input and try again.';
    }

    /**
     * Format error messages from backend errors object
     */
    formatErrorMessages(errors) {
        if (!errors) return '';
        return Object.values(errors)
            .flat()
            .map(err => `• ${err}`)
            .join('\n');
    }

    async dashbord(API) {
    try {
        const api = this.getApi();
        const response = await api.get(API);
        const responseData = response.data;

        if (responseData.success) {
            console.log("responseData.data =====>", responseData.data);

            return {
                success: true,
                data: responseData.data, // ✅ FIXED
                message: responseData.message || 'Records fetched successfully'
            };
        } else {
            const errorMessage = responseData.message || 'Failed to fetch records';
            if (this.showToast) {
                this.showToast("Error", errorMessage, "error");
            }
            return {
                success: false,
                data: responseData.data || null,
                message: errorMessage,
                statusCode: response.status
            };
        }
    } catch (error) {
        return this.handleError(error, 'Failed to fetch records');
    }
}

    /**
     * Get list with full details (for tables) - Generic method
     */
    async list(API) {
        try {

            const api = this.getApi();
            const response = await api.get(API);
            const responseData = response.data;

            if (responseData.success) {
                const data = Array.isArray(responseData.data) ? responseData.data : [];
                console.log("responseData.data =====>"+JSON.stringify(responseData.data))
                return {
                    success: true,
                    data: data,
                    message: responseData.message || 'Records fetched successfully'
                };
            } else {
                const errorMessage = responseData.message || 'Failed to fetch records';
                if (this.showToast) {
                    this.showToast("Error", errorMessage, "error");
                }
                return {
                    success: false,
                    data: responseData.data || null,
                    message: errorMessage,
                    statusCode: response.status
                };
            }
        } catch (error) {
            return this.handleError(error, 'Failed to fetch records');
        }
    }

    /**
     * Get list with full details (for tables) - Generic method with ID parameter
     */
    async listById(API, codeId) {
        try {

            const api = this.getApi();
            const response = await api.get(API + "/" + codeId);
            const responseData = response.data;

            if (responseData.success) {
                const data = Array.isArray(responseData.data) ? responseData.data : [];
                return {
                    success: true,
                    data: data,
                    message: responseData.message || 'Records fetched successfully'
                };
            } else {
                const errorMessage = responseData.message || 'Failed to fetch records';
                if (this.showToast) {
                    this.showToast("Error", errorMessage, "error");
                }
                return {
                    success: false,
                    data: responseData.data || null,
                    message: errorMessage,
                    statusCode: response.status
                };
            }
        } catch (error) {
            return this.handleError(error, 'Failed to fetch records');
        }
    }

    /**
     * Create record - Generic method
     */
    async create(API, formData) {
        try {
            const api = this.getApi();
            const response = await api.post(API, formData);
            const responseData = response.data;
            
            if (responseData.success) {
                return {
                    success: true,
                    data: responseData.data,
                    message: responseData.message || 'Record created successfully'
                };
            } else {
                let errorMessage = responseData.message || 'Failed to create record';
                if (response.status === 422 && responseData.errors) {
                    const errorMessages = this.formatErrorMessages(responseData.errors);
                    errorMessage = `${responseData.message || 'Validation failed'}:\n${errorMessages}`;
                }
                if (response.status === 500 && responseData.error) {
                    errorMessage = this.extractUserFriendlyErrorMessage(responseData.error);
                }
                if (this.showToast) {
                    this.showToast("Error", errorMessage, "error");
                }
                return {
                    success: false,
                    data: responseData.data,
                    message: errorMessage,
                    errors: responseData.errors,
                    statusCode: response.status
                };
            }
        } catch (error) {
            return this.handleError(error, 'Failed to create record');
        }
    }

    /**
     * Update record - Generic method
     */
    async update(API, formData) {
        try {
            const params = {};
            const currentUserId = getUserDetails("Id");
            if (currentUserId) { 
                params.user_id = currentUserId;
            }
            
            const api = this.getApi();
            const response = await api.post(API, formData, { params });
            const responseData = response.data;

            if (responseData.success) {
                return {
                    success: true,
                    data: responseData.data,
                    message: responseData.message || 'Record updated successfully'
                };
            } else {
                let errorMessage = responseData.message || 'Failed to update record';

                if (response.status === 422 && responseData.errors) {
                    const errorMessages = this.formatErrorMessages(responseData.errors);
                    errorMessage = `${responseData.message || 'Validation failed'}:\n${errorMessages}`;
                }

                if (response.status === 500 && responseData.error) {
                    errorMessage = this.extractUserFriendlyErrorMessage(responseData.error);
                }

                if (response.status === 404) {
                    errorMessage = responseData.message || 'Record not found';
                }

                if (this.showToast) {
                    this.showToast("Error", errorMessage, "error");
                }
                return {
                    success: false,
                    data: responseData.data,
                    message: errorMessage,
                    errors: responseData.errors,
                    statusCode: response.status
                };
            }
        } catch (error) {
            return this.handleError(error, 'Failed to update record');
        }
    }

    /**
     * Delete record - Generic method
     */
    async delete(API, deleteData) {
        try {
            const api = this.getApi();
            const response = await api.post(API, deleteData);
            const responseData = response.data;
            
            if (responseData.success) {
                return {
                    success: true,
                    message: responseData.message || 'Record deleted successfully'
                };
            } else {
                let errorMessage = responseData.message || 'Failed to delete record';
                if (response.status === 400) {
                    if (responseData.message) {
                        errorMessage = responseData.message;
                    } else {
                        errorMessage = Message_400;
                    }
                }
                if (response.status === 404) {
                    errorMessage = responseData.message || 'Record not found';
                }
                if (response.status === 422 && responseData.errors) {
                    const errorMessages = this.formatErrorMessages(responseData.errors);
                    errorMessage = `${responseData.message || 'Validation failed'}:\n${errorMessages}`;
                }
                if (response.status === 500 && responseData.error) {
                    errorMessage = this.extractUserFriendlyErrorMessage(responseData.error);
                }
                if (this.showToast) {
                    this.showToast("Error", errorMessage, "error");
                }
                return {
                    success: false,
                    message: errorMessage,
                    statusCode: response.status
                };
            }
        } catch (error) {
            return this.handleError(error, 'Failed to delete record');
        }
    }

    /**
     * Get single record by ID - Generic method
     */
    async show(API, id) {
        try {
            const params = {};
            const currentUserId = getUserDetails("Id");
            if (currentUserId) { 
                params.user_id = currentUserId;
            }
            
            const api = this.getApi();
            const response = await api.get(`${API}`, { params });
            const responseData = response.data;

            if (responseData.success) {
                return {
                    success: true,
                    data: responseData.data,
                    message: responseData.message || 'Record fetched successfully'
                };
            } else {
                const errorMessage = responseData.message || 'Failed to fetch record';

                if (this.showToast) {
                    this.showToast("Error", errorMessage, "error");
                }

                return {
                    success: false,
                    data: responseData.data || null,
                    message: errorMessage,
                    statusCode: response.status
                };
            }
        } catch (error) {
            return this.handleError(error, 'Failed to fetch record');
        }
    }

    /**
     * Check if error is database related
     */
    isDatabaseError(error) {
        const errorMessage = error.message || '';
        const errorData = error.error || '';

        return errorMessage.includes('Database Error') ||
            errorData.includes('Database Error') ||
            errorMessage.includes('SQLSTATE') ||
            errorData.includes('SQLSTATE') ||
            errorMessage.includes('Integrity constraint') ||
            errorData.includes('Integrity constraint');
    }
}

export const apiService = new ApiService();