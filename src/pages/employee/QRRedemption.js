// src/pages/QRRedemption.js
import React, { useState, useRef, useEffect } from 'react';
import {
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Card,
    CardContent,
    Alert,
    CircularProgress,
    Chip,
    IconButton,
    InputAdornment,
    Divider,
    Fade,
    Grow,
    Snackbar
} from '@mui/material';
import {
    QrCodeScanner,
    CheckCircle,
    Cancel,
    ContentPaste,
    Clear,
    Person,
    AttachMoney,
    Schedule,
    LocationOn,
    Description,
    Verified,
    Refresh,
    LunchDining,
    Restaurant
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { apiService } from '../../apiServices/ApiService';
import { APIWelfareRedeem, APIWelfareAllocationByQR } from '../../apiServices/APIs';
import { getUserDetails } from '../../utils/helpers';

const QRRedemption = () => {
    const [qrCode, setQrCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [allocation, setAllocation] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [location, setLocation] = useState('');
    const [remarks, setRemarks] = useState('');
    const [redeemedData, setRedeemedData] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const inputRef = useRef(null);

    // Use ref to track if component is mounted
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        apiService.setToastFunction(showMessage);
        
        // Focus input on component mount
        if (inputRef.current) {
            inputRef.current.focus();
        }

        return () => {
            isMounted.current = false;
        };
    }, []);

    const showMessage = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                setQrCode(text);
                // Auto-verify after paste
                setTimeout(() => handleSearch(text), 100);
            }
        } catch (err) {
            console.error('Failed to read clipboard:', err);
            showMessage('Failed to read from clipboard', 'error');
        }
    };

