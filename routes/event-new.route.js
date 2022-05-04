var appRoot = require('app-root-path');
var express = require('express');
var router = express.Router();

var Event = require(appRoot + '/models/event.model');
var authGuard = require(appRoot + '/lib/auth-guard/auth-guard');
var requestValidator = require(appRoot + '/lib/request-validator/request-validator');
var validateEventTitle = require(appRoot + '/validations/event-title.validate');
var validateEventStartDatetime = require(appRoot + '/validations/event-start-datetime.validate');
var validateEventEndDatetime = require(appRoot + '/validations/event-end-datetime.validate');
var validateEventLocation = require(appRoot + '/validations/event-location.validate');

// -----------------------------------------------------------------------------------------------------

//
// GET /event-new
//
router.get('/event-new', [
  authGuard([{ role: 'MEMBER' }]),
  function (req, res) {
    res.render('event-new');
  }
]);

//
// POST /event-new
//
router.post('/event-new', [
  authGuard([{ role: 'MEMBER' }]),
  requestValidator('body', 'title', validateEventTitle),
  requestValidator('body', 'startDatetime', validateEventStartDatetime),
  requestValidator('body', 'endDatetime', validateEventEndDatetime),
  requestValidator('body', 'location', validateEventLocation),
  async function (req, res, next) {
    if (req.validatorErrors) {
      res.flash('data', req.body);
      res.flash('dataErrors', req.validatorErrors);
      res.flash('alert', { type: 'error', message: req.translate('ERROR_INVALID_DATA_FORMAT') });
      return res.redirect('/event-new');
    }

    try {
      var event = new Event(req.body);
      event.author = req.session.user;
      event.contributors.push(req.session.user);
      await event.save();
    }
    catch (err) {
      return next(err);
    }

    res.redirect('/event-list');
  }
]);

module.exports = router;