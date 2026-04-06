const express = require('express');
const app = express();

let state = {
  timeLeft:600,
  scores:{FB:0,GS:0,BJK:0,TS:0}
};

setInterval(()=>{
  if(state.timeLeft>0) state.timeLeft--;
},1000);

app.use(express.json());
app.use(express.static('public'));

app.get('/api/state',(req,res)=>res.json(state));

app.post('/add/:team',(req,res)=>{
  let t=req.params.team;
  if(state.scores[t]!=undefined) state.scores[t]++;
  res.send("ok");
});

app.listen(3000);
