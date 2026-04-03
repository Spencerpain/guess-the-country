// game.js — Guess the Country (v2)

// ── Country name lookup ────────────────────────────────────────────────────────

const COUNTRIES = {
  // Easy
  US:'United States', CA:'Canada', MX:'Mexico', BR:'Brazil',
  AR:'Argentina', RU:'Russia', CN:'China', AU:'Australia',
  IN:'India', FR:'France', DE:'Germany', GB:'United Kingdom',
  IT:'Italy', ES:'Spain', JP:'Japan', ZA:'South Africa',
  EG:'Egypt', NG:'Nigeria', SA:'Saudi Arabia', TR:'Turkey',

  // Medium
  CO:'Colombia', PE:'Peru', VE:'Venezuela', CL:'Chile',
  UY:'Uruguay', BO:'Bolivia', EC:'Ecuador', PY:'Paraguay',
  PL:'Poland', UA:'Ukraine', RO:'Romania', GR:'Greece',
  SE:'Sweden', NO:'Norway', FI:'Finland', DK:'Denmark',
  NL:'Netherlands', BE:'Belgium', PT:'Portugal', CZ:'Czech Republic',
  HU:'Hungary', AT:'Austria', CH:'Switzerland', IR:'Iran',
  IQ:'Iraq', PK:'Pakistan', ID:'Indonesia', TH:'Thailand',
  VN:'Vietnam', PH:'Philippines', KR:'South Korea', KP:'North Korea',
  TN:'Tunisia', DZ:'Algeria', MA:'Morocco', LY:'Libya',
  GH:'Ghana', KE:'Kenya', ET:'Ethiopia', SD:'Sudan',
  AF:'Afghanistan', KZ:'Kazakhstan', MN:'Mongolia', MY:'Malaysia',
  MM:'Myanmar', AZ:'Azerbaijan', NZ:'New Zealand', IE:'Ireland',

  // Hard
  BA:'Bosnia and Herzegovina', MK:'North Macedonia', AL:'Albania',
  ME:'Montenegro', MD:'Moldova', BY:'Belarus', LT:'Lithuania',
  LV:'Latvia', EE:'Estonia', IS:'Iceland', HR:'Croatia',
  SI:'Slovenia', SK:'Slovakia', BG:'Bulgaria', LB:'Lebanon',
  JO:'Jordan', AE:'United Arab Emirates', QA:'Qatar', KW:'Kuwait',
  OM:'Oman', BD:'Bangladesh', LK:'Sri Lanka', NP:'Nepal',
  KH:'Cambodia', LA:'Laos', UZ:'Uzbekistan', TM:'Turkmenistan',
  KG:'Kyrgyzstan', TJ:'Tajikistan', GE:'Georgia', AM:'Armenia',
  UG:'Uganda', RW:'Rwanda', TZ:'Tanzania', MZ:'Mozambique',
  ZM:'Zambia', ZW:'Zimbabwe', BW:'Botswana', NA:'Namibia',
  AO:'Angola', CM:'Cameroon', CI:"Côte d'Ivoire", SN:'Senegal',
  ML:'Mali', NE:'Niger', TD:'Chad', CF:'Central African Republic',
  SS:'South Sudan', SO:'Somalia', MR:'Mauritania', GN:'Guinea',
  BF:'Burkina Faso', TG:'Togo', BJ:'Benin', GW:'Guinea-Bissau',
  GA:'Gabon', CG:'Republic of the Congo', CD:'DR Congo',
  BI:'Burundi', ER:'Eritrea', DJ:'Djibouti', MW:'Malawi',
  MG:'Madagascar', SL:'Sierra Leone', LR:'Liberia', NI:'Nicaragua',
  GT:'Guatemala', HN:'Honduras', SV:'El Salvador', PA:'Panama',
  CR:'Costa Rica', CU:'Cuba', DO:'Dominican Republic', HT:'Haiti',
  JM:'Jamaica', GY:'Guyana', SR:'Suriname', PG:'Papua New Guinea',
  TL:'Timor-Leste', FJ:'Fiji', SY:'Syria', YE:'Yemen', IL:'Israel',
  GQ:'Equatorial Guinea',

  // Impossible
  BH:'Bahrain', LU:'Luxembourg', MT:'Malta', CY:'Cyprus',
  SG:'Singapore', MV:'Maldives', FK:'Falkland Islands',
  SZ:'Eswatini', LS:'Lesotho', BN:'Brunei', TT:'Trinidad and Tobago',
  BS:'Bahamas', BB:'Barbados', GM:'Gambia', KM:'Comoros',
  CV:'Cape Verde', MU:'Mauritius', BZ:'Belize',
  LC:'Saint Lucia', KN:'Saint Kitts and Nevis', BT:'Bhutan',
  WS:'Samoa', TO:'Tonga', VU:'Vanuatu', GD:'Grenada',
};

