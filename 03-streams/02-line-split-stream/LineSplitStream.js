const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  lines = '';

  constructor(options) {
    super(options);

    this.encoding = options.encoding;
  }

  _transform(chunk, encoding, callback) {
    this.lines += chunk.toString(this.encoding);
    
    const linesArr = this.lines.split(os.EOL);
    const lastLineIndex = linesArr.length - 1;

    linesArr.forEach((line, index) => {
      index === lastLineIndex ? this.lines = line : this.push(line);
    });

    callback();
  }

  _flush(callback) {
    this.push(this.lines);
    this.lines = '';

    callback();
  }
}

module.exports = LineSplitStream;
