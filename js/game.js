/* ============================================================
   SORT IT OUT! — Game Logic
   ============================================================ */

// ---- Item Database ----
// Each item: { id, name, imagePath, isRecyclable }
// Photos are stored in assets/images/ as .jpg or .png
const ITEMS = [
  { id: 'aluminum-can',    name: 'Aluminum Can',      imagePath: 'assets/images/aluminum-can.jpg',     isRecyclable: true  },
  { id: 'glass-bottle',    name: 'Glass Bottle',      imagePath: 'assets/images/glass-bottle.png',     isRecyclable: true  },
  { id: 'newspaper',       name: 'Newspaper',         imagePath: 'assets/images/newspaper.jpg',        isRecyclable: true  },
  { id: 'cardboard-box',   name: 'Cardboard Box',     imagePath: 'assets/images/cardboard-box.jpg',    isRecyclable: true  },
  { id: 'plastic-bottle',  name: 'Plastic Bottle',    imagePath: 'assets/images/plastic-bottle.jpg',   isRecyclable: true  },
  { id: 'tin-can',         name: 'Tin Can',           imagePath: 'assets/images/tin-can.jpg',          isRecyclable: true  },
  { id: 'paper-bag',       name: 'Paper Bag',         imagePath: 'assets/images/paper-bag.jpg',        isRecyclable: true  },
  { id: 'milk-jug',        name: 'Empty Milk Jug',    imagePath: 'assets/images/milk-jug.jpg',         isRecyclable: true  },
  { id: 'banana-peel',     name: 'Banana Peel',       imagePath: 'assets/images/banana-peel.jpg',      isRecyclable: false },
  { id: 'used-napkin',     name: 'Used Napkin',       imagePath: 'assets/images/used-napkin.jpg',      isRecyclable: false },
  { id: 'plastic-bag',     name: 'Plastic Bag',       imagePath: 'assets/images/plastic-bag.jpg',      isRecyclable: false },
  { id: 'styrofoam-cup',   name: 'Styrofoam Cup',     imagePath: 'assets/images/styrofoam-cup.jpg',    isRecyclable: false },
  { id: 'food-wrapper',    name: 'Food Wrapper',      imagePath: 'assets/images/food-wrapper.jpg',     isRecyclable: false },
  { id: 'broken-mirror',   name: 'Broken Mirror',     imagePath: 'assets/images/broken-mirror.png',    isRecyclable: false },
  { id: 'diaper',          name: 'Dirty Diaper',      imagePath: 'assets/images/diaper.jpg',           isRecyclable: false },
  { id: 'pizza-box-dirty', name: 'Greasy Pizza Box',  imagePath: 'assets/images/pizza-box-dirty.jpg',  isRecyclable: false },
  { id: 'cereal-box',      name: 'Cereal Box',        imagePath: 'assets/images/cereal-box.jpg',       isRecyclable: true  },
  { id: 'egg-carton',      name: 'Egg Carton',        imagePath: 'assets/images/egg-carton.jpg',       isRecyclable: true  },
  { id: 'chip-bag',        name: 'Chip Bag',          imagePath: 'assets/images/chip-bag.jpg',         isRecyclable: false },
  { id: 'rubber-glove',    name: 'Rubber Glove',      imagePath: 'assets/images/rubber-glove.jpg',     isRecyclable: false },
  { id: 'paper',           name: 'Paper',             imagePath: 'assets/images/paper.jpg',            isRecyclable: true  },
  { id: 'candy-wrapper',   name: 'Candy Wrapper',     imagePath: 'assets/images/candy-wrapper.jpg',    isRecyclable: false },
  { id: 'toilet-paper-roll',  name: 'Toilet Paper Roll',    imagePath: 'assets/images/toilet-paper-roll.png',   isRecyclable: true  },
  { id: 'toothbrush',      name: 'Toothbrush',        imagePath: 'assets/images/toothbrush.png',       isRecyclable: false },
  { id: 'plastic-straw',   name: 'Plastic Straw',     imagePath: 'assets/images/plastic-straw.jpg',            isRecyclable: false },
  { id: 'bubble-wrap',     name: 'Bubble Wrap',       imagePath: 'assets/images/bubble-wrap.jpg',      isRecyclable: false },
  { id: 'glass-jar',       name: 'Glass Jar',         imagePath: 'assets/images/glass-jar.jpg',        isRecyclable: true  },
];

