# MiniERP REST API Documentation

This document contains full technical specifications for all existing 30 REST API endpoints in the MiniERP backend service.

---

## 🌐 Server Base URLs

- **Production Base URL**: `https://erp-8qg4.onrender.com`
- **Local Base URL**: `http://localhost:5000`

---

## 🔑 Authentication & Headers

Protected endpoints require a JSON Web Token (JWT) supplied via standard HTTP Bearer header:

```http
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

---

## 📂 Endpoints Directory

### 1. System & Health Check Endpoints

#### `GET /`
- **Description**: Root status check for the backend API service.
- **Auth Required**: No (Public)
- **Headers**: None
- **Request Body**: None
- **Status Codes**: `200 OK`
- **Example Response (`200 OK`)**:
```json
{
  "success": true,
  "status": "active",
  "message": "MiniERP Backend API Service is running",
  "timestamp": "2026-07-23T14:30:00.000Z"
}
```

---

#### `GET /health`
- **Description**: Server health check status.
- **Auth Required**: No (Public)
- **Status Codes**: `200 OK`
- **Example Response (`200 OK`)**:
```json
{
  "success": true,
  "status": "active",
  "message": "Server is healthy and active",
  "timestamp": "2026-07-23T14:30:00.000Z"
}
```

---

#### `GET /api`
- **Description**: API v1 directory index endpoint listing available route groups.
- **Auth Required**: No (Public)
- **Status Codes**: `200 OK`
- **Example Response (`200 OK`)**:
```json
{
  "success": true,
  "status": "active",
  "message": "MiniERP API v1 Root Endpoint",
  "endpoints": {
    "health": "/health",
    "auth": "/api/auth",
    "products": "/api/products",
    "customers": "/api/customers",
    "challans": "/api/challans"
  },
  "timestamp": "2026-07-23T14:30:00.000Z"
}
```

---

#### `GET /api/health`
- **Description**: API service sub-health status.
- **Auth Required**: No (Public)
- **Status Codes**: `200 OK`
- **Example Response (`200 OK`)**:
```json
{
  "success": true,
  "status": "active",
  "message": "API Service is healthy and active",
  "timestamp": "2026-07-23T14:30:00.000Z"
}
```

---

### 2. Authentication Endpoints (`/api/auth`)

#### `POST /api/auth/register`
- **Description**: Registers a new user account with a specified role (`Admin`, `Sales`, `Warehouse`, `Accounts`).
- **Auth Required**: No (Public)
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "username": "sales_rep",
  "email": "sales.rep@minierp.com",
  "password": "password123",
  "role": "Sales"
}
```
- **Status Codes**: `201 Created`, `400 Bad Request`
- **Example Response (`201 Created`)**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 5,
    "username": "sales_rep",
    "email": "sales.rep@minierp.com",
    "role": "Sales"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

---

#### `POST /api/auth/login`
- **Description**: Authenticates user credentials and returns a signed JWT access token.
- **Auth Required**: No (Public)
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "email": "admin@minierp.com",
  "password": "password123"
}
```
- **Status Codes**: `200 OK`, `400 Bad Request`, `401 Unauthorized`
- **Example Response (`200 OK`)**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": {
    "id": 1,
    "username": "System Admin",
    "email": "admin@minierp.com",
    "role": "Admin"
  }
}
```

---

#### `GET /api/auth/me`
- **Description**: Returns profile details of the currently authenticated user based on JWT.
- **Auth Required**: Yes (`Bearer Token`)
- **Headers**: `Authorization: Bearer <token>`
- **Status Codes**: `200 OK`, `401 Unauthorized`, `404 Not Found`
- **Example Response (`200 OK`)**:
```json
{
  "user": {
    "id": 1,
    "username": "System Admin",
    "email": "admin@minierp.com",
    "role": "Admin",
    "created_at": "2026-07-23T08:00:00.000Z"
  }
}
```

---

### 3. Customer Management Endpoints (`/api/customers`)

#### `GET /api/customers`
- **Description**: Retrieves paginated list of customers with optional search and status filter.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Sales`, `Accounts`, `Warehouse`
- **Query Parameters**:
  - `page` *(optional, default: 1)*
  - `limit` *(optional, default: 10)*
  - `search` or `q` *(optional, string)*
  - `status` *(optional, `Active` / `Inactive`)*
- **Status Codes**: `200 OK`, `401 Unauthorized`, `403 Forbidden`
- **Example Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Customers retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Acme Corporation",
      "companyName": "Acme Global",
      "email": "info@acme.com",
      "phone": "+1-555-0199",
      "address": "100 Innovation Way, Tech City",
      "taxId": "TAX-12345",
      "status": "Active",
      "createdAt": "2026-07-23T08:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

#### `GET /api/customers/search`
- **Description**: Quick keyword search across customer directory.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Sales`, `Accounts`, `Warehouse`
- **Query Parameters**: `q` or `search`
- **Status Codes**: `200 OK`, `401 Unauthorized`, `403 Forbidden`

---

#### `GET /api/customers/:id`
- **Description**: Retrieves single customer by ID.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Sales`, `Accounts`
- **Path Parameters**: `id` *(integer, required)*
- **Status Codes**: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

---

#### `GET /api/customers/:id/details`
- **Description**: Retrieves comprehensive customer profile with order stats and follow-up notes timeline.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Sales`, `Accounts`
- **Path Parameters**: `id` *(integer, required)*
- **Status Codes**: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

---

