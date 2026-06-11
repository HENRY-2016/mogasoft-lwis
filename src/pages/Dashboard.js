// src/pages/Dashboard.js
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
    Chip
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
    LunchDining
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { apiService } from '../apiServices/ApiService';
import { APIWelfareDashboard } from '../apiServices/APIs';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

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
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 'medium' }}>
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

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    
    // Use ref to track if component is mounted
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        apiService.setToastFunction(() => {}); // Dashboard doesn't need toast notifications

        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        setLoading(true);
        setError(null);
        try {
            // Using apiService.list without branch_id parameter
            const result = await apiService.dashbord(APIWelfareDashboard);
            console.log("result"+JSON.stringify((result.data)))
            // Check if the request was successful
            if (result.success && isMounted.current) {
                setData(result.data);
            } else {
                setError(result.message || 'Failed to load dashboard data');
                console.error('Dashboard fetch failed:', result.message);
            }
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            setError(error.message || 'An unexpected error occurred');
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    if (loading) {
        return (
            <LoadingState
                message="Loading Dashboard Data..."
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
                onRetry={fetchDashboard}
                title="Unable to Load Dashboard"
                variant="welfare"
                fullPage
                retryText="Retry Loading"
            />
        );
    }

    if (!data) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Box>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LunchDining sx={{ color: '#2E7D32' }} />
                    Dashboard Overview
                </Typography>

                {/* Statistics Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Employees"
                            value={data.employees?.total || 0}
                            icon={<People sx={{ fontSize: 30, color: '#1976D2' }} />}
                            color="primary"
                            subtitle={`${data.employees?.active || 0} Active`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Allocated"
                            value={`UGX ${(data.welfare?.total_allocated || 0).toLocaleString()}`}
                            icon={<Restaurant sx={{ fontSize: 30, color: '#2E7D32' }} />}
                            color="success"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Redeemed"
                            value={`UGX ${(data.welfare?.total_redeemed || 0).toLocaleString()}`}
                            icon={<Receipt sx={{ fontSize: 30, color: '#FF9800' }} />}
                            color="warning"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Unredeemed Balance"
                            value={`UGX ${(data.welfare?.unredeemed_balance || 0).toLocaleString()}`}
                            icon={<TrendingUp sx={{ fontSize: 30, color: '#9C27B0' }} />}
                            color="secondary"
                        />
                    </Grid>
                </Grid>

                {/* Today's Activity and Status Breakdown */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Today color="primary" />
                                Today's Activity
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={4}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h4" sx={{ color: '#2E7D32', fontWeight: 'bold' }}>
                                            {data.today?.allocations || 0}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            New Allocations
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={4}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h4" sx={{ color: '#FF9800', fontWeight: 'bold' }}>
                                            {data.today?.redemptions || 0}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Redemptions
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={4}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h4" sx={{ color: '#1976D2', fontWeight: 'bold' }}>
                                            UGX {(data.today?.amount_redeemed || 0).toLocaleString()}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Redeemed Amount
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AttachMoney color="primary" />
                                Status Breakdown
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={4}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Pending sx={{ fontSize: 40, color: '#FF9800' }} />
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            {data.status_breakdown?.pending || 0}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Pending
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={4}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <QrCodeScanner sx={{ fontSize: 40, color: '#1976D2' }} />
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            {data.status_breakdown?.issued || 0}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Issued
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={4}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <CheckCircle sx={{ fontSize: 40, color: '#2E7D32' }} />
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            {data.status_breakdown?.redeemed || 0}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Redeemed
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Recent Activity Tables */}
                <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                Recent Allocations
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Employee</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.recent_allocations && data.recent_allocations.length > 0 ? (
                                            data.recent_allocations.map((allocation) => (
                                                <TableRow key={allocation.id} hover>
                                                    <TableCell sx={{ fontWeight: 'medium' }}>
                                                        {allocation.employee?.name || 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography sx={{ color: '#2E7D32', fontWeight: 'medium' }}>
                                                            UGX {(allocation.amount || 0).toLocaleString()}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={allocation.status || 'unknown'}
                                                            size="small"
                                                            color={
                                                                allocation.status === 'redeemed' ? 'success' :
                                                                allocation.status === 'issued' ? 'primary' : 'warning'
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {allocation.created_at ? new Date(allocation.created_at).toLocaleDateString() : 'N/A'}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        No recent allocations
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
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                Recent Redemptions
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Employee</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.recent_redemptions && data.recent_redemptions.length > 0 ? (
                                            data.recent_redemptions.map((redemption) => (
                                                <TableRow key={redemption.id} hover>
                                                    <TableCell sx={{ fontWeight: 'medium' }}>
                                                        {redemption.welfare_allocation?.employee?.name || 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography sx={{ color: '#2E7D32', fontWeight: 'medium' }}>
                                                            UGX {(redemption.amount_redeemed || 0).toLocaleString()}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        {redemption.redemption_time ? new Date(redemption.redemption_time).toLocaleString() : 'N/A'}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        No recent redemptions
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

export default Dashboard;

