const axios = require('axios');
const _ = require('lodash');
const config = require('../config');

class CoinMarketCapService {
    constructor() {
        this.apiKey = config.coinMarketCapApiKey;
        this.apiUrl = config.coinMarketCapApiUrl;
    }

    async getCryptoRates() {
        const response = await axios.get(this.apiUrl,{
            headers: {
                'X-CMC_PRO_API_KEY': this.apiKey
            }

        });
        return response.data;
    }
}

module.exports = CoinMarketCapService;