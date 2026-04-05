const socket = io();

const state = {
  scores: {},
  teamConfig: {},
  lastScoredTeam: null,
  timeLeftSeconds: 600,
  leader: null,
  winner: null
};

const teamsGrid = document.getElementById('teamsGrid');
const timerText = document.getElementById('timerText');
const winnerOverlay = document.getElementById('winnerOverlay');
const winnerName = document.getElementById('winnerName');

const audioEls = {
  FB: document.getElementById('audio-fb'),
  GS: document.getElementById('audio-gs'),
  BJK: document.getElementById('audio-bjk'),
  TS: document.getElementById('audio-ts')
};
const audioPositions = { FB: 0, GS: 0, BJK: 0, TS: 0 };
let currentAudioTeam = null;
let audioUnlocked = false;
let lastLeader = null;
let lastWinner = null;

function fmt(total) {
  total = Math.max(0, Number(total || 0));
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function teamLogo(team) {
  return `/assets/${team.toLowerCase()}.svg`;
}

function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  Object.values(audioEls).forEach((audio) => {
    if (!audio) return;
    audio.volume = 1;
    audio.addEventListener('ended', () => {
      const team = Object.keys(audioEls).find((key) => audioEls[key] === audio);
      if (team && currentAudioTeam === team) {
        audio.currentTime = 0;
        audioPositions[team] = 0;
        audio.play().catch(() => {});
      } else if (team) {
        audioPositions[team] = 0;
      }
    });
  });
}

function playLeaderAudio(team) {
  if (!audioUnlocked) return;
  if (team === currentAudioTeam) return;

  if (currentAudioTeam && audioEls[currentAudioTeam]) {
    const current = audioEls[currentAudioTeam];
    audioPositions[currentAudioTeam] = current.currentTime || 0;
    current.pause();
  }

  currentAudioTeam = team;

  if (!team || !audioEls[team]) return;
  const next = audioEls[team];
  try {
    next.currentTime = audioPositions[team] || 0;
  } catch {
    next.currentTime = 0;
  }
  next.play().catch(() => {});
}

function renderTeams() {
  const entries = Object.entries(state.teamConfig);
  teamsGrid.innerHTML = entries.map(([key, config]) => {
    const score = state.scores[key] || 0;
    const active = key === state.lastScoredTeam ? 'active' : '';
    return `
      <article class="team-card ${active}" style="--grad: linear-gradient(135deg, ${config.colors[0]}, ${config.colors[1]});">
        <div class="team-top">
          <div class="logo-wrap"><img src="${teamLogo(key)}" alt="${config.name} logo"></div>
          <div class="team-short">${config.short}</div>
        </div>
        <div class="team-name">${config.name}</div>
        <div class="score-row">
          <div class="score-number" id="score-${key}">${score}</div>
        </div>
        <div class="puan-label">PUAN</div>
      </article>`;
  }).join('');
}

function triggerScoreAnimation(team) {
  const el = document.getElementById(`score-${team}`);
  if (!el) return;
  el.classList.remove('bump');
  void el.offsetWidth;
  el.classList.add('bump');
}

function showWinner(winner) {
  if (!winner || winner === 'TIE') return;
  winnerName.textContent = `${winner} KAZANDI!`;
  winnerOverlay.classList.remove('hidden');
  setTimeout(() => winnerOverlay.classList.add('hidden'), 2800);
}

socket.on('state', (nextState) => {
  Object.assign(state, nextState);
  timerText.textContent = fmt(state.timeLeftSeconds);
  renderTeams();

  if (nextState?.animation?.type === 'score' && nextState.animation.team) {
    triggerScoreAnimation(nextState.animation.team);
  }

  if (state.leader !== lastLeader) {
    playLeaderAudio(state.leader || null);
    lastLeader = state.leader;
  }

  if (state.winner && state.winner !== lastWinner) {
    showWinner(state.winner);
    if (state.winner !== 'TIE') playLeaderAudio(state.winner);
    lastWinner = state.winner;
  }
  if (!state.winner) lastWinner = null;
});

window.addEventListener('pointerdown', unlockAudio, { once: true });
window.addEventListener('keydown', unlockAudio, { once: true });
