const dotenv = require('dotenv');
dotenv.config({path: '../.env'});
const config = require('./config');
const bot = require('./bot/telegram');
const pantry = require('./storage/pantry');
const cron = require('node-cron');
const winston = require('winston');
const utils = require('./utils/utils');
const express = require('express');
const coinMarketCapService = require('./api/CoinMarketCapService');
    const CoinMarketCapService  = new coinMarketCapService();

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

// cron.schedule('* * * * *', async () => {
//     try {
//         const nbuRates = await utils.getExchangeRates();
//         let storageRates = await pantry.getRates();
//         let differences = utils.calculateDifferences(nbuRates, storageRates);
//         let chatId = config.telegramChatId;
//         await pantry.upsertRates(nbuRates);
//         let messageOptions = utils.buildMessageNbu(nbuRates, differences);
//         let $m = await bot.sendMessage(chatId, messageOptions.text, {
//             reply_markup: messageOptions.reply_markup ,
//             parse_mode: messageOptions.parse_mode,
//         });
//     } catch (error) {
//         logger.error('Error while fetching exchange rates', error);
//     }
// });
//
// cron.schedule('* * * * *', async () => {
//     try {
//         const cryptoRates = await  CoinMarketCapService.getCryptoRates();
//         let chatId = config.telegramChatId;
//         let messageOptions = utils.buildMessageCrypto(cryptoRates);
//         let $m = await bot.sendMessage(chatId, messageOptions.text, {
//             reply_markup: messageOptions.reply_markup ,
//             parse_mode: messageOptions.parse_mode,
//         });
//     } catch (error) {
//         logger.error('Error while fetching exchange rates', error);
//     }
// });

cron.schedule('* * * * *', async () => {
    try {
        const metalRates = await utils.getMetalRates();
        let differences = utils.calculateDifferences(metalRates, metalRates);
        let chatId = config.telegramChatId;
        let messageOptions = utils.buildMessageMetal(metalRates, differences);
        let $m = await bot.sendMessage(chatId, messageOptions.text, {
            reply_markup: messageOptions.reply_markup ,
            parse_mode: messageOptions.parse_mode,
        });
    } catch (error) {
        logger.error('Error while fetching exchange rates', error);
    }
});

process.on('uncaughtException', (error) => {
    logger.error('Unhandled Exception', error);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});