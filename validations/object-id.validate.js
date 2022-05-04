var Joi = require('@hapi/joi');

function validateObjectId(value, req) {
  var schema = Joi.string().regex(/^[a-f\d]{24}$/i).required();
  if (schema.validate(value).error) {
    return req.translate('ERROR_INVALID_OBJECTID_FORMAT');
  }
}

module.exports = validateObjectId;