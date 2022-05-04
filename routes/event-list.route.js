var appRoot = require('app-root-path');
var express = require('express');
var router = express.Router();
var _ = require('lodash');

var Event = require(appRoot + '/models/event.model');
var authGuard = require(appRoot + '/lib/auth-guard/auth-guard');
var requestValidator = require(appRoot + '/lib/request-validator/request-validator');
var validateObjectId = require(appRoot + '/validations/object-id.validate');

// -----------------------------------------------------------------------------------------------------

//
// GET /event-list
//
router.get('/event-list', [
  async function (req, res) {
    var events = await Event.find({}).sort({startDatetime: 1}).populate('author').populate('contributors').exec();
  
    if (req.query.states) {
      var states = [];
      states = req.query.states.split('|');
      if (states.length > 0) {
        events = _.filter(events, function(event) { return states.indexOf(event.getState()) != -1 });
      }
    }

    res.render('event-list', {
      events: events
    });
  }
]);

//
// POST /event-list/subscribe
//
router.post('/event-list/subscribe', [
  authGuard([{ role: 'MEMBER' }]),
  requestValidator('body', 'idEvent', validateObjectId),
  async function (req, res) {
    var event = await Event.findById(req.body.idEvent);
    if (!event) {
      res.flash('alert', { type: 'error', message: req.translate('ERROR_EVENT_NOT_EXIST') });
      return res.redirect('/event-list');
    }

    if (event.isFreezed()) {
      res.flash('alert', { type: 'error', message: req.translate('ERROR_EVENT_FREEZE') });
      return res.redirect('/event-list');
    }

    if (event.isSubscriber(req.session.user) || event.isOwner(req.session.user)) {
      res.flash('alert', { type: 'error', message: req.translate('ERROR_EVENT_ALREADY_JOINED') });
      return res.redirect('/event-list');
    }

    event.contributors.push(req.session.user);
    await event.save();

    res.flash('alert', { type: 'success', message: req.translate('EVENT_LIST.EVENT_SUBSCRIBED_ALERT') });
    return res.redirect('/event-list');
  }
]);

//
// POST /event-list/unsubscribe
//
router.post('/event-list/unsubscribe', [
  authGuard([{ role: 'MEMBER' }]),
  requestValidator('body', 'idEvent', validateObjectId),
  async function (req, res) {
    var event = await Event.findById(req.body.idEvent);
    if (!event) {
      res.flash('alert', { type: 'error', message: req.translate('ERROR_EVENT_NOT_EXIST') });
      return res.redirect('/event-list');
    }

    if (event.isFreezed()) {
      res.flash('alert', { type: 'error', message: req.translate('ERROR_EVENT_FREEZE') });
      return res.redirect('/event-list');
    }

    if (event.isOwner(req.session.user)) {
      res.flash('alert', { type: 'error', message: req.translate('ERROR_EVENT_OWNER_CANNOT_LEAVE') });
      return res.redirect('/event-list');
    }

    if (!event.isSubscriber(req.session.user)) {
      res.flash('alert', { type: 'error', message: req.translate('ERROR_EVENT_NOT_ALREADY_JOINED') });
      return res.redirect('/event-list');
    }

    event.contributors.splice(event.contributors.indexOf(req.session.user._id), 1);
    await event.save();

    res.flash('alert', { type: 'success', message: req.translate('EVENT_LIST.EVENT_UNSUBSCRIBED_ALERT') });
    return res.redirect('/event-list');
  }
]);

//
// POST /event-list/delete
//
router.post('/event-list/delete', [
  authGuard([{ role: 'member' }]),
  requestValidator('body', 'idEvent', validateObjectId),
  async function (req, res) {
    var event = await Event.findById(req.body.idEvent);
    if (!event) {
      res.flash('alert', { type: 'error', message: req.translate('ERROR_EVENT_NOT_EXIST') });
      return res.redirect('/event-list');
    }

    if (!event.isOwner(req.session.user)) {
      res.status(403);
      return res.render('forbidden');
    }
  
    if (event.isFreezed()) {
      res.flash('alert', { type: 'error', message: req.translate('ERROR_EVENT_FREEZE') });
      return res.redirect('/event-list');
    }

    await event.remove();

    res.flash('alert', { type: 'success', message: req.translate('EVENT_LIST.EVENT_REMOVED_ALERT') });
    return res.redirect('/event-list');
  }
]);

module.exports = router;