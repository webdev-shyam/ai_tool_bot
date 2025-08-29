const User = require('../models/User');
const aiImageService = require('../services/aiImageService');
const pdfService = require('../services/pdfService');
const imageService = require('../services/imageService');
const { getRemainingCredits, formatCredits, generateRandomFilename } = require('../utils/helpers');

class MessageHandlers {
  async handleTextMessage(ctx) {
    const text = ctx.message.text;
    const user = await User.findOne({ telegramId: ctx.from.id });
    
    if (!user) {
      await ctx.reply('❌ User not found. Please use /start first.');
      return;
    }

    // Check if user is waiting for AI image prompt
    if (ctx.session && ctx.session.waitingFor === 'ai_image_prompt') {
      await this.handleAIImagePrompt(ctx, text, user);
      return;
    }

    // Check if user is waiting for text to PDF
    if (ctx.session && ctx.session.waitingFor === 'text_to_pdf') {
      await this.handleTextToPDF(ctx, text, user);
      return;
    }

    // Default response
    await ctx.reply('Please use the menu buttons to access our tools, or type /start to see the main menu.');
  }

  async handleAIImagePrompt(ctx, prompt, user) {
    try {
      // Check credits
      if (!user.hasCredits()) {
        await ctx.reply('💎 You have no credits remaining. Please wait until tomorrow or refer friends to earn more credits.');
        return;
      }

      // Send processing message
      const processingMsg = await ctx.reply('🎨 Generating your image... This may take a few moments.');

      // Generate image
      const result = await aiImageService.generateImageWithFallback(prompt);
      
      if (result.success) {
        // Use credit
        user.useCredit();
        await user.save();

        // Send the generated image
        const filename = generateRandomFilename('png');
        await ctx.replyWithPhoto(
          { source: result.imageBuffer, filename },
          {
            caption: `🎨 **Generated Image**
            
📝 **Prompt:** ${prompt}
💎 **Credits used:** 1
💎 **Remaining:** ${formatCredits(getRemainingCredits(user))}

✨ Generated with AI using Stable Diffusion`,
            parse_mode: 'Markdown'
          }
        );

        // Clear session
        ctx.session = { ...ctx.session, waitingFor: null };
      } else {
        await ctx.reply(`❌ ${result.error}`);
      }

      // Delete processing message
      await ctx.telegram.deleteMessage(ctx.chat.id, processingMsg.message_id);
    } catch (error) {
      console.error('AI Image generation error:', error);
      await ctx.reply('❌ Sorry, something went wrong while generating your image. Please try again.');
    }
  }

  async handleTextToPDF(ctx, text, user) {
    try {
      // Check credits
      if (!user.hasCredits()) {
        await ctx.reply('💎 You have no credits remaining. Please wait until tomorrow or refer friends to earn more credits.');
        return;
      }

      // Send processing message
      const processingMsg = await ctx.reply('📄 Converting text to PDF...');

      // Generate PDF
      const result = await pdfService.textToPDF(text, 'document.pdf');
      
      if (result.success) {
        // Use credit
        user.useCredit();
        await user.save();

        // Send the generated PDF
        await ctx.replyWithDocument(
          { source: result.buffer, filename: result.filename },
          {
            caption: `📄 **PDF Generated**
            
📝 **Content:** ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}
💎 **Credits used:** 1
💎 **Remaining:** ${formatCredits(getRemainingCredits(user))}

✨ Generated with AI Tools Bot`,
            parse_mode: 'Markdown'
          }
        );

        // Clear session
        ctx.session = { ...ctx.session, waitingFor: null };
      } else {
        await ctx.reply(`❌ ${result.error}`);
      }

      // Delete processing message
      await ctx.telegram.deleteMessage(ctx.chat.id, processingMsg.message_id);
    } catch (error) {
      console.error('PDF generation error:', error);
      await ctx.reply('❌ Sorry, something went wrong while generating your PDF. Please try again.');
    }
  }

  async handlePhoto(ctx) {
    const user = await User.findOne({ telegramId: ctx.from.id });
    
    if (!user) {
      await ctx.reply('❌ User not found. Please use /start first.');
      return;
    }

    // Check if user is in image tools mode
    if (ctx.session && ctx.session.waitingFor === 'image_processing') {
      await this.handleImageProcessing(ctx, user);
      return;
    }

    // Default response for photos
    await ctx.reply('🖼️ I received your image! Please use the Image Tools menu to process it.');
  }

