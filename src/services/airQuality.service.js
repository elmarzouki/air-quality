const axios = require('axios');
const logger = require('../logger');

const url = `${process.env.IQAIR_BASE_URL}/nearest_city`

async function fetchAirQuality(longitude, latitude, requestId=null) {
    try {
        const airResponse = await axios.get(url, {
            params: {
                key: process.env.IQAIR_API_KEY,
                lon: longitude,
                lat: latitude
            }
        });

        const pollution = airResponse.data.data.current.pollution;
        logger.info(`airQualityService | fetchAirQuality | airvisual response: ${JSON.stringify(pollution)}`, requestId);

        return {
            success: true,
            pollution
        };
    } catch (error) {
        if (error.response) {
            // The request was made, but the server responded with a status code outside the range of 2xx
            logger.error(`airQualityService | fetchAirQuality | API error: ${error.response.status} - ${error.response.data}`, requestId);
        } else if (error.request) {
            // The request was made, but no response was received
            logger.error(`airQualityService | fetchAirQuality | No response received: ${error.request}`, requestId);
        } else {
            // Something happened in setting up the request that triggered an error
            logger.error(`airQualityService | fetchAirQuality | Request setup error: ${error.message}`, requestId);
        }
        return {
            success: false,
            message: 'Failed to fetch data from airvisual'
        };
    }
}

module.exports = {
    fetchAirQuality
};