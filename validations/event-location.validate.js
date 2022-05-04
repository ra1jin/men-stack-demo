var Joi = require('@hapi/joi');

function validateLocation(value, req) {
  var schema = Joi.string().regex(/^https:\/\/goo.gl\/maps\/[A-Za-z0-9]{17}$/);
  if (value && schema.validate(value).error) {
    return req.translate('ERROR_INVALID_EVENT_LOCATION');
  }
}

module.exports = validateLocation;