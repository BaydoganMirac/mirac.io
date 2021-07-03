function Top(x,y,r, color, id){
    this.pos = createVector(x, y);
    this.r = r;
    this.color = color;
    this.area = PI * this.r * this.r;
    this.id = id;
    this.vector = createVector(0, 0);

    this.show = function(){
        fill(this.color);
        ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
    }

    this.eat = function(other){
        let touch = p5.Vector.dist(this.pos, other.pos);
        if(touch < this.r + other.r){
            this.r += Math.sqrt((this.r*this.r) + (other.r*other.r)) - this.r;
            return true;
        }else{
            return false;
        }
    }

    this.move = function() {
        var newvel = createVector(mouseX - innerWidth / 2, mouseY - innerHeight / 2);
        newvel.div(50);
        //newvel.setMag(3);
        newvel.limit(2);
        this.vector.lerp(newvel, 0.2);
        this.pos.add(this.vector);
    };
}


const client =  new Colyseus.Client('https://mirac-io.vercel.app/');
var ME = null;
var MyRoom;
let zoom = 1;
var TUSER = [];
async function setup(){
    createCanvas(1920,1080);
    ME = new Top(Math.random()*100, Math.random()*100, 10, color(255,255,255), client.id);
    MyRoom = await client.joinOrCreate("oda1", {x: ME.pos.x, y: ME.pos.y, r: ME.r,key:client.id, color: ME.color});
    MyRoom.onMessage('welcome', (message) =>{
        console.log(message)
    })
    console.log(ME.r)
    MyRoom.onMessage('userInfo', (message)=>{
        console.log(message)
        Object.keys(message).forEach(key => {
            if(key != client.id){
                TUSER.push(new Top(message[key].x, message[key].y, message[key].r, message[key].color, key))
                console.log('yeni Kullanıcı geldi')
            }
        });
    })
    MyRoom.state.players.onAdd = (player, key) => {
        console.log(player, "has been added at", key);
    
        // add your player entity to the game world!
    
        // If you want to track changes on a child object inside a map, this is a common pattern:
        player.onChange = function(changes) {
            changes.forEach(change => {
                console.log(change.field);
                console.log(change.value);
                console.log(change.previousValue);
            })
        };
    
        // force "onChange" to be called immediatelly
        player.triggerAll();
    };
    setInterval(() => {
        MyRoom.send('myPosition',{x: ME.pos.x, y: ME.pos.y, r: ME.r, color: ME.color, id:client.id} )
    }, 100);
    MyRoom.onStateChange((state) => {
        console.log(state)
    });
    MyRoom.onMessage('userLeft',(message) =>{
        TUSER.forEach((item, index) =>{
            if(item.id === message.sessionId){
                TUSER.splice(index,1)
            }
        })
    })
}


function draw(){
    background(0)
    translate(windowWidth/2, windowHeight/2)
    let Nzoom = 50 / ME.r;
    zoom = lerp(zoom, Nzoom, 0.01);
    scale(zoom)
    translate(-ME.pos.x, -ME.pos.y)
    TUSER.forEach((item, index)=>{
        item.show()
    })
    ME.show();
    ME.move() 
    fill(255,0,0);
    textSize(floor(ME.r));
    textAlign(CENTER, CENTER);
    text(floor(ME.r*2)-22, ME.pos.x-floor(ME.r/2), ME.pos.y+floor(ME.r/2))

}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
