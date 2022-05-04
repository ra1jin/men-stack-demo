var appRoot = require('app-root-path');
var express = require('express');
var router = express.Router();

var User = require(appRoot + '/models/user.model');
var requestValidator = require(appRoot + '/lib/request-validator/request-validator');
var validateUsername = require(appRoot + '/validations/username.validate');
var validateEmail = require(appRoot + '/validations/email.validate');
var validatePassword = require(appRoot + '/validations/password.validate');
var validatePasswordConfirm = require(appRoot + '/validations/password-confirm.validate');
var validateBirthYear = require(appRoot + '/validations/birthyear.validate');

// -----------------------------------------------------------------------------------------------------

//
// GET /signup
//
router.get('/signup', function (req, res) {
  if (req.session.user) {
    return res.redirect('/');
  }

  res.render('signup');
});

//
// POST /signup
//
router.post('/signup', [
  requestValidator('body', 'username', validateUsername),
  requestValidator('body', 'email', validateEmail),
  requestValidator('body', 'password', validatePassword),
  requestValidator('body', 'passwordConfirm', validatePasswordConfirm('body.password')),
  requestValidator('body', 'birthYear', validateBirthYear),
  async function (req, res, next) {
    if (req.session.user) {
      return res.redirect('/');
    }
  
    if (req.validatorErrors) {
      res.flash('data', req.body);
      res.flash('dataErrors', req.validatorErrors);
      res.flash('alert', { type: 'error', message: req.translate('ERROR_INVALID_DATA_FORMAT') });
      return res.redirect('/signup');
    }

    if (await User.findOne({ email: req.body.email })) {
      res.flash('data', req.body);
      res.flash('alert', { type: 'error', message: req.translate('ERROR_EMAIL_ALREADY_EXIST') });
      return res.redirect('/signup');
    }

    if (await User.findOne({ username: req.body.username })) {
      res.flash('data', req.body);
      res.flash('alert', { type: 'error', message: req.translate('ERROR_USERNAME_ALREADY_EXIST') });
      return res.redirect('/signup');
    }

    try {
      var user = new User(req.body);
      await user.save();
    }
    catch (err) {
      return next(err);
    }

    res.flash('alert', { type: 'success', message: req.translate('SIGNUP.SUCCESS_ALERT') });
    return res.redirect('/signup');
  }
]);

module.exports = router;