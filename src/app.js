const express = require('express');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const logger = require('./logger');
var airQualityRouter = require("./routes/airQuality.route");

const app = express();

require('dotenv').config()

// Basic Swagger options
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Air Quality API',
            version: '1.0.0',
            description: 'API to get Air Quality info of the nearest city by longitude and latitude',
        },
        servers: [
            {
                url: `http://${process.env.APP_HOST}:${process.env.APP_PORT}`,
            },
        ],
    },
    apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

app.use("/air_quality", airQualityRouter); //api router/handler
app.use( // swagger
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocs, {
        explorer: true,
        customCssUrl:
          "https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.0/themes/3.x/theme-newspaper.css",
      })
);

require('./jobs/scheduler'); // attach cronjobs

module.exports = app;

