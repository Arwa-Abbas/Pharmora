# Pharmora – Full Stack Pharmacy Web Application

## Overview
Pharmora is a full-stack web application for pharmacy services, medical appointments, and online medicine ordering.
It connects Patients, Doctors, Pharmacists, Suppliers, and Admins in one unified healthcare platform — each with a dedicated role-based dashboard.

[Demo Video Folder (Google Drive)](https://drive.google.com/drive/folders/1d4BsMWpF2vKeaHTiuW_f0FZXlM6NqM9r?usp=sharing)

---

## 🌐 Live Deployment

| Service | URL |
|---------|-----|
| **Frontend** (Vercel) | [https://pharmora-store.vercel.app](https://pharmora-store.vercel.app) |
| **Backend** (Render) | [https://pharmora.onrender.com](https://pharmora.onrender.com) |

> Note: The backend is hosted on Render's free tier and may take ~1 minute to spin up on first request.

---

## 🏗️ Tech Stack
- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Node.js, Express
- **Database:** Supabase (PostgreSQL)
- **Auth:** Custom Login + Role-Based Access Control

---

## 📂 Project Structure
```
Pharmora/
│
├── frontend/
│   ├── public/
│   │   └── images/
│   │       ├── pharmacy.jpg
│   │       ├── doctors.jpg
│   │       ├── pharmacists.jpg
│   │       ├── suppliers.jpg
│   │       └── why-choose-us.jpg
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   └── ErrorMessage.jsx
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── StatsCard.jsx
│   │   │   │   ├── RequestCard.jsx
│   │   │   │   ├── InventoryCard.jsx
│   │   │   │   ├── DeliveryCard.jsx
│   │   │   │   ├── PrescriptionCard.jsx
│   │   │   │   └── OrderCard.jsx
│   │   │   │
│   │   │   ├── Navbar.jsx
│   │   │   └── NotificationContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Doctors.jsx
│   │   │   ├── Pharmacists.jsx
│   │   │   ├── Suppliers.jsx
│   │   │   │
│   │   │   └── dashboard/
│   │   │       ├── PatientDashboard.jsx
│   │   │       ├── DoctorDashboard.jsx
│   │   │       ├── PharmacistDashboard.jsx
│   │   │       ├── SupplierDashboard.jsx
│   │   │       └── AdminDashboard.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── medicineService.js
│   │   │   ├── cartService.js
│   │   │   ├── orderService.js
│   │   │   ├── prescriptionService.js
│   │   │   └── ...
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useCart.js
│   │   │   └── useNotifications.js
│   │   │
│   │   └── styles/
│   │       ├── home.css
│   │       ├── login.css
│   │       └── notifications.css
│   │
│   ├── .env
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/
│   ├── config/
│   │   └── database.js
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   └── adminAuth.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── prescriptionRoutes.js
│   │   ├── stockRequestRoutes.js
│   │   └── ...
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── orderController.js
│   │   ├── prescriptionController.js
│   │   ├── stockRequestController.js
│   │   └── ...
│   │
│   ├── .env
│   ├── server.js
│   └── package.json
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
└── README.md
```

---

## 👥 User Roles & Flows

### 🛠️ Admin
- Manages all user accounts across every role
- Monitors platform activity, sales, and inventory
- Generates reports on medicines, users, and orders

---

### 🧑‍⚕️ Patient
**What they can do:**
- Browse and search the medicines catalogue
- Add medicines to cart and place orders
- Upload prescriptions for pharmacist verification
- View doctor-issued prescriptions linked to their account
- Track order status from Pending → Delivered
- Make payments for placed orders

**Interactions:**
- Receives prescriptions issued by **Doctors**
- Orders are fulfilled and shipped by **Pharmacists**

---

### 👨‍⚕️ Doctor
**What they can do:**
- Create electronic prescriptions for patients (with diagnosis, medicines, dosage, frequency, duration)
- Verify or reject patient-uploaded prescriptions
- Search and assign patients from the system
- View full patient history and prescription records

**Interactions:**
- Issues prescriptions to **Patients** which they use when placing orders
- Verified prescriptions are forwarded to **Pharmacists** for dispensing

---

### 💊 Pharmacist
**What they can do:**
- View and manage all assigned patient orders
- Update order status: Pending → Processing → Verified → Shipped → Delivered
- Verify patient-uploaded prescriptions before dispensing
- Manage pharmacy inventory (view stock levels, update quantities)
- Request stock from Suppliers when inventory is low
- Add tracking numbers when marking orders as shipped

**Interactions:**
- Fulfils orders from **Patients**
- Verifies prescriptions originally issued or uploaded by **Doctors / Patients**
- Sends stock requests to **Suppliers** when inventory is low
- Receives restocked medicines from **Suppliers**

---

### 🚚 Supplier
**What they can do:**
- Add medicines to their own inventory (including product image)
- View and manage incoming stock requests from Pharmacists
- Accept or reject stock requests
- Ship medicines with tracking information
- Monitor inventory levels and fulfilment history

**Interactions:**
- Receives stock requests from **Pharmacists**
- Ships restocked medicines back to **Pharmacists**
- Medicines in supplier inventory appear on the public Products page

---

## 🔄 Key Interaction Flows

### Order Fulfilment (Patient → Pharmacist)
```
Patient places order
  → Pharmacist receives & processes order
  → Pharmacist verifies prescription (if required)
  → Pharmacist marks as Shipped (adds tracking number)
  → Patient receives order (Delivered)
```

### Prescription Flow (Doctor → Patient → Pharmacist)
```
Doctor creates prescription for a Patient
  → Patient views prescription in their dashboard
  → Patient places order (prescription auto-linked)
  → Pharmacist verifies prescription before dispensing
  → Order approved and fulfilled
```

### Stock Replenishment (Pharmacist → Supplier)
```
Pharmacist identifies low inventory
  → Creates stock request to Supplier
  → Supplier accepts request
  → Supplier ships medicines with tracking number
  → Pharmacist receives stock → inventory updated
```

### Order Status Lifecycle
```
Pending → Processing → Verified → Shipped → Delivered
```

---

## 🔑 Features
- Role-based dashboards for Patient, Doctor, Pharmacist, Supplier, Admin
- Browse and search medicines catalogue with product images
- Cart management and order placement
- Prescription upload, issuance, and verification workflow
- Supplier inventory management with image upload
- Stock request system between Pharmacists and Suppliers
- Order tracking with tracking numbers
- Animated stats, floating hero cards, dock-style navbar

---

## 🗄️ Database Tables
- `users` — all roles stored with role field
- `medicines` — medicine catalogue with image_url
- `cart_items` — patient cart
- `orders` — patient orders with status and tracking_info
- `order_items` — medicines per order
- `prescriptions` — doctor-issued and patient-uploaded
- `prescribed_medicines` — medicines per prescription
- `supplier_inventory` — supplier stock levels
- `pharmacist_inventory` — pharmacy stock levels
- `stock_requests` — pharmacist → supplier restock requests

---

## 🗄️ Database Setup

Pharmora uses **Supabase (PostgreSQL)**. Follow these steps to set up the database:

### 1. Create a Supabase Project
1. Go to [Supabase](https://app.supabase.com/) and create a new project.
2. Note your **database credentials** (host, user, password, database name, port).

### 2. Apply the Database Schema
```bash
# Using psql CLI
psql -h DB_HOST -U DB_USER -d DB_NAME -f database/schema.sql

# Or use Supabase SQL Editor
# Open SQL Editor → Paste contents of schema.sql → Run
```

### 3. Populate Initial Data
```bash
psql -h DB_HOST -U DB_USER -d DB_NAME -f database/seed.sql
```

---

## ⚙️ Environment Variables

Create **`/backend/.env`**:
```
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=postgres
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

Create **`/frontend/.env`**:
```
VITE_API_URL=http://localhost:5000
```

---

## ▶️ Running the Project

### Backend
```bash
cd backend
npm install
node server.js
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔌 Core API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/signup` | Register user |
| GET | `/api/medicines` | Fetch all medicines |
| GET | `/api/cart` | Get patient cart |
| POST | `/api/cart/add` | Add item to cart |
| GET | `/api/orders` | Get patient orders |
| PATCH | `/api/orders/:id/ship` | Mark order as shipped (with tracking) |
| PATCH | `/api/orders/:id/deliver` | Mark order as delivered |
| GET | `/api/prescriptions` | Get prescriptions |
| POST | `/api/prescriptions` | Create prescription (Doctor) |
| GET | `/api/stock-requests` | Get stock requests |
| POST | `/api/stock-requests` | Create stock request (Pharmacist) |
| PATCH | `/api/stock-requests/:id/accept` | Accept stock request (Supplier) |
| GET | `/api/supplier/inventory` | Get supplier inventory |
| GET | `/api/pharmacist/inventory` | Get pharmacist inventory |

---

## Group Members

- Nabira Khan
- Arwa Abbas
- Afaf Shahid