const TOTAL_ROUNDS = 10;
const FEEDBACK_DELAY = 1200; // ms to show correct/incorrect feedback

// ---- Game State ----
const state = {
  status: 'not-started', // 'not-started' | 'playing' | 'finished'
  round: 0,
  score: 0,
  items: [],
  incorrectItems: [], // tracks items the player got wrong
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
  endSummary:   document.getElementById('end-summary'),
  scoreRingFill: document.getElementById('score-ring-fill'),

  highscoreEntry:    document.getElementById('highscore-entry'),
  highscoreBoards:   document.getElementById('highscore-boards'),
  personalBestList:  document.getElementById('personal-best-list'),
  globalScoresList:  document.getElementById('global-scores-list'),
  playerNameInput:   document.getElementById('player-name-input'),
  btnSaveScore:      document.getElementById('btn-save-score'),

  btnViewScores:         document.getElementById('btn-view-scores'),
  scoresModal:           document.getElementById('scores-modal'),
  scoresModalBackdrop:   document.querySelector('.scores-modal__backdrop'),
  btnCloseScores:        document.getElementById('btn-close-scores'),
  modalPersonalBestList: document.getElementById('modal-personal-best-list'),
  modalGlobalScoresList: document.getElementById('modal-global-scores-list'),

  soundStart:     [...document.querySelectorAll('.sound-start')],
  soundCorrect:   [...document.querySelectorAll('.sound-correct')],
  soundIncorrect: [...document.querySelectorAll('.sound-incorrect')],
  soundEnd:       [...document.querySelectorAll('.sound-end')],
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
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

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

  // Clear the old image immediately so it never shows during the transition
  dom.itemImage.src = '';
  dom.itemImage.style.visibility = 'hidden';
  dom.itemCard.classList.add('item-card--loading');

  // Preload the next image right away (in parallel with the exit animation)
  const preload = new Image();
  preload.src = item.imagePath;

  setTimeout(() => {
    dom.itemName.textContent = item.name;
    dom.itemImage.alt = item.name;

    const revealImage = () => {
      dom.itemImage.src = item.imagePath;
      dom.itemImage.style.visibility = 'visible';
      dom.itemCard.classList.remove('item-card--loading');
    };

    if (preload.complete) {
      // Already loaded (cached or fast connection)
      revealImage();
    } else {
      // Still downloading — wait for it before revealing
      preload.onload = revealImage;
      preload.onerror = revealImage; // show anyway on error
    }

    dom.itemCard.classList.remove('item-card--exit');
    dom.itemCard.classList.add('item-card--enter');
  }, 250);
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
    playSound(pickRandom(dom.soundCorrect));
    // Flash the correct button
    const btn = playerSaidRecyclable ? dom.btnRecycle : dom.btnTrash;
    btn.classList.add('btn-choice--flash-correct');
    setTimeout(() => btn.classList.remove('btn-choice--flash-correct'), 600);
  } else {
    state.incorrectItems.push({ item, playerSaidRecyclable });
    playSound(pickRandom(dom.soundIncorrect));
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
  state.incorrectItems = [];
  state.isProcessing = false;

  // Hide high score UI from previous game
  dom.highscoreEntry.style.display = 'none';
  dom.highscoreBoards.style.display = 'none';

  playSound(pickRandom(dom.soundStart));

  dom.btnTrash.disabled = false;
  dom.btnRecycle.disabled = false;

  showScreen(dom.screenPlay);
  showCurrentItem();
}

