// ui elements

const ELS = {
  input: document.getElementById("typeInput"),
  count: document.getElementById("taps"),
  reset: document.getElementById("reset"),
};

// tail data structures

const TAILS = {};
const TAIL_VALS = [1, 4, 8, 16, 32];
TAIL_VALS.forEach((v) => {
  TAILS[v] = newTail(v);
});

function newTail(n) {
  return {
    i: 0,
    name: n,
    vals: new Array(n).fill(0),
    el: document.getElementById("tail" + n),
    progEl: document.getElementById("progress" + n),
  };
}

// script vals

const RESET_TIMER_SEC = 30;

let PREV = 0; // prev timestamp
let CURR = 0; // latest timestamp
let COUNT = 0; // number of timestamps captured
let TIMER = 0; // timer id for reset countdown

// event listeners

ELS.input.addEventListener("input", (e) => {
  e.preventDefault();
  if (PREV === 0) PREV = CURR = Date.now();

  PREV = CURR;
  CURR = Date.now();
  COUNT++;
  if (COUNT > 1) {
    updateTails(CURR - PREV);
  }
  updateTailsProgress(COUNT);

  ELS.count.innerText = COUNT;
  ELS.count.classList.toggle("pulse1");
  ELS.count.classList.toggle("pulse2");
  ELS.input.value = "";
  ELS.reset.disabled = false;
  restartTheResetTimer();
});

ELS.reset.addEventListener("click", reset);

// fn defs

function reset() {
  ELS.count.innerText = COUNT = PREV = CURR = 0;
  ELS.reset.disabled = true;
  ELS.input.focus();
  resetTails();
}

function updateTails(bpm) {
  for (const k in TAILS) {
    updateTailBpm(k, bpm);
  }
  updateTailColors(Object.values(TAILS));
}

function updateTailBpm(id, bpm) {
  const tail = TAILS[id];
  tail.vals[tail.i] = bpm;
  tail.i++;
  tail.i = tail.i === tail.vals.length ? 0 : tail.i;
  if (COUNT < tail.vals.length) {
    return;
  } else {
    tail.el.innerText = round(toBpm(arrAvg(tail.vals)));
  }
}

function getTailBpm(tail) {
  return Number(tail.el.innerText || "0");
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

function restartTheResetTimer() {
  clearTimeout(TIMER);
  TIMER = setTimeout(reset, 1000 * RESET_TIMER_SEC);
}
