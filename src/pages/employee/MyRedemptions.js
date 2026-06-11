// src/pages/MyRedemptions.js
import React, { useState, useEffect, useRef } from 'react';
import {
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Box,
    Chip,
    Button,
    Grid,
    Card,
    CardContent,
    Alert,
    Snackbar,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    IconButton,
    InputAdornment,
    Tooltip,
    Avatar
} from '@mui/material';
import {
    Refresh,
    Receipt,
    Clear,
    DateRange,
    Person,
    LocationOn,
    TrendingUp,
    Today,
    LunchDining,
    Search
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { apiService } from '../../apiServices/ApiService';
import { APIWelfareRedemptionsByEmployee } from '../../apiServices/APIs';
import { formatNumberWithComma, recordsCount, recordsPerPage } from '../../utils/helpers';
import { authService } from '../../apiServices/authService';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';

const MyRedemptions = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [redemptions, setRedemptions] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(recordsPerPage);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [dateFilterType, setDateFilterType] = useState('custom');
    const [summary, setSummary] = useState({
        total: 0,
        totalAmount: 0,
        today: 0,
        todayAmount: 0,
        thisWeek: 0,
        thisWeekAmount: 0,
        thisMonth: 0,
        thisMonthAmount: 0
    });
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
        applyDatePreset();
    }, [dateFilterType]);

    useEffect(() => {
        fetchMyRedemptions();
    }, [dateFrom, dateTo]);

    const showMessage = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const getEmployeeNumber = () => {
        const user = authService.getCurrentUser();
        return user?.employee_number || '';
    };

    const applyDatePreset = () => {
        const today = new Date();
        
        switch(dateFilterType) {
            case 'today':
                setDateFrom(today.toISOString().split('T')[0]);
                setDateTo(today.toISOString().split('T')[0]);
                break;
            case 'week':
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay());
                setDateFrom(startOfWeek.toISOString().split('T')[0]);
                setDateTo(today.toISOString().split('T')[0]);
                break;
            case 'month':
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                setDateFrom(startOfMonth.toISOString().split('T')[0]);
                setDateTo(today.toISOString().split('T')[0]);
                break;
            case 'all':
                setDateFrom('');
                setDateTo('');
                break;
            case 'custom':
            default:
                break;
        }
    };

    const fetchMyRedemptions = async () => {
        const employeeNumber = getEmployeeNumber();
        
        if (!employeeNumber) {
            showMessage('Employee information not found', 'error');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const result = await apiService.list(APIWelfareRedemptionsByEmployee + employeeNumber);

            if (result.success && isMounted.current) {
                let redemptionsData = Array.isArray(result.data) ? result.data : [];
                
                // Apply date filters if set
                if (dateFrom) {
                    redemptionsData = redemptionsData.filter(r => 
                        new Date(r.redemption_time).toISOString().split('T')[0] >= dateFrom
                    );
                }
                if (dateTo) {
                    redemptionsData = redemptionsData.filter(r => 
                        new Date(r.redemption_time).toISOString().split('T')[0] <= dateTo
                    );
                }
                
                setRedemptions(redemptionsData);
                calculateSummary(redemptionsData);
            } else {
                setError(result.message);
                showMessage(result.message || 'Failed to fetch your redemptions', 'error');
            }
        } catch (error) {
            console.error('Error fetching my redemptions:', error);
            setError("Failed to load data");
            showMessage('Error fetching your redemptions', 'error');
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    const calculateSummary = (data) => {
        const today = new Date().toISOString().split('T')[0];
        
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
        
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfMonthStr = startOfMonth.toISOString().split('T')[0];
        
        const todayRedemptions = data.filter(r => 
            new Date(r.redemption_time).toISOString().split('T')[0] === today
        );
        
        const weekRedemptions = data.filter(r => 
            new Date(r.redemption_time).toISOString().split('T')[0] >= startOfWeekStr
        );
        
        const monthRedemptions = data.filter(r => 
            new Date(r.redemption_time).toISOString().split('T')[0] >= startOfMonthStr
        );
        
        const sumAmount = (arr) => 
            arr.reduce((sum, r) => sum + parseFloat(r.amount_redeemed || 0), 0);

        setSummary({
            total: data.length,
            totalAmount: sumAmount(data),
            today: todayRedemptions.length,
            todayAmount: sumAmount(todayRedemptions),
            thisWeek: weekRedemptions.length,
            thisWeekAmount: sumAmount(weekRedemptions),
            thisMonth: monthRedemptions.length,
            thisMonthAmount: sumAmount(monthRedemptions)
        });
    };

    const handleRefresh = () => {
        setSearchTerm('');
        setDateFilterType('all');
        setDateFrom('');
        setDateTo('');
        fetchMyRedemptions();
    };

    const handleClearDates = () => {
        setDateFrom('');
        setDateTo('');
        setDateFilterType('custom');
    };

    const filteredRedemptions = redemptions.filter(redemption => {
        if (searchTerm) {
            const location = redemption.redemption_location?.toLowerCase() || '';
            const remarks = redemption.remarks?.toLowerCase() || '';
            const employeeName = redemption.welfare_allocation?.employee?.name?.toLowerCase() || '';
            const employeeNumber = redemption.welfare_allocation?.employee?.employee_number?.toLowerCase() || '';
            const searchLower = searchTerm.toLowerCase();
            if (!location.includes(searchLower) && 
                !remarks.includes(searchLower) && 
                !employeeName.includes(searchLower) && 
                !employeeNumber.includes(searchLower)) return false;
        }
        return true;
    });

    const paginatedRedemptions = filteredRedemptions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const user = authService.getCurrentUser();

    if (loading) {
        return (
            <LoadingState
                message="Loading Your Redemption History..."
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
                onRetry={fetchMyRedemptions}
                title="Unable to Load Your Redemptions"
                variant="receipt"
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
                                Employee #: {user?.employee_number || 'N/A'} | Here's your lunch welfare redemption history
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
                                            My Total Redemptions
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                            {summary.total}
                                        </Typography>
                                    </Box>
                                    <Receipt sx={{ fontSize: 40, color: '#1976D2' }} />
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Total Amount: UGX {formatNumberWithComma(summary.totalAmount)}
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
                                            Today's Redemptions
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                            {summary.today}
                                        </Typography>
                                    </Box>
                                    <Today sx={{ fontSize: 40, color: '#2E7D32' }} />
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Amount: UGX {formatNumberWithComma(summary.todayAmount)}
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
                                            This Week
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                            {summary.thisWeek}
                                        </Typography>
                                    </Box>
                                    <TrendingUp sx={{ fontSize: 40, color: '#FF9800' }} />
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Amount: UGX {formatNumberWithComma(summary.thisWeekAmount)}
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
                                            This Month
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                            {summary.thisMonth}
                                        </Typography>
                                    </Box>
                                    <DateRange sx={{ fontSize: 40, color: '#9C27B0' }} />
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Amount: UGX {formatNumberWithComma(summary.thisMonthAmount)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LunchDining sx={{ color: '#2E7D32' }} />
                        My Redemption History ({recordsCount(filteredRedemptions.length)} Records)
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                        <TextField
                            placeholder="Search by name, number, location or remarks..."
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
                                            <Clear fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        
                        <FormControl size="small" sx={{ minWidth: 130 }}>
                            <InputLabel>Date Range</InputLabel>
                            <Select
                                value={dateFilterType}
                                onChange={(e) => setDateFilterType(e.target.value)}
                                label="Date Range"
                            >
                                <MenuItem value="all">All Time</MenuItem>
                                <MenuItem value="custom">Custom Range</MenuItem>
                                <MenuItem value="today">Today</MenuItem>
                                <MenuItem value="week">This Week</MenuItem>
                                <MenuItem value="month">This Month</MenuItem>
                            </Select>
                        </FormControl>

                        {dateFilterType === 'custom' && (
                            <>
                                <TextField
                                    type="date"
                                    size="small"
                                    label="From Date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ minWidth: 150 }}
                                />
                                <TextField
                                    type="date"
                                    size="small"
                                    label="To Date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ minWidth: 150 }}
                                />
                                {(dateFrom || dateTo) && (
                                    <Button 
                                        size="small" 
                                        onClick={handleClearDates}
                                        startIcon={<Clear />}
                                        variant="outlined"
                                    >
                                        Clear Dates
                                    </Button>
                                )}
                            </>
                        )}
                        
                        <Button 
                            variant="outlined" 
                            onClick={handleRefresh} 
                            startIcon={<Refresh />}
                        >
                            Refresh
                        </Button>
                    </Box>

                    {filteredRedemptions.length === 0 && !loading && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            No redemption records found for your account.
                        </Alert>
                    )}

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableCell>#</TableCell>
                                    <TableCell>Employee</TableCell>
                                    <TableCell>Employee #</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                    <TableCell>Redemption Time</TableCell>
                                    <TableCell>Location</TableCell>
                                    <TableCell>Remarks</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedRedemptions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                                                No redemption records found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedRedemptions.map((redemption, index) => (
                                        <TableRow key={redemption.id} hover>
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
                                                        {redemption.welfare_allocation?.employee?.name ? 
                                                            redemption.welfare_allocation.employee.name.charAt(0).toUpperCase() : 
                                                            <Person fontSize="small" />}
                                                    </Avatar>
                                                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                        {redemption.welfare_allocation?.employee?.name || 'N/A'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={redemption.welfare_allocation?.employee?.employee_number || 'N/A'} 
                                                    size="small" 
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography sx={{ color: '#2E7D32', fontWeight: 'bold' }}>
                                                    UGX {formatNumberWithComma(redemption.amount_redeemed || 0)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title={new Date(redemption.redemption_time)}>
                                                    <span>
                                                        <Typography variant="body2">
                                                            {new Date(redemption.redemption_time).toLocaleDateString()}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {new Date(redemption.redemption_time).toLocaleTimeString()}
                                                        </Typography>
                                                    </span>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>
                                                {redemption.redemption_location ? (
                                                    <Chip 
                                                        icon={<LocationOn />}
                                                        label={redemption.redemption_location} 
                                                        size="small" 
                                                        variant="outlined"
                                                    />
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {redemption.remarks ? (
                                                    <Tooltip title={redemption.remarks}>
                                                        <Typography variant="body2" sx={{ maxWidth: 200 }}>
                                                            {redemption.remarks.length > 50 ? 
                                                                `${redemption.remarks.substring(0, 50)}...` : 
                                                                redemption.remarks}
                                                        </Typography>
                                                    </Tooltip>
                                                ) : '-'}
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
                        count={filteredRedemptions.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                    />
                </Paper>

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

export default MyRedemptions;