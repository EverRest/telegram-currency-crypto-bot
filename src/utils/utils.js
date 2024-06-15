const emojiFlags = require('country-currency-emoji-flags');
const emoji = require('node-emoji');
const {cryptoCurrencies} = require("../config");
const coinMarketCapService = require('../api/CoinMarketCapService');
const CoinMarketCapService = new coinMarketCapService();
const NbuServiceClass = require('../api/NbuService');
const nbuService = new NbuServiceClass();

async function getExchangeRates() {
    const nbuRatesArray = await nbuService.getExchangeRates();
    if (!nbuRatesArray) return;
    let nbuRates = {};
    nbuRatesArray.forEach(rate => {
        nbuRates[rate.cc] = rate;
    });
    return nbuRates;
}

async function getMetalRates() {
    const metalRatesArray = await nbuService.geMetalRates();
    if (!metalRatesArray) return;
    let metalRates = {};
    metalRatesArray.forEach(rate => {
        metalRates[rate.cc] = rate;
    });
    return metalRates;
}

async function getCryptoRates() {
    const cryptoRatesArray = await CoinMarketCapService.getCryptoRates();
    if (!cryptoRatesArray) return;
    let cryptoRates = {};
    cryptoRatesArray.data.forEach(rate => {
        cryptoRates[rate.symbol] = rate;
    });
    return cryptoRates;
}

function calculateDifferences(newRates, oldRates) {
    let differences = {};
    for (let key in newRates) {
        if (newRates[key] && oldRates[key]) {
            differences[key] = newRates[key].rate - oldRates[key].rate;
        } else {
            differences[key] = 0;
        }
    }
    return differences;
}

function calculateCryptoDifferences(newRates, oldRates) {
    let differences = {};
    for (let key in newRates) {
        if (newRates[key] && oldRates[key]) {
            differences[key] = newRates[key].quote.USD.price - oldRates[key].quote.USD.price;
        } else {
            differences[key] = 0;
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
    let message = `<b>Національний Банк України станом на ${exchangeDate}:</b>\n`;
    for (let key in nbuRates) {
        let currencyCode = nbuRates[key].cc.toUpperCase();
        const flagEmoji = emojiFlags.getEmojiByCurrencyCode(currencyCode);
        message += `${flagEmoji} <b>${nbuRates[key].txt}</b>: ${nbuRates[key].rate} <b> UAH </b>`;
        if (differences[key] !== undefined) {
            const sign = differences[key] > 0 ? '+' : '-';
            const differenceWithoutSign = Math.abs(differences[key]);
            message += ` (${sign} ${differenceWithoutSign.toFixed(4)})`;
        }
        message += '\n';
    }
    return {
        text: message,
        parse_mode: 'HTML',
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
            const differenceWithoutSign = Math.abs(differences[key]);
            message += ` (${sign}${differenceWithoutSign.toFixed(4)})`;
        }
        message += '\n';
    }
    return {
        text: message,
        parse_mode: 'HTML',
    };
}

function buildMessageCrypto(cryptoRates, differences) {
    let rateDate = new Date().toLocaleDateString('uk-UA', {day: '2-digit', month: '2-digit', year: 'numeric'});
    let message = `<b>Криптовалюти по CoinMarketCap станом на ${rateDate}:</b>\n`;
    let cryptoData = cryptoRates.data ?? [];
    cryptoData = cryptoData.filter(crypto => Object.keys(cryptoCurrencies).includes(crypto.symbol.toUpperCase()));
    for (let i = 0; i < cryptoData.length; i++) {
        const randomEmoji = emoji.random().emoji;
        let price = cryptoData[i].quote.USD.price;
        price = price ? price.toFixed(2) : "0.00";
        message += `${randomEmoji}  <b>${cryptoData[i].name}</b>:  ${price} <b>USD</b>`;
        if (differences[cryptoData[i].symbol] !== undefined) {
            const sign = differences[cryptoData[i].symbol] > 0 ? '+' : '-';
            const differenceWithoutSign = Math.abs(differences[cryptoData[i].symbol]);
            message += ` (${sign}${differenceWithoutSign.toFixed(8)})`;
        }
        message += '\n';
    }
    return {
        text: message,
        parse_mode: 'HTML',
    };
}

module.exports = {
    getExchangeRates,
    calculateDifferences,
    buildMessageNbu,
    getCryptoRates,
    buildMessageCrypto,
    calculateCryptoDifferences,
    getMetalRates,
    buildMessageMetal
};