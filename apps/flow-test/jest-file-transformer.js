const path = require('path')

module.exports = {
  process(src, filename, _options) {
    return `module.exports = ${JSON.stringify(path.basename(filename))};`
  },
}
