import React, { useCallback } from 'react';
import {
Box,
Button,
IconButton,
Stack,
Typography,
useTheme,
useMediaQuery
} from '@mui/material';
import {
Info as InfoIcon,
Warning as WarningIcon,
CheckCircle as CheckCircleIcon,
Error as ErrorIcon,
Close as CloseIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

export const useCustomToast = () => {
const { enqueueSnackbar, closeSnackbar } = useSnackbar();
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

const getStatusIcon = (status) => {
    const iconProps = { fontSize: 'small' };
    switch (status) {
    case 'info':
        return <InfoIcon color="info" {...iconProps} />;
    case 'warning':
        return <WarningIcon color="warning" {...iconProps} />;
    case 'success':
        return <CheckCircleIcon color="success" {...iconProps} />;
    case 'error':
        return <ErrorIcon color="error" {...iconProps} />;
    default:
        return null;
    }
};

const getStatusColors = (status) => {
    // Bootstrap-like color codes with fallback to MUI theme
    switch (status) {
    case 'info':
        return {
        bgcolor: '#cff4fc', // Bootstrap info bg
        color: '#055160',   // Bootstrap info text
        borderColor:'#0dcaf0', // Bootstrap info border
        iconColor:'#0dcaf0'
        };
    case 'warning':
        return {
        bgcolor: '#fff3cd', // Bootstrap warning bg
        color: '#664d03',   // Bootstrap warning text
        borderColor: '#ffca2c', // Bootstrap warning border
        iconColor: '#ffca2c'
        };
    case 'success':
        return {
        bgcolor: '#d1e7dd', // Bootstrap success bg
        color: '#0a3622',   // Bootstrap success text
        borderColor:'#198754', // Bootstrap success border
        iconColor:'#198754'
        };
    case 'error':
        return {
        bgcolor: '#f8d7da', // Bootstrap danger bg
        color: '#58151c',   // Bootstrap danger text
        borderColor:'#dc3545', // Bootstrap danger border
        iconColor:'#dc3545'
        };
    default:
        return {
        bgcolor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        borderColor: theme.palette.divider,
        iconColor: theme.palette.text.primary
        };
    }
};

const showToast = useCallback(
    (
    title,
    description,
    status,
    options = {}
    ) => {
    const { manual = false, actions = [] } = options;
    const colors = getStatusColors(status);

    enqueueSnackbar('', {
        content: (
        <Box
            sx={{
            minWidth: isMobile ? '100%' : 350,
            maxWidth: isMobile ? '100%' : 400,
            backgroundColor: colors.bgcolor,
            color: colors.color,
            borderLeft: `4px solid ${colors.borderColor}`,
            boxShadow: theme.shadows[4],
            borderRadius: 1,
            p: 2
            }}
        >
            <Stack direction="row" spacing={1} alignItems="flex-start">
            <Box sx={{ pt: 0.5 }}>
                {React.cloneElement(getStatusIcon(status), { sx: { color: colors.iconColor } })}
            </Box>
            <Box sx={{ flexGrow: 1 }}>
                <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle2" fontWeight="bold">
                    {title}
                </Typography>
                <IconButton
                    size="small"
                    onClick={() => closeSnackbar()}
                    sx={{
                    color: colors.color,
                    p: 0,
                    '&:hover': {
                        backgroundColor: 'transparent',
                        opacity: 0.8
                    }
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
                </Stack>
                <Typography variant="body2" sx={{ mt: 0.5, mb: actions.length ? 1 : 0 }}>
                {description}
                </Typography>
                {actions.length > 0 && (
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    {actions.map((action, index) => (
                    <Button
                        key={index}
                        size="small"
                        variant={action.variant || 'outlined'}
                        color={action.color || 'primary'}
                        onClick={() => {
                        action.onClick();
                        closeSnackbar();
                        }}
                        sx={{
                        textTransform: 'none',
                        minWidth: 'auto',
                        color: colors.color,
                        borderColor: colors.borderColor,
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            borderColor: colors.borderColor
                        }
                        }}
                    >
                        {action.label}
                    </Button>
                    ))}
                </Stack>
                )}
            </Box>
            </Stack>
        </Box>
        ),
        autoHideDuration: manual ? null : 7000,
        anchorOrigin: {
        vertical: 'top',
        horizontal: 'right'
        }
    });
    },
    [enqueueSnackbar, closeSnackbar, theme, isMobile]
);

return showToast;
};

export default useCustomToast;