// ── Difficulty pools ───────────────────────────────────────────────────────────

const DIFFICULTY_POOLS = {
  easy: new Set([
    'US','CA','MX','BR','AR','RU','CN','AU','IN','FR',
    'DE','GB','IT','ES','JP','ZA','EG','NG','SA','TR',
  ]),
  medium: new Set([
    'CO','PE','VE','CL','UY','BO','EC','PY','PL','UA',
    'RO','GR','SE','NO','FI','DK','NL','BE','PT','CZ',
    'HU','AT','CH','IR','IQ','PK','ID','TH','VN','PH',
    'KR','KP','TN','DZ','MA','LY','GH','KE','ET','SD',
    'AF','KZ','MN','MY','MM','AZ','NZ','IE',
  ]),
  hard: new Set([
    'BA','MK','AL','ME','MD','BY','LT','LV','EE','IS',
    'HR','SI','SK','BG','LB','JO','AE','QA','KW','OM',
    'BD','LK','NP','KH','LA','UZ','TM','KG','TJ','GE',
    'AM','UG','RW','TZ','MZ','ZM','ZW','BW','NA','AO',
    'CM','CI','SN','ML','NE','TD','CF','SS','SO','MR',
    'GN','BF','TG','BJ','GW','GA','CG','CD','BI','ER',
    'DJ','MW','MG','SL','LR','NI','GT','HN','SV','PA',
    'CR','CU','DO','HT','JM','GY','SR','PG','TL','FJ',
    'SY','YE','IL','GQ',
  ]),
  impossible: new Set([
    'BH','LU','MT','CY','SG','MV','FK','SZ','LS','BN',
    'TT','BS','BB','GM','KM','CV','MU','BZ','LC','KN',
    'BT','WS','TO','VU','GD',
  ]),
};

// Random = union of all pools
DIFFICULTY_POOLS.random = new Set([
  ...DIFFICULTY_POOLS.easy,
  ...DIFFICULTY_POOLS.medium,
  ...DIFFICULTY_POOLS.hard,
  ...DIFFICULTY_POOLS.impossible,
]);

const DIFFICULTY_HINTS = {
  easy:       'Large, very well-known countries',
  medium:     'Common world geography',
  hard:       'All countries — every continent',
  impossible: 'Tiny & obscure territories',
  random:     'Any country — mix of all difficulties!',
};

// ── Continent mapping (used for zoom) ─────────────────────────────────────────
// Russia assigned to AS so Europe's bbox stays tight

