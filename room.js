const colyseus = require('colyseus');
const schema = require('@colyseus/schema');
const Player = class Player extends schema.Schema {
  constructor(options) {
        super();
        this.x = options.opt.x;
        this.y = options.opt.y;
        this.r = options.opt.r;
        this.color = options.opt.color;
        this.area = Math.PI * this.r * this.r;
        this.id = options.key;
        this.name = options.opt.name;
    }
  
}
schema.defineTypes(Player, {
    x: "number",
    y: "number",
    r: "number",
    color: 'string',
    area : "number",
    id: "string",
    name : "string"
});
const Bots = class Bots extends schema.Schema {
    constructor(options) {
          super();
          this.x = options.x;
          this.y = options.y;
          this.r = options.r;
          this.color = "#e100ff";
          this.area = Math.PI * this.r * this.r;
    }
    
  }
  schema.defineTypes(Bots, {
      x: "number",
      y: "number",
      r: "number",
      color: 'string',
      area : "number",
  });
  
const State = class State extends schema.Schema {
  constructor() {
      super();
      this.players = new schema.MapSchema();
      this.bots = new schema.MapSchema();
  }
}

schema.defineTypes(State, {
  players: { map: Player },
  bots : {map : Bots }
});
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is exclusive and the minimum is inclusive
}
var user = null;
exports.MyRoom = class extends colyseus.Room { 
    onCreate(options){

        this.setState(new State());
        this.setSimulationInterval((deltaTime) => this.update(deltaTime));
        for(var i = 0; i < 50; i++ ){
            let bot = new Bots({x:getRandomInt(-1920, 1920), y:getRandomInt(-1080, 1080), r:getRandomInt(1, 4)});
            this.state.bots.set(i,bot)
        }

    }
    update (deltaTime) {
        this.broadcast('stateUpdate','STATE GUNCELLE LAN')
        this.broadcast('stateTime', this.state.players)
    } 
    onJoin(client, options){
        console.log(client.sessionId, "joined");
        user = new Player({opt:options, key: client.sessionId});
        console.log(JSON.stringify(user))
        this.state.players.set(client.sessionId, user);
        this.broadcast('userInfo', this.state.players);
        this.onMessage('myPosition', (client,message)=>{
            this.state.players.$items.forEach(key => {
                if(key.id === client.sessionId){
                    key.x = message.x;
                    key.y = message.y;
                    key.r = message.r;
                }
            });
        })
        this.broadcast('botsStatus', this.state.bots)
        this.onMessage('botDelete', (client, message) =>{
            this.state.bots.$items.forEach((item, index) => {
                if(index === message){
                    item.x = Math.random() * (1920 - (-1920) + 1) + -(1920);
                    item.y = Math.random() * (1080 - (-1080) + 1) + (-1080);
                    item.r = getRandomInt(1, 4)
                }
                
            });
            this.broadcast('botUpdate', this.state.bots)
        })
        this.onMessage('userDead', (client, message) =>{
            this.state.players.$items[message.id].delete()
        })
    }

    onLeave (client, consented) {
        if (this.state.players.has(client.sessionId)) {
            this.broadcast('userLeft', client, {except: true})
            this.state.players.delete(client.sessionId);
        }
      }
}