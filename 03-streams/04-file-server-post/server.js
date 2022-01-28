const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST':
      const stream = fs.createWriteStream(filepath, {flags: 'wx'});
      const limitedStream = new LimitSizeStream({limit: 1000000});

      stream.on('error', (err) => {
        if (pathname.includes('/')) {
          res.statusCode = 400;
          res.end("400");

          return;
        }

        if (err.code === 'EEXIST') {
          res.statusCode = 409;
          res.end('File already exists.');

          return;
        }

        res.statusCode = 500;
        res.end('Server error.');
      });

      stream.on('finish', () => {
        res.statusCode = 201;
        res.end('Saved!');
      });

      limitedStream.on('error', (error) => {
        if (error.code === 'LIMIT_EXCEEDED') {
          res.statusCode = 413;
          res.end('File must be 1Mb at max.');
        } else {
          res.statusCode = 500;
          res.end('Server error.');
        }

        stream.destroy();

        fs.unlink(filepath, (err) => {
          if (err) throw err;
          console.log(`successfully deleted ${filepath}`);
        });
      });

      req.on("aborted", () => {
        limitedStream.destroy();
        stream.destroy();

        fs.unlink(filepath, (err) => {
          if (err) throw err;
          console.log(`successfully deleted ${filepath}`);
        });
      });

      req.pipe(limitedStream).pipe(stream);

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
