var Joi = require('@hapi/joi');

function validateBirthYear(value, req) {
  var schema = Joi.number().integer().min(1900).max(new Date().getFullYear()).required();
  if (schema.validate(value).error) {
    return req.translate('ERROR_INVALID_BIRTHYEAR_FORMAT');
  }
}

module.exports = validateBirthYear;