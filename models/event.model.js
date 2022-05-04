var appRoot = require('app-root-path');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');
var _ = require('lodash');

var Enums = require(appRoot + '/models/enums.model');

//--------------------------------------------------------------------------------------------

var eventSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  startDatetime: {
    type: Date,
    required: true,
    get: toMoment
  },
  endDatetime: {
    type: Date,
    required: true,
    get: toMoment
  },
  location: {
    type: String,
    lowercase: true,
    trim: true
  },
  description: {
    type: String
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  contributors: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  validated: {
    type: Boolean,
    default: false
  },
  created: {
    type: Date,
    default: Date.now,
    get: toMoment
  }
});

//
// HOOKS
//

//
// CUSTOM REPOSITORY METHODS
//
eventSchema.methods.getState = function () {
  var today = moment();
  var start = this.startDatetime;
  var end = this.endDatetime;

  if (start > today) {
    return Enums.States.ON_COMING;
  }
  else if (start < today && end > today) {
    return Enums.States.ON_GOING;
  }
  else {
    return Enums.States.ENDED;
  }
};

eventSchema.methods.isFreezed = function() {
  var state = this.getState();
  return (state == 'ON_GOING' || state == 'ENDED');
}

eventSchema.methods.isOwner = function (user) {
  if (typeof this.author === 'object') {
    return this.author._id == user._id;
  }
  else {
    this.author == user._id;
  }
};

eventSchema.methods.isSubscriber = function (user) {
  var found = _.findIndex(this.contributors, function (contributor) {
    if (typeof contributor === 'object') {
      return contributor._id == user._id;
    }
    else {
      return contributor == user._id;
    }
  });

  return found != -1;
}

eventSchema.methods.getTimeRemaining = function () {
  var today = moment();
  var diffSeconds = this.startDatetime.diff(today) / 1000;

  return {
    days: Math.floor(((diffSeconds / 60) / 60) / 24),
    hours: Math.floor(((diffSeconds / 60) / 60) % 24),
    minutes: Math.floor((diffSeconds / 60) % 60),
    seconds: Math.floor((diffSeconds % 60))
  }
}

//
// CUSTOM REPOSITORY STATICS
//

module.exports = mongoose.model('Event', eventSchema);

// -----------------------------------------------------------------------------------------------------

function toMoment(timestamp) {
  return moment(new Date(timestamp));
}