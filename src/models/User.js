const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: {
    type: Number,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: false,
  },
  firstName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
  },
  credits: {
    type: Number,
    default: 10,
  },
  dailyUsage: {
    type: Number,
    default: 0,
  },
  lastUsageDate: {
    type: Date,
    default: Date.now,
  },
  referralCode: {
    type: String,
    unique: true,
  },
  referredBy: {
    type: String,
    required: false,
  },
  referralCount: {
    type: Number,
    default: 0,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Reset daily usage at midnight
userSchema.methods.resetDailyUsage = function() {
  const now = new Date();
  const lastUsage = new Date(this.lastUsageDate);
  
  if (now.getDate() !== lastUsage.getDate() || 
      now.getMonth() !== lastUsage.getMonth() || 
      now.getFullYear() !== lastUsage.getFullYear()) {
    this.dailyUsage = 0;
    this.lastUsageDate = now;
    return true;
  }
  return false;
};

// Check if user has credits
userSchema.methods.hasCredits = function() {
  this.resetDailyUsage();
  return this.dailyUsage < this.credits;
};

// Use a credit
userSchema.methods.useCredit = function() {
  if (this.hasCredits()) {
    this.dailyUsage += 1;
    this.updatedAt = new Date();
    return true;
  }
  return false;
};

// Add referral credits
userSchema.methods.addReferralCredits = function() {
  this.credits += 20;
  this.referralCount += 1;
  this.updatedAt = new Date();
};

module.exports = mongoose.model('User', userSchema);
