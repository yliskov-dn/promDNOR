'use strict';

const EventEmitter = require('events');
const express = require('express');
const http = require('http');
const app = express();
const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;


const PORT = 9500 //process.env.PORT;

app.use(express.static(__dirname+'/public')); 
const server = http.createServer(app);

var template = 
`<!DOCTYPE html> <html> <body>
	<script type="text/javascript">
		var source = new EventSource("/metrics/3000");
		source.onmessage = function(e) {
			document.body.innerHTML += e.data + "<br>";
		};
	</script>
</body> </html>`;

app.get('/', function (req, res) {
	res.send(template); // <- Return the static template above
});

let clientId = 0;
let clients = {}; // <- Keep a map of attached clients

const Stream = new EventEmitter(); 
Stream.on("push", (id, data) => {
	//console.log(`Client ID: ${id}`)
	//clients[id].res.write("data: " + JSON.stringify(data) + "\n\n");
	clients[id].res.write(data);
});

function scapeMetric(interval) {
    return setInterval(() => {
		collectDefaultMetrics(process.memoryUsage());
        for (clientId in clients) {
            Stream.emit("push", clientId, client.register.metrics());
        };
    }, interval);
}

// Called once for each new client. Note, this response is left open!

app.get('/metrics', (req, res) => {

	collectDefaultMetrics(process.memoryUsage());
	res.set('Content-Type', client.register.contentType);
	res.end(client.register.metrics());	
});

app.get('/metrics/:interval', (req, res) => {
	//req.socket.setTimeout(Number.MAX_VALUE);
	res.writeHead(200, {
		'Content-Type': 'text/event-stream', // <- Important headers
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive'
	});
	res.write('\n');
	(function (clientId) {
        clients[clientId] = { 
            res : res, // <- Add this client to those we consider "attached"
            tid : scapeMetric(req.params.interval)
        }
		req.on("close", function () {
            clearInterval(clients[clientId].tid)
			delete clients[clientId]
		}); // <- Remove this client when he disconnects
	})(++clientId)

});

server.listen(PORT, (err) => {
    if (err) {
        throw new Error(err);
    }

    console.log("Target SSE now running on port", server.address());
});
