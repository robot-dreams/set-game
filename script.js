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

function newGame() {
  const mode = gameMode.value;
  board.innerHTML = '';
  statusText.innerText = '';

  targetCards = mode === 'full' ? 12 : 9;
  newShuffledDeck(mode);
  selected = [];
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

function getNewCard() {
  let {number, shape, color, fill} = deck.pop();
  cardsLeftText.innerText = `Cards left in deck: ${deck.length}`;
  if (deck.length === 69) {
    cardsLeftText.innerText += LENNY;
  }

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
    shapeElement.setAttribute('width', '30px');
    shapeElement.setAttribute('height', '60px');

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
  if (card.classList.contains('selected')) {
    card.classList.remove('selected');
    selected = selected.filter(item => item !== card);
  } else if (selected.length < 3) {
    card.classList.add('selected');
    selected.push(card);
    if (selected.length === 3) {
      if (isSet(selected)) {
        notify('Set found!')
        replaceSelected();
        ensureSet();
      } else {
        notify('Not a valid set')
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
        replacements.push(card);
        if (replacements.length === numToMove) {
          break;
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
    setTimeout(function() {
      alert('Game over!');
    }, 100);
  }
}

function dealThree() {
  for (let i = 0; i < 3; i++) {
    board.appendChild(getNewCard());
  }
}

function isSet(cards) {
  for (let property of allProperties) {
    let values = cards.map(card => card.getAttribute(property));
    let uniqueValues = new Set(values);
    if (uniqueValues.size !== 1 && uniqueValues.size !== 3) {
      return false;
    }
  }
  return true;
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
