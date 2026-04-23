/* ─── STATE ─────────────────────────────────────────────────────────────────── */

const state = {
  word: null,
  spellAttempts: 0,
  maxSpellAttempts: 3,
  spellPassed: false,
  sentencePassed: false,
  userSentence: '',
  revealed: false,
  introOffset: 0,  // session-only: how many "know it" skips this session
};

/* ─── WARDROBE CATALOG ───────────────────────────────────────────────────────── */

const WARDROBE_CATALOG = [
  { id: 'shirt_ocean',    type: 'shirt',     name: 'Ocean Blue',     cost: 15, key: 'ocean' },
  { id: 'shirt_sunset',   type: 'shirt',     name: 'Sunset',         cost: 15, key: 'sunset' },
  { id: 'shirt_forest',   type: 'shirt',     name: 'Forest',         cost: 15, key: 'forest' },
  { id: 'shirt_midnight', type: 'shirt',     name: 'Midnight',       cost: 25, key: 'midnight' },
  { id: 'shirt_gold',     type: 'shirt',     name: 'Gold Rush',      cost: 25, key: 'gold' },
  { id: 'hat_flatcap',    type: 'hat',       name: 'Flat Cap',       cost: 20, key: 'flatcap' },
  { id: 'hat_beanie',     type: 'hat',       name: 'Beanie',         cost: 20, key: 'beanie' },
  { id: 'acc_bowtie',     type: 'accessory', name: 'Bow Tie',        cost: 15, key: 'bowtie' },
  { id: 'acc_scarf',      type: 'accessory', name: 'Scarf',          cost: 15, key: 'scarf' },
  { id: 'acc_cape',       type: 'accessory', name: 'Cape',           cost: 25, key: 'cape' },
  { id: 'acc_guitar',     type: 'accessory', name: 'Electric Guitar',cost: 30, key: 'guitar' },
  { id: 'acc_cane',       type: 'accessory', name: 'Walking Cane',   cost: 20, key: 'cane' },
];

/* ─── COINS ──────────────────────────────────────────────────────────────────── */

function getCoins() {
  const earned = parseInt(localStorage.getItem('pete_coins_earned') || '0', 10);
  const spent  = parseInt(localStorage.getItem('pete_coins_spent')  || '0', 10);
  return earned - spent;
}

function earnCoins(n) {
  const earned = parseInt(localStorage.getItem('pete_coins_earned') || '0', 10);
  localStorage.setItem('pete_coins_earned', earned + n);
  updateCoinDisplay();
}

function spendCoins(n) {
  const spent = parseInt(localStorage.getItem('pete_coins_spent') || '0', 10);
  localStorage.setItem('pete_coins_spent', spent + n);
  updateCoinDisplay();
}

function updateCoinDisplay() {
  const coins = getCoins();
  document.querySelectorAll('.coin-count').forEach(el => el.textContent = coins);
}

/* ─── STREAK ─────────────────────────────────────────────────────────────────── */

function getStreak() {
  try {
    return JSON.parse(localStorage.getItem('pete_streak') || '{"count":0,"lastDate":null}');
  } catch { return { count: 0, lastDate: null }; }
}

function updateStreak() {
  const streak = getStreak();
  const todayKey = getTodayKey();
  if (streak.lastDate === todayKey) return; // already recorded today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = `${yesterday.getFullYear()}-${yesterday.getMonth()+1}-${yesterday.getDate()}`;

  streak.count = (streak.lastDate === yKey) ? streak.count + 1 : 1;
  streak.lastDate = todayKey;
  localStorage.setItem('pete_streak', JSON.stringify(streak));
  updateStreakDisplay();
}

function updateStreakDisplay() {
  const { count } = getStreak();
  document.querySelectorAll('.streak-count').forEach(el => el.textContent = count);
}

/* ─── WARDROBE STORAGE ───────────────────────────────────────────────────────── */

function getOwned() {
  try { return JSON.parse(localStorage.getItem('pete_owned') || '[]'); }
  catch { return []; }
}

function isOwned(id) { return getOwned().includes(id); }

function ownItem(id) {
  const owned = getOwned();
  if (!owned.includes(id)) {
    owned.push(id);
    localStorage.setItem('pete_owned', JSON.stringify(owned));
  }
}

function getEquipped() {
  try { return JSON.parse(localStorage.getItem('pete_equipped') || '{}'); }
  catch { return {}; }
}

function equipItem(id, type) {
  const equipped = getEquipped();
  equipped[type] = (equipped[type] === id) ? null : id; // toggle
  localStorage.setItem('pete_equipped', JSON.stringify(equipped));
  refreshAllPetes();
  renderWardrobeGrid(document.querySelector('.wardrobe-tab.active')?.dataset.tab || 'shirt');
  updateWardrobePreview();
}

function getWardrobeForPete() {
  const equipped = getEquipped();
  const wardrobe = {};
  for (const [type, id] of Object.entries(equipped)) {
    if (!id) continue;
    const item = WARDROBE_CATALOG.find(i => i.id === id);
    if (item) wardrobe[type === 'accessory' ? 'accessory' : type] = item.key;
  }
  return wardrobe;
}

