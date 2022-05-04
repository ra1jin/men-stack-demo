var Joi = require('@hapi/joi');

function validateResetPasswordToken(value, req) {
  var schema = Joi.string().min(128).hex().required();
  if (schema.validate(value).error) {
    return req.translate('ERROR_RESET_PASSWORD_INVALID_TOKEN_FORMAT');
  }
}

module.exports = validateResetPasswordToken;