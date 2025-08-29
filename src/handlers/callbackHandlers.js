const User = require('../models/User');
const aiImageService = require('../services/aiImageService');
const pdfService = require('../services/pdfService');
const imageService = require('../services/imageService');
const { getRemainingCredits, formatCredits } = require('../utils/helpers');

class CallbackHandlers {
  async handleCallback(ctx) {
    const callbackData = ctx.callbackQuery.data;
    
    try {
      switch (callbackData) {
        case 'ai_image':
          await this.handleAIImage(ctx);
          break;
        case 'pdf_tools':
          await this.handlePDFTools(ctx);
          break;
        case 'image_tools':
          await this.handleImageTools(ctx);
          break;
        case 'mini_app':
          await this.handleMiniApp(ctx);
          break;
        case 'credits':
          await this.handleCredits(ctx);
          break;
        case 'referral':
          await this.handleReferral(ctx);
          break;
        case 'help':
          await this.handleHelp(ctx);
          break;
        case 'back_to_menu':
          await this.handleBackToMenu(ctx);
          break;
        case 'share_referral':
          await this.handleShareReferral(ctx);
          break;
        case 'premium':
          await this.handlePremium(ctx);
          break;
        default:
          await ctx.answerCbQuery('Unknown action');
      }
    } catch (error) {
      console.error('Callback handler error:', error);
      await ctx.answerCbQuery('❌ Something went wrong');
    }
  }

  async handleAIImage(ctx) {
    const user = await User.findOne({ telegramId: ctx.from.id });
    if (!user || !user.hasCredits()) {
      await ctx.answerCbQuery('❌ No credits remaining');
      await ctx.reply('💎 You have no credits remaining. Please wait until tomorrow or refer friends to earn more credits.');
      return;
    }

    const message = `🎨 **AI Image Generator**

Describe the image you want to generate. Be specific and detailed for better results!

Examples:
• "A beautiful sunset over mountains"
• "A cute cat playing with yarn"
• "A futuristic city skyline at night"

⚠️ **Note:** Each generation uses 1 credit
💎 Credits remaining: ${formatCredits(getRemainingCredits(user))}

Send your description now!`;

    const keyboard = {
      inline_keyboard: [
        [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]
      ]
    };

    await ctx.editMessageText(message, { 
      reply_markup: keyboard,
      parse_mode: 'Markdown'
    });
    
    // Set user state to waiting for image prompt
    ctx.session = { ...ctx.session, waitingFor: 'ai_image_prompt' };
  }