const COUNTRY_CONTINENT = {
  // Africa
  AO:'AF', BJ:'AF', BW:'AF', BF:'AF', BI:'AF', CM:'AF', CV:'AF', CF:'AF',
  TD:'AF', KM:'AF', CD:'AF', CG:'AF', CI:'AF', DJ:'AF', EG:'AF', GQ:'AF',
  ER:'AF', ET:'AF', GA:'AF', GM:'AF', GH:'AF', GN:'AF', GW:'AF', KE:'AF',
  LS:'AF', LR:'AF', LY:'AF', MG:'AF', MW:'AF', ML:'AF', MR:'AF', MU:'AF',
  MA:'AF', MZ:'AF', NA:'AF', NE:'AF', NG:'AF', RW:'AF', SN:'AF', SL:'AF',
  SO:'AF', ZA:'AF', SS:'AF', SD:'AF', SZ:'AF', TZ:'AF', TG:'AF', TN:'AF',
  UG:'AF', ZM:'AF', ZW:'AF', DZ:'AF',
  // Asia (includes Russia to keep Europe bbox tight)
  AF:'AS', AM:'AS', AZ:'AS', BH:'AS', BD:'AS', BT:'AS', BN:'AS', KH:'AS',
  CN:'AS', CY:'AS', GE:'AS', IN:'AS', ID:'AS', IR:'AS', IQ:'AS', IL:'AS',
  JP:'AS', JO:'AS', KZ:'AS', KW:'AS', KG:'AS', LA:'AS', LB:'AS', MY:'AS',
  MV:'AS', MN:'AS', MM:'AS', NP:'AS', KP:'AS', OM:'AS', PK:'AS', PH:'AS',
  QA:'AS', RU:'AS', SA:'AS', SG:'AS', KR:'AS', LK:'AS', SY:'AS', TW:'AS',
  TJ:'AS', TH:'AS', TL:'AS', TR:'AS', TM:'AS', AE:'AS', UZ:'AS', VN:'AS',
  YE:'AS',
  // Europe
  AL:'EU', AD:'EU', AT:'EU', BY:'EU', BE:'EU', BA:'EU', BG:'EU', HR:'EU',
  CZ:'EU', DK:'EU', EE:'EU', FI:'EU', FR:'EU', DE:'EU', GR:'EU', HU:'EU',
  IS:'EU', IE:'EU', IT:'EU', LV:'EU', LI:'EU', LT:'EU', LU:'EU', MT:'EU',
  MD:'EU', MC:'EU', ME:'EU', NL:'EU', MK:'EU', NO:'EU', PL:'EU', PT:'EU',
  RO:'EU', SM:'EU', RS:'EU', SK:'EU', SI:'EU', ES:'EU', SE:'EU', CH:'EU',
  UA:'EU', GB:'EU',
  // North America
  BS:'NA', BB:'NA', BZ:'NA', CA:'NA', CR:'NA', CU:'NA', DM:'NA', DO:'NA',
  SV:'NA', GD:'NA', GT:'NA', HT:'NA', HN:'NA', JM:'NA', MX:'NA', NI:'NA',
  PA:'NA', KN:'NA', LC:'NA', TT:'NA', US:'NA',
  // South America
  AR:'SA', BO:'SA', BR:'SA', CL:'SA', CO:'SA', EC:'SA', FK:'SA', GY:'SA',
  PY:'SA', PE:'SA', SR:'SA', UY:'SA', VE:'SA',
  // Oceania
  AU:'OC', FJ:'OC', KI:'OC', MH:'OC', FM:'OC', NR:'OC', NZ:'OC', PW:'OC',
  PG:'OC', WS:'OC', SB:'OC', TO:'OC', TV:'OC', VU:'OC',
};

// ── UN M49 numeric → ISO alpha-2 ──────────────────────────────────────────────

const NUMERIC_TO_ISO2 = {
  4:'AF',   8:'AL',  12:'DZ',  20:'AD',  24:'AO',  32:'AR',  36:'AU',  40:'AT',
 44:'BS',  48:'BH',  50:'BD',  52:'BB',  56:'BE',  64:'BT',  68:'BO',  70:'BA',
 72:'BW',  76:'BR',  84:'BZ',  96:'BN', 100:'BG', 104:'MM', 108:'BI', 112:'BY',
116:'KH', 120:'CM', 124:'CA', 132:'CV', 140:'CF', 144:'LK', 148:'TD', 152:'CL',
156:'CN', 170:'CO', 174:'KM', 178:'CG', 180:'CD', 188:'CR', 191:'HR', 192:'CU',
196:'CY', 203:'CZ', 204:'BJ', 208:'DK', 214:'DO', 218:'EC', 222:'SV', 226:'GQ',
231:'ET', 232:'ER', 233:'EE', 238:'FK', 242:'FJ', 246:'FI', 250:'FR', 266:'GA',
268:'GE', 270:'GM', 276:'DE', 288:'GH', 300:'GR', 320:'GT', 324:'GN', 328:'GY',
332:'HT', 340:'HN', 348:'HU', 352:'IS', 356:'IN', 360:'ID', 364:'IR', 368:'IQ',
372:'IE', 376:'IL', 380:'IT', 388:'JM', 392:'JP', 398:'KZ', 400:'JO', 404:'KE',
408:'KP', 410:'KR', 414:'KW', 417:'KG', 418:'LA', 422:'LB', 426:'LS', 428:'LV',
430:'LR', 438:'LI', 440:'LT', 442:'LU', 450:'MG', 454:'MW', 458:'MY', 462:'MV',
466:'ML', 470:'MT', 478:'MR', 480:'MU', 484:'MX', 496:'MN', 498:'MD', 499:'ME',
504:'MA', 508:'MZ', 516:'NA', 524:'NP', 528:'NL', 548:'VU', 554:'NZ', 558:'NI',
562:'NE', 566:'NG', 578:'NO', 586:'PK', 591:'PA', 598:'PG', 600:'PY', 604:'PE',
608:'PH', 616:'PL', 620:'PT', 624:'GW', 626:'TL', 634:'QA', 642:'RO', 643:'RU',
646:'RW', 659:'KN', 662:'LC', 670:'VC', 682:'SA', 686:'SN', 694:'SL', 702:'SG',
703:'SK', 704:'VN', 705:'SI', 706:'SO', 710:'ZA', 716:'ZW', 724:'ES', 728:'SS',
729:'SD', 740:'SR', 748:'SZ', 752:'SE', 756:'CH', 760:'SY', 762:'TJ', 764:'TH',
768:'TG', 776:'TO', 780:'TT', 784:'AE', 788:'TN', 792:'TR', 795:'TM', 798:'TV',
800:'UG', 804:'UA', 807:'MK', 818:'EG', 826:'GB', 840:'US', 854:'BF', 858:'UY',
860:'UZ', 862:'VE', 882:'WS', 887:'YE', 894:'ZM',
};

