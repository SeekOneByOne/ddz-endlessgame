// setup.js
import { startBoard } from './board.js';

const nums  = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
const suits = ['heart', 'diamond', 'spade', 'club'];
const kings = ['小', '大'];

/* ---------- 库存 ---------- */
const stock = Object.fromEntries([
  ...nums.map(v => [v, 4]),
  ...kings.map(k => [k, 1])
]);

/* ---------- 状态 ---------- */
let selectedCards = { self: [], opponent: [] };
let currentSelection = 'self';

/* ---------- localStorage 读写 ---------- */
const STORAGE_KEY = 'lastSetupCards';
function saveCards() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedCards));
}
function loadCards() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved) selectedCards = saved;
  } catch (e) {
    /* 忽略损坏的缓存 */
  }
}

/* ---------- 渲染 ---------- */
function renderValueButtons() {
  const box = document.getElementById('card-selector');
  box.innerHTML = '';
  [...nums, ...kings].forEach(v => {
    if (stock[v] === 0) return;
    const btn = document.createElement('div');
    btn.className = 'value-btn';
    btn.textContent = `${v} (${stock[v]})`;
    btn.addEventListener('click', () => pickCard(v));
    box.appendChild(btn);
  });
}

function pickCard(value) {
  if (stock[value] === 0) return;
  if (selectedCards[currentSelection].length >= 20) {
    alert('手牌已达上限20张'); return;
  }
  let suit = null;
  if (!kings.includes(value)) {
    const used = [...selectedCards.self, ...selectedCards.opponent]
      .filter(c => c.value === value).map(c => c.suit);
    const avail = suits.filter(s => !used.includes(s));
    suit = avail[Math.floor(Math.random() * avail.length)];
  }
  selectedCards[currentSelection].push({ value, suit });
  stock[value]--;
  renderSelected();
  renderValueButtons();
  saveCards(); // 每次选牌都缓存
}

function renderSelected() {
  ['self', 'opponent'].forEach(p => {
    const box = document.getElementById(`${p}-selected-cards`);
    box.innerHTML = '';
    selectedCards[p].forEach(c => {
      const isJoker = !c.suit;
      const el = document.createElement('div');
      el.className = isJoker ? 'card joker' : `card ${c.suit}`;
      el.innerHTML = `
        <div class="corner top-left">
          <span class="num">${c.value}</span>
          ${!isJoker ? `<span class="suit ${c.suit}">${symbol(c.suit)}</span>` : ''}
        </div>
        <div class="corner bottom-right">
          <span class="num">${c.value}</span>
          ${!isJoker ? `<span class="suit ${c.suit}">${symbol(c.suit)}</span>` : ''}
        </div>
      `;
      box.appendChild(el);
    });
  });
}

function symbol(s) {
  return { heart: '♥', diamond: '♦', spade: '♠', club: '♣' }[s] || '';
}

/* 清空 */
window.clearSelectedCards = function (player) {
  selectedCards[player].forEach(c => stock[c.value]++);
  selectedCards[player] = [];
  renderSelected();
  renderValueButtons();
  saveCards();
};

function switchPlayer(p) {
  currentSelection = p;
  document.querySelectorAll('.player-setup').forEach(el => el.classList.remove('active-player'));
  document.getElementById(`${p}-setup`).classList.add('active-player');
}

/* ---------- 页面初始化 ---------- */
document.addEventListener('DOMContentLoaded', () => {
  loadCards();           // 读缓存
  renderSelected();      // 渲染已选牌
  renderValueButtons();  // 渲染可选按钮

  document.getElementById('self-setup').addEventListener('click', () => switchPlayer('self'));
  document.getElementById('opponent-setup').addEventListener('click', () => switchPlayer('opponent'));
  document.getElementById('self-clear').addEventListener('click', () => clearSelectedCards('self'));
  document.getElementById('opponent-clear').addEventListener('click', () => clearSelectedCards('opponent'));

  document.getElementById('start-game').addEventListener('click', () => {
    if (!selectedCards.self.length || !selectedCards.opponent.length) {
      alert('请为双方选择手牌！');
      return;
    }
    saveCards();           // 开始游戏前再存一次
    startBoard(selectedCards.self, selectedCards.opponent);
  });
});