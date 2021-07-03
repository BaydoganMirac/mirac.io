const colyseus = require("colyseus");
const http = require("http");
const express = require("express");
const { MyRoom } = require("./room");
const port = process.env.port || 80;
const oda1 =  MyRoom;
const app = express();
app.use(express.json());
app.use(express.static('public'));

const gameServer = new colyseus.Server({
  server: http.createServer(app)
});
gameServer.define('oda1', oda1)


gameServer.listen(port);
