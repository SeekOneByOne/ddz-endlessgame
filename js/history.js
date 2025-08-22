import { gameState } from './board.js';

export function pushHistory(record){
  gameState.playHistory.push({...record,time:new Date().toLocaleTimeString()});
}

export function showHistory(){
  const list = document.getElementById('history-list');
  list.innerHTML='';
  if(!gameState.playHistory.length){
    list.innerHTML='<li class="history-item">暂无记录</li>';
  }else{
    gameState.playHistory.forEach(r=>{
      const li=document.createElement('li');
      li.className='history-item';
      const cls = r.player==='我方'?'history-self':'history-opponent';
      if(r.action){
        li.innerHTML=`<span class="${cls}">${r.player}</span><span>${r.action}</span><span>${r.time}</span>`;
      }else{
        li.innerHTML=`<span class="${cls}">${r.player}</span><span>${r.cards.join(' ')}</span><span>${r.time}</span>`;
      }
      list.appendChild(li);
    });
  }
  document.getElementById('history-modal').style.display='flex';
}

document.getElementById('history-btn').addEventListener('click',showHistory);
document.getElementById('close-history').addEventListener('click',()=>document.getElementById('history-modal').style.display='none');