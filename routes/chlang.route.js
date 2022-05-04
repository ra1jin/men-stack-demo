var express = require('express');
var router = express.Router();

// -----------------------------------------------------------------------------------------------------

//
// GET /chlang
//
router.get('/chlang', [
  async function (req, res) {  
    if (!req.query.language || !req.query.redirectUrl) {
      return res.redirect('/');
    }

    if (!req.isSupportedLanguage(req.query.language)) {
      return res.redirect('/');
    }
  
    req.session.currentLanguage = req.query.language;
    res.redirect(req.query.redirectUrl);
  }
]);

module.exports = router;