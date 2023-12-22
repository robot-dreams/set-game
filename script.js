const SVG_NS = "http://www.w3.org/2000/svg";

let initialSize;
let board;
let statusText;
let cardsLeftText;

let deck = [];
let cardsOnBoard = [];
let selectedCards = [];

function newGame(simplified) {
  initialSize = simplified ? 9 : 12;
  board = document.getElementById('gameBoard');
  statusText = document.getElementById('gameStatus');
  cardsLeftText = document.getElementById('cardsLeft');

  board.innerHTML = '';
  statusText.innerText = '';

  deck = generateAllCards(simplified);
  cardsOnBoard = [];
  selectedCards = [];

  while (cardsOnBoard.length < initialSize || !setOnBoard()) {
    dealMoreCards();
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

function generateAllCards(simplified) {
  const numbers = [1, 2, 3];
  const symbols = ['diamond', 'squiggle', 'oval'];
  const colors = ['red', 'green', 'purple'];
  let shades;
  if (simplified) {
    shades = ['filled'];
  } else {
    shades = ['filled', 'outline', 'striped'];
  }

  let deck = [];

  for (let number of numbers) {
    for (let symbol of symbols) {
      for (let color of colors) {
        for (let shade of shades) {
          deck.push({number, symbol, color, shade});
        }
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

    let pathElement = document.createElementNS(SVG_NS, 'use');
    pathElement.setAttribute('href', '#' + symbol);
    // fill
    if (shade == 'outline') {
      pathElement.setAttribute('fill', 'transparent');
    } else {
      pathElement.setAttribute('fill', color);
    }
    // mask
    if (shade == 'striped') {
      pathElement.setAttribute('mask', 'url(#mask-stripe)');
    }
    symbolElement.appendChild(pathElement);

    let strokeElement = document.createElementNS(SVG_NS, 'use');
    strokeElement.setAttribute('href', '#' + symbol);
    strokeElement.setAttribute('stroke', color);
    strokeElement.setAttribute('fill', 'none');
    strokeElement.setAttribute('stroke-width', '15');
    symbolElement.appendChild(strokeElement);
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

function checkGameOver() {
  if (deck.length === 0 && !setOnBoard()) {
    setTimeout(function() {
      alert('Game over!');
    }, 0);
  }
}

function replaceSelected() {
  newBoard = []
  for (let card of cardsOnBoard) {
    if (card.classList.contains('selected')) {
      if (deck.length > 0 && cardsOnBoard.length <= initialSize) {
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
  while (deck.length > 0 && !setOnBoard()) {
    dealMoreCards();
  }
  checkGameOver();
}

function dealMoreCards() {
  for (let i = 0; i < 3; i++) {
    let newCard = drawNextCard();
    board.appendChild(newCard);
    cardsOnBoard.push(newCard);
  }
  checkGameOver();
}

function checkSet(cards) {
  const properties = ['number', 'symbol', 'color', 'shade'];

  for (let prop of properties) {
    let values = cards.map(card => card.getAttribute(prop));
    let uniqueValues = new Set(values);
    if (uniqueValues.size !== 1 && uniqueValues.size !== 3) {
      return false;
    }
  }

  return true;
}

function setOnBoard() {
  let n = cardsOnBoard.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        if (checkSet([cardsOnBoard[i], cardsOnBoard[j], cardsOnBoard[k]])) {
          return true;
        }
      }
    }
  }
  return false;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

newGame(true);
document.getElementById('newGameSimplified').addEventListener('click', function() { newGame(true); });
document.getElementById('newGameFull').addEventListener('click', function() { newGame(false); });
