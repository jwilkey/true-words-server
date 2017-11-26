const dbtKey = '35e9e596933f2fe297b2c5ad0632d484'

module.exports.search = function (query) {
  var request = require('request')
  const url = `http://dbt.io/text/search?v=2&key=${dbtKey}&query=${query}&dam_id=ENGESVN2ET&limit=1000`
  return new Promise((resolve, reject) => {
    request(url, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        resolve(JSON.parse(body))
      } else {
        reject(error)
      }
    })
  })
}
