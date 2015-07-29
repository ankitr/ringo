var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var port = 3001;

app.use(bodyParser());


var servers = {};
var ids = [];
var currentServer = 0;

// We only have two servers at the moment

// Endpoint to serve the user so that it 
app.get('/get-server-url', function (req, res) {
	var numRegisteredServers = 0;
	for (var id in servers) {
		numRegisteredServers++;
	}

	console.log(numRegisteredServers);


	res.send(servers[ids[currentServer]]);

	currentServer++;
  	if (currentServer > numRegisteredServers) {
  		currentServer = 0;
  	}

});


// Register the server with the load balancer
app.post('/register-server', function (req, res) {
	if (req.body.tunnel) {
		if (req.body.server_id) {
			servers[req.body.server_id] = req.body.tunnel;

			if (ids.indexOf(req.body.server_id) == -1) { // basically, if it doesn't already exist
				ids.push(req.body.server_id);
			}
			

			console.log(servers);
			console.log(ids);
			res.send("Successfully registered server in the load balancer.");
		
		} else {
			res.send(500, "There was an error registering the server with the load balancer.");
		}
		
	} else {
		res.send(500, "There was an error registering the server with the load balancer.");
	}
});



var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});