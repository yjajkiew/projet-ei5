var net = require('net');
var socket = new net.Socket();

socket.connect()
socket.on('error', function(err) {
  // err === "Error: getaddrinfo ENOENT"
  console.error('Error occurred: ' + err);
});

socket.connect(102, '192.168.2.3', function () {
	console.log("connected");
});