/* ─── STORAGE ────────────────────────────────────────────────────────────────── */

const STORAGE_KEY = 'wordsmith_progress';

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveProgress(data) {
  const all = loadProgress();
  const dateKey = getTodayKey();
  all[dateKey] = { ...all[dateKey], ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function getTodayRecord() {
  return loadProgress()[getTodayKey()] || {};
}

/* ─── NAVIGATION ─────────────────────────────────────────────────────────────── */

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('screen-' + id);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/* ─── FORMAT DATE ────────────────────────────────────────────────────────────── */

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  });
}

/* ─── INTRO SCREEN ───────────────────────────────────────────────────────────── */

function getIntroWord() {
  const baseOffset = parseInt(localStorage.getItem('wordsmith_offset') || '0', 10);
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const words = getShuffledWords();
  return words[(dayOfYear + baseOffset + state.introOffset) % words.length];
}

function initIntro() {
  const word = getIntroWord();
  document.getElementById('introWord').textContent = word.word;
  document.getElementById('introPos').textContent = word.partOfSpeech;

  const peteEl = document.getElementById('peteIntro');
  if (peteEl) peteEl.innerHTML = createPeteSVG(80, { bubble: 'Do you<br>know me? 🤔' });
}

function handleKnowIt() {
  state.introOffset++;
  // Animate word out and back in
  const wordEl = document.getElementById('introWord');
  const posEl = document.getElementById('introPos');
  wordEl.style.opacity = '0';
  wordEl.style.transform = 'translateY(-12px)';
  posEl.style.opacity = '0';
  setTimeout(() => {
    initIntroWord();
    wordEl.style.transition = 'none';
    posEl.style.transition = 'none';
    wordEl.style.transform = 'translateY(12px)';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        wordEl.style.transition = '';
        posEl.style.transition = '';
        wordEl.style.opacity = '1';
        wordEl.style.transform = 'translateY(0)';
        posEl.style.opacity = '1';
      });
    });
  }, 180);
}

function initIntroWord() {
  const word = getIntroWord();
  document.getElementById('introWord').textContent = word.word;
  document.getElementById('introPos').textContent = word.partOfSpeech;
}

function handleLearnIt() {
  // Commit the current intro offset as the persistent word offset
  const baseOffset = parseInt(localStorage.getItem('wordsmith_offset') || '0', 10);
  const newOffset = (baseOffset + state.introOffset) % WORDS.length;
  localStorage.setItem('wordsmith_offset', newOffset);
  state.introOffset = 0;

  // Load the today screen for the chosen word
  initToday();
  showScreen('today');
}

/* ─── PETE INJECTION ─────────────────────────────────────────────────────────── */

function injectAllPetes() {
  const wd = getWardrobeForPete();

  injectPete('peteNav', 32, { wardrobe: wd });

  const el = document.getElementById('peteToday');
  if (el) el.innerHTML = createPeteSVG(90, { bubble: 'A new word<br>for you! 📖', wardrobe: wd });

  const el2 = document.getElementById('peteSpell');
  if (el2) el2.innerHTML = createPeteSVG(58, { bubble: 'Can you<br>spell it?', wardrobe: wd });

  const el3 = document.getElementById('peteQuiz');
  if (el3) el3.innerHTML = createPeteSVG(58, { bubble: 'Choose<br>wisely!', wardrobe: wd });

  const el4 = document.getElementById('peteSentence');
  if (el4) el4.innerHTML = createPeteSVG(58, { bubble: 'Make it<br>your own.', wardrobe: wd });

  const el5 = document.getElementById('peteChallenge');
  if (el5) el5.innerHTML = createPeteSVG(62, { flip: true, wardrobe: wd });

  // Intro screen
  initIntro();
}

function refreshAllPetes() {
  injectAllPetes();
}

/* ─── SENTENCE EVALUATION ────────────────────────────────────────────────────── */

const EVAL_LEVELS = [
  { min: 1, label: 'Give it another go!',    comment: 'Try a longer sentence with a bit more context.' },
  { min: 2, label: 'Getting there!',         comment: 'Solid start — try adding some personal context.' },
  { min: 3, label: 'Good work!',             comment: 'Pete nods approvingly from across the pew.' },
  { min: 4, label: 'Nicely done!',           comment: 'That word is in good hands. Well crafted.' },
  { min: 5, label: 'Outstanding!',           comment: 'Pete\'s chest swells with pride. Truly.' },
];

function evaluateSentence(sentence, word) {
  const lower = sentence.toLowerCase();
  const words = sentence.trim().split(/\s+/).filter(Boolean);
  const len = words.length;

  let score = 0;

  // Must contain the word (already validated before we get here)
  score += 1;

  // Length bonus
  if (len >= 8)  score += 1;
  if (len >= 16) score += 1;

  // Personal context (pronouns suggest real-life framing)
  const personal = /\b(i|my|me|we|our|he|she|her|his|they|their|you|your)\b/i.test(sentence);
  if (personal) score += 1;

  // Complexity (punctuation or connectives signal a more considered sentence)
  const complex = /[,;:]/.test(sentence) ||
    /\b(because|although|despite|however|whereas|while|since|though|even though|as a result|which|who)\b/i.test(sentence);
  if (complex) score += 1;

  score = Math.min(5, Math.max(1, score));
  const level = EVAL_LEVELS[score - 1];

  return { score, label: level.label, comment: level.comment };
}

