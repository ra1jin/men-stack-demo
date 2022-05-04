var appRoot = require('app-root-path');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var moment = require('moment');

var Enums = require(appRoot + '/models/enums.model');

//--------------------------------------------------------------------------------------------

const userSchema = new Schema({
  username: {
    type: String,
    unique: 'Username already exists',
    required: 'Please fill in a username',
    lowercase: true,
    trim: true
  },
  email: {
    type: String,
    unique: 'Email already exists',
    lowercase: true,
    trim: true,
    default: ''
  },
  password: {
    type: String,
    default: ''
  },
  class: {
    type: String,
    enum: Object.values(Enums.Classes)
  },
  skills: {
    type: String
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String
  },
  birthYear: {
    type: Number
  },
  notificationEventEnabled: {
    type: Boolean,
    default: true
  },
  notificationPaperEnabled: {
    type: Boolean,
    default: true
  },
  roles: {
    type: [{
      type: String,
      enum: Object.values(Enums.Roles)
    }],
    default: ['MEMBER']
  },
  activated: {
    type: Boolean,
    default: false
  },
  created: {
    type: Date,
    default: Date.now,
    get: toMoment
  },
  resetPasswordExpire: {
    type: Number
  },
  resetPasswordToken: {
    type: String
  }
});

//
// HOOKS
//
userSchema.pre('save', function (next) {
  if (this.isModified('password')) {
    let password = this.get('password');
    this.set('password', encryptPassword(password));
  }

  next();
});

//
// CUSTOM REPOSITORY METHODS
//
userSchema.methods.toJSON = function () {
  var obj = this.toObject();
  delete obj.password;
  return obj;
};

userSchema.methods.setPassword = function (password) {
  this.password = encryptPassword(password);
};

userSchema.methods.validPassword = function (password) {
  return matchPassword(this.password, password);
};

userSchema.methods.hasRole = function (role) {
  return this.roles.indexOf(role) !== -1;
};

//
// CUSTOM REPOSITORY STATICS
//

module.exports = mongoose.model('User', userSchema);

// -----------------------------------------------------------------------------------------------------

function encryptPassword(password) {
  return bcrypt.hashSync(password, 8);
}

function matchPassword(encryptedPassword, givenPassword) {
  return bcrypt.compareSync(givenPassword, encryptedPassword);
}

function toMoment(timestamp) {
  return moment(new Date(timestamp));
}