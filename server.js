
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
let WebcastPushConnection;
try {
  ({ WebcastPushConnection } = require('tiktok-live-connector'));
} catch (e) {
  WebcastPushConnection = null;
}

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const STATE_PATH = path.join(__dirname, 'data', 'state.json');

const defaultState = {
  username: '',
  timerDuration: 600,
  timeLeft: 600,
  timerRunning: false,
  roundEndedAt: null,
  showWinner: false,
  winner: '',
  scores: { FB: 0, GS: 0, BJK: 0, TS: 0 },
  logos: { FB: '', GS: '', BJK: '', TS: '' },
  gifts: {
    rose: 'FB',
    tiktok: 'GS',
    gg: 'BJK',
    'ice cream cone': 'TS',
    'dondurma kulahi': 'TS'
  },
  audio: { enabled: true },
  leader: '',
  giftFeed: []
};

function loadState() {
  try {
    const raw = fs.readFileSync(STATE_PATH, 'utf8');
    return { ...defaultState, ...JSON.parse(raw) };
  } catch (e) {
    return structuredClone(defaultState);
  }
}

let state = loadState();
let timerInterval = null;
let connection = null;
let currentConnectedUsername = '';

function saveState() {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

function getLeader(scores) {
  let leader = '';
  let max = -1;
  let tied = false;
  for (const [team, score] of Object.entries(scores)) {
    if (score > max) {
      max = score;
      leader = team;
      tied = false;
    } else if (score === max) {
      tied = true;
    }
  }
  if (max <= 0 || tied) return '';
  return leader;
}

function emitState() {
  state.leader = getLeader(state.scores);
  saveState();
  io.emit('state', state);
}

function addFeed(message) {
  state.giftFeed.unshift({ message, at: Date.now() });
  state.giftFeed = state.giftFeed.slice(0, 8);
}

function endRound() {
  state.timerRunning = false;
  const leader = getLeader(state.scores);
  state.winner = leader || 'BERABERE';
  state.showWinner = true;
  state.roundEndedAt = Date.now();
  emitState();

  setTimeout(() => {
    state.scores = { FB: 0, GS: 0, BJK: 0, TS: 0 };
    state.timeLeft = state.timerDuration;
    state.showWinner = false;
    state.winner = '';
    state.roundEndedAt = null;
    emitState();
  }, 3000);
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  state.timerRunning = true;
  emitState();

  timerInterval = setInterval(() => {
    if (!state.timerRunning) return;
    state.timeLeft -= 1;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      clearInterval(timerInterval);
      timerInterval = null;
      endRound();
      return;
    }
    emitState();
  }, 1000);
}

function stopTimer() {
  state.timerRunning = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  emitState();
}

async function disconnectTikTok() {
  if (connection) {
    try { connection.disconnect(); } catch (e) {}
    connection = null;
    currentConnectedUsername = '';
  }
}

function normalizeGiftName(name) {
  return String(name || '').trim().toLowerCase();
}

function awardTeam(team, points, reason) {
  if (!state.scores[team] && state.scores[team] !== 0) return;
  state.scores[team] += points;
  addFeed(reason);
  emitState();
}

async function connectTikTok(username) {
  if (!WebcastPushConnection) {
    throw new Error('tiktok-live-connector not installed');
  }
  await disconnectTikTok();
  connection = new WebcastPushConnection(username, { enableExtendedGiftInfo: true });
  connection.on('gift', data => {
    const giftName = normalizeGiftName(data.giftName);
    const mappedTeam = state.gifts[giftName];
    if (mappedTeam) {
      const count = data.repeatCount && data.repeatCount > 0 ? data.repeatCount : 1;
      awardTeam(mappedTeam, count, `${data.uniqueId || 'Biri'} -> ${mappedTeam} +${count} (${data.giftName})`);
    }
  });
  connection.on('connected', () => {
    addFeed(`TikTok baglandi: ${username}`);
    emitState();
  });
  connection.on('disconnected', () => {
    addFeed(`TikTok baglantisi koptu: ${username}`);
    emitState();
  });
  connection.on('error', err => {
    addFeed(`TikTok hata: ${err?.message || 'baglanti hatasi'}`);
    emitState();
  });

  await connection.connect();
  currentConnectedUsername = username;
  state.username = username;
  emitState();
}

app.get('/api/state', (req, res) => res.json(state));

app.post('/api/settings', (req, res) => {
  const body = req.body || {};
  if (typeof body.timerDuration === 'number' && body.timerDuration >= 10) {
    state.timerDuration = body.timerDuration;
    if (!state.timerRunning) state.timeLeft = body.timerDuration;
  }
  if (body.logos && typeof body.logos === 'object') {
    state.logos = { ...state.logos, ...body.logos };
  }
  if (body.audio && typeof body.audio === 'object') {
    state.audio = { ...state.audio, ...body.audio };
  }
  if (body.username !== undefined) {
    state.username = String(body.username || '').trim();
  }
  emitState();
  res.json({ ok: true, state });
});

app.post('/api/gifts', (req, res) => {
  const body = req.body || {};
  if (body.gifts && typeof body.gifts === 'object') {
    const normalized = {};
    for (const [gift, team] of Object.entries(body.gifts)) {
      normalized[normalizeGiftName(gift)] = team;
    }
    state.gifts = normalized;
    emitState();
  }
  res.json({ ok: true, state });
});

app.post('/api/timer/start', (req, res) => {
  if (req.body && typeof req.body.duration === 'number' && req.body.duration >= 10) {
    state.timerDuration = req.body.duration;
    state.timeLeft = req.body.duration;
  } else if (state.timeLeft <= 0 || state.timeLeft > state.timerDuration) {
    state.timeLeft = state.timerDuration;
  }
  startTimer();
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
  const { team, points } = req.body || {};
  const pts = Number(points || 1);
  if (!['FB', 'GS', 'BJK', 'TS'].includes(team)) {
    return res.status(400).json({ ok: false, error: 'invalid team' });
  }
  awardTeam(team, pts, `Test -> ${team} +${pts}`);
  res.json({ ok: true, state });
});

app.post('/api/tiktok/connect', async (req, res) => {
  const username = String(req.body?.username || '').trim().replace('@', '');
  if (!username) return res.status(400).json({ ok: false, error: 'username required' });
  try {
    await connectTikTok(username);
    res.json({ ok: true, state });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message || 'connect failed' });
  }
});

app.post('/api/tiktok/disconnect', async (req, res) => {
  await disconnectTikTok();
  res.json({ ok: true });
});

io.on('connection', socket => {
  socket.emit('state', state);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`running on http://localhost:${PORT}`);
  emitState();
});
