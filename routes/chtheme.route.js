var appRoot = require('app-root-path');
var express = require('express');
var router = express.Router();
var config = require(appRoot + '/config');

// -----------------------------------------------------------------------------------------------------

//
// GET /chtheme
//
router.get('/chtheme', [
  async function (req, res) {  
    if (!req.query.theme || !req.query.redirectUrl) {
      return res.redirect('/');
    }

    if (config.get('themes').indexOf(req.query.theme) == -1) {
      return res.redirect('/');
    }
    
    req.session.currentTheme = req.query.theme;
    res.redirect(req.query.redirectUrl);
  }
]);

module.exports = router;