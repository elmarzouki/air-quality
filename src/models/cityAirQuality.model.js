const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const db = require('../db/db.connection'); 

const CityAirQualitySchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4,
    },
    longitude: {
        type: Number,
        required: true,
    },
    latitude: {
        type: Number,
        required: true,
    },
    aqius: { //AQI value based on US EPA standard
        type: Number,
        required: true,
    },
    mainus: { //main pollutant for US AQI
        type: String,
        required: true,
    },
    aqicn: { //AQI value based on China MEP standard
        type: Number,
        required: true,
    },
    maincn: { //main pollutant for Chinese AQI
        type: String,
        required: true,
    },
    isMaxPollution: {
        type: Boolean,
        default: false 
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

// index used for the cron select query
CityAirQualitySchema.index({longitude: 1, latitude: 1, isMaxPollution: 1});

const CityAirQuality = mongoose.model('CityAirQuality', CityAirQualitySchema);

module.exports = CityAirQuality;