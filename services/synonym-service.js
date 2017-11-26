var synonyms = {}

module.exports.loadSynonyms = function (word, pos) {
  const WordNet = require('node-wordnet')
  var wordnet = new WordNet()
  const query = word.toLowerCase()
  return new Promise((resolve, reject) => {
    wordnet.lookup(query, results => {
      if (pos) {
        results = results.filter(entry => entry.pos === pos)
      }
      var synonyms = []
      results.forEach(word => synonyms = synonyms.concat(word.synonyms))
      synonyms = synonyms.filter((word, i, self) => word.toLowerCase() !== query && self.indexOf(word) === i)
      synonyms = synonyms.map(w => w.replace(/_/g, ' '))
      resolve(synonyms)
    })
  })
}

module.exports.fetchSynonyms = function (word) {
  if (Array.isArray(synonyms[word])) {
    return Promise.resolve(synonyms[word])
  }

  var request = require('request')
  const base = 'https://thesaurus.altervista.org/thesaurus/v1'
  const synKey = 'CQMMQFvjuOzTzfUzQCrz'
  const url = `${base}?key=${synKey}&language=en_US&output=json&word=${word}`

  return new Promise((resolve, reject) => {
    request(url, (error, response, body) => {
      if (error) {
        reject(error)
      } else {
        const synonymsJoined = JSON.parse(body).response.map(syn => syn.list.synonyms)
        synonyms[word] = []
        synonymsJoined.reduce((obj, group) => {
          group.split('|').forEach(w => {
            synonyms[word].push(w.toLowerCase().replace(' (similar term)', ''))
          })
        }, [])
        resolve(synonyms[word])
      }
    })
  })
}
