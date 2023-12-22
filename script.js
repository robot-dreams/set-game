"use strict";

const SVG_NS = "http://www.w3.org/2000/svg";

const board = document.getElementById('gameBoard');
const statusText = document.getElementById('gameStatus');
const cardsLeftText = document.getElementById('cardsLeft');

const properties = ['number', 'symbol', 'color', 'shade'];
const numbers = [1, 2, 3];
const symbols = ['diamond', 'squiggle', 'oval'];
const colors = ['red', 'green', 'purple'];
const shades = ['filled', 'outline', 'striped'];

let targetCards;
let deck = [];
let selected = [];

function newGame(simple) {
  board.innerHTML = '';
  statusText.innerText = '';

  targetCards = simple ? 9 : 12;
  newShuffledDeck(simple);
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

function newShuffledDeck(simple) {
  deck = []
  for (let number of numbers) {
    for (let symbol of symbols) {
      for (let color of colors) {
        for (let shade of (simple ? [shades[0]] : shades)) {
          deck.push({number, symbol, color, shade});
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
  let {number, symbol, color, shade} = deck.pop();
  cardsLeftText.innerText = `${deck.length} cards left in deck`;

  let card = document.createElement('div');
  card.classList.add('card');
  card.setAttribute('number', number);
  card.setAttribute('symbol', symbol);
  card.setAttribute('color', color);
  card.setAttribute('shade', shade);

  for (let n = 0; n < number; n++) {
    let symbolElement = document.createElementNS(SVG_NS, 'svg');
    symbolElement.classList.add('symbol');
    symbolElement.setAttribute('viewBox', '0 0 200 400');
    symbolElement.setAttribute('width', '30px');
    symbolElement.setAttribute('height', '60px');

    let shadeElement = document.createElementNS(SVG_NS, 'use');
    shadeElement.setAttribute('href', '#' + symbol);
    switch (shade) {
      case 'filled':
        shadeElement.setAttribute('fill', color);
        break
      case 'outline':
        shadeElement.setAttribute('fill', 'transparent');
        break;
      case 'striped':
        shadeElement.setAttribute('fill', color);
        shadeElement.setAttribute('mask', 'url(#mask-stripe)');
        break;
    }
    symbolElement.appendChild(shadeElement);

    let strokeElement = document.createElementNS(SVG_NS, 'use');
    strokeElement.setAttribute('href', '#' + symbol);
    strokeElement.setAttribute('stroke', color);
    strokeElement.setAttribute('fill', 'none');
    strokeElement.setAttribute('stroke-width', '15');
    symbolElement.appendChild(strokeElement);

    card.appendChild(symbolElement);
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
      } else {
        notify('Not a valid set')
      }
    }
  }
}

function replaceSelected() {
  for (let card of selected) {
    if (deck.length > 0 && board.children.length <= targetCards) {
      board.replaceChild(getNewCard(), card);
    } else {
      card.remove();
    }
  }
  selected = [];
  while (deck.length > 0 && !boardHasSet()) {
    dealThree();
  }
  if (deck.length === 0 && !boardHasSet()) {
    setTimeout(function() {
      alert('Game over!');
    }, 0);
  }
}

function dealThree() {
  for (let i = 0; i < 3; i++) {
    board.appendChild(getNewCard());
  }
}

function isSet(cards) {
  for (let property of properties) {
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

newGame(true);
document.getElementById('newGameSimple').addEventListener('click', function() { newGame(true); });
document.getElementById('newGameFull').addEventListener('click', function() { newGame(false); });
