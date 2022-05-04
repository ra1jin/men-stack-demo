var Joi = require('@hapi/joi');

function validateEndDatetime(value, req) {
  var start = new Date(req.body.startDatetime);
  var schema = Joi.date().min(start).required();
  if (schema.validate(value).error) {
    return req.translate('ERROR_INVALID_EVENT_END_DATETIME');
  }
}

module.exports = validateEndDatetime;