var _ = require('lodash');

function validatePasswordConfirm(passwordPath) {
  return function (value, req) {
    if (value !== _.get(req, passwordPath)) {
      return req.translate('ERROR_PASSWORD_NOT_MATCH');
    }
  }
}


module.exports = validatePasswordConfirm;