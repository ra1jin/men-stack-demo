var Joi = require('@hapi/joi');

function validateStartDatetime(value, req) {
  var today = new Date();
  var schema = Joi.date().min(today).required();
  if (schema.validate(value).error) {
    return req.translate('ERROR_INVALID_EVENT_START_DATETIME');
  }
}

module.exports = validateStartDatetime;