// ---- End Game ----
function endGame() {
  state.status = 'finished';

  // Pick end sound based on score
  const endSounds = { perfect: null, high: null, low: null };
  dom.soundEnd.forEach(el => {
    if (el.src.includes('end_perfect')) endSounds.perfect = el;
    else if (el.src.includes('end_high')) endSounds.high = el;
    else endSounds.low = el;
  });
  const endSound = state.score === 10 ? endSounds.perfect
    : state.score >= 8 ? endSounds.high
    : endSounds.low;
  playSound(endSound);

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

  // Build incorrect-items summary
  if (state.incorrectItems.length > 0) {
    dom.endSummary.innerHTML = `
      <h3 class="summary-title">Items you missed:</h3>
      <ul class="summary-list">
        ${state.incorrectItems.map(({ item }) => `
          <li class="summary-item">
            <img src="${item.imagePath}" alt="${item.name}" class="summary-item__img">
            <div class="summary-item__info">
              <span class="summary-item__name">❌ ${item.name}</span>
              <span class="summary-item__answer">${item.isRecyclable ? '♻️ Recyclable' : '🗑️ Trash'}</span>
            </div>
          </li>
        `).join('')}
      </ul>`;
    dom.endSummary.style.display = 'block';
  } else {
    dom.endSummary.innerHTML = '';
    dom.endSummary.style.display = 'none';
  }

  // Confetti for good scores
  if (pct >= 0.7) {
    setTimeout(launchConfetti, 800);
  }

  // Show high score entry / board
  setTimeout(() => showHighScoreSection(state.score), 600);
}

// ---- High Score Helpers ----

// -- Personal Best (localStorage, single top score) --
const PB_KEY = 'sortItOut_personalBest';

function loadPersonalBest() {
  try {
    return JSON.parse(localStorage.getItem(PB_KEY)) || null;
  } catch {
    return null;
  }
}

function savePersonalBest(name, score) {
  const current = loadPersonalBest();
  if (!current || score > current.score) {
    const entry = { name, score, date: Date.now() };
    localStorage.setItem(PB_KEY, JSON.stringify(entry));
    return { entry, improved: true };
  }
  return { entry: current, improved: false };
}

function renderPersonalBest(highlightNew) {
  const entry = loadPersonalBest();
  const list = dom.personalBestList;
  list.innerHTML = '';
  if (!entry) {
    list.innerHTML = '<li class="highscore-list__empty">No best yet!</li>';
    return;
  }
  const li = document.createElement('li');
  li.className = 'highscore-list__item' + (highlightNew ? ' highscore-list__item--new' : '');
  li.innerHTML = `
    <span class="hs-rank">⭐</span>
    <span class="hs-name">${escapeHtml(entry.name)}</span>
    <span class="hs-score">${entry.score}<span class="hs-total">/${TOTAL_ROUNDS}</span></span>`;
  list.appendChild(li);
}

// -- Global Leaderboard (server-side) --
const API = '/api/scores';

function renderGlobalScores(scores, highlightName) {
  const list = dom.globalScoresList;
  list.innerHTML = '';
  if (!scores || scores.length === 0) {
    list.innerHTML = '<li class="highscore-list__empty">No scores yet!</li>';
    return;
  }
  // Show all scores
  scores.forEach((entry, i) => {
    const li = document.createElement('li');
    li.className = 'highscore-list__item';
    if (highlightName && entry.name === highlightName && i === scores.findIndex(s => s.name === highlightName)) {
      li.classList.add('highscore-list__item--new');
    }
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
    li.innerHTML = `
      <span class="hs-rank">${medal}</span>
      <span class="hs-name">${escapeHtml(entry.name)}</span>
      <span class="hs-score">${entry.score}<span class="hs-total">/${TOTAL_ROUNDS}</span></span>`;
    list.appendChild(li);
  });
}

function setGlobalLoading(msg) {
  dom.globalScoresList.innerHTML = `<li class="highscore-list__empty">${msg}</li>`;
}

