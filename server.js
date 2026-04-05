import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { WebcastPushConnection } from 'tiktok-live-connector';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const PORT = process.env.PORT || 3000;

const teamConfig = {
  FB: {
    key: 'FB',
    short: 'FB',
    name: 'Fenerbahce',
    aliases: ['Rose', 'Gul', 'Gul x1', 'Gul x5', 'Gul x10', 'Gul', 'Gul Cicek', 'Gul buketi', 'Gül'],
    colors: ['#0f2f78', '#f3c545']
  },
  GS: {
    key: 'GS',
    short: 'GS',
    name: 'Galatasaray',
    aliases: ['TikTok'],
    colors: ['#8b1f14', '#f3b321']
  },
  BJK: {
    key: 'BJK',
    short: 'BJK',
    name: 'Besiktas',
    aliases: ['GG'],
    colors: ['#191919', '#d7d7d7']
  },
  TS: {
    key: 'TS',
    short: 'TS',
    name: 'Trabzonspor',
    aliases: ['Ice Cream Cone', 'Dondurma Kulahi', 'Dondurma Külahı'],
    colors: ['#7d173f', '#5ea7ff']
  }
};

const defaultScores = () => ({ FB: 0, GS: 0, BJK: 0, TS: 0 });

let scores = defaultScores();
let currentUsername = '';
let liveConnection = null;
let isConnected = false;
let roundDurationSeconds = 600;
let roundEndAt = null;
let roundRunning = false;
let winner = null;
let lastScoredTeam = null;
let recentEvents = [];
let timerInterval = null;

function now() {
  return Date.now();
}

function normalizeGiftName(name = '') {
  return String(name)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function mapGiftToTeam(giftName) {
  const normalized = normalizeGiftName(giftName);
  for (const [teamKey, config] of Object.entries(teamConfig)) {
    for (const alias of config.aliases) {
      if (normalizeGiftName(alias) === normalized) return teamKey;
    }
  }
  return null;
}

function getLeaders() {
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore <= 0) return [];
  return Object.keys(scores).filter((key) => scores[key] === maxScore);
}

function getSingleLeader() {
  const leaders = getLeaders();
  return leaders.length === 1 ? leaders[0] : null;
}

function getTimeLeftSeconds() {
  if (!roundRunning || !roundEndAt) return roundDurationSeconds;
  return Math.max(0, Math.ceil((roundEndAt - now()) / 1000));
}

function computeWinner() {
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore <= 0) return null;
  const leaders = Object.keys(scores).filter((key) => scores[key] === maxScore);
  return leaders.length === 1 ? leaders[0] : 'TIE';
}

function pushEvent(text, type = 'system') {
  recentEvents.unshift({ text, type, time: now() });
  recentEvents = recentEvents.slice(0, 20);
}

function buildState(extra = {}) {
  return {
    scores,
    username: currentUsername,
    isConnected,
    teamConfig,
    winner,
    leaders: getLeaders(),
    leader: getSingleLeader(),
    lastScoredTeam,
    roundDurationSeconds,
    roundRunning,
    timeLeftSeconds: getTimeLeftSeconds(),
    recentEvents,
    overlayUrl: currentUsername ? `/?overlay=1&user=${encodeURIComponent(currentUsername)}` : '/?overlay=1',
    controlUrl: '/control.html',
    ...extra
  };
}

function broadcastState(extra = {}) {
  io.emit('state', buildState(extra));
}

function resetScores() {
  scores = defaultScores();
  winner = null;
  lastScoredTeam = null;
}

function startRound(seconds = roundDurationSeconds) {
  roundDurationSeconds = Math.max(10, Number(seconds) || 600);
  roundEndAt = now() + (roundDurationSeconds * 1000);
  roundRunning = true;
  winner = null;
  pushEvent(`Yeni tur basladi: ${roundDurationSeconds} sn`, 'system');
  broadcastState();
}

function stopRound() {
  roundRunning = false;
  roundEndAt = null;
  broadcastState();
}

function finishRound() {
  if (!roundRunning) return;
  roundRunning = false;
  roundEndAt = null;
  winner = computeWinner();
  if (winner === 'TIE') {
    pushEvent('Sure bitti: Beraberlik.', 'winner');
  } else if (winner) {
    pushEvent(`Sure bitti: ${teamConfig[winner].name} kazandi.`, 'winner');
  } else {
    pushEvent('Sure bitti: puan gelmedi.', 'winner');
  }
  broadcastState({ animation: { type: 'winner', winner } });
  setTimeout(() => {
    resetScores();
    startRound(roundDurationSeconds);
  }, 3500);
}

