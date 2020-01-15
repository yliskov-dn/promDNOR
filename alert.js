'use strict';

const bodyParser = require('body-parser');
const EventEmitter = require('events');
const express = require('express');
const http = require('http');
const app = express();

const PORT = 8100

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname+'/public')); 
const server = http.createServer(app);

const Stream = new EventEmitter(); 
Stream.on("updateUI", (alert, data) => {
	console.log(`Alert FIRING: ${JSON.stringify(alert)} update UI`)
});
Stream.on("logELK", (alert, data) => {
	console.log(`Alert FIRING: ${JSON.stringify(alert)} log ELK`)
});

app.post('/api/v1/alerts', (req, res) => {
    console.log(req.body);
    req.body.map((alert) => {
        Stream.emit("updateUI", alert.labels, alert);
        Stream.emit("logELK"  , alert.labels, alert);       
    })
	res.sendStatus(200);
});

server.listen(PORT, (err) => {
    if (err) {
        throw new Error(err);
    }
    console.log("Alert Manager now running on port", server.address());
});