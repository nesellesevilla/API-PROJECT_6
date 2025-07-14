let deckId = null;
let collection = [];

const shuffleBtn = document.getElementById('shuffle-btn');
const drawBtn = document.getElementById('draw-btn');
const resetBtn = document.getElementById('reset-btn');
const cardCountSelect = document.getElementById('card-count');
const cardArea = document.getElementById('card-area');
const messageP = document.getElementById('message');
const collectionArea = document.getElementById('collection-area');

shuffleBtn.addEventListener('click', shuffleDeck);
drawBtn.addEventListener('click', drawCards);
resetBtn.addEventListener('click', resetBoard);

async function shuffleDeck() {
  try {
    const res = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
    const data = await res.json();
    deckId = data.deck_id;
    drawBtn.disabled = false;
    cardArea.innerHTML = '';
    setMessage('Deck shuffled! Choose how many cards to draw.');
  } catch (error) {
    console.error('Error shuffling deck:', error);
    setMessage('Failed to shuffle deck. Please try again.');
  }
}

async function drawCards() {
  const count = cardCountSelect.value;

  try {
    const res = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${count}`);
    const data = await res.json();

    if (data.success) {
      data.cards.forEach(card => {
        const cardWrapper = document.createElement('div');

        const cardImg = document.createElement('img');
        cardImg.src = card.image;
        cardImg.alt = `${card.value} of ${card.suit}`;

        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save to Collection';
        saveBtn.addEventListener('click', () => addCardToCollection(card));

        cardWrapper.appendChild(cardImg);
        cardWrapper.appendChild(saveBtn);

        cardArea.appendChild(cardWrapper);
      });

      setMessage(`You drew ${data.cards.length} card(s). ${data.remaining} card(s) left.`);

      if (data.remaining === 0) {
        drawBtn.disabled = true;
        setMessage('No cards remaining! Please shuffle again.');
      }
    } else {
      setMessage('Could not draw cards. Try reshuffling.');
    }
  } catch (error) {
    console.error('Error drawing cards:', error);
    setMessage('Error drawing cards. Check your connection.');
  }
}

// CRUD Functions for Collection

function addCardToCollection(card) {
  // Avoid duplicates by code
  if (collection.some(c => c.code === card.code)) {
    alert('This card is already in your collection!');
    return;
  }

  const nickname = `${card.value} of ${card.suit}`;
  collection.push({ ...card, nickname });
  renderCollection();
}

function renderCollection() {
  collectionArea.innerHTML = '';

  collection.forEach((card, index) => {
    const div = document.createElement('div');
    div.className = 'collection-card';

    const img = document.createElement('img');
    img.src = card.image;
    img.alt = card.code;

    const input = document.createElement('input');
    input.value = card.nickname;
    input.addEventListener('change', () => updateCardNickname(index, input.value));

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.addEventListener('click', () => deleteCard(index));

    div.appendChild(img);
    div.appendChild(input);
    div.appendChild(delBtn);

    collectionArea.appendChild(div);
  });
}

function updateCardNickname(index, newName) {
  collection[index].nickname = newName;
  renderCollection();
}

function deleteCard(index) {
  collection.splice(index, 1);
  renderCollection();
}

function resetBoard() {
  cardArea.innerHTML = '';
  setMessage('Board reset. You can continue drawing cards.');
}

function setMessage(msg) {
  messageP.textContent = msg;
}
