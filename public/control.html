<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Kontrol Paneli</title>
<style>
body{font-family:Arial,Helvetica,sans-serif;background:#111827;color:#fff;margin:0;padding:24px}
.wrap{max-width:1000px;margin:0 auto;display:grid;grid-template-columns:1.1fr .9fr;gap:20px}
.panel{background:#1f2937;border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:18px}
h1,h2{margin:0 0 14px}
label{display:block;font-size:14px;color:#d1d5db;margin:10px 0 6px}
input,select,button,textarea{width:100%;padding:12px 14px;border-radius:12px;border:1px solid #374151;background:#0f172a;color:#fff}
button{cursor:pointer;background:#2563eb;border:none;font-weight:700}
button.secondary{background:#374151}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.small{font-size:13px;color:#9ca3af}
.row{display:flex;gap:10px;align-items:center}
.row button{width:auto}
.status{padding:10px 12px;border-radius:10px;background:#0f172a;margin-top:12px;min-height:42px}
.live{margin-top:16px;font-size:28px;font-weight:800}
.scoregrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:12px}
.scorebox{padding:14px;border-radius:14px;background:#0f172a;text-align:center}
code{background:#0b1220;padding:2px 6px;border-radius:6px}
</style>
</head>
<body>
<div class="wrap">
  <div class="panel">
    <h1>Kontrol Paneli</h1>
    <div class="small">Overlay: <code>/overlay.html</code></div>

    <label>TikTok kullanici adi</label>
    <div class="row">
      <input id="username" placeholder="ornek: kullaniciadi" />
      <button id="connectBtn" onclick="connectTikTok()">Baglan</button>
      <button class="secondary" onclick="disconnectTikTok()">Kes</button>
    </div>

    <label>Sure (saniye)</label>
    <div class="row">
      <input id="duration" type="number" min="10" value="600" />
      <button onclick="saveSettings()">Kaydet</button>
    </div>

    <div class="grid2">
      <div>
        <label>FB logo URL</label>
        <input id="logoFB" placeholder="https://..." />
      </div>
      <div>
        <label>GS logo URL</label>
        <input id="logoGS" placeholder="https://..." />
      </div>
      <div>
        <label>BJK logo URL</label>
        <input id="logoBJK" placeholder="https://..." />
      </div>
      <div>
        <label>TS logo URL</label>
        <input id="logoTS" placeholder="https://..." />
      </div>
    </div>

    <label>Hediye eslestirmeleri</label>
    <div class="grid2">
      <div><input id="gift1" value="rose" /></div><div><select id="team1"><option>FB</option><option>GS</option><option>BJK</option><option>TS</option></select></div>
      <div><input id="gift2" value="tiktok" /></div><div><select id="team2"><option>FB</option><option selected>GS</option><option>BJK</option><option>TS</option></select></div>
      <div><input id="gift3" value="gg" /></div><div><select id="team3"><option>FB</option><option>GS</option><option selected>BJK</option><option>TS</option></select></div>
      <div><input id="gift4" value="ice cream cone" /></div><div><select id="team4"><option>FB</option><option>GS</option><option>BJK</option><option selected>TS</option></select></div>
    </div>

    <div class="grid2" style="margin-top:14px">
      <button onclick="startTimer()">Turu Baslat</button>
      <button class="secondary" onclick="stopTimer()">Durdur</button>
      <button class="secondary" onclick="resetTimer()">Sureyi Sifirla</button>
      <button class="secondary" onclick="resetScores()">Puanlari Sifirla</button>
    </div>

    <h2 style="margin-top:18px">Test Puan</h2>
    <div class="grid4">
      <button onclick="addScore('FB')">FB +1</button>
      <button onclick="addScore('GS')">GS +1</button>
      <button onclick="addScore('BJK')">BJK +1</button>
      <button onclick="addScore('TS')">TS +1</button>
    </div>

    <div class="status" id="status">Hazir.</div>
  </div>

  <div class="panel">
    <h2>Canli Durum</h2>
    <div class="live" id="timeLeft">10:00</div>
    <div class="small" id="leader">Lider: yok</div>
    <div class="scoregrid">
      <div class="scorebox"><div>FB</div><div id="scoreFB">0</div></div>
      <div class="scorebox"><div>GS</div><div id="scoreGS">0</div></div>
      <div class="scorebox"><div>BJK</div><div id="scoreBJK">0</div></div>
      <div class="scorebox"><div>TS</div><div id="scoreTS">0</div></div>
    </div>
    <h2 style="margin-top:18px">Ses</h2>
    <div class="small">Takim mp3 dosyalarini <code>public/audio/</code> icine koy:</div>
    <ul>
      <li><code>fb.mp3</code></li>
      <li><code>gs.mp3</code></li>
      <li><code>bjk.mp3</code></li>
      <li><code>ts.mp3</code></li>
    </ul>
    <div class="small">Overlay sayfasina bir kez tiklamak ses kilidini acmak icin gerekebilir.</div>
  </div>
</div>

<script>
function fmt(seconds){
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}
async function j(url, method='POST', body){
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type':'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if(!res.ok) throw new Error(data.error || 'istek basarisiz');
  return data;
}
function setStatus(msg){ document.getElementById('status').textContent = msg; }

async function loadState(){
  const res = await fetch('/api/state');
  const state = await res.json();
  document.getElementById('username').value = state.username || '';
  document.getElementById('duration').value = state.timerDuration || 600;
  document.getElementById('logoFB').value = state.logos?.FB || '';
  document.getElementById('logoGS').value = state.logos?.GS || '';
  document.getElementById('logoBJK').value = state.logos?.BJK || '';
  document.getElementById('logoTS').value = state.logos?.TS || '';
  document.getElementById('timeLeft').textContent = fmt(state.timeLeft || 0);
  document.getElementById('scoreFB').textContent = state.scores?.FB ?? 0;
  document.getElementById('scoreGS').textContent = state.scores?.GS ?? 0;
  document.getElementById('scoreBJK').textContent = state.scores?.BJK ?? 0;
  document.getElementById('scoreTS').textContent = state.scores?.TS ?? 0;
  document.getElementById('leader').textContent = 'Lider: ' + (state.leader || 'yok');
}

async function saveSettings(){
  try{
    await j('/api/settings', 'POST', {
      username: document.getElementById('username').value,
      timerDuration: Number(document.getElementById('duration').value || 600),
      logos: {
        FB: document.getElementById('logoFB').value.trim(),
        GS: document.getElementById('logoGS').value.trim(),
        BJK: document.getElementById('logoBJK').value.trim(),
        TS: document.getElementById('logoTS').value.trim()
      }
    });
    await j('/api/gifts', 'POST', {
      gifts: {
        [document.getElementById('gift1').value.trim()]: document.getElementById('team1').value,
        [document.getElementById('gift2').value.trim()]: document.getElementById('team2').value,
        [document.getElementById('gift3').value.trim()]: document.getElementById('team3').value,
        [document.getElementById('gift4').value.trim()]: document.getElementById('team4').value
      }
    });
    setStatus('Kaydedildi.');
    loadState();
  }catch(e){ setStatus(e.message); }
}
async function connectTikTok(){
  try{
    const username = document.getElementById('username').value.trim();
    await saveSettings();
    await j('/api/tiktok/connect', 'POST', { username });
    setStatus('TikTok baglandi.');
  }catch(e){ setStatus(e.message); }
}
async function disconnectTikTok(){
  try{ await j('/api/tiktok/disconnect'); setStatus('Baglanti kesildi.'); }
  catch(e){ setStatus(e.message); }
}
async function startTimer(){
  try{ await saveSettings(); await j('/api/timer/start', 'POST', { duration: Number(document.getElementById('duration').value || 600) }); setStatus('Tur basladi.'); }
  catch(e){ setStatus(e.message); }
}
async function stopTimer(){ try{ await j('/api/timer/stop'); setStatus('Durduruldu.'); } catch(e){ setStatus(e.message); } }
async function resetTimer(){ try{ await j('/api/timer/reset'); setStatus('Sure sifirlandi.'); } catch(e){ setStatus(e.message); } }
async function resetScores(){ try{ await j('/api/scores/reset'); setStatus('Puanlar sifirlandi.'); } catch(e){ setStatus(e.message); } }
async function addScore(team){ try{ await j('/api/scores/add', 'POST', { team, points:1 }); setStatus(team + ' +1'); } catch(e){ setStatus(e.message); } }

setInterval(loadState, 1500);
loadState();
</script>
</body>
</html>
