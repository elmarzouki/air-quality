// this is used only as a http serializer
// to validate the passed data
const Joi = require('joi');

const coordinatesSerializer = Joi.object({
    longitude: Joi.number().required(),
    latitude: Joi.number().required()
});

module.exports = {
    coordinatesSerializer
};
