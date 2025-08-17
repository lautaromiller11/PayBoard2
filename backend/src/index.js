require('dotenv').config();
const app = require('./app');
const { startTelegramBot } = require('./bot/telegramBot');

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`PriceCalc backend listening on port ${port}`);
  
  // Start Telegram bot only if enabled
  const telegramBotEnabled = process.env.TELEGRAM_BOT_ENABLED === 'true';
  
  if (telegramBotEnabled) {
    try {
      startTelegramBot({ port });
      console.log('✅ Telegram bot enabled and started');
    } catch (e) {
      console.error('❌ Failed to start Telegram bot:', e?.message || e);
    }
  } else {
    console.log('⚠️  Telegram bot disabled (TELEGRAM_BOT_ENABLED=false)');
  }
});


