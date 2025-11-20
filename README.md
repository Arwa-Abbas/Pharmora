# 📘 Pharmora – Full Stack Pharmacy Web Application

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

/frontend
├── src/
├── components/
├── pages/
└── main.jsx

/backend
├── index.js
├── routes/
├── controllers/
└── database.js

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
