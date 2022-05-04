var Joi = require('@hapi/joi');

function validateEmail(value, req) {
  var schema = Joi.string().email().required();
  if (schema.validate(value).error) {
    return req.translate('ERROR_INVALID_EMAIL_FORMAT');
  }
}

module.exports = validateEmail;