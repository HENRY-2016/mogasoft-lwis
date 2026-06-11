// src/components/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    IconButton,
    InputAdornment,
    useTheme,
    useMediaQuery,
    Fade,
    Zoom,
    alpha,
    CircularProgress,
    Stack,
    Chip,
    Divider,
    Container
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Login as LoginIcon,
    Lock as LockIcon,
    Email as EmailIcon,
    Restaurant,
    AdminPanelSettings,
    Badge,
    AccountBalance,
    ArrowBack
} from '@mui/icons-material';
import useCustomToast from '../hooks/useToast';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../apiServices/authService';
import { apiService } from '../apiServices/ApiService';
import { 
    APIEmployeesLogin,
    APIUserLogin,
    APIFinanceLogin 
} from '../apiServices/APIs';

const LogIn = () => {
    const navigate = useNavigate();
    const showToast = useCustomToast();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const [selectedRole, setSelectedRole] = useState(null); // null, 'admin', 'employee', 'finance'
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        showPassword: false
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });

    // Check if already logged in
    useEffect(() => {
        const user = authService.getCurrentUser();
        if (user && user.role) {
            navigateBasedOnRole(user.role);
        }
    }, [navigate]);

    const navigateBasedOnRole = (role) => {
        switch (role) {
            case 'admin':
                navigate('/dashboard');
                break;
            case 'employee':
                navigate('/my-dashboard');
                break;
            case 'finance':
                navigate('/finance-dashboard');
                break;
            default:
                navigate('/');
        }
    };

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setFormData({
            email: '',
            password: '',
            showPassword: false
        });
        setErrors({
            email: '',
            password: ''
        });
    };

    const handleBackToRoles = () => {
        setSelectedRole(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const togglePasswordVisibility = () => {
        setFormData(prev => ({
            ...prev,
            showPassword: !prev.showPassword
        }));
    };

    const validateForm = () => {
        let valid = true;
        const newErrors = {
            email: '',
            password: ''
        };

        if (!formData.email) {
            newErrors.email = 'Email is required';
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
            valid = false;
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const getLoginEndpoint = (role) => {
        switch (role) {
            case 'admin':
                return APIUserLogin;
            case 'employee':
                return APIEmployeesLogin;
            case 'finance':
                return APIFinanceLogin;
            default:
                return null;
        }
    };

    const handleLogin = async () => {
        if (!validateForm()) {
            showToast("Warning", "Please fill in all required fields", "warning");
            return;
        }

        setLoading(true);

        try {
            const endpoint = getLoginEndpoint(selectedRole);
            
            if (!endpoint) {
                showToast("Error", "Invalid user role selected", "error");
                setLoading(false);
                return;
            }

            // For admin login, use the existing authService
            if (selectedRole === 'admin') {
                const result = await authService.login(formData.email, formData.password);

                if (result.success) {
                    // Add role to stored user data
                    const userData = authService.getCurrentUser();
                    if (userData) {
                        userData.role = 'admin';
                        sessionStorage.setItem('userInfo', JSON.stringify(userData));
                    }
                    
                    showToast("Success", `Welcome ${userData?.name || 'Admin'}!`, "success");
                    navigate('/dashboard');
                } else {
                    showToast("Error", result.message || "Login failed", "error");
                }
            } else {
                // For employee and finance login, use apiService
                const formDataToSend = new FormData();
                formDataToSend.append('email', formData.email);
                formDataToSend.append('password', formData.password);
                formDataToSend.append('device_name', 'web');

                const result = await apiService.create(endpoint, formDataToSend);

                if (result.success) {
                    // Extract user data based on response structure
                    const responseData = result.data;
                    const userData = responseData.user || responseData.employee || responseData.data || responseData;
                    const token = responseData.token || userData.token;

                    // Store user info in sessionStorage (matching authService pattern)
                    const userInfo = {
                        id: userData.id,
                        name: userData.name,
                        email: userData.email,
                        employee_number: userData.employee_number,
                        department: userData.department,
                        position: userData.position,
                        is_active: userData.is_active,
                        role: selectedRole,
                        token: token
                    };
                    
                    sessionStorage.setItem('userInfo', JSON.stringify(userInfo));

                    showToast("Success", `Welcome ${userData.name || 'User'}!`, "success");
                    
                    // Navigate based on role
                    setTimeout(() => {
                        navigateBasedOnRole(selectedRole);
                    }, 500);
                } else {
                    showToast("Error", result.message || "Login failed", "error");
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            showToast("Error", "An unexpected error occurred. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading) {
            handleLogin();
        }
    };

    const getRoleTitle = (role) => {
        switch (role) {
            case 'admin':
                return 'Administrator Login';
            case 'employee':
                return 'Employee Login';
            case 'finance':
                return 'Finance Login';
            default:
                return '';
        }
    };

    const getRoleIcon = (role, size = 50) => {
        const iconSize = isMobile ? size * 0.8 : size;
        switch (role) {
            case 'admin':
                return <AdminPanelSettings sx={{ fontSize: iconSize, color: 'white' }} />;
            case 'employee':
                return <Badge sx={{ fontSize: iconSize, color: 'white' }} />;
            case 'finance':
                return <AccountBalance sx={{ fontSize: iconSize, color: 'white' }} />;
            default:
                return <Restaurant sx={{ fontSize: iconSize, color: 'white' }} />;
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin':
                return theme.palette.error.main;
            case 'employee':
                return theme.palette.primary.main;
            case 'finance':
                return '#1565C0';
            default:
                return theme.palette.primary.main;
        }
    };

    const roleButtons = [
        {
            role: 'admin',
            label: 'Admin User',
            icon: <AdminPanelSettings sx={{ fontSize: 32 }} />,
            color: theme.palette.error.main,
            description: 'System administrators',
            gradient: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`
        },
        {
            role: 'employee',
            label: 'Employee User',
            icon: <Badge sx={{ fontSize: 32 }} />,
            color: theme.palette.primary.main,
            description: 'Welfare beneficiaries',
            gradient: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
        },
        {
            role: 'finance',
            label: 'Finance User',
            icon: <AccountBalance sx={{ fontSize: 32 }} />,
            color: '#1565C0',
            description: 'Financial management',
            gradient: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)'
        }
    ];

    return (
        <Box sx={{
            display: 'flex',
            minHeight: '100vh',
            position: 'relative',
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
            p: isMobile ? 2 : 3,
            background: selectedRole 
                ? `linear-gradient(135deg, ${getRoleColor(selectedRole)} 0%, ${alpha(getRoleColor(selectedRole), 0.8)} 100%)`
                : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            transition: 'background 0.5s ease',
        }}>
            {/* Decorative background elements */}
            <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflow: 'hidden',
                zIndex: 1,
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '-50%',
                    right: '-50%',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: alpha('#fff', 0.05),
                    transform: 'scale(2)',
                }
            }} />

            {/* Main Login Card */}
            <Fade in={true} timeout={800}>
                <Paper 
                    elevation={0}
                    sx={{
                        position: 'relative',
                        zIndex: 2,
                        width: '100%',
                        maxWidth: isMobile ? '92%' : isTablet ? 420 : 480,
                        p: isMobile ? 3 : { xs: 4, sm: 5 },
                        borderRadius: 4,
                        backgroundColor: alpha(theme.palette.background.paper, 0.95),
                        backdropFilter: 'blur(12px)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    }}
                >
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        {/* Logo and Title Section */}
                        <Zoom in={true} timeout={500}>
                            <Box sx={{ textAlign: 'center', mb: 3 }}>
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        mb: 2,
                                    }}>
                                        <Box sx={{
                                            height: isMobile ? '70px' : '90px',
                                            width: isMobile ? '70px' : '90px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: selectedRole 
                                                ? roleButtons.find(r => r.role === selectedRole)?.gradient 
                                                : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                            borderRadius: '20px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                            transition: 'all 0.5s ease',
                                        }}>
                                            {getRoleIcon(selectedRole)}
                                        </Box>
                                    </Box>
                                </motion.div>

                                <motion.div
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.6, delay: 0.1 }}
                                >
                                    <Typography
                                        variant={isMobile ? 'h5' : 'h4'}
                                        component="h1"
                                        sx={{
                                            fontWeight: 'bold',
                                            mb: 1,
                                            color: theme.palette.primary.main,
                                        }}
                                    >
                                        Lunch Welfare System
                                    </Typography>
                                </motion.div>

                                <motion.div
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                >
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            color: 'text.secondary',
                                            mt: 1,
                                            fontWeight: 500,
                                        }}
                                    >
                                        {selectedRole ? getRoleTitle(selectedRole) : 'Select User Type to Login'}
                                    </Typography>
                                </motion.div>
                            </Box>
                        </Zoom>

                        <AnimatePresence mode="wait">
                            {!selectedRole ? (
                                // Role Selection View
                                <motion.div
                                    key="role-selection"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Stack spacing={2} sx={{ mt: 2 }}>
                                        {roleButtons.map((btn, index) => (
                                            <motion.div
                                                key={btn.role}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                            >
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    onClick={() => handleRoleSelect(btn.role)}
                                                    sx={{
                                                        py: isMobile ? 2 : 2.5,
                                                        px: 3,
                                                        borderRadius: 2,
                                                        borderWidth: 2,
                                                        borderColor: alpha(btn.color, 0.5),
                                                        textTransform: 'none',
                                                        display: 'flex',
                                                        justifyContent: 'flex-start',
                                                        gap: 2,
                                                        '&:hover': {
                                                            borderWidth: 2,
                                                            borderColor: btn.color,
                                                            backgroundColor: alpha(btn.color, 0.05),
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: `0 4px 12px ${alpha(btn.color, 0.2)}`
                                                        },
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                >
                                                    <Box sx={{ 
                                                        color: btn.color,
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}>
                                                        {btn.icon}
                                                    </Box>
                                                    <Box sx={{ textAlign: 'left', flex: 1 }}>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: btn.color }}>
                                                            {btn.label}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {btn.description}
                                                        </Typography>
                                                    </Box>
                                                </Button>
                                            </motion.div>
                                        ))}
                                    </Stack>
                                </motion.div>
                            ) : (
                                // Login Form View
                                <motion.div
                                    key="login-form"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Button
                                            startIcon={<ArrowBack />}
                                            onClick={handleBackToRoles}
                                            sx={{ 
                                                textTransform: 'none',
                                                color: 'text.secondary',
                                                '&:hover': {
                                                    backgroundColor: alpha(getRoleColor(selectedRole), 0.05)
                                                }
                                            }}
                                            size="small"
                                        >
                                            Back
                                        </Button>
                                        <Chip 
                                            icon={getRoleIcon(selectedRole, 20)}
                                            label={roleButtons.find(r => r.role === selectedRole)?.label}
                                            sx={{ 
                                                backgroundColor: alpha(getRoleColor(selectedRole), 0.1),
                                                color: getRoleColor(selectedRole),
                                                fontWeight: 'bold',
                                                '& .MuiChip-icon': {
                                                    color: getRoleColor(selectedRole)
                                                }
                                            }}
                                        />
                                    </Box>

                                    <Divider sx={{ mb: 2 }} />

                                    <Box component="form" sx={{ mt: 2 }} onKeyDown={handleKeyPress}>
                                        <TextField
                                            fullWidth
                                            label="Email Address"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            error={!!errors.email}
                                            helperText={errors.email}
                                            margin="normal"
                                            disabled={loading}
                                            autoFocus
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <EmailIcon sx={{ color: getRoleColor(selectedRole) }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                mb: 2,
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    backgroundColor: alpha(theme.palette.common.white, 0.9),
                                                    '&:hover': {
                                                        backgroundColor: alpha(theme.palette.common.white, 1),
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: getRoleColor(selectedRole),
                                                    }
                                                }
                                            }}
                                            size={isMobile ? 'small' : 'medium'}
                                        />

                                        <TextField
                                            fullWidth
                                            label="Password"
                                            name="password"
                                            type={formData.showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={handleChange}
                                            error={!!errors.password}
                                            helperText={errors.password}
                                            margin="normal"
                                            disabled={loading}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LockIcon sx={{ color: getRoleColor(selectedRole) }} />
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={togglePasswordVisibility}
                                                            edge="end"
                                                            disabled={loading}
                                                        >
                                                            {formData.showPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                mb: 1,
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    backgroundColor: alpha(theme.palette.common.white, 0.9),
                                                    '&:hover': {
                                                        backgroundColor: alpha(theme.palette.common.white, 1),
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: getRoleColor(selectedRole),
                                                    }
                                                }
                                            }}
                                            size={isMobile ? 'small' : 'medium'}
                                        />

                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={handleLogin}
                                            disabled={loading}
                                            startIcon={!loading && <LoginIcon />}
                                            sx={{
                                                py: isMobile ? 1.2 : 1.5,
                                                mt: 3,
                                                mb: 2,
                                                fontSize: isMobile ? '0.9rem' : '1rem',
                                                borderRadius: 2,
                                                fontWeight: 'bold',
                                                textTransform: 'none',
                                                background: roleButtons.find(r => r.role === selectedRole)?.gradient,
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: `0 8px 25px ${alpha(getRoleColor(selectedRole), 0.4)}`
                                                },
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {loading ? (
                                                <CircularProgress size={24} color="inherit" />
                                            ) : (
                                                `Login as ${roleButtons.find(r => r.role === selectedRole)?.label}`
                                            )}
                                        </Button>

                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            mt: 2,
                                            pt: 2,
                                            borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                                        }}>
                                            <Restaurant sx={{ fontSize: 14, mr: 0.5, color: theme.palette.primary.main }} />
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ fontSize: isMobile ? '0.65rem' : '0.7rem' }}
                                            >
                                                Prokus Investments Ltd
                                            </Typography>
                                        </Box>
                                    </Box>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Box>
                </Paper>
            </Fade>
        </Box>
    );
};

export default LogIn;