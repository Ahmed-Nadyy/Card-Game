document.addEventListener("DOMContentLoaded", () => {
  let deck = generateDeck();
  let groundCards = [];
  let player1Cards = [];
  let player2Cards = [];
  let player1Score = 0;
  let player2Score = 0;
  let currentPlayer = 1;
  let player1Name, player2Name;

  const startGameButton = document.getElementById('start-game');
  const groundCardsDiv = document.getElementById('ground-cards');
  const player1CardsDiv = document.getElementById('player1-cards');
  const player2CardsDiv = document.getElementById('player2-cards');
  const player1ScoreDiv = document.getElementById('player1-score');
  const player2ScoreDiv = document.getElementById('player2-score');
  const player1CardsHeader = document.getElementById('player1-cards-header');
  const player2CardsHeader = document.getElementById('player2-cards-header');
  const winnerMessageDiv = document.getElementById('winner-message');

  startGameButton.addEventListener('click', startGame);

  function startGame() {
    player1Name = document.getElementById('player1').value || "Player 1";
    player2Name = document.getElementById('player2').value || "Player 2";
    player1CardsHeader.textContent = `${player1Name}'s Cards`;
    player2CardsHeader.textContent = `${player2Name}'s Cards`;
    winnerMessageDiv.textContent = "";

    deck = generateDeck();
    shuffle(deck);
    groundCards = drawCards(4);
    player1Cards = drawCards(4);
    player2Cards = drawCards(4);
    player1Score = 0;
    player2Score = 0;
    currentPlayer = 1;
    updateScore();
    renderCards();
  }

  function generateDeck() {
    const suits = ['clubs', 'diamonds', 'hearts', 'spades'];
    const ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
    let deck = [];
    suits.forEach(suit => {
      ranks.forEach(rank => {
        deck.push({ rank, suit });
      });
    });
    return deck;
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function drawCards(number) {
    return deck.splice(0, number);
  }

  function renderCards() {
    groundCardsDiv.innerHTML = groundCards.map(card => renderCard(card)).join('');
    player1CardsDiv.innerHTML = player1Cards.map(card => renderCard(card, 'player1')).join('');
    player2CardsDiv.innerHTML = player2Cards.map(card => renderCard(card, 'player2')).join('');
  }

  function renderCard(card, player = '') {
    const imgSrc = `PNG-cards-1.3/${card.rank}_of_${card.suit}.png`;
    return `<img src="${imgSrc}" class="card" id="${card.rank}${card.suit}" data-player="${player}" draggable="true" ondragstart="drag(event)" alt="${card.rank} of ${card.suit}">`;
  }

  function updateScore() {
    player1ScoreDiv.textContent = `${player1Name} Score: ${player1Score}`;
    player2ScoreDiv.textContent = `${player2Name} Score: ${player2Score}`;
  }

  window.allowDrop = function(event) {
    event.preventDefault();
  }

  window.drag = function(event) {
    const player = event.target.getAttribute('data-player');
    if ((currentPlayer === 1 && player === 'player1') || (currentPlayer === 2 && player === 'player2')) {
      event.dataTransfer.setData("text", event.target.id);
    }
  }

  window.drop = function(event) {
    event.preventDefault();
    var cardId = event.dataTransfer.getData("text");
    var cardElement = document.getElementById(cardId);
    var card = getCardFromElement(cardElement);
    var player = cardElement.getAttribute('data-player');

    if (event.target.id === 'ground-cards' || event.target.classList.contains('card')) {
      if ((currentPlayer === 1 && player === 'player1') || (currentPlayer === 2 && player === 'player2')) {
        groundCardsDiv.appendChild(cardElement);
        playCard(card, player);
        switchTurn();
      }
    }
  }

  function getCardFromElement(element) {
    let src = element.getAttribute('src');
    let [rank, suit] = src.match(/(\d+|[JQKA])_of_(clubs|diamonds|hearts|spades)/).slice(1, 3);
    if (!isNaN(rank)) rank = parseInt(rank);
    return { rank, suit };
  }

  function playCard(card, player) {
      console.log(`Playing card: ${card.rank}${card.suit} by ${player}`);
      
      if (player === 'player1') {
        console.log('Player 1 cards before:', player1Cards);
        player1Cards = player1Cards.filter(c => !(c.rank === card.rank && c.suit === card.suit));
        console.log('Player 1 cards after:', player1Cards);
      } else if (player === 'player2') {
        console.log('Player 2 cards before:', player2Cards);
        player2Cards = player2Cards.filter(c => !(c.rank === card.rank && c.suit === card.suit));
        console.log('Player 2 cards after:', player2Cards);
      }
    
      let matchingCardIndex = groundCards.findIndex(c => c.rank === card.rank);
      if (matchingCardIndex !== -1) {
        let matchingCard = groundCards.splice(matchingCardIndex, 1)[0];
    
        if (currentPlayer === 1) {
          player1Score += getCardValue(matchingCard.rank);
        } else {
          player2Score += getCardValue(matchingCard.rank);
        }
      } else {
        groundCards.push(card);
      }
    
      updateScore();
      checkForWinner();
      renderCards();
  }

  function getCardValue(rank) {
    if (['J', 'Q', 'K'].includes(rank)) return 10;
    if (rank === 'A') return 11;
    return parseInt(rank);
  }

  function switchTurn() {
    currentPlayer = currentPlayer === 1 ? 2 : 1;

    if (player1Cards.length === 0 && player2Cards.length === 0 && deck.length > 0) {
      player1Cards = drawCards(4);
      player2Cards = drawCards(4);
    }

    if (player1Cards.length === 0 && player2Cards.length === 0 && deck.length === 0) {
      checkForWinner();
    }

    renderCards();
  }

  function declareWinner() {
    let winner;
    if (player1Score >= 50) {
      winner = player1Name;
    } else if (player2Score >= 50) {
      winner = player2Name;
    }
    if (winner) {
        winnerMessageDiv.textContent = `The winner is ${winner}!`;
        alert(winnerMessageDiv.textContent);
        startGame();
        disableDragging();
    }
  }

  function checkForWinner() {
    if (player1Score >= 50 || player2Score >= 50) {
      declareWinner();
    }
  }

  function disableDragging() {
    let allCards = document.querySelectorAll('.card');
    allCards.forEach(card => {
      card.setAttribute('draggable', 'false');
    });
  }
});
