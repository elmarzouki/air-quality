const mongoose = require('mongoose');

const logger = require('../logger');

// custom db events logging
mongoose.connection.on('connected', () => {
    logger.info('MongoDB | connect | db connected.');
});
  
mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB | connect | connection error:${err.message}`);
});
  
mongoose.connection.on('disconnected', () => {
    logger.info('MongoDB | connect | db Disconnected.');
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    logger.info('MongoDB | connect | connection closed due to app termination');
    process.exit(0);
});

// db connect
const connect = async () => {
    try {
        if (process.env.NODE_ENV == 'dev') {
            mongoose.set('debug', true);
        } // allow db debug mode on dev env only
        await mongoose.connect(process.env.MONGO_URI);
    } catch (err) {
        process.exit(1);
    }
};

const createConnection = async () => {
    try {
        await mongoose.createConnection(process.env.MONGO_URI);
    } catch (err) {
        process.exit(1);
    }
};


module.exports = {
    connect,
    createConnection
};