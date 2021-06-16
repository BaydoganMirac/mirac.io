
let TOP  =  [];
let ME;
let zoom = 1;

function Top(x,y,r, color){
    this.pos = createVector(x, y);
    this.r = r;
    this.color = color;
    this.area = PI * this.r * this.r;
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

    this.move = function(){
        let goVector = createVector(mouseX - width / 2, mouseY - height / 2);
        goVector.div(50);
        goVector.limit(3);
        this.vector.lerp(goVector, 0.2);
        this.pos.add(this.vector)
    }
}

window.onload = async function(){
let client =  new Colyseus.Client('ws://localhost:3000');
const MyRoom = await client.joinOrCreate("oda1", {
    name: "mirac"
  });
console.log(MyRoom.sessionId, "joined", MyRoom.name);
MyRoom.onMessage('welcome', (message) =>{
    console.log(message)
});
MyRoom.send('myState', {
    pos: ME.pos,
    r: ME.r,
    color: ME.color
})
MyRoom.onMessage('clientStateBroadcast', (message)=>{
    console.log(message)
})
}
function setup(){
    createCanvas(windowWidth,windowHeight);

    for(let i = 0; i < 100; i++){
        let top = new Top(random(-window.innerWidth, window.innerWidth), random(-window.innerHeight, window.innerHeight), random(5, 10),  color(random(0, 254), random(0, 254),random(0, 254)));
        TOP.push(top)
    }
    ME = new Top(windowWidth/2, windowHeight/2, 11, color(255,255,255))

    
}

function draw(){
    background(0)
    translate(windowWidth/2, windowHeight/2)
    let Nzoom = 99 / ME.r;
    zoom = lerp(zoom, Nzoom, 0.01);
    scale(zoom)
    translate(-ME.pos.x, -ME.pos.y)
    
    for(let i = TOP.length-1; i >= 0; i--){
        TOP[i].show();
        if(ME.eat(TOP[i])){
            TOP.splice(i, 1)
        }
    }
    if(TOP.length < 100){
        TOP.push(new Top(random(-window.innerWidth, window.innerWidth), random(-window.innerHeight, window.innerHeight), random(5, 10),  color(random(0, 254), random(0, 254),random(0, 254))))
    }
   
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

