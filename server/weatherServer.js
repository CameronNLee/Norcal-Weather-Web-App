"use strict";

const express = require('express');
const http = require('http');
const APIrequest = require('request');
const APIkey = "78b2b473ac33f10c8b07fb26657b5bc5";
// let url = "https://api.openweathermap.org/data/2.5/forecast/hourly?q=Davis,CA,US&units=imperial&APPID=" + APIkey;
const url = "https://api.openweathermap.org/data/2.5/forecast/hourly?appid=" + APIkey;
const port = 51490;


// An object containing the data expressing the query to the OpenWeather API.
// Below, gets stringified and put into the body of an HTTP PUT request.
// This object holds these properties at declaration. Calls to queryHandler
// will modify the q property to get weather info for different locations.
let requestObject = {
    "units": "imperial",
    "q": ["Davis,CA,US"]
};



let options = {
    url: url,
    method: "POST",
    headers: {"content-type": "application/json"},
    // will turn the given object into JSON
    json: requestObject
};

function queryHandler(req, res, next) {
    let qObj = req.query;
    console.log(qObj.json);
    if (qObj.location != undefined) {
        // replaces requestObject's q property with the one inside the input box.
        options.json.q = [qObj.location];
        weatherAPI(res);
    } else {
        next();
    }
}

function weatherAPI (res) {
    APIrequest(options, APIcallback);

    function APIcallback (err, APIresHead, APIresBody) {
        if ((err) || (APIresHead.statusCode != 200)) {
            // API is not working
            console.log("Got API error");
            console.log(APIresBody);
        }
        else {
            if (APIresHead.error) {
                // API worked but is not giving you data
                console.log(APIresHead.error);
            }
            else {
                console.log("JSON was:");
                console.log(JSON.stringify(APIresBody, undefined, 2));
                // print it out as a string, nicely formatted
                res.json(APIresBody);
            }
        }
    }
}

function fileNotFound(req, res) {
    let url = req.url;
    res.type('text/plain');
    res.status(404);
    res.send('Cannot find '+url);
}

// put together the server pipeline
const app = express();
app.use(express.static('public'));  // can I find a static file?
app.get('/', (req, res) => res.send('Moment of truth!'));
app.get('/weather', queryHandler);   // if not, is it a valid query?
app.use( fileNotFound );            // otherwise not found
// app.listen(port, function (){console.log('Listening on port ') + port;} );

const ngrok = require('ngrok');
const server = app.listen(port, async function (){
    console.log('Express Listening at ', port);

    const urlNgrok = await ngrok.connect({
        proto : 'http',
        addr : port,
    });
    console.log('Tunnel Created -> ', urlNgrok);
});