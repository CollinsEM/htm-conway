/**
 * Cortical mini-column representation
 *
 * Each mini-column posseses its own input space filter (i.e. pattern
 * of proximal dendrites sampling directly from the input layer).
 */
class MiniColumn {

  /**
   * @param C   Identifier for this mini-column within the TM of the 
   *            parent column.
   * @param NI  Number of nodes in this minicolumn
   * @param NJ  Number of nodes in the spatial pooler
   */
  constructor(C, NI, NJ) {
    this.C        = C;
    this.NI       = NI;
    this.NJ       = NJ;
    this.width    = colSep;
    this.height   = NI*rowSep;
    this.colState = 0;
    // Array of nodal activations
    this.activation = new Uint8Array(NI);
    // Array of nodal predictions
    this.prediction = new Uint8Array(NI);
    // Array of synapse permanences from spatial pooler nodes to all
    // nodes in this mini-column.
    //
    // NOTE: We begin with the identity transform. (Each SP node maps
    // to one mini-column.)
    this.proximal = new Uint8Array(NJ);
    for (var j=0; j<NJ; ++j) this.proximal[j] = (j==C ? 1 : 0);
    // Result of the current spatial pooler summation
    this.spSum = 0;
    this.targets = [];
    // Array of synapse permanences from other TM nodes to each node
    // in this mini-column.
    this.distal   = Array.from({length: NI}, (v,i) => [] );
  }
  updatePredictions(TM) {
    for (var i=0; i<this.NI; ++i) {
      var sum = 0;
      this.distal[i].forEach( function(seg) {
        sum += (seg.integrate(TM) > distalSynapseActivationThreshold ? 1 : 0)
      }, this);
      if (sum > 1) {
        this.prediction[i] = 1;
      }
    }
    this.numPredicted = this.prediction.reduce( (sum,val) => sum + (val>0?1:0), 0);
  }
  updatePerms(SP, TM) {
    this.spSum = SP.reduce((sum,val,idx) => sum + val*this.proximal[idx], 0);
    if (this.spSum > 0) { // Column was activated
      if (this.numPredicted == 0) { // No nodes were predicted
        // So we need to learn the context of this activation.
        // Collect the TM nodes that were active during the last iteration.
        var seg = new DistalSegment();
        TM.forEach( function(mc,j) {
          mc.activation.forEach( function(act,i) {
            if (act > 0) {
              seg.synapses.push(new DistalSynapse(i, j));
            }
          }, this);
        }, this);
        var idx = Math.floor(this.NI*Math.random());
        this.distal[idx].push(seg);
        // console.log(idx, seg, this.distal[idx]);
        var predict = seg.integrate(TM);
      }
      else {
        for (var i=0; i<this.NI; ++i) {
          if (this.prediction[i] > 0) {
            this.distal[i].forEach( function(seg,idx) {
              seg.updatePerm(+1);
            }, this);
          }
        }
      }
    }
    else {
      // Column was not activated
      if (this.numPredicted > 0) {
        // At least one node was predicted. If we want to enable
        // forgetting, we would begin to decrement permanences for
        // distal synapses here.
      }
    }
  }
  updateActivations(SP) {
    this.spSum = SP.reduce((sum,val,idx) => sum + val*this.proximal[idx], 0);
    if (this.spSum > 0) {
      // If this column gets activated, and there are nodes that were predicted,
      // reinforce distal segments as needed
      if (this.numPredicted > 0) {
        for (var i=0; i<this.NI; ++i) {
          if (this.prediction[i] > 0) {
            this.activation[i] = 1;
          }
        }
      }
      else {
        for (var i=0; i<this.NI; ++i) {
          this.activation[i] = 1;
        }
      }
    }
    else {
      for (var i=0; i<this.NI; ++i) {
        this.activation[i] = 0;
      }
    }
  }
  render(x0, y0) {
    var x = x0 + colSep/2;
    context.clearRect(x0, y0, this.width, this.height);
    for (var i=0, y=y0+rowSep/2; i<this.NI; ++i, y+=rowSep) {
      if (this.activation[i] == 0) { // Node is not active
        if (this.prediction[i] == 0) { // Node was not predicted
          context.beginPath();
          context.strokeStyle = 'gray';
          context.arc(x, y, R, 0, 2*Math.PI, true);
          context.stroke();
        }
        else { // Node was predicted but not activated
          context.beginPath();
          context.strokeStyle = 'blue';
          context.arc(x, y, R, 0, 2*Math.PI, true);
          context.stroke();
        }
      }
      else { // Node is active
        if (this.prediction[i] == 0) { // Node was not predicted
          context.beginPath();
          context.fillStyle = 'red';
          context.arc(x, y, R, 0, 2*Math.PI, true);
          context.fill();
        }
        else {
          context.beginPath();
          context.fillStyle = 'green';
          context.arc(x, y, R, 0, 2*Math.PI, true);
          context.fill();
        }
      }
    }
  }
};
