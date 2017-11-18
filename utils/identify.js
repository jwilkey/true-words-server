const name = require('./name').name.substring(14, 30)
exports.identify = function (req, res, next) {
  if (req.get('x-truewords-id') !== name) {
    res.send('You do not have permission to use this server')
  } else {
    next()
  }
}
