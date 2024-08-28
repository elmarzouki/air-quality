const express = require('express');
const axios = require('axios');

const CityAirQuality = require('../models/cityAirQuality.model');
const db = require('../db/db.connection');
const requestIdMiddleware = require('../middlewares/requestId.middleware');
const logger = require('../logger');
const serializers = require('../serializers/coordinates.serializer');
const airQualityService = require('../services/airQuality.service');

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(requestIdMiddleware);

/**
 * @swagger
 * /air_quality/health_check:
 *  get:
 *      description: dummy health check api to check that this router apis exists.
 *      responses:
 *          200:
 *              description: ok response message
 */
router.get('/health_check', (req, res) => {
    logger.info("airQuality HTTP | health_check request...", req.requestId)
    res.status(200).send({
        message: 'ok'
    });
});


/**
 * @swagger
 * /air_quality/nearest_city:
 *   post:
 *     summary: Get the air quality of nearest city based on longitude and latitude
 *     description: Calls an external API to get information about the air quality of nearest city based on the provided longitude and latitude.
 *     tags:
 *       - Nearest City
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                   longitude:
 *                     type: number
 *                     example: 31.53700030
 *                   latitude:
 *                     type: number
 *                     example: 29.95375640
 *     responses:
 *       200:
 *         description: Successfully retrieved city pollution information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Result:
 *                   type: object
 *                   properties:
 *                      Pollution:
 *                        type: object
 *                        properties:
 *                           ts:
 *                               type: string
 *                               example: 2024-08-25T00:00:00.000Z
 *                           aqius:
 *                               type: number
 *                               example: 76
 *                           mainus:
 *                               type: string
 *                               example: p2
 *                           aqicn:
 *                               type: number
 *                               example: 33
 *                           maincn:
 *                               type: string
 *                               example: p2
 *       400:
 *         description: ['\"longitude\" is required', '\"latitude\" is required']
 *       500:
 *         description: Failed to fetch data from airvisual
 */
router.post('/nearest_city', async (req, res) => {
    // get lat and long and fetch the results from IQAir
    logger.info("airQuality HTTP | nearest_city request...", req.requestId)
    try {
        const data = req.body;
        logger.info(`airQuality HTTP | nearest_city | data: ${JSON.stringify(data)}`, req.requestId)
        const { error } = serializers.coordinatesSerializer.validate(req.body, { abortEarly: false });
        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            logger.error(`airQuality HTTP | nearest_city | error: ${errorMessages}`, req.requestId)
            return res.status(400).send({ message: errorMessages });
        }
        logger.info("airQuality HTTP | nearest_city | Calling airvisual...", req.requestId);
        // call the service
        const { longitude, latitude } = data; // get the submitted data 
        const result = await airQualityService.fetchAirQuality(longitude, latitude, req.requestId);

        if (!result.success) {
            return res.status(500).send({ message: result.message });
        }
        // return needed info
        res.status(200).send({
            Result: { Pollution: result.pollution }
        });
    } catch (error) {
        logger.error(`airQuality HTTP | nearest_city | error: ${error}`, req.requestId);
        res.status(500).send({
            message: 'Internal server error'
        });
    }
});


/**
 * @swagger
 * /air_quality/city:
 *   post:
 *     summary: Get air quality of city based on longitude and latitude when the pollution is maximum
 *     description: Search cronjob data to get maximum pollution data of a city
 *     tags:
 *       - City
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                   longitude:
 *                     type: number
 *                     example: 31.53700030
 *                   latitude:
 *                     type: number
 *                     example: 29.95375640
 *     responses:
 *       200:
 *         description: Successfully retrieved city maximum pollution information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Result:
 *                   type: object
 *                   properties:
 *                      Pollution:
 *                        type: object
 *                        properties:
 *                           _id:
 *                               type: string
 *                               example: 7e496381-b0e0-443b-9196-01f592d7c24e
 *                           longitude:
 *                               type: string
 *                               example: 2.352222
 *                           latitude:
 *                               type: string
 *                               example: 48.856613
 *                           aqius:
 *                               type: number
 *                               example: 76
 *                           mainus:
 *                               type: string
 *                               example: p2
 *                           aqicn:
 *                               type: number
 *                               example: 33
 *                           maincn:
 *                               type: string
 *                               example: p2
 *                           isMaxPollution:
 *                               type: boolean
 *                               example: true
 *                           createdAt:
 *                               type: date
 *                               example: 
 *       400:
 *         description: ['\"longitude\" is required', '\"latitude\" is required']
 *       500:
 *         description: Failed to fetch data from db
 */
router.post('/city', async (req, res) => {
    // get lat and long and fetch the results from IQAir
    logger.info("airQuality HTTP | city request...", req.requestId)
    const data = req.body;
    logger.info(`airQuality HTTP | city | data: ${JSON.stringify(data)}`, req.requestId)
    const { error } = serializers.coordinatesSerializer.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        logger.error(`airQuality HTTP | city | error: ${errorMessages}`, req.requestId)
        return res.status(400).send({ message: errorMessages });
    }
    logger.info("airQuality HTTP | city | Geting max pollution from db...", req.requestId);
    try{
        await db.connect();
        const cityAirQuality = await CityAirQuality.find({
            longitude: data.longitude,
            latitude: data.latitude,
            isMaxPollution: true,
        }).select({
            _id: 1,
            aqius: 1,
            mainus: 1,
            createdAt: 1,
        }).sort({ createdAt: -1 })
        .exec();
        // return needed info
        res.status(200).send({
            Result: { Pollution: cityAirQuality }
        });
    } catch (error) {
        logger.error(`airQuality HTTP | city | error: ${error}`, req.requestId);
        res.status(500).send({
            message: 'Internal server error'
        });
    }
});

module.exports = router;