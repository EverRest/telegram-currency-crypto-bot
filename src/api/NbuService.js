const axios = require('axios');
const _ = require('lodash');
const config = require('../config');

class NbuService {
    constructor() {
        this.nbuApiUrl = config.nbuApiUrl;
        this.currencyCodes = config.nbuCurrencyCodes;
        this.nbuCurrencyCodeKey = config.nbuCurrencyCodeKey;
        this.availableCurrencies = Object.keys(this.currencyCodes);
        this.metalCodes = config.nbuMetalCodes;
        this.availableMetal = Object.keys(this.metalCodes);
    }

    async getExchangeRates() {
        const response = await axios.get(this.nbuApiUrl);
        return _.filter(response.data, rate => {
            return this.availableCurrencies.includes(_.get(rate, this.nbuCurrencyCodeKey));
        });
    }

    async geMetalRates() {
        const response = await axios.get(this.nbuApiUrl);
        return _.filter(response.data, rate => {
            return this.availableMetal.includes(_.get(rate, this.nbuCurrencyCodeKey));
        });
    }
}

module.exports = NbuService;