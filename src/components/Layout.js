// src/components/Layout.js
import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Box,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    useTheme,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    Tooltip,Chip,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard,
    People,
    Restaurant,
    Receipt,
    QrCodeScanner,
    LunchDining,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Logout,
    Person,
    ExpandMore,
    AccountBalance,
    Badge,
    AdminPanelSettings,
    Assignment,
    History,
    Today,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../apiServices/authService';

const drawerWidth = 240;
const collapsedDrawerWidth = 72;

// Admin menu items
const adminItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Departments', icon: <People />, path: '/department' },
    { text: 'Employees', icon: <Badge />, path: '/employees' },
    { text: 'Welfare Allocations', icon: <Restaurant />, path: '/allocations' },
    // { text: 'QR Redemption', icon: <QrCodeScanner />, path: '/redeem' },
    // { text: 'Redemptions', icon: <Receipt />, path: '/redemptions' },
    { text: 'Finance Users', icon: <AccountBalance />, path: '/finance' },
];

// Employee menu items
const employeeItems = [
    { text: 'My Dashboard', icon: <Dashboard />, path: '/my-dashboard' },
    { text: 'My Allocations', icon: <Assignment />, path: '/my-allocations' },
    { text: 'My Redemptions', icon: <History />, path: '/my-redemptions' },
    { text: 'QR Redemption', icon: <QrCodeScanner />, path: '/redeem' },
];

// Finance menu items
const financeItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/finance-dashboard' },
    { text: 'Today\'s Redemptions', icon: <Today />, path: '/todays-redeems' },
    { text: 'Redemptions', icon: <Receipt />, path: '/redemptions' },
    // { text: 'QR Redemption', icon: <QrCodeScanner />, path: '/redeem' },
];

