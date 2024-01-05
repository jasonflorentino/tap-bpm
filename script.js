// ui elements

const ELS = {
  input: document.getElementById("typeInput"),
  count: document.getElementById("taps"),
  reset: document.getElementById("reset"),
  resetTimeLeft: document.getElementById("resetTimeLeft"),
};

// tail data structures

const TAIL_VALS = [1, 4, 8, 16, 32];
const TAIL_VALS_MAX = Math.max(...TAIL_VALS);

/**
 * @typedef {{
 *   i: number;
 *   name: number;
 *   vals: number[];
 *   el: HTMLElement | null;
 *   progEl: HTMLElement | null;
 * }} Tail
 */

/** @type {Object.<number, Tail>} */
const TAILS = TAIL_VALS.map(toNewTail).reduce(toKeyedByVal, {});

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

  window.requestAnimationFrame(() => {
    ELS.count.innerText = COUNT;
    ELS.count.classList.toggle("pulse1");
    ELS.count.classList.toggle("pulse2");
    ELS.input.value = "";
    ELS.reset.disabled = false;
  });

  if (COUNT > 1) {
    updateTails(CURR - PREV);
  }

  updateTailsProgress(COUNT);
  restartTheResetTimer();
});

ELS.reset.addEventListener("click", reset);

// fn defs

function reset() {
  clearInterval(TIMER);
  resetTheCountdown();
  ELS.count.innerText = COUNT = PREV = CURR = 0;
  ELS.reset.disabled = true;
  ELS.input.focus();
  resetTails();
}

function updateTails(bpm) {
  for (const k in TAILS) {
    updateTailBpm(k, bpm);
  }
  updateTailHighlights(Object.values(TAILS));
}

function updateTailBpm(id, bpm) {
  const tail = TAILS[id];
  tail.vals[tail.i] = bpm;
  tail.i++;
  // handle pointer wrap around
  tail.i = tail.i % tail.vals.length;
  if (COUNT >= tail.vals.length) {
    // only update UI text when we have a full array
    tail.el.innerText = round(toBpm(arrAvg(tail.vals)));
  }
}

function getTailBpm(tail) {
  return Number(tail.el.innerText || "0");
}

function updateTailHighlights(tails) {
  // find the most common amongst our BPMs
  // 1. count bpm occurrences
  const freqCounts = {};
  tails.forEach((t) => {
    const bpm = getTailBpm(t);
    freqCounts[bpm] === undefined ? (freqCounts[bpm] = 1) : freqCounts[bpm]++;
  });
  const mostFreq = Math.max(...Object.values(freqCounts));
  // 2. pick mode bpm
  let modeBpm = 0;
  if (mostFreq > 1) {
    // only set mode if we have at least
    // 2 occurrences of the same BPM
    for (const bpm in freqCounts) {
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
      window.requestAnimationFrame(() => setMid(t.el));
    } else if (bpm > modeBpm) {
      window.requestAnimationFrame(() => setFast(t.el));
    } else if (bpm < modeBpm) {
      window.requestAnimationFrame(() => setSlow(t.el));
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
  c = c % (TAIL_VALS_MAX + 1); // reset tail progress after all full
  if (c === 0) {
    resetTailsProgress();
  } else {
    // progressively fill up the progress for each tail
    for (let i = 0; i < TAIL_VALS.length; i++) {
      if (c <= TAIL_VALS[i]) {
        updateTailProgress(c, TAIL_VALS[i - 1] ?? 0, TAIL_VALS[i]);
        break;
      }
    }
  }
}

function resetTailProgress(tail) {
  tail.progEl.style.width = "0%";
  tail.progEl.classList.remove("progressFull");
}

function resetTailsProgress() {
  forEachTail(resetTailProgress);
}

function resetTail(tail) {
  tail.vals.fill(0);
  tail.i = 0;
  tail.el.innerText = "";
  resetTailProgress(tail);
}

function resetTails() {
  forEachTail(resetTail);
}

function countDown() {
  const secondsLeft = Number(ELS.resetTimeLeft.innerText);
  if (secondsLeft <= 0) {
    reset();
  } else {
    ELS.resetTimeLeft.innerText = secondsLeft - 1;
  }
}

function resetTheCountdown() {
  if (Number(ELS.resetTimeLeft.innerText) !== RESET_TIMER_SEC) {
    ELS.resetTimeLeft.innerText = RESET_TIMER_SEC;
  }
}

function restartTheResetTimer() {
  clearInterval(TIMER);
  resetTheCountdown();
  TIMER = setInterval(countDown, 1000);
}

// utils

function forEachTail(fn) {
  for (const k in TAILS) {
    fn(TAILS[k]);
  }
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

/**
 * @param {number} n - tail size
 * @returns {Tail}
 */
function toNewTail(n) {
  return {
    i: 0, // idx of oldest value
    name: n,
    vals: new Array(n).fill(0),
    el: document.getElementById("tail" + n),
    progEl: document.getElementById("progress" + n),
  };
}

/**
 * takes an accumulator obj and a tail and
 * returns the object with the tail keyed by its 'name'
 * @param {Object} acc accumulator obj
 * @param {Tail} tail next tail
 * @returns {Object.<number, Tail>}
 */
function toKeyedByVal(acc, tail) {
  acc[tail.name] = tail;
  return acc;
}
