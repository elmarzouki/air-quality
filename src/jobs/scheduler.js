const cron = require('node-cron');

const airQualityCron = require('./airQuality.cron');
const logger = require('../logger');
 

cron.schedule('* * * * *', () => {
    logger.info("Cron | Running cron job to fetch air quality...");
    airQualityCron.fetchAirQualityCronJob(2.352222, 48.856613);
});
