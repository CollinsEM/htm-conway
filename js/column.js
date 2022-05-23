// Cortical column representation
class Column {
  constructor(idx, nMC, mcSize) {
    this.idx = idx;
    // Number of mini-columns in this column
    this.numMC  = nMC;
    // Number of neurons in each mini-column
    this.mcSize = mcSize;
    // Rough estimate for the size of the rendered column
    // this.width  = Math.max(nMC+1)*colSep;
    this.width  = colSep;
    this.height = rowSep;
    const nR = nRows;
    const nC = nCols;
    const r = this.row = parseInt(idx/nCols);
    const c = this.col = parseInt(idx%nCols);
    this.x0 = (c+0.5)*colSep;
    this.y0 = (r+0.5)*rowSep;
    this.adj = [ ];
    for (let i=-1; i<2; ++i) {
      for (let j=-1; j<2; ++j) {
        this.adj.push(((r+nR+i)%nR)*nC + (c+nC+j)%nC);
      }
    }
    this.SP = new Uint8Array(9);
    this.TM = Array.from({length: nMC},
                         (v,i) => new MiniColumn(i, mcSize, this.numSp));
  }
  // Generate a shift in the location of a sensor.  NOTE: For now this
  // is random, but eventually this should be directly generated from
  // the internal representation.
  getDelta() {
    // return Math.floor(Math.random()*3) - 1;
  }
  update() {
    // Update the spatial pooler (proximal input array)
    this.encode();
    // // Update the internal state
    // this.TM.forEach(function(mc,idx,TM) {
    //   mc.updatePredictions(this.TM);
    // }, this);
    // this.TM.forEach(function(mc,idx,TM) {
    //   mc.updatePerms(this.SP, this.TM);
    // }, this);
    // this.TM.forEach(function(mc,idx,TM) {
    //   mc.updateActivations(this.SP);
    // }, this);
  }
  // Encode new data
  encode() {
    // console.log(input, delta);
    this.adj.forEach( (nod,i) => {
      this.SP[i] = board.state[nod];
    }, this );
  }
  render() {
    // Render the spatial pooler
    const x1 = this.x0 - colSep/2;
    const x2 = this.x0 + colSep/2;
    const y1 = this.y0 - rowSep/2;
    const y2 = this.y0 + rowSep/2;
    context.clearRect(x1, y1, colSep, rowSep);
    const stroke = (this.SP[4] > 0 ? 'white' : 'gray');
    // var fill = (this.SP[4] > 0 ? 'blue' : 'black');
    var fill = 'black';
    renderNode(this.x0, this.y0, fill, stroke);
    // Render the temporal memory
    // var x2 = x0 + (this.width - colSep*this.TM.length)/2;
    // this.TM.forEach((v,i) => v.render(x2+i*colSep, 2*rowSep));
  }
};
