const axios = require('axios');
const config = require('../config');

const pantryApi = axios.create({
    baseURL: 'https://getpantry.cloud/apiv1/pantry',
});

async function getRates() {
    const response = await pantryApi.get(`/${config.pantryId}/basket/rates`);
    return response.data;
}

async function getCrypto() {
    const response = await pantryApi.get(`/${config.pantryId}/basket/crypto`);
    return response.data;
}

async function upsertRates(newRates) {
    await pantryApi.put(`/${config.pantryId}/basket/rates`, newRates);
}

async function upsertCrypto(newRates) {
    await pantryApi.put(`/${config.pantryId}/basket/crypto`, newRates);
}

module.exports = {
    getRates,
    upsertRates,
};