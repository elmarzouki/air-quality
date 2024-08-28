const logger = require('../logger');
const airQualityService = require('../services/airQuality.service');
const CityAirQuality = require('../models/cityAirQuality.model');
const db = require('../db/db.connection');

// we assume that we will save a time series 
// that might have the same value 
// on different datetimes 

async function fetchAirQualityCronJob(long, lat) {
    const result = await airQualityService.fetchAirQuality(long, lat);
    if (result.success) {
        logger.info(`airQualityCron | Air Quality Data: ${JSON.stringify(result.pollution)}`);
        try {
            await db.connect();
            const maxCityAirQuality = await CityAirQuality.find({
                longitude: long,
                latitude: lat,
                isMaxPollution: true
            })
            .select({ _id: 1, aqius: 1 })
            .sort({ createdAt: -1 })
            .exec();

            let isNewMax = true;
            let shouldUpdate = false;
            if (maxCityAirQuality.length > 0) {
                // all maxCityAirQuality should have the same aqius
                shouldUpdate = maxCityAirQuality[0].aqius < result.pollution.aqius;
                isNewMax = maxCityAirQuality[0].aqius <= result.pollution.aqius;
                if (shouldUpdate) {
                    await CityAirQuality.updateMany(
                        {
                            longitude: long,
                            latitude: lat,
                            isMaxPollution: true
                        },
                        { $set: { isMaxPollution: false } }
                    );
                    const affectedIds = maxCityAirQuality.map(item => item._id);
                    logger.info(`airQualityCron | City air quality IDs updated: ${affectedIds.join(', ')}`);
                }
            }
            const cityAirQuality = new CityAirQuality({
                longitude: long,
                latitude: lat,
                aqius: result.pollution.aqius,
                mainus: result.pollution.mainus,
                aqicn: result.pollution.aqicn,
                maincn: result.pollution.maincn,
                isMaxPollution: isNewMax,
            });
            await cityAirQuality.save();
            logger.info(`airQualityCron | City air quality saved. ID: ${cityAirQuality._id}`);
        } catch (dbError) {
            logger.error(`airQualityCron | Error saving data to MongoDB: ${dbError.message}`);
        }
    } else {
        logger.error(`airQualityCron | Error fetching air quality: ${result.message}`);
    }
}

module.exports = {
    fetchAirQualityCronJob
};