# 🍽️ SmartFood — Full Stack Food Delivery Platform

SmartFood is a **full-stack MERN food delivery web application** (similar to Swiggy/Zomato) that supports **Customers, Shop Owners, and Delivery Partners** with **real-time order updates** and **live delivery tracking on map**.

---

## 🚀 Key Features

### 🔐 Authentication & Security
- JWT Authentication using **HTTP-only cookies**
- Role-based access control (**User / Owner / DeliveryBoy**)
- **OTP-based Forgot Password** (Email)
- Password hashing using **bcrypt**

### 👤 Customer
- Auto city detection using GPS + reverse geocoding
- Browse shops and items by city
- Search and category filtering
- Cart management
- Place order with **COD / Razorpay Online Payment**
- Live order status updates
- Live delivery tracking on map

### 🏪 Shop Owner
- Create/Edit shop profile
- Add/Edit/Delete items with image upload
- Receive new orders instantly (real-time)
- Update order status

### 🚴 Delivery Partner
- Receive delivery assignment notifications
- Accept delivery requests
- Share live GPS location
- 
---

## 🧰 Tech Stack

### Frontend
- React (Vite)
- Redux Toolkit
- Tailwind CSS
- Socket.io-client
- Leaflet

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- Socket.io
- Razorpay Payment Gateway
- Cloudinary + Multer (Image upload)
- Nodemailer (OTP emails)

---

## 🧪 Installation & Setup

### ✅ 1. Clone Repository
```bash
git clone https://github.com/Satyamsahu20/SmartFood.git
cd SmartFood

cd backend
npm install
npm start
cd ../frontend
npm install
npm run dev
