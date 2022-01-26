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
    case 'DELETE':
      if (pathname.includes('/')) {
        res.statusCode = 400;
        res.end("400");

        return;
      }

      fs.promises.access(filepath, fs.constants.R_OK | fs.constants.W_OK)
        .then(() => {
          fs.unlink(filepath, (error) => {
            if (error) {
              res.statusCode = 500;
              res.end('Server error.');
            }
            res.statusCode = 200;
            res.end('Deleted!');
          });
        })
        .catch(() => {
          res.statusCode = 404;
          res.end('File not exists.');
        });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
