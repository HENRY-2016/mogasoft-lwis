import {
CheckCircle,
Cancel,
} from '@mui/icons-material';

export const recordsPerPage = 20;

// Gender options
export const genderOptions = [
    { id: 'male', name: 'Male' },
    { id: 'female', name: 'Female' },
    { id: 'other', name: 'Other' }
];


export const getInitials = (name) => {
    if (!name) return '??';
    
    const words = name.split(' ').filter(word => word.length > 0);
    
    if (words.length === 0) return '??';
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

export const formatNumberWithComma = (numb) => {
    // Convert to number first
    const num = Number(numb);
    
    // Check if valid number
    if (isNaN(num) || !isFinite(num)) {
        return '0';
    }
    
    // Format the number
    const str = num.toString().split(".");
    str[0] = str[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return  str.join(".");
};
export const recordsCount = (numb) => {
    // Convert to number first
    const num = Number(numb);

    // Check if valid number
    if (isNaN(num) || !isFinite(num)) {
        return '0';
    }
    // Format the number
    const str = num.toString().split(".");
    str[0] = str[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return str.join(".");
};
export const formatCreatedAtDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',    // "Mar"
        day: '2-digit',   // "02"
        year: 'numeric'    // "2025"
    });
};



export const getNameById = (id, Data) => {
    let Id = parseInt(id);
    let nameFound = "Name Not found";
    const record = Data.find((item) => item.id === Id);
    if (record) {
        nameFound = record.name
    } else {
        return "No Record Found";
    }

    return nameFound;
};


/**
 * Get user details from session storage
 */
export const getUserDetails = (key = null) => {
    try {
        const userInfo = sessionStorage.getItem('userInfo');
        if (!userInfo) return key ? null : null;
        
        const user = JSON.parse(userInfo);
        if (key && user[key]) {
            return user[key];
        }
        return user;
    } catch (error) {
        console.error('Error getting user details:', error);
        return key ? null : null;
    }
};

/**
 * Check if user is logged in
 */
export const isUserLoggedIn = () => {
    const userInfo = sessionStorage.getItem('userInfo');
    return !!userInfo;
};

/**
 * Clear user session
 */
export const clearUserSession = () => {
    sessionStorage.removeItem('userInfo');
};

