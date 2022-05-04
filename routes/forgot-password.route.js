var appRoot = require('app-root-path');
var express = require('express');
var router = express.Router();
var crypto = require('crypto');

var User = require(appRoot + '/models/user.model');
var requestValidator = require(appRoot + '/lib/request-validator/request-validator');
var validateEmail = require(appRoot + '/validations/email.validate');

// -----------------------------------------------------------------------------------------------------

//
// GET /forgot-password
//
router.get('/forgot-password', function (req, res) {
  res.render('forgot-password');
});

//
// POST /forgot-password
//
router.post('/forgot-password', [
  requestValidator('body', 'email', validateEmail),
  async function (req, res) {
    if (req.validatorErrors) {
      res.flash('dataErrors', req.validatorErrors);
      res.flash('alert', { type: 'error', message: req.translate('ERROR_INVALID_DATA_FORMAT') });
      return res.redirect('/forgot-password');
    }

    var user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.flash('alert', { type: 'error', message: req.translate('ERROR_ACCOUNT_NOT_EXIST') });
      return res.redirect('/forgot-password');
    }

    try {
      user.resetPasswordExpires = Date.now() + 86400000;
      user.resetPasswordToken = generateResetPasswordToken();
      await user.save();
    }
    catch (err) {
      return next(err);
    }

    res.flash('alert', { type: 'success', message: req.translate('FORGOT_PASSWORD.SUCCESS_ALERT') });
    return res.redirect('/forgot-password');
  }
]);

module.exports = router;

// -----------------------------------------------------------------------------------------------------

function generateResetPasswordToken() {
  return crypto.randomBytes(128).toString('hex');
}