// ── Projection & SVG path building ────────────────────────────────────────────

function project([lon, lat]) {
  return [(lon + 180) / 360 * 2000, (90 - lat) / 180 * 1000];
}

function ringToD(ring) {
  return ring.map((pt, i) => {
    const [x, y] = project(pt);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ') + 'Z';
}

function featureToD(geometry) {
  const rings = geometry.type === 'Polygon'
    ? geometry.coordinates
    : geometry.coordinates.flat(1);
  return rings.map(ringToD).join(' ');
}

// ── Zoom / viewBox animation ──────────────────────────────────────────────────

let vb = { x: 0, y: 0, w: 2000, h: 1000 }; // current rendered viewBox
let animFrame = null;

function zoomToCountry(pathEl) {
  const iso = pathEl.dataset.iso;
  const continent = COUNTRY_CONTINENT[iso];

  // Compute the bounding box of all countries in the same continent
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  if (continent) {
    svg.querySelectorAll('path[data-iso]').forEach(p => {
      if (COUNTRY_CONTINENT[p.dataset.iso] === continent) {
        const b = p.getBBox();
        minX = Math.min(minX, b.x);
        minY = Math.min(minY, b.y);
        maxX = Math.max(maxX, b.x + b.width);
        maxY = Math.max(maxY, b.y + b.height);
      }
    });
  } else {
    // Fallback: zoom to the country itself with generous padding
    const b = pathEl.getBBox();
    minX = b.x; minY = b.y; maxX = b.x + b.width; maxY = b.y + b.height;
  }

  const pad = 40;
  let vx = minX - pad;
  let vy = minY - pad;
  let vw = (maxX - minX) + pad * 2;
  let vh = (maxY - minY) + pad * 2;

  // Force 2:1 aspect ratio to match the SVG coordinate space
  if (vw / vh > 2) {
    const newH = vw / 2;
    vy -= (newH - vh) / 2;
    vh = newH;
  } else {
    const newW = vh * 2;
    vx -= (newW - vw) / 2;
    vw = newW;
  }

  // Clamp to world bounds
  vw = Math.min(vw, 2000);
  vh = Math.min(vh, 1000);
  vx = Math.max(0, Math.min(vx, 2000 - vw));
  vy = Math.max(0, Math.min(vy, 1000 - vh));

  animateViewBox({ x: vx, y: vy, w: vw, h: vh });
}

function resetZoom() {
  animateViewBox({ x: 0, y: 0, w: 2000, h: 1000 });
}

function animateViewBox(target) {
  if (animFrame) cancelAnimationFrame(animFrame);
  function step() {
    const t = 0.14;
    vb.x += (target.x - vb.x) * t;
    vb.y += (target.y - vb.y) * t;
    vb.w += (target.w - vb.w) * t;
    vb.h += (target.h - vb.h) * t;
    svg.setAttribute('viewBox', `${vb.x.toFixed(1)} ${vb.y.toFixed(1)} ${vb.w.toFixed(1)} ${vb.h.toFixed(1)}`);
    const done = Math.abs(target.x - vb.x) < 0.5 && Math.abs(target.w - vb.w) < 0.5;
    animFrame = done ? null : requestAnimationFrame(step);
  }
  animFrame = requestAnimationFrame(step);
}

// ── Utility ───────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ── DOM refs ──────────────────────────────────────────────────────────────────

const setupScreen    = document.getElementById('setup-screen');
const gameScreen     = document.getElementById('game-screen');
const resultScreen   = document.getElementById('result-screen');
const countryNameEl  = document.getElementById('country-name');
const scoreEl        = document.getElementById('score');
const roundEl        = document.getElementById('round');
const totalRoundsEl  = document.getElementById('total-rounds');
const finalScoreEl   = document.getElementById('final-score');
const finalTotalEl   = document.getElementById('final-total');
const finalPercentEl = document.getElementById('final-percent');
const revealBtn      = document.getElementById('reveal-btn');
const selfScoreBtns  = document.getElementById('self-score-btns');
const correctBtn     = document.getElementById('correct-btn');
const wrongBtn       = document.getElementById('wrong-btn');
const startBtn       = document.getElementById('start-btn');
const playAgainBtn   = document.getElementById('play-again');
const difficultyDesc = document.getElementById('difficulty-desc');
const svg            = document.getElementById('world-map');

// ── Game state ────────────────────────────────────────────────────────────────

let selectedDifficulty = 'easy';
let selectedLength     = 10;
let queue              = [];
let currentCountry     = null;
let score              = 0;
let round              = 0;

// ── Setup screen interactions ─────────────────────────────────────────────────

document.querySelectorAll('#difficulty-group .opt-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#difficulty-group .opt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedDifficulty = btn.dataset.value;
    difficultyDesc.textContent = DIFFICULTY_HINTS[selectedDifficulty];
  });
});

