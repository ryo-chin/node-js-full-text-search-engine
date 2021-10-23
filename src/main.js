const http = require('http');
const index = require('./indexer/index.js');
const search = require('./searcher/search.js');

const routing = {
  '/index': index,
  '/search': search,
};

const server = http.createServer();
server.on('request', (req, res) => {
  const route = routing[`${req.url}`];
  if (!route) {
    res.statusCode = 404;
    res.write('not found');
    res.end();
    return;
  }
  route(req, res);
  res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
  res.end();
});

server.listen('8080');
