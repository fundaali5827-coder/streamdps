:root {
  --text: #f7f7fb;
  --gold: #ffc547;
  --gold-2: #ffea83;
  --shadow: rgba(0,0,0,.55);
  font-family: Arial, Helvetica, sans-serif;
}
* { box-sizing: border-box; }
html, body {
  margin: 0;
  width: 100%;
  min-height: 100%;
}
body {
  overflow: hidden;
  background: #030507;
  color: var(--text);
}
.overlay-root {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  isolation: isolate;
}
.stadium-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at center 88%, rgba(90,120,55,.5) 0 12%, rgba(31,43,22,.85) 18%, rgba(7,10,8,0) 34%),
    radial-gradient(circle at 18% 48%, rgba(245,226,163,.16) 0 1%, rgba(245,226,163,0) 5%),
    radial-gradient(circle at 83% 46%, rgba(245,226,163,.14) 0 1%, rgba(245,226,163,0) 5%),
    radial-gradient(circle at 50% 40%, rgba(255,183,64,.1) 0 2%, rgba(255,183,64,0) 10%),
    linear-gradient(180deg, rgba(7,8,14,.98) 0%, rgba(12,16,24,.94) 20%, rgba(11,14,22,.9) 50%, rgba(7,8,10,.96) 100%);
}
.stadium-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 12% 40%, rgba(255,255,255,.11), transparent 16%),
    radial-gradient(circle at 85% 42%, rgba(255,255,255,.09), transparent 18%),
    radial-gradient(circle at 50% 46%, rgba(255,255,255,.06), transparent 25%);
  filter: blur(24px);
  opacity: .7;
}
.stadium-bg::after {
  content: '';
  position: absolute;
  left: -10%; right: -10%; bottom: 13%; height: 34%;
  background:
    radial-gradient(ellipse at center 100%, rgba(132,112,40,.34), rgba(0,0,0,0) 55%),
    repeating-linear-gradient(180deg,
      rgba(255,255,255,.03) 0 2px,
      rgba(255,255,255,0) 2px 8px);
  filter: blur(1.5px);
  opacity: .5;
}
.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent 40%, rgba(0,0,0,.35) 74%, rgba(0,0,0,.7) 100%);
}

.timer-shell {
  position: absolute;
  top: 46px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
}
.timer-pill {
  min-width: 232px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 13px 30px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(114,118,124,.95), rgba(88,90,96,.95));
  border: 1px solid rgba(255,224,135,.36);
  box-shadow: 0 0 0 3px rgba(255,190,70,.18), 0 0 38px rgba(255,187,73,.3);
  color: #fff7db;
  font-size: 48px;
  font-weight: 900;
  letter-spacing: .02em;
}
.timer-icon {
  font-size: 34px;
  filter: drop-shadow(0 0 8px rgba(255,196,67,.55));
}

