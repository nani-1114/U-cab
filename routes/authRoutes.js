// routes/authRoutes.js
// Public routes for registration and login (user, driver, admin)

const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  registerDriver,
  loginDriver,
  loginAdmin,
} = require('../controllers/authController');
const upload = require('../middleware/uploadMiddleware');

// User auth
router.post('/user/register', registerUser);
router.post('/user/login', loginUser);

// Driver auth (accepts optional document uploads)
router.post(
  '/driver/register',
  upload.fields([
    { name: 'licenseImage', maxCount: 1 },
    { name: 'vehicleRC', maxCount: 1 },
    { name: 'insurance', maxCount: 1 },
  ]),
  registerDriver
);
router.post('/driver/login', loginDriver);

// Admin auth
router.post('/admin/login', loginAdmin);

module.exports = router;
