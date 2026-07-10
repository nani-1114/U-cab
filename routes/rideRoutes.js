// routes/rideRoutes.js
// Shared ride routes accessible across roles (with in-controller ownership checks)

const express = require('express');
const router = express.Router();
const {
  getRideById,
  updateRideStatus,
  getLiveStatus,
} = require('../controllers/rideController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/:id', getRideById);
router.get('/:id/live', getLiveStatus);

// Only admin can force-update a ride's status generically
router.put('/:id/status', authorizeRoles('admin'), updateRideStatus);

module.exports = router;
