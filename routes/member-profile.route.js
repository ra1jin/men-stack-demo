var appRoot = require('app-root-path');
var express = require('express');
var router = express.Router();

var User = require(appRoot + '/models/user.model');

// -----------------------------------------------------------------------------------------------------

router.get('/profile/:username', async function (req, res) {
  var user = await User.findOne({ username: req.params.username }).exec();
  if (!user) {
    return res.render('not-found');
  }

  res.render('member-profile', {
    user: user
  });
});

module.exports = router;