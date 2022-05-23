/**
 * Cortical Agent
 */
class Agent {
  
  constructor(env, dom) {
    this.env = env || board;
    this.dom = dom || canvas;
    this.NI = this.env.nRows;
    this.NJ = this.env.nCols;
    // Initialize mini-columns
    this.cortex = Array.from(this.env.state, (v,i) => new Column(i,1,8));
    // Determine canvas size needed to render all columns
    this.dom.width = nCols*colSep;
    this.dom.height = nRows*rowSep;
    this.context = this.dom.getContext('2d');
  }
  // Update the internal state
  update() {
    // Encode the input base-pairs read from each sensor
    this.cortex.forEach((col,idx) => col.update());
  }
  // Generate encodings for the proximal inputs to each cortical column
  encode() {
    this.cortex.forEach((col,idx) => col.encode());
  }
  // Render the current state of the cortical columns
  render() {
    this.cortex.forEach((col,idx) => col.render());
  }
};