.teams-grid {
  position: absolute;
  top: 152px;
  left: 50%;
  transform: translateX(-50%);
  width: min(1320px, calc(100vw - 70px));
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  z-index: 2;
}
.team-card {
  position: relative;
  height: min(440px, 55vh);
  border-radius: 8px;
  overflow: hidden;
  border: 1.6px solid rgba(255,255,255,.42);
  box-shadow:
    0 0 0 1px rgba(255,255,255,.06),
    0 16px 30px rgba(0,0,0,.35),
    0 0 18px var(--glow-soft);
  background: linear-gradient(180deg, rgba(255,255,255,.07), rgba(0,0,0,.22));
}
.team-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 10% 60%, rgba(255,255,255,.25), transparent 12%);
  opacity: .7;
}
.team-card.active {
  box-shadow:
    0 0 0 2px rgba(255,255,255,.18),
    0 0 26px var(--glow-strong),
    0 22px 34px rgba(0,0,0,.45);
}
.team-card.leader .score-number { color: #ffe07a; text-shadow: 0 0 14px rgba(255,214,92,.75), 0 0 28px rgba(255,174,59,.42); }
.team-panel-top,
.team-panel-bottom {
  position: absolute;
  left: 0; right: 0;
}
.team-panel-top {
  top: 0;
  height: 46%;
  background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(0,0,0,.08));
}
.team-panel-top::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--top-grad);
}
.team-panel-top::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 10% 78%, rgba(255,255,255,.45), transparent 10%),
    radial-gradient(circle at 86% 22%, rgba(255,255,255,.18), transparent 18%),
    linear-gradient(135deg, transparent 48%, var(--accent) 49%, transparent 69%);
  opacity: .85;
}
.team-panel-bottom {
  bottom: 0;
  height: 54%;
  background:
    radial-gradient(circle at 45% 60%, rgba(255,255,255,.08), transparent 18%),
    radial-gradient(circle at 62% 52%, rgba(255,255,255,.06), transparent 13%),
    linear-gradient(180deg, rgba(13,15,24,.85), rgba(8,9,14,.96));
}
.team-midline {
  position: absolute;
  top: 46%;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, rgba(255,255,255,.03), rgba(255,255,255,.23), rgba(255,255,255,.03));
  box-shadow: 0 -1px 0 rgba(0,0,0,.5), 0 2px 0 rgba(255,255,255,.03);
}
.logo-orb {
  position: absolute;
  top: 24px;
  left: 50%;
  width: 124px;
  height: 124px;
  transform: translateX(-50%);
  border-radius: 50%;
  background: radial-gradient(circle at 50% 36%, #ffffff 0 55%, #e8edf3 100%);
  border: 3px solid rgba(255,255,255,.62);
  box-shadow: 0 10px 18px rgba(0,0,0,.34), inset 0 -10px 14px rgba(0,0,0,.08);
  display: grid;
  place-items: center;
  z-index: 2;
}
.logo-orb img {
  width: 96px;
  height: 96px;
  object-fit: contain;
}
.team-short {
  position: absolute;
  top: 20px;
  right: 18px;
  min-width: 52px;
  text-align: center;
  padding: 5px 11px;
  border-radius: 999px;
  background: rgba(255,255,255,.12);
  border: 1px solid rgba(255,255,255,.14);
  font-size: 18px;
  font-weight: 900;
  letter-spacing: .04em;
  z-index: 2;
}
.score-box {
  position: absolute;
  left: 0; right: 0; bottom: 28px;
  text-align: center;
  z-index: 2;
}
.score-number {
  font-size: clamp(100px, 9vw, 130px);
  font-weight: 1000;
  line-height: .9;
  color: #f7f8fb;
  text-shadow: 0 0 12px rgba(255,255,255,.28);
}
.score-number.bump { animation: bump .55s ease; }
.puan-label {
  margin-top: 8px;
  font-size: 24px;
  font-weight: 900;
  letter-spacing: .04em;
  color: #f3f4f7;
  text-shadow: 0 2px 5px rgba(0,0,0,.35);
}

.winner-overlay {
  position: absolute;
  left: 0; right: 0; bottom: 114px;
  display: grid;
  place-items: center;
  pointer-events: none;
  z-index: 4;
}
.winner-overlay.hidden { display: none; }
.winner-flare {
  position: absolute;
  width: min(700px, 70vw);
  height: 130px;
  background: radial-gradient(circle at center, rgba(255,196,74,.48), rgba(255,196,74,.16) 28%, rgba(255,196,74,0) 68%);
  filter: blur(8px);
  animation: flare .95s ease forwards;
}
.winner-sparks {
  position: absolute;
  width: min(760px, 76vw);
  height: 160px;
  background:
    radial-gradient(circle at 18% 45%, rgba(255,180,45,.95) 0 1.3%, transparent 2.5%),
    radial-gradient(circle at 24% 55%, rgba(255,180,45,.85) 0 1.1%, transparent 2%),
    radial-gradient(circle at 31% 40%, rgba(255,180,45,.75) 0 1%, transparent 2%),
    radial-gradient(circle at 71% 42%, rgba(255,180,45,.95) 0 1.3%, transparent 2.5%),
    radial-gradient(circle at 77% 58%, rgba(255,180,45,.85) 0 1.2%, transparent 2.1%),
    radial-gradient(circle at 84% 46%, rgba(255,180,45,.78) 0 1.1%, transparent 2.1%);
  filter: blur(.2px);
  opacity: .9;
}
.winner-text {
  position: relative;
  font-size: clamp(64px, 7vw, 90px);
  font-weight: 1000;
  line-height: 1;
  letter-spacing: -.02em;
  color: var(--gold);
  text-shadow: 0 0 14px rgba(255,170,41,.72), 0 0 32px rgba(255,140,0,.38), 0 3px 0 rgba(90,48,0,.7);
  animation: winnerPop .95s ease;
}
.winner-line {
  margin-top: 10px;
  width: min(610px, 62vw);
  height: 5px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(255,180,45,.08), rgba(255,210,94,.95), rgba(255,180,45,.08));
  box-shadow: 0 0 24px rgba(255,180,45,.5);
}

@keyframes bump { 0%{transform:scale(1)} 32%{transform:scale(1.15)} 100%{transform:scale(1)} }
@keyframes winnerPop { 0%{opacity:0; transform:scale(.84)} 34%{opacity:1; transform:scale(1.06)} 100%{opacity:1; transform:scale(1)} }
@keyframes flare { 0%{opacity:0; transform:scale(.9)} 12%{opacity:1} 100%{opacity:0; transform:scale(1.06)} }

@media (max-width: 1180px) {
  .teams-grid { width: calc(100vw - 28px); gap: 8px; }
  .team-card { height: 390px; }
  .logo-orb { width: 106px; height: 106px; }
  .logo-orb img { width: 82px; height: 82px; }
}
@media (max-width: 900px) {
  .teams-grid {
    width: calc(100vw - 18px);
    grid-template-columns: repeat(2, minmax(0, 1fr));
    top: 120px;
  }
  .team-card { height: 270px; }
  .team-panel-top { height: 44%; }
  .team-panel-bottom { height: 56%; }
  .team-midline { top: 44%; }
  .score-number { font-size: 72px; }
  .puan-label { font-size: 18px; }
  .timer-pill { min-width: 160px; font-size: 30px; padding: 10px 20px; }
  .timer-icon { font-size: 24px; }
  .winner-overlay { bottom: 60px; }
}
