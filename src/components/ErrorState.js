// src/components/ErrorState.js
import React from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    useTheme,
    Avatar,
    Zoom,
    Fade
} from '@mui/material';
import {
    Error as ErrorIcon,
    Refresh,
    LunchDining,
    Restaurant,
    QrCodeScanner,
    Warning,
    BugReport,
    CloudOff,
    ReportProblem,
    Receipt,
    People,
    AttachMoney,
    Fastfood,
    LocalDining,
    RestaurantMenu
} from '@mui/icons-material';

const ErrorState = ({ 
    error, 
    onRetry, 
    title = "Oops! Something went wrong",
    icon = null,
    variant = "welfare",
    fullPage = false,
    showRetry = true,
    retryText = "Try Again"
}) => {
    const theme = useTheme();

    // Get icon based on variant
    const getIcon = () => {
        if (icon) return icon;
        
        switch(variant) {
            case 'welfare':
                return <LunchDining sx={{ fontSize: 80 }} />;
            case 'meal':
                return <Restaurant sx={{ fontSize: 80 }} />;
            case 'qr':
                return <QrCodeScanner sx={{ fontSize: 80 }} />;
            case 'allocation':
                return <Receipt sx={{ fontSize: 80 }} />;
            case 'employee':
                return <People sx={{ fontSize: 80 }} />;
            case 'payment':
                return <AttachMoney sx={{ fontSize: 80 }} />;
            case 'food':
                return <Fastfood sx={{ fontSize: 80 }} />;
            case 'dining':
                return <LocalDining sx={{ fontSize: 80 }} />;
            case 'menu':
                return <RestaurantMenu sx={{ fontSize: 80 }} />;
            case 'warning':
                return <Warning sx={{ fontSize: 80 }} />;
            case 'bug':
                return <BugReport sx={{ fontSize: 80 }} />;
            case 'connection':
                return <CloudOff sx={{ fontSize: 80 }} />;
            default:
                return <LunchDining sx={{ fontSize: 80 }} />;
        }
    };

    // Get color based on variant
    const getColor = () => {
        switch(variant) {
            case 'welfare':
                return theme.palette.primary.main || '#2E7D32';
            case 'meal':
            case 'food':
            case 'dining':
            case 'menu':
                return '#FF9800';
            case 'qr':
                return '#2196F3';
            case 'allocation':
                return '#9C27B0';
            case 'employee':
                return '#1976D2';
            case 'payment':
                return '#4CAF50';
            case 'warning':
                return theme.palette.warning.main;
            case 'bug':
                return theme.palette.info.main;
            case 'connection':
                return theme.palette.secondary.main;
            default:
                return theme.palette.error.main;
        }
    };

    // Get title based on variant
    const getDefaultTitle = () => {
        switch(variant) {
            case 'welfare':
                return "Unable to Load Welfare Data";
            case 'meal':
                return "Meal Service Unavailable";
            case 'qr':
                return "QR Code Error";
            case 'allocation':
                return "Allocation Error";
            case 'employee':
                return "Employee Data Error";
            case 'payment':
                return "Payment Processing Error";
            default:
                return title;
        }
    };

    // Get message based on error content
    const getErrorMessage = () => {
        if (error) return error;
        
        switch(variant) {
            case 'welfare':
                return "Unable to fetch lunch welfare information. Please check your connection and try again.";
            case 'meal':
                return "Meal service data is currently unavailable. Please try again later.";
            case 'qr':
                return "Unable to scan or verify QR code. Please ensure the code is valid.";
            case 'allocation':
                return "Failed to load welfare allocations. Please refresh the page.";
            case 'employee':
                return "Employee records cannot be loaded. Please check your connection.";
            case 'payment':
                return "Payment processing is temporarily unavailable. Please try again.";
            default:
                return "An unexpected error occurred. Please try again.";
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: fullPage ? '100vh' : '400px',
                width: '100%',
                gap: 3,
                p: 4,
                position: 'relative'
            }}
        >
            <Zoom in={true}>
                <Box sx={{ position: 'relative' }}>
                    {/* Error icon with welfare theme */}
                    <Box
                        sx={{
                            animation: 'shake 0.5s ease-in-out',
                            '@keyframes shake': {
                                '0%, 100%': { transform: 'translateX(0)' },
                                '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
                                '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
                            },
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 120,
                                height: 120,
                                bgcolor: getColor() + '20',
                                color: getColor(),
                                boxShadow: `0 8px 20px ${getColor()}40`
                            }}
                        >
                            {getIcon()}
                        </Avatar>
                    </Box>
                    
                    {/* Pulsing error badge */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            backgroundColor: theme.palette.error.main,
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 20,
                            fontWeight: 'bold',
                            animation: 'pulse-error 1.5s ease-in-out infinite',
                            '@keyframes pulse-error': {
                                '0%': { transform: 'scale(1)', boxShadow: `0 0 0 0 ${theme.palette.error.main}70` },
                                '70%': { transform: 'scale(1.1)', boxShadow: `0 0 0 10px ${theme.palette.error.main}00` },
                                '100%': { transform: 'scale(1)', boxShadow: `0 0 0 0 ${theme.palette.error.main}00` },
                            },
                        }}
                    >
                        !
                    </Box>
                </Box>
            </Zoom>
            
            <Fade in={true} timeout={800}>
                <Box sx={{ textAlign: 'center', maxWidth: 500 }}>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            color: getColor(),
                            fontWeight: 600,
                            mb: 2
                        }}
                    >
                        {getDefaultTitle()}
                    </Typography>
                    
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            bgcolor: getColor() + '08',
                            borderRadius: 3,
                            border: `1px solid ${getColor()}30`,
                            mb: 3
                        }}
                    >
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                color: getColor(),
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                justifyContent: 'center',
                                wordBreak: 'break-word'
                            }}
                        >
                            <ErrorIcon sx={{ color: getColor() }} />
                            {getErrorMessage()}
                        </Typography>
                    </Paper>
                    
                    {showRetry && onRetry && (
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<Refresh />}
                            onClick={onRetry}
                            sx={{
                                borderRadius: 2,
                                px: 4,
                                py: 1.5,
                                textTransform: 'none',
                                fontWeight: 600,
                                background: `linear-gradient(45deg, ${getColor()} 30%, ${theme.palette.primary.light} 90%)`,
                                boxShadow: `0 8px 16px ${getColor()}40`,
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 12px 20px ${getColor()}60`,
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {retryText}
                        </Button>
                    )}
                </Box>
            </Fade>
            
            {/* Welfare pattern background */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 20,
                    right: 20,
                    opacity: 0.05,
                    zIndex: -1
                }}
            >
                <LunchDining sx={{ fontSize: 200 }} />
            </Box>
            
            <Box
                sx={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    opacity: 0.03,
                    zIndex: -1
                }}
            >
                <Restaurant sx={{ fontSize: 150 }} />
            </Box>
        </Box>
    );
};

export default ErrorState;