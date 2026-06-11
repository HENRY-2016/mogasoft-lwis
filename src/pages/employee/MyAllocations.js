// src/pages/MyAllocations.js
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
    Card,
    CardContent,
    Avatar
} from '@mui/material';
import {
    Refresh,
    Search,
    CheckCircle,
    QrCodeScanner,
    Close as CloseIcon,
    AttachMoney,
    CalendarToday,
    QrCode as QrCodeIcon,
    LunchDining,
    Receipt,
    Pending,
    Person
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { apiService } from '../../apiServices/ApiService';
import { APIWelfareAllocationsByEmployee } from '../../apiServices/APIs';
import { formatNumberWithComma, recordsCount, recordsPerPage } from '../../utils/helpers';
import { authService } from '../../apiServices/authService';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';

const MyAllocations = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [allocations, setAllocations] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(recordsPerPage);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showQR, setShowQR] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        apiService.setToastFunction(showMessage);

        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        fetchMyAllocations();
    }, []);

    const showMessage = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const getEmployeeNumber = () => {
        const user = authService.getCurrentUser();
        return user?.employee_number || '';
    };

    const fetchMyAllocations = async () => {
        const employeeNumber = getEmployeeNumber();
        
        if (!employeeNumber) {
            showMessage('Employee information not found', 'error');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const result = await apiService.list(APIWelfareAllocationsByEmployee + employeeNumber);

            if (result.success && isMounted.current) {
                let allocationsData = Array.isArray(result.data) ? result.data : [];
                setAllocations(allocationsData);
            } else {
                setError(result.message);
                showMessage(result.message || 'Failed to fetch your allocations', 'error');
            }
        } catch (error) {
            console.error('Error fetching my allocations:', error);
            setError("Failed to load data");
            showMessage('Error fetching your allocations', 'error');
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    const handleRefresh = () => {
        setSearchTerm('');
        setStatusFilter('');
        fetchMyAllocations();
    };

    const getStatusChip = (status) => {
        const config = {
            pending: { label: 'Pending', color: 'warning', icon: <Pending fontSize="small" /> },
            issued: { label: 'Issued', color: 'primary', icon: <QrCodeScanner fontSize="small" /> },
            redeemed: { label: 'Redeemed', color: 'success', icon: <CheckCircle fontSize="small" /> },
            expired: { label: 'Expired', color: 'default', icon: null }
        };
        const { label, color, icon } = config[status] || { label: status, color: 'default', icon: null };
        return <Chip label={label} color={color} size="small" icon={icon} />;
    };

    const filteredAllocations = allocations.filter(allocation => {
        if (searchTerm) {
            const amountStr = String(allocation.amount || '');
            const employeeName = allocation.employee?.name?.toLowerCase() || '';
            const employeeNumber = allocation.employee?.employee_number?.toLowerCase() || '';
            const searchLower = searchTerm.toLowerCase();
            if (!amountStr.includes(searchLower) && 
                !employeeName.includes(searchLower) && 
                !employeeNumber.includes(searchLower)) return false;
        }
        if (statusFilter && allocation.status !== statusFilter) return false;
        return true;
    });

    const paginatedAllocations = filteredAllocations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const totalAmount = allocations.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);
    const pendingCount = allocations.filter(a => a.status === 'pending').length;
    const issuedCount = allocations.filter(a => a.status === 'issued').length;
    const redeemedCount = allocations.filter(a => a.status === 'redeemed').length;

    const user = authService.getCurrentUser();

    if (loading) {
        return (
            <LoadingState
                message="Loading Your Allocations..."
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
                onRetry={fetchMyAllocations}
                title="Unable to Load Your Allocations"
                variant="allocation"
                fullPage
                retryText="Retry Loading"
            />
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Box>
                {/* Welcome Banner */}
                <Paper sx={{ p: 3, borderRadius: 3, mb: 3, background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)', color: 'white' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 56, height: 56, bgcolor: 'white', color: '#2E7D32', fontWeight: 'bold', fontSize: '1.5rem' }}>
                            {user?.name ? user.name.charAt(0).toUpperCase() : <Person />}
                        </Avatar>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                Welcome, {user?.name || 'Employee'}!
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                Employee #: {user?.employee_number || 'N/A'} | Here's your lunch welfare allocation summary
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                {/* Summary Cards */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 3, height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography color="text.secondary" gutterBottom variant="body2">
                                            My Total Allocations
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                            {allocations.length}
                                        </Typography>
                                    </Box>
                                    <Receipt sx={{ fontSize: 40, color: '#1976D2' }} />
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Total Amount: UGX {formatNumberWithComma(totalAmount)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 3, height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography color="text.secondary" gutterBottom variant="body2">
                                            Pending
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                            {pendingCount}
                                        </Typography>
                                    </Box>
                                    <Pending sx={{ fontSize: 40, color: '#FF9800' }} />
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Awaiting issuance
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 3, height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography color="text.secondary" gutterBottom variant="body2">
                                            Issued
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                            {issuedCount}
                                        </Typography>
                                    </Box>
                                    <QrCodeScanner sx={{ fontSize: 40, color: '#1976D2' }} />
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Ready for redemption
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 3, height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography color="text.secondary" gutterBottom variant="body2">
                                            Redeemed
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                            {redeemedCount}
                                        </Typography>
                                    </Box>
                                    <CheckCircle sx={{ fontSize: 40, color: '#2E7D32' }} />
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Successfully claimed
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LunchDining sx={{ color: '#2E7D32' }} />
                            My Allocations ({recordsCount(allocations.length)} Total)
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                        <TextField
                            placeholder="Search by name, number or amount..."
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
                                    <TableCell>Employee</TableCell>
                                    <TableCell>Employee #</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Allocation Date</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>QR Code</TableCell>
                                    <TableCell align="center">Action</TableCell>
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
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar sx={{ width: 28, height: 28, bgcolor: '#2E7D32', fontSize: '0.8rem' }}>
                                                        {allocation.employee?.name ? allocation.employee.name.charAt(0).toUpperCase() : <Person fontSize="small" />}
                                                    </Avatar>
                                                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                        {allocation.employee?.name || 'N/A'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={allocation.employee?.employee_number || 'N/A'} 
                                                    size="small" 
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography sx={{ color: '#2E7D32', fontWeight: 'medium' }}>
                                                    UGX {formatNumberWithComma(allocation.amount || 0)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {allocation.allocation_date ? new Date(allocation.allocation_date).toLocaleDateString() : 'N/A'}
                                            </TableCell>
                                            <TableCell>{getStatusChip(allocation.status)}</TableCell>
                                            <TableCell>
                                                {allocation.qr_code && allocation.status === 'issued' && (
                                                    <Tooltip title="View QR Code">
                                                        <IconButton size="small" onClick={() => setShowQR(allocation)} color="primary">
                                                            <QrCodeIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                {allocation.status === 'issued' && (
                                                    <Chip
                                                        icon={<QrCodeScanner />}
                                                        label="Ready for Redemption"
                                                        color="primary"
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                )}
                                                {allocation.status === 'pending' && (
                                                    <Chip
                                                        icon={<Pending />}
                                                        label="Awaiting Issuance"
                                                        color="warning"
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
                                                        icon={<CheckCircle />}
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

                {/* QR Code Dialog */}
                <Dialog
                    open={!!showQR}
                    onClose={(event, reason) => {
                        if (reason !== 'backdropClick') {
                            setShowQR(null);
                        }
                    }}
                    maxWidth="xs"
                    fullWidth
                >
                    <DialogTitle align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h6">Your Welfare QR Code</Typography>
                            <IconButton onClick={() => setShowQR(null)} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        {showQR && (
                            <Box sx={{ textAlign: 'center', py: 2 }}>
                                <Avatar sx={{ width: 64, height: 64, bgcolor: '#2E7D32', mx: 'auto', mb: 2, fontSize: '1.5rem' }}>
                                    {user?.name ? user.name.charAt(0).toUpperCase() : <Person />}
                                </Avatar>
                                <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32' }}>
                                    {user?.name || 'N/A'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Employee #: {user?.employee_number || 'N/A'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Amount: <strong>UGX {formatNumberWithComma(showQR.amount || 0)}</strong>
                                </Typography>
                                <Box sx={{ 
                                    p: 3, 
                                    bgcolor: '#f5f5f5', 
                                    borderRadius: 2,
                                    mt: 2,
                                    border: '1px dashed #ccc'
                                }}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Your QR Code:
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', fontWeight: 'bold' }}>
                                        {showQR.qr_code}
                                    </Typography>
                                </Box>
                                <Alert severity="success" sx={{ mt: 2 }}>
                                    Present this QR code at the redemption point to claim your lunch welfare.
                                </Alert>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowQR(null)} variant="outlined">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>

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
        </motion.div>
    );
};

export default MyAllocations;