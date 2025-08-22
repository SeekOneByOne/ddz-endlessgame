import { sortCards, validatePlay } from './card.js';
import { renderSelf, updateSelfButtons } from './self.js';
import { renderOpponent, updateOpponentButtons } from './opponent.js';
import { pushHistory } from './history.js';
import { updateStatus, highlightPlayer } from './state.js';

export let gameState = {
  currentPlayer:'self',
  lastPlayed:null,
  selfCards:[],
  opponentCards:[],
  playedCards:[],
  playHistory:[]
};

export function startBoard(selfCards,opponentCards){
  gameState.selfCards=[...selfCards];
  gameState.opponentCards=[...opponentCards];
  sortCards(gameState.selfCards);
  sortCards(gameState.opponentCards);
  gameState.currentPlayer='self';
  gameState.lastPlayed=null;
  gameState.playedCards=[];
  gameState.playHistory=[];

  document.getElementById('setup-screen').style.display='none';
  document.getElementById('game-area').style.display='flex';

  renderSelf();
  renderOpponent();
  renderPlayed();
  updateStatus();
  highlightPlayer();
}

export function playCards(player, _cards) {
  // 1. 深拷贝，防止引用原手牌对象
  const cards = _cards.map(c => ({ value: c.value, suit: c.suit }));
  const v = validatePlay(cards);

  // 2. 从手牌精确剔除
  if (player === 'self') {
    gameState.selfCards = gameState.selfCards.filter(
      sc => !cards.some(cc => cc.value === sc.value && cc.suit === sc.suit)
    );
    sortCards(gameState.selfCards);
    renderSelf();
  } else {
    gameState.opponentCards = gameState.opponentCards.filter(
      oc => !cards.some(cc => cc.value === oc.value && cc.suit === oc.suit)
    );
    sortCards(gameState.opponentCards);
    renderOpponent();
  }

  // 3. 公共区独立保存
  gameState.playedCards = [...cards];
  gameState.lastPlayed = {
    player: player === 'self' ? '我方' : '对方',
    cards,
    type: v.type
  };
  pushHistory({ player: player === 'self' ? '我方' : '对方', cards: cards.map(c => c.value) });
  gameState.currentPlayer = player === 'self' ? 'opponent' : 'self';

  document.querySelectorAll('.card.selected-self, .card.selected-opponent')
          .forEach(c => c.classList.remove('selected-self', 'selected-opponent'));

  renderPlayed();
  updateStatus();
  highlightPlayer();
  updateSelfButtons();
  updateOpponentButtons();
}

export function pass(player){
  pushHistory({player:player==='self'?'我方':'对方',action:'要不起'});
  gameState.lastPlayed = null;
  gameState.currentPlayer = player==='self'?'opponent':'self';

  document.querySelectorAll('.card.selected-self, .card.selected-opponent')
        .forEach(c => c.classList.remove('selected-self', 'selected-opponent'));

  updateStatus();
  highlightPlayer();
  updateSelfButtons();
  updateOpponentButtons();
}

function renderPlayed() {
  const box = document.getElementById('played-cards');
  box.innerHTML = '';
  gameState.playedCards.forEach(card => {
    const el = document.createElement('div');
    const isJoker = card.value === '小' || card.value === '大';
    el.className = isJoker ? 'card joker' : `card ${card.suit}`;

    const suitSymbol = isJoker ? '' : { heart:'♥', diamond:'♦', spade:'♠', club:'♣' }[card.suit];
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
    box.appendChild(el);
  });
}

function symbol(s){return {heart:'♥',diamond:'♦',spade:'♠',club:'♣'}[s]||'';}

document.getElementById('reset-game').addEventListener('click', () => location.reload());;