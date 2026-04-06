const express=require('express');
const app=express();
app.use(express.json());
app.use(express.static('public'));

let state={scores:{FB:0,GS:0,BJK:0,TS:0}};

app.get('/api/state',(req,res)=>res.json(state));
app.post('/api/scores/add',(req,res)=>{
 state.scores[req.body.team]++
 res.json(state)
});

app.listen(3000);
