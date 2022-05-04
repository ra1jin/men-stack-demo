module.exports = function(req, res, next) {
  if (req.session.currentLanguage) {
    req.setLanguage(req.session.currentLanguage);
  }

  next();
}