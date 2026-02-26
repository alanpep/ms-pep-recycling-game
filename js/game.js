/* ============================================================
   SORT IT OUT! — Game Logic
   ============================================================ */

// ---- Item Database ----
// Each item: { id, name, emoji (used as placeholder image), isRecyclable }
const ITEMS = [
  { id: 'aluminum-can',    name: 'Aluminum Can',      emoji: '🥫', isRecyclable: true  },
  { id: 'glass-bottle',    name: 'Glass Bottle',      emoji: '🍾', isRecyclable: true  },
  { id: 'newspaper',       name: 'Newspaper',         emoji: '📰', isRecyclable: true  },
  { id: 'cardboard-box',   name: 'Cardboard Box',     emoji: '📦', isRecyclable: true  },
  { id: 'plastic-bottle',  name: 'Plastic Bottle',    emoji: '🧴', isRecyclable: true  },
  { id: 'tin-can',         name: 'Tin Can',           emoji: '🥫', isRecyclable: true  },
  { id: 'paper-bag',       name: 'Paper Bag',         emoji: '🛍️', isRecyclable: true  },
  { id: 'milk-jug',        name: 'Milk Jug',          emoji: '🥛', isRecyclable: true  },
  { id: 'banana-peel',     name: 'Banana Peel',       emoji: '🍌', isRecyclable: false },
  { id: 'used-napkin',     name: 'Used Napkin',       emoji: '🧻', isRecyclable: false },
  { id: 'plastic-bag',     name: 'Plastic Bag',       emoji: '🛒', isRecyclable: false },
  { id: 'styrofoam-cup',   name: 'Styrofoam Cup',     emoji: '🥤', isRecyclable: false },
  { id: 'food-wrapper',    name: 'Food Wrapper',      emoji: '🍬', isRecyclable: false },
  { id: 'broken-mirror',   name: 'Broken Mirror',     emoji: '🪞', isRecyclable: false },
  { id: 'diaper',          name: 'Dirty Diaper',      emoji: '🧷', isRecyclable: false },
  { id: 'pizza-box-dirty', name: 'Greasy Pizza Box',  emoji: '🍕', isRecyclable: false },
  { id: 'cereal-box',      name: 'Cereal Box',        emoji: '🥣', isRecyclable: true  },
  { id: 'egg-carton',      name: 'Egg Carton',        emoji: '🥚', isRecyclable: true  },
  { id: 'chip-bag',        name: 'Chip Bag',          emoji: '🍟', isRecyclable: false },
  { id: 'rubber-glove',    name: 'Rubber Glove',      emoji: '🧤', isRecyclable: false },
];

const TOTAL_ROUNDS = 10;
const FEEDBACK_DELAY = 1200; // ms to show correct/incorrect feedback

// ---- Game State ----
const state = {
  status: 'not-started', // 'not-started' | 'playing' | 'finished'
  round: 0,
  score: 0,
  items: [],
  isProcessing: false, // prevents double-clicks during feedback
};

// ---- DOM References ----
const dom = {
  screenStart:  document.getElementById('screen-start'),
  screenPlay:   document.getElementById('screen-play'),
  screenEnd:    document.getElementById('screen-end'),

  btnStart:     document.getElementById('btn-start'),
  btnTrash:     document.getElementById('btn-trash'),
  btnRecycle:   document.getElementById('btn-recycle'),
  btnReplay:    document.getElementById('btn-replay'),

  hudRound:     document.getElementById('hud-round-num'),
  hudScore:     document.getElementById('hud-score-num'),

  itemCard:     document.getElementById('item-card'),
  itemImage:    document.getElementById('item-image'),
  itemName:     document.getElementById('item-name'),

  feedback:     document.getElementById('feedback'),
  feedbackIcon: document.getElementById('feedback-icon'),
  feedbackText: document.getElementById('feedback-text'),

  endTitle:     document.getElementById('end-title'),
  endScore:     document.getElementById('end-score'),
  endMessage:   document.getElementById('end-message'),
  scoreRingFill: document.getElementById('score-ring-fill'),

  soundStart:   document.getElementById('sound-start'),
  soundCorrect: document.getElementById('sound-correct'),
  soundIncorrect: document.getElementById('sound-incorrect'),
  soundEnd:     document.getElementById('sound-end'),
};

