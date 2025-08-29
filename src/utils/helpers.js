const { v4: uuidv4 } = require('uuid');

// Generate a unique referral code
function generateReferralCode() {
  return uuidv4().substring(0, 8).toUpperCase();
}

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Validate image format
function isValidImageFormat(format) {
  const validFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  return validFormats.includes(format.toLowerCase());
}

// Validate PDF file
function isValidPDF(buffer) {
  // Check if the buffer starts with PDF magic number
  return buffer.length >= 4 && 
         buffer[0] === 0x25 && // %
         buffer[1] === 0x50 && // P
         buffer[2] === 0x44 && // D
         buffer[3] === 0x46;   // F
}

// Sanitize filename
function sanitizeFilename(filename) {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
}

// Generate random filename
function generateRandomFilename(extension) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}_${random}.${extension}`;
}

// Check if user is premium (placeholder for future Telegram Stars integration)
function isPremiumUser(user) {
  return user.isPremium || user.credits > 10;
}

// Calculate remaining credits
function getRemainingCredits(user) {
  return Math.max(0, user.credits - user.dailyUsage);
}

// Format credits display
function formatCredits(credits) {
  return credits === 1 ? '1 credit' : `${credits} credits`;
}

module.exports = {
  generateReferralCode,
  formatFileSize,
  isValidImageFormat,
  isValidPDF,
  sanitizeFilename,
  generateRandomFilename,
  isPremiumUser,
  getRemainingCredits,
  formatCredits,
};
