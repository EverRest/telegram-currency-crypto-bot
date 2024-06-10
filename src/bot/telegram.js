const TelegramBot = require('node-telegram-bot-api');
const config = require('../config');

const token = config.telegramToken;
const bot = new TelegramBot(token, {polling: true});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    console.log(msg);
});

module.exports = bot;