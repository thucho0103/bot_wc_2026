const axios = require('axios');

const BASE_URL = 'https://api.the-odds-api.com/v4/sports/soccer_fifa_world_cup/odds';

/**
 * Fetches World Cup betting odds from The Odds API.
 * Retrieves Head-to-Head, Point Spread, and Totals markets in decimal format.
 * @param {string} apiKey - The Odds API key.
 * @param {string} [regions] - Bookmaker regions (default: 'us').
 */
async function fetchWorldCupOdds(apiKey, regions = 'us') {
    if (!apiKey) {
        throw new Error('The Odds API Key is not configured.');
    }
    
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                apiKey: apiKey,
                regions: regions,
                markets: 'h2h,spreads,totals',
                oddsFormat: 'decimal'
            }
        });
        return response.data;
    } catch (error) {
        const errorMsg = error.response?.data?.message || error.message;
        console.error('Error fetching data from The Odds API:', errorMsg);
        throw new Error(`The Odds API Error: ${errorMsg}`);
    }
}

module.exports = { fetchWorldCupOdds };
