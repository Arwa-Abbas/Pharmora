# Pharmora – Full Stack Pharmacy Web Application

## 🚀 Overview
Pharmora is a full-stack pharmacy, appointments, and medicine-ordering web application.  
It allows patients to browse medicines, manage carts, view doctors, book appointments, and access dashboards based on role (Patient, Doctor, Pharmacist, Supplier, Admin).

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
│   └── migrations/                # Database migrations
│
├── docs/                          # Documentation
│   ├── API.md                     # API documentation
│   ├── SETUP.md                   # Setup guide
│   └── USER_GUIDE.md              # User manual
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
- Prescriptions & Appointments (backend & DB ready)  

---

## 🗄️ Database Tables (Key)
- **users**
- **medicines**
- **cart**
- **prescriptions**
- **prescribed_medicines**
- **appointments**

---

## ⚙️ Environment Setup

Create **`/backend/.env`**:

```

DB_USER=postgres.zplcialirnvkdbmwslyc
DB_PASSWORD=YOUR_PASSWORD
DB_HOST=aws-1-ap-south-1.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
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

Manages the overall system, oversees user accounts, monitors platform activity, and handles administrative configurations.

### **🧑‍⚕️ Patient**

* Browses and searches medicines
* Adds items to cart and places orders
* Uploads prescriptions for verification

### **👨‍⚕️ Doctor**

* Reviews and verifies patient prescriptions
* Creates and uploads electronic prescriptions

### **💊 Pharmacist**

* Verifies prescriptions from patients and doctors
* Manages inventory (add, update, remove stock)
* Prepares orders and updates order status
* Coordinates with suppliers for restocking

### **🚚 Supplier**

* Manages supply details and stock availability
* Fulfills pharmacist restocking requests
* Updates delivery and replenishment status

---

## Group Members

* Nabira Khan
* Arwa Abbas
* Afaf Shahid

---