// ---- Utility: Fisher-Yates Shuffle ----
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---- Utility: Pick balanced items (roughly 50/50 trash/recyclable) ----
function pickItems(count) {
  const recyclables = shuffle(ITEMS.filter(i => i.isRecyclable));
  const trash = shuffle(ITEMS.filter(i => !i.isRecyclable));

  const halfCount = Math.floor(count / 2);
  const selected = [
    ...recyclables.slice(0, halfCount),
    ...trash.slice(0, count - halfCount),
  ];

  return shuffle(selected);
}

// ---- Audio Helpers ----
function playSound(audioEl) {
  if (!audioEl) return;
  audioEl.currentTime = 0;
  audioEl.play().catch(() => {
    // Autoplay blocked — silently ignore
  });
}

// ---- Screen Transitions ----
function showScreen(screen) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('screen--active');
  });
  // Force reflow for animation restart
  void screen.offsetWidth;
  screen.classList.add('screen--active');
}

// ---- Confetti Burst (end screen celebration) ----
function launchConfetti() {
  const colors = ['#2D6A4F', '#95D5B2', '#E76F51', '#F4A261', '#D4B896', '#1B4332'];
  const container = document.body;

  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.top = '-10px';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.width = (Math.random() * 8 + 5) + 'px';
    piece.style.height = (Math.random() * 8 + 5) + 'px';
    piece.style.animationDuration = (Math.random() * 1.5 + 1.5) + 's';
    piece.style.animationDelay = (Math.random() * 0.5) + 's';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    container.appendChild(piece);

    // Cleanup after animation
    piece.addEventListener('animationend', () => piece.remove());
  }
}

// ---- Display Current Item ----
function showCurrentItem() {
  const item = state.items[state.round];
  if (!item) return;

  // Update HUD
  dom.hudRound.textContent = state.round + 1;
  dom.hudScore.textContent = state.score;

  // Card exit animation then enter
  dom.itemCard.classList.remove('item-card--enter');
  dom.itemCard.classList.add('item-card--exit');

  setTimeout(() => {
    // Use emoji as placeholder; if a real image exists, use imagePath
    if (item.imagePath) {
      dom.itemImage.src = item.imagePath;
      dom.itemImage.alt = item.name;
      dom.itemImage.style.display = 'block';
    } else {
      // Render emoji as a large text in an SVG data URI for clean display
      dom.itemImage.src = emojiToDataUri(item.emoji);
      dom.itemImage.alt = item.name;
      dom.itemImage.style.display = 'block';
    }

    dom.itemName.textContent = item.name;

    dom.itemCard.classList.remove('item-card--exit');
    dom.itemCard.classList.add('item-card--enter');
  }, 250);
}

// ---- Convert emoji to a clean data-URI image ----
function emojiToDataUri(emoji) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="160" height="160">
      <text x="50" y="62" font-size="64" text-anchor="middle" dominant-baseline="central">${emoji}</text>
    </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;
}

// ---- Show Feedback ----
function showFeedback(isCorrect) {
  dom.feedback.className = 'feedback feedback--visible';
  dom.feedback.classList.add(isCorrect ? 'feedback--correct' : 'feedback--incorrect');

  dom.feedbackIcon.textContent = isCorrect ? '✅' : '❌';
  dom.feedbackText.textContent = isCorrect ? 'Nice job!' : 'Not quite!';

  // Shake screen on wrong answer
  if (!isCorrect) {
    dom.itemCard.classList.add('shake');
    setTimeout(() => dom.itemCard.classList.remove('shake'), 500);
  }
}

function hideFeedback() {
  dom.feedback.className = 'feedback';
}

