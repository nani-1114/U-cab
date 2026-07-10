// controllers/notificationController.js
// Handles fetching and marking in-app notifications

const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// =========================================================
// @desc    Get logged-in user's/driver's notifications
// @route   GET /api/notifications
// @access  Private
// =========================================================
const getNotifications = async (req, res) => {
  try {
    const recipientModel = req.role === 'driver' ? 'Driver' : 'User';

    const notifications = await Notification.find({
      recipient: req.user._id,
      recipientModel,
    }).sort({ createdAt: -1 });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return sendSuccess(res, 200, 'Notifications fetched successfully', {
      notifications,
      unreadCount,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
// =========================================================
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return sendError(res, 404, 'Notification not found');

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'You are not authorized to update this notification');
    }

    notification.isRead = true;
    await notification.save();

    return sendSuccess(res, 200, 'Notification marked as read', notification);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// =========================================================
// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
// =========================================================
const markAllAsRead = async (req, res) => {
  try {
    const recipientModel = req.role === 'driver' ? 'Driver' : 'User';

    await Notification.updateMany(
      { recipient: req.user._id, recipientModel, isRead: false },
      { isRead: true }
    );

    return sendSuccess(res, 200, 'All notifications marked as read', {});
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
