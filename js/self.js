import { gameState, playCards, pass } from './board.js';
import { validatePlay, compareCards } from './card.js';

function symbol(s) {
  return { heart: '♥', diamond: '♦', spade: '♠', club: '♣' }[s] || '';
}
const order = { '3':1,'4':2,'5':3,'6':4,'7':5,'8':6,'9':7,'10':8,'J':9,'Q':10,'K':11,'A':12,'2':13,'小':14,'大':15 };

export function renderSelf() {
  const box = document.getElementById('self-cards');
  box.innerHTML = '';
  const sorted = [...gameState.selfCards].sort((a, b) => order[b.value] - order[a.value]);
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
    el.addEventListener('click', () => {
        el.classList.toggle('selected-self');
        updateSelfButtons();
    });
    box.appendChild(el);
  });
  updateSelfButtons();
}

export function updateSelfButtons() {
  if (gameState.currentPlayer !== 'self') {
    document.getElementById('self-play-btn').disabled = true;
    document.getElementById('self-pass-btn').disabled = true;
    return;
  }
  const selectedNodes = document.querySelectorAll('#self-cards .card.selected-self');
  const canPlay = selectedNodes.length > 0;
  document.getElementById('self-play-btn').disabled = !canPlay;  
  const canPass = gameState.lastPlayed != null;
  document.getElementById('self-pass-btn').disabled = !canPass;
}

/* 出牌 */
document.getElementById('self-play-btn').addEventListener('click', () => {
  const selectedCards = [...document.querySelectorAll('#self-cards .card.selected-self')]
    .map(n => ({ value:n.dataset.value, suit:n.dataset.suit || null }));
  if (!selectedCards.length) return;
  const v = validatePlay(selectedCards);
  if (!v.valid){ alert('出牌不符合规则'); return; }
  if (gameState.lastPlayed && !compareCards(gameState.lastPlayed.cards, selectedCards, gameState.lastPlayed.type, v.type)){
    alert('牌不够大'); return;
  }
  playCards('self', selectedCards);
});

/* 要不起 */
document.getElementById('self-pass-btn').addEventListener('click', () => {
  if (!gameState.lastPlayed){ alert('先手不能要不起'); return; }
  pass('self');
});