// ---- Check Answer ----
function checkAnswer(playerSaidRecyclable) {
  if (state.isProcessing || state.status !== 'playing') return;
  state.isProcessing = true;

  const item = state.items[state.round];
  const isCorrect = item.isRecyclable === playerSaidRecyclable;

  if (isCorrect) {
    state.score++;
    playSound(dom.soundCorrect);
    // Flash the correct button
    const btn = playerSaidRecyclable ? dom.btnRecycle : dom.btnTrash;
    btn.classList.add('btn-choice--flash-correct');
    setTimeout(() => btn.classList.remove('btn-choice--flash-correct'), 600);
  } else {
    playSound(dom.soundIncorrect);
    // Flash the wrong button
    const btn = playerSaidRecyclable ? dom.btnRecycle : dom.btnTrash;
    btn.classList.add('btn-choice--flash-incorrect');
    setTimeout(() => btn.classList.remove('btn-choice--flash-incorrect'), 600);
  }

  // Disable buttons during feedback
  dom.btnTrash.disabled = true;
  dom.btnRecycle.disabled = true;

  showFeedback(isCorrect);

  setTimeout(() => {
    hideFeedback();
    state.round++;

    if (state.round >= TOTAL_ROUNDS) {
      endGame();
    } else {
      showCurrentItem();
      dom.btnTrash.disabled = false;
      dom.btnRecycle.disabled = false;
    }

    state.isProcessing = false;
  }, FEEDBACK_DELAY);
}

// ---- Start Game ----
function startGame() {
  state.status = 'playing';
  state.round = 0;
  state.score = 0;
  state.items = pickItems(TOTAL_ROUNDS);
  state.isProcessing = false;

  playSound(dom.soundStart);

  dom.btnTrash.disabled = false;
  dom.btnRecycle.disabled = false;

  showScreen(dom.screenPlay);
  showCurrentItem();
}

// ---- End Game ----
function endGame() {
  state.status = 'finished';

  playSound(dom.soundEnd);
  showScreen(dom.screenEnd);

  // Populate end screen
  const pct = state.score / TOTAL_ROUNDS;
  dom.endScore.textContent = `${state.score}/${TOTAL_ROUNDS}`;

  // Animated ring fill
  const circumference = 2 * Math.PI * 52; // r=52
  const offset = circumference * (1 - pct);
  // Reset first
  dom.scoreRingFill.style.transition = 'none';
  dom.scoreRingFill.style.strokeDashoffset = circumference;
  // Force reflow
  void dom.scoreRingFill.offsetWidth;
  dom.scoreRingFill.style.transition = `stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)`;
  dom.scoreRingFill.style.transitionDelay = '0.6s';
  dom.scoreRingFill.style.strokeDashoffset = offset;

  // Color ring based on score
  if (pct >= 0.8) {
    dom.scoreRingFill.style.stroke = '#2D6A4F';
  } else if (pct >= 0.5) {
    dom.scoreRingFill.style.stroke = '#F4A261';
  } else {
    dom.scoreRingFill.style.stroke = '#E76F51';
  }

  // Title & message
  if (pct === 1) {
    dom.endTitle.textContent = '🌟 Perfect Score!';
    dom.endMessage.textContent = 'You\'re a recycling champion! The planet thanks you.';
  } else if (pct >= 0.8) {
    dom.endTitle.textContent = '🎉 Great Job!';
    dom.endMessage.textContent = 'You really know your recyclables! Almost perfect.';
  } else if (pct >= 0.5) {
    dom.endTitle.textContent = '👍 Not Bad!';
    dom.endMessage.textContent = 'You\'re getting the hang of it. Try again to improve!';
  } else {
    dom.endTitle.textContent = '🤔 Keep Learning!';
    dom.endMessage.textContent = 'Sorting waste takes practice. Give it another go!';
  }

  // Confetti for good scores
  if (pct >= 0.7) {
    setTimeout(launchConfetti, 800);
  }
}

// ---- Event Listeners ----
dom.btnStart.addEventListener('click', startGame);
dom.btnReplay.addEventListener('click', startGame);
dom.btnTrash.addEventListener('click', () => checkAnswer(false));
dom.btnRecycle.addEventListener('click', () => checkAnswer(true));

// Keyboard support: Left arrow = Trash, Right arrow = Recycle
document.addEventListener('keydown', (e) => {
  if (state.status !== 'playing' || state.isProcessing) return;

  if (e.key === 'ArrowLeft' || e.key === '1') {
    checkAnswer(false);
  } else if (e.key === 'ArrowRight' || e.key === '2') {
    checkAnswer(true);
  }
});

// Start game with Enter/Space on start screen
document.addEventListener('keydown', (e) => {
  if (state.status === 'not-started' && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    startGame();
  }
  if (state.status === 'finished' && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    startGame();
  }
});
