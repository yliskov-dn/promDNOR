'use strict';

const bodyParser = require('body-parser');
const EventEmitter = require('events');
const express = require('express');
const http = require('http');
const app = express();

const {Docker} = require('node-docker-api'); 
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

const PORT = 9900

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname+'/public')); 
const server = http.createServer(app);

const Stream = new EventEmitter(); 
Stream.on("srm", (cmd, data) => {
    console.log(`SRM Command: ${cmd} => ${JSON.stringify(data)} `)
    docker.container.create({
        Image: 'prom/prometheus',
        name: 'dnor_srm'
      }) 
        .then((container) => cmd == 'start' ? container.start() : 
                             cmd == 'stop' ? container.stop() : 
                             cmd == 'restart' ? container.restart() : 
                             console.warn(`Unknow command: ${cmd}`))
        .catch((error) => console.error(error))    
});
Stream.on("target", (cmd, data) => {
	console.log(`Target Command: ${cmd} => ${JSON.stringify(data)}`)
});

app.post('/srm/:cmd', (req, res) => {
    console.log(req.body);
    Stream.emit("srm"  , req.params.cmd, req.body.config);       
	res.sendStatus(200);
});
app.post('/target/:cmd', (req, res) => {
    console.log(req.body);
    Stream.emit("target"  , req.params.cmd, req.body.config);       
	res.sendStatus(200);
});
app.get('/status', (req, res) => {
    res.end('SRM (up/down), Targets list');	
});

server.listen(PORT, (err) => {
    if (err) {
        throw new Error(err);
    }
    console.log("Alert Manager now running on port", server.address());
});