
# MiniERP System

## Overview
MiniERP is a Full Stack ERP application developed using React, Express.js, TypeScript, and MySQL. It provides authentication and management of products, customers, and sales challans.

## Tech Stack
- Frontend: React + TypeScript + Vite
- Backend: Express.js + TypeScript
- Database: MySQL (Railway)
- Backend Hosting: Render
- Frontend Hosting: Vercel
- Authentication: JWT

## Features
- User Authentication
- Product Management
- Customer Management
- Sales Challan Management
- REST API
- MySQL Database Integration

## Project Structure

```text
erp-system/
├── backend/
├── frontend/
└── README.md
```

## Backend URL

```
https://erp-8qg4.onrender.com
```

## Run Locally

### Backend

```bash
cd backend
npm install
npm run dev
```
### Frontend URL
```
https://erp-system-two-chi.vercel.app/

```
### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Author

Bhuvaneswaran
=======
# MiniERP - Enterprise Resource Planning System

MiniERP is a full-stack Enterprise Resource Planning (ERP) application designed to streamline customer relationship management (CRM), product cataloging, inventory stock control, and sales delivery challan processing. Built with a Node.js/Express TypeScript REST API backend, a React TypeScript frontend with Vite, and MySQL relational database storage.

---

## 🛠️ Features (Implemented Only)

### 👥 Customer Relationship Management (CRM)
- **Customer Directory**: View paginated list of customers with real-time status (`Active`/`Inactive`) and keyword search.
- **Customer Profile & History**: Detailed view containing customer metadata, aggregated total orders, total expenditure analytics, and interactive follow-up log timeline.
- **Customer CRUD**: Create, edit, and soft-delete customer profiles.
- **Follow-up Interaction Notes**: Add timestamped follow-up records linked to specific customer contacts.

### 📦 Product Catalog & Category Management
- **Product Registry**: Paginated inventory catalog displaying SKU, name, category, unit price, cost price, stock level, and reorder threshold.
- **Product Search & Filtering**: Instant search by SKU/name and category filter.
- **Product Lifecycle**: Create new products, edit pricing/reorder limits, and delete products.

### 📊 Inventory & Stock Movement Audit
- **Stock Movements**: Record Stock **IN**, Stock **OUT**, or Stock **ADJUSTMENT** transactions with reference IDs and notes.
- **Real-Time Stock Recalculation**: Automated quantity calculation on every movement transaction.
- **Low Stock Alerts**: Query endpoint and visual indicator for items falling below designated reorder levels.
- **Stock Movement Log Audit**: Historical audit log per product tracking stock changes, previous stock, new stock, and responsible user.

### 🚚 Sales Delivery Challans
- **Challan Creation**: Draft multi-item delivery challans linked to customers with unit price and quantity line items.
- **Auto-Generated Serial Numbers**: System-generated unique challan identification numbers (`CH-YYYYMMDD-XXXX`).
- **Stock Dispatch Confirmation**: Confirming a draft delivery challan automatically deducts allocated product quantities from inventory.
- **Challan Cancellation**: Cancel draft or issued challans.

### 🔒 Security & Access Control
- **JWT Authentication**: JSON Web Token issuance upon email/password authentication.
- **Role-Based Authorization**: Route-level protection enforcing permission rules for 4 roles (`Admin`, `Sales`, `Warehouse`, `Accounts`).

---

## 🧰 Tech Stack

### Frontend
- **Framework**: React 18 (TypeScript)
- **Build Tool**: Vite
- **Routing**: React Router DOM (v6/v7)
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (Custom Glassmorphism Theme, HSL CSS variables, Flexbox & CSS Grid)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.2 (TypeScript)
- **Database Driver**: `mysql2` (Connection Pool)
- **Authentication**: `jsonwebtoken` (JWT) + `bcrypt` (Password Hashing)
- **CORS**: `cors` middleware with custom origin whitelist

### Database
- **Engine**: MySQL 8.x
- **Schema Auto-Initialization**: `CREATE TABLE IF NOT EXISTS` table generation on server boot with auto-seeding.

---

## 📁 Folder Structure

