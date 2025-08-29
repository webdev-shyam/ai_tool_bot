require('dotenv').config();
const { Telegraf, session } = require('telegraf');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const commandHandlers = require('./handlers/commandHandlers');
const callbackHandlers = require('./handlers/callbackHandlers');
const messageHandlers = require('./handlers/messageHandlers');
const apiRoutes = require('./routes/api');

// Initialize bot
const bot = new Telegraf(process.env.BOT_TOKEN);

// Use session middleware
bot.use(session());

// Connect to MongoDB
connectDB();

// Command handlers
bot.command('start', commandHandlers.handleStart);
bot.command('help', commandHandlers.handleHelp);
bot.command('tools', commandHandlers.handleTools);

// Callback query handler
bot.on('callback_query', callbackHandlers.handleCallback);

// Message handlers
bot.on('text', messageHandlers.handleTextMessage);
bot.on('photo', messageHandlers.handlePhoto);
bot.on('document', messageHandlers.handleDocument);

// Error handling
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('❌ Sorry, something went wrong. Please try again.');
});

// Set up Express server for Mini App API
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AI Tools Bot API is running',
    timestamp: new Date().toISOString()
  });
});

// Webhook endpoint for Telegram
app.post('/webhook', (req, res) => {
  bot.handleUpdate(req.body);
  res.sendStatus(200);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Mini App API: http://localhost:${PORT}`);
  console.log(`🤖 Bot webhook: http://localhost:${PORT}/webhook`);
});

// Set webhook for production
if (process.env.NODE_ENV === 'production' && process.env.WEBHOOK_URL) {
  bot.telegram.setWebhook(process.env.WEBHOOK_URL).then(() => {
    console.log('✅ Webhook set successfully');
  }).catch((err) => {
    console.error('❌ Webhook setup failed:', err);
  });
} else {
  // Start polling for development
  bot.launch().then(() => {
    console.log('✅ Bot started in polling mode');
  }).catch((err) => {
    console.error('❌ Bot startup failed:', err);
  });
}

// Graceful shutdown
process.once('SIGINT', () => {
  bot.stop('SIGINT');
  console.log('Bot stopped');
});

process.once('SIGTERM', () => {
  bot.stop('SIGTERM');
  console.log('Bot stopped');
});

module.exports = { bot, app };
