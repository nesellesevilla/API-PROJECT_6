let deckId = null; 
let collection = []; 

// Select DOM elements
const shuffleBtn = document.getElementById('shuffle-btn');
const drawBtn = document.getElementById('draw-btn');
const resetBtn = document.getElementById('reset-btn');
const cardCountSelect = document.getElementById('card-count');
const cardArea = document.getElementById('card-area');
const messageP = document.getElementById('message');
const collectionArea = document.getElementById('collection-area');

// Event listeners for buttons
shuffleBtn.addEventListener('click', shuffleDeck);
drawBtn.addEventListener('click', drawCards);
resetBtn.addEventListener('click', resetBoard);

// Shuffle the deck and enable drawing
async function shuffleDeck() {
  try {
    const res = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
    const data = await res.json();
    deckId = data.deck_id; 
    drawBtn.disabled = false; 
    cardArea.innerHTML = ''; 
    setMessage('Deck shuffled! Choose how many cards to draw.');
  } catch (error) {
    setMessage('Failed to shuffle deck. Please try again.');
  }
}

// Draw cards from the shuffled deck
async function drawCards() {
  const count = cardCountSelect.value; 

  try {
    const res = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${count}`);
    const data = await res.json();

    if (data.success) {
      data.cards.forEach(card => {
        // Create elements for each card
        const cardWrapper = document.createElement('div');
        const cardImg = document.createElement('img');
        cardImg.src = card.image;
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save to Collection';
        saveBtn.addEventListener('click', () => addCardToCollection(card)); 

        cardWrapper.appendChild(cardImg);
        cardWrapper.appendChild(saveBtn);
        cardArea.appendChild(cardWrapper); // Display card
      });

      setMessage(`You drew ${data.cards.length} card(s). ${data.remaining} card(s) left.`);
      if (data.remaining === 0) {
        drawBtn.disabled = true; // Disable draw button when no cards are left
        setMessage('No cards remaining! Please shuffle again.');
      }
    } else {
      setMessage('Could not draw cards. Try reshuffling.');
    }
  } catch (error) {
    setMessage('Error drawing cards. Check your connection.');
  }
}

// Add a card to the collection
function addCardToCollection(card) {
  if (collection.some(c => c.code === card.code)) {
    alert('This card is already in your collection!');
    return;
  }

  const nickname = `${card.value} of ${card.suit}`;
  collection.push({ ...card, nickname });
  renderCollection();
}

// Render the collection of saved cards
function renderCollection() {
  collectionArea.innerHTML = ''; 
  collection.forEach((card, index) => {
    const div = document.createElement('div');
    const img = document.createElement('img');
    img.src = card.image;
    const input = document.createElement('input');
    input.value = card.nickname;
    input.addEventListener('change', () => updateCardNickname(index, input.value)); // Update nickname

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.addEventListener('click', () => deleteCard(index)); // Delete card

    div.appendChild(img);
    div.appendChild(input);
    div.appendChild(delBtn);
    collectionArea.appendChild(div); // Display collection card
  });
}

// Update the nickname of a card
function updateCardNickname(index, newName) {
  collection[index].nickname = newName;
  renderCollection();
}

// Delete a card from the collection
function deleteCard(index) {
  collection.splice(index, 1);
  renderCollection();
}

// Reset the card area (clear drawn cards)
function resetBoard() {
  cardArea.innerHTML = '';
  setMessage('Board reset. You can continue drawing cards.');
}

// Display messages to the user
function setMessage(msg) {
  messageP.textContent = msg;
}


// Draw cards using the selected number from dropdown