  async handlePDFTools(ctx) {
    const message = `📄 **PDF Tools**

Choose what you want to do:

📝 **Text to PDF**
Convert text messages to PDF documents

📋 **Merge PDFs**
Combine multiple PDF files into one

Send me:
• Text message for PDF conversion
• PDF files for merging

⚠️ **Note:** Each operation uses 1 credit`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📝 Text to PDF', callback_data: 'text_to_pdf' },
          { text: '📋 Merge PDFs', callback_data: 'merge_pdfs' }
        ],
        [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]
      ]
    };

    await ctx.editMessageText(message, { 
      reply_markup: keyboard,
      parse_mode: 'Markdown'
    });
  }

  async handleImageTools(ctx) {
    const message = `🖼️ **Image Tools**

Choose what you want to do:

🔄 **Convert Format**
Convert between JPG, PNG, WebP formats

🗜️ **Compress Image**
Reduce file size while maintaining quality

📏 **Resize Image**
Change image dimensions

Send me an image file to get started!

⚠️ **Note:** Each operation uses 1 credit`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🔄 Convert Format', callback_data: 'convert_image' },
          { text: '🗜️ Compress Image', callback_data: 'compress_image' }
        ],
        [
          { text: '📏 Resize Image', callback_data: 'resize_image' },
          { text: 'ℹ️ Image Info', callback_data: 'image_info' }
        ],
        [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]
      ]
    };

    await ctx.editMessageText(message, { 
      reply_markup: keyboard,
      parse_mode: 'Markdown'
    });
  }

  async handleMiniApp(ctx) {
    const miniAppUrl = process.env.MINI_APP_URL || 'https://your-mini-app.vercel.app';
    
    const message = `📱 **Mini App**

Open our full-featured web interface for a better experience!

✨ **Features:**
• All tools in one place
• Better UI/UX
• File upload support
• Real-time processing

Click the button below to open the Mini App!`;

    const keyboard = {
      inline_keyboard: [
        [{ text: '🚀 Open Mini App', web_app: { url: miniAppUrl } }],
        [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]
      ]
    };

    await ctx.editMessageText(message, { 
      reply_markup: keyboard,
      parse_mode: 'Markdown'
    });
  }

  async handleCredits(ctx) {
    const user = await User.findOne({ telegramId: ctx.from.id });
    if (!user) {
      await ctx.answerCbQuery('❌ User not found');
      return;
    }

    const remainingCredits = getRemainingCredits(user);
    
    const message = `💎 **Your Credits**

📊 **Daily Usage:**
• Used: ${user.dailyUsage}/${user.credits}
• Remaining: ${formatCredits(remainingCredits)}

📅 **Next Reset:** Tomorrow at midnight

👥 **Referral Stats:**
• Referred friends: ${user.referralCount}
• Referral code: \`${user.referralCode}\`

💡 **Earn More Credits:**
• Refer 3 friends → Get 20 extra credits
• Upgrade to premium for unlimited usage`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '👥 Share Referral Code', callback_data: 'share_referral' },
          { text: '💎 Upgrade to Premium', callback_data: 'premium' }
        ],
        [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]
      ]
    };

    await ctx.editMessageText(message, { 
      reply_markup: keyboard,
      parse_mode: 'Markdown'
    });
  }

  async handleReferral(ctx) {
    const user = await User.findOne({ telegramId: ctx.from.id });
    if (!user) {
      await ctx.answerCbQuery('❌ User not found');
      return;
    }

    const message = `👥 **Refer Friends & Earn Credits**

🎁 **How it works:**
• Share your referral code with friends
• When they join using your code, you both get credits
• Refer 3 friends → Get 20 extra credits

🔑 **Your Referral Code:**
\`${user.referralCode}\`

📊 **Your Stats:**
• Friends referred: ${user.referralCount}
• Credits earned: ${user.referralCount * 20}

💡 **Share this message with your friends!**`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📤 Share Referral Code', callback_data: 'share_referral' },
          { text: '📊 Referral Stats', callback_data: 'referral_stats' }
        ],
        [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]
      ]
    };

    await ctx.editMessageText(message, { 
      reply_markup: keyboard,
      parse_mode: 'Markdown'
    });
  }

  async handleHelp(ctx) {
    const message = `🤖 **AI Tools Bot Help**

**Available Commands:**
/start - Start the bot and see main menu
/help - Show this help message
/tools - Show available tools

**Available Tools:**

🎨 **AI Image Generator**
• Generate images from text descriptions
• Uses Stable Diffusion AI
• 512x512 resolution for free tier

📄 **PDF Tools**
• Convert text to PDF
• Merge multiple PDF files
• Free and easy to use

🖼️ **Image Tools**
• Convert between formats (JPG, PNG, WebP)
• Compress images
• Resize images

📱 **Mini App**
• Full-featured web interface
• All tools in one place
• Better user experience

**Credits System:**
• Free tier: ${formatCredits(10)} per day
• Premium: Unlimited usage
• Refer friends to earn extra credits

**Need more help?**
Contact @your_username for support`;

    const keyboard = {
      inline_keyboard: [
        [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]
      ]
    };

    await ctx.editMessageText(message, { 
      reply_markup: keyboard,
      parse_mode: 'Markdown'
    });
  }

  async handleBackToMenu(ctx) {
    const user = await User.findOne({ telegramId: ctx.from.id });
    const remainingCredits = user ? getRemainingCredits(user) : 0;
    
    const message = `🎉 Welcome to AI Tools Bot!

🤖 I'm your all-in-one AI assistant with powerful tools:
• 🎨 AI Image Generation
• 📄 PDF Tools (Convert & Merge)
• 🖼️ Image Processing (Convert & Compress)

💎 Credits: ${formatCredits(remainingCredits)} remaining today
📅 Daily limit: ${user ? user.credits : 10} requests

Choose a tool below to get started!`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🎨 AI Image Generator', callback_data: 'ai_image' },
          { text: '📄 PDF Tools', callback_data: 'pdf_tools' }
        ],
        [
          { text: '🖼️ Image Tools', callback_data: 'image_tools' },
          { text: '📱 Mini App', callback_data: 'mini_app' }
        ],
        [
          { text: '💎 My Credits', callback_data: 'credits' },
          { text: '👥 Refer Friends', callback_data: 'referral' }
        ],
        [
          { text: '❓ Help', callback_data: 'help' }
        ]
      ]
    };

    await ctx.editMessageText(message, { reply_markup: keyboard });
  }

  async handleShareReferral(ctx) {
    const user = await User.findOne({ telegramId: ctx.from.id });
    if (!user) {
      await ctx.answerCbQuery('❌ User not found');
      return;
    }

    const shareMessage = `🎉 **Join AI Tools Bot!**

I'm using this amazing AI bot with powerful tools:
• 🎨 AI Image Generation
• 📄 PDF Tools
• 🖼️ Image Processing

🔑 **Use my referral code:** \`${user.referralCode}\`

Get started: @your_bot_username

We both get extra credits when you join! 🎁`;

    await ctx.answerCbQuery('✅ Referral message ready to share');
    await ctx.reply(shareMessage, { parse_mode: 'Markdown' });
  }

  async handlePremium(ctx) {
    const message = `💎 **Premium Features**

🚀 **Unlimited Usage**
• No daily limits
• Priority processing
• Higher quality outputs

🎨 **AI Image Generator**
• Higher resolution (1024x1024)
• More generation steps
• Advanced models

📄 **PDF Tools**
• Larger file support
• Advanced formatting
• Batch processing

🖼️ **Image Tools**
• Higher quality compression
• Advanced filters
• Batch processing

💳 **Coming Soon:**
• Telegram Stars integration
• Premium subscription
• Exclusive features

Stay tuned for premium features!`;

    const keyboard = {
      inline_keyboard: [
        [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]
      ]
    };

    await ctx.editMessageText(message, { 
      reply_markup: keyboard,
      parse_mode: 'Markdown'
    });
  }
}

module.exports = new CallbackHandlers();
