const dotenv = require('dotenv');
dotenv.config({path: '../.env'});
const fs = require('fs');
const config = require('./config');
const bot = require('./bot/telegram');
const cron = require('node-cron');
const winston = require('winston');
const utils = require('./utils/utils');
const express = require('express');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({filename: 'error.log', level: 'error'}),
        new winston.transports.File({filename: 'combined.log'}),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

const app = express();
const port = process.env.PORT || 3000;

app.post('/', (req, res) => {
    res.send('Hello Webhook!');
});

app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
});

cron.schedule('0 9  * * *', async () => {
    try {
        const nbuRates = await utils.getExchangeRates();
        const jsonData = fs.readFileSync('./storage/currencies.json', 'utf8');
        let oldRates = jsonData ? JSON.parse(jsonData) : {};
        let differences = utils.calculateDifferences(nbuRates, oldRates);
        fs.writeFileSync('./storage/currencies.json', JSON.stringify(nbuRates));
        let chatId = config.telegramChatId;
        let messageOptions = utils.buildMessageNbu(nbuRates, differences);
        await bot.sendMessage(chatId, messageOptions.text, {
            reply_markup: messageOptions.reply_markup ,
            parse_mode: messageOptions.parse_mode,
        });
    } catch (error) {
        logger.error('Error while fetching exchange rates', error);
    }
});

cron.schedule('0 11 * * *', async () => {
    try {
        const cryptoRates = await utils.getCryptoRates();
        const jsonData = fs.readFileSync('./storage/crypto.json', 'utf8');
        let oldRates = jsonData ? JSON.parse(jsonData) : {};
        let differences = utils.calculateCryptoDifferences(cryptoRates, oldRates);
        fs.writeFileSync('./storage/crypto.json', JSON.stringify(cryptoRates));
        let chatId = config.telegramChatId;
        console.log(differences);
        let messageOptions = utils.buildMessageCrypto(cryptoRates,differences);
        await bot.sendMessage(chatId, messageOptions.text, {
            reply_markup: messageOptions.reply_markup ,
            parse_mode: messageOptions.parse_mode,
        });
    } catch (error) {
        logger.error('Error while fetching crypto rates', error);
    }
});

cron.schedule('0  10 * * *', async () => {
    try {
            const metalRates = await utils.getMetalRates();
            const jsonData = fs.readFileSync('./storage/metal.json', 'utf8');
            let oldRates = jsonData ? JSON.parse(jsonData) : {};
            let differences = utils.calculateDifferences(metalRates, oldRates);
            fs.writeFileSync('./storage/metal.json', JSON.stringify(metalRates));
            let chatId = config.telegramChatId;
            let messageOptions = utils.buildMessageMetal(metalRates, differences);
            await bot.sendMessage(chatId, messageOptions.text, {
                reply_markup: messageOptions.reply_markup ,
                parse_mode: messageOptions.parse_mode,
            });
    } catch (error) {
        logger.error('Error while fetching metal rates', error);
    }
});

process.on('uncaughtException', (error) => {
    logger.error('Unhandled Exception', error);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});