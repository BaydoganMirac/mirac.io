const colyseus = require('colyseus');

class MyRoom extends colyseus.Room {
    // When room is initialized
    onCreate (options) { 
        this.onMessage('myState', (client, message) =>{
            client.userData = message;
            console.log(client.userData)
            client.broadcast('clientStateBroadcast', client.userData)

        })
    }

    // When client successfully join the room
    onJoin (client, options) { 
        console.log(client.sessionId + ' Girdi')
        client.send('welcome', 'Hoşgeldin' + client.name)
    }


    // When a client leaves the room
    onLeave (client, consented) {
        console.log(client.sessionId + ' Arkasına Bakmadan Gitti.')
     }

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose () { }
}
module.exports =  {MyRoom};