const handleSearch = async (code = qrCode) => {
    const codeToVerify = code || qrCode;
    
    if (!codeToVerify.trim()) {
        setError('Please enter a QR code');
        return;
    }

    setVerifying(true);
    setError(null);
    setAllocation(null);
    setSuccess(false);
    setRedeemedData(null);

    try {
        const url = `${APIWelfareAllocationByQR}/${codeToVerify}`;
        const result = await apiService.show(url);
        
        console.log("API Response:", result);
        
        if (result.success && result.data && isMounted.current) {
            const allocationData = result.data;
            
            // Check if the allocation exists and has a status
            if (allocationData.status) {
                switch (allocationData.status) {
                    case 'issued':
                        setAllocation(allocationData);
                        setQrCode(codeToVerify);
                        showMessage('QR code verified successfully! Welfare is ready for redemption.', 'success');
                        break;
                    case 'redeemed':
                        setError(`This welfare allocation has already been redeemed on ${new Date(allocationData.redeemed_at).toLocaleString()}`);
                        break;
                    case 'expired':
                        setError('This welfare allocation has expired and cannot be redeemed');
                        break;
                    default:
                        setError(`This welfare allocation is ${allocationData.status}. It cannot be redeemed.`);
                }
            } else {
                setError('Invalid QR code: Missing status information');
            }
        } else {
            setError(result.message || 'Invalid QR code or allocation not found');
        }
    } catch (error) {
        console.error('Error verifying QR code:', error);
        setError('Invalid QR code or allocation not found. Please check and try again.');
    } finally {
        if (isMounted.current) {
            setVerifying(false);
        }
    }
};

    const handleRedeem = async () => {
        setLoading(true);
        const formDataToSend = new FormData();
        formDataToSend.append('user_id', getUserDetails("Id"));
        formDataToSend.append('qr_code', qrCode);
        formDataToSend.append('redemption_location', location);
        formDataToSend.append('remarks', remarks);

        try {
            const result = await apiService.create(APIWelfareRedeem, formDataToSend);

            if (result.success && isMounted.current) {
                setRedeemedData({
                    employee: allocation.employee,
                    amount: allocation.amount,
                    time: new Date(),
                    location: location,
                    remarks: remarks
                });
                setSuccess(true);
                setAllocation(null);
                setQrCode('');
                setLocation('');
                setRemarks('');
                showMessage('Welfare redeemed successfully!', 'success');
            } else {
                setError(result.message || 'Failed to redeem welfare');
                showMessage(result.message || 'Failed to redeem welfare', 'error');
            }
        } catch (error) {
            console.error('Error redeeming welfare:', error);
            const errorMessage = error.response?.data?.message || 'Failed to redeem welfare. Please try again.';
            setError(errorMessage);
            showMessage(errorMessage, 'error');
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    const handleReset = () => {
        setQrCode('');
        setAllocation(null);
        setError(null);
        setSuccess(false);
        setLocation('');
        setRemarks('');
        setRedeemedData(null);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !verifying && !loading && !allocation) {
            handleSearch();
        }
    };

    // Helper function to format date
    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleString();
        } catch {
            return 'N/A';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Box>
                <Paper sx={{ p: 4, borderRadius: 3, maxWidth: 650, mx: 'auto' }}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Fade in timeout={500}>
                            <Box>
                                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                                    <QrCodeScanner sx={{ fontSize: 70, color: '#2E7D32', mb: 1 }} />
                                    <LunchDining 
                                        sx={{ 
                                            fontSize: 30, 
                                            color: '#FF9800', 
                                            position: 'absolute', 
                                            bottom: -5, 
                                            right: -10,
                                            backgroundColor: 'white',
                                            borderRadius: '50%',
                                            p: 0.5
                                        }} 
                                    />
                                </Box>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2E7D32', mt: 1 }}>
                                    QR Code Redemption
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Scan or enter the QR code to redeem lunch welfare for employees
                                </Typography>
                            </Box>
                        </Fade>
                    </Box>

                    {success && redeemedData && (
                        <Grow in timeout={500}>
                            <Alert 
                                severity="success" 
                                sx={{ mb: 3 }}
                                icon={<Verified fontSize="inherit" />}
                                onClose={handleReset}
                            >
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                    Welfare Successfully Redeemed!
                                </Typography>
                                <Typography variant="body2">
                                    {redeemedData.employee?.name} has received UGX {redeemedData.amount?.toLocaleString()} lunch allowance.
                                </Typography>
                                {redeemedData.location && (
                                    <Typography variant="caption" display="block">
                                        Location: {redeemedData.location}
                                    </Typography>
                                )}
                                <Button 
                                    size="small" 
                                    onClick={handleReset} 
                                    sx={{ mt: 1 }}
                                    startIcon={<Refresh />}
                                >
                                    New Redemption
                                </Button>
                            </Alert>
                        </Grow>
                    )}

                    {error && (
                        <Alert 
                            severity="error" 
                            sx={{ mb: 3 }}
                            onClose={() => setError(null)}
                            action={
                                <Button color="inherit" size="small" onClick={handleReset}>
                                    Try Again
                                </Button>
                            }
                        >
                            {error}
                        </Alert>
                    )}

                    {!allocation && !success && (
                        <Fade in timeout={500}>
                            <Box>
                                <TextField
                                    fullWidth
                                    label="Enter QR Code"
                                    value={qrCode}
                                    onChange={(e) => setQrCode(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Paste or type the QR code here..."
                                    disabled={verifying || loading}
                                    inputRef={inputRef}
                                    InputProps={{
                                        endAdornment: qrCode && (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setQrCode('')} size="small">
                                                    <Clear />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <QrCodeScanner color="primary" />
                                            </InputAdornment>
                                        )
                                    }}
                                    sx={{ mb: 2 }}
                                />
                                
                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={handlePaste}
                                        disabled={verifying || loading}
                                        startIcon={<ContentPaste />}
                                        sx={{ flex: 1 }}
                                    >
                                        Paste from Clipboard
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleSearch()}
                                        disabled={verifying || loading || !qrCode.trim()}
                                        startIcon={verifying ? <CircularProgress size={20} /> : <QrCodeScanner />}
                                        sx={{ flex: 2 }}
                                    >
                                        {verifying ? 'Verifying...' : 'Verify QR Code'}
                                    </Button>
                                </Box>

                                <Divider sx={{ my: 3 }}>
                                    <Chip label="Instructions" size="small" />
                                </Divider>

                                <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>How to redeem:</strong>
                                    </Typography>
                                    <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                                        <li>Enter the QR code provided to the employee</li>
                                        <li>Click "Verify QR Code" to check validity</li>
                                        <li>Confirm employee details and amount</li>
                                        <li>Add optional redemption location and remarks</li>
                                        <li>Click "Confirm Redemption" to complete</li>
                                    </ul>
                                </Box>
                            </Box>
                        </Fade>
                    )}

                    {allocation && !success && (
                        <Grow in timeout={500}>
                            <Card sx={{ mt: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
                                            Verify Redemption
                                        </Typography>
                                        <Chip 
                                            label="Ready for Redemption" 
                                            color="success" 
                                            size="small"
                                            icon={<Verified />}
                                        />
                                    </Box>
                                    
                                    <Divider sx={{ mb: 2 }} />

                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Person color="primary" fontSize="small" />
                                            <Typography variant="body2" color="text.secondary">
                                                Employee Name
                                            </Typography>
                                        </Box>
                                        <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                                            {allocation.employee?.name || 'N/A'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Employee #: {allocation.employee?.employee_number || 'N/A'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Department: {allocation.employee?.department || 'N/A'}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <AttachMoney color="success" fontSize="small" />
                                            <Typography variant="body2" color="text.secondary">
                                                Amount
                                            </Typography>
                                        </Box>
                                        <Typography variant="h5" sx={{ color: '#2E7D32', fontWeight: 'bold' }}>
                                            UGX {(allocation.amount || 0).toLocaleString()}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Schedule color="info" fontSize="small" />
                                            <Typography variant="body2" color="text.secondary">
                                                Issued On
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2">
                                            {formatDateTime(allocation.issued_at)}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Restaurant color="warning" fontSize="small" />
                                            <Typography variant="body2" color="text.secondary">
                                                Lunch Welfare
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2">
                                            One-time lunch meal voucher
                                        </Typography>
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    <TextField
                                        fullWidth
                                        label="Redemption Location"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="e.g., Main Cafeteria, Staff Canteen"
                                        sx={{ mb: 2 }}
                                        size="small"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LocationOn color="action" />
                                                </InputAdornment>
                                            )
                                        }}
                                    />

                                    <TextField
                                        fullWidth
                                        label="Remarks (Optional)"
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        multiline
                                        rows={2}
                                        placeholder="Any additional notes about this redemption..."
                                        sx={{ mb: 3 }}
                                        size="small"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Description color="action" />
                                                </InputAdornment>
                                            )
                                        }}
                                    />

                                    <Alert severity="info" sx={{ mb: 2 }}>
                                        <strong>Confirm Redemption:</strong> This action will mark the welfare as redeemed. 
                                        The employee will receive UGX {(allocation.amount || 0).toLocaleString()} lunch allowance.
                                        This action cannot be undone.
                                    </Alert>

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="success"
                                        onClick={handleRedeem}
                                        disabled={loading}
                                        startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
                                        sx={{ py: 1.5, mb: 1 }}
                                    >
                                        {loading ? 'Processing...' : 'Confirm Redemption'}
                                    </Button>
                                    
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={handleReset}
                                        disabled={loading}
                                        startIcon={<Cancel />}
                                    >
                                        Cancel
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grow>
                    )}

                    {/* Recent Activity Info */}
                    {!allocation && !success && !error && !qrCode && !verifying && (
                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                                Tip: You can also scan physical QR codes or paste copied codes
                            </Typography>
                        </Box>
                    )}

                    {/* Loading state for verification */}
                    {verifying && !allocation && !error && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <CircularProgress />
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                                Verifying QR code...
                            </Typography>
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

export default QRRedemption;

