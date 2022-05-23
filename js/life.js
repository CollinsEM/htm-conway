const showState = false;
const showCount = false;
const doReport = true;

class GameOfLife {
  constructor(dom, nR, nC, info) {
    this.state = new Uint8Array(nR*nC);
    this.count = new Uint8Array(nR*nC);
    this.nRows = nR;
    this.nCols = nC;
    this.dom = dom || domSeq;
    this.info = info || domInfo;
    if (showState) {
      // Construct an output table for the node states
      this.stateTable = document.createElement('table');
      this.dom.appendChild(this.stateTable);
      this.td1 = new Array(nR);
      for (let r=0; r<nR; ++r) {
        const tr1 = document.createElement('tr');
        this.stateTable.appendChild(tr1);
        this.td1[r] = new Array(nC);
        for (let c=0; c<nC; ++c) {
          this.td1[r][c] = document.createElement('td');
          tr1.appendChild(this.td1[r][c]);
        }
      }
    }
    if (showCount) {
      // Construct an output table for the neighbor counts
      this.countTable = document.createElement('table');
      this.dom.appendChild(this.countTable);
      this.td2 = new Array(nR);
      for (let r=0; r<nR; ++r) {
        const tr2 = document.createElement('tr');
        this.countTable.appendChild(tr2);
        this.td2[r] = new Array(nC);
        for (let c=0; c<nC; ++c) {
          this.td2[r][c] = document.createElement('td');
          tr2.appendChild(this.td2[r][c]);
        }
      }
    }
    if (doReport) {
      this.alive = 0;
      this.dead = 0;
      this.births = 0;
      this.deaths = 0;
      this.reportTable = document.createElement('table');
      this.info.appendChild(this.reportTable);
      this.td3 = new Array(4);
      const lbls = ['Alive', 'Dead', 'Births', 'Deaths'];
      for (let r=0; r<4; ++r) {
        const tr3 = document.createElement('tr');
        this.reportTable.appendChild(tr3);
        const td = document.createElement('td');
        td.innerText = lbls[r];
        tr3.appendChild(td);
        this.td3[r] = document.createElement('td');
        this.td3[r].innerText = '0';
        tr3.appendChild(this.td3[r]);
      }
    }
    this.initState();
    this.updateCount();
    if (doReport) this.report();
  }
  // Render the state of the board
  render() {
    if (showState) this.renderState();
    if (showCount) this.renderCount();
  }
  // Update the state of the board
  update() {
    this.updateState();
    this.updateCount();
    if (doReport) this.report();
  }
  renderState() {
    const nR = this.nRows;
    const nC = this.nCols;
    let nod = 0;
    for (let r=0; r<nR; ++r) {
      for (let c=0; c<nC; ++c) {
        if (this.state[nod] == 1) {
          this.td1[r][c].innerText = '@';
          // this.td1[r][c].style.color = 'white';
          // this.td1[r][c].style.background = 'white';
        }
        else {
          this.td1[r][c].innerText = '.';
          // this.td1[r][c].style.color = 'black';
          // this.td1[r][c].style.background = 'black';
        }
        ++nod;
      }
    }
  }
  renderCount() {
    const nR = this.nRows;
    const nC = this.nCols;
    let nod = 0;
    for (let r=0; r<nR; ++r) {
      for (let c=0; c<nC; ++c) {
        this.td2[r][c].innerText = this.count[nod].toString();
      }
    }
  }
  updateCount() {
    this.alive = 0;
    this.dead = 0;
    const nR = this.nRows;
    const nC = this.nCols;
    let nod = 0;
    for (let r=0; r<nR; ++r) {
      for (let c=0; c<nC; ++c) {
        // Init to -1 if current cell is alive to remove its
        // contribution from the count below.
        if (this.state[nod] == 1) this.alive++;
        else this.dead++;
        this.count[nod] = -this.state[nod];
        for (let i=-1; i<2; ++i) {
          for (let j=-1; j<2; ++j) {
            const idx = ((r+nR+i)%nR)*nC + (c+nC+j)%nC;
            this.count[nod] += this.state[idx];
          }
        }
        if (showCount) this.td2[r][c].innerText = this.count[nod];
        ++nod;
      }
    }
  }
  updateState() {
    this.births = 0;
    this.deaths = 0;
    const nR = this.nRows;
    const nC = this.nCols;
    let nod = 0;
    for (let r=0; r<nR; ++r) {
      for (let c=0; c<nC; ++c) {
        if (this.state[nod] == 0) {   // if the node is currently dead
          if (this.count[nod] == 3) { // and has three living neighbors
            this.state[nod] = 1;      // then spawn a new living node
            // this.td1[r][c].innerText = '@';
            // this.td1[r][c].style.background = 'white';
            this.births++; // console.log("birth");
          }
        }
        else {                        // if the node is currently alive
          if (this.count[nod] < 2 ||  // and is lonely
              this.count[nod] > 3) {  // or crowded
            this.state[nod] = 0;      // then the node dies
            // this.td1[r][c].innerText = '.';
            // this.td1[r][c].style.background = 'black';
            this.deaths++; // console.log("death");
          }
        }
        ++nod;
      }
    }
  }
  report() {
    // console.log("Alive: %d, Dead: %d, Births: %d, Deaths: %d",
    //             this.alive, this.dead, this.births, this.deaths);
    this.td3[0].innerText = this.alive.toString();
    this.td3[1].innerText = this.dead.toString();
    this.td3[2].innerText = this.births.toString();
    this.td3[3].innerText = this.deaths.toString();
  }
  initState() {
    const nR = this.nRows;
    const nC = this.nCols;
    let nod=0;
    for (let r=0; r<nR; ++r) {
      for (let c=0; c<nC; ++c) {
        this.state[nod] = (Math.random() > 0.9 ? 1 : 0);
        if (showState) {
          if (this.state[nod] == 1) {
            this.td1[r][c].innerText = '@';
            // this.td1[r][c].style.background = 'white';
          }
          else {
            this.td1[r][c].innerText = '.';
            // this.td1[r][c].style.background = 'black';
          }
        }
        ++nod;
      }
    }
  }
};
