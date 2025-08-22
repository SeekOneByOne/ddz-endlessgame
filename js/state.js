import { gameState } from './board.js';

export function updateStatus(){
 //对方状态栏
  const el_opponent = document.getElementById('game-status-opponent');
  //己方状态栏
  const el_self = document.getElementById('game-status-self');

  if(gameState.selfCards.length===0){
    el_opponent.textContent='对方赢了！再接再厉！';
    el_self.textContent='恭喜！你赢了！';
    disableAll();return;
  }
  if(gameState.opponentCards.length===0){
    el_opponent.textContent='恭喜！你赢了！';
    el_self.textContent='对方赢了！再接再厉！';
    disableAll();return;
  }
  let txt1 = `当前回合: ${gameState.currentPlayer==='self'?'对方':'我方'}`;
  if(gameState.lastPlayed){
    if(gameState.lastPlayed.player == '我方')
        txt1 += ` | 上轮出牌: 对方出了${gameState.lastPlayed.cards.length}张牌`;
    else
        txt1 += ` | 上轮出牌: 我方出了${gameState.lastPlayed.cards.length}张牌`;
  }
  el_opponent.textContent=txt1;
  
  //己方状态栏  
  let txt = `当前回合: ${gameState.currentPlayer==='self'?'我方':'对方'}`;
  if(gameState.lastPlayed){
    txt += ` | 上轮出牌: ${gameState.lastPlayed.player}出了${gameState.lastPlayed.cards.length}张牌`;
  }
  el_self.textContent=txt;
}

export function highlightPlayer(){
  document.getElementById('self-area').classList.toggle('active-turn',gameState.currentPlayer==='self');
  document.getElementById('opponent-area').classList.toggle('active-turn',gameState.currentPlayer==='opponent');
}

function disableAll(){
  document.querySelectorAll('.controls button').forEach(b=>b.disabled=true);
}