function showEvaluation(result) {
  const evalEl = document.getElementById('sentenceEval');
  const starsEl = document.getElementById('evalStars');
  const labelEl = document.getElementById('evalLabel');
  const commentEl = document.getElementById('evalComment');
  const peteEl = document.getElementById('peteSentenceEval');

  // Stars
  starsEl.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const s = document.createElement('span');
    s.className = `eval-star ${i <= result.score ? 'filled' : 'empty'}`;
    s.textContent = i <= result.score ? '★' : '☆';
    starsEl.appendChild(s);
  }

  labelEl.textContent = result.label;
  commentEl.textContent = result.comment;

  // Pete reacts based on score
  const peteBubble = result.score >= 4 ? '🎉 Bravo!' : result.score >= 3 ? '👍 Nice!' : '📝 Try more!';
  if (peteEl) peteEl.innerHTML = createPeteSVG(60, { bubble: peteBubble });

  evalEl.classList.remove('hidden');
}

/* ─── TODAY SCREEN ───────────────────────────────────────────────────────────── */

function initToday() {
  state.word = getTodayWord();
  const w = state.word;
  const record = getTodayRecord();

  document.getElementById('todayDate').textContent = formatDate(new Date());
  document.getElementById('todayPos').textContent = w.partOfSpeech;
  document.getElementById('todayWord').textContent = w.word;
  document.getElementById('todayPronunciation').textContent = w.pronunciation;
  document.getElementById('todayDefinition').textContent = w.definition;
  document.getElementById('todayEtymology').textContent = w.etymology;
  document.getElementById('todayExample').textContent = `"${w.example}"`;

  // Update progress dots
  const steps = document.querySelectorAll('.progress-step');
  if (record.spellPassed) steps[0].classList.add('done');
  if (record.quizPassed) steps[1].classList.add('done');
  if (record.sentencePassed) steps[2].classList.add('done');
  if (record.challenged) steps[3].classList.add('done');

  // Update button label if already started
  const btn = document.getElementById('startPracticeBtn');
  if (record.challenged) {
    btn.textContent = '✓ Completed today';
    btn.disabled = true;
  } else if (record.sentencePassed) {
    btn.innerHTML = 'Continue to Challenge <span class="btn-arrow">→</span>';
  } else if (record.spellPassed) {
    btn.innerHTML = 'Continue Practice <span class="btn-arrow">→</span>';
  }
}

function handleStartPractice() {
  const record = getTodayRecord();
  if (record.sentencePassed) {
    initChallenge();
    showScreen('challenge');
  } else if (record.quizPassed) {
    initSentence();
    showScreen('sentence');
  } else if (record.spellPassed) {
    initQuiz();
    showScreen('quiz');
  } else {
    initSpelling();
    showScreen('spelling');
  }
}

/* ─── SPELLING SCREEN ────────────────────────────────────────────────────────── */

function initSpelling() {
  const w = state.word;
  state.spellAttempts = 0;
  state.spellPassed = getTodayRecord().spellPassed || false;
  state.revealed = false;

  const hintEl = document.getElementById('spellHintWord');
  const defHintEl = document.getElementById('spellDefinitionHint');
  const inputEl = document.getElementById('spellInput');
  const checkBtn = document.getElementById('spellCheckBtn');
  const nextBtn = document.getElementById('spellNextBtn');
  const feedbackEl = document.getElementById('spellFeedback');
  const attemptsEl = document.getElementById('spellAttempts');
  const revealBtn = document.getElementById('spellRevealBtn');
  const letterDisplayEl = document.getElementById('spellLetterDisplay');

  // Reset
  hintEl.textContent = '';
  defHintEl.textContent = `"${w.definition}"`;
  inputEl.value = '';
  inputEl.className = 'spell-input';
  inputEl.disabled = false;
  feedbackEl.textContent = '';
  feedbackEl.className = 'spell-feedback';
  attemptsEl.textContent = '';
  checkBtn.disabled = true;
  checkBtn.classList.remove('hidden');
  nextBtn.classList.add('hidden');
  letterDisplayEl.innerHTML = '';
  revealBtn.textContent = 'Show word';
  state.revealed = false;

  if (state.spellPassed) {
    // Already passed — go straight to "continue"
    hintEl.textContent = w.word;
    hintEl.classList.add('revealed');
    feedbackEl.textContent = '✓ Already completed!';
    feedbackEl.className = 'spell-feedback success';
    checkBtn.classList.add('hidden');
    nextBtn.classList.remove('hidden');
    renderLetterDisplay(w.word, w.word);
    return;
  }
}