  async handleImageProcessing(ctx, user) {
    try {
      // Check credits
      if (!user.hasCredits()) {
        await ctx.reply('💎 You have no credits remaining. Please wait until tomorrow or refer friends to earn more credits.');
        return;
      }

      // Get the largest photo size
      const photo = ctx.message.photo[ctx.message.photo.length - 1];
      
      // Send processing message
      const processingMsg = await ctx.reply('🖼️ Processing your image...');

      // Download the image
      const file = await ctx.telegram.getFile(photo.file_id);
      const imageBuffer = await this.downloadFile(file.file_path);

      // Process based on session action
      const action = ctx.session.imageAction;
      let result;

      switch (action) {
        case 'convert':
          const targetFormat = ctx.session.targetFormat || 'png';
          result = await imageService.convertFormat(imageBuffer, targetFormat);
          break;
        case 'compress':
          result = await imageService.compressImage(imageBuffer, 80, 1024);
          break;
        case 'resize':
          const { width, height } = ctx.session.resizeDimensions || { width: 512, height: 512 };
          result = await imageService.resizeImage(imageBuffer, width, height);
          break;
        case 'info':
          result = await imageService.getImageInfo(imageBuffer);
          break;
        default:
          await ctx.reply('❌ Unknown image action. Please try again.');
          return;
      }

      if (result.success) {
        // Use credit (except for info)
        if (action !== 'info') {
          user.useCredit();
          await user.save();
        }

        if (action === 'info') {
          // Send image info
          const infoMessage = `ℹ️ **Image Information**

📏 **Dimensions:** ${result.width} x ${result.height}
📁 **Format:** ${result.format.toUpperCase()}
💾 **Size:** ${(result.size / 1024).toFixed(2)} KB
🎨 **Has Alpha Channel:** ${result.hasAlpha ? 'Yes' : 'No'}`;

          await ctx.reply(infoMessage, { parse_mode: 'Markdown' });
        } else {
          // Send processed image
          const filename = generateRandomFilename(result.format || 'jpg');
          await ctx.replyWithPhoto(
            { source: result.buffer, filename },
            {
              caption: `🖼️ **Image Processed**
              
✨ **Action:** ${action}
💎 **Credits used:** ${action === 'info' ? 0 : 1}
💎 **Remaining:** ${formatCredits(getRemainingCredits(user))}

✨ Processed with AI Tools Bot`,
              parse_mode: 'Markdown'
            }
          );
        }

        // Clear session
        ctx.session = { ...ctx.session, waitingFor: null, imageAction: null };
      } else {
        await ctx.reply(`❌ ${result.error}`);
      }

      // Delete processing message
      await ctx.telegram.deleteMessage(ctx.chat.id, processingMsg.message_id);
    } catch (error) {
      console.error('Image processing error:', error);
      await ctx.reply('❌ Sorry, something went wrong while processing your image. Please try again.');
    }
  }

  async handleDocument(ctx) {
    const user = await User.findOne({ telegramId: ctx.from.id });
    
    if (!user) {
      await ctx.reply('❌ User not found. Please use /start first.');
      return;
    }

    const document = ctx.message.document;
    const fileName = document.file_name || 'document';
    const mimeType = document.mime_type || '';

    // Check if it's a PDF for merging
    if (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
      await this.handlePDFMerge(ctx, user, document);
      return;
    }

    // Check if it's an image
    if (mimeType.startsWith('image/')) {
      await this.handleImageDocument(ctx, user, document);
      return;
    }

    // Default response for documents
    await ctx.reply('📄 I received your document! Please use the appropriate tools menu to process it.');
  }

  async handlePDFMerge(ctx, user, document) {
    try {
      // Check credits
      if (!user.hasCredits()) {
        await ctx.reply('💎 You have no credits remaining. Please wait until tomorrow or refer friends to earn more credits.');
        return;
      }

      // Initialize PDF merge session if not exists
      if (!ctx.session.pdfMergeFiles) {
        ctx.session.pdfMergeFiles = [];
      }

      // Download the PDF
      const file = await ctx.telegram.getFile(document.file_id);
      const pdfBuffer = await this.downloadFile(file.file_path);

      // Add to merge list
      ctx.session.pdfMergeFiles.push({
        buffer: pdfBuffer,
        name: document.file_name || 'document.pdf'
      });

      const count = ctx.session.pdfMergeFiles.length;
      await ctx.reply(`📋 PDF added to merge list! (${count} file${count > 1 ? 's' : ''})

Send more PDF files to add them, or use the "Merge PDFs" button to complete the merge.`);
    } catch (error) {
      console.error('PDF merge error:', error);
      await ctx.reply('❌ Sorry, something went wrong while processing your PDF. Please try again.');
    }
  }

  async handleImageDocument(ctx, user, document) {
    try {
      // Set session for image processing
      ctx.session = { 
        ...ctx.session, 
        waitingFor: 'image_processing',
        imageAction: 'convert' // Default action
      };

      await ctx.reply('🖼️ Image document received! Please choose what you want to do with it using the Image Tools menu.');
    } catch (error) {
      console.error('Image document error:', error);
      await ctx.reply('❌ Sorry, something went wrong while processing your image. Please try again.');
    }
  }

  async downloadFile(filePath) {
    const axios = require('axios');
    const response = await axios.get(`https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${filePath}`, {
      responseType: 'arraybuffer'
    });
    return Buffer.from(response.data);
  }

  async handleReferralCode(ctx, referralCode) {
    try {
      const user = await User.findOne({ telegramId: ctx.from.id });
      const referrer = await User.findOne({ referralCode });

      if (!user) {
        await ctx.reply('❌ User not found. Please use /start first.');
        return;
      }

      if (user.referredBy) {
        await ctx.reply('❌ You have already used a referral code.');
        return;
      }

      if (!referrer) {
        await ctx.reply('❌ Invalid referral code.');
        return;
      }

      if (referrer.telegramId === user.telegramId) {
        await ctx.reply('❌ You cannot use your own referral code.');
        return;
      }

      // Apply referral benefits
      user.referredBy = referralCode;
      user.credits += 20;
      referrer.addReferralCredits();

      await user.save();
      await referrer.save();

      await ctx.reply(`🎉 Referral code applied successfully!

💎 You received 20 extra credits!
💎 Your referrer also received 20 credits!

Total credits: ${user.credits}`);
    } catch (error) {
      console.error('Referral code error:', error);
      await ctx.reply('❌ Sorry, something went wrong while applying the referral code.');
    }
  }
}

module.exports = new MessageHandlers();
