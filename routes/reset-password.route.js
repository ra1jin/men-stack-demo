var appRoot = require('app-root-path');
var express = require('express');
var router = express.Router();

var User = require(appRoot + '/models/user.model');
var requestValidator = require(appRoot + '/lib/request-validator/request-validator');
var validateResetPasswordToken = require(appRoot + '/validations/reset-password-token.validate');
var validatePassword = require(appRoot + '/validations/password.validate');
var validatePasswordConfirm = require(appRoot + '/validations/password-confirm.validate');

// -----------------------------------------------------------------------------------------------------

//
// GET /reset-password
//
router.get('/reset-password', function (req, res) {
  if (req.session.user) {
    return res.redirect('/');
  }

  res.render('reset-password');
});

//
// POST /reset-password
//
router.post('/reset-password', [
  requestValidator('body', 'token', validateResetPasswordToken),
  requestValidator('body', 'password', validatePassword),
  requestValidator('body', 'passwordConfirm', validatePasswordConfirm('body.password')),
  async function (req, res) {
    if (req.session.user) {
      return res.redirect('/');
    }
  
    if (req.validatorErrors) {
      res.flash('dataErrors', req.validatorErrors);
      res.flash('alert', { type: 'error', message: req.translate('ERROR_INVALID_DATA_FORMAT') });
      return res.redirect('/reset-password');
    }

    var user = await User.findOne({ resetPasswordToken: req.body.token });
    if (!user) {
      res.flash('alert', { type: 'error', message: req.translate('ERROR_RESET_PASSWORD_INVALID_TOKEN') });
      return res.redirect('/reset-password');
    }

    if (user.resetPasswordExpires < Date.now()) {
      res.flash('alert', { type: 'error', message: req.translate('ERROR_RESET_PASSWORD_EXPIRED_TOKEN') });
      return res.redirect('/reset-password');
    }

    try {
      user.password = req.body.password;
      user.resetPasswordExpires = 0;
      user.resetPasswordToken = '';
      await user.save();
    }
    catch (err) {
      return next(err);
    }

    res.flash('alert', { type: 'success', message: req.translate('RESET_PASSWORD.SUCCESS_ALERT') });
    return res.redirect('/reset-password');
  }
]);

module.exports = router;