function onSpellInput() {
  const inputEl = document.getElementById('spellInput');
  const checkBtn = document.getElementById('spellCheckBtn');
  checkBtn.disabled = inputEl.value.trim().length === 0;
  // No live letter hint — reveal only after checking
}

function renderLetterDisplay(typed, target) {
  const el = document.getElementById('spellLetterDisplay');
  el.innerHTML = '';
  const targetLower = target.toLowerCase();
  const typedLower = typed.toLowerCase();

  for (let i = 0; i < target.length; i++) {
    const div = document.createElement('div');
    div.className = 'spell-letter';
    div.textContent = target[i];

    if (i < typedLower.length) {
      if (typedLower[i] === targetLower[i]) {
        div.classList.add('correct');
      } else {
        div.classList.add('incorrect');
      }
    } else if (i < typed.length) {
      div.classList.add('filled');
    }

    el.appendChild(div);
  }
}

function checkSpelling() {
  const inputEl = document.getElementById('spellInput');
  const feedbackEl = document.getElementById('spellFeedback');
  const attemptsEl = document.getElementById('spellAttempts');
  const checkBtn = document.getElementById('spellCheckBtn');
  const nextBtn = document.getElementById('spellNextBtn');
  const hintEl = document.getElementById('spellHintWord');

  const typed = inputEl.value.trim().toLowerCase();
  const target = state.word.word.toLowerCase();

  state.spellAttempts++;

  renderLetterDisplay(typed, state.word.word);

  if (typed === target) {
    // Correct!
    inputEl.className = 'spell-input correct';
    feedbackEl.textContent = '✓ Spelled correctly!';
    feedbackEl.className = 'spell-feedback success';
    attemptsEl.textContent = '';
    checkBtn.classList.add('hidden');
    nextBtn.classList.remove('hidden');
    inputEl.disabled = true;
    state.spellPassed = true;
    saveProgress({ spellPassed: true });
    updateProgressDots();
    showToast('Spelling complete!');
  } else {
    // Wrong
    inputEl.className = 'spell-input incorrect';
    setTimeout(() => inputEl.classList.remove('incorrect'), 500);

    const remaining = state.maxSpellAttempts - state.spellAttempts;

    if (remaining <= 0) {
      // Out of attempts — reveal and move on
      feedbackEl.textContent = `The correct spelling is: ${state.word.word}`;
      feedbackEl.className = 'spell-feedback error';
      attemptsEl.textContent = '';
      hintEl.textContent = state.word.word;
      hintEl.classList.add('revealed');
      checkBtn.classList.add('hidden');
      nextBtn.classList.remove('hidden');
      inputEl.disabled = true;
      // Still mark spell as "passed" (we don't block progress)
      state.spellPassed = true;
      saveProgress({ spellPassed: true });
      updateProgressDots();
    } else {
      feedbackEl.textContent = `Not quite — try again.`;
      feedbackEl.className = 'spell-feedback error';
      attemptsEl.textContent = `${remaining} attempt${remaining === 1 ? '' : 's'} remaining`;
    }
  }
}

function revealSpellWord() {
  const hintEl = document.getElementById('spellHintWord');
  const revealBtn = document.getElementById('spellRevealBtn');

  if (!state.revealed) {
    hintEl.textContent = state.word.word;
    hintEl.classList.add('revealed');
    revealBtn.textContent = 'Hide word';
    state.revealed = true;
  } else {
    hintEl.textContent = '';
    hintEl.classList.remove('revealed');
    revealBtn.textContent = 'Show word';
    state.revealed = false;
  }
}

/* ─── QUIZ SCREEN ────────────────────────────────────────────────────────────── */

function initQuiz() {
  const w = state.word;
  const record = getTodayRecord();
  const quizData = QUIZ[w.word];

  document.getElementById('quizWordHint').textContent = w.word;
  document.getElementById('quizDefinitionReminder').textContent = w.definition;

  const optionsEl = document.getElementById('quizOptions');
  const explanationEl = document.getElementById('quizExplanation');
  const nextBtn = document.getElementById('quizNextBtn');

  optionsEl.innerHTML = '';
  explanationEl.innerHTML = '';
  explanationEl.className = 'quiz-explanation hidden';
  nextBtn.classList.add('hidden');

  if (!quizData) {
    // No quiz data for this word — skip straight through
    saveProgress({ quizPassed: true });
    nextBtn.classList.remove('hidden');
    nextBtn.textContent = 'Continue to write a sentence →';
    return;
  }

  if (record.quizPassed) {
    // Already done — render result state
    renderQuizAnswered(quizData, record.quizAnswer, true);
    return;
  }

  const labels = ['A', 'B', 'C', 'D'];

  quizData.sentences.forEach((sentence, idx) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.innerHTML = `
      <div class="quiz-option-letter">${labels[idx]}</div>
      <div class="quiz-option-text">${sentence}</div>
    `;
    btn.addEventListener('click', () => handleQuizAnswer(idx, quizData));
    optionsEl.appendChild(btn);
  });
}

