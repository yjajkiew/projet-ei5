// Requesting needed modules
var http = require('http');
var url = require('url');
var util = require('util');		// timestamped log

// Server Configuration
var server = http.createServer(
	function(req, res) {

		// parse the request URL
		var requestUrl = url.parse(req.url).pathname;	// ".pathname" return only the path after the domaine name
		
		// handle the request
		if(requestUrl != "/favicon.ico"){

			// log the request
			util.log("Incoming request : " + requestUrl);

			// send to the parser
		}

		// send answer
		res.writeHead(200, {"Content-Type": "text/html"});
		res.write('OK');
		res.end();
	}
);

// Launch HTTP server on port 8080
server.listen(8080);