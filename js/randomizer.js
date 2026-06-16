
const overlay = document.getElementById("overlay");
const tabs = document.querySelectorAll(".mode-btn");
const randomizeBtn = document.getElementById("randomizeBtn");
const timerDisplay = document.getElementById("timerDisplay");
const toggleTimerBtn = document.getElementById("toggleTimerBtn");
const resetTimerBtn = document.getElementById("resetTimerBtn");

let mode = "open";

const SECTIONS = ["N", "E", "S", "W"];
const COIN_SECTION = { HH: "N", HT: "E", TT: "S", TH: "W" };
const ROBOT_LENGTH_MM = 180;

const FIELD_MIN = 4.8;
const FIELD_MAX = 95.15;
const FIELD_SPAN = FIELD_MAX - FIELD_MIN;
function mm(v) { return FIELD_MIN + (v / 3000) * FIELD_SPAN; }
function lane(v) { return FIELD_MIN + (v / 3000) * FIELD_SPAN; }

const WALL = {
  narrowIn: mm(600),
  wideIn: mm(1000),
  wideOut: mm(2000),
  narrowOut: mm(2400),
};

const SEAT = {
  N: {
    1: [mm(1000), mm(575)], 2: [mm(1500), mm(575)], 3: [mm(2000), mm(575)],
    4: [mm(1000), mm(375)], 5: [mm(1500), mm(375)], 6: [mm(2000), mm(375)]
  },
  E: {
    1: [mm(2425), mm(1000)], 2: [mm(2425), mm(1500)], 3: [mm(2425), mm(2000)],
    4: [mm(2625), mm(1000)], 5: [mm(2625), mm(1500)], 6: [mm(2625), mm(2000)]
  },
  S: {
    1: [mm(2000), mm(2425)], 2: [mm(1500), mm(2425)], 3: [mm(1000), mm(2425)],
    4: [mm(2000), mm(2625)], 5: [mm(1500), mm(2625)], 6: [mm(1000), mm(2625)]
  },
  W: {
    1: [mm(575), mm(2000)], 2: [mm(575), mm(1500)], 3: [mm(575), mm(1000)],
    4: [mm(375), mm(2000)], 5: [mm(375), mm(1500)], 6: [mm(375), mm(1000)]
  }
};

// The start zones are aligned to the fixed dotted rectangles on the field.
// Wide wall: all 6 rectangles are possible. Narrow wall: the row nearest the inner wall is removed.
const START_SPOTS = {
  N: [
    { id: 1, cx: mm(1250), cy: mm(775), w: 370, h: 220, nearWall: true },
    { id: 2, cx: mm(1250), cy: mm(475), w: 370, h: 220, nearWall: false },
    { id: 3, cx: mm(1250), cy: mm(175), w: 370, h: 220, nearWall: false },
    { id: 4, cx: mm(1750), cy: mm(775), w: 370, h: 220, nearWall: true },
    { id: 5, cx: mm(1750), cy: mm(475), w: 370, h: 220, nearWall: false },
    { id: 6, cx: mm(1750), cy: mm(175), w: 370, h: 220, nearWall: false },
  ],
  E: [
    { id: 1, cx: mm(2225), cy: mm(1250), w: 220, h: 370, nearWall: true },
    { id: 2, cx: mm(2525), cy: mm(1250), w: 220, h: 370, nearWall: false },
    { id: 3, cx: mm(2825), cy: mm(1250), w: 220, h: 370, nearWall: false },
    { id: 4, cx: mm(2225), cy: mm(1750), w: 220, h: 370, nearWall: true },
    { id: 5, cx: mm(2525), cy: mm(1750), w: 220, h: 370, nearWall: false },
    { id: 6, cx: mm(2825), cy: mm(1750), w: 220, h: 370, nearWall: false },
  ],
  S: [
    { id: 1, cx: mm(1750), cy: mm(2225), w: 370, h: 220, nearWall: true },
    { id: 2, cx: mm(1750), cy: mm(2525), w: 370, h: 220, nearWall: false },
    { id: 3, cx: mm(1750), cy: mm(2825), w: 370, h: 220, nearWall: false },
    { id: 4, cx: mm(1250), cy: mm(2225), w: 370, h: 220, nearWall: true },
    { id: 5, cx: mm(1250), cy: mm(2525), w: 370, h: 220, nearWall: false },
    { id: 6, cx: mm(1250), cy: mm(2825), w: 370, h: 220, nearWall: false },
  ],
  W: [
    { id: 1, cx: mm(775), cy: mm(1750), w: 220, h: 370, nearWall: true },
    { id: 2, cx: mm(475), cy: mm(1750), w: 220, h: 370, nearWall: false },
    { id: 3, cx: mm(175), cy: mm(1750), w: 220, h: 370, nearWall: false },
    { id: 4, cx: mm(775), cy: mm(1250), w: 220, h: 370, nearWall: true },
    { id: 5, cx: mm(475), cy: mm(1250), w: 220, h: 370, nearWall: false },
    { id: 6, cx: mm(175), cy: mm(1250), w: 220, h: 370, nearWall: false },
  ]
};

