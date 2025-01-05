// Game configuration
const GAME_CONFIG = {
    FLIP_DELAY: 1000,
    VICTORY_DELAY: 500,
    CARDS: ['truc1', 'truc1', 'truc2', 'truc2', 'truc3', 'truc3', 'truc4', 'truc4']
};

// Cache DOM elements
const memoryGame = document.getElementById('memory-game');
const scoreDisplay = document.getElementById('score');

// Game state
let flippedCards = [];
let matchedPairs = 0;
let isProcessing = false;

// Shuffle array using Fisher-Yates algorithm
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Create a card element with proper event handling
function createCard(content) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.content = content;

    const cardFace = document.createElement('img');
    cardFace.src = `assets/${content}.png`;
    cardFace.alt = content;
    cardFace.loading = 'lazy'; // Lazy load images
    card.appendChild(cardFace);

    card.addEventListener('click', handleCardClick);
    return card;
}

// Handle card click events
function handleCardClick(event) {
    const card = event.currentTarget;
    
    // Prevent clicking if:
    if (isProcessing || // Cards are being processed
        card.classList.contains('flipped') || // Card is already flipped
        flippedCards.length === 2) { // Two cards are already flipped
        return;
    }

    flipCard(card);

    if (flippedCards.length === 2) {
        checkMatch();
    }
}

// Flip a card
function flipCard(card) {
    card.classList.add('flipped');
    flippedCards.push(card);
}

// Check if flipped cards match
async function checkMatch() {
    isProcessing = true;
    const [card1, card2] = flippedCards;

    if (card1.dataset.content === card2.dataset.content) {
        await handleMatch();
    } else {
        await handleMismatch(card1, card2);
    }

    isProcessing = false;
    flippedCards = [];
}

// Handle matching cards
async function handleMatch() {
    matchedPairs++;
    updateScore();

    if (matchedPairs === GAME_CONFIG.CARDS.length / 2) {
        await new Promise(resolve => setTimeout(resolve, GAME_CONFIG.VICTORY_DELAY));
        handleVictory();
    }
}

// Handle mismatching cards
async function handleMismatch(card1, card2) {
    await new Promise(resolve => setTimeout(resolve, GAME_CONFIG.FLIP_DELAY));
    card1.classList.remove('flipped');
    card2.classList.remove('flipped');
}

// Update score display
function updateScore() {
    scoreDisplay.textContent = `Score : ${matchedPairs}`;
}

// Handle victory condition
function handleVictory() {
    const playAgain = confirm('Bravo ! Vous avez gagné ! Voulez-vous rejouer ?');
    if (playAgain) {
        resetGame();
    }
}

// Reset game state
function resetGame() {
    matchedPairs = 0;
    flippedCards = [];
    updateScore();
    
    // Clear and reinitialize the game board
    memoryGame.innerHTML = '';
    initGame();
}

// Initialize the game
function initGame() {
    const shuffledCards = shuffle([...GAME_CONFIG.CARDS]);
    const fragment = document.createDocumentFragment();
    
    shuffledCards.forEach(content => {
        const card = createCard(content);
        fragment.appendChild(card);
    });
    
    memoryGame.appendChild(fragment);
}

// Start the game
initGame();