<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<title>Overlay</title>
<style>
html,body{margin:0;background:transparent;font-family:Arial}
.timer{position:absolute;top:30px;left:50%;transform:translateX(-50%);background:#222;padding:10px 25px;border-radius:20px;color:#ffd700;font-size:28px}
.wrap{display:flex;gap:30px;justify-content:center;margin-top:120px}
.card{width:220px;height:320px;border-radius:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;box-shadow:0 0 20px rgba(0,0,0,.5)}
.score{font-size:70px;color:#ffd700}
</style>
</head>
<body>

<div class="timer" id="timer">00:00</div>

<div class="wrap">
<div class="card"><div>FB</div><div id="fb" class="score">0</div></div>
<div class="card"><div>GS</div><div id="gs" class="score">0</div></div>
<div class="card"><div>BJK</div><div id="bjk" class="score">0</div></div>
<div class="card"><div>TS</div><div id="ts" class="score">0</div></div>
</div>

<script>
async function load(){
  try{
    let r = await fetch('/api/state');
    let d = await r.json();

    let m = Math.floor(d.timeLeft/60);
    let s = d.timeLeft%60;
    document.getElementById("timer").innerText =
      String(m).padStart(2,'0')+":"+String(s).padStart(2,'0');

    document.getElementById("fb").innerText = d.scores.FB;
    document.getElementById("gs").innerText = d.scores.GS;
    document.getElementById("bjk").innerText = d.scores.BJK;
    document.getElementById("ts").innerText = d.scores.TS;

  }catch(e){}
}
setInterval(load,1000);
load();
</script>

</body>
</html>