// Official 36-card deck, encoded from Figure 8c. Seats 1-3 are the row closer to the inner wall.
const CARD_DECK = [
  { id: 1, signs: [["green", 1]] }, { id: 2, signs: [["red", 1]] },
  { id: 3, signs: [["green", 2]] }, { id: 4, signs: [["red", 2]] },
  { id: 5, signs: [["green", 3]] }, { id: 6, signs: [["red", 3]] },
  { id: 7, signs: [["green", 4]] }, { id: 8, signs: [["red", 4]] },
  { id: 9, signs: [["green", 5]] }, { id: 10, signs: [["red", 5]] },
  { id: 11, signs: [["green", 6]] }, { id: 12, signs: [["red", 6]] },
  { id: 13, signs: [["green", 4], ["green", 3]] },
  { id: 14, signs: [["green", 4], ["red", 3]] },
  { id: 15, signs: [["red", 4], ["green", 3]] },
  { id: 16, signs: [["green", 4], ["red", 3]] },
  { id: 17, signs: [["red", 4], ["green", 3]] },
  { id: 18, signs: [["red", 4], ["red", 3]] },
  { id: 19, signs: [["green", 1], ["green", 6]] },
  { id: 20, signs: [["green", 1], ["red", 6]] },
  { id: 21, signs: [["red", 1], ["green", 6]] },
  { id: 22, signs: [["green", 1], ["red", 6]] },
  { id: 23, signs: [["red", 1], ["green", 6]] },
  { id: 24, signs: [["red", 1], ["red", 6]] },
  { id: 25, signs: [["green", 1], ["green", 3]] },
  { id: 26, signs: [["green", 1], ["red", 3]] },
  { id: 27, signs: [["red", 1], ["green", 3]] },
  { id: 28, signs: [["green", 1], ["red", 3]] },
  { id: 29, signs: [["red", 1], ["green", 3]] },
  { id: 30, signs: [["red", 1], ["red", 3]] },
  { id: 31, signs: [["green", 4], ["green", 6]] },
  { id: 32, signs: [["green", 4], ["red", 6]] },
  { id: 33, signs: [["red", 4], ["green", 6]] },
  { id: 34, signs: [["green", 4], ["red", 6]] },
  { id: 35, signs: [["red", 4], ["green", 6]] },
  { id: 36, signs: [["red", 4], ["red", 6]] },
];

function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
function seedNow() { return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0; }
function coin(rng) { return rng() < 0.5 ? "H" : "T"; }
function coinPairToSection(a, b) { return COIN_SECTION[`${a}${b}`]; }
function nextSection(section, offset = 1) {
  const index = SECTIONS.indexOf(section);
  return SECTIONS[(index + offset + SECTIONS.length) % SECTIONS.length];
}
function pick(arr, rng) { return arr[Math.floor(rng() * arr.length)]; }
function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function svg(tag, attrs = {}) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  return el;
}
function clearOverlay() { overlay.replaceChildren(); }

function wallBounds(widths) {
  return {
    top: widths.N === "narrow" ? WALL.narrowIn : WALL.wideIn,
    right: widths.E === "narrow" ? WALL.narrowOut : WALL.wideOut,
    bottom: widths.S === "narrow" ? WALL.narrowOut : WALL.wideOut,
    left: widths.W === "narrow" ? WALL.narrowIn : WALL.wideIn,
  };
}
function drawInnerWall(widths) {
  const b = wallBounds(widths);
  overlay.appendChild(svg("path", {
    d: `M ${b.left} ${b.top} H ${b.right} V ${b.bottom} H ${b.left} Z`,
    class: "inner-wall"
  }));
}

