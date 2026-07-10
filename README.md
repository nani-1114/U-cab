# Ucab — Cab Booking System

Production-ready Node.js/Express/MongoDB backend for a MERN cab booking platform, built with MVC architecture.

## Setup

```bash
npm install
cp .env.example .env   # then fill in your own values
npm run dev             # or: npm start
```

Requires a MongoDB Atlas connection string in `MONGO_URI`.

## Folder Structure

```
config/                      → environment and database connection
controllers/                 → business logic (auth, user, driver, admin, ride, payment, coupon, review, notification, support)
middleware/                  → auth, role authorization, error handling, file upload
models/                      → Mongoose schemas (User, Driver, Ride, Payment, Coupon, Review, Notification, SupportTicket)
routes/                      → Express route definitions per module
utils/                       → generateToken, fareCalculator, apiResponse, validators
uploads/                     → uploaded driver documents (served statically at /uploads)
app.js                       → Express application setup
server.js                    → startup and DB connection
package.json
.env.example
vercel.json
```

## Auth Model

- Users and admins both live in the `User` collection, distinguished by `role` (`user` | `admin`). Seed an admin manually by inserting a `User` document with `role: 'admin'` (password will be hashed automatically via the pre-save hook if inserted through the app or a small seed script).
- Drivers are a separate collection and must be approved by an admin (`approvalStatus`) before they can log in and go online.
- All protected routes require an `Authorization: Bearer <token>` header. Tokens are role-aware; `roleMiddleware.authorizeRoles(...)` restricts access per route.

## Key API Groups

| Base Path | Description |
|-----------|-------------|
| `/api/auth` | Register/login for user, driver, admin |
| `/api/users` | Profile, fare estimate, book/cancel ride, history, live ride |
| `/api/drivers` | Profile, availability, accept/reject/start/complete ride, earnings |
| `/api/admin` | Dashboard, manage users/drivers/rides/payments |
| `/api/rides` | Get ride by id, live status, status update (admin) |
| `/api/payments` | Dummy payment, history, receipt |
| `/api/coupons` | CRUD (admin), active coupons (user) |
| `/api/reviews` | Submit review, get driver reviews |
| `/api/notifications` | List, mark read |
| `/api/support` | Raise ticket, view/respond (admin) |

## Production deployment

- Set `MONGO_URI` to your MongoDB Atlas connection string.
- Set `JWT_SECRET` to a strong production secret.
- Set `CORS_ORIGIN` to your frontend domain(s).
- For Vercel, ensure the Express app is exported from [app.js](app.js) and the deployment uses [vercel.json](vercel.json).
- For the frontend, create a Vercel environment variable named `VITE_API_URL` pointing to your deployed backend URL.
- If using a separate frontend domain, add it to `CORS_ORIGIN`.

## Notes

- Passwords are hashed with `bcryptjs` via Mongoose pre-save hooks.
- All controllers use `async/await` with try/catch and return consistent JSON via `utils/apiResponse.js`.
- A global error handler (`middleware/errorMiddleware.js`) normalizes Mongoose cast/validation/duplicate-key errors.
- Payment processing is a dummy simulation (`paymentController.makePayment`) and can be swapped for a real gateway later without touching the rest of the app.

"# U-cab" 
