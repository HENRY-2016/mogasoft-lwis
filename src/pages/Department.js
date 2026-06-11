// src/pages/Departments.js
import React, { useState, useEffect, useRef } from 'react';
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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    InputAdornment,
    Tooltip,
    Snackbar,
    Slide,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search,
    Refresh,
    Close as CloseIcon,
    Business,
    Description,
    ExpandMore,
    CheckCircle,
    Cancel,
    Info,
    LunchDining
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { apiService } from '../apiServices/ApiService';
import { APIDepartmentsList, APIDepartmentsStore, APIDepartmentsUpdate, APIDepartmentsDelete } from '../apiServices/APIs';
import { getUserDetails, recordsCount, recordsPerPage } from '../utils/helpers';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

// Transition component for dialogs
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const Departments = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(recordsPerPage);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [expandedSection, setExpandedSection] = useState('basic');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'active'
    });
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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
        fetchDepartments();
    }, []);

    const showMessage = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const fetchDepartments = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiService.list(APIDepartmentsList);
            
            if (result.success && isMounted.current) {
                let departmentsData = Array.isArray(result.data) ? result.data : [];
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
                setLoading(false);
            }
        }
    };

    const handleOpenDialog = (department = null) => {
        if (department) {
            setEditingDepartment(department);
            setFormData({
                name: department.name,
                description: department.description || '',
                status: department.status
            });
        } else {
            setEditingDepartment(null);
            setFormData({
                name: '',
                description: '',
                status: 'active'
            });
        }
        setFormErrors({});
        setExpandedSection('basic');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingDepartment(null);
        setFormErrors({});
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};
        
        if (!formData.name.trim()) {
            errors.name = 'Department name is required';
        } else if (formData.name.length < 2) {
            errors.name = 'Department name must be at least 2 characters';
        }
        
        if (!formData.status) {
            errors.status = 'Status is required';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        const formDataToSend = new FormData();
        formDataToSend.append('user_id', getUserDetails("Id"));
        formDataToSend.append('name', formData.name);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('status', formData.status);

        try {
            let result;
            if (editingDepartment) {
                formDataToSend.append('updateId', editingDepartment.id);
                result = await apiService.update(APIDepartmentsUpdate, formDataToSend);
                if (result.success) {
                    showMessage(`Department "${formData.name}" updated successfully`);
                }
            } else {
                result = await apiService.create(APIDepartmentsStore, formDataToSend);
                if (result.success) {
                    showMessage(`Department "${formData.name}" created successfully`);
                }
            }
            
            if (result.success) {
                fetchDepartments();
                handleCloseDialog();
            } else {
                showMessage(result.message || 'Failed to save department', 'error');
            }
        } catch (error) {
            console.error('Error saving department:', error);
            showMessage('Error saving department', 'error');
        }
    };

    const handleDelete = (department) => {
        setDeleteConfirm(department);
    };

    const confirmDelete = async () => {
        if (deleteConfirm) {
            const formDataToSend = new FormData();
            formDataToSend.append('user_id', getUserDetails("Id"));
            formDataToSend.append('updateId', deleteConfirm.id);

            try {
                const result = await apiService.delete(APIDepartmentsDelete, formDataToSend);
                if (result.success) {
                    showMessage(`Department "${deleteConfirm.name}" deleted successfully`);
                    fetchDepartments();
                    setDeleteConfirm(null);
                } else {
                    showMessage(result.message || 'Failed to delete department', 'error');
                }
            } catch (error) {
                console.error('Error deleting department:', error);
                showMessage('Error deleting department', 'error');
            }
        }
    };

    const handleRefresh = () => {
        setSearchTerm('');
        setStatusFilter('');
        fetchDepartments();
    };

    const filteredDepartments = departments.filter(dept => {
        const matchesSearch = searchTerm === '' ||
            dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dept.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = !statusFilter || dept.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const paginatedDepartments = filteredDepartments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const activeCount = departments.filter(dept => dept.status === 'active').length;
    const inactiveCount = departments.filter(dept => dept.status === 'inactive').length;

    if (loading) {
        return (
            <LoadingState
                message="Loading Departments..."
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
                onRetry={fetchDepartments}
                title="Unable to Load Departments"
                variant="welfare"
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
                        Department Management ({recordsCount(departments.length)} Total)
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                    >
                        Add Department
                    </Button>
                </Box>

                {/* Statistics Summary */}
                <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip 
                        icon={<Business />}
                        label={`Total: ${departments.length}`} 
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
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <TextField
                        placeholder="Search by name or description..."
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
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            label="Status"
                        >
                            <MenuItem value="">All</MenuItem>
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
                                <TableCell>Department Name</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Created Date</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedDepartments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                                            No departments found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedDepartments.map((department, index) => (
                                    <TableRow key={department.id} hover>
                                        <TableCell>
                                            <Chip
                                                label={page * rowsPerPage + index + 1}
                                                color="primary"
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 'medium' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Business color="primary" fontSize="small" />
                                                {department.name}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {department.description ? (
                                                <Tooltip title={department.description}>
                                                    <Typography variant="body2">
                                                        {department.description.length > 50 ? 
                                                            `${department.description.substring(0, 50)}...` : 
                                                            department.description}
                                                    </Typography>
                                                </Tooltip>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={department.status === 'active' ? 'Active' : 'Inactive'}
                                                color={department.status === 'active' ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {new Date(department.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Edit Department">
                                                <IconButton onClick={() => handleOpenDialog(department)} color="primary" size="small">
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Department">
                                                <IconButton onClick={() => handleDelete(department)} color="error" size="small">
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
                    count={filteredDepartments.length}
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
                    <b>{editingDepartment ? 'Edit Department' : 'Add New Department'}</b>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        {/* Basic Information Accordion */}
                        <Accordion 
                            expanded={expandedSection === 'basic'} 
                            onChange={() => setExpandedSection(expandedSection === 'basic' ? '' : 'basic')}
                            sx={{ mb: 2 }}
                        >
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Business color="primary" />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                        Department Information
                                    </Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Department Name *"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            error={!!formErrors.name}
                                            helperText={formErrors.name}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Business />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <br/>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            multiline
                                            rows={3}
                                            placeholder="Describe the department's purpose and responsibilities..."
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Description />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <br/>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth required>
                                            <InputLabel>Status</InputLabel>
                                            <Select
                                                name="status"
                                                value={formData.status}
                                                onChange={handleInputChange}
                                                label="Status"
                                            >
                                                <MenuItem value="active">Active</MenuItem>
                                                <MenuItem value="inactive">Inactive</MenuItem>
                                            </Select>
                                            {formErrors.status && (
                                                <Typography variant="caption" color="error">
                                                    {formErrors.status}
                                                </Typography>
                                            )}
                                        </FormControl>
                                    </Grid>
                                </Box>
                            </AccordionDetails>
                        </Accordion>

                        <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                            <strong>Note:</strong> Departments help organize employees and track welfare allocations by department.
                            Inactive departments won't appear in employee department selection.
                        </Alert>

                        <DialogActions sx={{ mt: 2, px: 0 }}>
                            <Button color="error" onClick={handleCloseDialog} variant="contained">Cancel</Button>
                            <Button onClick={handleSubmit} variant="contained" color="primary">
                                {editingDepartment ? 'Update Department' : 'Create Department'}
                            </Button>
                        </DialogActions>
                    </Box>
                </DialogContent>
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
                <DialogTitle sx={{ textAlign: 'center' }}>Confirm Delete Department</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete department <strong>"{deleteConfirm?.name}"</strong>?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Description: {deleteConfirm?.description || 'No description'}
                    </Typography>
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        <strong>Warning:</strong> This action cannot be undone. 
                        Departments with associated employees cannot be deleted.
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

export default Departments;