function arrowAngle(section, direction) {
  const cw = direction === "Clockwise";
  if (section === "N") return cw ? 0 : 180;
  if (section === "E") return cw ? 90 : -90;
  if (section === "S") return cw ? 180 : 0;
  return cw ? -90 : 90;
}
function drawStartArrow(x, y, angle) {
  const g = svg("g", { transform: `translate(${x} ${y}) rotate(${angle})` });
  g.appendChild(svg("path", { d: "M -1.9 0 L 1.9 0 M 0.70 -1.05 L 1.95 0 L 0.70 1.05", class: "start-arrow" }));
  overlay.appendChild(g);
}
function drawStart(draw) {
  const spot = draw.startSpot;
  const w = (spot.w / 3000) * FIELD_SPAN;
  const h = (spot.h / 3000) * FIELD_SPAN;
  overlay.appendChild(svg("rect", {
    x: spot.cx - w / 2,
    y: spot.cy - h / 2,
    width: w,
    height: h,
    rx: 0.10,
    class: "zone-highlight"
  }));
  drawStartArrow(spot.cx, spot.cy, arrowAngle(draw.startSection, draw.direction));
}

function drawParkingArrow(section, direction) {
  const p = parkingGeometry(section);
  const [x, y, w, h] = p.area;
  const cx = x + w / 2;
  const cy = y + h / 2;
  let angle = arrowAngle(section, direction);
  drawStartArrow(cx, cy, angle);
}

function parkingGeometry(section) {
  const length = (ROBOT_LENGTH_MM * 1.5 / 3000) * FIELD_SPAN;
  const depth = (200 / 3000) * FIELD_SPAN;
  const edgePad = 0.10;

  if (section === "N") {
    const y0 = FIELD_MIN + edgePad;
    const xLeft = mm(1000);
    const xRight = xLeft + length;
    return { area: [xLeft, y0, length, depth], bars: [[xLeft, y0, xLeft, y0 + depth], [xRight, y0, xRight, y0 + depth]] };
  }
  if (section === "E") {
    const x1 = FIELD_MAX - edgePad;
    const yTop = mm(1000);
    const yBottom = yTop + length;
    return { area: [x1 - depth, yTop, depth, length], bars: [[x1, yTop, x1 - depth, yTop], [x1, yBottom, x1 - depth, yBottom]] };
  }
  if (section === "S") {
    const y1 = FIELD_MAX - edgePad;
    const xRight = mm(2000);
    const xLeft = xRight - length;
    return { area: [xLeft, y1 - depth, length, depth], bars: [[xLeft, y1, xLeft, y1 - depth], [xRight, y1, xRight, y1 - depth]] };
  }
  const x0 = FIELD_MIN + edgePad;
  const yBottom = mm(2000);
  const yTop = yBottom - length;
  return { area: [x0, yTop, depth, length], bars: [[x0, yTop, x0 + depth, yTop], [x0, yBottom, x0 + depth, yBottom]] };
}
function drawParking(section) {
  const p = parkingGeometry(section);
  const [x, y, w, h] = p.area;
  overlay.appendChild(svg("rect", { x, y, width: w, height: h, rx: 0.18, class: "parking-area" }));
  for (const bar of p.bars) {
    overlay.appendChild(svg("line", { x1: bar[0], y1: bar[1], x2: bar[2], y2: bar[3], class: "parking-wall" }));
  }
}

