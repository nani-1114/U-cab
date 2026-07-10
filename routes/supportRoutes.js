// routes/supportRoutes.js
// Contact support / ticketing system

const express = require('express');
const router = express.Router();
const {
  createTicket,
  getMyTickets,
  getAllTickets,
  respondToTicket,
} = require('../controllers/supportController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);

// User / Driver
router.post('/', authorizeRoles('user', 'driver'), createTicket);
router.get('/my-tickets', authorizeRoles('user', 'driver'), getMyTickets);

// Admin
router.get('/', authorizeRoles('admin'), getAllTickets);
router.put('/:id', authorizeRoles('admin'), respondToTicket);

module.exports = router;
