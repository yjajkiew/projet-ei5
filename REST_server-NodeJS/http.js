var http = require('http');

var server = http.createServer(

	function(req, res) {
	  res.writeHead(200);
	  res.end('Bienvenue les Men In Black !');
	  console.log('Request : ' + req.url);
	}
);

server.listen(8080);