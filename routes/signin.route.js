var appRoot = require('app-root-path');
var express = require('express');
var router = express.Router();

var User = require(appRoot + '/models/user.model');
var requestValidator = require(appRoot + '/lib/request-validator/request-validator');
var validateEmail = require(appRoot + '/validations/email.validate');
var validatePassword = require(appRoot + '/validations/password.validate');

// -----------------------------------------------------------------------------------------------------

//
// GET /signin
//
router.get('/signin', function (req, res) {
  if (req.session.user) {
    return res.redirect('/');
  }

  res.render('signin');
});

//
// POST /signin
//
router.post('/signin', [
  requestValidator('body', 'email', validateEmail),
  requestValidator('body', 'password', validatePassword),
  async function (req, res) {
    if (req.session.user) {
      return res.redirect('/');
    }
  
    if (req.validatorErrors) {
      res.flash('data', req.body);
      res.flash('dataErrors', req.validatorErrors);
      res.flash('alert', { type: 'error', message: req.translate('ERROR_INVALID_DATA_FORMAT') });
      return res.redirect('/signin');
    }

    var user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.flash('data', req.body);
      res.flash('alert', { type: 'error', message: req.translate('ERROR_EMAIL_OR_PASSWORD') });
      return res.redirect('/signin');
    }

    var passwordIsValid = user.validPassword(req.body.password);
    if (!passwordIsValid) {
      res.flash('data', req.body);
      res.flash('alert', { type: 'error', message: req.translate('ERROR_EMAIL_OR_PASSWORD') });
      return res.redirect('/signin');
    }

    req.session.user = user;
    res.redirect('/');
  }
]);

module.exports = router;