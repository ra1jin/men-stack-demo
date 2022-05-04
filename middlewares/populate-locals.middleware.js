var appRoot = require('app-root-path');
var config = require(appRoot + '/config');

// -----------------------------------------------------------------------------------------------------

module.exports = function (req, res, next) {
  res.locals._user = req.session.user;
  res.locals._currentTheme = req.session.currentTheme || config.get('defaultTheme');
  res.locals._defaultAvatar = config.get('defaultAvatar');
  res.locals._url = req.url;
  next();
}