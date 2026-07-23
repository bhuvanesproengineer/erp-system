# MiniERP Backend REST API Documentation

This directory contains the Express.js REST API backend service for MiniERP.

## 🌐 Live Production Deployments

- **Frontend Application (Vercel)**: `https://erp-system-two-chi.vercel.app`
- **Backend API Service (Render)**: `https://erp-system-zr2w.onrender.com`

## 🚀 Environment Variables & Base URL

- **Production API Base URL**: `https://erp-system-zr2w.onrender.com`
- **Local Development Base URL**: `http://localhost:5000`
- **Authentication**: JWT Bearer Token passed via HTTP Header: `Authorization: Bearer <token>`

---

## 📌 Postman Collection

A ready-to-import Postman Collection (v2.1) is available at:
`postman_collection.json` in the project root directory.

---

## 📑 API Endpoints Summary

### 1. System & Health

| Method | Endpoint | Description | Auth Required | Roles Allowed | Status Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Service root status check | No | Public | `200` |
| `GET` | `/health` | Server health check | No | Public | `200` |
| `GET` | `/api` | API directory index | No | Public | `200` |
| `GET` | `/api/health` | API sub-service health check | No | Public | `200` |

---

### 2. Authentication (`/api/auth`)

#### 🔹 `POST /api/auth/register`
- **Description**: Registers a new user account with a designated role.
- **Auth Required**: No
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "username": "sales_agent",
  "email": "sales@minierp.com",
  "password": "password123",
  "role": "Sales"
}
```
- **Response (`201 Created`)**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 2,
    "username": "sales_agent",
    "email": "sales@minierp.com",
    "role": "Sales"
  },
  "token": "eyJhbGciOiJIUzI1NiIsIn..."
}
```
- **Expected Status Codes**: `201 Created`, `400 Bad Request`

#### 🔹 `POST /api/auth/login`
- **Description**: Authenticates user credentials and issues a JWT token containing user ID, email, and role.
- **Auth Required**: No
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "email": "admin@minierp.com",
  "password": "password123"
}
```
- **Response (`200 OK`)**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": 1,
    "username": "System Admin",
    "email": "admin@minierp.com",
    "role": "Admin"
  }
}
```
- **Expected Status Codes**: `200 OK`, `400 Bad Request`, `401 Unauthorized`

#### 🔹 `GET /api/auth/me`
- **Description**: Retrieves profile data of currently authenticated user.
- **Auth Required**: Yes (`Bearer Token`)
- **Headers**: `Authorization: Bearer <token>`
- **Response (`200 OK`)**:
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
- **Expected Status Codes**: `200 OK`, `401 Unauthorized`, `404 Not Found`

---

### 3. Customers (`/api/customers`)

#### 🔹 `GET /api/customers`
- **Description**: Retrieves paginated list of customers.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Sales`, `Accounts`, `Warehouse`
- **Query Parameters**:
  - `page` *(optional, integer, default: 1)*: Page number
  - `limit` *(optional, integer, default: 10)*: Items per page
  - `search` / `q` *(optional, string)*: Search keyword
  - `status` *(optional, string)*: Customer status (`Active`, `Inactive`)
- **Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Customers retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Acme Corp",
      "companyName": "Acme Global",
      "email": "contact@acme.com",
      "phone": "+1-555-0199",
      "address": "123 Business Way",
      "taxId": "TAX-998877",
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
- **Expected Status Codes**: `200 OK`, `401 Unauthorized`, `403 Forbidden`

#### 🔹 `GET /api/customers/search`
- **Description**: Quick search customer directory by keyword.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Sales`, `Accounts`, `Warehouse`
- **Query Parameters**: `q` or `search`
- **Expected Status Codes**: `200 OK`, `401 Unauthorized`, `403 Forbidden`

#### 🔹 `GET /api/customers/:id`
- **Description**: Fetches basic customer details by customer ID.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Sales`, `Accounts`
- **Path Parameters**: `id` *(integer, required)*
- **Expected Status Codes**: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

#### 🔹 `GET /api/customers/:id/details`
- **Description**: Fetches comprehensive customer profile, order history, and follow-up notes.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Sales`, `Accounts`
- **Path Parameters**: `id` *(integer, required)*
- **Expected Status Codes**: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

#### 🔹 `POST /api/customers`
- **Description**: Creates a new customer record.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Sales`
- **Request Body**:
```json
{
  "name": "Jane Smith",
  "companyName": "Global Logistics Inc",
  "email": "jane.smith@globallogistics.com",
  "phone": "+1-555-0188",
  "address": "789 Warehouse Blvd, Suite 200",
  "taxId": "TAX-445566",
  "status": "Active"
}
```
- **Expected Status Codes**: `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`

#### 🔹 `PUT /api/customers/:id`
- **Description**: Updates an existing customer record.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Sales`
- **Path Parameters**: `id` *(integer, required)*
- **Expected Status Codes**: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

