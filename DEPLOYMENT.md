# 🚀 Deployment Guide

This guide will walk you through deploying your Telegram AI Tools Bot to production using free hosting services.

## 📋 Prerequisites

Before starting, make sure you have:

1. **GitHub Account** - For code repository
2. **Telegram Bot Token** - From @BotFather
3. **MongoDB Atlas Account** - Free tier database
4. **Hugging Face Account** - For AI image generation
5. **Render Account** - For backend hosting
6. **Vercel Account** - For frontend hosting

## 🔧 Step 1: Get Required API Keys

### 1.1 Telegram Bot Token

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot`
3. Choose a name for your bot (e.g., "My AI Tools Bot")
4. Choose a username (must end with 'bot', e.g., "my_ai_tools_bot")
5. Copy the token provided (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 1.2 Hugging Face API Key

1. Go to [Hugging Face](https://huggingface.co/)
2. Create an account or sign in
3. Go to Settings → Access Tokens
4. Click "New token"
5. Give it a name (e.g., "AI Tools Bot")
6. Select "Read" role
7. Copy the token

### 1.3 MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new project
4. Build a free cluster (M0 tier)
5. Create a database user with password
6. Get your connection string
7. Replace `<username>`, `<password>`, and `<dbname>` in the URI

## 🌐 Step 2: Deploy Backend to Render

### 2.1 Prepare Your Repository

1. Push your code to GitHub
2. Make sure your repository is public (for free tier)

### 2.2 Deploy on Render

1. Go to [Render](https://render.com/)
2. Sign up with your GitHub account
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure the service:

```
Name: telegram-ai-tools-bot
Environment: Node
Region: Choose closest to you
Branch: main
Build Command: npm install
Start Command: npm start
Plan: Free
```

### 2.3 Set Environment Variables

In your Render service, go to "Environment" tab and add:

```
BOT_TOKEN=your_telegram_bot_token_here
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/telegram_bot_db
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
NODE_ENV=production
PORT=3000
```

### 2.4 Get Your Backend URL

1. Wait for deployment to complete
2. Copy your service URL (e.g., `https://your-app.onrender.com`)
3. Update the `WEBHOOK_URL` environment variable:
   ```
   WEBHOOK_URL=https://your-app.onrender.com/webhook
   ```

## 📱 Step 3: Deploy Frontend to Vercel

### 3.1 Deploy on Vercel

1. Go to [Vercel](https://vercel.com/)
2. Sign up with your GitHub account
3. Click "New Project"
4. Import your GitHub repository
5. Configure the project:

```
Framework Preset: Vite
Root Directory: ./
Build Command: cd frontend && npm install && npm run build
Output Directory: frontend/dist
Install Command: (leave empty)
```

### 3.2 Set Environment Variables

In your Vercel project settings, add:

```
VITE_API_URL=https://your-app.onrender.com/api
```

### 3.3 Get Your Frontend URL

1. Wait for deployment to complete
2. Copy your Vercel URL (e.g., `https://your-mini-app.vercel.app`)
3. Update the backend environment variable:
   ```
   MINI_APP_URL=https://your-mini-app.vercel.app
   ```

## 🤖 Step 4: Configure Telegram Bot

### 4.1 Set Webhook

1. Go to your backend URL + `/api/health` to verify it's working
2. Set the webhook by visiting:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-app.onrender.com/webhook
   ```
3. You should see: `{"ok":true,"result":true,"description":"Webhook was set"}`

### 4.2 Configure Mini App

1. Message @BotFather
2. Send `/mybots`
3. Select your bot
4. Go to "Bot Settings" → "Menu Button"
5. Set the URL to your Vercel frontend URL

### 4.3 Test Your Bot

1. Start a chat with your bot
2. Send `/start`
3. Test all features:
   - AI Image Generation
   - PDF Tools
   - Image Tools
   - Mini App

## 🔍 Step 5: Verify Everything Works

### 5.1 Backend Health Check

Visit: `https://your-app.onrender.com/api/health`

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 5.2 Frontend Check

Visit your Vercel URL and verify:
- Page loads without errors
- Telegram Web App integration works
- All tools are accessible

### 5.3 Bot Commands

Test these commands in your bot:
- `/start` - Should show main menu
- `/help` - Should show help information
- `/tools` - Should show available tools

## 🛠️ Step 6: Troubleshooting

### Common Issues

#### Backend Not Starting
- Check environment variables are set correctly
- Verify MongoDB connection string
- Check Render logs for errors

#### Webhook Not Working
- Ensure webhook URL is accessible
- Check bot token is correct
- Verify HTTPS is used

#### Mini App Not Loading
- Check VITE_API_URL is set correctly
- Verify CORS is enabled on backend
- Check browser console for errors

#### AI Image Generation Failing
- Verify Hugging Face API key is valid
- Check API rate limits
- Ensure model is available

### Debug Commands

Check webhook status:
```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

Delete webhook (for testing):
```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/deleteWebhook
```

## 📊 Step 7: Monitoring

### Render Monitoring
- Check service logs in Render dashboard
- Monitor resource usage
- Set up alerts for downtime

### Vercel Monitoring
- Check deployment status
- Monitor performance metrics
- Review error logs

### Bot Analytics
- Track user engagement
- Monitor feature usage
- Analyze referral system

## 🔒 Step 8: Security Considerations

### Environment Variables
- Never commit API keys to repository
- Use environment variables for all secrets
- Regularly rotate API keys

### Rate Limiting
- Implement rate limiting for API endpoints
- Monitor for abuse
- Set appropriate limits

### Data Privacy
- Follow GDPR guidelines
- Implement data retention policies
- Secure user data storage

## 🚀 Step 9: Going Live

### Final Checklist

- [ ] All environment variables set
- [ ] Webhook configured and working
- [ ] Mini App accessible
- [ ] All features tested
- [ ] Error handling implemented
- [ ] Monitoring set up
- [ ] Documentation complete

### Launch Steps

1. **Announce to Users**
   - Create announcement message
   - Share bot username
   - Provide usage instructions

2. **Monitor Performance**
   - Watch for errors
   - Monitor API usage
   - Track user feedback

3. **Iterate and Improve**
   - Gather user feedback
   - Fix bugs quickly
   - Add new features

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Render and Vercel documentation
3. Check Telegram Bot API documentation
4. Create an issue in the GitHub repository

## 🎉 Congratulations!

Your Telegram AI Tools Bot is now live! Users can:

- Generate AI images from text
- Convert text to PDF
- Merge PDF files
- Process and convert images
- Use the Mini App for better experience
- Earn credits through referrals

Remember to:
- Monitor your bot regularly
- Respond to user feedback
- Keep dependencies updated
- Scale as needed

Happy coding! 🚀
