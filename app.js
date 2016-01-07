var restify = require('restify'),
    fs = require('fs'),
    FamilySearch = require('familysearch-javascript-sdk');
 
var server = restify.createServer();
server.use(restify.acceptParser(server.acceptable));
server.use(restify.bodyParser());

// Force HTTPS
server.use(function(req, res, next){
  if(req.headers['x-forwarded-proto'] !== 'https'){
    res.redirect('https://' + req.headers.host.split(':')[0], next);
  } else {
    next();
  }
});
 
server.get('/', function(req, res, next){
  fs.readFile('index.html', function(err, file){
    res.end(file.toString());
    return next();  
  });
}); 
 
server.post('/token', function (req, res, next) {
  var error;
  if(!req.params.environment){
    error = 'Missing environment';
  }
  if(!req.params.devkey){
    error = 'Missing dev key' ;
  }
  if(!req.params.certificate){
    error = 'Missing certificate'; 
  }
  if(error){
    next(new restify.errors.BadRequestError(error));
  }
  
  var client = new FamilySearch({
    environment: req.params.environment,
    client_id: req.params.devkey
  });
  
  client.getAccessTokenWithClientCredentials(req.params.certificate).then(function(token){
    res.end(token);
  }).catch(function(error){
    next(error);
  });
  
});
 
server.listen(process.env.PORT, function () {
  console.log('%s listening at %s', server.name, server.url);
});