function handleQuizAnswer(selectedIdx, quizData) {
  const correctIdx = quizData.correct;
  const isCorrect = selectedIdx === correctIdx;
  const labels = ['A', 'B', 'C', 'D'];

  saveProgress({ quizPassed: true, quizAnswer: selectedIdx, quizCorrect: isCorrect });
  updateProgressDots();

  renderQuizAnswered(quizData, selectedIdx, false);

  if (isCorrect) {
    showToast('Correct! Well spotted.');
  } else {
    showToast(`Not quite — the answer was ${labels[correctIdx]}.`);
  }
}

function renderQuizAnswered(quizData, selectedIdx, wasAlreadyDone) {
  const optionsEl = document.getElementById('quizOptions');
  const explanationEl = document.getElementById('quizExplanation');
  const nextBtn = document.getElementById('quizNextBtn');
  const correctIdx = quizData.correct;
  const isCorrect = selectedIdx === correctIdx;
  const labels = ['A', 'B', 'C', 'D'];

  optionsEl.innerHTML = '';
  quizData.sentences.forEach((sentence, idx) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.disabled = true;

    if (idx === selectedIdx && isCorrect) {
      btn.classList.add('correct');
    } else if (idx === selectedIdx && !isCorrect) {
      btn.classList.add('incorrect');
    } else if (!isCorrect && idx === correctIdx) {
      btn.classList.add('reveal-correct');
    } else {
      btn.classList.add('dimmed');
    }

    btn.innerHTML = `
      <div class="quiz-option-letter">${labels[idx]}</div>
      <div class="quiz-option-text">${sentence}</div>
    `;
    optionsEl.appendChild(btn);
  });

  // Show explanation
  explanationEl.innerHTML = `
    <div class="quiz-explanation-label">${isCorrect ? '✓ Correct' : `✗ Incorrect — the right answer was ${labels[correctIdx]}`}</div>
    <div class="quiz-explanation-text">${quizData.explanation}</div>
  `;
  explanationEl.className = `quiz-explanation ${isCorrect ? 'quiz-result-correct' : 'quiz-result-incorrect'}`;

  nextBtn.classList.remove('hidden');
}

/* ─── SENTENCE SCREEN ────────────────────────────────────────────────────────── */

function initSentence() {
  const w = state.word;
  const record = getTodayRecord();
  state.sentencePassed = record.sentencePassed || false;
  state.userSentence = record.userSentence || '';

  const wordHintEl = document.getElementById('sentenceWordHint');
  const tipEl = document.getElementById('sentenceTipText');
  const inputEl = document.getElementById('sentenceInput');
  const feedbackEl = document.getElementById('sentenceFeedback');
  const counterEl = document.getElementById('sentenceCounter');
  const submitBtn = document.getElementById('sentenceSubmitBtn');
  const nextBtn = document.getElementById('sentenceNextBtn');

  wordHintEl.textContent = w.word;
  tipEl.textContent = w.tip || w.usage || '';
  inputEl.value = state.userSentence;
  feedbackEl.textContent = '';
  feedbackEl.className = 'sentence-feedback';
  counterEl.textContent = inputEl.value.length + ' characters';
  submitBtn.disabled = inputEl.value.trim().length < 5;
  submitBtn.classList.remove('hidden');
  nextBtn.classList.add('hidden');

  if (state.sentencePassed) {
    feedbackEl.textContent = '✓ Sentence saved!';
    feedbackEl.className = 'sentence-feedback success';
    submitBtn.classList.add('hidden');
    nextBtn.classList.remove('hidden');
    inputEl.classList.add('has-word');
  }
}

function onSentenceInput() {
  const inputEl = document.getElementById('sentenceInput');
  const counterEl = document.getElementById('sentenceCounter');
  const submitBtn = document.getElementById('sentenceSubmitBtn');
  const feedbackEl = document.getElementById('sentenceFeedback');

  const val = inputEl.value;
  counterEl.textContent = val.length + ' characters';
  submitBtn.disabled = val.trim().length < 5;

  // Live check if word is in sentence
  const hasWord = val.toLowerCase().includes(state.word.word.toLowerCase());
  if (val.length > 0) {
    if (hasWord) {
      inputEl.classList.add('has-word');
      feedbackEl.textContent = `✓ "${state.word.word}" found in your sentence`;
      feedbackEl.className = 'sentence-feedback success';
    } else {
      inputEl.classList.remove('has-word');
      feedbackEl.textContent = `Don't forget to include "${state.word.word}"`;
      feedbackEl.className = 'sentence-feedback error';
    }
  } else {
    inputEl.classList.remove('has-word');
    feedbackEl.textContent = '';
    feedbackEl.className = 'sentence-feedback';
  }
}