function ensureTimerLoop() {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    if (!roundRunning) return;
    const left = getTimeLeftSeconds();
    if (left <= 0) {
      finishRound();
    } else {
      broadcastState();
    }
  }, 1000);
}

async function disconnectLive() {
  if (liveConnection) {
    try {
      await liveConnection.disconnect();
    } catch {
      // ignore
    }
  }
  liveConnection = null;
  isConnected = false;
}

async function connectLive(username) {
  await disconnectLive();
  currentUsername = String(username || '').replace(/^@/, '').trim();
  if (!currentUsername) throw new Error('Kullanici adi bos olamaz.');

  liveConnection = new WebcastPushConnection(currentUsername);

  liveConnection.on('gift', (data) => {
    const giftName = data.giftName || data.extendedGiftInfo?.name || 'Unknown Gift';
    const repeatCount = Number(data.repeatCount || 1);
    const sender = data.uniqueId || 'Bilinmeyen';
    const team = mapGiftToTeam(giftName);

    if (!team) {
      pushEvent(`${sender} -> ${giftName} eslesmedi`, 'ignored');
      return broadcastState();
    }

    scores[team] += Math.max(1, repeatCount);
    lastScoredTeam = team;
    pushEvent(`${sender} ${giftName} gonderdi -> ${team} +${Math.max(1, repeatCount)}`, 'gift');
    broadcastState({ animation: { type: 'score', team, points: Math.max(1, repeatCount) } });
  });

  liveConnection.on('streamEnd', () => {
    isConnected = false;
    pushEvent('Canli yayin sona erdi.', 'system');
    broadcastState();
  });

  liveConnection.on('error', (err) => {
    isConnected = false;
    pushEvent(`Baglanti hatasi: ${err?.message || 'Bilinmeyen hata'}`, 'error');
    broadcastState();
  });

  await liveConnection.connect();
  isConnected = true;
  pushEvent(`@${currentUsername} hesabina baglandi.`, 'system');
  broadcastState();
}

app.get('/api/state', (_req, res) => {
  res.json(buildState());
});

app.post('/api/connect', async (req, res) => {
  try {
    await connectLive(req.body?.username || '');
    res.json({ ok: true, state: buildState() });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message || 'Baglanti kurulamadi.' });
  }
});

app.post('/api/disconnect', async (_req, res) => {
  await disconnectLive();
  pushEvent('Baglanti kapatildi.', 'system');
  broadcastState();
  res.json({ ok: true });
});

app.post('/api/round/start', (req, res) => {
  const seconds = Number(req.body?.seconds || roundDurationSeconds);
  resetScores();
  startRound(seconds);
  res.json({ ok: true, state: buildState() });
});

app.post('/api/round/stop', (_req, res) => {
  stopRound();
  pushEvent('Tur durduruldu.', 'system');
  res.json({ ok: true, state: buildState() });
});

app.post('/api/round/duration', (req, res) => {
  const seconds = Math.max(10, Number(req.body?.seconds || 600));
  roundDurationSeconds = seconds;
  pushEvent(`Tur suresi ${seconds} sn olarak ayarlandi.`, 'system');
  if (!roundRunning) {
    broadcastState();
  }
  res.json({ ok: true, state: buildState() });
});

app.post('/api/reset', (_req, res) => {
  resetScores();
  pushEvent('Skor sifirlandi.', 'system');
  broadcastState();
  res.json({ ok: true, state: buildState() });
});

app.post('/api/test-score', (req, res) => {
  const team = String(req.body?.team || '').toUpperCase();
  if (!teamConfig[team]) {
    return res.status(400).json({ ok: false, error: 'Gecersiz takim.' });
  }
  scores[team] += 1;
  lastScoredTeam = team;
  pushEvent(`Test puani -> ${team} +1`, 'gift');
  broadcastState({ animation: { type: 'score', team, points: 1 } });
  res.json({ ok: true, state: buildState() });
});

app.get('/health', (_req, res) => res.json({ ok: true }));

io.on('connection', (socket) => {
  socket.emit('state', buildState());
});

ensureTimerLoop();
startRound(roundDurationSeconds);

server.listen(PORT, () => {
  console.log(`StreamDPS timer server running on http://localhost:${PORT}`);
});