function fetchAndRenderGlobal(highlightName) {
  setGlobalLoading('Loading…');
  fetch(API)
    .then(r => r.json())
    .then(scores => renderGlobalScores(scores, highlightName))
    .catch(() => setGlobalLoading('Scores unavailable offline.'));
}

// -- Shared utilities --
function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showHighScoreSection(newScore) {
  dom.playerNameInput.value = '';
  dom.highscoreEntry.style.display = 'block';

  // Show boards immediately with current data
  renderPersonalBest(false);
  fetchAndRenderGlobal(null);
  dom.highscoreBoards.style.display = 'flex';

  dom.btnSaveScore.onclick = () => {
    const name = dom.playerNameInput.value.trim() || 'Anonymous';
    dom.highscoreEntry.style.display = 'none';

    // Save personal best
    const { improved } = savePersonalBest(name, newScore);
    renderPersonalBest(improved);

    // Submit to server
    setGlobalLoading('Saving…');
    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score: newScore }),
    })
      .then(r => r.json())
      .then(scores => renderGlobalScores(scores, name))
      .catch(() => setGlobalLoading('Could not save — server unavailable.'));
  };

  dom.playerNameInput.onkeydown = (e) => {
    if (e.key === 'Enter') dom.btnSaveScore.click();
  };
}

// ---- High Scores Modal (Start Screen) ----
function openScoresModal() {
  dom.scoresModal.hidden = false;
  // Populate with fresh data
  const pb = loadPersonalBest();
  const pbList = dom.modalPersonalBestList;
  pbList.innerHTML = '';
  if (!pb) {
    pbList.innerHTML = '<li class="highscore-list__empty">No best yet!</li>';
  } else {
    const li = document.createElement('li');
    li.className = 'highscore-list__item';
    li.innerHTML = `
      <span class="hs-rank">⭐</span>
      <span class="hs-name">${escapeHtml(pb.name)}</span>
      <span class="hs-score">${pb.score}<span class="hs-total">/${TOTAL_ROUNDS}</span></span>`;
    pbList.appendChild(li);
  }
  dom.modalGlobalScoresList.innerHTML = '<li class="highscore-list__empty">Loading…</li>';
  fetch(API)
    .then(r => r.json())
    .then(scores => {
      const list = dom.modalGlobalScoresList;
      list.innerHTML = '';
      if (!scores || scores.length === 0) {
        list.innerHTML = '<li class="highscore-list__empty">No scores yet!</li>';
        return;
      }
      scores.forEach((entry, i) => {
        const li = document.createElement('li');
        li.className = 'highscore-list__item';
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
        li.innerHTML = `
          <span class="hs-rank">${medal}</span>
          <span class="hs-name">${escapeHtml(entry.name)}</span>
          <span class="hs-score">${entry.score}<span class="hs-total">/${TOTAL_ROUNDS}</span></span>`;
        list.appendChild(li);
      });
    })
    .catch(() => {
      dom.modalGlobalScoresList.innerHTML = '<li class="highscore-list__empty">Scores unavailable offline.</li>';
    });
}

function closeScoresModal() {
  dom.scoresModal.hidden = true;
}

// ---- Event Listeners ----
dom.btnStart.addEventListener('click', startGame);
dom.btnReplay.addEventListener('click', startGame);
dom.btnTrash.addEventListener('click', () => checkAnswer(false));
dom.btnRecycle.addEventListener('click', () => checkAnswer(true));
dom.btnViewScores.addEventListener('click', openScoresModal);
dom.btnCloseScores.addEventListener('click', closeScoresModal);
dom.scoresModalBackdrop.addEventListener('click', closeScoresModal);

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
  if (e.key === 'Escape' && !dom.scoresModal.hidden) {
    closeScoresModal();
    return;
  }
  if (state.status === 'not-started' && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    startGame();
  }
  if (state.status === 'finished' && (e.key === 'Enter' || e.key === ' ')) {
    if (document.activeElement === dom.playerNameInput) return;
    e.preventDefault();
    startGame();
  }
});
