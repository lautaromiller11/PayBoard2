require('dotenv').config();
const app = require('./app');
const { startTelegramBot } = require('./bot/telegramBot');

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`PriceCalc backend listening on port ${port}`);
  // Start Telegram bot if configured
  try {
    startTelegramBot({ port });
  } catch (e) {
    console.error('Failed to start Telegram bot:', e?.message || e);
  }
});


