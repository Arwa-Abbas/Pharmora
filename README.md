# Pharmora – Full Stack Pharmacy Web Application

## 🚀 Overview
Pharmora is a full-stack web application for pharmacy services, medical appointments, and online medicine ordering.
It allows patients to browse medicines, manage carts and orders, and view available doctors and pharmacists.
Each user - Patient, Doctor, Pharmacist, Supplier, and Admin has access to their own dedicated dashboard with role-specific features.

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
├── frontend/                      # React frontend application
│   ├── public/                    # Static assets
│   │   └── images/                # Image assets
│   │
│   ├── src/                       # Source files
│   │   ├── components/            # Reusable React components
│   │   │   ├── Navbar.jsx         # Navigation bar
│   │   │   ├── NotificationContext.jsx  # Global notifications
│   │   │   └── ...
│   │   │
│   │   ├── pages/                 # Page components
│   │   │   ├── Home.jsx           # Landing page
│   │   │   ├── Login.jsx          # Authentication page
│   │   │   ├── Products.jsx       # Medicine catalog
│   │   │   ├── Cart.jsx           # Shopping cart
│   │   │   ├── Doctors.jsx        # Doctor directory
│   │   │   ├── Pharmacists.jsx    # Pharmacist directory
│   │   │   ├── Suppliers.jsx      # Supplier directory
│   │   │   ├── PatientDashboard.jsx
│   │   │   ├── DoctorDashboard.jsx
│   │   │   ├── PharmacistDashboard.jsx
│   │   │   ├── SupplierDashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   │
│   │   ├── styles/                # CSS files
│   │   │   ├── App.css
│   │   │   ├── Login.css
│   │   │   ├── notifications.css
│   │   │   └── ...
│   │   │
│   │   ├── App.jsx                # Main app component
│   │   ├── main.jsx               # Entry point
│   │   └── index.css              # Global styles
│   │
│   ├── .env                       # Environment variables
│   ├── package.json               # Dependencies
│   ├── vite.config.js             # Vite configuration
│   ├── tailwind.config.js         # TailwindCSS config
│   ├── postcss.config.js          # PostCSS config
│   └── index.html                 # HTML template
│
├── backend/                       # Node.js backend application
│   ├── routes/                    # API route definitions
│   │   ├── auth.js                # Authentication routes
│   │   ├── medicines.js           # Medicine routes
│   │   ├── cart.js                # Cart routes
│   │   ├── prescriptions.js       # Prescription routes
│   │   ├── appointments.js        # Appointment routes
│   │   ├── admin.js               # Admin routes
│   │   └── ...
│   │
│   ├── controllers/               # Business logic
│   │   ├── authController.js
│   │   ├── medicineController.js
│   │   ├── cartController.js
│   │   ├── prescriptionController.js
│   │   ├── appointmentController.js
│   │   └── adminController.js
│   │
│   ├── middleware/                # Custom middleware
│   │   ├── auth.js                # Authentication middleware
│   │   ├── roleCheck.js           # Role-based access control
│   │   └── errorHandler.js        # Error handling
│   │
│   ├── utils/                     # Utility functions
│   │   ├── database.js            # Database connection
│   │   ├── validation.js          # Input validation
│   │   └── helpers.js             # Helper functions
│   │
│   ├── config/                    # Configuration files
│   │   └── database.js            # Database configuration
│   │
│   ├── .env                       # Environment variables
│   ├── .env.example               # Environment template
│   ├── index.js                   # Server entry point
│   ├── package.json               # Dependencies
│   └── server.js                  # Express server setup
│
├── database/                      # Database related files
│   ├── schema.sql                 # Database schema
│   ├── seed.sql                   # Sample data
│   └── migrations/                # Future Database migrations
│
├── .gitignore                     # Git ignore rules
├── README.md                      # Project documentation
├── LICENSE                        # License file
└── package.json                   # Root package.json (optional)
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