#### `POST /api/customers`
- **Description**: Creates a new customer record.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Sales`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "name": "Jane Smith",
  "companyName": "Global Logistics Inc",
  "email": "jane@globallogistics.com",
  "phone": "+1-555-0188",
  "address": "789 Warehouse Blvd",
  "taxId": "TAX-445566",
  "status": "Active"
}
```
- **Status Codes**: `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`

---

#### `PUT /api/customers/:id`
- **Description**: Updates an existing customer profile.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Sales`
- **Path Parameters**: `id` *(integer, required)*
- **Status Codes**: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

---

#### `DELETE /api/customers/:id`
- **Description**: Deletes a customer profile.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Sales`
- **Path Parameters**: `id` *(integer, required)*
- **Status Codes**: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

---

#### `POST /api/customers/:id/followups`
- **Description**: Records a new follow-up interaction note for a customer.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Sales`
- **Path Parameters**: `id` *(integer, required)*
- **Request Body**:
```json
{
  "note": "Scheduled contract review meeting.",
  "contactPerson": "Jane Smith",
  "followupDate": "2026-08-01"
}
```
- **Status Codes**: `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`

---

### 4. Product Catalog & Inventory Endpoints (`/api/products`)

#### `GET /api/products`
- **Description**: Retrieves paginated list of products with optional search and category filter.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Warehouse`, `Sales`, `Accounts`
- **Query Parameters**: `page`, `limit`, `search`, `category`
- **Status Codes**: `200 OK`, `401 Unauthorized`, `403 Forbidden`

---

#### `GET /api/products/search`
- **Description**: Search products by name or SKU.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Warehouse`, `Sales`, `Accounts`
- **Query Parameters**: `q` or `search`
- **Status Codes**: `200 OK`, `401 Unauthorized`, `403 Forbidden`

---

#### `GET /api/products/low-stock`
- **Description**: Retrieves all products whose stock quantity is less than or equal to reorder level.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Warehouse`, `Accounts`
- **Status Codes**: `200 OK`, `401 Unauthorized`, `403 Forbidden`

---

#### `GET /api/products/:id`
- **Description**: Retrieves product details by product ID.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Warehouse`, `Sales`, `Accounts`
- **Path Parameters**: `id` *(integer, required)*
- **Status Codes**: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

---

#### `POST /api/products`
- **Description**: Creates a new product entry in inventory.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`
- **Request Body**:
```json
{
  "sku": "PROD-1002",
  "name": "Adjustable Standing Desk",
  "description": "Motorized dual-motor standing desk",
  "category": "Furniture",
  "unit": "Pcs",
  "price": 499.99,
  "costPrice": 320.00,
  "stockQuantity": 20,
  "reorderLevel": 5
}
```
- **Status Codes**: `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `409 Conflict`

---

#### `PUT /api/products/:id`
- **Description**: Updates product metadata or pricing.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`
- **Path Parameters**: `id` *(integer, required)*
- **Status Codes**: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

---

#### `DELETE /api/products/:id`
- **Description**: Deletes a product item.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`
- **Path Parameters**: `id` *(integer, required)*
- **Status Codes**: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

---

#### `POST /api/products/:id/stock`
- **Description**: Records stock movement (`IN`, `OUT`, or `ADJUSTMENT`) and recalculates current stock.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Warehouse`
- **Path Parameters**: `id` *(integer, required)*
- **Request Body**:
```json
{
  "type": "IN",
  "quantity": 15,
  "reference": "PO-99120",
  "notes": "Vendor shipment received"
}
```
- **Status Codes**: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

---

#### `GET /api/products/:id/movements`
- **Description**: Retrieves historical stock movement audit log for a product.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Warehouse`, `Accounts`
- **Path Parameters**: `id` *(integer, required)*
- **Status Codes**: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

---

### 5. Sales Delivery Challans Endpoints (`/api/challans`)

#### `GET /api/challans`
- **Description**: Retrieves paginated list of sales delivery challans.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Sales`, `Accounts`, `Warehouse`
- **Query Parameters**: `page`, `limit`, `search`, `status`
- **Status Codes**: `200 OK`, `401 Unauthorized`, `403 Forbidden`

---

#### `GET /api/challans/search`
- **Description**: Search sales delivery challans by challan number or customer.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Sales`, `Accounts`, `Warehouse`
- **Query Parameters**: `q` or `search`
- **Status Codes**: `200 OK`, `401 Unauthorized`, `403 Forbidden`

---

#### `GET /api/challans/:id`
- **Description**: Retrieves sales delivery challan details with line items.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Sales`, `Accounts`, `Warehouse`
- **Path Parameters**: `id` *(integer, required)*
- **Status Codes**: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

---

#### `POST /api/challans`
- **Description**: Creates a new delivery challan in `Draft` status.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Sales`
- **Request Body**:
```json
{
  "customerId": 1,
  "issueDate": "2026-07-23",
  "notes": "Standard express delivery shipment",
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "unitPrice": 249.99
    }
  ]
}
```
- **Status Codes**: `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`

---

#### `PUT /api/challans/:id/confirm`
- **Description**: Confirms delivery challan, transitioning status to `Confirmed` and automatically deducting product stock.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Sales`, `Warehouse`
- **Path Parameters**: `id` *(integer, required)*
- **Status Codes**: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

---

#### `PUT /api/challans/:id/cancel`
- **Description**: Cancels a sales delivery challan.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Sales`
- **Path Parameters**: `id` *(integer, required)*
- **Status Codes**: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`
