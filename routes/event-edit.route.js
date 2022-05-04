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
var validateObjectId = require(appRoot + '/validations/object-id.validate');

// -----------------------------------------------------------------------------------------------------

//
// GET /event-edit?idEvent=
//
router.get('/event-edit', [
  authGuard([{ role: 'MEMBER' }]),
  async function (req, res) {
    var event = await Event.findById(req.query.idEvent).exec();
    if (!event) {
      return res.redirect('/event-new');
    }

    if (event.author != req.session.user._id) {
      res.status(403);
      return res.render('forbidden');
    }

    if (res.locals.flash && res.locals.flash.data) {
      Object.assign(event, res.locals.flash.data);
    }

    res.render('event-edit', {
      event: event
    });
  }
]);

//
// POST /event-edit
//
router.post('/event-edit/', [
  authGuard([{ role: 'MEMBER' }]),
  requestValidator('body', 'idEvent', validateObjectId),
  requestValidator('body', 'title', validateEventTitle),
  requestValidator('body', 'startDatetime', validateEventStartDatetime),
  requestValidator('body', 'endDatetime', validateEventEndDatetime),
  requestValidator('body', 'location', validateEventLocation),
  async function (req, res, next) {
    if (req.validatorErrors) {
      res.flash('data', req.body);
      res.flash('dataErrors', req.validatorErrors);
      res.flash('alert', { type: 'error', message: req.translate('ERROR_INVALID_DATA_FORMAT') });
      return res.redirect('/event-edit?idEvent=' + req.body.idEvent);
    }

    var event = await Event.findById(req.body.idEvent).exec();
    if (!event) {
      return res.redirect('/event-new');
    }

    if (!event.isOwner(req.session.user)) {
      res.status(403);
      return res.render('forbidden');
    }

    try {
      event.title = req.body.title;
      event.startDatetime = req.body.startDatetime;
      event.endDatetime = req.body.endDatetime;
      event.location = req.body.location;
      event.description = req.body.description;
      await event.save();
    }
    catch (err) {
      return next(err);
    }

    res.flash('alert', { type: 'success', message: req.translate('EVENT_EDIT.SUCCESS_ALERT') });
    res.redirect('/event-list');
  }
]);

module.exports = router;

