const axios = require('axios');

const ESPN_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard';

/**
 * Fetches the latest World Cup data from ESPN.
 * Includes schedule, scores, and results.
 */
async function fetchWorldCupData() {
    try {
        const response = await axios.get(ESPN_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching data from ESPN:', error.message);
        return null;
    }
}

module.exports = { fetchWorldCupData };
