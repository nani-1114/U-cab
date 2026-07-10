# 🚕 UCab - Complete MERN Cab Booking System

A full-stack, production-ready cab booking platform built with the **MERN stack** (MongoDB, Express, React, Node.js). 
This project features a comprehensive ecosystem with three distinct portals: **Rider, Driver, and Admin**.

![UCab Banner](https://img.shields.io/badge/MERN-Stack-blue)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)

## 🌟 Live Demo

The application is fully deployed and accessible live on Vercel:
- **Frontend / Client App:** [https://u-cab-j5zn.vercel.app](https://u-cab-j5zn.vercel.app)
- **Backend API:** [https://u-cab-gjmf.vercel.app](https://u-cab-gjmf.vercel.app)

### 🔐 Test Credentials
Use the following credentials to explore the different roles:

**Admin Dashboard:**
- **Email:** `admin@ucab.com`
- **Password:** `Admin@123`

*(You can register new Riders and Drivers directly on the platform to test the full flow).*

---

## 🚀 Features

### 👤 Rider Portal
- User Authentication & Profile Management
- Interactive Map & Fare Estimation
- Select Cab Type (Mini, Sedan, SUV, etc.)
- Real-time Ride Status & History
- Driver Reviews & Ratings

### 🚗 Driver Portal
- Secure Registration (Requires Admin Approval)
- Go Online / Offline Toggle
- Accept or Reject incoming ride requests
- Trip management (Start Ride / Complete Ride)
- Earnings Dashboard & Ride History

### 🛡️ Admin Dashboard
- **Analytics:** View total users, drivers, rides, and revenue.
- **Driver Management:** Approve/Reject new driver registrations.
- **User Management:** Oversee all riders on the platform.
- **Ride Monitoring:** Track active and completed rides.

---

## 💻 Tech Stack

**Frontend:**
- React.js (Vite)
- Tailwind CSS / Custom CSS for Premium UI
- React Router DOM
- Axios for API requests

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose (MVC Architecture)
- JSON Web Tokens (JWT) for authentication
- bcryptjs for password hashing

---

## 📁 Folder Structure

```text
config/                      → environment and database connection
controllers/                 → business logic (auth, user, driver, admin, ride, payment, coupon, review, notification, support)
middleware/                  → auth, role authorization, error handling, file upload
models/                      → Mongoose schemas (User, Driver, Ride, Payment, Coupon, Review, Notification, SupportTicket)
routes/                      → Express route definitions per module
utils/                       → generateToken, fareCalculator, apiResponse, validators
uploads/                     → uploaded driver documents (served statically at /uploads)
frontend/                    → React.js (Vite) client application
app.js                       → Express application setup
server.js                    → startup and DB connection
package.json                 → backend dependencies
vercel.json                  → vercel deployment configuration
```

---

## 🌐 Deployment (Vercel)

This project is optimized for deployment on Vercel. 
- **Backend:** The `vercel.json` file in the root directory configures the Express app as Vercel Serverless Functions.
- **Frontend:** The `frontend` directory is a standard Vite project.

*Built with ❤️ for the modern web.*
