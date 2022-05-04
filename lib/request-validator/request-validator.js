module.exports = function (type, field, validate) {
  return async function (req, res, next) {
    var value = req[type][field];
    var message = await validate(value, req);

    if (message) {
      if (req.validatorErrors === undefined) {
        req.validatorErrors = {}
      }

      req.validatorErrors[field] = {
        value: value,
        message: message,
        field: field
      };
    }

    next();
  }
}