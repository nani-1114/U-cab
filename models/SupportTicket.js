// models/SupportTicket.js
// Schema for customer support / contact tickets

const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema(
  {
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'raisedByModel',
    },
    raisedByModel: {
      type: String,
      required: true,
      enum: ['User', 'Driver'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    relatedRide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      default: null,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    adminReply: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
