const express = require('express');
const multer = require('multer');
const User = require('../models/User');
const aiImageService = require('../services/aiImageService');
const pdfService = require('../services/pdfService');
const imageService = require('../services/imageService');
const { getRemainingCredits, formatCredits, generateRandomFilename } = require('../utils/helpers');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Middleware to verify Telegram user
const verifyTelegramUser = async (req, res, next) => {
  try {
    const telegramId = req.headers['x-telegram-id'];
    if (!telegramId) {
      return res.status(401).json({ error: 'Telegram ID required' });
    }

    const user = await User.findOne({ telegramId: parseInt(telegramId) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('User verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user info and credits
router.get('/user', verifyTelegramUser, async (req, res) => {
  try {
    const user = req.user;
    const remainingCredits = getRemainingCredits(user);

    res.json({
      success: true,
      user: {
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        credits: user.credits,
        dailyUsage: user.dailyUsage,
        remainingCredits,
        referralCode: user.referralCode,
        referralCount: user.referralCount,
        isPremium: user.isPremium,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI Image Generation
router.post('/ai-image', verifyTelegramUser, async (req, res) => {
  try {
    const { prompt } = req.body;
    const user = req.user;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!user.hasCredits()) {
      return res.status(403).json({ error: 'No credits remaining' });
    }

    // Generate image
    const result = await aiImageService.generateImageWithFallback(prompt);
    
    if (result.success) {
      // Use credit
      user.useCredit();
      await user.save();

      // Convert buffer to base64 for frontend
      const base64Image = result.imageBuffer.toString('base64');
      
      res.json({
        success: true,
        image: `data:image/png;base64,${base64Image}`,
        prompt,
        creditsUsed: 1,
        remainingCredits: getRemainingCredits(user),
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('AI Image API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Text to PDF
router.post('/text-to-pdf', verifyTelegramUser, async (req, res) => {
  try {
    const { text, filename = 'document.pdf' } = req.body;
    const user = req.user;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!user.hasCredits()) {
      return res.status(403).json({ error: 'No credits remaining' });
    }

    // Generate PDF
    const result = await pdfService.textToPDF(text, filename);
    
    if (result.success) {
      // Use credit
      user.useCredit();
      await user.save();

      // Convert buffer to base64 for frontend
      const base64PDF = result.buffer.toString('base64');
      
      res.json({
        success: true,
        pdf: `data:application/pdf;base64,${base64PDF}`,
        filename: result.filename,
        creditsUsed: 1,
        remainingCredits: getRemainingCredits(user),
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Text to PDF API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Image processing
router.post('/image-process', verifyTelegramUser, upload.single('image'), async (req, res) => {
  try {
    const { action, format, quality, width, height } = req.body;
    const user = req.user;

    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    if (!user.hasCredits()) {
      return res.status(403).json({ error: 'No credits remaining' });
    }

    const imageBuffer = req.file.buffer;
    let result;

    switch (action) {
      case 'convert':
        result = await imageService.convertFormat(imageBuffer, format || 'png');
        break;
      case 'compress':
        result = await imageService.compressImage(imageBuffer, parseInt(quality) || 80, parseInt(width) || 1024);
        break;
      case 'resize':
        result = await imageService.resizeImage(imageBuffer, parseInt(width) || 512, parseInt(height) || 512);
        break;
      case 'info':
        result = await imageService.getImageInfo(imageBuffer);
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    if (result.success) {
      // Use credit (except for info)
      if (action !== 'info') {
        user.useCredit();
        await user.save();
      }

      if (action === 'info') {
        res.json({
          success: true,
          info: result,
          creditsUsed: 0,
          remainingCredits: getRemainingCredits(user),
        });
      } else {
        // Convert buffer to base64 for frontend
        const base64Image = result.buffer.toString('base64');
        const mimeType = `image/${result.format || 'jpeg'}`;
        
        res.json({
          success: true,
          image: `data:${mimeType};base64,${base64Image}`,
          format: result.format,
          creditsUsed: 1,
          remainingCredits: getRemainingCredits(user),
          ...(result.compressionRatio && { compressionRatio: result.compressionRatio }),
          ...(result.originalSize && { originalSize: result.originalSize }),
          ...(result.compressedSize && { compressedSize: result.compressedSize }),
        });
      }
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Image processing API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Merge PDFs
router.post('/merge-pdfs', verifyTelegramUser, upload.array('pdfs', 10), async (req, res) => {
  try {
    const user = req.user;

    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: 'At least 2 PDF files are required' });
    }

    if (!user.hasCredits()) {
      return res.status(403).json({ error: 'No credits remaining' });
    }

    // Extract PDF buffers
    const pdfBuffers = req.files.map(file => file.buffer);
    
    // Merge PDFs
    const result = await pdfService.mergePDFs(pdfBuffers, 'merged.pdf');
    
    if (result.success) {
      // Use credit
      user.useCredit();
      await user.save();

      // Convert buffer to base64 for frontend
      const base64PDF = result.buffer.toString('base64');
      
      res.json({
        success: true,
        pdf: `data:application/pdf;base64,${base64PDF}`,
        filename: result.filename,
        fileCount: req.files.length,
        creditsUsed: 1,
        remainingCredits: getRemainingCredits(user),
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Merge PDFs API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Apply referral code
router.post('/referral', verifyTelegramUser, async (req, res) => {
  try {
    const { referralCode } = req.body;
    const user = req.user;

    if (!referralCode) {
      return res.status(400).json({ error: 'Referral code is required' });
    }

    if (user.referredBy) {
      return res.status(400).json({ error: 'You have already used a referral code' });
    }

    const referrer = await User.findOne({ referralCode });
    if (!referrer) {
      return res.status(400).json({ error: 'Invalid referral code' });
    }

    if (referrer.telegramId === user.telegramId) {
      return res.status(400).json({ error: 'You cannot use your own referral code' });
    }

    // Apply referral benefits
    user.referredBy = referralCode;
    user.credits += 20;
    referrer.addReferralCredits();

    await user.save();
    await referrer.save();

    res.json({
      success: true,
      message: 'Referral code applied successfully!',
      creditsEarned: 20,
      totalCredits: user.credits,
    });
  } catch (error) {
    console.error('Referral API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = router;
