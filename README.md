# 🍽️ Lunch Welfare System – Backend API


# Project Title

## Lunch Welfare System – Backend API

The Lunch Welfare System Backend is a RESTful API built using **Laravel** that manages the complete employee lunch welfare process. It provides secure authentication, employee management, department management, welfare allocation, QR code redemption, finance management, and reporting services for the frontend application.

---

# Problem Statement

Many organizations still administer employee lunch welfare manually using paper records or spreadsheets. These traditional approaches often lead to:

- Duplicate lunch claims
- Fraudulent meal redemption
- Manual reconciliation
- Poor record keeping
- Difficult reporting
- Time-consuming administration

These challenges reduce operational efficiency and increase administrative costs.

---

# Solution

The Lunch Welfare System Backend automates the complete lunch welfare workflow by providing REST APIs that support:

- Employee authentication
- Finance authentication
- User management
- Department management
- Employee management
- Welfare allocation
- QR Code redemption
- Finance verification
- Dashboard statistics
- Reporting

The API serves as the business logic layer for the React frontend.

---

# Technology Stack

| Technology | Version |
|------------|---------|
| Laravel | 12 |
| PHP | 8.2 |
| SQLite | Latest |
| REST API | JSON |
| Eloquent ORM | ✔ |
| Artisan CLI | ✔ |

---

# Database

Database Engine

```
SQLite3
```

Database File

```
database/database.sqlite
```

Create the SQLite database

```bash
touch database/database.sqlite
```

---

# Installation

## 1. Clone Repository

```bash
https://github.com/HENRY-2016/mogasoft-lwis.git
```

---

## 2. Navigate into Project

```bash
cd lunch-welfare-system-api
```

---

## 3. Install Dependencies

```bash
composer install
```

---

## 4. Create Environment File

```bash
cp .env.example .env
```

---

## 5. Generate Application Key

```bash
php artisan key:generate
```

---

## 6. Create SQLite Database

```bash
touch database/database.sqlite
```

---

## 7. Configure .env

```env
APP_NAME="Lunch Welfare System"

DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
```

---

## 8. Run Database Migrations

```bash
php artisan migrate
```

---

## 9. Seed Initial Data

```bash
php artisan db:seed --class=UserSeeder
```

---

## 10. Start Development Server

```bash
php artisan serve
```

Application URL

```
http://127.0.0.1:8000
```

---

# Database Architecture

The application uses **Laravel Eloquent ORM** together with SQLite.

The system consists of several tables managed through Laravel migrations.

Typical tables include:

- users
- employees
- departments
- finances
- welfare_allocations
- welfare_redemptions
- personal_access_tokens

---

# Project Structure

```
app/
│
├── Http/
│   └── Controllers/
│       ├── EmployeesController.php
│       ├── WelfareController.php
│       ├── DepartmentController.php
│       ├── FinanceController.php
│       └── UserController.php
│
├── Models/
│   ├── Employee.php
│   ├── Department.php
│   ├── Finance.php
│   ├── User.php
│   ├── WelfareAllocation.php
│   └── WelfareRedemption.php
│
database/
│
├── migrations/
├── seeders/
└── database.sqlite
```

---

# Controllers

The application follows the MVC architecture provided by Laravel.

## EmployeesController

Responsible for employee management.

Functions include:

- Employee Login
- Employee Logout
- Employee Profile
- Create Employee
- Update Employee
- Delete Employee
- View Employee
- Employee List
- Department Lookup

---

## WelfareController

Handles the complete welfare process.

Responsibilities include:

- Dashboard Statistics
- Welfare Allocation
- Issue Allocations
- QR Code Generation
- QR Code Verification
- Meal Redemption
- Employee Allocation History
- Employee Redemption History
- Daily Redemption Reports

---

## DepartmentController

Responsible for managing departments.

Functions include:

- Create Department
- Update Department
- Delete Department
- Department List
- Department Names

---

## FinanceController

Responsible for Finance Officer operations.

Features include:

- Finance Login
- Logout
- Profile
- Change Password
- Create Finance User
- Update Finance User
- Delete Finance User

