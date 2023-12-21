document.getElementById('newGame').addEventListener('click', newGame);
let selectedCards = [];

function newGame() {
    // Reset game board and status
    document.getElementById('gameBoard').innerHTML = '';
    document.getElementById('gameStatus').innerText = '';

    // Generate and display cards (simplified)
    for (let i = 0; i < 12; i++) {
        let card = document.createElement('div');
        card.classList.add('card');
        card.innerText = `Card ${i + 1}`;
        card.addEventListener('click', () => selectCard(card, i));
        document.getElementById('gameBoard').appendChild(card);
    }
}

function selectCard(cardElement, cardIndex) {
    // Add or remove card from selection
    if (selectedCards.includes(cardIndex)) {
        selectedCards = selectedCards.filter(index => index !== cardIndex);
        cardElement.classList.remove('selected');
    } else {
        selectedCards.push(cardIndex);
        cardElement.classList.add('selected');
    }

    // Check for set (simplified)
    if (selectedCards.length === 3) {
        document.getElementById('gameStatus').innerText = 'Set Selected!';
        selectedCards = [];
        document.querySelectorAll('.card').forEach(card => card.classList.remove('selected'));
    }
}

newGame(); // Initialize game on load

