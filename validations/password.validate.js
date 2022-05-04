var Joi = require('@hapi/joi');

function validatePassword(value, req) {
  var schema = Joi.string().min(3).max(30).required();
  if (schema.validate(value).error) {
    return req.translate('ERROR_INVALID_PASSWORD_FORMAT');
  }
}

module.exports = validatePassword;