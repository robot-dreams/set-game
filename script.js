'use strict';

const SVG_NS = 'http://www.w3.org/2000/svg';
const LENNY = ' ( \u0361\u00B0 \u035C\u0296 \u0361\u00B0)';

const board = document.getElementById('gameBoard');
const statusText = document.getElementById('gameStatus');
const cardsLeftText = document.getElementById('cardsLeft');
const gameMode = document.getElementById('gameMode');

const allProperties = ['number', 'shape', 'color', 'fill'];
const allNumbers = [1, 2, 3];
const allShapes = ['diamond', 'squiggle', 'oval'];
const allColors = ['red', 'green', 'purple'];
const allFills = ['solid', 'blank', 'striped'];

let targetCards;
let deck = [];
let selected = [];
let logEntries = [];
let startTime = null;
let gameOver = false;

function timer() {
  if (!gameOver) {
    let millis = Date.now() - startTime;
    let minutes = Math.floor(millis / 1000 / 60);
    let seconds = Math.floor(millis / 1000 % 60);
    let mm = minutes < 10 ? `0${minutes}` : `${minutes}`;
    let ss = seconds < 10 ? `0${seconds}` : `${seconds}`;
    elapsedTime.innerHTML = `<span style="color: #999999; text-align: right"><i>Elapsed time:</i></span> ${mm}:${ss}`;
    setTimeout(timer, 1000);
  }
}

function newGame() {
  const mode = gameMode.value;
  board.innerHTML = '';
  statusText.innerText = '';
  elapsedTime.innerText = '';
  gameOver = false;
  startTime = Date.now();
  timer();

  targetCards = mode === 'full' ? 12 : 9;
  newShuffledDeck(mode);
  selected = [];
  logEntries = [];
  while (board.children.length < targetCards || !boardHasSet()) {
    dealThree();
  }
}

let timeoutId = null;

function notify(message) {
  clearTimeout(timeoutId);
  statusText.innerText = message;
  timeoutId = setTimeout(function() {
    statusText.innerText = '';
  }, 1000);
}

// Includes both endpoints.
function randint(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function randchoice(items) {
  return items[randint(0, items.length - 1)];
}

function handleMode(mode, allItems, single) {
  if (mode === single) {
    return [randchoice(allItems)];
  } else {
    return allItems;
  }
}

function newShuffledDeck(mode) {
  deck = []
  let numbers = handleMode(mode, allNumbers, 'singlenumber');
  let shapes = handleMode(mode, allShapes, 'singleshape');
  let colors = handleMode(mode, allColors, 'singlecolor');
  let fills = handleMode(mode, allFills, 'singlefill');
  for (let number of numbers) {
    for (let shape of shapes) {
      for (let color of colors) {
        for (let fill of fills) {
          deck.push({number, shape, color, fill});
        }
      }
    }
  }
  // Knuth shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function refreshCardsLeft() {
  let cardsLeft = deck.length + board.children.length;
  cardsLeftText.innerHTML = `<span style="color: #999999"><i>Cards left:</i></span> ${cardsLeft}`;
  if (cardsLeft === 69) {
    cardsLeftText.innerHTML += LENNY;
  }
}

function getNewCard() {
  let {number, shape, color, fill} = deck.pop();

  let card = document.createElement('div');
  card.classList.add('card');
  card.setAttribute('number', number);
  card.setAttribute('shape', shape);
  card.setAttribute('color', color);
  card.setAttribute('fill', fill);

  for (let n = 0; n < number; n++) {
    let shapeElement = document.createElementNS(SVG_NS, 'svg');
    shapeElement.classList.add('shape');
    shapeElement.setAttribute('viewBox', '0 0 200 400');

    let fillElement = document.createElementNS(SVG_NS, 'use');
    fillElement.setAttribute('href', '#' + shape);
    switch (fill) {
      case 'solid':
        fillElement.setAttribute('fill', color);
        break
      case 'blank':
        fillElement.setAttribute('fill', 'transparent');
        break;
      case 'striped':
        fillElement.setAttribute('fill', color);
        fillElement.setAttribute('mask', 'url(#mask-stripe)');
        break;
    }
    shapeElement.appendChild(fillElement);

    let strokeElement = document.createElementNS(SVG_NS, 'use');
    strokeElement.setAttribute('href', '#' + shape);
    strokeElement.setAttribute('stroke', color);
    strokeElement.setAttribute('fill', 'none');
    strokeElement.setAttribute('stroke-width', '15');
    shapeElement.appendChild(strokeElement);

    card.appendChild(shapeElement);
  }

  card.addEventListener('click', () => toggleSelected(card));
  return card;
}

function toggleSelected(card) {
  if (gameOver) {
    notify('No more sets.');
  } else if (card.classList.contains('selected')) {
    card.classList.remove('selected');
    selected = selected.filter(item => item !== card);
  } else if (selected.length < 3) {
    card.classList.add('selected');
    selected.push(card);
    if (selected.length === 3) {
      if (isSet(selected)) {
        notify('Set found!')
        logEntries.push([Date.now() - startTime, selected]);
        replaceSelected();
        ensureSet();
        refreshCardsLeft();
      } else {
        notify('Not a set.')
        card.classList.remove('selected');
        selected.pop();
      }
    }
  }
}

function replaceSelected() {
  let children = Array.from(board.children);
  let replacements = [];
  if (deck.length > 0 && children.length <= targetCards) {
    for (let i = 0; i < 3; i++) {
      replacements.push(getNewCard());
    }
  } else {
    let numToMove = 0;
    for (let i = 0; i < children.length - selected.length; i++) {
      let card = children[i];
      if (card.classList.contains('selected')) {
        numToMove++;
      }
    }
    for (let i = children.length - 1; i >= 0; i--) {
      let card = children[i];
      if (!card.classList.contains('selected')) {
        if (replacements.length < numToMove) {
          replacements.push(card);
        }
      }
    }
  }
  for (let i = 0; i < children.length; i++) {
    let card = children[i];
    if (card.classList.contains('selected')) {
      if (replacements.length > 0) {
        board.replaceChild(replacements.pop(), card);
      } else {
        card.remove();
      }
    }
  }
  selected = [];
}

function ensureSet() {
  while (deck.length > 0 && !boardHasSet()) {
    dealThree();
  }
  if (deck.length === 0 && !boardHasSet()) {
    gameOver = true;
    analyze();
    setTimeout(function() {
      alert('Game over!');
    }, 100);
  }
}

function dealThree() {
  for (let i = 0; i < 3; i++) {
    board.appendChild(getNewCard());
  }
  refreshCardsLeft();
}

function isSet(cards) {
  return allProperties.every(property => {
    let values = cards.map(card => card.getAttribute(property));
    let uniqueValues = new Set(values);
    return uniqueValues.size === 1 || uniqueValues.size === 3;
  });
}

function boardHasSet() {
  let n = board.children.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        if (isSet([board.children[i], board.children[j], board.children[k]])) {
          return true;
        }
      }
    }
  }
  return false;
}

