const NbuServiceClass = require('../api/NbuService');
const coi = require('../api/CoinMarketCapService');
const coinMarketCapService = new coi();
const nbuService = new NbuServiceClass();
const emojiFlags = require('country-currency-emoji-flags');
const {currencyCodes} = require("../config");
const emoji = require('node-emoji');
const {cryptoCurrencies} = require("../config");

async function  getExchangeRates() {
    const nbuRatesArray = await nbuService.getExchangeRates();
    let nbuRates = {};
    nbuRatesArray.forEach(rate => {
        nbuRates[rate.cc] = rate;
    });
    return nbuRates;
}

async function getMetalRates() {
    const metalRatesArray = await nbuService.geMetalRates();
    let metalRates = {};
    metalRatesArray.forEach(rate => {
        metalRates[rate.cc] = rate;
    });
    return metalRates;
}

async function getCryptoRates() {
    return await coinMarketCapService.getCryptoRates();
}

function calculateDifferences(nbuRates, storageRates) {
    let differences = {};
    for (let key in nbuRates) {
        if (nbuRates[key] && storageRates[key] && nbuRates[key].rate !== storageRates[key].rate) {
            differences[key] = nbuRates[key].rate - storageRates[key].rate;
        }
    }
    return differences;
}

function buildMessageNbu(nbuRates, differences) {
    let exchangeDate = Object.values(nbuRates)[0]?.exchangedate ?? new Date().toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    let message = `Національний Банк України станом на ${exchangeDate}:\n`;
    for (let key in nbuRates) {
        let currencyCode = nbuRates[key].cc.toUpperCase();
        const flagEmoji = emojiFlags.getEmojiByCurrencyCode(currencyCode);
        message += `${flagEmoji} ${nbuRates[key].txt}: ${nbuRates[key].rate} UAH`;
        if (differences[key] !== undefined) {
            const sign = differences[key] > 0 ? '+' : '-';
            message += ` (${sign}${differences[key]})`;
        }
        message += '\n';
    }
    return {
        text: message,
        parse_mode: 'HTML',
        // reply_markup: {
        // Add your reply_markup options here
        // }
    };
}


function buildMessageMetal(metalRates, differences) {
    let exchangeDate = Object.values(metalRates)[0]?.exchangedate ?? new Date().toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    let message = `<b>Ціна металів станом на ${exchangeDate}:</b>\n`;
    for (let key in metalRates) {
        const randomEmoji = emoji.random().emoji;
        message += `${randomEmoji} <b>${metalRates[key].txt}</b>: ${metalRates[key].rate} <b>UAH</b>`;
        if (differences[key] !== undefined) {
            const sign = differences[key] > 0 ? '+' : '-';
            message += ` (${sign}${differences[key]})`;
        }
        message += '\n';
    }
    return {
        text: message,
        parse_mode: 'HTML',
        // reply_markup: {
        // Add your reply_markup options here
        // }
    };
}

function buildMessageCrypto(cryptoRates) {
    let rateDate = new Date().toLocaleDateString('uk-UA', {   day: '2-digit', month: '2-digit', year: 'numeric' });
    let message = `<b>Криптовалюти по CoinMarketCap станом на : ${rateDate}</b>\n`;
    let CryptoData = cryptoRates.data ?? [];
    CryptoData = CryptoData.filter(crypto => Object.keys(cryptoCurrencies).includes(crypto.symbol.toUpperCase()));
    for (let i = 0; i < CryptoData.length; i++) {
        const randomEmoji = emoji.random().emoji;
        let price = CryptoData[i].quote.USD.price;
        price = price ? price.toFixed(2) : "0.00";
        message += `${randomEmoji}  <b>${CryptoData[i].name}</b>:  ${price} <b>USD</b>`;
        message += '\n';
    }
    return {
        text: message,
        parse_mode: 'HTML',
        // reply_markup: {
        // Add your reply_markup options here
        // }
    };
}

module.exports = {getExchangeRates, calculateDifferences, buildMessageNbu, getCryptoRates, buildMessageCrypto, getMetalRates, buildMessageMetal};