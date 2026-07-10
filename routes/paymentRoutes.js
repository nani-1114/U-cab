// routes/paymentRoutes.js
// Payment processing, history, and receipts

const express = require('express');
const router = express.Router();
const {
  makePayment,
  paymentHistory,
  getReceipt,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/pay', authorizeRoles('user'), makePayment);
router.get('/history', authorizeRoles('user', 'driver'), paymentHistory);
router.get('/:id/receipt', getReceipt);

module.exports = router;
