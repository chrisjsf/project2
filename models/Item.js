const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['Lost', 'Found'],
      required: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      default: 'Open'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Item || mongoose.model('Item', itemSchema);
