// src/components/LoadingState.js
import React from 'react';
import {
    Box,
    Typography,
    LinearProgress,
    useTheme,
    Avatar,
    Fade,
    Zoom
} from '@mui/material';
import {
    LunchDining,
    Restaurant,
    Fastfood,
    LocalDining,
    QrCodeScanner,
    Receipt,
    People,
    RestaurantMenu,
    Kitchen,
    DeliveryDining,
    TakeoutDining,
    BakeryDining,
    Icecream,
    RamenDining,
    SetMeal,
    FoodBank
} from '@mui/icons-material';

const LoadingState = ({ 
    message = "Loading Lunch Welfare Data...", 
    icon = null,
    fullPage = false,
    size = "medium",
    variant = "welfare"
}) => {
    const theme = useTheme();

    // Get primary color
    const primaryColor = theme.palette.primary.main || '#2E7D32';
    const primaryLight = theme.palette.primary.light || '#4CAF50';
    const secondaryColor = '#FF9800'; // Orange for food theme

    // Size mappings
    const sizeMap = {
        small: {
            iconSize: 40,
            fontSize: 'h6',
            progressHeight: 4,
            containerHeight: fullPage ? '100vh' : '200px'
        },
        medium: {
            iconSize: 60,
            fontSize: 'h5',
            progressHeight: 6,
            containerHeight: fullPage ? '100vh' : '300px'
        },
        large: {
            iconSize: 80,
            fontSize: 'h4',
            progressHeight: 8,
            containerHeight: fullPage ? '100vh' : '400px'
        }
    };

    const sizes = sizeMap[size];

    // Food/welfare icons for different variants
    const getIcon = () => {
        if (icon) return icon;
        
        switch(variant) {
            case 'welfare':
                return <LunchDining sx={{ fontSize: sizes.iconSize }} />;
            case 'meal':
                return <Restaurant sx={{ fontSize: sizes.iconSize }} />;
            case 'fastfood':
                return <Fastfood sx={{ fontSize: sizes.iconSize }} />;
            case 'dining':
                return <LocalDining sx={{ fontSize: sizes.iconSize }} />;
            case 'qr':
                return <QrCodeScanner sx={{ fontSize: sizes.iconSize }} />;
            case 'receipt':
                return <Receipt sx={{ fontSize: sizes.iconSize }} />;
            case 'employees':
                return <People sx={{ fontSize: sizes.iconSize }} />;
            case 'menu':
                return <RestaurantMenu sx={{ fontSize: sizes.iconSize }} />;
            case 'kitchen':
                return <Kitchen sx={{ fontSize: sizes.iconSize }} />;
            case 'delivery':
                return <DeliveryDining sx={{ fontSize: sizes.iconSize }} />;
            case 'takeout':
                return <TakeoutDining sx={{ fontSize: sizes.iconSize }} />;
            case 'bakery':
                return <BakeryDining sx={{ fontSize: sizes.iconSize }} />;
            case 'dessert':
                return <Icecream sx={{ fontSize: sizes.iconSize }} />;
            case 'noodles':
                return <RamenDining sx={{ fontSize: sizes.iconSize }} />;
            case 'setmeal':
                return <SetMeal sx={{ fontSize: sizes.iconSize }} />;
            case 'foodbank':
                return <FoodBank sx={{ fontSize: sizes.iconSize }} />;
            default:
                return <LunchDining sx={{ fontSize: sizes.iconSize }} />;
        }
    };

    // Get gradient colors based on variant
    const getGradientColors = () => {
        switch(variant) {
            case 'welfare':
                return `linear-gradient(90deg, ${primaryColor}, ${secondaryColor}, ${primaryLight})`;
            case 'meal':
            case 'fastfood':
            case 'dining':
            case 'menu':
                return `linear-gradient(90deg, ${secondaryColor}, ${primaryColor}, ${secondaryColor})`;
            case 'qr':
                return `linear-gradient(90deg, #2196F3, ${primaryColor}, #2196F3)`;
            case 'receipt':
                return `linear-gradient(90deg, #9C27B0, ${primaryColor}, #9C27B0)`;
            default:
                return `linear-gradient(90deg, ${primaryColor}, ${secondaryColor}, ${primaryLight})`;
        }
    };

    // Get loading messages based on variant
    const getLoadingMessage = () => {
        if (message !== "Loading Lunch Welfare Data...") return message;
        
        switch(variant) {
            case 'welfare':
                return "Loading Lunch Welfare Data...";
            case 'meal':
                return "Preparing Meal Information...";
            case 'fastfood':
                return "Getting Quick Meal Options...";
            case 'dining':
                return "Setting the Dining Table...";
            case 'qr':
                return "Initializing QR Scanner...";
            case 'receipt':
                return "Fetching Redemption Records...";
            case 'employees':
                return "Loading Employee Directory...";
            case 'menu':
                return "Preparing Today's Menu...";
            case 'kitchen':
                return "Getting Kitchen Ready...";
            case 'delivery':
                return "Preparing Meal Deliveries...";
            default:
                return "Loading Lunch Welfare Data...";
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: sizes.containerHeight,
                width: '100%',
                gap: 3,
                p: 4,
                position: 'relative'
            }}
        >
            <Zoom in={true} style={{ transitionDelay: '200ms' }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    {/* Animated food icon */}
                    <Box
                        sx={{
                            animation: 'bounce-food 2s ease-in-out infinite',
                            '@keyframes bounce-food': {
                                '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
                                '50%': { transform: 'translateY(-10px) rotate(5deg)' },
                            },
                        }}
                    >
                        <Avatar
                            sx={{
                                width: sizes.iconSize + 20,
                                height: sizes.iconSize + 20,
                                bgcolor: primaryLight + '20',
                                color: primaryColor,
                                boxShadow: `0 4px 15px ${primaryColor}40`,
                                border: `2px solid ${primaryColor}20`
                            }}
                        >
                            {getIcon()}
                        </Avatar>
                    </Box>
                    
                    {/* Animated rings */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: -10,
                            left: -10,
                            right: -10,
                            bottom: -10,
                            borderRadius: '50%',
                            border: `2px solid ${secondaryColor}40`,
                            animation: 'ripple 1.5s ease-out infinite',
                            '@keyframes ripple': {
                                '0%': { transform: 'scale(0.8)', opacity: 0.5 },
                                '100%': { transform: 'scale(1.3)', opacity: 0 },
                            },
                        }}
                    />
                    
                    {/* Second ring for more effect */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: -5,
                            left: -5,
                            right: -5,
                            bottom: -5,
                            borderRadius: '50%',
                            border: `2px solid ${primaryColor}30`,
                            animation: 'ripple 1.5s ease-out infinite 0.5s',
                            '@keyframes ripple': {
                                '0%': { transform: 'scale(0.9)', opacity: 0.4 },
                                '100%': { transform: 'scale(1.4)', opacity: 0 },
                            },
                        }}
                    />
                </Box>
            </Zoom>
            
            <Fade in={true} timeout={1000}>
                <Box sx={{ textAlign: 'center', maxWidth: 400, width: '100%' }}>
                    <Typography 
                        variant={sizes.fontSize} 
                        sx={{ 
                            color: primaryColor,
                            mb: 2,
                            fontWeight: 600,
                            letterSpacing: '0.5px'
                        }}
                    >
                        {getLoadingMessage()}
                    </Typography>
                    
                    <LinearProgress 
                        sx={{ 
                            height: sizes.progressHeight, 
                            borderRadius: 4,
                            backgroundColor: primaryLight + '30',
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                background: getGradientColors(),
                                animation: 'shimmer 2s infinite',
                                '@keyframes shimmer': {
                                    '0%': { backgroundPosition: '-200% 0' },
                                    '100%': { backgroundPosition: '200% 0' },
                                },
                                backgroundSize: '200% 100%'
                            }
                        }} 
                    />
                    
                    {/* Animated food dots */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mt: 2 }}>
                        {[...Array(3)].map((_, i) => (
                            <Box
                                key={i}
                                sx={{
                                    width: size === 'small' ? 8 : 10,
                                    height: size === 'small' ? 8 : 10,
                                    borderRadius: '50%',
                                    backgroundColor: i === 1 ? secondaryColor : primaryColor,
                                    animation: `bounce-dots 1.4s ease-in-out ${i * 0.2}s infinite`,
                                    '@keyframes bounce-dots': {
                                        '0%, 100%': { transform: 'translateY(0)', opacity: 0.4 },
                                        '50%': { transform: 'translateY(-12px)', opacity: 1 },
                                    },
                                }}
                            />
                        ))}
                    </Box>
                    
                    {/* Subtitle message */}
                    <Typography 
                        variant="caption" 
                        sx={{ 
                            display: 'block',
                            mt: 2,
                            color: 'text.secondary',
                            fontSize: '0.7rem'
                        }}
                    >
                        Preparing your lunch welfare experience...
                    </Typography>
                </Box>
            </Fade>

            {/* Decorative background elements */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 20,
                    right: 20,
                    opacity: 0.03,
                    zIndex: -1
                }}
            >
                <LunchDining sx={{ fontSize: 150 }} />
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
                <Restaurant sx={{ fontSize: 120 }} />
            </Box>
            
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '30%',
                    left: '10%',
                    opacity: 0.02,
                    zIndex: -1,
                    transform: 'rotate(15deg)'
                }}
            >
                <Fastfood sx={{ fontSize: 100 }} />
            </Box>
            
            <Box
                sx={{
                    position: 'absolute',
                    top: '20%',
                    right: '10%',
                    opacity: 0.02,
                    zIndex: -1,
                    transform: 'rotate(-10deg)'
                }}
            >
                <LocalDining sx={{ fontSize: 90 }} />
            </Box>
        </Box>
    );
};

export default LoadingState;