import { gameState, playCards, pass } from './board.js';
import { validatePlay, compareCards, sortCards } from './card.js';

function symbol(s) {
  return { heart: '♥', diamond: '♦', spade: '♠', club: '♣' }[s] || '';
}
const order = { '3':1,'4':2,'5':3,'6':4,'7':5,'8':6,'9':7,'10':8,'J':9,'Q':10,'K':11,'A':12,'2':13,'小':14,'大':15 };

export function renderOpponent() {
  const box = document.getElementById('opponent-cards');
  box.innerHTML = '';
  const sorted = [...gameState.opponentCards].sort((a, b) => order[b.value] - order[a.value]);
  sorted.forEach(card => {
    const el = document.createElement('div');
    const isJoker = card.value === '小' || card.value === '大';
    el.className = isJoker ? 'card joker' : `card ${card.suit}`;
    el.dataset.value = card.value;
    el.dataset.suit  = card.suit || '';

    const suitSymbol = isJoker ? '' : symbol(card.suit);
    const colorClass = isJoker ? '' : card.suit;

    el.innerHTML = `
      <div class="corner top-left">
        <span class="num">${card.value}</span>
        ${!isJoker ? `<span class="suit ${colorClass}">${suitSymbol}</span>` : ''}
      </div>
      <div class="corner bottom-right">
        <span class="num">${card.value}</span>
        ${!isJoker ? `<span class="suit ${colorClass}">${suitSymbol}</span>` : ''}
      </div>
    `;
    el.style.position = 'relative';
    el.style.left = `${sorted.indexOf(card) * 0}px`;
    //el.style.zIndex = sorted.length - sorted.indexOf(card);

    el.addEventListener('click', () =>{
        el.classList.toggle('selected-opponent');
        updateOpponentButtons();
    });
    box.appendChild(el);
  });
  updateOpponentButtons();
}

export function updateOpponentButtons() {
  if (gameState.currentPlayer !== 'opponent') {
    document.getElementById('opponent-play-btn').disabled = true;
    document.getElementById('opponent-pass-btn').disabled = true;
    return;
  }
  const selectedNodes = document.querySelectorAll('#opponent-cards .card.selected-opponent');
  const canPlay = selectedNodes.length > 0;
  document.getElementById('opponent-play-btn').disabled = !canPlay;
  const canPass = gameState.lastPlayed != null;
  document.getElementById('opponent-pass-btn').disabled = !canPass;
}

/* 出牌 */
document.getElementById('opponent-play-btn').addEventListener('click', () => {
  if (gameState.currentPlayer !== 'opponent') return;
  const selectedCards = [...document.querySelectorAll('#opponent-cards .card.selected-opponent')]
    .map(n => ({ value:n.dataset.value, suit:n.dataset.suit || null }));
  if (!selectedCards.length) return;
  const v = validatePlay(selectedCards);
  if (!v.valid){ alert('出牌不符合规则'); return; }
  if (gameState.lastPlayed && !compareCards(gameState.lastPlayed.cards, selectedCards, gameState.lastPlayed.type, v.type)){
    alert('牌不够大'); return;
  }
  playCards('opponent', selectedCards);
});

/* 要不起 */
document.getElementById('opponent-pass-btn').addEventListener('click', () => {
  if (!gameState.lastPlayed){ alert('先手不能要不起'); return; }
  pass('opponent');  
});