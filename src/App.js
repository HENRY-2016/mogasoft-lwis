// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import WelfareAllocations from './pages/WelfareAllocations';
import QRRedemption from './pages/employee/QRRedemption';
import Department from './pages/Department';

import LogIn from './auth/LogIn';
import { authService } from './apiServices/authService';
import Finance from './pages/Finance';
import MyAllocations from './pages/employee/MyAllocations';
import MyRedemptions from './pages/employee/MyRedemptions';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import WelfareRedemptions from './pages/finance/WelfareRedemptions';
import TodaysRedemptions from './pages/finance/TodaysRedemptions';
import FinanceDashboard from './pages/finance/FinanceDashboard';

const theme = createTheme({
    palette: {
        primary: {
            main: '#2E7D32',
        },
        secondary: {
            main: '#FF9800',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
});

// Protected Route component
const ProtectedRoute = ({ children }) => {
    if (!authService.isAuthenticated()) {
        return <Navigate to="/" replace />;
    }
    return children;
};

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Routes>
                    {/* Public route */}
                    <Route path="/" element={<LogIn />} />
                    
                    {/* Protected routes with Layout */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Layout>
                                <Dashboard />
                            </Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/employees" element={
                        <ProtectedRoute>
                            <Layout>
                                <Employees />
                            </Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/allocations" element={
                        <ProtectedRoute>
                            <Layout>
                                <WelfareAllocations />
                            </Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/department" element={
                        <ProtectedRoute>
                            <Layout>
                                <Department />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/finance" element={
                        <ProtectedRoute>
                            <Layout>
                                <Finance />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    {/* finance */}
                    <Route path="/finance-dashboard" element={ <ProtectedRoute> <Layout> <FinanceDashboard /> </Layout> </ProtectedRoute>} />
                    <Route path="/redemptions" element={ <ProtectedRoute> <Layout> <WelfareRedemptions /> </Layout> </ProtectedRoute>} />
                    <Route path="/todays-redeems" element={ <ProtectedRoute> <Layout> <TodaysRedemptions /> </Layout> </ProtectedRoute>} />



                    {/* employee */}
                    <Route path="/redeem" element={ <ProtectedRoute> <Layout> <QRRedemption /> </Layout> </ProtectedRoute>} />
                    <Route path="/my-dashboard" element={ <ProtectedRoute> <Layout> <EmployeeDashboard /> </Layout> </ProtectedRoute>} />
                    <Route path="/my-allocations" element={ <ProtectedRoute> <Layout> <MyAllocations /> </Layout> </ProtectedRoute>} />
                    <Route path="/my-redemptions" element={ <ProtectedRoute> <Layout> <MyRedemptions /> </Layout> </ProtectedRoute>} />
                    
                    {/* Catch all - redirect to login */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;