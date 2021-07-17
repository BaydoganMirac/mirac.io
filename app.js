const colyseus = require("colyseus");
const http = require("http");
const express = require("express");
const { MyRoom } = require("./room");
const port = process.env.port || 27015;
const oda1 =  MyRoom;
const oda2 = MyRoom;
const app = express();
app.use(express.json());
app.use(express.static('public'));

const gameServer = new colyseus.Server({
  server: http.createServer(app)
});
gameServer.define('oda1', oda1, {maxClients: 8})
gameServer.define('oda2', oda2, {maxClients: 8})


app.get('/', (req, res)=>{
  res.sendFile('./public/index.html')
})
gameServer.listen(port);
console.log(port, 'Çalışmaya Başladı')