function submitSentence() {
  const inputEl = document.getElementById('sentenceInput');
  const feedbackEl = document.getElementById('sentenceFeedback');
  const submitBtn = document.getElementById('sentenceSubmitBtn');
  const nextBtn = document.getElementById('sentenceNextBtn');

  const val = inputEl.value.trim();

  if (val.length < 5) {
    feedbackEl.textContent = 'Write a full sentence!';
    feedbackEl.className = 'sentence-feedback error';
    return;
  }

  const hasWord = val.toLowerCase().includes(state.word.word.toLowerCase());

  if (!hasWord) {
    feedbackEl.textContent = `Your sentence needs to include "${state.word.word}"!`;
    feedbackEl.className = 'sentence-feedback error';
    return;
  }

  // Success
  state.sentencePassed = true;
  state.userSentence = val;
  saveProgress({ sentencePassed: true, userSentence: val });
  updateProgressDots();

  feedbackEl.textContent = '✓ Sentence saved — great work!';
  feedbackEl.className = 'sentence-feedback success';
  submitBtn.classList.add('hidden');

  // Evaluate and show Pete's reaction
  const evalResult = evaluateSentence(val, state.word.word);
  showEvaluation(evalResult);

  nextBtn.classList.remove('hidden');
  showToast('Sentence submitted!');
}

/* ─── CHALLENGE / TRY IT NOW SCREEN ─────────────────────────────────────────── */

function initChallenge() {
  const w = state.word;
  const record = getTodayRecord();
  const userSentence = state.userSentence || record.userSentence || w.example;

  document.getElementById('challengeWord').textContent = w.word;
  document.getElementById('challengeCompleteWord').textContent = w.word;

  // Pre-fill editable message textarea with user's sentence
  const msgInput = document.getElementById('shareMessageInput');
  if (msgInput) msgInput.value = userSentence;

  const completeBlock = document.getElementById('challengeCompleteBlock');
  const shareGrid = document.getElementById('shareGrid');
  const actionsBlock = document.getElementById('challengeActions');
  const messageCard = document.querySelector('.share-message-card');

  if (record.challenged) {
    completeBlock.classList.remove('hidden');
    shareGrid.classList.add('hidden');
    if (messageCard) messageCard.classList.add('hidden');
    actionsBlock.classList.add('hidden');
  } else {
    completeBlock.classList.add('hidden');
    shareGrid.classList.remove('hidden');
    if (messageCard) messageCard.classList.remove('hidden');
    actionsBlock.classList.remove('hidden');
  }

  // Hide native share button if API not supported
  const nativeBtn = document.getElementById('shareNativeBtn');
  if (!navigator.share) {
    nativeBtn.classList.add('hidden');
  }
}

function markChallenged() {
  const wasAlreadyChallenged = getTodayRecord().challenged;
  saveProgress({ challenged: true });
  updateProgressDots();

  if (!wasAlreadyChallenged) {
    earnCoins(10);
    updateStreak();
  }

  document.getElementById('challengeCompleteBlock').classList.remove('hidden');
  document.getElementById('shareGrid').classList.add('hidden');
  const messageCard = document.querySelector('.share-message-card');
  if (messageCard) messageCard.classList.add('hidden');
  document.getElementById('challengeActions').classList.add('hidden');
  showToast('Word mastered! See you tomorrow.');

  // Pete celebrates
  const peteCompleteEl = document.getElementById('peteComplete');
  if (peteCompleteEl) peteCompleteEl.innerHTML = createPeteSVG(90, { bubble: '🎉 Word<br>mastered!' });

  const btn = document.getElementById('startPracticeBtn');
  btn.textContent = '✓ Completed today';
  btn.disabled = true;
}

function getShareText() {
  const msgInput = document.getElementById('shareMessageInput');
  if (msgInput && msgInput.value.trim()) return msgInput.value.trim();
  return state.userSentence || state.word.example;
}

function doShare(tileId) {
  markChallenged();
  const tile = document.getElementById(tileId);
  if (tile) {
    tile.classList.add('shared');
    tile.querySelector('.share-tile-label').textContent = '✓ Sent!';
  }
}

function shareNative() {
  const text = getShareText();
  if (navigator.share) {
    navigator.share({ text })
      .then(() => doShare('shareNativeBtn'))
      .catch(() => {}); // user cancelled — don't mark done
  }
}

function shareMessages() {
  const text = encodeURIComponent(getShareText());
  window.open(`sms:?body=${text}`, '_blank');
  doShare('shareMessagesBtn');
}

function shareEmail() {
  const w = state.word;
  const subject = encodeURIComponent(`Have you heard of the word "${w.word}"?`);
  const body = encodeURIComponent(getShareText());
  window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  doShare('shareEmailBtn');
}

function shareWhatsapp() {
  const text = encodeURIComponent(getShareText());
  window.open(`https://wa.me/?text=${text}`, '_blank');
  doShare('shareWhatsappBtn');
}

function shareTwitter() {
  const text = encodeURIComponent(getShareText());
  window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  doShare('shareTwitterBtn');
}

function shareInstagram() {
  // Instagram has no deep-link for pre-filled text — copy to clipboard then open
  navigator.clipboard.writeText(getShareText()).then(() => {
    showToast('Copied! Open Instagram and paste into a DM or story.');
    window.open('https://www.instagram.com', '_blank');
    doShare('shareInstagramBtn');
  }).catch(() => {
    showToast('Open Instagram and type your sentence.');
    window.open('https://www.instagram.com', '_blank');
  });
}

