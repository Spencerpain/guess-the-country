// game.js — Guess the Country

const ROUNDS = 10;

const COUNTRIES = {
  US: 'United States', CA: 'Canada', MX: 'Mexico', BR: 'Brazil',
  AR: 'Argentina', CL: 'Chile', CO: 'Colombia', PE: 'Peru',
  GB: 'United Kingdom', FR: 'France', DE: 'Germany', IT: 'Italy',
  ES: 'Spain', PT: 'Portugal', NL: 'Netherlands', BE: 'Belgium',
  SE: 'Sweden', NO: 'Norway', FI: 'Finland', DK: 'Denmark',
  PL: 'Poland', UA: 'Ukraine', RO: 'Romania', GR: 'Greece',
  TR: 'Turkey', RU: 'Russia', CN: 'China', JP: 'Japan',
  KR: 'South Korea', IN: 'India', AU: 'Australia', NZ: 'New Zealand',
  ZA: 'South Africa', NG: 'Nigeria', EG: 'Egypt', KE: 'Kenya',
  SA: 'Saudi Arabia', IR: 'Iran', IQ: 'Iraq', PK: 'Pakistan',
  ID: 'Indonesia', TH: 'Thailand', VN: 'Vietnam', PH: 'Philippines',
};

// UN M49 numeric → ISO alpha-2
const NUMERIC_TO_ISO2 = {
  4:'AF',8:'AL',12:'DZ',24:'AO',32:'AR',36:'AU',40:'AT',50:'BD',56:'BE',
  68:'BO',76:'BR',100:'BG',116:'KH',120:'CM',124:'CA',144:'LK',152:'CL',
  156:'CN',170:'CO',188:'CR',191:'HR',192:'CU',203:'CZ',208:'DK',218:'EC',
  818:'EG',231:'ET',246:'FI',250:'FR',276:'DE',288:'GH',300:'GR',320:'GT',
  332:'HT',340:'HN',348:'HU',356:'IN',360:'ID',364:'IR',368:'IQ',372:'IE',
  376:'IL',380:'IT',392:'JP',400:'JO',404:'KE',408:'KP',410:'KR',418:'LA',
  422:'LB',434:'LY',484:'MX',504:'MA',508:'MZ',524:'NP',528:'NL',554:'NZ',
  562:'NE',566:'NG',578:'NO',586:'PK',600:'PY',604:'PE',608:'PH',616:'PL',
  620:'PT',634:'QA',642:'RO',643:'RU',682:'SA',686:'SN',706:'SO',710:'ZA',
  724:'ES',729:'SD',752:'SE',756:'CH',760:'SY',764:'TH',788:'TN',792:'TR',
  800:'UG',804:'UA',784:'AE',826:'GB',840:'US',858:'UY',862:'VE',704:'VN',
  887:'YE',894:'ZM',716:'ZW',
};

let queue = [];
let currentCountry = null;
let score = 0;
let round = 0;
let answered = false;

const countryNameEl = document.getElementById('country-name');
const feedbackEl    = document.getElementById('feedback');
const scoreEl       = document.getElementById('score');
const roundEl       = document.getElementById('round');
const totalRoundsEl = document.getElementById('total-rounds');
const resultScreen  = document.getElementById('result-screen');
const finalScoreEl  = document.getElementById('final-score');
const finalTotalEl  = document.getElementById('final-total');
const playAgainBtn  = document.getElementById('play-again');
const svg           = document.getElementById('world-map');

// ── Projection & path building ────────────────────────────────────────────────

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

// ── Map loading ───────────────────────────────────────────────────────────────

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function loadMap() {
  countryNameEl.textContent = 'Loading map…';
  try {
    await loadScript('https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js');
    const res = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
    const topology = await res.json();
    const geojson = topojson.feature(topology, topology.objects.countries);
    renderMap(geojson);
    startGame();
  } catch (err) {
    countryNameEl.textContent = 'Failed to load map.';
    console.error(err);
  }
}

// ── Map rendering ─────────────────────────────────────────────────────────────

function renderMap(geojson) {
  svg.innerHTML = '';
  geojson.features.forEach(feature => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', featureToD(feature.geometry));

    const iso2 = NUMERIC_TO_ISO2[parseInt(feature.id)];
    if (iso2) path.dataset.iso = iso2;

    path.addEventListener('click', () => handleClick(path));
    svg.appendChild(path);
  });
}

// ── Game logic ────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startGame() {
  const pool = [...svg.querySelectorAll('path[data-iso]')]
    .filter(p => COUNTRIES[p.dataset.iso]);

  queue = shuffle(pool).slice(0, ROUNDS);
  score = 0;
  round = 0;
  totalRoundsEl.textContent = queue.length;
  resultScreen.classList.add('hidden');
  nextRound();
}

function nextRound() {
  if (round >= queue.length) { endGame(); return; }

  svg.querySelectorAll('path').forEach(p => p.classList.remove('correct', 'wrong', 'target'));
  feedbackEl.textContent = '';
  feedbackEl.className = '';
  answered = false;

  currentCountry = queue[round++];
  roundEl.textContent = round;
  countryNameEl.textContent = COUNTRIES[currentCountry.dataset.iso];
}

function handleClick(path) {
  if (answered) return;
  answered = true;

  if (path === currentCountry) {
    score++;
    scoreEl.textContent = score;
    path.classList.add('correct');
    feedbackEl.textContent = 'Correct!';
    feedbackEl.className = 'correct';
  } else {
    path.classList.add('wrong');
    currentCountry.classList.add('target');
    feedbackEl.textContent = 'Wrong — correct country highlighted in orange';
    feedbackEl.className = 'wrong';
  }

  setTimeout(nextRound, 1800);
}

function endGame() {
  finalScoreEl.textContent = score;
  finalTotalEl.textContent = queue.length;
  resultScreen.classList.remove('hidden');
}

playAgainBtn.addEventListener('click', loadMap);

loadMap();
