# 🤖 Telegram AI Tools Bot

A comprehensive Telegram bot with AI image generation, PDF tools, image processing, and Mini App support. Built with Node.js, Telegraf.js, and MongoDB.

## ✨ Features

### 🎨 AI Image Generation
- Generate images from text descriptions using Stable Diffusion
- 512x512 resolution for free tier
- Uses Hugging Face API (free)

### 📄 PDF Tools
- Convert text to PDF
- Merge multiple PDF files
- Easy-to-use interface

### 🖼️ Image Tools
- Convert between formats (JPG, PNG, WebP)
- Compress images
- Resize images
- Get image information

### 📱 Mini App
- Full-featured web interface
- All tools in one place
- Better user experience
- File upload support

### 💎 Credits System
- Free tier: 10 requests per day
- Referral system: Invite friends to earn credits
- Premium features (coming soon)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (free)
- Telegram Bot Token
- Hugging Face API key (free)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd telegram-ai-tool-bot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup

Copy the environment template:
```bash
cp env.example .env
```

Fill in your environment variables:
```env
# Telegram Bot Configuration
BOT_TOKEN=your_telegram_bot_token_here
WEBHOOK_URL=https://your-app-name.onrender.com/webhook

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/telegram_bot_db

# Hugging Face API (Free)
HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# App Configuration
PORT=3000
NODE_ENV=production

# Mini App Configuration
MINI_APP_URL=https://your-mini-app.vercel.app
```

### 4. Get Required API Keys

#### Telegram Bot Token
1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot`
3. Follow instructions to create your bot
4. Copy the token provided

#### Hugging Face API Key
1. Go to [Hugging Face](https://huggingface.co/)
2. Create an account
3. Go to Settings > Access Tokens
4. Create a new token
5. Copy the token

#### MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Replace `<username>`, `<password>`, and `<dbname>` in the URI

### 5. Run the Bot

#### Development
```bash
npm run dev
```

#### Production
```bash
npm start
```

## 🌐 Deployment

### Backend (Render)

1. **Create Render Account**
   - Go to [Render](https://render.com/)
   - Sign up with GitHub

2. **Deploy Backend**
   - Connect your GitHub repository
   - Create a new Web Service
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Add environment variables from your `.env` file

3. **Configure Webhook**
   - Get your Render URL (e.g., `https://your-app.onrender.com`)
   - Update `WEBHOOK_URL` in environment variables
   - Set `NODE_ENV=production`

### Frontend (Vercel)

1. **Create Vercel Account**
   - Go to [Vercel](https://vercel.com/)
   - Sign up with GitHub

2. **Deploy Mini App**
   - Connect your repository
   - Set build command: `cd frontend && npm install && npm run build`
   - Set output directory: `frontend/dist`
   - Add environment variables

3. **Update Mini App URL**
   - Copy your Vercel URL
   - Update `MINI_APP_URL` in backend environment variables

## 📱 Mini App Setup

The Mini App is a React application that provides a web interface for all bot features.

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── utils/
├── public/
└── package.json
```

### Key Features
- **AI Image Generator**: Text-to-image generation
- **PDF Tools**: Convert text to PDF, merge PDFs
- **Image Tools**: Format conversion, compression, resizing
- **User Dashboard**: Credits, usage stats, referral system

## 🔧 Configuration

### Bot Commands
- `/start` - Start the bot and see main menu
- `/help` - Show help information
- `/tools` - Show available tools

### Credit System
- **Free Tier**: 10 requests per day
- **Referral Bonus**: 20 credits for each referred friend
- **Premium**: Unlimited usage (coming soon)

### API Limits
- **Hugging Face**: Free tier with rate limits
- **File Upload**: 10MB maximum
- **Image Resolution**: 512x512 for free tier

## 🛠️ Development

### Project Structure
```
src/
├── config/
│   └── database.js
├── handlers/
│   ├── commandHandlers.js
│   ├── callbackHandlers.js
│   └── messageHandlers.js
├── models/
│   └── User.js
├── routes/
│   └── api.js
├── services/
│   ├── aiImageService.js
│   ├── pdfService.js
│   └── imageService.js
├── utils/
│   └── helpers.js
└── index.js
```

### Adding New Features

1. **Create Service**
   ```javascript
   // src/services/newService.js
   class NewService {
     async processData(data) {
       // Implementation
     }
   }
   module.exports = new NewService();
   ```

2. **Add Handler**
   ```javascript
   // In commandHandlers.js or callbackHandlers.js
   async handleNewFeature(ctx) {
     // Implementation
   }
   ```

3. **Add API Route**
   ```javascript
   // In routes/api.js
   router.post('/new-feature', verifyTelegramUser, async (req, res) => {
     // Implementation
   });
   ```

## 🔒 Security

- All API endpoints require Telegram user verification
- File upload limits prevent abuse
- Credit system prevents spam
- Input validation on all endpoints

## 📊 Monitoring

### Health Check
- Endpoint: `GET /api/health`
- Returns server status and timestamp

### Error Logging
- All errors are logged to console
- Consider adding external logging service for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the logs for error messages
2. Verify all environment variables are set correctly
3. Ensure all API keys are valid
4. Check MongoDB connection
5. Verify webhook URL is accessible

## 🎯 Roadmap

- [ ] Telegram Stars integration
- [ ] Premium subscription system
- [ ] Advanced AI models
- [ ] Batch processing
- [ ] User analytics dashboard
- [ ] Multi-language support

## 📞 Contact

For support or questions:
- Create an issue on GitHub
- Contact: @your_username on Telegram

---

**Made with ❤️ for the Telegram community**