```
miniErp/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts                # MySQL Connection Pool
│   │   ├── controllers/
│   │   │   ├── authController.ts    # Login, Register, Me handlers
│   │   │   ├── customerController.ts# Customer & Followup handlers
│   │   │   ├── productController.ts # Product & Stock movement handlers
│   │   │   └── challanController.ts # Sales Challan handlers
│   │   ├── middleware/
│   │   │   ├── verifyJWT.ts         # Bearer token verification
│   │   │   └── authorizeRole.ts     # Role authorization guard
│   │   ├── models/
│   │   │   ├── User.ts              # Users table schema & seeding
│   │   │   ├── Customer.ts          # Customers & Followups schema
│   │   │   ├── Product.ts           # Products schema
│   │   │   ├── StockMovement.ts     # Stock movements schema
│   │   │   └── Challan.ts           # Sales Challans & items schema
│   │   ├── routes/
│   │   │   ├── authRoutes.ts        # /api/auth endpoints
│   │   │   ├── customerRoutes.ts    # /api/customers endpoints
│   │   │   ├── productRoutes.ts     # /api/products endpoints
│   │   │   └── challanRoutes.ts     # /api/challans endpoints
│   │   ├── services/
│   │   │   ├── authService.ts       # Auth business logic
│   │   │   ├── customerService.ts   # Customer queries & transactions
│   │   │   ├── productService.ts   # Product queries & stock math
│   │   │   └── challanService.ts    # Challan generation & stock updates
│   │   ├── types/
│   │   │   └── index.ts             # Express request & user type augmentations
│   │   ├── utils/
│   │   │   └── jwt.ts               # Token signing & verification
│   │   ├── app.ts                   # Express application setup & middleware
│   │   └── server.ts                # Server startup & DB connection
│   ├── .env                         # Backend environment configuration
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/              # Modal, Toast, Table, Pagination, Badge, StatCard
│   │   │   └── layout/              # Navbar, Sidebar, MainLayout, ProtectedRoute
│   │   ├── context/
│   │   │   ├── AuthContext.tsx      # User session & localStorage state
│   │   │   └── ToastContext.tsx     # Toast notifications queue
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx        # KPI metrics & quick table
│   │   │   ├── Customers.tsx        # Customer table & detail drawer
│   │   │   ├── Products.tsx         # Product catalog & stock modal
│   │   │   ├── Inventory.tsx        # Stock movement log & low stock alerts
│   │   │   ├── Challans.tsx         # Delivery challan list & creation
│   │   │   ├── Login.tsx            # Login screen
│   │   │   └── NotFound.tsx         # 404 Error page
│   │   ├── services/
│   │   │   ├── api.ts               # HTTP client wrapper with auth header
│   │   │   ├── authService.ts
│   │   │   ├── customerService.ts
│   │   │   ├── productService.ts
│   │   │   └── challanService.ts
│   │   ├── types/
│   │   │   ├── auth.ts
│   │   │   ├── customer.ts
│   │   │   ├── product.ts
│   │   │   └── challan.ts
│   │   ├── App.tsx                  # Router setup
│   │   ├── index.css                # Global CSS variables & styles
│   │   └── main.tsx                 # React entry point
│   ├── .env                         # Frontend environment configuration
│   ├── package.json
│   └── vite.config.ts
│
├── postman_collection.json          # Postman Collection (v2.1)
├── API_DOCUMENTATION.md             # Complete REST API specification
└── README.md                        # Project documentation
```

---

## 📥 Installation

### Prerequisites
- **Node.js**: `v18.x` or `v20.x`
- **MySQL Database**: Running instance of MySQL 8.x

### 1. Clone Repository
```bash
git clone https://github.com/bhuvanesproengineer/erp-system.git
cd miniErp
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

---

## 🏃 Running the Project

### 1. Database Configuration
Ensure MySQL server is running and create a target database:
```sql
CREATE DATABASE minierp_db;
```

### 2. Start Backend Server
In the `backend` folder, configure `.env` then run:
```bash
# Development mode with hot-reload
npm run dev

# Or build & start production JS
npm run build
npm start
```
*The backend automatically creates all required tables and seeds default user credentials on first boot.*

### 3. Start Frontend Client
In the `frontend` folder, configure `.env` then run:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=minierp_db
JWT_SECRET=your_jwt_super_secret_key_12345
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=https://erp-8qg4.onrender.com/api
```

---

## 🌐 Live URLs & Deployment Instructions

### Live Deployments
- **GitHub Repository**: `https://github.com/bhuvanesproengineer/erp-system`
- **Frontend Application (Vercel)**: `https://erp-system-two-chi.vercel.app`
- **Backend API Service (Render)**: `https://erp-8qg4.onrender.com`

