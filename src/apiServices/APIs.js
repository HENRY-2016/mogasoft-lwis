// export const BASE_URL = "https://student.mogasoft.com";
 export const BASE_URL = "http://localhost:8000";


//  Users
export const APIUserLogin = BASE_URL + "/api/user/login";
export const APIUserRegister = BASE_URL + "/api/user/register";
export const APIUserLogout = BASE_URL + "/api/user/logout";
export const APIUsersList = BASE_URL + "/api/user/users";


// Insurance APIs (existing)
export const APIInsuranceList = BASE_URL + "/api/insurance/list";
export const APIInsuranceStore = BASE_URL + "/api/insurance/store";
export const APIInsuranceShow = BASE_URL + "/api/insurance/show/";
export const APIInsuranceUpdate = BASE_URL + "/api/insurance/update";
export const APIInsuranceDelete = BASE_URL + "/api/insurance/delete";
export const APIInsuranceNames = BASE_URL + "/api/insurance/names";


// Employee APIs
export const APIEmployeesList = `${BASE_URL}/api/employees/list`;
export const APIEmployeesNames = `${BASE_URL}/api/employees/names`;
export const APIEmployeesStore = `${BASE_URL}/api/employees/store`;
export const APIEmployeesShow = `${BASE_URL}api/employees/show`;
export const APIEmployeesUpdate =`${BASE_URL}/api/employees/update`;
export const APIEmployeesDelete = `${BASE_URL}/api/employees/delete`;
export const APIDepartments = `${BASE_URL}/api/employees/departments`;

// new API endpoints
export const APIEmployeesLogin = `${BASE_URL}/api/employees/login`;
export const APIEmployeesLogout = `${BASE_URL}/api/employees/logout`;
export const APIEmployeesLogoutAll = `${BASE_URL}/api/employees/logout-all`;
export const APIEmployeesProfile = `${BASE_URL}/api/employees/profile`;
export const APIEmployeesChangePassword = `${BASE_URL}/api/employees/change-password`;


// Welfare APIs
export const APIWelfareDashboard = `${BASE_URL}/api/welfare/dashboard`;
export const APIWelfareAllocations = `${BASE_URL}/api/welfare/allocations`;
export const APIWelfareStoreAllocation = `${BASE_URL}/api/welfare/allocations`;
export const APIWelfareIssueAllocation = `${BASE_URL}/api/welfare/allocations/issue`;
export const APIWelfareRedeem = `${BASE_URL}/api/welfare/redeem`;
export const APIWelfareRedemptions = `${BASE_URL}/api/welfare/redemptions`;
export const APIWelfareAllocationByQR =`${BASE_URL}/api/welfare/allocations/qr`
export const APIWelfareRedemptionsByEmployee = `${BASE_URL}/api/welfare/redemptions-by-employee/`;
export const APIWelfareAllocationsByEmployee = `${BASE_URL}/api/welfare/allocations-by-employee/`;
export const APIWelfareRedemptionsToday = `${BASE_URL}/api/welfare/redemptions/today`;

// Department APIs
export const APIDepartmentsList = `${BASE_URL}/api/department/list`;
export const APIDepartmentsStore = `${BASE_URL}/api/department/store`;
export const APIDepartmentNames = `${BASE_URL}/api/department/names`;
export const APIDepartmentsShow = `${BASE_URL}/api/department/show`;
export const APIDepartmentsUpdate = `${BASE_URL}/api/department/update`;
export const APIDepartmentsDelete = `${BASE_URL}/api/department/delete`;


// Finance APIs
export const APIFinanceList = `${BASE_URL}/api/finance/list`;
export const APIFinanceStore = `${BASE_URL}/api/finance/store`;
export const APIFinanceUpdate = `${BASE_URL}/api/finance/update`;
export const APIFinanceDelete = `${BASE_URL}/api/finance/delete`;
export const APIFinanceShow = `${BASE_URL}/api/finance/show`;
export const APIFinanceLogin = `${BASE_URL}/api/finance/login`;
export const APIFinanceLogout = `${BASE_URL}/api/finance/logout`;
export const APIFinanceProfile = `${BASE_URL}/api/finance/profile`;
export const APIFinanceChangePassword = `${BASE_URL}/api/finance/change-password`;