const Layout = ({ children }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userRole, setUserRole] = useState('');
    const [menuItems, setMenuItems] = useState([]);
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    // Primary color based on role
    const getPrimaryColor = (role) => {
        switch (role) {
            case 'admin':
                return '#d32f2f'; // Red for admin
            case 'employee':
                return '#2E7D32'; // Green for employee
            case 'finance':
                return '#1565C0'; // Blue for finance
            default:
                return '#2E7D32'; // Default green
        }
    };

    const getPrimaryLight = (role) => {
        switch (role) {
            case 'admin':
                return '#ffebee';
            case 'employee':
                return '#e8f5e9';
            case 'finance':
                return '#e3f2fd';
            default:
                return '#e8f5e9';
        }
    };

    const primaryColor = getPrimaryColor(userRole);
    const primaryLight = getPrimaryLight(userRole);

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (user) {
            setUserName(user.name || user.username || 'User');
            setUserEmail(user.email || '');
            const role = user.role || 'employee';
            setUserRole(role);
            
            // Set menu items based on role
            switch (role) {
                case 'admin':
                    setMenuItems(adminItems);
                    break;
                case 'employee':
                    setMenuItems(employeeItems);
                    break;
                case 'finance':
                    setMenuItems(financeItems);
                    break;
                default:
                    setMenuItems(employeeItems);
            }
        }
    }, []);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleToggleCollapse = () => {
        setCollapsed(!collapsed);
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/');
        handleMenuClose();
    };

    const getCurrentDrawerWidth = () => {
        return collapsed ? collapsedDrawerWidth : drawerWidth;
    };

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin':
                return <AdminPanelSettings sx={{ fontSize: 32, color: primaryColor }} />;
            case 'employee':
                return <Badge sx={{ fontSize: 32, color: primaryColor }} />;
            case 'finance':
                return <AccountBalance sx={{ fontSize: 32, color: primaryColor }} />;
            default:
                return <LunchDining sx={{ fontSize: 32, color: primaryColor }} />;
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'admin':
                return 'Admin';
            case 'employee':
                return 'Employee';
            case 'finance':
                return 'Finance';
            default:
                return 'User';
        }
    };

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header with collapse button */}
            <Box sx={{ 
                p: collapsed ? 2 : 3, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: collapsed ? 'center' : 'space-between',
                borderBottom: 1,
                borderColor: 'divider',
                minHeight: collapsed ? 70 : 'auto'
            }}>
                {!collapsed && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getRoleIcon(userRole)}
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: primaryColor, lineHeight: 1.2 }}>
                                LWIS
                            </Typography>
                            <Typography variant="caption" sx={{ color: primaryColor, fontWeight: 'medium' }}>
                                {getRoleLabel(userRole)} Portal
                            </Typography>
                        </Box>
                    </Box>
                )}
                {collapsed && (
                    getRoleIcon(userRole)
                )}
                <IconButton 
                    onClick={handleToggleCollapse}
                    size="small"
                    sx={{ 
                        ml: collapsed ? 0 : 1,
                        backgroundColor: theme.palette.action.hover,
                        '&:hover': {
                            backgroundColor: theme.palette.action.selected,
                        },
                        color: primaryColor
                    }}
                >
                    {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </IconButton>
            </Box>

            {/* Menu Items */}
            <List sx={{ mt: 2, flex: 1 }}>
                {menuItems.map((item) => {
                    const active = isActive(item.path);
                    
                    return (
                        <Tooltip 
                            key={item.text} 
                            title={collapsed ? item.text : ''} 
                            placement="right"
                        >
                            <ListItem
                                button
                                onClick={() => {
                                    navigate(item.path);
                                    setMobileOpen(false);
                                }}
                                sx={{
                                    mx: 1,
                                    mb: 0.5,
                                    borderRadius: 2,
                                    justifyContent: collapsed ? 'center' : 'flex-start',
                                    minHeight: 48,
                                    backgroundColor: active ? primaryLight : 'transparent',
                                    '&:hover': {
                                        backgroundColor: active ? primaryLight : theme.palette.action.hover,
                                    },
                                }}
                            >
                                <ListItemIcon 
                                    sx={{ 
                                        minWidth: collapsed ? 'auto' : 40,
                                        justifyContent: 'center',
                                        color: active ? primaryColor : '#000000',
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                {!collapsed && (
                                    <ListItemText 
                                        primary={item.text}
                                        primaryTypographyProps={{
                                            sx: {
                                                color: active ? primaryColor : '#000000',
                                                fontWeight: active ? 'bold' : 'normal',
                                                fontSize: '0.9rem'
                                            }
                                        }}
                                    />
                                )}
                            </ListItem>
                        </Tooltip>
                    );
                })}
            </List>

            {/* User Info Section */}
            <Divider />
            <Box sx={{ p: collapsed ? 1 : 2 }}>
                <Tooltip title={collapsed ? `${userName || 'User'} (${getRoleLabel(userRole)})` : ''} placement="right">
                    <ListItem
                        button
                        onClick={handleMenuOpen}
                        sx={{
                            borderRadius: 2,
                            justifyContent: collapsed ? 'center' : 'flex-start',
                            minHeight: 48,
                            '&:hover': {
                                backgroundColor: theme.palette.action.hover,
                            },
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: collapsed ? 'auto' : 40, justifyContent: 'center' }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: primaryColor }}>
                                {userName ? userName.charAt(0).toUpperCase() : <Person />}
                            </Avatar>
                        </ListItemIcon>
                        {!collapsed && (
                            <ListItemText 
                                primary={userName || 'User'} 
                                secondary={getRoleLabel(userRole)}
                                primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 'medium', color: '#000000' }}
                                secondaryTypographyProps={{ fontSize: '0.7rem', color: primaryColor }}
                            />
                        )}
                        {!collapsed && <ExpandMore fontSize="small" sx={{ color: '#000000' }} />}
                    </ListItem>
                </Tooltip>
            </Box>

            {/* User Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
            >
                <Box sx={{ p: 2, minWidth: 220 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Avatar sx={{ bgcolor: primaryColor }}>
                            {userName ? userName.charAt(0).toUpperCase() : <Person />}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#000000' }}>
                                {userName || 'User'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {userEmail || 'No email'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: primaryColor, display: 'block', fontWeight: 'medium' }}>
                                {getRoleLabel(userRole)} Account
                            </Typography>
                        </Box>
                    </Box>
                </Box>
                <Divider />
                <MenuItem 
                    onClick={handleLogout} 
                    sx={{ 
                        color: '#d32f2f',
                        '&:hover': {
                            backgroundColor: '#ffebee',
                        }
                    }}
                >
                    <ListItemIcon>
                        <Logout fontSize="small" sx={{ color: '#d32f2f' }} />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                </MenuItem>
            </Menu>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${getCurrentDrawerWidth()}px)` },
                    ml: { sm: `${getCurrentDrawerWidth()}px` },
                    backgroundColor: 'white',
                    color: primaryColor,
                    boxShadow: 1,
                    transition: theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' }, color: primaryColor }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
                        <LunchDining sx={{ color: primaryColor }} />
                        <Typography 
                            variant="h6" 
                            noWrap 
                            component="div" 
                            sx={{ 
                                fontWeight: 'bold',
                                color: primaryColor
                            }}
                        >
                            Lunch Welfare Issuance System
                        </Typography>
                        <Chip
                            label={getRoleLabel(userRole)}
                            size="small"
                            sx={{
                                ml: 2,
                                backgroundColor: primaryLight,
                                color: primaryColor,
                                fontWeight: 'bold',
                                display: { xs: 'none', sm: 'flex' }
                            }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: primaryColor }}>
                                {userName ? userName.charAt(0).toUpperCase() : <Person />}
                            </Avatar>
                            <Box>
                                <Typography variant="body2" sx={{ color: '#000000', fontWeight: 'medium' }}>
                                    {userName || 'User'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: primaryColor }}>
                                    {getRoleLabel(userRole)}
                                </Typography>
                            </Box>
                        </Box>
                        <Tooltip title="Logout">
                            <IconButton 
                                onClick={handleLogout} 
                                size="small"
                                sx={{ color: '#d32f2f' }}
                            >
                                <Logout />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Mobile Drawer */}
            <Box
                component="nav"
                sx={{ width: { sm: getCurrentDrawerWidth() }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { 
                            width: drawerWidth,
                            boxSizing: 'border-box',
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                
                {/* Desktop Drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { 
                            width: getCurrentDrawerWidth(),
                            boxSizing: 'border-box',
                            transition: theme.transitions.create('width', {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.enteringScreen,
                            }),
                            overflowX: 'hidden',
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${getCurrentDrawerWidth()}px)` },
                    mt: 8,
                    backgroundColor: '#f5f5f5',
                    minHeight: '100vh',
                    transition: theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default Layout;