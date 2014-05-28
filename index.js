var http  = require('http');
var net   = require('net');
var parse = require('url').parse;
var debug = require('debug')('host-filtering-proxy');

function createProxy(filter) {
  var proxy = http.createServer();

  proxy.on('connect', function(req, socket) {
    var tmp = req.url.split(':');
    var host = tmp[0];
    var port = tmp[1] || 80;

    filter(host, function(rejected) {
      
      if(rejected) {
        debug('rejected %s', host);
        socket.end();
      }
      else {
        debug('connect %s', host);
        var options = {
          host: host,
          port: port
        };

        var client = net.connect(options, function() {
          socket.write('HTTP/1.1 200 OK\r\n\r\n');
          socket.pipe(client).pipe(socket);
        });

        client.on('error', function(err) {
          socket.end();
        });
      }

    });
  });

  proxy.on('request', function(req, res) {
    var parsed = parse(req.url);
    var host = parsed.host;

    filter(host, function(rejected) {

      if(rejected) {
        debug('rejected %s', host);
        res.end();
      }
      else {
        debug('request %s', host);
        var headers = req.headers;

        if(headers['proxy-connection']) {
          headers['connection'] = headers['proxy-connection'];
          delete headers['proxy-connection'];
        }

        var options = {
          method: req.method,
          host: parsed.host,
          port: parsed.port,
          path: parsed.path,
          headers: headers
        };

        var clientRequest = http.request(options, function(clientResponse) {
          res.writeHead(clientResponse.statusCode, clientResponse.headers);
          clientResponse.pipe(res);
        });

        clientRequest.on('error', function(err) {
          res.end();
        });

        req.pipe(clientRequest);
      }

    });
  });

  return proxy;
}

module.exports.createProxy = createProxy;