function shareCopy() {
  navigator.clipboard.writeText(getShareText()).then(() => {
    showToast('Copied to clipboard!');
    doShare('shareCopyBtn');
    const tile = document.getElementById('shareCopyBtn');
    if (tile) tile.querySelector('.share-tile-icon').textContent = '✓';
  }).catch(() => {
    showToast('Could not copy — try manually.');
  });
}


/* ─── WARDROBE SCREEN ────────────────────────────────────────────────────────── */

function initWardrobe() {
  updateWardrobePreview();
  updateCoinDisplay();
  renderWardrobeGrid('shirt');

  // Tab switching
  document.querySelectorAll('.wardrobe-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.wardrobe-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderWardrobeGrid(tab.dataset.tab);
    });
  });
}

function updateWardrobePreview() {
  const wd = getWardrobeForPete();
  const el = document.getElementById('peteWardrobePreview');
  if (el) el.innerHTML = createPeteSVG(100, { wardrobe: wd });
}

function renderWardrobeGrid(tab) {
  const grid = document.getElementById('wardrobeGrid');
  const items = WARDROBE_CATALOG.filter(i => i.type === tab);
  const equipped = getEquipped();
  const coins = getCoins();

  grid.innerHTML = '';

  // Default option (free)
  const defaultCard = document.createElement('div');
  const isDefaultEquipped = !equipped[tab];
  defaultCard.className = `wardrobe-item${isDefaultEquipped ? ' equipped' : ''}`;
  const defaultWd = { ...getWardrobeForPete() };
  delete defaultWd[tab === 'accessory' ? 'accessory' : tab];
  defaultCard.innerHTML = `
    <div class="wardrobe-item-preview">${createPeteSVG(60, { wardrobe: defaultWd })}</div>
    <div class="wardrobe-item-name">Default</div>
    ${isDefaultEquipped
      ? `<div class="wardrobe-item-default">✓ Wearing now</div>`
      : `<button class="wardrobe-item-btn equip" data-id="__default__" data-type="${tab}">Wear this</button>`
    }
  `;
  if (!isDefaultEquipped) {
    defaultCard.querySelector('button').addEventListener('click', () => {
      const eq = getEquipped();
      eq[tab] = null;
      localStorage.setItem('pete_equipped', JSON.stringify(eq));
      refreshAllPetes();
      renderWardrobeGrid(tab);
      updateWardrobePreview();
    });
  }
  grid.appendChild(defaultCard);

  items.forEach(item => {
    const owned = isOwned(item.id);
    const isEquipped = equipped[tab] === item.id;
    const canAfford = coins >= item.cost;

    // Preview Pete with this item over current wardrobe
    const previewWd = { ...getWardrobeForPete(), [tab === 'accessory' ? 'accessory' : tab]: item.key };

    const card = document.createElement('div');
    card.className = `wardrobe-item${isEquipped ? ' equipped' : owned ? ' owned' : ''}`;
    card.innerHTML = `
      <div class="wardrobe-item-preview">${createPeteSVG(60, { wardrobe: previewWd })}</div>
      <div class="wardrobe-item-name">${item.name}</div>
      ${isEquipped
        ? `<button class="wardrobe-item-btn unequip" data-id="${item.id}" data-type="${tab}">✓ Equipped</button>`
        : owned
          ? `<button class="wardrobe-item-btn equip" data-id="${item.id}" data-type="${tab}">Equip</button>`
          : `<button class="wardrobe-item-btn buy" data-id="${item.id}" data-type="${tab}" ${!canAfford ? 'disabled style="opacity:0.5"' : ''}>🪙 ${item.cost}</button>`
      }
    `;

    const btn = card.querySelector('button');
    btn.addEventListener('click', () => {
      if (isEquipped || owned) {
        equipItem(item.id, tab);
      } else {
        if (getCoins() < item.cost) {
          showToast('Not enough coins — keep learning words!');
          return;
        }
        spendCoins(item.cost);
        ownItem(item.id);
        equipItem(item.id, tab);
        showToast(`${item.name} unlocked!`);
      }
    });

    grid.appendChild(card);
  });
}

/* ─── HISTORY SCREEN ─────────────────────────────────────────────────────────── */

