// services/errorMsgs.js

/**
 * Standard error messages for the entire application
 * These match the backend response patterns
 */

// Generic error messages
export const Message_400 = "Invalid request data or business logic error";
export const Message_401 = "Unauthorized. Please login again to continue";
export const Message_403 = "Forbidden. You do not have permission to perform this action";
export const Message_404 = "Resource not found";
export const Message_405 = "Method not allowed";
export const Message_409 = "Conflict. Resource already exists or data conflict detected";
export const Message_422 = "Validation failed. Please check your inputs";
export const Message_500 = "Internal server error. Please try again later";
export const Message_503 = "Service temporarily unavailable";

// Business logic specific messages
export const Message_Duplicate_Record = "Record already exists";
export const Message_Foreign_Key_Constraint = "Cannot delete record with existing references";
export const Message_Required_Field = "This field is required";
export const Message_Invalid_Format = "Invalid format provided";

// Network and connection errors
export const connectionErrorMsg = "Network error. Please check your connection and try again";

// Success messages (for consistency)
export const Message_Success_Create = "Record created successfully";
export const Message_Success_Update = "Record updated successfully";
export const Message_Success_Delete = "Record deleted successfully";
export const Message_Success_Fetch = "Data fetched successfully";

// Validation specific messages
export const Message_Validation_Error = "Please correct the following errors:";
export const Message_Validation_Required = "This field is required";
export const Message_Validation_Email = "Please enter a valid email address";
export const Message_Validation_Numeric = "Please enter a valid number";
export const Message_Validation_Min = "Value is too small";
export const Message_Validation_Max = "Value is too large";
export const Message_Validation_Unique = "This value must be unique";

// Database related messages
export const Message_DB_Error = "Database error occurred";
export const Message_DB_Constraint = "Database constraint violation";
export const Message_DB_Connection = "Unable to connect to database";

// User feedback messages
export const Message_No_Data = "No data available";
export const Message_Loading = "Loading...";
export const Message_Saving = "Saving...";
export const Message_Processing = "Processing...";