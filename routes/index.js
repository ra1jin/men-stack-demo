var appRoot = require('app-root-path');
var config = require(appRoot + '/config');
var express = require('express');
var router = express.Router();

var flash = require(appRoot + '/lib/flash/flash');
var translator = require(appRoot + '/lib/translator/translator');

var populateLocals = require(appRoot + '/middlewares/populate-locals.middleware');
var loadLanguage = require(appRoot + '/middlewares/load-language.middleware');
var errors = require(appRoot + '/middlewares/errors.middleware');

var healthCheckRoute = require(appRoot + '/routes/health-check.route');
var aboutusRoute = require(appRoot + '/routes/aboutus.route');
var chlangRoute = require(appRoot + '/routes/chlang.route');
var chthemeRoute = require(appRoot + '/routes/chtheme.route');
var homeRoute = require(appRoot + '/routes/home.route');
var eventListRoute = require(appRoot + '/routes/event-list.route');
var eventNewRoute = require(appRoot + '/routes/event-new.route');
var eventEditRoute = require(appRoot + '/routes/event-edit.route');
var forgotPasswordRoute = require(appRoot + '/routes/forgot-password.route');
var logoutRoute = require(appRoot + '/routes/logout.route');
var memberProfileRoute = require(appRoot + '/routes/member-profile.route');
var memberSettingsRoute = require(appRoot + '/routes/member-settings.route');
var membersRoute = require(appRoot + '/routes/members.route');
var resetPasswordRoute = require(appRoot + '/routes/reset-password.route');
var signinRoute = require(appRoot + '/routes/signin.route');
var signupRoute = require(appRoot + '/routes/signup.route');
var notFoundRoute = require(appRoot + '/routes/not-found.route');

// -----------------------------------------------------------------------------------------------------

// Middlewares begin
router.use(populateLocals);
router.use(flash);
router.use(translator(createTranslatorOptions()));
router.use(loadLanguage);

// Routes
router.use(aboutusRoute);
router.use(chlangRoute); 
router.use(chthemeRoute);
router.use(healthCheckRoute);
router.use(homeRoute);
router.use(eventListRoute);
router.use(eventNewRoute);
router.use(eventEditRoute);
router.use(forgotPasswordRoute);
router.use(memberProfileRoute);
router.use(memberSettingsRoute);
router.use(logoutRoute);
router.use(membersRoute);
router.use(resetPasswordRoute);
router.use(signinRoute);  
router.use(signupRoute);
router.use(notFoundRoute);

// Middlewares end
router.use(errors);

module.exports = router;

// -----------------------------------------------------------------------------------------------------

function createTranslatorOptions() {
  var translations = {};
  for (var lang of config.get('langs')) {
    translations[lang.name] = require(lang.file);
  }

  return {
    translations: translations,
    defaultLanguage: config.get('defaultLanguage')
  };
}