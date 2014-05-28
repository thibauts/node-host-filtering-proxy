host-filtering-proxy
====================
### A straightforward host filtering HTTP proxy

Spawns a light HTTP proxy that allows you to filter requests based on requested host. 

All you have to do is provide a callback that will receive the hostname and either accept or reject the request. 
Basic HTTP proxying as well as tunneling are supported. This means HTTPS requests are filterable too.

The code hasn't been extensively tested yet. Contributions are welcome.

Installation
------------

``` bash
$ npm install host-filtering-proxy
```

Examples
--------

``` javascript
var hfp = require('host-filtering-proxy');

var test = [
  'ad.doubleclick.net',
  'googleads.g.doubleclick.net',
  'ib.adnxs.com',
  'cdn.adnxs.com',
  'ad.turn.com',
  'cdn.turn.com'
];

var proxy = hfp.createProxy(function(host, reject) {
  if(test.indexOf(host) !== -1) {
    reject(true);
  } else {
    reject(false);
  }
})

proxy.listen(8888, '127.0.0.1');
```