const inputEl = document.getElementById("typeInput");
const countEl = document.getElementById("taps");
const lastTapEl = document.getElementById("lastTap");
const tail4El = document.getElementById("tail4");
const tail8El = document.getElementById("tail8");
const tail16El = document.getElementById("tail16");
const tail32El = document.getElementById("tail32");
const clearEl = document.getElementById("clear");

let prev = 0;
let curr = 0;
let count = 0;
let average = 0;

let timer = 0;

const tails = {
  4: {
    i: 0,
    vals: new Array(4).fill(0),
    el: tail4El,
  },
  8: {
    i: 0,
    vals: new Array(8).fill(0),
    el: tail8El,
  },
  16: {
    i: 0,
    vals: new Array(16).fill(0),
    el: tail16El,
  },
  32: {
    i: 0,
    vals: new Array(32).fill(0),
    el: tail32El,
  },
};

inputEl.addEventListener("input", (e) => {
  e.preventDefault();
  if (prev === 0 || count === 0) prev = curr = Date.now();
  prev = curr;
  curr = Date.now();
  count++;
  if (count === 1) {
    return;
  } else {
    lastTapEl.innerText = round(toBpm(curr - prev));
    countEl.innerText = count;
    updateTails(curr - prev);
  }
  inputEl.value = "";
  timerReset();
});

clearEl.addEventListener("click", init);

// fn defs

function init() {
  prev = 0;
  curr = 0;
  count = 0;
  countEl.innerText = "0";
  lastTapEl.innerText = "";
  resetTails();
}

function updateTail(id, val) {
  const tail = tails[id];
  tail.vals[tail.i] = val;
  tail.i++;
  tail.i = tail.i === tail.vals.length ? 0 : tail.i;
  if (count < tail.vals.length) {
    return;
  } else {
    tail.el.innerText = round(toBpm(arrAvg(tail.vals)));
  }
}

function updateTails(val) {
  for (const k in tails) {
    updateTail(k, val);
  }
}

function resetTails() {
  for (const k in tails) {
    resetTail(k);
  }
}

function resetTail(id) {
  const tail = tails[id];
  tail.vals.fill(0);
  tail.i = 0;
  tail.el.innerText = "";
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
