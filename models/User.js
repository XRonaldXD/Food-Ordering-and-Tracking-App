const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  profilePicture: {
    type: String
  },
  role: {
    type: String,
    enum: ['customer', 'merchant', 'driver', 'admin'],
    default: 'customer'
  },
  restaurantName: {
    type: String,
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });


const User = mongoose.model('User', userSchema);
module.exports = User;