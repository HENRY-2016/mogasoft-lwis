// src/pages/WelfareAllocations.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    AccordionDetails,
    Autocomplete
} from '@mui/material';
import {
    Add as AddIcon,
    QrCode as QrCodeIcon,
    Refresh,
    Search,
    CheckCircle,
    QrCodeScanner,
    Close as CloseIcon,
    ExpandMore,
    Person,
    AttachMoney,
    CalendarToday,
    Note,
    Info,
    Receipt,
    LunchDining
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { apiService } from '../apiServices/ApiService';
import { APIEmployeesNames, APIWelfareAllocations, APIWelfareIssueAllocation, APIWelfareStoreAllocation } from '../apiServices/APIs';
import { formatNumberWithComma, getUserDetails, recordsCount, recordsPerPage } from '../utils/helpers';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

// Transition component for dialogs
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const WelfareAllocations = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [allocations, setAllocations] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(recordsPerPage);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [expandedSection, setExpandedSection] = useState('basic');
    const [employeeSearchInput, setEmployeeSearchInput] = useState('');
    const [formData, setFormData] = useState({
        employee_id: '',
        amount: '',
        allocation_date: new Date().toISOString().split('T')[0],
        notes: ''
    });
    const [issuingAllocation, setIssuingAllocation] = useState(null);
    const [showQR, setShowQR] = useState(null);
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
        fetchAllocations();
        fetchEmployees();
    }, [statusFilter]);

    const showMessage = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const fetchAllocations = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiService.list(APIWelfareAllocations);

            if (result.success && isMounted.current) {
                let allocationsData = Array.isArray(result.data) ? result.data : [];
                
                // Apply status filter if needed
                if (statusFilter) {
                    allocationsData = allocationsData.filter(a => a.status === statusFilter);
                }
                
                setAllocations(allocationsData);
            } else {
                setError(result.message);
                showMessage(result.message || 'Failed to fetch allocations', 'error');
            }
        } catch (error) {
            console.error('Error fetching allocations:', error);
            setError("Failed to load data");
            showMessage('Error fetching allocations', 'error');
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    const fetchEmployees = async () => {
        setLoadingEmployees(true);
        setError(null);
        try {
            const result = await apiService.list(APIEmployeesNames);

            if (result.success && isMounted.current) {
                let employeesData = Array.isArray(result.data) ? result.data : [];
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
                setLoadingEmployees(false);
            }
        }
    };
    const handleOpenDialog = () => {
        setFormData({
            employee_id: '',
            amount: '',
            allocation_date: new Date().toISOString().split('T')[0],
            notes: ''
        });
        setEmployeeSearchInput('');
        setFormErrors({});
        setExpandedSection('basic');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setFormErrors({});
        setEmployeeSearchInput('');
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

    // Handle employee selection
    const handleEmployeeSelect = useCallback((event, selectedEmployee) => {
        setFormData(prev => ({
            ...prev,
            employee_id: selectedEmployee ? selectedEmployee.id : ''
        }));
    }, []);

    const validateForm = () => {
        const errors = {};
        if (!formData.employee_id) errors.employee_id = 'Please select an employee';
        if (!formData.amount) errors.amount = 'Please enter an amount';
        if (formData.amount && parseFloat(formData.amount) <= 0) errors.amount = 'Amount must be greater than 0';
        if (!formData.allocation_date) errors.allocation_date = 'Please select an allocation date';
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        const formDataToSend = new FormData();
        formDataToSend.append('user_id', getUserDetails("Id"));
        formDataToSend.append('employee_id', formData.employee_id);
        formDataToSend.append('amount', formData.amount);
        formDataToSend.append('allocation_date', formData.allocation_date);
        formDataToSend.append('notes', formData.notes);

        try {
            const result = await apiService.create(APIWelfareStoreAllocation, formDataToSend);
            if (result.success && isMounted.current) {
                showMessage('Welfare allocation created successfully');
                fetchAllocations();
                handleCloseDialog();
            } else {
                showMessage(result.message || 'Failed to create allocation', 'error');
            }
        } catch (error) {
            console.error('Error creating allocation:', error);
            showMessage('Error creating allocation', 'error');
        }
    };

    const handleIssue = (allocation) => {
        setIssuingAllocation(allocation);
    };

    const confirmIssue = async () => {
        if (!issuingAllocation) return;

        const formDataToSend = new FormData();
        formDataToSend.append('user_id', getUserDetails("Id"));
        formDataToSend.append('allocation_id', issuingAllocation.id);

        try {
            const result = await apiService.update(APIWelfareIssueAllocation, formDataToSend);
            if (result.success && isMounted.current) {
                showMessage(`Welfare allocation issued successfully for ${issuingAllocation.employee?.name}`);
                fetchAllocations();
                setIssuingAllocation(null);
            } else {
                showMessage(result.message || 'Failed to issue allocation', 'error');
            }
        } catch (error) {
            console.error('Error issuing allocation:', error);
            showMessage('Error issuing allocation', 'error');
        }
    };

    const handleRefresh = () => {
        setSearchTerm('');
        setStatusFilter('');
        fetchAllocations();
    };

    const getStatusChip = (status) => {
        const config = {
            pending: { label: 'Pending', color: 'warning', icon: null },
            issued: { label: 'Issued', color: 'primary', icon: <QrCodeScanner fontSize="small" /> },
            redeemed: { label: 'Redeemed', color: 'success', icon: <CheckCircle fontSize="small" /> },
            expired: { label: 'Expired', color: 'default', icon: null }
        };
        const { label, color, icon } = config[status] || { label: status, color: 'default', icon: null };
        return <Chip label={label} color={color} size="small" icon={icon} />;
    };

    const filteredAllocations = allocations.filter(allocation => {
        if (searchTerm) {
            const employeeName = allocation.employee?.name?.toLowerCase() || '';
            const employeeNumber = allocation.employee?.employee_number?.toLowerCase() || '';
            const searchLower = searchTerm.toLowerCase();
            if (!employeeName.includes(searchLower) && !employeeNumber.includes(searchLower)) return false;
        }
        return true;
    });

    const paginatedAllocations = filteredAllocations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // Calculate statistics
    const totalAmount = allocations.reduce((sum, a) => sum + (a.amount || 0), 0);
    const pendingCount = allocations.filter(a => a.status === 'pending').length;
    const issuedCount = allocations.filter(a => a.status === 'issued').length;
    const redeemedCount = allocations.filter(a => a.status === 'redeemed').length;

    if (loading) {
        return (
            <LoadingState
                message="Loading Welfare Allocations..."
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
                onRetry={fetchAllocations}
                title="Unable to Load Allocations"
                variant="allocation"
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
                        Welfare Allocations ({recordsCount(allocations.length)} Total)
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenDialog}
                    >
                        New Allocation
                    </Button>
                </Box>

                {/* Statistics Summary */}
                <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip 
                        label={`Total: ${allocations.length}`} 
                        color="primary" 
                        variant="outlined"
                    />
                    <Chip 
                        label={`Pending: ${pendingCount}`} 
                        color="warning" 
                        variant="outlined"
                    />
                    <Chip 
                        label={`Issued: ${issuedCount}`} 
                        color="primary" 
                        variant="outlined"
                    />
                    <Chip 
                        label={`Redeemed: ${redeemedCount}`} 
                        color="success" 
                        variant="outlined"
                    />
                    <Chip 
                        label={`Total Amount: UGX ${formatNumberWithComma(totalAmount)}`} 
                        color="secondary" 
                        variant="outlined"
                    />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <TextField
                        placeholder="Search by employee name or number..."
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
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="issued">Issued</MenuItem>
                            <MenuItem value="redeemed">Redeemed</MenuItem>
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
                                <TableCell>Name</TableCell>
                                <TableCell>Number</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Allocation Date</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>QR Code</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedAllocations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                                            No welfare allocations found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedAllocations.map((allocation, index) => (
                                    <TableRow key={allocation.id} hover>
                                        <TableCell>
                                            <Chip
                                                label={page * rowsPerPage + index + 1}
                                                color="primary"
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 'medium' }}>
                                            {allocation.employee?.name || 'N/A'}
                                        </TableCell>
                                        <TableCell>{allocation.employee?.employee_number || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Typography sx={{ color: '#2E7D32', fontWeight: 'medium' }}>
                                                UGX {(allocation.amount || 0).toLocaleString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {allocation.allocation_date ? new Date(allocation.allocation_date).toLocaleDateString() : 'N/A'}
                                        </TableCell>
                                        <TableCell>{getStatusChip(allocation.status)}</TableCell>
                                        <TableCell>
                                            {allocation.qr_code && (
                                                <Tooltip title="View QR Code">
                                                    <IconButton size="small" onClick={() => setShowQR(allocation)}>
                                                        <QrCodeIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            {allocation.status === 'pending' && (
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<CheckCircle />}
                                                    onClick={() => handleIssue(allocation)}
                                                    sx={{ textTransform: 'none' }}
                                                >
                                                    Issue
                                                </Button>
                                            )}
                                            {allocation.status === 'issued' && (
                                                <Chip
                                                    icon={<QrCodeScanner />}
                                                    label="Ready for Redemption"
                                                    color="primary"
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            )}
                                            {allocation.status === 'redeemed' && (
                                                <Chip 
                                                    label="Redeemed" 
                                                    color="success" 
                                                    size="small" 
                                                    variant="outlined"
                                                />
                                            )}
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
                    count={filteredAllocations.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            </Paper>

            {/* Create Allocation Dialog */}
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
                    <b>Create New Welfare Allocation</b>
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
                                    <Receipt color="primary" />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                        Allocation Details
                                    </Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Autocomplete
                                            id="employee-select"
                                            options={employees}
                                            loading={loadingEmployees}
                                            value={employees.find(emp => emp.id === formData.employee_id) || null}
                                            onChange={handleEmployeeSelect}
                                            inputValue={employeeSearchInput}
                                            onInputChange={(event, newInputValue) => {
                                                setEmployeeSearchInput(newInputValue);
                                            }}
                                            getOptionLabel={(option) => `${option.name} ${option.employee_number ? `(${option.employee_number})` : ''}`}
                                            isOptionEqualToValue={(option, value) => option.id === value.id}
                                            renderOption={(props, option) => (
                                                <li {...props}>
                                                    <Box>
                                                        <Typography variant="body1">
                                                            <strong>{option.name}</strong>
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {option.employee_number && `ID: ${option.employee_number} `}
                                                            {option.department && `| Dept: ${option.department}`}
                                                            {option.position && `| ${option.position}`}
                                                        </Typography>
                                                    </Box>
                                                </li>
                                            )}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Select Employee *"
                                                    required
                                                    error={!!formErrors.employee_id}
                                                    helperText={formErrors.employee_id || "Search by name or employee number"}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Person />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Amount (UGX) *"
                                            name="amount"
                                            type="number"
                                            value={formData.amount}
                                            onChange={handleInputChange}
                                            required
                                            error={!!formErrors.amount}
                                            helperText={formErrors.amount}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <AttachMoney />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Allocation Date *"
                                            name="allocation_date"
                                            type="date"
                                            value={formData.allocation_date}
                                            onChange={handleInputChange}
                                            error={!!formErrors.allocation_date}
                                            helperText={formErrors.allocation_date}
                                            InputLabelProps={{ shrink: true }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <CalendarToday />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>

                        {/* Additional Information Accordion */}
                        <Accordion 
                            expanded={expandedSection === 'notes'} 
                            onChange={() => setExpandedSection(expandedSection === 'notes' ? '' : 'notes')}
                            sx={{ mb: 2 }}
                        >
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Info color="info" />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                        Additional Information
                                    </Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Notes (Optional)"
                                            name="notes"
                                            multiline
                                            rows={3}
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            placeholder="Add any additional notes about this allocation..."
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Note />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>

                        <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                            <strong>Note:</strong> After creation, you'll need to issue the allocation to generate a QR code for redemption.
                            The employee will use this QR code to claim their lunch welfare.
                        </Alert>

                        <DialogActions sx={{ mt: 2, px: 0 }}>
                            <Button color="error" onClick={handleCloseDialog} variant="contained">Cancel</Button>
                            <Button onClick={handleSubmit} variant="contained" color="primary">
                                Create Allocation
                            </Button>
                        </DialogActions>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Issue Confirmation Dialog */}
            <Dialog
                open={!!issuingAllocation}
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick') {
                        setIssuingAllocation(null);
                    }
                }}
                TransitionComponent={Transition}
                disableEscapeKeyDown
            >
                <DialogTitle sx={{ textAlign: 'center' }}>Confirm Issue Welfare Allocation</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to issue this welfare allocation to{' '}
                        <strong>{issuingAllocation?.employee?.name}</strong>?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Employee #: {issuingAllocation?.employee?.employee_number}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Amount: <strong>UGX {(issuingAllocation?.amount || 0).toLocaleString()}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Allocation Date: {issuingAllocation?.allocation_date ? new Date(issuingAllocation.allocation_date).toLocaleDateString() : 'N/A'}
                    </Typography>
                    <Alert severity="info" sx={{ mt: 2 }}>
                        <strong>Important:</strong> Once issued, a unique QR code will be generated. 
                        The employee must present this QR code at the redemption point to claim their lunch welfare.
                        This action cannot be undone.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIssuingAllocation(null)} variant="contained" color="error">Cancel</Button>
                    <Button onClick={confirmIssue} variant="contained" color="primary">
                        Confirm Issue
                    </Button>
                </DialogActions>
            </Dialog>

            {/* QR Code Dialog */}
            <Dialog
                open={!!showQR}
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick') {
                        setShowQR(null);
                    }
                }}
                TransitionComponent={Transition}
                maxWidth="xs"
                fullWidth
                disableEscapeKeyDown
            >
                <DialogTitle align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h6">Welfare QR Code</Typography>
                        <IconButton onClick={() => setShowQR(null)} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {showQR && (
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                            <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32' }}>
                                {showQR.employee?.name || 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Employee #: {showQR.employee?.employee_number || 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Amount: <strong>UGX {(showQR.amount || 0).toLocaleString()}</strong>
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Issued: {showQR.issued_at ? new Date(showQR.issued_at).toLocaleString() : 'N/A'}
                            </Typography>
                            <Box sx={{ 
                                p: 3, 
                                bgcolor: '#f5f5f5', 
                                borderRadius: 2,
                                mt: 2,
                                border: '1px dashed #ccc'
                            }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    QR Code Value:
                                </Typography>
                                <Typography variant="body1" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', fontWeight: 'bold' }}>
                                    {showQR.qr_code}
                                </Typography>
                            </Box>
                            <Alert severity="success" sx={{ mt: 2 }}>
                                This QR code is valid for one-time use only. 
                                The employee can present this code at the redemption point.
                            </Alert>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                                Scan this code or enter it manually at the redemption point
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowQR(null)} variant="outlined">
                        Close
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

export default WelfareAllocations;