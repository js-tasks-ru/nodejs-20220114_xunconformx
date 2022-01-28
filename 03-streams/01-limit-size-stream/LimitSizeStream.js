const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  size = 0;

  constructor(options) {
    super(options);

    const {
      limit,
      encoding = 'utf-8'
    } = options;

    this.limit = limit;
    this.encoding = encoding;
  }

  _transform(chunk, encoding, callback) {
    this.size += Buffer.byteLength(chunk, this.encoding);

    if (this.size > this.limit) {
      callback(new LimitExceededError());

      return;
    }

    callback(null, chunk);
  }
}

module.exports = LimitSizeStream;