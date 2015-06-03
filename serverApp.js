var express = require('express'),
    path = require('path'),
    request = require('request'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    fs = require('fs'),
    gulp = require('gulp'),
    url = require('url');
    
var servicePath = __dirname;
var apps = {};

function startServer(chainId) {
  var app = express();
  apps[chainId] = app;

  gulp.src('asset/' + chainId + '/*.*').pipe(gulp.dest('.', { overwrite: true }));

  // make sure that asset folder access are static file 
  app.use('/', express.static(servicePath));

  // handle the rest as html
  app.get('*', function (request, response) {
    var myPath = url.parse(request.url).pathname.toLowerCase();
    if (myPath.length <= 2 || myPath.indexOf('.') < 0)
      myPath = path.join('asset', chainId, "index.html");
    else 
      myPath = path.join('asset', chainId, myPath);
    
    console.log(myPath);

    if (myPath.indexOf('.') > 0 && myPath.indexOf('.aspx') < 0) {
      
      var fullPath = path.join(servicePath, myPath);
      if (!fs.existsSync(fullPath)) {
        response.status(404).send(fullPath + ' not found.');
        return;
      }

      var k = fs.readFileSync(fullPath, 'utf8');
      response.send(k.replace(/\?nocache=[^'"]+/gi, "?nocache=" + (new Date().getTime())));
      //response.sendFile(fullPath);
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
