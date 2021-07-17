function Top(x,y,r, color,name , id){
    this.pos = createVector(x, y);
    this.r = r;
    this.color = color;
    this.area = PI * this.r * this.r;
    this.id = id;
    this.vector = createVector(0, 0);
    this.name = name;

    this.show = function(){
        fill(this.color);
        ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
        fill(255,0,0);
        textSize(floor(this.r/2));
        textAlign(CENTER, CENTER);
        text(this.name, this.pos.x-floor(this.r/2), this.pos.y+floor(this.r/2))
    }
    
    this.eat = function(other){
        let touch = p5.Vector.dist(this.pos, other.pos);
        if(touch < this.r + other.r){
            this.r += (Math.sqrt((this.r*this.r) + (other.r*other.r)) - this.r)/4;
            return true;
        }else{
            return false;
        }
    }

    this.userEat = function(other, room){
        let touch =  p5.Vector.dist(this.pos, other.pos);
        if(touch < this.r + other.r){
            if(this.r == other.r){
                return false;
            }else{
                if(this.r < other.r){
                    room.leave()
                    fill(255,255,255);
                    textSize(30);
                    textAlign(CENTER, CENTER);
                    text('ÖLDÜN ÇIK',this.pos.x, this.pos.y)
                    this.move = null;
                    window.location.reload()
                }else{
                    this.r += (Math.sqrt((this.r*this.r) + (other.r*other.r)) - this.r)/4; 
                }
            }
        }else{
            return false;
        }
    }

    this.move = function() {
        var newvel = createVector(mouseX - innerWidth / 2, mouseY - innerHeight / 2);
        newvel.div(30);
        //newvel.setMag(3);
        newvel.limit(2);
        this.vector.lerp(newvel, 0.01);
        this.pos.add(this.vector);
    };
}


const client =  new Colyseus.Client('ws://185.114.21.219:27015');
var ME = null;
var myColor = localStorage.getItem('color') === null ? '#ffffff' : localStorage.getItem('color'); 
var myName = localStorage.getItem('nickname') === null ? 'Misafir'+ Math.random()*100 : localStorage.getItem('nickname'); 
var MyRoom;
let zoom = 1;
var TUSER = [];
var BOTS = [];
async function setup(){
    createCanvas(1920,1080);
    ME = new Top(Math.random()*10, Math.random()*10, 10, myColor, myName, client.id);
    MyRoom = await client.joinOrCreate("oda1", {x: ME.pos.x, y: ME.pos.y, r: ME.r, name:ME.name ,key:client.id, color: ME.color});
    ME.id = MyRoom.sessionId;
    MyRoom.onMessage('welcome', (message) =>{
        console.log(message)
    }) 
    MyRoom.onMessage('userInfo', (message)=>{
        Object.keys(message).forEach(key => {
            if(key != ME.id){
                TUSER.push(new Top(message[key].x, message[key].y, message[key].r, color(message[key].color), message[key].name ,key))
                console.log('yeni Kullanıcı geldi')
            }
        });
    })
    MyRoom.onMessage('stateUpdate', (message)=>{
        MyRoom.send('myPosition',{x: ME.pos.x, y: ME.pos.y, r: ME.r, color: ME.color, id:ME.id} )
    })
    MyRoom.onMessage('stateTime',(message) => {
        TUSER.forEach((userItem, userIndex) =>{
            Object.keys(message).forEach((key)=>{
                if(key != ME.id){
                    if(key === userItem.id){
                        userItem.pos.x = message[key].x;
                        userItem.pos.y = message[key].y;
                        userItem.r = message[key].r;
                   }
                }
            })
        })
    });
    MyRoom.onMessage('userLeft',(message) =>{
        TUSER.forEach((item, index) =>{
            if(item.id === message.sessionId){
                TUSER.splice(index,1)
            }
        })
    })
    MyRoom.onMessage('botsStatus', (message) =>{
        Object.keys(message).forEach((key)=>{
            BOTS.push(new Top(message[key].x, message[key].y, message[key].r, color(message[key].color), '',key))
        })
    })
    MyRoom.onMessage('botUpdate', (message) =>{
        BOTS.forEach((botItem, botIndex) =>{
            Object.keys(message).forEach((key)=>{
                    if(key == botIndex){
                        botItem.pos.x = message[key].x;
                        botItem.pos.y = message[key].y;
                        botItem.r = message[key].r;
                   }
            })
        })
    })
    MyRoom.onMessage('userRespawn', (message)=>{
        console.log(message.id)
        if(message.id == ME.id){
            alert('ÖLDÜNNNN')
            window.location.reload()
        }
    })
}


function draw(){
    background(0);
    translate(windowWidth/2, windowHeight/2)
    let Nzoom = 50 / ME.r;
    zoom = lerp(zoom, Nzoom, 0.01);
    scale(zoom)
    translate(-ME.pos.x, -ME.pos.y)
    TUSER.forEach((item, index)=>{
        if(item.id != ME.id){
            item.show()
            ME.userEat(item, MyRoom)
        }
    })
    BOTS.forEach((item,index)=>{
        item.show();
        if(ME.eat(item)){
            MyRoom.send('botDelete', index)
        }
    })
    
    ME.show()
    ME.move() 
  


}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
