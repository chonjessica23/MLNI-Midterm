console.log('ml5 version:', ml5.version);

let cam;
let img;
let bodypix;
let segmentation;
let rain = [];
let bee;
let beeImg;
let beehiveImg;
let bird;
let birdImg;
let leftHandStatus;
let rightHandStatus;
let leftHandWinter;
let rightHandWinter;
let treeImg;
let tree;
//clouds opacity
let a;

//sky colors
let r;
let g;
let b;

let r6;
let g6;
let b6;
//grass
let r2;
let g2;
let b2;
//sun/face
let r3;
let g3;
let b3;
//arms
let r5;
let g5;
let b5;
//snow/rain color1
let r7;
let g7;
let b7;
//tree
let r8;
let g8;
let b8;
let opacity;
//hand area average variables
let scaling = 2;
let handRX = 0;
let handRY = 0;
let handLX = 0;
let handLY = 0;
let faceX = 0;
let faceY = 0;

const options = {
  outputStride: 16, // 8, 16, or 32, default is 16
  segmentationThreshold: 0.5, // 0 - 1, defaults to 0.5
}

function setup() {
  createCanvas(640, 480);

  img = createImage(width/scaling, height/scaling);
  cam = createCapture(cam);
  cam.size(width/scaling, height/scaling); // 160 x 120
  cam.elt.muted = true;
  // cam.hide();
  bodypix = ml5.bodyPix(cam, modelReady);

  //images for project
  birdImg = loadImage('images/bird.png');
  beehiveImg = loadImage('images/beehive.png');
  beeImg = loadImage('images/nobee.png');
  treeImg = loadImage('images/tree.png');

  bird = new Bird();
}

function draw() {
  //hands are not present
  leftHandStatus = true;
  rightHandStatus = true;
  //arms are not crossed
  leftHandWinter = false;
  rightHandWinter = false;

  tree = false;

  //sunrise function
  var color1 = color(r, g, b);
  var color2 = color(r6, g6, b6);
  sunrise(0, 0, width, height, color1, color2, "Y");

  function sunrise(x, y, w, h, c1, c2, axis) {
    noFill();
    for (let i = y; i <= y+h; i++) {
      var inter = map(i, y, y+h, 0, 1);
      var c = lerpColor(c1, c2, inter);
      stroke(c);
      line(x, i, x+w, i);
    }
  }

  //grass background
  noStroke();
  fill(r2,g2,b2);
  rect(0, 350, windowWidth, 130);
  //realistic tree picture
  fill(r8, g8, b8, opacity);
  ellipse(150,200,200,140);
  ellipse(150,250,250,100);
  image(treeImg, 50, 120, 200, 260);
  //show bee hive image
  beehiveImg.resize(50,50);
  image(beehiveImg, 50, 150);

  //cloud opacity
  a = 200;
  //sky colors
  r=102;
  g=178;
  b=255;

  r6=82;
  g6=231;
  b6=247;
  //grass color
  r2=66;
  g2=210;
  b2=30;
  //sun/face color
  r3=255;
  g3=255;
  b3=0;
  //rain color
  r7=51;
  g7=153;
  b7=255;
  //tree color
  r8=0;
  g8=243;
  b8=0;
  opacity= 255;

  if (segmentation !== undefined) {
    let w = segmentation.raw.width;
    let h = segmentation.raw.height;
    let data = segmentation.raw.data;

    //variables for average area of hands
    let sumX = 0;
    let sumY = 0;
    let sumXface = 0;
    let sumYface = 0;
    let avgX = 0;
    let avgY = 0;
    let countRight = 0;
    let countLeft = 0;
    let countFace = 0;

    img.loadPixels();
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let index = x + y*w; // ***

        if (data[index] == 0 || data[index] == 1) { //face
          if (x < width/8) {
            //make sunset when race is on left side of screen
            r=0;
            g=0;
            b=153;
            r6=204;
            g6=51;
            b6=0;
            //grass
            r2=0;
            g2=102;
            b2=0;
          } else if (x > width/2.5) {
            //make sunrise when race is on right side of screen
            r=42;
            g=146;
            b=172;
            r6=255;
            g6=153;
            b6=51;
            //grass
            r2=102;
            g2=204;
            b2=0;
          } else if (x > width/8 && x < width/2.5){
            //make middle area blue sky
            r=102;
            g=178;
            b=255;
            r6=82;
            g6=231;
            b6=247;
          }
          //average for left hand
          sumXface += x;
          sumYface += y;
          countFace++;
        } else if (data[index] == 20) { //leftlower arm back
          //make arm brown
          img.pixels[index*4 + 0] = 154;
          img.pixels[index*4 + 1] = 99;
          img.pixels[index*4 + 2] = 25;
          img.pixels[index*4 + 3] = 255;
        } else if (data[index] == 23) { // left hand
          //make left hand green
          img.pixels[index*4 + 0] = 0;
          img.pixels[index*4 + 1] = 243;
          img.pixels[index*4 + 2] = 0;
          img.pixels[index*4 + 3] = 255;
          //clouds disappear
          a = 0;
          //make rain stop
          leftHandStatus = false;
          //activate winter functions
          if (x < width/4) {
            leftHandWinter = true;
            leftHandStatus = true;
          }
          //average for left hand
          sumX += x;
          sumY += y;
          countLeft++;
          //make bird come to hand
          tree = true;
        } else if (data[index] == 16) { //rightlower arm back
          //make right arm gray
          img.pixels[index*4 + 0] = 255;
          img.pixels[index*4 + 1] = 255;
          img.pixels[index*4 + 2] = 255;
          img.pixels[index*4 + 3] = 100;
        } else if (data[index] == 21) { //right hand
          //make right hand opque white
          img.pixels[index*4 + 0] = 255;
          img.pixels[index*4 + 1] = 255;
          img.pixels[index*4 + 2] = 255;
          img.pixels[index*4 + 3] = 100;
          //stop Rain
          rightHandStatus = false;
          //activate winter function
          if (x > width/4) {
            rightHandWinter = true;
            rightHandStatus = true;
          }
          //get avg of right hand
          sumX += x;
          sumY += y;
          countRight++;
          //clouds disappear
          a = 0;
        } else {
          // everything else doesn't show
          img.pixels[index*4 + 0] = 0;
          img.pixels[index*4 + 1] = 0;
          img.pixels[index*4 + 2] = 0;
          img.pixels[index*4 + 3] = 0;
        }
      }
    }

    img.updatePixels();

    //average area for face
    if (countFace > 0) {
      avgX = sumXface / countFace;
      avgY = sumYface / countFace;
      faceX = avgX * scaling;
      faceY = avgY * scaling;

      console.log('face');

      fill(255,255,0);
      ellipse(faceX,faceY,150,150);
    }

    //average area for right hand
    if (countRight > 0) {
      avgX = sumX / countRight;
      avgY = sumY / countRight;
      handRX = avgX * scaling;
      handRY = avgY * scaling;

      //if your hand is near the bee hive, bee hive disappears
      if (handRX < 100 && handRY < 200) {
        console.log('hi');
        fill(0,243,0);
        ellipse(80,180,50,70);
      }
      beeImg.resize(50,50);
      image(beeImg, handRX, handRY);
    }

    //left hand average area
    if (countLeft > 0) {
      avgX = sumX / countLeft;
      avgY = sumY / countLeft;
      handLX = avgX * scaling;
      handLY = avgY * scaling;
    }
  }

  //if your arm is not present, let bird move randomly
  //else if make the bird follow the average area of your left hand
  if (tree == false) {
    bird.moveBird();
  } else if (tree == true) {
    bird.moveBirdTree(handLX, handLY);
    // console.log('hey');
  }

  //if both hands are crossed across the chest, then it's winter
  if (leftHandWinter == true && rightHandWinter == true) {
    //cloud opacity
    a = 200;
    //grass color to snow
    r2=255;
    g2=255;
    b2=255;
    //rain to snow
    r7=250;
    g7=250;
    b7=250;
    //tree has no leaves
    opacity = 0;
  }

  image(img, 0, 0, width, height);

  //make it rain if there are no hands up on the screen
  if (leftHandStatus == true && rightHandStatus == true){
    rain.push( new Rain(random(width), 0) );

    for (let r of rain) {
      r.fall(0.1);
      r.move();
      r.display();
      r.updateLifespan();
    }
    for (let i = rain.length-1; i >= 0; i--) {
      if (rain[i].isDone) {
        rain.splice(i, 1);
      }
    }
  }

  //show Bird
  bird.displayBird();
  bird.edgesBird();
  //average area of left hand's position
  fill(255,0,0);
  ellipse(handLX, handLY, 10, 10);

  //make clouds
  fill(242,242,242,a);
  ellipse(40,0,400,100);
  ellipse(500,0,400,100);
  fill(253,253,253,a);
  ellipse(300,0,400,100);
}