newGame();
document.getElementById('newGame').addEventListener('click', newGame);
document.getElementById('gameMode').addEventListener('change', newGame);

////////////////////////////////////////////////////////////
// Power user stats
////////////////////////////////////////////////////////////

function analyze() {
  let levelToTimes = {
    1: [],
    2: [],
    3: [],
    4: [],
    all: [],
  };
  for (let i = 0; i < logEntries.length; i++) {
    let t0 = i > 0 ? logEntries[i - 1][0] : 0;
    let [t1, cards] = logEntries[i];
    let level = getLevel(cards);
    let time = (t1 - t0) / 1000;
    levelToTimes[level].push(time);
    levelToTimes['all'].push(time);
  }

  console.log('------------------------------------------------------------');
  console.log('level\tcount\tavg\t\tstdev\tmin\t\tmax');
  for (let level of [1, 2, 3, 4, 'all']) {
    let times = levelToTimes[level];
    if (times.length > 0) {
      let stats = getStats(times);
      let count = stats.count;
      let avg = stats.avg.toFixed(2);
      let stdev = stats.stdev.toFixed(2);
      let min = stats.min.toFixed(2);
      let max = stats.max.toFixed(2);
      console.log(`${level}\t\t${count}\t\t${avg}\t${stdev}\t${min}\t${max}`);
    }
  }
}

function average(arr) {
  return arr.reduce((a, b) => a + b) / arr.length;
}

function getStats(times) {
  if (times.length === 0) {
    return {};
  } else {
    let n = times.length;
    let avg = average(times)
    let variance = average(times.map(x => (x - avg)**2));
    let stdev = Math.sqrt(variance);
    return {
      count: times.length,
      avg: avg,
      stdev: stdev,
      max: Math.max(...times),
      min: Math.min(...times),
    };
  }
}

function getLevel(cards) {
  let result = 0;
  for (let property of allProperties) {
    let values = cards.map(card => card.getAttribute(property));
    let uniqueValues = new Set(values);
    if (uniqueValues.size === 3) {
      result++;
    }
  }
  return result;
}
