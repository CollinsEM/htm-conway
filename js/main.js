/**
   The gist of this experiment is to get some experience navigating a 2D
   data stream using one or more HTM columns. The specific example used
   here is navigating around Conway's "Game of Life".
   
   At the very minimum, we should be able to implement a grid cell module
   for keeping track of position relative to certain specific features.
*/
// Dimensions used to render nodes on the canvas
const R=10;
const colSep=3*R;
const rowSep=3*R;
// Size of the game board
let nRows = 20; //parseInt(window.height/rowSep);
let nCols = 40; //parseInt(window.width/colSep);
// Handles to the DOM elements displaying the game of life
var domInfo, domSeq, canvas, context;
// Handles to the principal objects in this simulation
var agent, board;

window.addEventListener('load', init);
window.addEventListener('click', onClick);

function init() {
  // Get a handle to the DOM element
  domInfo = document.getElementById('info');
  domSeq = document.getElementById('sequence');
  canvas = document.getElementById('canvas');
  context = canvas.getContext('2d');
  // console.log(canvas.width, canvas.height);
  // console.log(colSep, rowSep, R);
  // Fill the DOM element with Conway's game of life
  board = new GameOfLife(domSeq, nRows, nCols, domInfo);
  // Initialize the agent
  agent = new Agent(board, canvas);
  
  // Enter the main update loop
  update();
}

let animate = true;
function onClick() {
  animate = !animate;
  if (animate) update();
}

var numCycles = 0;
var numFrames = 0;
var framesPerCycle = 20;
function update() {
  if (animate) requestAnimationFrame(update);
  // setTimeout(update, 1000);
  if (numFrames == framesPerCycle) {
    numFrames = 0; // reset frame count
    numCycles++;   // update cycle count
    // Update board state
    board.update();
    // Render board state
    board.render();
    // Update the agent's internal state
    agent.encode();
    // Render agent state
    agent.render();
  }
  // Update number of frames rendered for the current cycle
  ++numFrames;
}

// function render() {
//   // Reset the default styles on all of the base pairs
//   for (let i=0; i<seqLength; ++i) {
//     var c = 0;
//     for (let j=0; j<numSensors; ++j) {
//       if (i >= start[j] && i<start[j]+sensorWidth) c += 64;
//     }
//     domSeq.children[i].style.backgroundColor = rgb(c,c,c).hexify();
//   }
//   // Update the appearance of the letters under the sensor
//   domEnc.innerHTML = "";
//   for (let i=0; i<numSensors; ++i) {
//     domEnc.innerHTML += "<p>" + agent.COLS[i].SP.toString() + "</p>";
//   }
//   // Render the internal state of the agent
//   var x0 = (canvas.width - agent.width)/2;
//   agent.render(x0, 0);
// }

class RGB {
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
  hexify() {
    var r = this.r.toString(16);
    var g = this.g.toString(16);
    var b = this.b.toString(16);
    if (r.length < 2) r = '0' + r;
    if (g.length < 2) g = '0' + g;
    if (b.length < 2) b = '0' + b;
    return `#${r}${g}${b}`;
  }
};

function rgb(r,g,b) { return new RGB(r,g,b); }

function renderNode(x, y, fill, stroke) {
  context.beginPath();
  context.strokeStyle = (stroke.r === undefined ? stroke : stroke);
  context.fillStyle   = (fill.r   === undefined ? fill   : fill);
  context.arc(x, y, R, 0, 2*Math.PI, true);
  context.fill();
  context.stroke();
}