#### 🔹 `DELETE /api/customers/:id`
- **Description**: Deletes a customer record.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Sales`
- **Path Parameters**: `id` *(integer, required)*
- **Expected Status Codes**: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

#### 🔹 `POST /api/customers/:id/followups`
- **Description**: Adds a follow-up note to a customer.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Sales`
- **Path Parameters**: `id` *(integer, required)*
- **Request Body**:
```json
{
  "note": "Discussed annual supply contract renewal.",
  "contactPerson": "Jane Smith",
  "followupDate": "2026-08-01"
}
```
- **Expected Status Codes**: `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`

---

### 4. Products & Inventory (`/api/products`)

#### 🔹 `GET /api/products`
- **Description**: Fetches paginated product catalog.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Warehouse`, `Sales`, `Accounts`
- **Query Parameters**: `page`, `limit`, `search`, `category`
- **Expected Status Codes**: `200 OK`, `401 Unauthorized`, `403 Forbidden`

#### 🔹 `GET /api/products/search`
- **Description**: Search products by name or SKU keyword.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Warehouse`, `Sales`, `Accounts`
- **Query Parameters**: `q` or `search`
- **Expected Status Codes**: `200 OK`, `401 Unauthorized`, `403 Forbidden`

#### 🔹 `GET /api/products/low-stock`
- **Description**: Fetches products where current stock level is less than or equal to reorder level.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Warehouse`, `Accounts`
- **Expected Status Codes**: `200 OK`, `401 Unauthorized`, `403 Forbidden`

#### 🔹 `GET /api/products/:id`
- **Description**: Retrieves single product by ID.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Warehouse`, `Sales`, `Accounts`
- **Path Parameters**: `id` *(integer, required)*
- **Expected Status Codes**: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

#### 🔹 `POST /api/products`
- **Description**: Creates a new product item.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`
- **Request Body**:
```json
{
  "sku": "PROD-1002",
  "name": "Adjustable Standing Desk",
  "description": "Motorized height adjustable desk",
  "category": "Furniture",
  "unit": "Pcs",
  "price": 499.99,
  "costPrice": 320.00,
  "stockQuantity": 20,
  "reorderLevel": 5
}
```
- **Expected Status Codes**: `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `409 Conflict`

#### 🔹 `PUT /api/products/:id`
- **Description**: Updates product details.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`
- **Path Parameters**: `id` *(integer, required)*
- **Expected Status Codes**: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

#### 🔹 `DELETE /api/products/:id`
- **Description**: Deletes a product item.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`
- **Path Parameters**: `id` *(integer, required)*
- **Expected Status Codes**: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

#### 🔹 `POST /api/products/:id/stock`
- **Description**: Records stock movement (IN, OUT, or ADJUSTMENT) for a product.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Warehouse`
- **Path Parameters**: `id` *(integer, required)*
- **Request Body**:
```json
{
  "type": "IN",
  "quantity": 15,
  "reference": "PO-99120",
  "notes": "Received vendor restock batch"
}
```
- **Expected Status Codes**: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

#### 🔹 `GET /api/products/:id/movements`
- **Description**: Fetches historical stock movement logs for a product.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Warehouse`, `Accounts`
- **Path Parameters**: `id` *(integer, required)*
- **Expected Status Codes**: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

---

### 5. Sales Challans (`/api/challans`)

#### 🔹 `GET /api/challans`
- **Description**: Retrieves paginated list of sales delivery challans.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Sales`, `Accounts`, `Warehouse`
- **Query Parameters**: `page`, `limit`, `search`, `status`
- **Expected Status Codes**: `200 OK`, `401 Unauthorized`, `403 Forbidden`

#### 🔹 `GET /api/challans/search`
- **Description**: Search sales challans by keyword.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Sales`, `Accounts`, `Warehouse`
- **Query Parameters**: `q` or `search`
- **Expected Status Codes**: `200 OK`, `401 Unauthorized`, `403 Forbidden`

#### 🔹 `GET /api/challans/:id`
- **Description**: Fetches sales delivery challan details by ID.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Sales`, `Accounts`, `Warehouse`
- **Path Parameters**: `id` *(integer, required)*
- **Expected Status Codes**: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

#### 🔹 `POST /api/challans`
- **Description**: Creates a new sales delivery challan in Draft state.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Sales`
- **Request Body**:
```json
{
  "customerId": 1,
  "issueDate": "2026-07-23",
  "notes": "Standard delivery shipment",
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "unitPrice": 249.99
    }
  ]
}
```
- **Expected Status Codes**: `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`

#### 🔹 `PUT /api/challans/:id/confirm`
- **Description**: Confirms delivery challan, updating status to Confirmed and reducing item stock levels.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Sales`, `Warehouse`
- **Path Parameters**: `id` *(integer, required)*
- **Expected Status Codes**: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

#### 🔹 `PUT /api/challans/:id/cancel`
- **Description**: Cancels a sales delivery challan.
- **Auth Required**: Yes (`Bearer Token`)
- **Roles Allowed**: `Admin`, `Sales`
- **Path Parameters**: `id` *(integer, required)*
- **Expected Status Codes**: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`
