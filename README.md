# Pharmora – Full Stack Pharmacy Web Application

## 🚀 Overview
Pharmora is a full-stack web application for pharmacy services, medical appointments, and online medicine ordering.
It allows patients to browse medicines, manage carts and orders, and view available doctors and pharmacists.
Each user - Patient, Doctor, Pharmacist, Supplier, and Admin has access to their own dedicated dashboard with role-specific features.

[Demo Video Folder (Google Drive)](https://drive.google.com/drive/folders/1d4BsMWpF2vKeaHTiuW_f0FZXlM6NqM9r?usp=sharing)

---

## 🏗️ Tech Stack
- **Frontend:** React + Vite + TailwindCSS  
- **Backend:** Node.js, Express  
- **Database:** Supabase (PostgreSQL)  
- **Auth:** Custom Login + Role-Based Access  

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
│   │   │   ├── products/
│   │   │   │   └── ProductCard.jsx
│   │   │   │
│   │   │   ├── doctors/
│   │   │   │   └── DoctorCard.jsx
│   │   │   │
│   │   │   ├── pharmacists/
│   │   │   │   └── PharmacistCard.jsx
│   │   │   │
│   │   │   ├── suppliers/
│   │   │   │   └── SupplierCard.jsx
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
│   │   │   ├── dashboard/
│   │   │   │   ├── PatientDashboard.jsx
│   │   │   │   ├── DoctorDashboard.jsx
│   │   │   │   ├── PharmacistDashboard.jsx
│   │   │   │   ├── SupplierDashboard.jsx
│   │   │   │   └── AdminDashboard.jsx
│   │   │   │
│   │   │   └── layout/
│   │   │       └── MainLayout.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── userService.js
│   │   │   ├── medicineService.js
│   │   │   ├── cartService.js
│   │   │   ├── orderService.js
│   │   │   ├── prescriptionService.js
│   │   │   ├── paymentService.js
│   │   │   ├── doctorService.js
│   │   │   ├── pharmacistService.js
│   │   │   ├── supplierService.js
│   │   │   ├── patientService.js
│   │   │   └── adminService.js
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useCart.js
│   │   │   ├── useMedicines.js
│   │   │   └── useNotifications.js
│   │   │
│   │   ├── utils/
│   │   │   ├── formatters.js
│   │   │   ├── validators.js
│   │   │   └── constants.js
│   │   │
│   │   ├── styles/
│   │   │   ├── home.css
│   │   │   ├── login.css
│   │   │   └── notifications.css
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── .env
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── index.html
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
│   │   ├── index.js
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── medicineRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── prescriptionRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── pharmacistRoutes.js
│   │   ├── supplierRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── adminRoutes.js
│   │   └── stockRequestRoutes.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── medicineController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   ├── prescriptionController.js
│   │   ├── paymentController.js
│   │   ├── doctorController.js
│   │   ├── pharmacistController.js
│   │   ├── supplierController.js
│   │   ├── patientController.js
│   │   ├── adminController.js
│   │   └── stockRequestController.js
│   │
│   ├── utils/
│   │   └── helpers.js
│   │
│   ├── .env
│   ├── .env.example
│   ├── server.js
│   └── package.json
│
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── migrations/
│
├── .gitignore
├── README.md
├── LICENSE
└── package.json
```


---

## 🔑 Features
- Patient Signup/Login  
- Role-Based Dashboards (patient / doctor / admin / supplier / pharmacist)  
- Browse All Medicines  
- Add to Cart + View Cart  
- View Doctors, Pharmacists & Suppliers  
- Prescriptions Verification & Stock Requests

---

## 🗄️ Database Tables 
- **users**
- **medicines**
- **cart_items**
- **prescriptions**
- **prescribed_medicines**
- **supplier_inventory**
etc
---

## 🗄️ Database Setup

Pharmora uses **Supabase (PostgreSQL)**. Follow these steps to set up the database:

### **1️⃣ Create a Supabase Project**
1. Go to [Supabase](https://app.supabase.com/) and create a new project.  
2. Note your **database credentials** (host, user, password, database name, port).  

### **2️⃣ Apply the Database Schema**
Run the `schema.sql` file to create all tables:

```bash
-- Using psql CLI
psql -h DB_HOST -U DB_USER -d DB_NAME -f database/schema.sql

-- Or use Supabase SQL Editor
-- Open SQL Editor → Paste contents of schema.sql → Run

```

### **3️⃣ Populate Initial Data**
Run `seed.sql` to add sample data:
psql -h DB_HOST -U DB_USER -d DB_NAME -f database/seed.sql


## ⚙️ Configure Environment Variables

Create **`/backend/.env`**:

```

DB_USER=postgres.zplcialirnvkdbmwslyc
DB_PASSWORD=YOUR_PASSWORD
DB_HOST=aws-1-ap-south-1.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
PORT=5000

```
OR

```

DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=your_db_name
PORT=5000


````

---

## ▶️ Running the Project

### **Backend**
```bash
cd backend
npm install
node index.js
````

### **Frontend**

```bash
cd frontend
npm install
npm run dev
```

---

## 🔄 Core API Endpoints

* `GET /medicines` – Fetch all medicines
* `POST /signup` – Register user
* `POST /login` – Login user
* `GET /cart` – Get patient cart
* `POST /cart/add` – Add item to cart

---

## 👥 User Roles

### **🛠️ Admin**

Manages the overall system, oversees user accounts for all roles , monitors platform activity, and generates reports of sales, user and medicines.

### **🧑‍⚕️ Patient**

* Browses and searches medicines
* Adds items to cart and places orders
* Uploads prescriptions for verification
* Makes payments for placed orders

### **👨‍⚕️ Doctor**

* Reviews and verifies patient prescriptions
* Creates and uploads electronic prescriptions

### **💊 Pharmacist**

* Manages medicine inventory by requesting stock from supplier
* Prepares orders and updates order status
* Coordinates with suppliers for restocking

### **🚚 Supplier**

* Manages supply details and stock availability
* Fulfills pharmacist restocking requests
* Ships stock and provides delivery to pharmacist.

---

## Group Members

* Nabira Khan
* Arwa Abbas
* Afaf Shahid

---
