var appRoot = require('app-root-path');
var config = require(appRoot + '/config');
var express = require('express');
var multer = require('multer');
var router = express.Router();
var fs = require('fs');

var User = require(appRoot + '/models/user.model');
var authGuard = require(appRoot + '/lib/auth-guard/auth-guard');
var requestValidator = require(appRoot + '/lib/request-validator/request-validator');
var validateUsername = require(appRoot + '/validations/username.validate');
var validateClass = require(appRoot + '/validations/class.validate');
var validateBirthYear = require(appRoot + '/validations/birthyear.validate');
var validatePassword = require(appRoot + '/validations/password.validate');
var validatePasswordConfirm = require(appRoot + '/validations/password-confirm.validate');

// -----------------------------------------------------------------------------------------------------

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.get('uploads.profile.image.dest'))
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.jpg')
  }
});

var upload = multer({ storage: storage });

// -----------------------------------------------------------------------------------------------------

//
// GET /settings
//
router.get('/settings', [
  authGuard([{ role: 'MEMBER' }]),
  async function (req, res) {
    var me = await User.findById(req.session.user._id).exec();
    if (!me) {
      res.status(403);
      return res.render('forbidden');
    }

    if (res.locals.flash && res.locals.flash.data) {
      Object.assign(me, res.locals.flash.data);
    }

    res.render('member-settings', {
      me: me
    });
  }
]);

//
// POST /settings/profile
//
router.post('/settings/profile', [
  authGuard([{ role: 'MEMBER' }]),
  requestValidator('body', 'username', validateUsername),
  requestValidator('body', 'class', validateClass),
  requestValidator('body', 'birthYear', validateBirthYear),
  async function (req, res, next) {
    var me = await User.findById(req.session.user._id).exec();

    if (req.validatorErrors) {
      res.flash('data', req.body);
      res.flash('dataErrors', req.validatorErrors);
      res.flash('alert', { type: 'error', message: req.translate('ERROR_INVALID_DATA_FORMAT') });
      return res.redirect('/settings');
    }

    if (req.body.username != req.session.user.username && await User.findOne({ username: req.body.username })) {
      res.flash('data', req.body);
      res.flash('alert', { type: 'error', message: req.translate('ERROR_USERNAME_ALREADY_EXIST') });
      return res.redirect('/settings');
    }

    try {
      me.username = req.body.username;
      me.bio = req.body.bio;
      me.skills = req.body.skills;
      me.birthYear = req.body.birthYear;
      me.class = (req.body.class == '') ? undefined : req.body.class;
      req.session.user = me;
      await me.save();
    }
    catch (err) {
      return next(err);
    }

    res.flash('alert', { type: 'success', message: req.translate('MEMBER_SETTINGS.PROFIL_CHANGED_ALERT') });
    res.redirect('/settings');
  }
]);

//
// POST /settings/chavatar
//
router.post('/settings/chavatar', [
  authGuard([{ role: 'MEMBER' }]),
  upload.single('avatar'),
  async function (req, res, next) {
    var me = await User.findById(req.session.user._id).exec();

    try {
      var oldAvatarFile = 'public/' + me.avatar;
      var newAvatarFile = req.file.path;

      fs.unlink(oldAvatarFile, async function () {
        me.avatar = newAvatarFile.slice(6, newAvatarFile.length);
        req.session.user.avatar = me.avatar;

        await req.session.save();
        await me.save();        
      });
    }
    catch (err) {
      return next(err);
    }

    res.flash('alert', { type: 'success', message: req.translate('MEMBER_SETTINGS.AVATAR_CHANGED_ALERT') });
    res.redirect('/settings');
  }
]);

//
// POST /settings/chpasswd
//
router.post('/settings/chpasswd', [
  authGuard([{ role: 'MEMBER' }]),
  requestValidator('body', 'password', validatePassword),
  requestValidator('body', 'newPassword', validatePassword),
  requestValidator('body', 'newPasswordConfirm', validatePasswordConfirm('body.newPassword')),
  async function (req, res, next) {
    var me = await User.findById(req.session.user._id).exec();

    if (req.validatorErrors) {
      res.flash('dataErrors', req.validatorErrors);
      res.flash('alert', { type: 'error', message: req.translate('ERROR_INVALID_DATA_FORMAT') });
      return res.redirect('/settings');
    }

    if (!me.validPassword(req.body.password)) {
      res.flash('alert', { type: 'error', message: req.translate('ERROR_BAD_PASSWORD') });
      return res.redirect('/settings');
    }

    try {
      me.password = req.body.newPassword;
      await me.save();
    }
    catch (err) {
      return next(err);
    }

    res.flash('alert', { type: 'success', message: req.translate('MEMBER_SETTINGS.PASSWORD_CHANGED_ALERT') });
    res.redirect('/settings');
  }
]);

module.exports = router;