### Deployment Steps
1. **Backend (Render / Railway)**:
   - Environment: Node.js
   - Build Command: `cd backend && npm install && npm run build`
   - Start Command: `node backend/dist/server.js`
   - Set environment variables (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`).
2. **Frontend (Vercel)**:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Set Environment Variable: `VITE_API_URL=https://erp-8qg4.onrender.com/api`

---

## 👥 User Roles & Permissions

The system implements 4 distinct roles stored in the JWT payload:

| Role | Access Permissions |
| :--- | :--- |
| **Admin** | Full access to all modules, CRUD on products, customers, stock movements, sales challans, and user management. |
| **Sales** | Customer management (Create/Edit), View Products & stock availability, Create/Edit Sales Challans, Customer follow-ups. Restricted from editing products or stock IN/OUT. |
| **Warehouse** | Product management (Create/Edit), Inventory Stock IN / Stock OUT / Adjustments, View Sales Challans. Restricted from creating customers or sales challans. |
| **Accounts** | Read-only access to Customers, Products, Stock Movements, and Sales Challans for verification. |

---

## 🔑 Test Login Credentials

All seeded demo accounts share the default password: **`password123`**

| Role | Demo Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@minierp.com` | `password123` |
| **Sales** | `sales@minierp.com` | `password123` |
| **Warehouse** | `warehouse@minierp.com` | `password123` |
| **Accounts** | `accounts@minierp.com` | `password123` |

---

## 📡 API Documentation & Postman Collection

- **API Documentation**: Detailed endpoint documentation is available in [API_DOCUMENTATION.md](file:///c:/Users/bhuvaneswaran/OneDrive/Documents/vscode/miniErp/API_DOCUMENTATION.md).
- **Postman Collection**: Import [postman_collection.json](file:///c:/Users/bhuvaneswaran/OneDrive/Documents/vscode/miniErp/postman_collection.json) directly into Postman to test all 30 REST endpoints.

---

## 🏗️ Architecture

```
[ React 18 Frontend ]  <--- HTTP / REST JSON (JWT Header) --->  [ Express.js Backend ]  <--->  [ MySQL Database ]
(Vite + React Router)                                          (Controllers/Services)          (InnoDB Tables)
```

### 1. Frontend Layer
- React SPA built with Vite.
- `api.ts` utility interceptor attaches `Authorization: Bearer <token>` to outbound HTTP requests from `localStorage`.
- Role-based UI rendering conditionally hides action buttons based on `user.role`.

### 2. Backend Layer
- Express.js application routed via `/api/auth`, `/api/products`, `/api/customers`, `/api/challans`.
- Security middleware pipeline: `verifyJWT` (token validity check) -> `authorizeRole` (RBAC permission validation).
- Service layer encapsulates complex database queries, pagination math, and transactional stock deductions.

### 3. Database Layer
- Relational MySQL database using connection pooling via `mysql2/promise`.
- Foreign key constraints maintain relational integrity between customers, products, sales challans, and stock movement logs.

### 4. Authentication Flow
1. Client POSTs credentials to `/api/auth/login`.
2. Backend verifies email exists and validates password hash using `bcrypt.compare`.
3. Backend generates JWT signed with `JWT_SECRET` containing `{ userId, email, role }`.
4. Client stores token and user object in `localStorage`.
5. Subsequent API calls include `Authorization: Bearer <token>` header.

---

## ⚠️ Known Limitations

1. **No Dedicated Accounts / Invoicing UI Screen**: While the `Accounts` role exists in auth, there is currently no standalone frontend view for generating invoices.
2. **No Admin User Management Screen**: User accounts are registered via `/api/auth/register` API or auto-seeded; there is currently no dedicated UI page for Admins to view/disable registered users.
3. **No PDF / CSV Export**: Challans and stock movement reports cannot be exported as PDF/CSV files directly from the UI.
4. **No Password Reset Workflow**: Forgot password email recovery is not currently implemented.

---

## 🚀 Future Improvements

- [ ] Implement PDF generator for Sales Delivery Challans.
- [ ] Add standalone Accounts & Invoicing dashboard page.
- [ ] Add User Management admin interface.
- [ ] Add CSV export for inventory audit logs.
- [ ] Implement password reset via SMTP email service.
>>>>>>> 7ebe3bf (added the readme.md and other features that increase the clarity of the folder and files)
