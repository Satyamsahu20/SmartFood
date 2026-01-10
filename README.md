# 🍽️ SmartFood — Full Stack Food Delivery Platform

SmartFood is a **full-stack MERN food delivery web app** (like Swiggy/Zomato) supporting **Customers, Shop Owners, and Delivery Partners** with **real-time order updates** and **live delivery tracking**.

---

## 🚀 Features
- **JWT Auth (HTTP-only cookies)** + Role-based access (User / Owner / DeliveryBoy)
- **Shop & Item Management** (Owner)
- **Cart → Checkout → Order Placement**
- **COD + Razorpay Online Payment** (server-side verification)
- **Real-time Updates (Socket.io)**: new order + status updates
- **Live Delivery Tracking (Leaflet Map + GPS + Socket.io)**
- **OTP-based Forgot Password** (Email)

---

## 🧰 Tech Stack
**Frontend:** React (Vite), Redux Toolkit, Tailwind CSS, Socket.io-client, Leaflet,  
**Backend:** Node.js, Express.js, MongoDB (Mongoose), Socket.io, Razorpay, Cloudinary, Nodemailer

---

## 🧪 Setup

### Backend

cd backend
npm install
npm start

### Frontend

cd frontend
npm install
npm run dev