function uniqueSigns(signs) {
  const seen = new Set();
  const out = [];
  for (const sign of signs) {
    const key = `${sign.section}-${sign.seat}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(sign);
  }
  return out;
}
function moveSignsForParking(signs, parkingSection) {
  return uniqueSigns(signs.map(sign => {
    if (sign.section !== parkingSection || sign.seat < 4) return sign;
    return { ...sign, seat: sign.seat - 3 };
  }));
}

function drawCube(x, y, color) {
  const p = color === "red"
    ? { top: "#ff959b", front: "#f01f33", side: "#ad0c1c", edge: "#640712", shine: "#ffd7d9" }
    : { top: "#99ff9d", front: "#12b83e", side: "#067226", edge: "#023f14", shine: "#e2ffe3" };
  overlay.appendChild(svg("ellipse", { cx: x + 0.45, cy: y + 0.92, rx: 1.65, ry: 0.68, fill: "rgba(0,0,0,0.20)" }));
  const g = svg("g", { transform: `translate(${x} ${y})` });
  g.appendChild(svg("polygon", { points: "0,-1.45 1.25,-0.78 0,-0.10 -1.25,-0.78", fill: p.top }));
  g.appendChild(svg("polygon", { points: "-1.25,-0.78 0,-0.10 0,1.25 -1.25,0.57", fill: p.front }));
  g.appendChild(svg("polygon", { points: "0,-0.10 1.25,-0.78 1.25,0.57 0,1.25", fill: p.side }));
  g.appendChild(svg("polyline", { points: "-1.25,-0.78 0,-1.45 1.25,-0.78 1.25,0.57 0,1.25 -1.25,0.57 -1.25,-0.78", fill: "none", stroke: p.edge, "stroke-width": 0.13 }));
  g.appendChild(svg("path", { d: "M -0.68 -0.78 L 0 -1.12 L 0.66 -0.78 L 0 -0.43 Z", fill: p.shine, opacity: "0.38" }));
  overlay.appendChild(g);
}
function drawSigns(signs) {
  for (const sign of uniqueSigns(signs)) {
    const [x, y] = SEAT[sign.section][sign.seat];
    drawCube(x, y, sign.color);
  }
}

function generateOpen() {
  const rng = mulberry32(seedNow());
  const direction = rng() < 0.5 ? "Clockwise" : "Counterclockwise";
  const startSection = coinPairToSection(coin(rng), coin(rng));

  const widths = {};
  for (let i = 0; i < 4; i++) {
    const section = nextSection(startSection, i);
    widths[section] = coin(rng) === "H" ? "wide" : "narrow";
  }

  const possibleSpots = START_SPOTS[startSection].filter(spot => widths[startSection] === "wide" || !spot.nearWall);

  const startSpot = pick(possibleSpots, rng);
  return { mode: "open", direction, widths, startSection, startSpot };
}




function sectionTravelOrder(section, direction) {
  const base = [1, 4, 2, 5, 3, 6];
  return direction === "Clockwise" ? base : [...base].reverse();
}

function orderedSigns(signs, direction) {
  const sections = direction === "Clockwise" ? ["N", "E", "S", "W"] : ["N", "W", "S", "E"];
  const out = [];
  for (const section of sections) {
    const order = sectionTravelOrder(section, direction);
    out.push(...uniqueSigns(signs)
      .filter(s => s.section === section)
      .sort((a, b) => order.indexOf(a.seat) - order.indexOf(b.seat)));
  }
  return out;
}

function samePosition(signs) {
  const seen = new Set();
  for (const sign of signs) {
    const key = `${sign.section}-${sign.seat}`;
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
}

function validSectionPattern(signs, section) {
  const seats = signs
    .filter(s => s.section === section)
    .map(s => s.seat)
    .sort((a, b) => a - b);

  if (seats.length === 0) return true;
  if (seats.length === 1) return true;
  if (seats.length > 2) return false;

  // Two cubes on one straight section must be at both ends of one side of that section.
  return (seats[0] === 1 && seats[1] === 3) || (seats[0] === 4 && seats[1] === 6);
}

function hasConsecutiveSameSide(signs, direction) {
  const ordered = orderedSigns(uniqueSigns(signs), direction);
  for (let i = 1; i < ordered.length; i++) {
    if (ordered[i].color === ordered[i - 1].color) return true;
  }
  return false;
}

function isLegalFinalSigns(signs, direction) {
  const unique = uniqueSigns(signs);
  if (unique.length !== signs.length) return false;
  if (samePosition(unique)) return false;

  for (const section of SECTIONS) {
    if (!validSectionPattern(unique, section)) return false;
  }

  return !hasConsecutiveSameSide(unique, direction);
}

function makeSectionPattern(section, wantPair, rng) {
  const singleOptions = [1, 2, 3, 4, 5, 6];
  const pairOptions = [[1, 3], [4, 6]];
  const seats = wantPair ? pick(pairOptions, rng) : [pick(singleOptions, rng)];

  return seats.map(seat => ({
    section,
    seat,
    color: "red"
  }));
}

function applyAlternatingColors(signs, direction, rng) {
  const unique = uniqueSigns(signs).map(s => ({ ...s }));
  const ordered = orderedSigns(unique, direction);
  let color = rng() < 0.5 ? "red" : "green";

  for (const item of ordered) {
    const target = unique.find(s => s.section === item.section && s.seat === item.seat);
    target.color = color;
    color = color === "red" ? "green" : "red";
  }

  return unique;
}

function generateFinal() {
  const rng = mulberry32(seedNow());
  const direction = rng() < 0.5 ? "Clockwise" : "Counterclockwise";

  for (let attempt = 0; attempt < 700; attempt++) {
    const parkingSection = coinPairToSection(coin(rng), coin(rng));
    const target = pick([4, 5, 6, 7, 8], rng);
    const pairCount = target - 4;

    const pairSections = new Set(shuffle(SECTIONS, rng).slice(0, pairCount));
    let signs = [];

    for (const section of SECTIONS) {
      signs.push(...makeSectionPattern(section, pairSections.has(section), rng));
    }

    signs = moveSignsForParking(signs, parkingSection);
    if (samePosition(signs)) continue;

    signs = applyAlternatingColors(signs, direction, rng);

    if (!isLegalFinalSigns(signs, direction)) continue;

    return {
      mode: "final",
      direction,
      widths: { N: "wide", E: "wide", S: "wide", W: "wide" },
      signs,
      parking: { section: parkingSection }
    };
  }

  const fallbackSigns = applyAlternatingColors([
    { section: "N", seat: 1, color: "red" }, { section: "N", seat: 3, color: "green" },
    { section: "E", seat: 1, color: "red" }, { section: "E", seat: 3, color: "green" },
    { section: "S", seat: 1, color: "red" }, { section: "S", seat: 3, color: "green" },
    { section: "W", seat: 1, color: "red" }, { section: "W", seat: 3, color: "green" }
  ], "Clockwise", mulberry32(seedNow()));

  return {
    mode: "final",
    direction: "Clockwise",
    widths: { N: "wide", E: "wide", S: "wide", W: "wide" },
    signs: fallbackSigns,
    parking: { section: "N" }
  };
}


function render() {
  clearOverlay();
  const draw = mode === "open" ? generateOpen() : generateFinal();
  drawInnerWall(draw.widths);
  if (draw.parking) {
    drawParking(draw.parking.section);
    drawParkingArrow(draw.parking.section, draw.direction);
  }
  if (draw.signs) drawSigns(draw.signs);
  if (draw.mode === "open") drawStart(draw);
}

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    if (timerRunning) return;
    tabs.forEach(t => {
      t.classList.toggle("active", t === tab);
      t.setAttribute("aria-selected", t === tab ? "true" : "false");
    });
    mode = tab.dataset.mode;
    render();
  });
});

randomizeBtn.addEventListener("click", () => {
  if (timerRunning) return;
  render();
});


let timerRunning = false;
let timerStart = 0;
let timerElapsed = 0;
let timerRaf = null;

function setRandomizeLocked(locked) {
  randomizeBtn.disabled = locked;
  randomizeBtn.classList.toggle("locked", locked);
  tabs.forEach(tab => {
    tab.disabled = locked;
    tab.classList.toggle("locked", locked);
  });
}

function formatTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  timerDisplay.innerHTML = `<span class="timer-main">${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}</span><span class="timer-centi">.${String(cs).padStart(2, "0")}</span>`;
}
function updateTimer() {
  const elapsed = timerElapsed + (timerRunning ? performance.now() - timerStart : 0);
  formatTime(elapsed);
  if (timerRunning) timerRaf = requestAnimationFrame(updateTimer);
}
function toggleTimer() {
  if (timerRunning) {
    timerElapsed += performance.now() - timerStart;
    timerRunning = false;
    cancelAnimationFrame(timerRaf);
    toggleTimerBtn.textContent = "Start";
    toggleTimerBtn.classList.remove("running");
    setRandomizeLocked(false);
    updateTimer();
    return;
  }
  timerRunning = true;
  timerStart = performance.now();
  toggleTimerBtn.textContent = "Stop";
  toggleTimerBtn.classList.add("running");
  setRandomizeLocked(true);
  updateTimer();
}
function resetTimer() {
  timerRunning = false;
  timerElapsed = 0;
  cancelAnimationFrame(timerRaf);
  toggleTimerBtn.textContent = "Start";
  toggleTimerBtn.classList.remove("running");
  setRandomizeLocked(false);
  updateTimer();
}

toggleTimerBtn.addEventListener("click", toggleTimer);
resetTimerBtn.addEventListener("click", resetTimer);

resetTimer();
render();
