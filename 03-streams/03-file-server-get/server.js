const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'GET':
      const stream = fs.createReadStream(filepath);

      stream.pipe(res);

      stream.on('error', (err) => {
        if (pathname.includes('/')) {
          res.statusCode = 400;
          res.end("400");
        } else if (err.code === "ENOENT") {
          res.statusCode = 404;
          res.end("File not found 404");
        } else {
          res.statusCode = 500;
          res.end("500");
        }
      });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
