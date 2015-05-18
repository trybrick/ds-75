var express = require('express'),
    path = require('path'),
    request = require('request'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    fs = require('fs'),
    url = require('url');
    
var config = require('./asset/config.json');
var servicePath = path.join(__dirname, 'asset');
var apps = {};

function startServer(chainId) {
  var app = express();
  apps[chainId] = app;
  
  // Configuration
  app.set('views', path.join(servicePath, chainId, 'views'));
  app.engine('html', require('ejs').renderFile);
  app.use('/proxy', function (req, res) {
    var newUrl = config.GsnApiUrl + req.url.replace('/proxy', '');
    req.pipe(request({ uri: newUrl, method: req.method })).pipe(res);
  });

  app.use(methodOverride());
  app.use('/asset', express.static(servicePath));

  app.get('*', function (request, response) {
    var myPath = url.parse(request.url).pathname.toLowerCase();
    if (myPath.length <= 2)
      myPath = path.join(chainId, "index.html");
     console.log(myPath);
    if (myPath.indexOf('.') > 0 && myPath.indexOf('.aspx') < 0) {
      
      var fullPath = path.join(servicePath, myPath);
      if (!fs.existsSync(fullPath)) {
        response.status(404).send(fullPath + ' not found.');
        return;
      }

      response.sendFile(fullPath);
    }
  });

  
  // Start server
  var port = 3000 + parseInt(chainId);
  app.listen(port, function() {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });
}

// skip first two arguments
if (process.argv.length <= 2) {
  console.log('\n\nError: chain id(s) are required.\n');
  console.log('Example: \n node ' + path.basename(__filename) + ' chainId1 chainId2 chainId3 ...');
  console.log('\n');
}
else {
  process.argv.forEach(function (val, index, array) {
    // skip first two arguments
    if (index > 1)
    {  
      startServer(val);
    }
  });
}
