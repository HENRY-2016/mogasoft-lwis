// src/pages/TodaysRedemptions.js
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
    TextField,
    Box,
    Chip,
    InputAdornment,
    Button,
    Grid,
    Card,
    CardContent,
    IconButton,
    Tooltip,
    Alert,
    Snackbar,
    TableFooter,
    Avatar
} from '@mui/material';
import {
    Search,
    Refresh,
    CheckCircle,
    Receipt,
    Clear,
    Person,
    LocationOn,
    Today,
    LunchDining,
    AttachMoney,
    Restaurant,
    AccessTime,
    VerifiedUser
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { apiService } from '../../apiServices/ApiService';
import { APIWelfareRedemptionsToday } from '../../apiServices/APIs';
import { formatNumberWithComma, recordsCount, recordsPerPage } from '../../utils/helpers';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';

const TodaysRedemptions = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [redemptions, setRedemptions] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(recordsPerPage);
    const [searchTerm, setSearchTerm] = useState('');
    const [summary, setSummary] = useState({
        totalCount: 0,
        totalAmount: 0,
        uniqueEmployees: 0,
        averageAmount: 0
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [lastUpdated, setLastUpdated] = useState(null);

    const isMounted = useRef(true);
    const autoRefreshInterval = useRef(null);

    useEffect(() => {
        isMounted.current = true;
        apiService.setToastFunction(showMessage);

        // Initial fetch
        fetchTodaysRedemptions();

        // Auto-refresh every 30 seconds
        autoRefreshInterval.current = setInterval(() => {
            fetchTodaysRedemptions(false); // Silent refresh without showing loading
        }, 30000);

        return () => {
            isMounted.current = false;
            if (autoRefreshInterval.current) {
                clearInterval(autoRefreshInterval.current);
            }
        };
    }, []);

    const showMessage = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const fetchTodaysRedemptions = async (showLoading = true) => {
        if (showLoading) {
            setLoading(true);
        }
        setError(null);
        
        try {
            const result = await apiService.list(APIWelfareRedemptionsToday);

            if (result.success && isMounted.current) {
                let redemptionsData = Array.isArray(result.data) ? result.data : [];
                setRedemptions(redemptionsData);
                calculateSummary(redemptionsData);
                setLastUpdated(new Date());
                
                // Use server summary if available
                if (result.summary) {
                    setSummary(prev => ({
                        ...prev,
                        totalCount: result.summary.total_count || redemptionsData.length,
                        totalAmount: result.summary.total_amount || calculateTotal(redemptionsData),
                    }));
                }
            } else {
                if (showLoading) {
                    setError(result.message);
                    showMessage(result.message || 'Failed to fetch today\'s redemptions', 'error');
                }
            }
        } catch (error) {
            console.error('Error fetching today\'s redemptions:', error);
            if (showLoading) {
                setError("Failed to load data");
                showMessage('Error fetching today\'s redemptions', 'error');
            }
        } finally {
            if (isMounted.current && showLoading) {
                setLoading(false);
            }
        }
    };

    const calculateTotal = (data) => {
        return data.reduce((sum, r) => sum + parseFloat(r.amount_redeemed || 0), 0);
    };

    const calculateSummary = (data) => {
        const totalAmount = calculateTotal(data);
        const uniqueEmployees = new Set(data.map(r => r.welfare_allocation?.employee?.id || r.redeemed_by)).size;
        const averageAmount = data.length > 0 ? totalAmount / data.length : 0;

        setSummary({
            totalCount: data.length,
            totalAmount: totalAmount,
            uniqueEmployees: uniqueEmployees,
            averageAmount: averageAmount
        });
    };

    const handleRefresh = () => {
        setSearchTerm('');
        fetchTodaysRedemptions();
    };

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    const filteredRedemptions = redemptions.filter(redemption => {
        if (searchTerm) {
            const employeeName = redemption.welfare_allocation?.employee?.name?.toLowerCase() || redemption.redeemer?.name?.toLowerCase() || '';
            const employeeNumber = redemption.welfare_allocation?.employee?.employee_number?.toLowerCase() || redemption.redeemer?.employee_number?.toLowerCase() || '';
            const location = redemption.redemption_location?.toLowerCase() || '';
            const searchLower = searchTerm.toLowerCase();
            
            if (!employeeName.includes(searchLower) && 
                !employeeNumber.includes(searchLower) && 
                !location.includes(searchLower)) return false;
        }
        return true;
    });

    const paginatedRedemptions = filteredRedemptions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // Calculate total for filtered results
    const filteredTotalAmount = calculateTotal(filteredRedemptions);

    // Format current date
    const todayDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    if (loading) {
        return (
            <LoadingState
                message="Loading Today's Redemptions..."
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
                onRetry={handleRefresh}
                title="Unable to Load Today's Redemptions"
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
                {/* Header Banner */}
                <Paper sx={{ 
                    p: 3, 
                    borderRadius: 3, 
                    mb: 3, 
                    background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)', 
                    color: 'white' 
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Today sx={{ fontSize: 40 }} />
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                    Today's Redemptions
                                </Typography>
                                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                    {todayDate}
                                </Typography>
                            </Box>
                        </Box>
                        {lastUpdated && (
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
                                    Last updated: {lastUpdated.toLocaleTimeString()}
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                    Auto-refreshes every 30 seconds
                                </Typography>
                            </Box>
                        )}
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
                                            Total Redemptions
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                            {summary.totalCount}
                                        </Typography>
                                    </Box>
                                    <Receipt sx={{ fontSize: 40, color: '#1976D2' }} />
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Today's transactions
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
                                            Total Amount
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
                                            UGX {formatNumberWithComma(summary.totalAmount)}
                                        </Typography>
                                    </Box>
                                    <AttachMoney sx={{ fontSize: 40, color: '#2E7D32' }} />
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Total value redeemed
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
                                            Unique Employees
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                            {summary.uniqueEmployees}
                                        </Typography>
                                    </Box>
                                    <VerifiedUser sx={{ fontSize: 40, color: '#9C27B0' }} />
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Employees served today
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
                                            Average Amount
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                                            UGX {formatNumberWithComma(Math.round(summary.averageAmount))}
                                        </Typography>
                                    </Box>
                                    <Restaurant sx={{ fontSize: 40, color: '#FF9800' }} />
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Per redemption average
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LunchDining sx={{ color: '#2E7D32' }} />
                            Today's Redemption Records ({recordsCount(filteredRedemptions.length)} Records)
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Chip 
                                icon={<AccessTime />}
                                label={`Last updated: ${lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}`}
                                size="small"
                                variant="outlined"
                                color="primary"
                            />
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                        <TextField
                            placeholder="Search by employee name, number or location..."
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
                                        <IconButton size="small" onClick={handleClearSearch}>
                                            <Clear fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        
                        <Button 
                            variant="outlined" 
                            onClick={handleRefresh} 
                            startIcon={<Refresh />}
                        >
                            Refresh Now
                        </Button>
                    </Box>

                    {filteredRedemptions.length === 0 && !loading ? (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            No redemptions recorded for today yet. Check back later or refresh the page.
                        </Alert>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                        <TableCell>#</TableCell>
                                        <TableCell>Employee</TableCell>
                                        <TableCell>Employee #</TableCell>
                                        <TableCell align="right">Amount</TableCell>
                                        <TableCell>Time</TableCell>
                                        <TableCell>Location</TableCell>
                                        <TableCell>Remarks</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedRedemptions.map((redemption, index) => {
                                        const employee = redemption.welfare_allocation?.employee || redemption.redeemer || {};
                                        return (
                                            <TableRow key={redemption.id} hover>
                                                <TableCell>
                                                    <Chip
                                                        label={page * rowsPerPage + index + 1}
                                                        color="primary"
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 'medium' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Avatar sx={{ width: 28, height: 28, bgcolor: '#1565C0', fontSize: '0.8rem' }}>
                                                            {employee.name ? employee.name.charAt(0).toUpperCase() : <Person fontSize="small" />}
                                                        </Avatar>
                                                        {employee.name || 'N/A'}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={employee.employee_number || 'N/A'} 
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
                                                    <Tooltip title={new Date(redemption.redemption_time).toLocaleString()}>
                                                        <Box>
                                                            <Typography variant="body2">
                                                                {new Date(redemption.redemption_time).toLocaleTimeString()}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {new Date(redemption.redemption_time).toLocaleDateString()}
                                                            </Typography>
                                                        </Box>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell>
                                                    {redemption.redemption_location ? (
                                                        <Chip 
                                                            icon={<LocationOn />}
                                                            label={redemption.redemption_location} 
                                                            size="small" 
                                                            variant="outlined"
                                                            color="info"
                                                        />
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {redemption.remarks ? (
                                                        <Tooltip title={redemption.remarks}>
                                                            <Typography variant="body2" sx={{ maxWidth: 150 }}>
                                                                {redemption.remarks.length > 30 ? 
                                                                    `${redemption.remarks.substring(0, 30)}...` : 
                                                                    redemption.remarks}
                                                            </Typography>
                                                        </Tooltip>
                                                    ) : '-'}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                                <TableFooter>
                                    <TableRow sx={{ 
                                        backgroundColor: '#e8f5e9',
                                        '& td': { fontWeight: 'bold' }
                                    }}>
                                        <TableCell colSpan={4} align="right">
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                Total for Displayed Records:
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
                                                UGX {formatNumberWithComma(filteredTotalAmount)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell colSpan={3}></TableCell>
                                    </TableRow>
                                    {searchTerm && filteredTotalAmount !== summary.totalAmount && (
                                        <TableRow sx={{ backgroundColor: '#fff3e0' }}>
                                            <TableCell colSpan={4} align="right">
                                                <Typography variant="body2" color="text.secondary">
                                                    Grand Total (All Today's Redemptions):
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                                                    UGX {formatNumberWithComma(summary.totalAmount)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell colSpan={3}></TableCell>
                                        </TableRow>
                                    )}
                                </TableFooter>
                            </Table>
                        </TableContainer>
                    )}

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

                    {/* Bottom Summary */}
                    {filteredRedemptions.length > 0 && (
                        <Box sx={{ 
                            mt: 3, 
                            p: 2, 
                            bgcolor: '#e3f2fd', 
                            borderRadius: 2,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 2
                        }}>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Showing {paginatedRedemptions.length} of {filteredRedemptions.length} records
                                    {searchTerm && ` (filtered from ${redemptions.length} total)`}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 3 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Displayed Total
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
                                        UGX {formatNumberWithComma(filteredTotalAmount)}
                                    </Typography>
                                </Box>
                                {searchTerm && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Grand Total Today
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1565C0' }}>
                                            UGX {formatNumberWithComma(summary.totalAmount)}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    )}
                </Paper>

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
        </motion.div>
    );
};

export default TodaysRedemptions;