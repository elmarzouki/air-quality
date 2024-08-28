const { v4: uuidv4 } = require('uuid');

const requestIdMiddleware = (req, res, next) => {
    req.requestId = uuidv4(); // Generate a unique ID for each request
    next();
};

module.exports = requestIdMiddleware;