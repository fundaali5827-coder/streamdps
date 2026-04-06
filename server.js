const express = require('express');
const path = require('path');
const fs = require('fs');

let WebcastPushConnection = null;
try { ({ WebcastPushConnection } = require('tiktok-live-connector')); } catch (e) {}

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const STATE_FILE = path.join(__dirname, 'data', 'state.json');

const defaultState = {
  timerDuration: 600,
  timeLeft: 600,
  timerRunning: false,
  scores: { FB: 0, GS: 0, BJK: 0, TS: 0 },
  winner: '',
  showWinner: false,
  username: '',
  logos: {
    FB: 'logos/fb.png',
    GS: 'logos/gs.png',
    BJK: 'logos/bjk.png',
    TS: 'logos/ts.png'
  },
  gifts: {
    rose: 'FB',
    tiktok: 'GS',
    gg: 'BJK',
    'ice cream cone': 'TS',
    'dondurma kulahi': 'TS'
  },
  leader: ''
};

function loadState() {
  try {
    const raw = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    return {
      ...defaultState,
      ...raw,
      scores: { ...defaultState.scores, ...(raw.scores || {}) },
      logos: { ...defaultState.logos, ...(raw.logos || {}) },
      gifts: { ...defaultState.gifts, ...(raw.gifts || {}) }
    };
  } catch (e) {
    return JSON.parse(JSON.stringify(defaultState));
  }
}

let state = loadState();
let timer = null;
let tiktokConnection = null;

function saveState() {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function getLeader(scores) {
  let leader = '';
  let max = -1;
  let tie = false;
  for (const [team, score] of Object.entries(scores)) {
    if (score > max) {
      max = score;
      leader = team;
      tie = false;
    } else if (score === max) {
      tie = true;
    }
  }
  if (max <= 0 || tie) return '';
  return leader;
}

function emitState() {
  state.leader = getLeader(state.scores);
  saveState();
}

function stopTimer() {
  state.timerRunning = false;
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  emitState();
}

function endRound() {
  stopTimer();
  state.winner = state.leader || 'BERABERE';
  state.showWinner = true;
  emitState();

  setTimeout(() => {
    state.scores = { FB: 0, GS: 0, BJK: 0, TS: 0 };
    state.timeLeft = state.timerDuration;
    state.winner = '';
    state.showWinner = false;
    emitState();
  }, 3500);
}

function startTimer(duration) {
  if (typeof duration === 'number' && duration >= 10) {
    state.timerDuration = duration;
  }
  state.timeLeft = state.timerDuration;
  state.timerRunning = true;
  state.showWinner = false;
  state.winner = '';
  emitState();

  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    if (!state.timerRunning) return;
    state.timeLeft -= 1;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      clearInterval(timer);
      timer = null;
      endRound();
    } else {
      emitState();
    }
  }, 1000);
}

app.get('/api/state', (req, res) => {
  emitState();
  res.json(state);
});

app.post('/api/settings', (req, res) => {
  const body = req.body || {};
  if (typeof body.timerDuration === 'number' && body.timerDuration >= 10) {
    state.timerDuration = body.timerDuration;
    if (!state.timerRunning) state.timeLeft = body.timerDuration;
  }
  if (body.username !== undefined) {
    state.username = String(body.username || '').trim().replace('@', '');
  }
  if (body.logos && typeof body.logos === 'object') {
    state.logos = { ...state.logos, ...body.logos };
  }
  emitState();
  res.json({ ok: true, state });
});

app.post('/api/gifts', (req, res) => {
  const incoming = req.body?.gifts || {};
  const clean = {};
  for (const [gift, team] of Object.entries(incoming)) {
    if (String(gift).trim() && ['FB', 'GS', 'BJK', 'TS'].includes(team)) {
      clean[String(gift).trim().toLowerCase()] = team;
    }
  }
  if (Object.keys(clean).length) {
    state.gifts = clean;
    emitState();
  }
  res.json({ ok: true, state });
});

app.post('/api/timer/start', (req, res) => {
  startTimer(Number(req.body?.duration || state.timerDuration || 600));
  res.json({ ok: true, state });
});

app.post('/api/timer/stop', (req, res) => {
  stopTimer();
  res.json({ ok: true, state });
});

app.post('/api/timer/reset', (req, res) => {
  stopTimer();
  state.timeLeft = state.timerDuration;
  state.showWinner = false;
  state.winner = '';
  emitState();
  res.json({ ok: true, state });
});

app.post('/api/scores/reset', (req, res) => {
  state.scores = { FB: 0, GS: 0, BJK: 0, TS: 0 };
  state.showWinner = false;
  state.winner = '';
  emitState();
  res.json({ ok: true, state });
});

app.post('/api/scores/add', (req, res) => {
  const team = req.body?.team;
  const points = Number(req.body?.points || 1);
  if (!['FB', 'GS', 'BJK', 'TS'].includes(team)) {
    return res.status(400).json({ ok: false, error: 'Gecersiz takim' });
  }
  state.scores[team] += points;
  emitState();
  res.json({ ok: true, state });
});

app.get('/add/:team', (req, res) => {
  const team = String(req.params.team || '').toUpperCase();
  if (!['FB', 'GS', 'BJK', 'TS'].includes(team)) return res.status(400).send('hatali takim');
  state.scores[team] += 1;
  emitState();
  res.send('ok');
});

async function disconnectTikTok() {
  if (tiktokConnection) {
    try { tiktokConnection.disconnect(); } catch (e) {}
    tiktokConnection = null;
  }
}

app.post('/api/tiktok/connect', async (req, res) => {
  const username = String(req.body?.username || state.username || '').trim().replace('@', '');
  if (!username) return res.status(400).json({ ok: false, error: 'Kullanici adi gerekli' });
  if (!WebcastPushConnection) return res.status(500).json({ ok: false, error: 'TikTok modulu kurulu degil' });

  try {
    await disconnectTikTok();
    tiktokConnection = new WebcastPushConnection(username, { enableExtendedGiftInfo: true });
tiktokConnection.on('gift', (data) => {
  const name = String(data.giftName || '').toLowerCase().trim();
  const mapped = state.gifts[name];

  if (!mapped) return;

  // SADECE STREAK BİTİNCE SAY
  if (data.giftType === 1) {
    if (!data.repeatEnd) return;
  }

  state.scores[mapped] += 1;
  emitState();
});
    await tiktokConnection.connect();
    state.username = username;
    emitState();
    res.json({ ok: true, state });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'TikTok baglanti hatasi' });
  }
});

app.post('/api/tiktok/disconnect', async (req, res) => {
  await disconnectTikTok();
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  emitState();
  console.log('Server calisiyor:', PORT);
});
