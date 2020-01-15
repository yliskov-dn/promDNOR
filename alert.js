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

app.post('/api/v1/alerts', (req, res) => {
    console.log(req.body);
	res.sendStatus(200);
});

server.listen(PORT, (err) => {
    if (err) {
        throw new Error(err);
    }
    console.log("Alert Manager now running on port", server.address());
});