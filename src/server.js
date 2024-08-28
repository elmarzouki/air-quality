const app = require('./app');

const logger = require('./logger');

const serverUrl = `http://${process.env.APP_HOST}:${process.env.APP_PORT}`;

// serve
app.listen(
    process.env.APP_PORT,
    () => {
        logger.info(`App | Running on ${serverUrl}`)
        logger.info(`App | Swagger docs available at ${serverUrl}/api-docs`);
    }
);