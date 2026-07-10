// controllers/supportController.js
// Handles customer support ticket creation and management

const SupportTicket = require('../models/SupportTicket');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { getMissingFields } = require('../utils/validators');

// =========================================================
// @desc    Raise a new support ticket
// @route   POST /api/support
// @access  Private (user, driver)
// =========================================================
const createTicket = async (req, res) => {
  try {
    const { subject, message, relatedRide } = req.body;

    const missing = getMissingFields(req.body, ['subject', 'message']);
    if (missing.length > 0) {
      return sendError(res, 400, `Missing required fields: ${missing.join(', ')}`);
    }

    const raisedByModel = req.role === 'driver' ? 'Driver' : 'User';

    const ticket = await SupportTicket.create({
      raisedBy: req.user._id,
      raisedByModel,
      subject,
      message,
      relatedRide: relatedRide || null,
    });

    return sendSuccess(res, 201, 'Support ticket created successfully', ticket);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Get logged-in user's/driver's own tickets
// @route   GET /api/support/my-tickets
// @access  Private
// =========================================================
const getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ raisedBy: req.user._id }).sort({ createdAt: -1 });
    return sendSuccess(res, 200, 'Tickets fetched successfully', tickets);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Get all support tickets (admin view)
// @route   GET /api/support
// @access  Private (admin)
// =========================================================
const getAllTickets = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { ...(status && { status }) };

    const tickets = await SupportTicket.find(filter)
      .populate('relatedRide', 'status pickupLocation dropLocation')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await SupportTicket.countDocuments(filter);

    return sendSuccess(res, 200, 'Support tickets fetched successfully', {
      tickets,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Admin replies to / updates status of a ticket
// @route   PUT /api/support/:id
// @access  Private (admin)
// =========================================================
const respondToTicket = async (req, res) => {
  try {
    const { adminReply, status } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return sendError(res, 404, 'Support ticket not found');

    if (adminReply) ticket.adminReply = adminReply;
    if (status) ticket.status = status;

    const updated = await ticket.save();

    return sendSuccess(res, 200, 'Support ticket updated successfully', updated);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = {
  createTicket,
  getMyTickets,
  getAllTickets,
  respondToTicket,
};
