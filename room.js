const colyseus = require('colyseus');
const schema = require('@colyseus/schema');
const Player = class Player extends schema.Schema {
  constructor(options) {
        super();
        this.x = options.opt.x;
        this.y = options.opt.y;
        this.r = options.opt.r;
        this.color = JSON.stringify(options.opt.color);
        this.area = Math.PI * this.r * this.r;
        this.id = options.key;
    }
  
}
schema.defineTypes(Player, {
    x: "number",
    y: "number",
    r: "number",
    color: 'string',
    area : "number",
    id: "string",
});

const State = class State extends schema.Schema {
  constructor() {
      super();
      this.players = new schema.MapSchema();
  }
}

schema.defineTypes(State, {
  players: { map: Player }
});

var user = null;
exports.MyRoom = class extends colyseus.Room { 
    onCreate(options){
        this.setState(new State());
        this.onMessage('myPosition', (client,message)=>{
            this.state.players.$items.forEach(key => {
                if(key.id === client.sessionId){
                    key.x = message.x;
                    key.y = message.y;
                    key.r = message.r;
                }
            });
        })
    }

    onJoin(client, options){
        console.log(client.sessionId, "joined");
        user = new Player({opt:options, key: client.sessionId});
        console.log(JSON.stringify(user))
        this.state.players.set(client.sessionId, user);
        this.broadcast('userInfo', this.state.players);
    }

    onLeave(client){
        console.log(client.sessionId, "left!");
        this.broadcast('userLeft', client, {except:true})
        console.log(this.state.players.$items.delete(client.sessionId))
    }
    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }
}