document.querySelectorAll('#length-group .opt-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#length-group .opt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedLength = parseInt(btn.dataset.value);
  });
});

startBtn.addEventListener('click', () => {
  setupScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  startGame();
});

// ── Map loading ───────────────────────────────────────────────────────────────

async function loadMap() {
  try {
    await loadScript('https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js');
    const res = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json');
    const topology = await res.json();
    const geojson = topojson.feature(topology, topology.objects.countries);
    renderMap(geojson);
    startBtn.textContent = 'Start Quiz';
    startBtn.disabled = false;
  } catch (err) {
    startBtn.textContent = 'Failed to load map';
    console.error(err);
  }
}

function renderMap(geojson) {
  svg.innerHTML = '';
  geojson.features.forEach(feature => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', featureToD(feature.geometry));
    const iso2 = NUMERIC_TO_ISO2[parseInt(feature.id)];
    if (iso2) path.dataset.iso = iso2;
    svg.appendChild(path);
  });
}

// ── Game logic ────────────────────────────────────────────────────────────────

function startGame() {
  const pool = DIFFICULTY_POOLS[selectedDifficulty];
  const available = [...svg.querySelectorAll('path[data-iso]')]
    .filter(p => pool.has(p.dataset.iso));

  const count = Math.min(selectedLength, available.length);
  queue = shuffle(available).slice(0, count);
  score = 0;
  round = 0;
  scoreEl.textContent = '0';
  totalRoundsEl.textContent = queue.length;
  nextRound();
}

function nextRound() {
  if (round >= queue.length) { endGame(); return; }

  // Clear highlights
  svg.querySelectorAll('path').forEach(p => p.classList.remove('target'));

  // Reset panel
  countryNameEl.classList.add('hidden');
  countryNameEl.textContent = '—';
  revealBtn.classList.remove('hidden');
  selfScoreBtns.classList.add('hidden');

  currentCountry = queue[round++];
  roundEl.textContent = round;
  currentCountry.classList.add('target');
  zoomToCountry(currentCountry);
}

revealBtn.addEventListener('click', () => {
  revealBtn.classList.add('hidden');
  countryNameEl.textContent = COUNTRIES[currentCountry.dataset.iso] || currentCountry.dataset.iso;
  countryNameEl.classList.remove('hidden');
  selfScoreBtns.classList.remove('hidden');
});

correctBtn.addEventListener('click', () => {
  score++;
  scoreEl.textContent = score;
  advance();
});

wrongBtn.addEventListener('click', advance);

function advance() {
  selfScoreBtns.classList.add('hidden');
  setTimeout(nextRound, 400);
}

function endGame() {
  gameScreen.classList.add('hidden');
  resultScreen.classList.remove('hidden');
  finalScoreEl.textContent = score;
  finalTotalEl.textContent = queue.length;
  finalPercentEl.textContent = Math.round((score / queue.length) * 100) + '%';
}

playAgainBtn.addEventListener('click', () => {
  resultScreen.classList.add('hidden');
  svg.querySelectorAll('path').forEach(p => p.classList.remove('target'));
  resetZoom();
  setupScreen.classList.remove('hidden');
});

// ── Init ──────────────────────────────────────────────────────────────────────

loadMap();
