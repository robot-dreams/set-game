const SVG_NS = "http://www.w3.org/2000/svg";
const INITIAL_SIZE = 12;

let board;
let statusText;
let dealMoreCardsButton;

let deck = [];
let cardsOnBoard = [];
let selectedCards = [];

function newGame() {
  board = document.getElementById('gameBoard');
  statusText = document.getElementById('gameStatus');
  dealMoreCardsButton = document.getElementById('dealMoreCards');

  board.innerHTML = '';
  statusText.innerText = '';
  dealMoreCardsButton.removeAttribute('disabled');

  deck = generateAllCards();
  cardsOnBoard = [];
  selectedCards = [];

  // Generate and display cards
  for (let i = 0; i < 12; i++) {
    let card = drawNextCard();
    board.appendChild(card);
    cardsOnBoard.push(card);
  }
}

let timeoutId = null;

function notify(message) {
  clearTimeout(timeoutId);
  statusText.innerText = message;
  timeoutId = setTimeout(function() {
    statusText.innerText = '';
  }, 3000);
}

function generateAllCards() {
  const numbers = [1, 2, 3];
  const symbols = ['diamond', 'squiggle', 'oval'];
  const colors = ['red', 'green', 'purple'];

  let deck = [];

  for (let number of numbers) {
    for (let symbol of symbols) {
      for (let color of colors) {
        deck.push({number, symbol, color});
      }
    }
  }

  shuffleDeck(deck);
  return deck;
}

function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]]; // Swap elements
  }
}

function drawNextCard() {
  let {number, symbol, color} = deck.pop();
  if (deck.length === 0) {
    dealMoreCardsButton.setAttribute('disabled', "");
  }

  let card = document.createElement('div');
  card.classList.add('card');
  card.setAttribute('number', number);
  card.setAttribute('symbol', symbol);
  card.setAttribute('color', color);

  for (let n = 0; n < number; n++) {
    let symbolElement = document.createElementNS(SVG_NS, 'svg');
    symbolElement.classList.add('symbol');
    symbolElement.setAttribute('viewBox', '0 0 200 400');
    symbolElement.setAttribute('width', '30px');
    symbolElement.setAttribute('height', '60px');

    let pathElement = document.createElementNS(SVG_NS, 'use');
    pathElement.setAttribute('href', '#' + symbol);
    pathElement.setAttribute('fill', color);

    symbolElement.appendChild(pathElement);
    card.appendChild(symbolElement);
  }

  card.addEventListener('click', () => selectCard(card));
  return card;
}

function selectCard(cardElement) {
  if (cardElement.classList.contains('selected')) {
    cardElement.classList.remove('selected');
    selectedCards = selectedCards.filter(card => card !== cardElement);
  } else if (selectedCards.length < 3) {
    cardElement.classList.add('selected');
    selectedCards.push(cardElement);
    if (selectedCards.length === 3) {
      if (checkSet(selectedCards)) {
        notify('Set found!')
        replaceSelected();
      } else {
        notify('Not a valid set')
      }
    }
  }
}

function replaceSelected() {
  newBoard = []
  for (let card of cardsOnBoard) {
    if (card.classList.contains('selected')) {
      if (deck.length > 0 && cardsOnBoard.length <= INITIAL_SIZE) {
        let newCard = drawNextCard();
        board.replaceChild(newCard, card);
        newBoard.push(newCard);
      }
      card.remove();
    } else {
      newBoard.push(card);
    }
  }

  selectedCards = [];
  cardsOnBoard = newBoard;
}

function dealMoreCards() {
  for (let i = 0; i < 3; i++) {
    let newCard = drawNextCard();
    board.appendChild(newCard);
    cardsOnBoard.push(newCard);
  }
}

function checkSet(cards) {
  const properties = ['number', 'symbol', 'color'];

  for (let prop of properties) {
    let values = cards.map(card => card.getAttribute(prop));
    let uniqueValues = new Set(values);
    if (uniqueValues.size !== 1 && uniqueValues.size !== 3) {
      return false;
    }
  }

  return true;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

newGame();
document.getElementById('newGame').addEventListener('click', newGame);
document.getElementById('dealMoreCards').addEventListener('click', dealMoreCards);
