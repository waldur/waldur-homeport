var express = require('express'),
  url = require('url'),
  endpointMocks = require('./mocks.json'),
  app = express();

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8002');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'x-requested-with, content-type, accept, origin, authorization, x-csrftoken, user-agent, accept-encoding');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Expose-Headers', 'x-result-count, Link');

  next();
};
app.use(allowCrossDomain);

app.set('port', 3011);

app.all('*', handleGet);

// one polymorphic method to avoid multiple handling with OPTIONS etc
function handleGet(req, res) {
  var url_parts = url.parse(req.url, true);
  var endpoint = url_parts.path.split('?')[0];
  var vms = ["/api/azure-virtualmachines/"];
  var applications = [];
  if (endpoint in endpointMocks) {
    if (['POST', 'PUT'].indexOf(req.method) > -1) {
      req.on('data', function(chunk) {
        var entityName = JSON.parse(chunk).name,
          endpointName = "/add"+endpoint;
        if (entityName) {
          endpointMocks[endpointName].name = entityName;
        }
        if (vms.indexOf(endpoint) > -1 || applications.indexOf(endpoint) > -1) {
          endpoint = "/api/resources/";
        }
        if (endpointMocks[endpoint].push) {
          endpointMocks[endpoint].push(endpointMocks[endpointName]);
        }
      });
    }
    res.send(endpointMocks[endpoint]);
  } else {
    res.send(null);
  }
}

module.exports = app.listen(app.get('port'), function() {
  console.log('Starting tests..');
});
