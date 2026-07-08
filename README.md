# 🍽️ Lunch Welfare System – Frontend

## Project Title

**Lunch Welfare System**

The Lunch Welfare System is a modern web-based application developed using **React.js** and **Material UI** to automate the management of employee lunch welfare programs within an organization. The application provides role-based dashboards for administrators, finance officers, and employees, enabling efficient allocation, redemption, and tracking of lunch benefits.

---

# Problem & Solution

## Problem

Many organizations still manage employee lunch welfare manually using paper registers, spreadsheets, or verbal confirmations. These approaches present several challenges:

- Manual allocation of lunch benefits
- Difficult tracking of redeemed meals
- Duplicate or fraudulent meal claims
- Lack of accountability and reporting
- Slow reconciliation by the finance department
- Poor visibility of employee lunch balances

These challenges often lead to inaccurate records, financial losses, and inefficient administration.

---

## Solution

The Lunch Welfare System digitizes the complete lunch welfare process by providing:

- Secure user authentication
- Role-based access control
- Employee management
- Department management
- Lunch welfare allocation
- QR Code meal redemption
- Finance verification
- Daily redemption reports
- Employee allocation history
- Employee redemption history
- Real-time dashboards

The system minimizes fraud, improves transparency, and simplifies lunch welfare administration.

---

# Features

## Administrator

- Dashboard
- Employee Management
- Department Management
- Welfare Allocation
- Finance Management

---

## Finance Officer

- Finance Dashboard
- View Welfare Redemptions
- Today's Redemptions
- Verify Meal Redemptions

---

## Employee

- Employee Dashboard
- View My Allocations
- Redeem Lunch using QR Code
- View Redemption History

---

# Technology Stack

## Frontend

- React.js 19
- React Router DOM
- Material UI (MUI)
- Emotion
- Axios
- Framer Motion
- Notistack
- CSS3
- HTML5
- JavaScript (ES6+)

---

# Project Structure

```
src/
│
├── apiServices/
├── auth/
├── components/
├── pages/
│   ├── employee/
│   ├── finance/
│   ├── Dashboard.js
│   ├── Employees.js
│   ├── Department.js
│   ├── Finance.js
│   └── WelfareAllocations.js
│
├── App.js
└── index.js
```

---

# Application Modules

### Authentication

- Login
- Protected Routes
- Session Authentication

---

### Administration

- Dashboard
- Employee Management
- Department Management
- Welfare Allocation
- Finance Management

---

### Finance

- Finance Dashboard
- Welfare Redemptions
- Today's Redemptions

---

### Employee

- Employee Dashboard
- QR Code Redemption
- My Allocations
- My Redemptions

---

# Route Summary

| Route | Description |
|--------|-------------|
| / | Login |
| /dashboard | Administrator Dashboard |
| /employees | Employee Management |
| /department | Department Management |
| /allocations | Welfare Allocation |
| /finance | Finance Management |
| /finance-dashboard | Finance Dashboard |
| /redemptions | Welfare Redemptions |
| /todays-redeems | Today's Redemptions |
| /redeem | QR Code Redemption |
| /my-dashboard | Employee Dashboard |
| /my-allocations | Employee Allocations |
| /my-redemptions | Employee Redemption History |

---

# Technologies Used

## Framework

- React.js 19

## UI Library

- Material UI (MUI)

## Routing

- React Router DOM

## HTTP Client

- Axios

## Notifications

- Notistack

## Animation

- Framer Motion

## Styling

- CSS
- Material UI Theme

---

# Installation

## 1. Clone the Repository

```bash
https://github.com/HENRY-2016/mogasoft-lwis.git
```

---

## 2. Navigate to the Frontend Folder

```bash
cd front-end
```

---

## 3. Install Dependencies

```bash
npm install
```

or

```bash
npm install --legacy-peer-deps
```

if dependency conflicts occur.

---

## 4. Configure Environment Variables
    ```
        Chane the API url end point in the APIs.js file 
    ```

## 5. Start the Development Server

```bash
npm start
```

The application will start at:

```
http://localhost:3000
```

---

## 6. Build for Production

```bash
npm run build
```


# Authentication

The application uses Protected Routes to ensure only authenticated users can access secured pages.

Unauthenticated users are automatically redirected to the Login page.

---
