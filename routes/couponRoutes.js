// routes/couponRoutes.js
// Coupon management (admin) and browsing (user)

const express = require('express');
const router = express.Router();
const {
  createCoupon,
  getAllCoupons,
  getActiveCoupons,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/couponController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/active', authorizeRoles('user'), getActiveCoupons);

router.post('/', authorizeRoles('admin'), createCoupon);
router.get('/', authorizeRoles('admin'), getAllCoupons);
router.put('/:id', authorizeRoles('admin'), updateCoupon);
router.delete('/:id', authorizeRoles('admin'), deleteCoupon);

module.exports = router;