function initHistory() {
  const listEl = document.getElementById('historyList');
  listEl.innerHTML = '';

  const progress = loadProgress();
  const today = new Date();

  // Build last 30 days
  const entries = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    const word = getWordForDate(d);
    const record = progress[key] || {};
    entries.push({ date: d, word, record, key });
  }

  // Filter to days with any activity (or today)
  const active = entries.filter((e, idx) => idx === 0 || e.record.spellPassed);

  if (active.length === 0) {
    listEl.innerHTML = `<div class="history-empty">No words studied yet.<br>Start with today's word!</div>`;
    return;
  }

  active.forEach(({ date, word, record }) => {
    const div = document.createElement('div');
    div.className = 'history-item';

    let status, statusClass;
    if (record.challenged) {
      status = '✓ Mastered';
      statusClass = 'mastered';
    } else if (record.sentencePassed) {
      status = '◑ Practiced';
      statusClass = 'practiced';
    } else if (record.spellPassed) {
      status = '◔ Seen';
      statusClass = 'seen';
    } else {
      status = '— Today';
      statusClass = 'seen';
    }

    const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    div.innerHTML = `
      <div class="history-word">${word.word}</div>
      <div class="history-date">${dateLabel}</div>
      <div class="history-def">${word.definition}</div>
      <div class="history-status ${statusClass}">${status}</div>
    `;
    listEl.appendChild(div);
  });
}

/* ─── PROGRESS DOTS ──────────────────────────────────────────────────────────── */

function updateProgressDots() {
  const record = getTodayRecord();
  const steps = document.querySelectorAll('.progress-step');
  if (record.spellPassed) steps[0].classList.add('done');
  if (record.quizPassed) steps[1].classList.add('done');
  if (record.sentencePassed) steps[2].classList.add('done');
  if (record.challenged) steps[3].classList.add('done');
}

/* ─── TOAST ──────────────────────────────────────────────────────────────────── */

let toastTimer;

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 2500);
}

/* ─── EVENT LISTENERS ────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  // Inject Pete mascot into all screens (also calls initIntro)
  injectAllPetes();

  // Init coins + streak display
  updateCoinDisplay();
  updateStreakDisplay();

  // Start on intro screen
  showScreen('intro');

  // Intro buttons
  document.getElementById('introKnowBtn').addEventListener('click', handleKnowIt);
  document.getElementById('introLearnBtn').addEventListener('click', handleLearnIt);

  // Input listeners — added once here to avoid stacking on re-init
  document.getElementById('spellInput').addEventListener('input', onSpellInput);
  document.getElementById('sentenceInput').addEventListener('input', onSentenceInput);

  // Wardrobe — track previous screen so back button returns correctly
  let _prevScreen = 'intro';
  document.getElementById('wardrobeBtn').addEventListener('click', () => {
    _prevScreen = document.querySelector('.screen.active')?.id?.replace('screen-', '') || 'intro';
    initWardrobe();
    showScreen('wardrobe');
  });
  document.getElementById('wardrobeBackBtn').addEventListener('click', () => {
    showScreen(_prevScreen);
    if (_prevScreen === 'today' && !state.word) initToday();
  });

  // Today → Start
  document.getElementById('startPracticeBtn').addEventListener('click', handleStartPractice);

  // Spelling
  document.getElementById('spellCheckBtn').addEventListener('click', checkSpelling);
  document.getElementById('spellRevealBtn').addEventListener('click', revealSpellWord);
  document.getElementById('spellNextBtn').addEventListener('click', () => {
    initQuiz();
    showScreen('quiz');
  });

  // Quiz
  document.getElementById('quizNextBtn').addEventListener('click', () => {
    initSentence();
    showScreen('sentence');
  });

  // Spelling: allow Enter key
  document.getElementById('spellInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const btn = document.getElementById('spellCheckBtn');
      if (!btn.disabled && !btn.classList.contains('hidden')) checkSpelling();
    }
  });

  // Sentence
  document.getElementById('sentenceSubmitBtn').addEventListener('click', submitSentence);
  document.getElementById('sentenceNextBtn').addEventListener('click', () => {
    initChallenge();
    showScreen('challenge');
  });

  // Challenge / share
  document.getElementById('shareNativeBtn').addEventListener('click', shareNative);
  document.getElementById('shareMessagesBtn').addEventListener('click', shareMessages);
  document.getElementById('shareEmailBtn').addEventListener('click', shareEmail);
  document.getElementById('shareWhatsappBtn').addEventListener('click', shareWhatsapp);
  document.getElementById('shareTwitterBtn').addEventListener('click', shareTwitter);
  document.getElementById('shareInstagramBtn').addEventListener('click', shareInstagram);
  document.getElementById('shareCopyBtn').addEventListener('click', shareCopy);
  document.getElementById('challengeDoneBtn').addEventListener('click', markChallenged);
  document.getElementById('challengeSkipBtn').addEventListener('click', () => {
    showToast('Come back tomorrow!');
    showScreen('today');
  });

  // History
  document.getElementById('historyBtn').addEventListener('click', () => {
    initHistory();
    showScreen('history');
  });
  document.getElementById('historyBackBtn').addEventListener('click', () => {
    if (state.word) showScreen('today');
    else showScreen('intro');
  });

  // Back buttons
  document.querySelectorAll('.back-btn[data-back]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dest = btn.getAttribute('data-back');
      if (dest === 'today') {
        showScreen('today');
      } else if (dest === 'spelling') {
        initSpelling();
        showScreen('spelling');
      } else if (dest === 'quiz') {
        initQuiz();
        showScreen('quiz');
      } else if (dest === 'sentence') {
        initSentence();
        showScreen('sentence');
      }
    });
  });
});
