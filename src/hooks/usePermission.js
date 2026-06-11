// src/hooks/usePermission.js
import { useState, useEffect } from 'react';

export const usePermission = () => {
    const [permissions, setPermissions] = useState([]);
    const [userRole, setUserRole] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPermissions = () => {
            try {
                const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
                const userPermissions = userInfo.permissions || ['VIEW'];
                const role = userInfo.role || '';

                setPermissions(userPermissions);
                setUserRole(role);
            } catch (error) {
                console.error('Error loading permissions:', error);
                setPermissions(['VIEW']);
            } finally {
                setLoading(false);
            }
        };

        loadPermissions();
    }, []);

    const hasPermission = (permission) => {
        // Super Admin has all permissions
        if (userRole === 'SA') {
            return true;
        }
        
        // Check if user has AGALL (Administrative General) permission
        if (permissions.includes('AGALL')) {
            return true;
        }
        
        return permissions.includes(permission);
    };

    const hasAnyPermission = (permissionList) => {
        return permissionList.some(permission => hasPermission(permission));
    };

    const hasAllPermissions = (permissionList) => {
        return permissionList.every(permission => hasPermission(permission));
    };

    return {
        permissions,
        userRole,
        loading,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions
    };
};

// Component wrapper for permission-based rendering
export const WithPermission = ({ permission, children, fallback = null }) => {
    const { hasPermission, loading } = usePermission();
    
    if (loading) return null;
    
    return hasPermission(permission) ? children : fallback;
};

// HOC for protecting routes/components
export const requirePermission = (WrappedComponent, requiredPermission) => {
    return (props) => {
        const { hasPermission, loading } = usePermission();
        
        if (loading) return null;
        
        if (!hasPermission(requiredPermission)) {
            return <div>You don't have permission to access this content.</div>;
        }
        
        return <WrappedComponent {...props} />;
    };
};