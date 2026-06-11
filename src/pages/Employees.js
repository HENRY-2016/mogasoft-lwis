// src/pages/Employees.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TextField,
    Box,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Switch,
    FormControlLabel,
    Alert,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    InputAdornment,
    Snackbar,
    Tooltip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Slide,
    Autocomplete,
    LinearProgress
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search,
    Refresh,
    Close as CloseIcon,
    Person,
    Email,
    Phone,
    Badge,
    ExpandMore,
    People,
    Business,
    Work,
    CheckCircle,
    Cancel,
    Info,
    LunchDining,
    Lock,
    LockReset,
    Visibility,
    VisibilityOff,
    Key,
    VpnKey
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { apiService } from '../apiServices/ApiService';
import { 
    APIEmployeesList, 
    APIEmployeesStore, 
    APIEmployeesUpdate, 
    APIEmployeesDelete, 
    APIDepartmentNames,
    APIEmployeesChangePassword 
} from '../apiServices/APIs';
import { getNameById, getUserDetails, recordsCount, recordsPerPage } from '../utils/helpers';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

// Transition component for dialogs
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const Employees = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loadingDepartments, setLoadingDepartments] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(recordsPerPage);
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [expandedSection, setExpandedSection] = useState('basic');
    const [departmentSearchInput, setDepartmentSearchInput] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    
    // Password related states
    const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
    const [passwordEmployee, setPasswordEmployee] = useState(null);
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [changingPassword, setChangingPassword] = useState(false);
    
    // Form password states
    const [showFormPassword, setShowFormPassword] = useState(false);
    const [showFormConfirmPassword, setShowFormConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        employee_number: '',
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        department_id: '',
        position: '',
        is_active: true
    });

    // Use ref to track if component is mounted
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        apiService.setToastFunction(showMessage);

        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        fetchEmployees();
        fetchDepartments();
    }, []);

    const showMessage = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const fetchEmployees = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiService.list(APIEmployeesList);

            if (result.success && isMounted.current) {
                const employeesData = Array.isArray(result.data) ? result.data : [];
                setEmployees(employeesData);
            } else {
                setError(result.message);
                showMessage(result.message || 'Failed to fetch employees', 'error');
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            setError("Failed to load data");
            showMessage('Error fetching employees', 'error');
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    const fetchDepartments = async () => {
        setLoadingDepartments(true);
        setError(null);
        try {
            const result = await apiService.list(APIDepartmentNames);

            if (result.success && isMounted.current) {
                const departmentsData = Array.isArray(result.data) ? result.data : [];
                setDepartments(departmentsData);
            } else {
                setError(result.message);
                showMessage(result.message || 'Failed to fetch departments', 'error');
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
            setError("Failed to load data");
            showMessage('Error fetching departments', 'error');
        } finally {
            if (isMounted.current) {
                setLoadingDepartments(false);
            }
        }
    };

    const handleOpenDialog = (employee = null) => {
        if (employee) {
            setEditingEmployee(employee);
            // Get department ID from either property
            const deptId = employee.department_id || employee.department || '';
            
            setFormData({
                employee_number: employee.employee_number,
                name: employee.name,
                email: employee.email,
                password: '',
                password_confirmation: '',
                phone: employee.phone || '',
                department_id: deptId,
                position: employee.position || '',
                is_active: employee.is_active
            });
            // Set department search input
            const selectedDepartment = departments.find(d => String(d.id) === String(deptId));
            setDepartmentSearchInput(selectedDepartment ? selectedDepartment.name : '');
        } else {
            setEditingEmployee(null);
            setFormData({
                employee_number: '',
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
                phone: '',
                department_id: '',
                position: '',
                is_active: true
            });
            setDepartmentSearchInput('');
        }
        setFormErrors({});
        setExpandedSection('basic');
        setShowFormPassword(false);
        setShowFormConfirmPassword(false);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingEmployee(null);
        setFormErrors({});
        setDepartmentSearchInput('');
        setShowFormPassword(false);
        setShowFormConfirmPassword(false);
    };

    const handleInputChange = (e) => {
        const { name, value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'is_active' ? checked : value
        }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handle department selection
    const handleDepartmentSelect = useCallback((event, selectedDepartment) => {
        if (selectedDepartment) {
            setFormData(prev => ({
                ...prev,
                department_id: selectedDepartment.id
            }));
            setDepartmentSearchInput(selectedDepartment.name);
        } else {
            setFormData(prev => ({
                ...prev,
                department_id: ''
            }));
            setDepartmentSearchInput('');
        }
    }, []);

    // Password visibility toggle
    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const validateForm = () => {
        const errors = {};
        
        if (!formData.employee_number.trim()) {
            errors.employee_number = 'Employee number is required';
        } else if (formData.employee_number.length < 3) {
            errors.employee_number = 'Employee number must be at least 3 characters';
        }
        
        if (!formData.name.trim()) {
            errors.name = 'Full name is required';
        } else if (formData.name.length < 2) {
            errors.name = 'Name must be at least 2 characters';
        }
        
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Department validation
        if (!formData.department_id) {
            errors.department_id = 'Department is required';
        }

        // Password validation for new employees
        if (!editingEmployee) {
            if (!formData.password) {
                errors.password = 'Password is required';
            } else if (formData.password.length < 8) {
                errors.password = 'Password must be at least 8 characters';
            } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
                errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
            }

            if (formData.password !== formData.password_confirmation) {
                errors.password_confirmation = 'Passwords do not match';
            }
        } else {
            // For editing, password is optional but must meet criteria if provided
            if (formData.password) {
                if (formData.password.length < 8) {
                    errors.password = 'Password must be at least 8 characters';
                } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
                    errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
                }

                if (formData.password !== formData.password_confirmation) {
                    errors.password_confirmation = 'Passwords do not match';
                }
            }
        }
        
        if (formData.phone && !/^[0-9+\-\s()]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
            errors.phone = 'Please enter a valid phone number';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        const formDataToSend = new FormData();
        formDataToSend.append('user_id', getUserDetails("Id"));
        formDataToSend.append('employee_number', formData.employee_number);
        formDataToSend.append('name', formData.name);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('phone', formData.phone);
        // FIX: Always send the department field with the department_id value
        formDataToSend.append('department', formData.department_id);
        formDataToSend.append('position', formData.position);
        formDataToSend.append('is_active', formData.is_active ? 1 : 0);

        // Add password if provided
        if (formData.password) {
            formDataToSend.append('password', formData.password);
            formDataToSend.append('password_confirmation', formData.password_confirmation);
        }

        try {
            let result;
            if (editingEmployee) {
                formDataToSend.append('updateId', editingEmployee.id);
                result = await apiService.update(APIEmployeesUpdate, formDataToSend);
                if (result.success && isMounted.current) {
                    showMessage(`Employee "${formData.name}" updated successfully`);
                }
            } else {
                result = await apiService.create(APIEmployeesStore, formDataToSend);
                if (result.success && isMounted.current) {
                    showMessage(`Employee "${formData.name}" created successfully`);
                }
            }
            
            if (result.success && isMounted.current) {
                fetchEmployees();
                handleCloseDialog();
            } else if (!result.success) {
                // Show validation errors if available
                if (result.errors) {
                    const errorMessages = Object.values(result.errors).flat().join(', ');
                    showMessage(errorMessages || result.message || 'Failed to save employee', 'error');
                } else {
                    showMessage(result.message || 'Failed to save employee', 'error');
                }
            }
        } catch (error) {
            console.error('Error saving employee:', error);
            showMessage('Error saving employee', 'error');
        }
    };

    // Open password change dialog
    const handleOpenPasswordDialog = (employee) => {
        setPasswordEmployee(employee);
        setPasswordData({
            current_password: '',
            new_password: '',
            new_password_confirmation: ''
        });
        setPasswordErrors({});
        setShowPasswords({
            current: false,
            new: false,
            confirm: false
        });
        setOpenPasswordDialog(true);
    };

    // Close password change dialog
    const handleClosePasswordDialog = () => {
        setOpenPasswordDialog(false);
        setPasswordEmployee(null);
        setPasswordErrors({});
        setShowPasswords({
            current: false,
            new: false,
            confirm: false
        });
    };

    // Handle password input change
    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
        if (passwordErrors[name]) {
            setPasswordErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Validate password form
    const validatePasswordForm = () => {
        const errors = {};
        
        if (!passwordData.current_password) {
            errors.current_password = 'Current password is required';
        }
        
        if (!passwordData.new_password) {
            errors.new_password = 'New password is required';
        } else if (passwordData.new_password.length < 8) {
            errors.new_password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.new_password)) {
            errors.new_password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }
        
        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            errors.new_password_confirmation = 'Passwords do not match';
        }
        
        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle password change
    const handlePasswordChange = async () => {
        if (!validatePasswordForm()) return;

        setChangingPassword(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('user_id', getUserDetails("Id"));
            formDataToSend.append('employee_id', passwordEmployee.id);
            formDataToSend.append('current_password', passwordData.current_password);
            formDataToSend.append('new_password', passwordData.new_password);
            formDataToSend.append('new_password_confirmation', passwordData.new_password_confirmation);

            const result = await apiService.update(APIEmployeesChangePassword, formDataToSend);
            
            if (result.success && isMounted.current) {
                showMessage(`Password updated successfully for "${passwordEmployee.name}"`);
                handleClosePasswordDialog();
            } else {
                showMessage(result.message || 'Failed to update password', 'error');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            showMessage('Error changing password', 'error');
        } finally {
            if (isMounted.current) {
                setChangingPassword(false);
            }
        }
    };

    const handleDelete = (employee) => {
        setDeleteConfirm(employee);
    };

    const confirmDelete = async () => {
        if (deleteConfirm) {
            const formDataToSend = new FormData();
            formDataToSend.append('user_id', getUserDetails("Id"));
            formDataToSend.append('updateId', deleteConfirm.id);

            try {
                const result = await apiService.delete(APIEmployeesDelete, formDataToSend);
                if (result.success && isMounted.current) {
                    showMessage(`Employee "${deleteConfirm.name}" deleted successfully`);
                    fetchEmployees();
                    setDeleteConfirm(null);
                } else {
                    showMessage(result.message || 'Failed to delete employee', 'error');
                }
            } catch (error) {
                console.error('Error deleting employee:', error);
                showMessage('Error deleting employee', 'error');
            }
        }
    };

    const handleRefresh = () => {
        setSearchTerm('');
        setDepartmentFilter('');
        setStatusFilter('');
        fetchEmployees();
    };

    // Get department name by ID
    const getDepartmentName = (departmentId) => {
        if (!departmentId) return '-';
        const department = departments.find(d => String(d.id) === String(departmentId));
        return department ? department.name : '-';
    };

    // Password strength indicator
    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: '', color: '' };
        
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
        
        if (strength <= 2) return { strength, label: 'Weak', color: '#f44336' };
        if (strength <= 4) return { strength, label: 'Medium', color: '#ff9800' };
        return { strength, label: 'Strong', color: '#4caf50' };
    };

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = searchTerm === '' ||
            emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.employee_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const empDeptId = emp.department_id || emp.department;
        const matchesDepartment = !departmentFilter || String(empDeptId) === String(departmentFilter);
        const matchesStatus = !statusFilter || 
            (statusFilter === 'active' && emp.is_active) ||
            (statusFilter === 'inactive' && !emp.is_active);
        
        return matchesSearch && matchesDepartment && matchesStatus;
    });

    const paginatedEmployees = filteredEmployees.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const activeCount = employees.filter(emp => emp.is_active).length;
    const inactiveCount = employees.filter(emp => !emp.is_active).length;
    const departmentCount = new Set(employees.map(emp => emp.department_id || emp.department).filter(Boolean)).size;

    if (loading) {
        return (
            <LoadingState
                message="Loading Employees..."
                variant="welfare"
                size="large"
                fullPage
            />
        );
    }

    if (error) {
        return (
            <ErrorState
                error={error}
                onRetry={fetchEmployees}
                title="Unable to Load Employees"
                variant="employee"
                fullPage
                retryText="Retry Loading"
            />
        );
    }

    return (
        <Box>
            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LunchDining sx={{ color: '#2E7D32' }} />
                        Employee Management ({recordsCount(employees.length)} Total)
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                    >
                        Add Employee
                    </Button>
                </Box>

                <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip 
                        icon={<People />}
                        label={`Total: ${employees.length}`} 
                        color="primary" 
                        variant="outlined"
                    />
                    <Chip 
                        icon={<CheckCircle />}
                        label={`Active: ${activeCount}`} 
                        color="success" 
                        variant="outlined"
                    />
                    <Chip 
                        icon={<Cancel />}
                        label={`Inactive: ${inactiveCount}`} 
                        color="default" 
                        variant="outlined"
                    />
                    <Chip 
                        icon={<Business />}
                        label={`Departments: ${departmentCount}`} 
                        color="secondary" 
                        variant="outlined"
                    />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <TextField
                        placeholder="Search by name, number or email..."
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ flex: 1, minWidth: 250 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                            endAdornment: searchTerm && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Department</InputLabel>
                        <Select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            label="Department"
                        >
                            <MenuItem value="">All Departments</MenuItem>
                            {loadingDepartments ? (
                                <MenuItem disabled>Loading departments...</MenuItem>
                            ) : (
                                departments.map((dept) => (
                                    <MenuItem key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            label="Status"
                        >
                            <MenuItem value="">All Status</MenuItem>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                        </Select>
                    </FormControl>
                    <Button 
                        variant="outlined" 
                        onClick={handleRefresh} 
                        startIcon={<Refresh />}
                    >
                        Refresh
                    </Button>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell>#</TableCell>
                                <TableCell>Employee #</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>Department</TableCell>
                                <TableCell>Position</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedEmployees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">
                                        <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                                            No employees found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedEmployees.map((employee, index) => (
                                    <TableRow key={employee.id} hover>
                                        <TableCell>
                                            <Chip
                                                label={page * rowsPerPage + index + 1}
                                                color="primary"
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={employee.employee_number} 
                                                size="small" 
                                                variant="outlined"
                                                icon={<Badge fontSize="small" />}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 'medium' }}>{employee.name}</TableCell>
                                        <TableCell>{employee.email}</TableCell>
                                        <TableCell>{employee.phone || '-'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getDepartmentName(employee.department_id || employee.department)} 
                                                size="small"
                                                variant="outlined"
                                                color="primary"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {employee.position ? (
                                                <Chip 
                                                    label={employee.position} 
                                                    size="small" 
                                                    variant="outlined"
                                                />
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={employee.is_active ? 'Active' : 'Inactive'}
                                                color={employee.is_active ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Edit Employee">
                                                <IconButton onClick={() => handleOpenDialog(employee)} color="primary" size="small">
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Change Password">
                                                <IconButton 
                                                    onClick={() => handleOpenPasswordDialog(employee)} 
                                                    color="secondary" 
                                                    size="small"
                                                >
                                                    <VpnKey />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Employee">
                                                <IconButton onClick={() => handleDelete(employee)} color="error" size="small">
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50, 100]}
                    component="div"
                    count={filteredEmployees.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            </Paper>

            {/* Add/Edit Dialog */}
            <Dialog
                open={openDialog}
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick') {
                        handleCloseDialog();
                    }
                }}
                TransitionComponent={Transition}
                fullWidth
                maxWidth="sm"
                scroll="paper"
                disableEscapeKeyDown
            >
                <DialogTitle sx={{ textAlign: 'center' }}>
                    <b>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</b>
                </DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <Accordion 
                            expanded={expandedSection === 'basic'} 
                            onChange={() => setExpandedSection(expandedSection === 'basic' ? '' : 'basic')}
                            sx={{ mb: 2 }}
                        >
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Person color="primary" />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                        Basic Information
                                    </Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Employee Number *"
                                            name="employee_number"
                                            value={formData.employee_number}
                                            onChange={handleInputChange}
                                            required
                                            error={!!formErrors.employee_number}
                                            helperText={formErrors.employee_number}
                                            disabled={!!editingEmployee}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Badge />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <br/>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Full Name *"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            error={!!formErrors.name}
                                            helperText={formErrors.name}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Person />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <br/>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Email *"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            error={!!formErrors.email}
                                            helperText={formErrors.email}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Email />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <br/>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            error={!!formErrors.phone}
                                            helperText={formErrors.phone}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Phone />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                </Box>
                            </AccordionDetails>
                        </Accordion>

                        <Accordion 
                            expanded={expandedSection === 'security'} 
                            onChange={() => setExpandedSection(expandedSection === 'security' ? '' : 'security')}
                            sx={{ mb: 2 }}
                        >
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Lock color="warning" />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                        Security {editingEmployee && '(Optional)'}
                                    </Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label={editingEmployee ? "New Password (leave blank to keep current)" : "Password *"}
                                            name="password"
                                            type={showFormPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required={!editingEmployee}
                                            error={!!formErrors.password}
                                            helperText={formErrors.password}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Lock />
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowFormPassword(!showFormPassword)}
                                                            edge="end"
                                                        >
                                                            {showFormPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        {formData.password && !editingEmployee && (
                                            <Box sx={{ mt: 1 }}>
                                                <LinearProgress 
                                                    variant="determinate" 
                                                    value={(getPasswordStrength(formData.password).strength / 6) * 100} 
                                                    sx={{ 
                                                        height: 6, 
                                                        borderRadius: 3,
                                                        backgroundColor: '#e0e0e0',
                                                        '& .MuiLinearProgress-bar': {
                                                            backgroundColor: getPasswordStrength(formData.password).color
                                                        }
                                                    }}
                                                />
                                                <Typography 
                                                    variant="caption" 
                                                    sx={{ color: getPasswordStrength(formData.password).color }}
                                                >
                                                    Password strength: {getPasswordStrength(formData.password).label}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Grid>
                                    <br/>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Confirm Password"
                                            name="password_confirmation"
                                            type={showFormConfirmPassword ? 'text' : 'password'}
                                            value={formData.password_confirmation}
                                            onChange={handleInputChange}
                                            required={!editingEmployee || !!formData.password}
                                            error={!!formErrors.password_confirmation}
                                            helperText={formErrors.password_confirmation}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LockReset />
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowFormConfirmPassword(!showFormConfirmPassword)}
                                                            edge="end"
                                                        >
                                                            {showFormConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <Alert severity="info" sx={{ mt: 2 }}>
                                        Password must be at least 8 characters and include uppercase, lowercase, and numbers.
                                    </Alert>
                                </Box>
                            </AccordionDetails>
                        </Accordion>

                        <Accordion 
                            expanded={expandedSection === 'employment'} 
                            onChange={() => setExpandedSection(expandedSection === 'employment' ? '' : 'employment')}
                            sx={{ mb: 2 }}
                        >
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Work color="secondary" />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                        Employment Details
                                    </Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box>
                                    <Grid item xs={12} sm={6}>
                                        <Autocomplete
                                            id="department-select"
                                            options={departments}
                                            loading={loadingDepartments}
                                            value={departments.find(d => String(d.id) === String(formData.department_id)) || null}
                                            onChange={handleDepartmentSelect}
                                            inputValue={departmentSearchInput}
                                            onInputChange={(event, newInputValue) => {
                                                setDepartmentSearchInput(newInputValue);
                                            }}
                                            getOptionLabel={(option) => option?.name || ''}
                                            isOptionEqualToValue={(option, value) => String(option?.id) === String(value?.id)}
                                            renderOption={(props, option) => (
                                                <li {...props}>
                                                    <Box>
                                                        <Typography variant="body1">
                                                            <strong>{option.name}</strong>
                                                        </Typography>
                                                        {option.description && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                {option.description}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </li>
                                            )}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Department *"
                                                    placeholder="Search department..."
                                                    error={!!formErrors.department_id}
                                                    helperText={formErrors.department_id}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Business />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <br/>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Position"
                                            name="position"
                                            value={formData.position}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Manager, Officer, Assistant"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Work />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                </Box>
                            </AccordionDetails>
                        </Accordion>

                        <Accordion 
                            expanded={expandedSection === 'status'} 
                            onChange={() => setExpandedSection(expandedSection === 'status' ? '' : 'status')}
                            sx={{ mb: 2 }}
                        >
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Info color="info" />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                        Status
                                    </Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={formData.is_active}
                                                        onChange={handleInputChange}
                                                        name="is_active"
                                                        color="primary"
                                                    />
                                                }
                                                label="Active Employee"
                                            />
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                                Inactive employees cannot receive welfare allocations and cannot login
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>

                        <DialogActions sx={{ mt: 3, px: 0 }}>
                            <Button color="error" onClick={handleCloseDialog} variant="contained">Cancel</Button>
                            <Button onClick={handleSubmit} variant="contained" color="primary">
                                {editingEmployee ? 'Update Employee' : 'Create Employee'}
                            </Button>
                        </DialogActions>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Change Password Dialog */}
            <Dialog
                open={openPasswordDialog}
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick') {
                        handleClosePasswordDialog();
                    }
                }}
                TransitionComponent={Transition}
                fullWidth
                maxWidth="sm"
                disableEscapeKeyDown
            >
                <DialogTitle sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <VpnKey color="warning" />
                        <b>Change Password</b>
                    </Box>
                    {passwordEmployee && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Employee: {passwordEmployee.name} ({passwordEmployee.employee_number})
                        </Typography>
                    )}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Current Password *"
                            name="current_password"
                            type={showPasswords.current ? 'text' : 'password'}
                            value={passwordData.current_password}
                            onChange={handlePasswordInputChange}
                            required
                            error={!!passwordErrors.current_password}
                            helperText={passwordErrors.current_password}
                            sx={{ mb: 3 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Key />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => togglePasswordVisibility('current')}
                                            edge="end"
                                        >
                                            {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            fullWidth
                            label="New Password *"
                            name="new_password"
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordData.new_password}
                            onChange={handlePasswordInputChange}
                            required
                            error={!!passwordErrors.new_password}
                            helperText={passwordErrors.new_password}
                            sx={{ mb: 3 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => togglePasswordVisibility('new')}
                                            edge="end"
                                        >
                                            {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Confirm New Password *"
                            name="new_password_confirmation"
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={passwordData.new_password_confirmation}
                            onChange={handlePasswordInputChange}
                            required
                            error={!!passwordErrors.new_password_confirmation}
                            helperText={passwordErrors.new_password_confirmation}
                            sx={{ mb: 2 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockReset />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => togglePasswordVisibility('confirm')}
                                            edge="end"
                                        >
                                            {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Alert severity="info" sx={{ mt: 2 }}>
                            Password must be at least 8 characters and include uppercase, lowercase, and numbers.
                        </Alert>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={handleClosePasswordDialog} 
                        variant="contained" 
                        color="error"
                        disabled={changingPassword}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handlePasswordChange} 
                        variant="contained" 
                        color="primary"
                        disabled={changingPassword}
                        startIcon={changingPassword ? <LoadingState size="small" /> : <VpnKey />}
                    >
                        {changingPassword ? 'Changing Password...' : 'Update Password'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={!!deleteConfirm}
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick') {
                        setDeleteConfirm(null);
                    }
                }}
                TransitionComponent={Transition}
                disableEscapeKeyDown
            >
                <DialogTitle sx={{ textAlign: 'center' }}>Confirm Delete Employee</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete employee <strong>"{deleteConfirm?.name}"</strong>?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Employee #: {deleteConfirm?.employee_number}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Department: {getDepartmentName(deleteConfirm?.department_id || deleteConfirm?.department)}
                    </Typography>
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        <strong>Warning:</strong> This action cannot be undone. 
                        This will also delete all welfare allocations, redemptions, and login credentials associated with this employee.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirm(null)} variant="contained" color="error">Cancel</Button>
                    <Button onClick={confirmDelete} variant="contained" color="primary" startIcon={<DeleteIcon />}>
                        Confirm Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Employees;