---

## UserController

Responsible for administrator authentication.

Functions include:

- Login
- Register
- Logout
- User Listing

---

# Models

Laravel Eloquent Models represent the database tables and encapsulate business logic.

## User Model

Represents system administrators.

Responsibilities:

- Authentication
- Password Hashing
- User Management

---

## Employee Model

Represents employees eligible for welfare.

Stores:

- Employee Number
- Name
- Department
- Login Credentials

Relationships:

- Department
- Welfare Allocations
- Welfare Redemptions

---

## Department Model

Stores department information.

Relationships:

- Employees

---

## Finance Model

Represents finance officers.

Responsibilities:

- Authentication
- Redemption Verification
- Reporting

---

## WelfareAllocation Model

Stores lunch allocations issued to employees.

Contains:

- Employee
- QR Code
- Allocation Status
- Issue Date

Relationships:

- Employee

---

## WelfareRedemption Model

Stores redeemed lunch records.

Contains:

- Employee
- Allocation
- Redemption Time
- Finance Verification

Relationships:

- Employee
- Welfare Allocation

---

# Database Migrations

Laravel migrations manage database versioning.

Each migration defines:

- Table structure
- Columns
- Foreign Keys
- Indexes
- Constraints

Typical migrations include:

```
create_users_table
create_departments_table
create_employees_table
create_finances_table
create_welfare_allocations_table
create_welfare_redemptions_table
create_personal_access_tokens_table
```

Run migrations

```bash
php artisan migrate
```

Rollback

```bash
php artisan migrate:rollback
```

Refresh Database

```bash
php artisan migrate:fresh
```

Refresh with Seeders

```bash
php artisan migrate:fresh --seed
```

---

# API Endpoints

## Employee

| Method | Endpoint |
|---------|----------|
| POST | /api/employees/login |
| POST | /api/employees/logout |
| POST | /api/employees/logout-all |
| GET | /api/employees/profile |
| GET | /api/employees/list |
| GET | /api/employees/names |
| GET | /api/employees/show/{id} |
| POST | /api/employees/store |
| POST | /api/employees/update |
| POST | /api/employees/delete |
| GET | /api/employees/departments |

---

## User

| Method | Endpoint |
|---------|----------|
| POST | /api/user/login |
| POST | /api/user/register |
| POST | /api/user/logout |
| GET | /api/user/users |

---

## Department

| Method | Endpoint |
|---------|----------|
| GET | /api/department/list |
| GET | /api/department/names |
| POST | /api/department/store |
| POST | /api/department/update |
| POST | /api/department/delete |
| GET | /api/department/show/{id} |

---

## Welfare

| Method | Endpoint |
|---------|----------|
| GET | /api/welfare/dashboard |
| GET | /api/welfare/allocations |
| POST | /api/welfare/allocations |
| POST | /api/welfare/allocations/issue |
| GET | /api/welfare/allocations/qr/{qrCode} |
| GET | /api/welfare/allocations-by-employee/{number} |
| POST | /api/welfare/redeem |
| GET | /api/welfare/redemptions |
| GET | /api/welfare/redemptions/today |
| GET | /api/welfare/redemptions-by-employee/{number} |

---

## Finance

| Method | Endpoint |
|---------|----------|
| POST | /api/finance/login |
| POST | /api/finance/logout |
| GET | /api/finance/profile |
| POST | /api/finance/change-password |
| GET | /api/finance/list |
| POST | /api/finance/store |
| POST | /api/finance/update |
| POST | /api/finance/delete |
| GET | /api/finance/show/{id} |

---

# Seeder

The project includes a **UserSeeder** to create initial administrator accounts.

Run the seeder:

```bash
php artisan db:seed --class=UserSeeder
```

---

# Development Commands

Install Dependencies

```bash
composer install
```

Generate Key

```bash
php artisan key:generate
```

Create SQLite Database

```bash
touch database/database.sqlite
```

Run Migrations

```bash
php artisan migrate
```

Run Seeder

```bash
php artisan db:seed --class=UserSeeder
```

Serve Application

```bash
php artisan serve
```

