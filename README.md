# 🧠 Parking Slot Reservation System – Backend

Backend API for the Parking Slot Reservation System.  
Built with **Next.js (App Router)**, **MongoDB (Mongoose)**, and **JWT Authentication**.

---

## 🚀 Project Overview

This backend provides:

- Authentication (Register / Login)
- Role-based access control (User / Admin)
- Parking Slot management (Admin)
- Reservation system with time-range conflict checking
- Reservation history (cancelled / expired)
- Admin dashboard statistics (KPIs + charts)

---

## 🏗 Tech Stack

- Next.js (App Router API Routes)
- MongoDB Atlas / MongoDB (Mongoose)
- JWT Authentication
- Bcrypt password hashing
- Node.js 18+

---

## 📋 Requirements

- Node.js 18+
- MongoDB Atlas (or local MongoDB)
- (Optional) `.env.local` for environment variables

---

## 🔐 Environment Variables

Create a file: `.env.local`

Example:

MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/parkingdb?retryWrites=true&w=majority  
JWT_SECRET=your_secret_key  
ADMIN_SETUP_PASS=your_admin_setup_password  

Notes:
- `MONGODB_URI` is required
- `JWT_SECRET` is required for signing tokens
- `ADMIN_SETUP_PASS` is used for initial admin setup (if your project includes it)

---

## 💻 Local Development Setup

### 1️⃣ Install dependencies

cd ParkingBackend  
npm install  

### 2️⃣ Run development server

npm run dev  

Backend runs at:

http://localhost:3000  

---

## 🔗 API Endpoints

### Authentication (if included)
- `POST /api/auth/register`
- `POST /api/auth/login`

### Parking Slots
- `GET /api/slots`
- `POST /api/slots` (admin)
- `PUT /api/slots/:id` (admin)
- `DELETE /api/slots/:id` (admin)

### Reservations
- `GET /api/reservations?mine=1`
- `GET /api/reservations?mine=1&status=active`
- `GET /api/reservations?mine=1&status=cancelled`
- `POST /api/reservations`
- `PUT /api/reservations/:id`
- `DELETE /api/reservations/:id`  → sets status = `cancelled`

### Admin Dashboard
- `GET /api/admin/stats` (admin)

---

## ✅ Reservation Rules

### Time Validation
`startTime` must be before `endTime` and both must be valid date/time.

### Conflict Checking
A reservation cannot overlap an existing active reservation for the same slot:

- existing.startTime < new.endTime  
- existing.endTime > new.startTime  

If conflict occurs, API returns **409 Conflict**.

---

## 📊 Admin Stats (Dashboard)

Endpoint: `GET /api/admin/stats`

Returns:
- totalActiveSlots
- reservedNow (ongoing reservations: start <= now <= end)
- availableNow
- upcomingReservations
- pastReservations (ended but still active)
- reservedToday
- peakHours (today)
- topZones (all time)
- byDayOfWeek (all time)

---

## 🧪 Common Issues

### MongoDB connection error
- Check `MONGODB_URI`
- Ensure IP whitelist on MongoDB Atlas allows your current network

### 401 Unauthorized
- Token missing or invalid
- Login first and send token via Authorization header (Bearer)

### 403 Forbidden
- Trying to access admin route without admin role

---

## 🌍 Deployment to VM (Basic)

### Option 1 – Run with Node (simple)

1. Copy backend folder to VM
2. Install dependencies
3. Set `.env.local`
4. Start server

npm install  
npm run build  
npm start  

### Option 2 – Run with PM2 (recommended)

npm install -g pm2  
pm2 start npm --name parking-backend -- start  
pm2 save  

---

## 👨 Team Member

- Thanakrit Kodklangdon | [github.com/u6610936](https://github.com/u6610936) |
- Kitirat Pisithaporn | [github.com/u6610387](https://github.com/u6610387) |

Student Project – CSX4107  
Parking Slot Reservation System
