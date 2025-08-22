// 牌数据与规则
export const values = ['3','4','5','6','7','8','9','10','J','Q','K','A','2'];
export const specials = ['小','大'];
export const suits = ['heart','diamond','spade','club'];

const order = {
  '3': 1,'4': 2,'5': 3,'6': 4,'7': 5,'8': 6,'9': 7,'10': 8,
  'J': 9,'Q': 10,'K': 11,'A': 12,'2': 13,'小': 14,'大': 15
};

export function sortCards(cards) {
  cards.sort((a, b) => order[a.value] - order[b.value]);
}

export function validatePlay(cards) {
  if (!cards.length) return { valid: false };

  const cardValues = cards.map(c => c.value);
  const counts = {};
  cardValues.forEach(v => counts[v] = (counts[v] || 0) + 1);
  const types = Object.keys(counts);
  const countsArr = Object.values(counts);
  const len = cards.length;

  // 单张
  if (len === 1) return { type: 'single', valid: true };

  // 对子
  if (len === 2 && types.length === 1) return { type: 'pair', valid: true };

  // 三张
  if (len === 3 && types.length === 1) return { type: 'triplet', valid: true };

  // 三带一
  if (len === 4 && types.length === 2 && countsArr.includes(3))
    return { type: 'triplet_with_single', valid: true };

  // 三带一对
  if (len === 5 && types.length === 2 && countsArr.includes(3) && countsArr.includes(2))
    return { type: 'triplet_with_pair', valid: true };

  // 顺子
  if (len >= 5 && types.length === len) {
    const noSpecial = cardValues.filter(v => !specials.includes(v) && v !== '2');
    if (noSpecial.length !== len) return { valid: false };
    const sorted = [...noSpecial].sort((a, b) => order[a] - order[b]);
    for (let i = 1; i < sorted.length; i++)
      if (order[sorted[i]] - order[sorted[i - 1]] !== 1) return { valid: false };
    return { type: 'straight', valid: true, length: len };
  }

  // 连对
  if (len >= 6 && len % 2 === 0 && types.length === len / 2) {
    if (!countsArr.every(c => c === 2)) return { valid: false };
    const noSpecial = types.filter(v => !specials.includes(v) && v !== '2');
    if (noSpecial.length !== types.length) return { valid: false };
    const sorted = [...noSpecial].sort((a, b) => order[a] - order[b]);
    for (let i = 1; i < sorted.length; i++)
      if (order[sorted[i]] - order[sorted[i - 1]] !== 1) return { valid: false };
    return { type: 'consecutive_pairs', valid: true, pairs: types.length };
  }

  // 飞机
  if (len >= 6 && len % 3 === 0 && types.length === len / 3) {
    if (!countsArr.every(c => c === 3)) return { valid: false };
    const noSpecial = types.filter(v => !specials.includes(v) && v !== '2');
    if (noSpecial.length !== types.length) return { valid: false };
    const sorted = [...noSpecial].sort((a, b) => order[a] - order[b]);
    for (let i = 1; i < sorted.length; i++)
      if (order[sorted[i]] - order[sorted[i - 1]] !== 1) return { valid: false };
    return { type: 'airplane', valid: true, triplets: types.length };
  }

  // 炸弹
  if (len === 4 && types.length === 1) return { type: 'bomb', valid: true };

  // 王炸
  if (len === 2 && types.includes('小') && types.includes('大'))
    return { type: 'rocket', valid: true };

  return { valid: false };
}

export function compareCards(prevCards, currCards, prevType, currType) {
  if (!prevCards || !prevCards.length) return true; // 首手可出任意合法牌

  const weight = {
    '3': 1,'4': 2,'5': 3,'6': 4,'7': 5,'8': 6,'9': 7,'10': 8,
    'J': 9,'Q': 10,'K': 11,'A': 12,'2': 13,'小': 14,'大': 15
  };

  /* 火箭最大 */
  if (currType === 'rocket') return true;
  if (prevType === 'rocket') return false;

  /* 炸弹其次，非炸弹遇炸弹直接失败 */
  if (currType === 'bomb' && prevType !== 'bomb') return true;
  if (prevType === 'bomb' && currType !== 'bomb') return false;
  if (currType === 'bomb' && prevType === 'bomb') {
    // 都是炸弹：比较最大点数
    const max = arr => arr.reduce((m, c) => weight[c.value] > weight[m.value] ? c : m, arr[0]);
    return weight[max(currCards).value] > weight[max(prevCards).value];
  }

  /* 其余牌型必须完全相同才能比大小 */
  if (currType !== prevType) return false;

  /* 长度/张数必须一致 */
  if (currCards.length !== prevCards.length) return false;

  /* 取关键牌 */
  const getKeyCard = (arr, type) => {
    const counts = {};
    arr.forEach(c => counts[c.value] = (counts[c.value] || 0) + 1);

    /* 三带 / 四带：取核心牌点数 */
    if (type.includes('triplet')) {
      const triplet = Object.keys(counts).find(v => counts[v] === 3);
      return arr.find(c => c.value === triplet);
    }
    if (type === 'bomb') {          // 已在上面的炸弹分支处理
      const quad = Object.keys(counts).find(v => counts[v] === 4);
      return arr.find(c => c.value === quad);
    }

    /* 其余牌型直接取最大点数 */
    return arr.reduce((m, c) => weight[c.value] > weight[m.value] ? c : m, arr[0]);
  };

  /* 同牌型比关键牌 */
  return weight[getKeyCard(currCards, currType).value] >
         weight[getKeyCard(prevCards, prevType).value];
}