const User = require('../models/User');
const { generateReferralCode, getRemainingCredits, formatCredits } = require('../utils/helpers');

class CommandHandlers {
  async handleStart(ctx) {
    try {
      const telegramId = ctx.from.id;
      const username = ctx.from.username;
      const firstName = ctx.from.first_name;
      const lastName = ctx.from.last_name;

      // Find or create user
      let user = await User.findOne({ telegramId });
      
      if (!user) {
        user = new User({
          telegramId,
          username,
          firstName,
          lastName,
          referralCode: generateReferralCode(),
        });
        await user.save();
      }

      const remainingCredits = getRemainingCredits(user);
      
      const welcomeMessage = `🎉 Welcome to AI Tools Bot!

🤖 I'm your all-in-one AI assistant with powerful tools:
• 🎨 AI Image Generation
• 📄 PDF Tools (Convert & Merge)
• 🖼️ Image Processing (Convert & Compress)

💎 Credits: ${formatCredits(remainingCredits)} remaining today
📅 Daily limit: ${user.credits} requests

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

      await ctx.reply(welcomeMessage, { reply_markup: keyboard });
    } catch (error) {
      console.error('Start command error:', error);
      await ctx.reply('❌ Sorry, something went wrong. Please try again.');
    }
  }

  async handleHelp(ctx) {
    const helpMessage = `🤖 **AI Tools Bot Help**

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

    await ctx.reply(helpMessage, { parse_mode: 'Markdown' });
  }

  async handleTools(ctx) {
    const toolsMessage = `🛠️ **Available Tools**

Choose a tool to get started:

🎨 **AI Image Generator**
Generate stunning images from text descriptions using AI.

📄 **PDF Tools**
• Convert text to PDF
• Merge multiple PDF files
• Easy and fast

🖼️ **Image Tools**
• Convert image formats
• Compress images
• Resize images

📱 **Mini App**
Full-featured web interface with all tools.`;

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
          { text: '🔙 Back to Menu', callback_data: 'back_to_menu' }
        ]
      ]
    };

    await ctx.reply(toolsMessage, { 
      reply_markup: keyboard,
      parse_mode: 'Markdown'
    });
  }

  async handleCredits(ctx) {
    try {
      const user = await User.findOne({ telegramId: ctx.from.id });
      if (!user) {
        await ctx.reply('❌ User not found. Please use /start first.');
        return;
      }

      const remainingCredits = getRemainingCredits(user);
      
      const creditsMessage = `💎 **Your Credits**

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
          [
            { text: '🔙 Back to Menu', callback_data: 'back_to_menu' }
          ]
        ]
      };

      await ctx.reply(creditsMessage, { 
        reply_markup: keyboard,
        parse_mode: 'Markdown'
      });
    } catch (error) {
      console.error('Credits command error:', error);
      await ctx.reply('❌ Sorry, something went wrong. Please try again.');
    }
  }

  async handleReferral(ctx) {
    try {
      const user = await User.findOne({ telegramId: ctx.from.id });
      if (!user) {
        await ctx.reply('❌ User not found. Please use /start first.');
        return;
      }

      const referralMessage = `👥 **Refer Friends & Earn Credits**

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
          [
            { text: '🔙 Back to Menu', callback_data: 'back_to_menu' }
          ]
        ]
      };

      await ctx.reply(referralMessage, { 
        reply_markup: keyboard,
        parse_mode: 'Markdown'
      });
    } catch (error) {
      console.error('Referral command error:', error);
      await ctx.reply('❌ Sorry, something went wrong. Please try again.');
    }
  }
}

module.exports = new CommandHandlers();
