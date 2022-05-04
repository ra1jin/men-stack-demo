var appRoot = require('app-root-path');
var express = require('express');
var router = express.Router();

var User = require(appRoot + '/models/user.model');

// -----------------------------------------------------------------------------------------------------

router.get('/members', async function (req, res) {
  var users = await User.find({}).exec();
  res.render('members', { users: users });
});

module.exports = router;