class Rain {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.xSpd = 0;
    this.ySpd = 0;
    this.rad = random(1, 3);
    this.lifespan = 1.0;
    this.lifeReduction = random(0.001, 0.005);
    this.isDone = false;
  }
  move() {
    this.x += this.xSpd;
    this.y += this.ySpd;
  }
  fall(gravity) {
    this.ySpd += gravity;
  }
  updateLifespan() {
    if (this.lifespan > 0) {
      this.lifespan -= this.lifeReduction;
    } else {
      this.lifespan == 0;
      this.isDone = true;
    }
  }
  display() {
    push();
    noStroke();
    fill(r7, g7, b7);
    ellipse(this.x, this.y, this.rad*2, this. rad*2);
    pop();
  }
}

// bodypix functions
function modelReady() {
  console.log('Model Ready!');
  bodypix.segmentWithParts(gotResults, options);
}
function gotResults(error, result) {
  if (error) {
    console.log(error);
    return;
  }
  segmentation = result;
  bodypix.segmentWithParts(gotResults, options);
  //console.log(frameCount);
}

//Bird
class Bird {
  constructor() {
    this.x = random(width/2);
    this.y = random(height/2);
    this.xSpd = random(-2, 2);
    this.ySpd = random(-2, 2);
    //this.nestX = handLX;
    //this.nestY = handLY;
    this.speed = 1;
  }
  moveBird() {
    this.x += this.xSpd;
    this.y += this.ySpd;
    console.log('no');
  }
  moveBirdTree(x, y) {
    this.x = lerp(this.x, x, 0.03);
    this.y = lerp(this.y, y, 0.03);
    console.log('whatusp');
  }
  edgesBird() {
    if (this.x < 0 || this.x > width) {
      this.xSpd = -this.xSpd;
    }
    if (this.y < 0 || this.y > height/2) {
      this.ySpd = -this.ySpd;
    }
  }
  displayBird() {
    birdImg.resize(95,70);
    image(birdImg, this.x, this.y);
  }
}
