'use strict';

const bodyParser = require('body-parser');
const EventEmitter = require('events');
const express = require('express');
const http = require('http');
//const zlib = require("zlib");
const snappy = require('snappy')
const app = express();

const PORT = 8500

app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname+'/public')); 
const server = http.createServer(app);

const Stream = new EventEmitter(); 
Stream.on("dbreplic", (metric, data) => {
	console.log(`Replication Metrics: ${JSON.stringify(metric)} in Timescale DB`)
});

app.post('/dbreplic', (req, res) => {

    let body = [];

    req.on('error', (err) => {
        console.error(err);
      }).on('data', (chunk) => {
        body.push(chunk);
      }).on('end', () => {
        /*  
        body = Buffer.concat(body).toString();    
        console.log(body)
        console.log('==========================')
        const decoded = snappy.uncompressSync(body)
        console.log(decoded.toString())
        */
            
        snappy.uncompress(Buffer.concat(body), { asBuffer: false }, (err, original) => {
            if (err) console.error('Error:', err)
            else console.log('String:', original)
        })

      });
    /*
    req.body.map((metric) => {
        Stream.emit("dbreplic", metric.labels, metric);
     
    })
    */
	res.sendStatus(200);
});

server.listen(PORT, (err) => {
    if (err) {
        throw new Error(err);
    }
    console.log("Timescale DB replication adapter now running on port", server.address());
});