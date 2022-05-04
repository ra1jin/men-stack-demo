var Joi = require('@hapi/joi');

function validateEventTitle(value, req) {
  var schema = Joi.string().max(128).required();
  if (schema.validate(value).error) {
    return req.translate('ERROR_INVALID_EVENT_TITLE');
  }
}

module.exports = validateEventTitle