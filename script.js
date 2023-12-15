// ui elements

const inputEl = document.getElementById("typeInput");
const countEl = document.getElementById("taps");
const tail1El = document.getElementById("tail1");
const tail4El = document.getElementById("tail4");
const tail8El = document.getElementById("tail8");
const tail16El = document.getElementById("tail16");
const tail32El = document.getElementById("tail32");
const clearEl = document.getElementById("clear");

// declare vals

let prev = 0;
let curr = 0;
let count = 0;
let average = 0;

let timer = 0;

const TAILS = {
  1: {
    i: 0,
    vals: new Array(1).fill(0),
    el: tail1El,
    progEl: document.getElementById("progress1"),
  },
  4: {
    i: 0,
    vals: new Array(4).fill(0),
    el: tail4El,
    progEl: document.getElementById("progress4"),
  },
  8: {
    i: 0,
    vals: new Array(8).fill(0),
    el: tail8El,
    progEl: document.getElementById("progress8"),
  },
  16: {
    i: 0,
    vals: new Array(16).fill(0),
    el: tail16El,
    progEl: document.getElementById("progress16"),
  },
  32: {
    i: 0,
    vals: new Array(32).fill(0),
    el: tail32El,
    progEl: document.getElementById("progress32"),
  },
};

// event listeners

window.addEventListener("load", () => {
  countEl.classList.add("pulse1");
});

inputEl.addEventListener("input", (e) => {
  e.preventDefault();
  if (prev === 0) prev = curr = Date.now();
  prev = curr;

  curr = Date.now();
  count++;
  if (count > 1) {
    updateTails(curr - prev);
  }
  countEl.innerText = count;
  countEl.classList.toggle("pulse1");
  countEl.classList.toggle("pulse2");
  inputEl.value = "";
  clearEl.disabled = false;
  timerReset();
  updateTailsProgress(count);
});

clearEl.addEventListener("click", init);

// fn defs

function init() {
  countEl.innerText = count = prev = curr = 0;
  clearEl.disabled = true;
  inputEl.focus();
  resetTails();
}

function updateTails(val) {
  for (const k in TAILS) {
    updateTail(k, val);
  }
  updateTailColors(Object.values(TAILS));
}

function updateTail(id, val) {
  const tail = TAILS[id];
  tail.vals[tail.i] = val;
  tail.i++;
  tail.i = tail.i === tail.vals.length ? 0 : tail.i;
  if (count < tail.vals.length) {
    return;
  } else {
    tail.el.innerText = round(toBpm(arrAvg(tail.vals)));
  }
}

function updateTailColors(tails) {
  // find the most coment amongst our BPMs
  const freqCounts = {};
  tails.map(getTailBpm).forEach((bpm) => {
    freqCounts[bpm] === undefined ? (freqCounts[bpm] = 1) : freqCounts[bpm]++;
  });
  const mostFreq = Math.max(...Object.values(freqCounts));
  let modeBpm = 0;
  if (mostFreq > 1) {
    for (let bpm in freqCounts) {
      if (freqCounts[bpm] === mostFreq) {
        modeBpm = Number(bpm);
      }
    }
  }
  // color current vals accordingly
  for (const t of tails) {
    const bpm = getTailBpm(t);
    if (bpm === 0) {
      continue;
    } else if (bpm === modeBpm) {
      setMid(t.el);
    } else if (bpm > modeBpm) {
      setFast(t.el);
    } else if (bpm < modeBpm) {
      setSlow(t.el);
    }
  }
}

function setMid(el) {
  el.classList.add("bg-mid");
  el.classList.remove("bg-slow");
  el.classList.remove("bg-fast");
}
function setFast(el) {
  el.classList.remove("bg-mid");
  el.classList.remove("bg-slow");
  el.classList.add("bg-fast");
}
function setSlow(el) {
  el.classList.remove("bg-mid");
  el.classList.add("bg-slow");
  el.classList.remove("bg-fast");
}

function getTailBpm(tail) {
  return Number(tail.el.innerText || "0");
}

function resetTails() {
  for (const k in TAILS) {
    resetTail(k);
  }
}

function resetTail(id) {
  const tail = TAILS[id];
  tail.vals.fill(0);
  tail.i = 0;
  tail.el.innerText = "";
  tail.progEl.style.width = "0%";
  tail.progEl.classList.remove("progressFull");
}

function toBpm(d) {
  return 60000 / d;
}

function arrAvg(arr) {
  return arr.reduce((t, n) => t + n, 0) / arr.length;
}

function round(n) {
  return Math.round(n);
}

function timerReset() {
  clearTimeout(timer);
  timer = setTimeout(init, 1000 * 30);
}

function updateTailProgress(count, prev, curr) {
  const el = TAILS[String(curr)].progEl;
  const p = round(((count - prev) / (curr - prev)) * 100);
  el.style.width = p + "%";
  if (p === 100) {
    el.classList.add("progressFull");
  }
}

function updateTailsProgress(c) {
  if (c === 1) {
    updateTailProgress(c, 0, 1);
  } else if (c <= 4) {
    updateTailProgress(c, 1, 4);
  } else if (c <= 8) {
    updateTailProgress(c, 4, 8);
  } else if (c <= 16) {
    updateTailProgress(c, 8, 16);
  } else if (c <= 32) {
    updateTailProgress(c, 16, 32);
  }
}
