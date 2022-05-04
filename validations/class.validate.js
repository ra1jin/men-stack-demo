var Joi = require('@hapi/joi');

function validateClass(value, req) {
  var schema = Joi.any().valid('', 'DEVELOPPER', 'DESIGNER', 'MUSICIAN', 'WRITER', 'TESTER');
  if (schema.validate(value).error) {
    return req.translate('ERROR_INVALID_CLASS_FORMAT');
  }
}

module.exports = validateClass;