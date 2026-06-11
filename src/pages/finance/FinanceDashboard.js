// src/pages/FinanceDashboard.js
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
    LinearProgress,
    Divider
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
    AccountBalance,
    LocationOn,
    VerifiedUser,
    AccessTime,
    Assessment,
    TrendingDown
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { apiService } from '../../apiServices/ApiService';
import { APIWelfareDashboard, APIWelfareRedemptionsToday, APIWelfareRedemptions } from '../../apiServices/APIs';
import { formatNumberWithComma } from '../../utils/helpers';
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

const FinanceDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [todayData, setTodayData] = useState(null);
    const [recentRedemptions, setRecentRedemptions] = useState([]);
    const [summary, setSummary] = useState({
        totalRedeemedToday: 0,
        totalAmountToday: 0,
        totalRedeemedThisWeek: 0,
        totalAmountThisWeek: 0,
        totalRedeemedThisMonth: 0,
        totalAmountThisMonth: 0,
        totalRedeemedAllTime: 0,
        totalAmountAllTime: 0,
        uniqueEmployeesToday: 0,
        averageAmountToday: 0,
        topLocation: 'N/A',
        peakHour: 'N/A'
    });
    
    const isMounted = useRef(true);
    const autoRefreshInterval = useRef(null);

    useEffect(() => {
        isMounted.current = true;
        apiService.setToastFunction(() => {});

        // Initial fetch
        fetchFinanceData();

        // Auto-refresh every 30 seconds
        autoRefreshInterval.current = setInterval(() => {
            fetchFinanceData(false);
        }, 30000);

        return () => {
            isMounted.current = false;
            if (autoRefreshInterval.current) {
                clearInterval(autoRefreshInterval.current);
            }
        };
    }, []);

    const fetchFinanceData = async (showLoading = true) => {
        if (showLoading) {
            setLoading(true);
        }
        setError(null);
        
        try {
            // Fetch dashboard, today's redemptions, and all redemptions in parallel
            const [dashboardResult, todayResult, allRedemptionsResult] = await Promise.all([
                apiService.dashbord(APIWelfareDashboard),
                apiService.list(APIWelfareRedemptionsToday),
                apiService.list(APIWelfareRedemptions)
            ]);

            if (isMounted.current) {
                if (dashboardResult.success) {
                    setDashboardData(dashboardResult.data);
                }

                if (todayResult.success) {
                    const todayRedemptions = Array.isArray(todayResult.data) ? todayResult.data : [];
                    setTodayData(todayRedemptions);
                    calculateTodaySummary(todayRedemptions);
                }

                if (allRedemptionsResult.success) {
                    const allRedemptions = Array.isArray(allRedemptionsResult.data) ? allRedemptionsResult.data : [];
                    setRecentRedemptions(allRedemptions.slice(0, 10));
                    calculateOverallSummary(allRedemptions);
                }

                if (!dashboardResult.success && !todayResult.success) {
                    setError('Failed to load finance dashboard data');
                }
            }
        } catch (error) {
            console.error('Error fetching finance dashboard:', error);
            if (isMounted.current && showLoading) {
                setError(error.message || 'An unexpected error occurred');
            }
        } finally {
            if (isMounted.current && showLoading) {
                setLoading(false);
            }
        }
    };

    const calculateTodaySummary = (todayRedemptions) => {
        const totalAmount = todayRedemptions.reduce((sum, r) => sum + parseFloat(r.amount_redeemed || 0), 0);
        const uniqueEmployees = new Set(todayRedemptions.map(r => r.redeemed_by)).size;
        const averageAmount = todayRedemptions.length > 0 ? totalAmount / todayRedemptions.length : 0;

        // Find top location
        const locationCount = {};
        todayRedemptions.forEach(r => {
            if (r.redemption_location) {
                locationCount[r.redemption_location] = (locationCount[r.redemption_location] || 0) + 1;
            }
        });
        const topLocation = Object.entries(locationCount).sort((a, b) => b[1] - a[1])[0];

        // Find peak hour
        const hourCount = {};
        todayRedemptions.forEach(r => {
            if (r.redemption_time) {
                const hour = new Date(r.redemption_time).getHours();
                hourCount[hour] = (hourCount[hour] || 0) + 1;
            }
        });
        const peakHourEntry = Object.entries(hourCount).sort((a, b) => b[1] - a[1])[0];
        const peakHour = peakHourEntry ? `${peakHourEntry[0]}:00 - ${parseInt(peakHourEntry[0]) + 1}:00` : 'N/A';

        setSummary(prev => ({
            ...prev,
            totalRedeemedToday: todayRedemptions.length,
            totalAmountToday: totalAmount,
            uniqueEmployeesToday: uniqueEmployees,
            averageAmountToday: averageAmount,
            topLocation: topLocation ? topLocation[0] : 'N/A',
            peakHour: peakHour
        }));
    };

    const calculateOverallSummary = (allRedemptions) => {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

        const weekRedemptions = allRedemptions.filter(r => 
            new Date(r.redemption_time).toISOString().split('T')[0] >= startOfWeekStr
        );
        const monthRedemptions = allRedemptions.filter(r => 
            new Date(r.redemption_time).toISOString().split('T')[0] >= startOfMonthStr
        );

        const sumAmount = (arr) => arr.reduce((sum, r) => sum + parseFloat(r.amount_redeemed || 0), 0);

        setSummary(prev => ({
            ...prev,
            totalRedeemedThisWeek: weekRedemptions.length,
            totalAmountThisWeek: sumAmount(weekRedemptions),
            totalRedeemedThisMonth: monthRedemptions.length,
            totalAmountThisMonth: sumAmount(monthRedemptions),
            totalRedeemedAllTime: allRedemptions.length,
            totalAmountAllTime: sumAmount(allRedemptions)
        }));
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
                message="Loading Finance Dashboard..."
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
                onRetry={() => fetchFinanceData()}
                title="Unable to Load Finance Dashboard"
                variant="welfare"
                fullPage
                retryText="Retry Loading"
            />
        );
    }

    const todayDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

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
                            <AccountBalance sx={{ fontSize: 40 }} />
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                    Finance Dashboard
                                </Typography>
                                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                    {todayDate}
                                </Typography>
                            </Box>
                        </Box>
                        <Chip 
                            label="Auto-refreshing every 30s" 
                            size="small" 
                            sx={{ 
                                bgcolor: 'rgba(255,255,255,0.2)', 
                                color: 'white',
                                '& .MuiChip-icon': { color: 'white' }
                            }}
                            icon={<AccessTime />}
                        />
                    </Box>
                </Paper>

                {/* Today's Redemption Summary */}
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Today sx={{ color: '#1565C0' }} />
                    Today's Redemption Summary
                </Typography>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Today's Redemptions"
                            value={summary.totalRedeemedToday}
                            icon={<Receipt sx={{ fontSize: 28, color: '#1565C0' }} />}
                            color="primary"
                            subtitle={`${summary.uniqueEmployeesToday} unique employees`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Today's Amount"
                            value={`UGX ${formatNumberWithComma(summary.totalAmountToday)}`}
                            icon={<AttachMoney sx={{ fontSize: 28, color: '#2E7D32' }} />}
                            color="success"
                            subtitle={`Avg: UGX ${formatNumberWithComma(Math.round(summary.averageAmountToday))}`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Top Location"
                            value={summary.topLocation}
                            icon={<LocationOn sx={{ fontSize: 28, color: '#FF9800' }} />}
                            color="warning"
                            subtitle="Most redemptions today"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Peak Hour"
                            value={summary.peakHour}
                            icon={<AccessTime sx={{ fontSize: 28, color: '#9C27B0' }} />}
                            color="secondary"
                            subtitle="Busiest time today"
                        />
                    </Grid>
                </Grid>

                {/* Overall Statistics */}
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Assessment sx={{ color: '#1565C0' }} />
                    Overall Redemption Statistics
                </Typography>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="This Week"
                            value={summary.totalRedeemedThisWeek}
                            icon={<TrendingUp sx={{ fontSize: 28, color: '#FF9800' }} />}
                            color="warning"
                            subtitle={`UGX ${formatNumberWithComma(summary.totalAmountThisWeek)}`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="This Month"
                            value={summary.totalRedeemedThisMonth}
                            icon={<Assessment sx={{ fontSize: 28, color: '#9C27B0' }} />}
                            color="secondary"
                            subtitle={`UGX ${formatNumberWithComma(summary.totalAmountThisMonth)}`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="All Time"
                            value={summary.totalRedeemedAllTime}
                            icon={<Receipt sx={{ fontSize: 28, color: '#1565C0' }} />}
                            color="primary"
                            subtitle={`UGX ${formatNumberWithComma(summary.totalAmountAllTime)}`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Unredeemed Balance"
                            value={`UGX ${formatNumberWithComma(dashboardData?.welfare?.unredeemed_balance || 0)}`}
                            icon={<TrendingDown sx={{ fontSize: 28, color: '#d32f2f' }} />}
                            color="error"
                            subtitle="Pending + Issued"
                        />
                    </Grid>
                </Grid>

                {/* Welfare Status and Today's Activity */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    {/* Status Breakdown */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LunchDining color="primary" />
                                Welfare Status Breakdown
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={4}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Pending sx={{ fontSize: 40, color: '#FF9800' }} />
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            {dashboardData?.status_breakdown?.pending || 0}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Pending
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            UGX {formatNumberWithComma(dashboardData?.welfare?.pending_amount || 0)}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={4}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <QrCodeScanner sx={{ fontSize: 40, color: '#1976D2' }} />
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            {dashboardData?.status_breakdown?.issued || 0}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Issued
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            UGX {formatNumberWithComma(dashboardData?.welfare?.issued_amount || 0)}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={4}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <CheckCircle sx={{ fontSize: 40, color: '#2E7D32' }} />
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            {dashboardData?.status_breakdown?.redeemed || 0}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Redeemed
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            UGX {formatNumberWithComma(dashboardData?.welfare?.total_redeemed || 0)}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 2 }} />

                            {/* Redemption Progress */}
                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Overall Redemption Progress
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Redeemed: UGX {formatNumberWithComma(dashboardData?.welfare?.total_redeemed || 0)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Allocated: UGX {formatNumberWithComma(dashboardData?.welfare?.total_allocated || 0)}
                                    </Typography>
                                </Box>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={dashboardData?.welfare?.total_allocated > 0 
                                        ? ((dashboardData?.welfare?.total_redeemed || 0) / (dashboardData?.welfare?.total_allocated || 1)) * 100 
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
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'right' }}>
                                    {dashboardData?.welfare?.total_allocated > 0 
                                        ? Math.round(((dashboardData?.welfare?.total_redeemed || 0) / dashboardData?.welfare?.total_allocated) * 100) 
                                        : 0}% Redeemed
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Today's Activity */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Today color="primary" />
                                Today's Activity Overview
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                                        <Typography variant="h4" sx={{ color: '#2E7D32', fontWeight: 'bold' }}>
                                            {dashboardData?.today?.allocations || 0}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            New Allocations Today
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                                        <Typography variant="h4" sx={{ color: '#1565C0', fontWeight: 'bold' }}>
                                            {summary.totalRedeemedToday}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Redemptions Today
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#fff3e0', borderRadius: 2 }}>
                                        <Typography variant="h6" sx={{ color: '#FF9800', fontWeight: 'bold' }}>
                                            UGX {formatNumberWithComma(dashboardData?.today?.amount_redeemed || summary.totalAmountToday)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Amount Redeemed Today
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f3e5f5', borderRadius: 2 }}>
                                        <Typography variant="h6" sx={{ color: '#9C27B0', fontWeight: 'bold' }}>
                                            {summary.uniqueEmployeesToday}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Employees Served Today
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Total Employees:</strong> {dashboardData?.employees?.total || 0} 
                                    ({dashboardData?.employees?.active || 0} active)
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Today's Redemption Rate:</strong>{' '}
                                    {dashboardData?.employees?.active > 0 
                                        ? `${Math.round((summary.uniqueEmployeesToday / dashboardData.employees.active) * 100)}%` 
                                        : '0%'} of active employees
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Recent Redemptions Table */}
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Receipt color="primary" />
                                Recent Redemptions
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Employee</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Employee #</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recentRedemptions.length > 0 ? (
                                            recentRedemptions.map((redemption) => {
                                                const employee = redemption.welfare_allocation?.employee || redemption.redeemer || {};
                                                return (
                                                    <TableRow key={redemption.id} hover>
                                                        <TableCell sx={{ fontWeight: 'medium' }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Avatar sx={{ width: 24, height: 24, bgcolor: '#1565C0', fontSize: '0.7rem' }}>
                                                                    {employee.name ? employee.name.charAt(0).toUpperCase() : '?'}
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
                                                        <TableCell>
                                                            <Typography sx={{ color: '#2E7D32', fontWeight: 'medium' }}>
                                                                UGX {formatNumberWithComma(redemption.amount_redeemed || 0)}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            {redemption.redemption_time ? 
                                                                new Date(redemption.redemption_time).toLocaleString() : 
                                                                'N/A'}
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
                                                    </TableRow>
                                                );
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        No redemptions recorded yet
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

export default FinanceDashboard;