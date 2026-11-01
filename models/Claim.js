const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    explanation: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      default: 'Pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Claim || mongoose.model('Claim', claimSchema);
