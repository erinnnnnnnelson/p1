// HTML elements
const cardLayout = document.querySelector('#card-layout');
const cardPlacers = cardLayout.children;
const startButton = document.querySelector('#start');
const newGameButton = document.querySelector('#new-game');
const scoreBox = document.querySelector('#score-box');
const matchCount = document.querySelector('#match-count');
const strikeCount = document.querySelector('#strike-count');
const possibleMatches = document.querySelector('#possible-matches');
const endText = document.querySelector('#end-text');

// Cards used for the deck are specified here.
// --NEED CODE FOR RANDOMIZING ? --
const playingCards = `AS,AC,KH,KD,QS,QC,JH,JD,0S,0C,9H,9D,7S,7C,5H,5D,3S,3C,2H,2D`;
const deckColors = ['assets/card_blue3.png', 'assets/card_red3.png', 'assets/card_black3.png']
let colorAdvance = Math.floor(Math.random() * 3);
const deckColor = () => {
  if (colorAdvance === 0) {
    return deckColors[0];
  }
  if (colorAdvance === 1) {
    return deckColors[1];
  }
  if (colorAdvance === 2) {
    return deckColors[2];
  }
};

// API stuff
const apiCall = `https://deckofcardsapi.com/api/deck/`;
const callNewDeck = `new/shuffle/?cards=`
const deckCall = apiCall + callNewDeck + playingCards;
const drawNumber = `/draw/?count=20`;

let playerScore;
let playerStrikes;
let gameHasEnded;
let cardsInPlay;

const displayScore = () => {
  matchCount.innerText = playerScore;
};

const displayStrikes = () => {
  strikeCount.innerText = playerStrikes;
};

const reset = () => {
  gameHasEnded = false;
  playerScore = 0;
  playerStrikes = 0;
  cardsInPlay = 0;
  endText.style.display = 'none';
  for (i = 0; i < cardPlacers.length; i += 1) {
    cardPlacers[i].firstElementChild.innerHTML = ''
  }
};


// Functions for flipping cards front or back
const freezeCards = () => {
  for (i = 0; i < cardPlacers.length; i += 1) {
    cardPlacers[i].firstElementChild.classList.add('fixed');
  }
}

const unfreezeCards = () => {
  for (i = 0; i < cardPlacers.length; i += 1) {
    cardPlacers[i].firstElementChild.classList.remove('fixed');
  }
}

const showCard = (cardFlipper) => {
  cardFlipper.style.transform = 'rotateY(-180deg)';
};

const hideCard = (cardFlipper) => {
  cardFlipper.style.transform = '';
}

const endReveal = (cardDiv) => {
  for (i = 0; i < cardDiv.length; i += 1) {
    if (cardDiv[i].classList.contains('shown')) {
    } else {
      cardDiv[i].firstElementChild.style.display = 'none';
      cardDiv[i].lastElementChild.style.opacity = '.5';
      cardDiv[i].lastElementChild.style.display = 'block';
    }
  }
};

const winProtocol = () => {
  endText.style.webkitTextStroke = '3px lightgreen'
  endText.innerText = "YOU WIN";
  endText.style.display = 'inline-block';
  console.log('you win!');
};

const loseProtocol = () => {
  let cardHolder = cardLayout.children;
  endReveal(cardHolder);
  endText.style.webkitTextStroke = '3px red'
  endText.innerText = "GAME OVER";
  endText.style.display = 'inline-block';
  console.log('game over');
};

const cardsMatch = (cardFlipper1, cardFlipper2) => {
  cardFlipper1.classList.add('matched');
  cardFlipper2.classList.add('matched');
  cardFlipper1.lastElementChild.firstElementChild.style.borderColor = 'lightgreen';
  cardFlipper2.lastElementChild.firstElementChild.style.borderColor = 'lightgreen';
  console.log('match!')
  if (playerScore >= 10) {
    winProtocol();
  }
}

const cardsMismatch = (cardDiv1, cardDiv2) => {
  freezeCards();
  cardDiv1.lastElementChild.firstElementChild.style.borderColor = 'red';
  cardDiv2.lastElementChild.firstElementChild.style.borderColor = 'red';
  console.log(`strike ${playerStrikes}`)
  if (playerStrikes >= 10) {
    loseProtocol();
  } else {
    setTimeout(function () {
      hideCard(cardDiv1);
      hideCard(cardDiv2);
      cardDiv1.lastElementChild.firstElementChild.style.borderColor = 'black';
      cardDiv2.lastElementChild.firstElementChild.style.borderColor = 'black';
      unfreezeCards();
    }, 1000);
  }
};

// Function that checks two selected cards to see if they are equal
// If they are not equal the cards flip back around
// --NEED CODE TO HIDE CARDS IF USER CLICKS A NEW CARD BEFORE THE PREVIOUS CARDS HIDE THEMSELVES--
const checkMatch = (card1, card2, cardFlipper1, cardFlipper2) => {
  if (card1.value === card2.value) {
    playerScore += 1;
    displayScore();
    cardsMatch(cardFlipper1, cardFlipper2);
  } else {
    playerStrikes += 1
    displayStrikes();
    cardsMismatch(cardFlipper1, cardFlipper2);

  }

};

let inspectCard = (card, cardFlipper) => {
  if (cardFlipper.classList.contains('matched') || cardFlipper.classList.contains('fixed')) {
    return;
  }
  if (cardsInPlay === 0) {
    card1 = card;
    cardFlipper.lastElementChild.firstElementChild.style.borderColor = 'yellow';
    showCard(cardFlipper);
    prevCardFlipper = cardFlipper;
    console.log(card1.code);
    cardsInPlay = 1;
  } else {
    card2 = card;
    if (card1.code === card2.code) {
      return;
    }
    showCard(cardFlipper);
    console.log(card2.code);
    checkMatch(card1, card2, prevCardFlipper, cardFlipper);
    cardsInPlay = 0;
  }
}

// Function that shuffles and builds the playing board. shows cards when clicked.
const buildBoard = async (deck) => {
  reset();
  displayScore();
  displayStrikes();
  let deckId = deck.data.deck_id;
  let shuffledDeck = await axios.get(apiCall + deckId + "/shuffle/");
  let cardDrawCall = await axios.get(apiCall + deckId + drawNumber);
  let cards = cardDrawCall.data.cards;
  cards.forEach((card, i) => {
    let cardBack = document.createElement('div');
    cardBack.innerHTML = `<img src="${deckColor()}" alt="Unknown card">`
    cardBack.classList.add('card-backs');
    let cardFront = document.createElement('div');
    cardFront.innerHTML = `<img src="${card.image}" alt="${card.value} OF ${card.suit}">`
    cardFront.classList.add('card-fronts')
    let cardFlipper = cardPlacers[i].firstElementChild;
    cardFlipper.append(cardBack);
    cardFlipper.append(cardFront);
    cardBack.addEventListener('click', () => {
      inspectCard(card, cardFlipper);
    })
  })
  if (colorAdvance === 2) {
    colorAdvance = 0;
  } else {
    colorAdvance += 1;
  }
}


// Initial call to the API for first and additional board building.
const getDeck = async () => {
  const deck = await axios.get(deckCall);
  // buildBoard(deck);
  buildBoard(deck);
  newGameButton.style.display = 'block';
  scoreBox.style.display = 'block';
  newGameButton.addEventListener('click', () => {
    buildBoard(deck);
  });
};

startButton.addEventListener('click', getDeck);