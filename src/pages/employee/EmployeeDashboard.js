// src/pages/EmployeeDashboard.js
import React, { useState, useEffect, useRef } from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Avatar,
    Divider,
    LinearProgress
} from '@mui/material';
import {
    People,
    Restaurant,
    Receipt,
    TrendingUp,
    Pending,
    CheckCircle,
    QrCodeScanner,
    Today,
    AttachMoney,
    LunchDining,
    Person,
    Badge,
    Email,
    Phone,
    Business,
    Work,
    CalendarToday,
    Info
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { apiService } from '../../apiServices/ApiService';
import { 
    APIWelfareAllocationsByEmployee, 
    APIWelfareRedemptionsByEmployee,
} from '../../apiServices/APIs';
import { formatNumberWithComma } from '../../utils/helpers';
import { authService } from '../../apiServices/authService';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';

const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ 
        height: '100%', 
        borderRadius: 3, 
        transition: 'transform 0.2s', 
        '&:hover': { 
            transform: 'translateY(-4px)', 
            boxShadow: 6 
        }
    }}>
        <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                    {title}
                </Typography>
                <Box sx={{ 
                    p: 1, 
                    borderRadius: 2, 
                    bgcolor: `${color}.light`,
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    {icon}
                </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {value}
            </Typography>
            {subtitle && (
                <Typography variant="body2" color="text.secondary">
                    {subtitle}
                </Typography>
            )}
        </CardContent>
    </Card>
);

const EmployeeDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [employeeData, setEmployeeData] = useState(null);
    const [allocations, setAllocations] = useState([]);
    const [redemptions, setRedemptions] = useState([]);
    const [summary, setSummary] = useState({
        totalAllocated: 0,
        totalRedeemed: 0,
        balance: 0,
        pendingAllocations: 0,
        issuedAllocations: 0,
        redeemedAllocations: 0,
        todayRedemptions: 0,
        todayAmount: 0
    });
    
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        apiService.setToastFunction(() => {});

        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        fetchEmployeeDashboard();
    }, []);

    const getEmployeeNumber = () => {
        const user = authService.getCurrentUser();
        return user?.employee_number || '';
    };

    const fetchEmployeeDashboard = async () => {
        const employeeNumber = getEmployeeNumber();
        
        if (!employeeNumber) {
            setError('Employee information not found');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            // Fetch allocations and redemptions in parallel
            const [allocationsResult, redemptionsResult] = await Promise.all([
                apiService.list(APIWelfareAllocationsByEmployee + employeeNumber),
                apiService.list(APIWelfareRedemptionsByEmployee + employeeNumber)
            ]);

            if (isMounted.current) {
                if (allocationsResult.success && redemptionsResult.success) {
                    const allocationsData = Array.isArray(allocationsResult.data) ? allocationsResult.data : [];
                    const redemptionsData = Array.isArray(redemptionsResult.data) ? redemptionsResult.data : [];
                    
                    setAllocations(allocationsData);
                    setRedemptions(redemptionsData);
                    
                    // Get employee info from the first allocation or redemption
                    const employeeInfo = allocationsData[0]?.employee || 
                                        redemptionsData[0]?.welfare_allocation?.employee ||
                                        redemptionsData[0]?.redeemer ||
                                        authService.getCurrentUser();
                    
                    setEmployeeData(employeeInfo);
                    
                    // Calculate summary
                    calculateSummary(allocationsData, redemptionsData);
                } else {
                    const errorMsg = allocationsResult.message || redemptionsResult.message || 'Failed to load dashboard data';
                    setError(errorMsg);
                }
            }
        } catch (error) {
            console.error('Error fetching employee dashboard:', error);
            if (isMounted.current) {
                setError(error.message || 'An unexpected error occurred');
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    const calculateSummary = (allocationsData, redemptionsData) => {
        const today = new Date().toISOString().split('T')[0];
        
        const totalAllocated = allocationsData.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);
        const totalRedeemed = redemptionsData.reduce((sum, r) => sum + (parseFloat(r.amount_redeemed) || 0), 0);
        
        const pendingAllocations = allocationsData.filter(a => a.status === 'pending').length;
        const issuedAllocations = allocationsData.filter(a => a.status === 'issued').length;
        const redeemedAllocations = allocationsData.filter(a => a.status === 'redeemed').length;
        
        const todayRedemptions = redemptionsData.filter(r => 
            new Date(r.redemption_time).toISOString().split('T')[0] === today
        );
        
        const todayAmount = todayRedemptions.reduce((sum, r) => sum + (parseFloat(r.amount_redeemed) || 0), 0);
        
        setSummary({
            totalAllocated,
            totalRedeemed,
            balance: totalAllocated - totalRedeemed,
            pendingAllocations,
            issuedAllocations,
            redeemedAllocations,
            todayRedemptions: todayRedemptions.length,
            todayAmount
        });
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

    if (loading) {
        return (
            <LoadingState
                message="Loading Your Dashboard..."
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
                onRetry={fetchEmployeeDashboard}
                title="Unable to Load Dashboard"
                variant="welfare"
                fullPage
                retryText="Retry Loading"
            />
        );
    }

    const user = authService.getCurrentUser();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Box>
                {/* Welcome Banner */}
                <Paper sx={{ 
                    p: 3, 
                    borderRadius: 3, 
                    mb: 3, 
                    background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)', 
                    color: 'white' 
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ 
                            width: 64, 
                            height: 64, 
                            bgcolor: 'white', 
                            color: '#2E7D32', 
                            fontWeight: 'bold', 
                            fontSize: '1.8rem' 
                        }}>
                            {user?.name ? user.name.charAt(0).toUpperCase() : <Person />}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                Welcome back, {user?.name || 'Employee'}!
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                Employee #: {user?.employee_number || 'N/A'}
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                {new Date().toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                {/* Employee Info Card */}
                <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Info color="primary" />
                        Your Information
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Person color="action" fontSize="small" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Name</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                        {user?.name || 'N/A'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Badge color="action" fontSize="small" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Employee #</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                        {user?.employee_number || 'N/A'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Email color="action" fontSize="small" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Email</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                        {user?.email || 'N/A'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Business color="action" fontSize="small" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Department</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                        {user?.department || 'N/A'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Welfare Summary Cards */}
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LunchDining sx={{ color: '#2E7D32' }} />
                    Your Welfare Summary
                </Typography>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Allocated"
                            value={`UGX ${formatNumberWithComma(summary.totalAllocated)}`}
                            icon={<Restaurant sx={{ fontSize: 28, color: '#2E7D32' }} />}
                            color="success"
                            subtitle={`${allocations.length} allocations`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Redeemed"
                            value={`UGX ${formatNumberWithComma(summary.totalRedeemed)}`}
                            icon={<Receipt sx={{ fontSize: 28, color: '#FF9800' }} />}
                            color="warning"
                            subtitle={`${summary.redeemedAllocations} redemptions`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Available Balance"
                            value={`UGX ${formatNumberWithComma(summary.balance)}`}
                            icon={<TrendingUp sx={{ fontSize: 28, color: '#9C27B0' }} />}
                            color="secondary"
                            subtitle={`${summary.issuedAllocations} ready to redeem`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Today's Activity"
                            value={summary.todayRedemptions}
                            icon={<Today sx={{ fontSize: 28, color: '#1976D2' }} />}
                            color="primary"
                            subtitle={`UGX ${formatNumberWithComma(summary.todayAmount)} redeemed`}
                        />
                    </Grid>
                </Grid>

                {/* Welfare Progress */}
                <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                        Welfare Utilization
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Redeemed
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
                                {summary.totalAllocated > 0 
                                    ? Math.round((summary.totalRedeemed / summary.totalAllocated) * 100) 
                                    : 0}%
                            </Typography>
                        </Box>
                        <LinearProgress 
                            variant="determinate" 
                            value={summary.totalAllocated > 0 
                                ? (summary.totalRedeemed / summary.totalAllocated) * 100 
                                : 0
                            } 
                            sx={{ 
                                height: 10, 
                                borderRadius: 5,
                                backgroundColor: '#e0e0e0',
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: '#2E7D32',
                                    borderRadius: 5,
                                }
                            }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">
                            Total Allocated: UGX {formatNumberWithComma(summary.totalAllocated)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Total Redeemed: UGX {formatNumberWithComma(summary.totalRedeemed)}
                        </Typography>
                    </Box>
                </Paper>

                {/* Status Breakdown */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
                            <Pending sx={{ fontSize: 48, color: '#FF9800', mb: 1 }} />
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                                {summary.pendingAllocations}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Pending Allocations
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Awaiting issuance
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
                            <QrCodeScanner sx={{ fontSize: 48, color: '#1976D2', mb: 1 }} />
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976D2' }}>
                                {summary.issuedAllocations}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Issued Allocations
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Ready for redemption
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
                            <CheckCircle sx={{ fontSize: 48, color: '#2E7D32', mb: 1 }} />
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
                                {summary.redeemedAllocations}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Redeemed Allocations
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Successfully claimed
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Recent Activity Tables */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Restaurant color="primary" />
                                Your Recent Allocations
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {allocations.length > 0 ? (
                                            allocations.slice(0, 5).map((allocation) => (
                                                <TableRow key={allocation.id} hover>
                                                    <TableCell>
                                                        <Typography sx={{ color: '#2E7D32', fontWeight: 'medium' }}>
                                                            UGX {formatNumberWithComma(allocation.amount || 0)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        {allocation.allocation_date ? new Date(allocation.allocation_date).toLocaleDateString() : 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusChip(allocation.status)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        No allocations yet
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Receipt color="primary" />
                                Your Recent Redemptions
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {redemptions.length > 0 ? (
                                            redemptions.slice(0, 5).map((redemption) => (
                                                <TableRow key={redemption.id} hover>
                                                    <TableCell>
                                                        <Typography sx={{ color: '#2E7D32', fontWeight: 'medium' }}>
                                                            UGX {formatNumberWithComma(redemption.amount_redeemed || 0)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        {redemption.redemption_time ? new Date(redemption.redemption_time).toLocaleString() : 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {redemption.redemption_location ? (
                                                            <Chip 
                                                                label={redemption.redemption_location} 
                                                                size="small" 
                                                                variant="outlined"
                                                            />
                                                        ) : '-'}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        No redemptions yet
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </motion.div>
    );
};

export default EmployeeDashboard;