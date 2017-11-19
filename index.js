const express = require('express')
const bodyParser = require('body-parser')
var cors = require('cors')

const app = express()
app.use(bodyParser.json())
const port = process.env.PORT || 3100

var whitelist = ['http://localhost:8484', 'https://search.truewordsapp.com']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
app.use(cors(corsOptions))

const u = require('./utils/identify')
app.all('*', u.identify)

app.get('/stem/:query', (req, res) => {
  const natural = require('natural')
  res.json({
    porter: natural.PorterStemmer.stem(req.params.query),
    lancaster: natural.LancasterStemmer.stem(req.params.query)
  })
})

app.get('/lemma/:query', (req, res) => {
  const WordNet = require('node-wordnet')
  var wordnet = new WordNet()
  wordnet.lookup(req.params.query, results => {
    res.json(results)
  })
})

app.get('/search/:query', (req, res) => {
  var request = require('request')
  const dbtKey = '35e9e596933f2fe297b2c5ad0632d484'
  const url = `http://dbt.io/text/search?v=2&key=${dbtKey}&query=${req.params.query}&dam_id=ENGESVN2ET&limit=1000`
  request(url, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      res.json(JSON.parse(body))
    } else {
      res.send(error)
    }
  })
})

app.post('/cross-reference', (req, res) => {
  var topics = Array.from(new Set(req.body.text.split(/[^a-zA-Z]+/)))
  const ignore = ['a', 'the', 'to', 'in', 'that']
  topics = topics.filter(t => !ignore.includes(t))

  const references = {}
  topics.forEach(t => {
    try {
      const file = require(`./topics/${t[0]}.json`)
      references[t] = file[t]
    } catch (e) { }
  })
  res.json(references)
})

app.get('/texts/:passages', (req, res) => {
  var request = require('request')
  const url = `https://IklW6N43QDF4FHWLFsks0djEFjAMMEKfLrtghpRu:X@bibles.org/v2/passages.js?version=eng-ESV&q[]=${req.params.passages}`
  request(url, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      res.json(JSON.parse(body))
    } else {
      res.send(error)
    }
  })
})

app.listen(port, () => console.log(`Listening on port ${port}`))
