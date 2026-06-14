const axios = require('axios');

const ESPN_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard';

/**
 * Fetches World Cup data from ESPN.
 * Supports passing a specific date or date range in YYYYMMDD or YYYYMMDD-YYYYMMDD format.
 * @param {string} [dates] - Optional date or date range.
 */
async function fetchWorldCupData(dates) {
    try {
        const url = dates ? `${ESPN_URL}?dates=${dates}` : ESPN_URL;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching data from ESPN (dates: ${dates || 'default'}):`, error.message);
        return null;
    }
}

module.exports = { fetchWorldCupData };
