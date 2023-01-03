const express = require('express');
const bodyParser = require("body-parser");
const router = require('./router'); 
const http = require('http');
const app = express();
const port = 7210;

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PATCH, DELETE, OPTIONS"
      );
    next();
});


app.use(router);


const httpServer = http.createServer(app);
httpServer.listen(port);
console.log('backend server is listening in port ', port);


