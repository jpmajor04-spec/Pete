/* ─── PUSH NOTIFICATIONS ─────────────────────────────────────────────────────── */
async function initPushNotifications() {
  try {
    if (!window.Capacitor || !window.Capacitor.isNativePlatform()) return;
    const { PushNotifications } = window.Capacitor.Plugins;
    if (!PushNotifications) return;

    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== 'granted') return;

    await PushNotifications.register();

    PushNotifications.addListener('registration', async ({ value: token }) => {
      if (typeof fbSaveFCMToken === 'function') await fbSaveFCMToken(token);
    });

    PushNotifications.addListener('pushNotificationReceived', notification => {
      console.log('Pete: notification received', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', action => {
      const data = action.notification.data;
      if (data && data.screen) {
        const screenMap = { battle: 'battle', friends: 'friends', home: 'home' };
        const target = screenMap[data.screen];
        if (target) showScreen(target);
      }
    });
  } catch (e) { console.warn('Pete: push notifications init failed', e); }
}

/* ─── VERSION CHECK ──────────────────────────────────────────────────────────── */
const APP_VERSION = '1.2';

async function checkForUpdate() {
  try {
    const snap = await db.collection('config').doc('general').get();
    if (!snap.exists) return;
    const minVersion = snap.data().minVersion;
    if (!minVersion) return;
    const toNum = v => v.split('.').map(Number).reduce((a, b) => a * 1000 + b, 0);
    if (toNum(APP_VERSION) < toNum(minVersion)) showUpdateModal();
  } catch (e) { /* offline or no config doc — allow through */ }
}

function showUpdateModal() {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;padding:24px;';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:20px;padding:36px 28px;max-width:320px;width:100%;text-align:center;font-family:inherit;">
      <h2 style="margin:0 0 12px;font-size:22px;color:#2a1a08;">Update Available</h2>
      <p style="margin:0 0 24px;color:#666;font-size:15px;line-height:1.5;">A new version of Pete's Word Wardrobe is ready. Please update to continue.</p>
      <a href="https://apps.apple.com/app/id6745198237" style="display:block;background:#e8934a;color:#fff;text-decoration:none;padding:14px 24px;border-radius:12px;font-size:16px;font-weight:700;">Update Now</a>
    </div>`;
  document.body.appendChild(overlay);
}

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
  // ── Shirts ──────────────────────────────────────────────────────────────────
  { id: 'shirt_ocean',    type: 'shirt',     name: 'Ocean Blue',     cost: 15, key: 'ocean' },
  { id: 'shirt_sunset',   type: 'shirt',     name: 'Sunset',         cost: 15, key: 'sunset' },
  { id: 'shirt_forest',   type: 'shirt',     name: 'Forest',         cost: 15, key: 'forest' },
  { id: 'shirt_hawaiian', type: 'shirt',     name: 'Hawaiian',       cost: 20, key: 'hawaiian' },
  { id: 'shirt_preppy',   type: 'shirt',     name: 'Preppy Club',    cost: 30, key: 'preppy' },
  { id: 'shirt_midnight', type: 'shirt',     name: 'Midnight',       cost: 35, key: 'midnight' },
  { id: 'shirt_gold',     type: 'shirt',     name: 'Gold Rush',      cost: 35, key: 'gold' },
  { id: 'shirt_tuxedo',   type: 'shirt',     name: 'Black Tie',      cost: 50, key: 'tuxedo' },
  // ── Hats ────────────────────────────────────────────────────────────────────
  { id: 'hat_beanie',     type: 'hat',       name: 'Beanie',         cost: 20, key: 'beanie' },
  { id: 'hat_flatcap',    type: 'hat',       name: 'Flat Cap',       cost: 25, key: 'flatcap' },
  { id: 'hat_cowboy',     type: 'hat',       name: 'Cowboy Hat',     cost: 30, key: 'cowboy' },
  { id: 'hat_gradcap',    type: 'hat',       name: 'Graduation Cap', cost: 35, key: 'gradcap' },
  { id: 'hat_tophat',     type: 'hat',       name: 'Top Hat',        cost: 50,  key: 'tophat' },
  { id: 'hat_pirate',    type: 'hat',       name: 'Pirate Hat',     cost: 100, key: 'pirate' },
  { id: 'hat_wizard',    type: 'hat',       name: 'Wizard Hat',     cost: 120, key: 'wizard' },
  { id: 'hat_crown',     type: 'hat',       name: 'Crown',          cost: 150, key: 'crown' },
  // ── Accessories ──────────────────────────────────────────────────────────────
  { id: 'acc_bowtie',     type: 'accessory', name: 'Bow Tie',        cost: 15,  key: 'bowtie' },
  { id: 'acc_scarf',      type: 'accessory', name: 'Scarf',          cost: 15,  key: 'scarf' },
  { id: 'acc_newspaper',  type: 'accessory', name: 'Newspaper',      cost: 20,  key: 'newspaper' },
  { id: 'acc_cane',       type: 'accessory', name: 'Walking Cane',   cost: 20,  key: 'cane' },
  { id: 'acc_sunglasses', type: 'accessory', name: 'Aviators',       cost: 25,  key: 'sunglasses' },
  { id: 'acc_pocketwatch',type: 'accessory', name: 'Pocket Watch',   cost: 25,  key: 'pocketwatch' },
  { id: 'acc_cape',       type: 'accessory', name: 'Cape',           cost: 30,  key: 'cape' },
  { id: 'acc_monocle',    type: 'accessory', name: 'Monocle',        cost: 30,  key: 'monocle' },
  { id: 'acc_guitar',     type: 'accessory', name: 'Electric Guitar',cost: 40,  key: 'guitar' },
  { id: 'acc_champagne',  type: 'accessory', name: 'Champagne',      cost: 100, key: 'champagne' },
  { id: 'acc_diamond',    type: 'accessory', name: 'Diamond Aura',   cost: 150, key: 'diamond' },
];

/* ─── COINS ──────────────────────────────────────────────────────────────────── */

function confirmPurchase(itemName, cost, onConfirm) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:24px;';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:28px 24px;max-width:300px;width:100%;text-align:center;font-family:inherit;">
      <div style="font-size:17px;font-weight:700;color:#2a1a08;margin-bottom:8px;">Buy ${itemName}?</div>
      <div style="font-size:15px;color:#888;margin-bottom:24px;">This will cost you <strong style="color:#c8a010;">${cost} coins</strong>.</div>
      <div style="display:flex;gap:10px;">
        <button id="confirmPurchaseCancel" style="flex:1;padding:12px;border-radius:10px;border:1.5px solid #ddd;background:#fff;font-size:15px;cursor:pointer;">Cancel</button>
        <button id="confirmPurchaseOk" style="flex:1;padding:12px;border-radius:10px;border:none;background:#e8934a;color:#fff;font-size:15px;font-weight:700;cursor:pointer;">Buy</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#confirmPurchaseCancel').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#confirmPurchaseOk').addEventListener('click', () => { overlay.remove(); onConfirm(); });
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

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

const STREAK_MILESTONES = [
  { days: 5,   coins: 5,   label: '5-day streak' },
  { days: 10,  coins: 10,  label: '10-day streak' },
  { days: 30,  coins: 20,  label: '30-day streak' },
  { days: 100, coins: 50,  label: '100-day streak' },
  { days: 180, coins: 50,  label: '6-month streak' },
  { days: 365, coins: 100, label: '1-year streak' },
];

function getStreak() {
  try {
    return JSON.parse(localStorage.getItem('pete_streak') || '{"count":0,"lastDate":null}');
  } catch { return { count: 0, lastDate: null }; }
}

function getClaimedMilestones() {
  try { return JSON.parse(localStorage.getItem('pete_streak_milestones') || '[]'); }
  catch { return []; }
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

  // Check milestone rewards
  const claimed = getClaimedMilestones();
  STREAK_MILESTONES.forEach(m => {
    if (streak.count >= m.days && !claimed.includes(m.days)) {
      claimed.push(m.days);
      localStorage.setItem('pete_streak_milestones', JSON.stringify(claimed));
      earnCoins(m.coins);
      setTimeout(() => showToast(`${m.label}! +${m.coins} coins`), 1200);
    }
  });

  updateStreakDisplay();
}

function updateStreakDisplay() {
  const { count } = getStreak();
  document.querySelectorAll('.streak-count').forEach(el => el.textContent = count);
}

function initStreak() {
  const { count } = getStreak();
  const claimed = getClaimedMilestones();
  const wardrobe = getEquipped();

  // Pete with cheer bubble
  const peteEl = document.getElementById('peteStreakScreen');
  if (peteEl) peteEl.innerHTML = createPeteSVG(90, { wardrobe, bubble: count >= 1 ? `${count} day${count !== 1 ? 's' : ''}!` : 'Keep going!' });

  // Current count
  const countEl = document.getElementById('streakCount');
  if (countEl) countEl.textContent = count;

  // Milestone list
  const listEl = document.getElementById('streakMilestoneList');
  if (!listEl) return;
  listEl.innerHTML = STREAK_MILESTONES.map(m => {
    const done = claimed.includes(m.days);
    const active = count >= m.days;
    return `<div class="streak-milestone ${active ? 'streak-milestone-done' : ''}">
      <div class="streak-milestone-icon">${active
        ? `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" fill="#2a6e46"/><path d="M5.5 10.5L8.5 13.5L14.5 7" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
        : `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="5" y="9" width="10" height="9" rx="2" stroke="#a0907a" stroke-width="1.8" fill="none"/><path d="M7 9V6.5C7 4.6 8.3 3 10 3C11.7 3 13 4.6 13 6.5V9" stroke="#a0907a" stroke-width="1.8" stroke-linecap="round" fill="none"/><circle cx="10" cy="13.5" r="1.2" fill="#a0907a"/></svg>`
      }</div>
      <div class="streak-milestone-info">
        <span class="streak-milestone-label">${m.label}</span>
        <span class="streak-milestone-reward">+${m.coins} <svg width="14" height="14" viewBox="0 0 18 18" fill="none" style="vertical-align:middle"><circle cx="9" cy="9" r="8" fill="#c8a010" stroke="#8a6808" stroke-width="1.2"/><circle cx="9" cy="9" r="5.8" fill="#d4b828"/><path d="M9 5C10.7 5 12 6 12 7.5C12 8.5 11.3 9.2 10.2 9.5C11.4 9.8 12.2 10.6 12.2 11.8C12.2 13.3 10.9 14 9 14C7.1 14 5.8 13.3 5.8 11.8H7.2C7.2 12.4 7.9 12.8 9 12.8C10 12.8 10.7 12.4 10.7 11.7C10.7 11 10 10.6 9 10.6H8V9.4H9C9.9 9.4 10.5 9 10.5 8.3C10.5 7.6 9.8 7.2 9 7.2C8.1 7.2 7.5 7.6 7.5 8.2H6.2C6.2 6.8 7.4 5 9 5Z" fill="#8a6808"/></svg></span>
      </div>
      <div class="streak-milestone-bar-wrap">
        <div class="streak-milestone-bar" style="width:${Math.min(100, Math.round(count / m.days * 100))}%"></div>
      </div>
    </div>`;
  }).join('');
}

/* ─── WORDERS OF THE WEEK ────────────────────────────────────────────────────── */

function getFiveStarSentences() {
  try { return JSON.parse(localStorage.getItem('pete_five_stars') || '[]'); }
  catch { return []; }
}

function saveFiveStarSentence(word, sentence) {
  const entries = getFiveStarSentences();
  const dateKey = getTodayKey();
  // Avoid duplicate for same word+day
  if (!entries.find(e => e.dateKey === dateKey && e.word === word)) {
    entries.unshift({ word, sentence, dateKey, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) });
    // Keep only last 20
    localStorage.setItem('pete_five_stars', JSON.stringify(entries.slice(0, 20)));
  }
  // Also save to Firebase for global visibility
  if (typeof fbSubmitFiveStar === 'function') fbSubmitFiveStar(word, sentence);
}

function getThisWeekFiveStars() {
  const entries = getFiveStarSentences();
  const now = new Date();
  // Get entries from the last 7 days
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 7);
  return entries.filter(e => {
    const [y, m, d] = e.dateKey.split('-').map(Number);
    const entryDate = new Date(y, m - 1, d);
    return entryDate >= cutoff;
  });
}

async function initWotw() {
  const wotwEl = document.getElementById('petWotw');
  const listEl = document.getElementById('wotwList');
  const wardrobe = getWardrobeForPete();

  if (listEl) listEl.innerHTML = '<div class="wotw-empty">Loading...</div>';
  if (wotwEl) wotwEl.innerHTML = createPeteSVG(80, { bubble: 'Loading...', wardrobe });

  // Fetch from Firebase; fall back to local device entries
  let entries = null;
  if (typeof fbGetWotw === 'function') entries = await fbGetWotw();
  if (!entries) {
    entries = getFiveStarSentences().map(e => ({
      word: e.word,
      sentence: e.sentence,
      displayName: 'You',
      date: e.date
    }));
  }

  if (wotwEl) {
    const bubble = entries.length === 0 ? 'Be the first!' : 'Legends!';
    wotwEl.innerHTML = createPeteSVG(80, { bubble, wardrobe });
  }

  if (!listEl) return;

  if (entries.length === 0) {
    listEl.innerHTML = `<div class="wotw-empty">No five-star sentences yet.<br>Write something truly extraordinary to earn a place here.</div>`;
    return;
  }

  listEl.innerHTML = entries.map((e, i) => {
    const dateStr = e.date?.toDate
      ? e.date.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : (e.date || '');
    return `
    <div class="wotw-entry ${i === 0 ? 'wotw-entry-top' : ''}">
      <div class="wotw-entry-header">
        <span class="wotw-entry-word">${e.word}</span>
        <span class="wotw-entry-stars">★★★★★</span>
        <span class="wotw-entry-date">${e.displayName || 'Anonymous'} · ${dateStr}</span>
      </div>
      <div class="wotw-entry-sentence">"${e.sentence}"</div>
    </div>`;
  }).join('');
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
  if (typeof fbSaveEquipped === 'function') fbSaveEquipped(equipped);
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

/* ─── HOME SCREEN ────────────────────────────────────────────────────────────── */

const PETE_GREETINGS = [
  'Salutations!',
  'Felicitous<br>return!',
  'You persevere.<br>Magnificent.',
  'Propitious<br>timing!',
  'Ah. The<br>prodigal pupil.',
  'Perspicacious<br>of you to return.',
  'Loquacious minds<br>welcome here.',
  'Serendipitous!<br>I just arrived.',
  'Superlative<br>timing, truly.',
  'Your vocabulary<br>awaits!',
  'Ostensibly,<br>you missed me.',
  'Magnanimous of<br>you to return.',
  'Ebullient to<br>see you again!',
  'Consequential<br>day ahead.',
  'Punctilious<br>as ever, I see.',
  'Salubrious<br>greetings to you!',
  'Pulchritudinous<br>day, is it not?',
  'Your alacrity<br>is commendable.',
  'Mellifluous words<br>await within.',
  'Felicitations,<br>dear scholar.',
];

const HOME_TITLES = [
  n => `Good to see you, ${n}.`,
  n => `${n}, welcome back.`,
  n => `There you are, ${n}.`,
  n => `Ah, ${n}. Right on time.`,
  n => `${n}! A delight.`,
  n => `Ready when you are, ${n}.`,
  n => `${n}, the word awaits.`,
  n => `Welcome back, ${n}.`,
  n => `${n}. Let's do this.`,
  n => `Nice to see you, ${n}.`,
];

const HOME_SUBTITLES = [
  'What would you like to do?',
  'Your vocabulary awaits.',
  'Another word, another step.',
  'Ready for today?',
  'Knowledge is looking good on you.',
  'Let\'s keep the streak alive.',
  'Pick your path.',
];

function initHome() {
  const wardrobe = getWardrobeForPete();
  const peteEl = document.getElementById('peteHome');
  const greeting = PETE_GREETINGS[Math.floor(Math.random() * PETE_GREETINGS.length)];
  if (peteEl) peteEl.innerHTML = createPeteSVG(70, { wardrobe, bubble: greeting });

  const nickname = localStorage.getItem('pete_nickname');
  const titleEl    = document.getElementById('homeTitle');
  const subtitleEl = document.getElementById('homeSubtitle');
  if (titleEl) {
    if (nickname) {
      const fn = HOME_TITLES[Math.floor(Math.random() * HOME_TITLES.length)];
      titleEl.textContent = fn(nickname);
    } else {
      titleEl.textContent = 'Good to see you.';
    }
  }
  if (subtitleEl) {
    subtitleEl.textContent = HOME_SUBTITLES[Math.floor(Math.random() * HOME_SUBTITLES.length)];
  }

  // Quick action grid
  const wotwBlock = document.getElementById('homeWotwBlock');
  if (!wotwBlock) return;
  const weekEntries = getThisWeekFiveStars();
  const countBadge = weekEntries.length > 0 ? `<span class="home-quick-badge">${weekEntries.length}</span>` : '';
  wotwBlock.innerHTML = `
    <div class="home-quick-grid">
      <button class="home-quick-btn" id="homeWotwBtn">
        <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M7 3H13V11C13 13.2 11.6 15 10 15C8.4 15 7 13.2 7 11V3Z" fill="#c8a010"/><path d="M7 5H4C4 8 5.5 9.5 7 10" stroke="#c8a010" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M13 5H16C16 8 14.5 9.5 13 10" stroke="#c8a010" stroke-width="2.2" fill="none" stroke-linecap="round"/><rect x="8.5" y="15" width="3" height="2.5" fill="#c8a010"/><rect x="6" y="17" width="8" height="1.5" rx="0.75" fill="#8a6010"/></svg>
        <span>Worders${countBadge}</span>
      </button>
      <button class="home-quick-btn" id="homeLeaderboardBtn">
        <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><rect x="1" y="11" width="5" height="7" rx="1" fill="#7b6a55"/><rect x="7.5" y="6" width="5" height="12" rx="1" fill="#b84c2a"/><rect x="14" y="2" width="5" height="16" rx="1" fill="#c8a010"/></svg>
        <span>Leaderboard</span>
      </button>
      <button class="home-quick-btn" id="homeBattleBtn">
        <svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M3 3L9 9M9 9L3 15M9 9L17 3M9 9L17 17" stroke="#c8a010" stroke-width="2.2" stroke-linecap="round"/></svg>
        <span>⚔ Battle</span>
      </button>
    </div>`;
  document.getElementById('homeWotwBtn').addEventListener('click', () => {
    initWotw();
    showScreen('wotw');
  });
  document.getElementById('homeLeaderboardBtn').addEventListener('click', () => {
    initLeaderboard();
    showScreen('leaderboard');
  });
  document.getElementById('homeBattleBtn').addEventListener('click', () => {
    _bhTab = 'friends';
    initBattleHub();
    showScreen('battlehub');
  });
  document.getElementById('homeFreePlayBtn').addEventListener('click', () => {
    startFreePlay();
  });
  document.getElementById('houseNavBtn').addEventListener('click', () => {
    initHouse();
    showScreen('house');
  });
}

/* ─── MASTERED SCREEN ────────────────────────────────────────────────────────── */

function showMastered(word, coinsEarned) {
  const quote = MASTERED_QUOTES[Math.floor(Math.random() * MASTERED_QUOTES.length)];
  const wardrobe = getWardrobeForPete();

  const peteEl = document.getElementById('peteMastered');
  if (peteEl) peteEl.innerHTML = createPeteSVG(110, { wardrobe, bubble: 'Bravo!' });

  const quoteEl = document.getElementById('masteredQuote');
  if (quoteEl) quoteEl.textContent = quote;

  const wordEl = document.getElementById('masteredWord');
  if (wordEl) wordEl.textContent = word;

  const coinsEl = document.getElementById('masteredCoins');
  if (coinsEl) coinsEl.innerHTML = coinsEarned > 0 ? `+${coinsEarned} <svg width="20" height="20" viewBox="0 0 18 18" fill="none" style="vertical-align:middle"><circle cx="9" cy="9" r="8" fill="#c8a010" stroke="#8a6808" stroke-width="1.2"/><circle cx="9" cy="9" r="5.8" fill="#d4b828"/><path d="M9 5C10.7 5 12 6 12 7.5C12 8.5 11.3 9.2 10.2 9.5C11.4 9.8 12.2 10.6 12.2 11.8C12.2 13.3 10.9 14 9 14C7.1 14 5.8 13.3 5.8 11.8H7.2C7.2 12.4 7.9 12.8 9 12.8C10 12.8 10.7 12.4 10.7 11.7C10.7 11 10 10.6 9 10.6H8V9.4H9C9.9 9.4 10.5 9 10.5 8.3C10.5 7.6 9.8 7.2 9 7.2C8.1 7.2 7.5 7.6 7.5 8.2H6.2C6.2 6.8 7.4 5 9 5Z" fill="#8a6808"/></svg>` : '';

  showScreen('mastered');
}

/* ─── PRACTICE SCREEN ────────────────────────────────────────────────────────── */

function initPractice() {
  const listEl = document.getElementById('practiceList');
  if (!listEl) return;
  listEl.innerHTML = '';

  const progress = loadProgress();
  const today = new Date();
  const entries = [];

  // Collect last 7 days including today
  for (let i = 0; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    const record = progress[key] || {};
    if (record.seen || record.spellPassed || record.challenged) {
      // Only include if the word name is stored — avoids showing unlearned words from offset drift
      const word = record.word ? WORDS.find(w => w.word === record.word) : null;
      if (word) entries.push({ date: d, word, record, key });
    }
  }

  if (entries.length === 0) {
    listEl.innerHTML = `<div class="practice-empty">
      <p>No words from this week yet.</p>
      <p>Complete today's word of the day to start building your practice list.</p>
    </div>`;
    return;
  }

  // Revise All button
  const reviseAllBtn = document.createElement('button');
  reviseAllBtn.className = 'practice-revise-all-btn';
  reviseAllBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12A7 7 0 0 1 19 9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M19 12A7 7 0 0 1 5 15" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M17.5 5.5 L19 9 L22.5 8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 18.5 L5 15 L1.5 16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg> Revise All (${entries.length} words)`;
  reviseAllBtn.addEventListener('click', () => startRevision(entries.map(e => e.word), 'practice'));
  listEl.appendChild(reviseAllBtn);

  entries.forEach(({ date, word, record }) => {
    const dateLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const mastered = record.challenged;
    const userSentence = record.userSentence || '';

    const card = document.createElement('div');
    card.className = 'practice-card';
    card.tabIndex = 0;
    card.innerHTML = `
      <div class="practice-card-header">
        <div>
          <div class="practice-card-word">${word.word}</div>
          <div class="practice-card-pos">${word.partOfSpeech} · ${dateLabel}</div>
        </div>
        <div class="practice-card-status ${mastered ? 'mastered' : 'seen'}">${mastered ? '✓ Mastered' : '◑ Practiced'}</div>
      </div>
      <div class="practice-card-body hidden">
        <p class="practice-card-def">${word.definition}</p>
        ${word.pronunciation ? `<p class="practice-card-pron">${word.pronunciation}</p>` : ''}
        <p class="practice-card-example">"${word.example}"</p>
        ${userSentence ? `<div class="practice-card-yoursentence"><span>Your sentence:</span> "${userSentence}"</div>` : ''}
        <button class="practice-revise-btn">Revise this word →</button>
      </div>`;

    // Toggle expand on header click
    card.querySelector('.practice-card-header').addEventListener('click', () => {
      const body = card.querySelector('.practice-card-body');
      body.classList.toggle('hidden');
      card.classList.toggle('expanded');
    });

    // Revise single word
    card.querySelector('.practice-revise-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      startRevision([word], 'practice');
    });

    listEl.appendChild(card);
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
  if (peteEl) {
    const wardrobe = getWardrobeForPete();
    peteEl.innerHTML = createPeteSVG(80, { bubble: 'Do you<br>know me?', wardrobe });
  }
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
  // Capture word BEFORE changing offset so we can store the actual word studied
  const chosenWord = getIntroWord();

  // Commit the current intro offset as the persistent word offset
  const baseOffset = parseInt(localStorage.getItem('wordsmith_offset') || '0', 10);
  const newOffset = (baseOffset + state.introOffset) % WORDS.length;
  localStorage.setItem('wordsmith_offset', newOffset);
  state.introOffset = 0;

  // Mark as seen — store word name so practice/history shows correct word if offset later changes
  saveProgress({ seen: true, word: chosenWord.word });

  // Load the today screen for the chosen word
  initToday();
  showScreen('today');
}

/* ─── PETE INJECTION ─────────────────────────────────────────────────────────── */

function injectAllPetes() {
  const wd = getWardrobeForPete();

  injectPete('peteNav', 32, { wardrobe: wd });
  injectPete('peteHome', 90, { wardrobe: wd });

  const el = document.getElementById('peteToday');
  if (el) el.innerHTML = createPeteSVG(90, { bubble: 'A new word<br>for you!', wardrobe: wd });

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

/* ─── MASTERED QUOTES (Pete says something witty) ───────────────────────────── */

const MASTERED_QUOTES = [
  "Magnificent. I shall notify the Oxford English Dictionary at once.",
  "You've done it. Pete is beside himself. And he doesn't fit easily beside things.",
  "I knew you had it in you. Well, I hoped. The bar wasn't high, but you cleared it beautifully.",
  "Bravo! The word is safe in your hands. Probably.",
  "Pete sheds a single, dignified tear. It's a good tear.",
  "You may now deploy this word at dinner parties without fear of embarrassment.",
  "I'm not crying. You're crying. Actually, we're both crying.",
  "You have brought honour upon this vocabulary. Pete bows deeply.",
  "The word community will hear of this. They'll be delighted.",
  "Pete awards you full marks and considers naming a word after you.",
  "Outstanding. You've made a grown man in sandals very emotional.",
  "That's it. That's the whole thing. You've cracked it. Well done you.",
];

/* ─── SENTENCE EVALUATION ────────────────────────────────────────────────────── */

const EVAL_LEVELS = [
  { label: 'Give it another go!', coinBonus: 0, comments: [
    'Try a longer sentence with a bit more context.',
    'Add some detail — what happened, and why did it matter?',
    'Pete squints. He\'s seen better. Try once more!',
    'A word deserves a proper sentence. Give it another go.',
  ]},
  { label: 'Getting there!', coinBonus: 1, comments: [
    'Solid start — try adding some personal context.',
    'Good bones. Now put a bit more colour around it.',
    'Pete nods cautiously. You\'re on the right track.',
    'Nearly there — who was involved, and how did it feel?',
  ]},
  { label: 'Good work!', coinBonus: 2, comments: [
    'Pete nods approvingly from across the pew.',
    'That\'ll do nicely. A respectable use of the word.',
    'The word is in good hands here. Well done.',
    'Pete raises an eyebrow — the good kind.',
  ]},
  { label: 'Nicely done!', coinBonus: 4, comments: [
    'That word is in good hands. Well crafted.',
    'Pete adjusts his glasses approvingly.',
    'Now that\'s how you use a word properly.',
    'This sentence has character. Pete is impressed.',
  ]},
  { label: 'FIVE STARS!', coinBonus: 10, comments: [
    'Pete stands up and removes his glasses. He needs a moment.',
    'This sentence should be framed. Possibly bronzed.',
    'Pete weeps openly. This is the finest use of language he has witnessed.',
    'Extraordinary. You didn\'t just use the word — you gave it a home.',
    'The word itself is grateful. Pete is in awe. This is exceptional.',
  ]},
];

function evaluateSentence(sentence, word) {
  const words = sentence.trim().split(/\s+/).filter(Boolean);
  const len = words.length;

  const personal = /\b(i|my|me|we|our|he|she|her|his|they|their|you|your)\b/i.test(sentence);

  const basicComplex = /[,;:]/.test(sentence) ||
    /\b(because|although|despite|however|whereas|while|since|though|even though|as a result|which|who)\b/i.test(sentence);

  // 5-star requires these additional checks
  const advancedPunct = /[;:]/.test(sentence) || (sentence.match(/,/g) || []).length >= 2;
  const richConnectives = /\b(although|despite|whereas|however|nevertheless|notwithstanding|consequently|furthermore|moreover|insofar|inasmuch|hitherto|thereupon)\b/i.test(sentence);

  let score = 1;
  if (len >= 8) score = 2;
  if (len >= 12 && (personal || basicComplex)) score = 3;
  if (len >= 16 && personal && basicComplex) score = 4;
  // 5 stars: genuinely exceptional — long, personal, complex, advanced punctuation, rich connectives
  if (len >= 22 && personal && basicComplex && advancedPunct && richConnectives) score = 5;

  score = Math.min(5, Math.max(1, score));
  const level = EVAL_LEVELS[score - 1];
  const comment = level.comments[Math.floor(Math.random() * level.comments.length)];

  return { score, label: level.label, comment, coinBonus: level.coinBonus };
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
  const peteBubble = result.score >= 4 ? 'Bravo!' : result.score >= 3 ? 'Nice!' : 'Try more!';
  if (peteEl) peteEl.innerHTML = createPeteSVG(60, { bubble: peteBubble, wardrobe: getWardrobeForPete() });

  // Award coins for this sentence
  if (result.coinBonus > 0) {
    earnCoins(result.coinBonus);
    const bonusEl = document.createElement('div');
    bonusEl.className = 'eval-coin-bonus';
    bonusEl.innerHTML = `+${result.coinBonus} <svg width="14" height="14" viewBox="0 0 18 18" fill="none" style="vertical-align:middle"><circle cx="9" cy="9" r="8" fill="#c8a010" stroke="#8a6808" stroke-width="1.2"/><circle cx="9" cy="9" r="5.8" fill="#d4b828"/><path d="M9 5C10.7 5 12 6 12 7.5C12 8.5 11.3 9.2 10.2 9.5C11.4 9.8 12.2 10.6 12.2 11.8C12.2 13.3 10.9 14 9 14C7.1 14 5.8 13.3 5.8 11.8H7.2C7.2 12.4 7.9 12.8 9 12.8C10 12.8 10.7 12.4 10.7 11.7C10.7 11 10 10.6 9 10.6H8V9.4H9C9.9 9.4 10.5 9 10.5 8.3C10.5 7.6 9.8 7.2 9 7.2C8.1 7.2 7.5 7.6 7.5 8.2H6.2C6.2 6.8 7.4 5 9 5Z" fill="#8a6808"/></svg>`;
    commentEl.after(bonusEl);
  }

  // Submit stars to leaderboard for any sentence
  if (state.word && typeof fbSubmitSentenceStars === 'function') {
    fbSubmitSentenceStars(state.word.word, state.userSentence, result.score);
  }
  // 5-star: record for Worders of the Week locally too
  if (result.score === 5 && state.word) {
    saveFiveStarSentence(state.word.word, state.userSentence);
    setTimeout(() => showToast('Five stars! You\'re a Worder of the Week!'), 600);
  }

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
  document.getElementById('quizDefinitionReminder').textContent = '';
  document.getElementById('quizDefinitionReminder').classList.add('hidden');

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

  let coinsEarned = 0;
  if (!wasAlreadyChallenged) {
    coinsEarned = 5;
    earnCoins(5);
    updateStreak();
    // Sync progress to Firebase
    if (typeof fbSyncUser === 'function') {
      fbSyncUser(getStreak().count);
    }
  }

  const btn = document.getElementById('startPracticeBtn');
  if (btn) { btn.textContent = '✓ Completed today'; btn.disabled = true; }

  // Navigate to full-screen mastered celebration
  showMastered(state.word.word, coinsEarned);
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
          : `<button class="wardrobe-item-btn buy" data-id="${item.id}" data-type="${tab}" ${!canAfford ? 'disabled style="opacity:0.5"' : ''}><svg width="13" height="13" viewBox="0 0 18 18" fill="none" style="vertical-align:middle;margin-right:2px"><circle cx="9" cy="9" r="8" fill="#c8a010" stroke="#8a6808" stroke-width="1.2"/><circle cx="9" cy="9" r="5.8" fill="#d4b828"/><path d="M9 5C10.7 5 12 6 12 7.5C12 8.5 11.3 9.2 10.2 9.5C11.4 9.8 12.2 10.6 12.2 11.8C12.2 13.3 10.9 14 9 14C7.1 14 5.8 13.3 5.8 11.8H7.2C7.2 12.4 7.9 12.8 9 12.8C10 12.8 10.7 12.4 10.7 11.7C10.7 11 10 10.6 9 10.6H8V9.4H9C9.9 9.4 10.5 9 10.5 8.3C10.5 7.6 9.8 7.2 9 7.2C8.1 7.2 7.5 7.6 7.5 8.2H6.2C6.2 6.8 7.4 5 9 5Z" fill="#8a6808"/></svg> ${item.cost}</button>`
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
        confirmPurchase(item.name, item.cost, () => {
          spendCoins(item.cost);
          ownItem(item.id);
          equipItem(item.id, tab);
          showToast(`${item.name} unlocked!`);
        });
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
    const record = progress[key] || {};
    const word = (record.word ? WORDS.find(w => w.word === record.word) : null) || getWordForDate(d);
    entries.push({ date: d, word, record, key });
  }

  // Filter to days with any activity
  const active = entries.filter(e => e.record.seen || e.record.spellPassed || e.record.challenged);

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
      status = '◔ In progress';
      statusClass = 'seen';
    } else if (record.seen) {
      status = '— Reading';
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

/* ─── REVISION ENGINE ────────────────────────────────────────────────────────── */

const revState = {
  questions: [],
  idx: 0,
  score: 0,
  answered: false,
  sourceScreen: 'practice',
  freePlay: false,
};

function getDistractors(targetWord, count = 3) {
  return getShuffledWords()
    .filter(w => w.word !== targetWord)
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}

function generateRevisionQuestions(words) {
  const questions = [];

  words.forEach(word => {
    const d = getDistractors(word.word);

    // Always include spell + one other random type
    const extras = ['word-to-def', 'def-to-word'];
    if (QUIZ[word.word]) extras.push('usage');
    const extraType = extras[Math.floor(Math.random() * extras.length)];

    // Spell question
    questions.push({ type: 'spell', word: word.word, definition: word.definition, partOfSpeech: word.partOfSpeech });

    // Second question
    if (extraType === 'word-to-def') {
      const sp = [word, ...d].sort(() => Math.random() - 0.5);
      questions.push({
        type: 'word-to-def',
        word: word.word,
        prompt: `What does "${word.word}" mean?`,
        options: sp.map(w => w.definition),
        correct: sp.findIndex(w => w.word === word.word),
      });
    } else if (extraType === 'def-to-word') {
      const sp = [word, ...d].sort(() => Math.random() - 0.5);
      questions.push({
        type: 'def-to-word',
        word: word.word,
        prompt: word.definition,
        options: sp.map(w => w.word),
        correct: sp.findIndex(w => w.word === word.word),
      });
    } else if (extraType === 'usage' && QUIZ[word.word]) {
      const q = QUIZ[word.word];
      questions.push({
        type: 'usage',
        word: word.word,
        prompt: `Which sentence uses "${word.word}" correctly?`,
        options: q.sentences,
        correct: q.correct,
        explanation: q.explanation,
      });
    }
  });

  return questions.sort(() => Math.random() - 0.5);
}

function startRevision(wordObjects, sourceScreen = 'practice', freePlay = false) {
  revState.questions = generateRevisionQuestions(wordObjects);
  revState.idx = 0;
  revState.score = 0;
  revState.answered = false;
  revState.sourceScreen = sourceScreen;
  revState.freePlay = freePlay;
  showScreen('revision');
  renderRevisionQuestion();
}

function startFreePlay() {
  const shuffled = [...WORDS].sort(() => Math.random() - 0.5).slice(0, 20);
  startRevision(shuffled, 'home', true);
}

function renderRevisionQuestion() {
  const q = revState.questions[revState.idx];
  const total = revState.questions.length;
  const pct = (revState.idx / total) * 100;

  document.getElementById('revisionProgressFill').style.width = pct + '%';
  document.getElementById('revisionCount').textContent = `${revState.idx + 1} / ${total}`;
  document.getElementById('revisionScore').textContent = revState.score;
  revState.answered = false;

  const body = document.getElementById('revisionBody');

  if (q.type === 'spell') {
    body.innerHTML = `
      <div class="revision-card">
        <div class="revision-type-badge">Spell it</div>
        <div class="revision-prompt">${q.definition}</div>
        <div class="revision-pos">${q.partOfSpeech}</div>
        <input class="revision-spell-input" id="revSpellInput" type="text"
          placeholder="Type the word…" autocomplete="off" autocorrect="off"
          autocapitalize="off" spellcheck="false"/>
        <div class="revision-feedback hidden" id="revFeedback"></div>
        <button class="btn btn-primary" id="revSpellSubmit">Check</button>
        <button class="btn btn-ghost btn-next hidden" id="revNextBtn">Next →</button>
      </div>`;
    const input = document.getElementById('revSpellInput');
    const submitBtn = document.getElementById('revSpellSubmit');
    input.addEventListener('input', () => { submitBtn.disabled = input.value.trim().length === 0; });
    input.addEventListener('keydown', e => { if (e.key === 'Enter' && !submitBtn.disabled) checkRevisionSpell(q); });
    submitBtn.disabled = true;
    submitBtn.addEventListener('click', () => checkRevisionSpell(q));
    document.getElementById('revNextBtn').addEventListener('click', advanceRevision);
    setTimeout(() => input.focus(), 100);

  } else {
    // Multi-choice question
    const typeLabel = q.type === 'word-to-def' ? 'Pick the definition'
      : q.type === 'def-to-word' ? 'Pick the word'
      : 'Pick the correct usage';

    body.innerHTML = `
      <div class="revision-card">
        <div class="revision-type-badge">${typeLabel}</div>
        <div class="revision-prompt">${q.prompt}</div>
        <div class="revision-options" id="revOptions"></div>
        <div class="revision-explanation hidden" id="revExplanation"></div>
        <button class="btn btn-ghost btn-next hidden" id="revNextBtn">Next →</button>
      </div>`;

    const labels = ['A', 'B', 'C', 'D'];
    const optionsEl = document.getElementById('revOptions');
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'revision-option';
      btn.innerHTML = `<span class="revision-option-letter">${labels[i]}</span><span class="revision-option-text">${opt}</span>`;
      btn.addEventListener('click', () => handleRevisionChoice(q, i));
      optionsEl.appendChild(btn);
    });
    document.getElementById('revNextBtn').addEventListener('click', advanceRevision);
  }
}

function checkRevisionSpell(q) {
  if (revState.answered) return;
  revState.answered = true;

  const input = document.getElementById('revSpellInput');
  const feedback = document.getElementById('revFeedback');
  const submitBtn = document.getElementById('revSpellSubmit');
  const nextBtn = document.getElementById('revNextBtn');

  const typed = input.value.trim().toLowerCase();
  const correct = typed === q.word.toLowerCase();

  if (correct) {
    input.classList.add('rev-correct');
    feedback.textContent = 'Correct!';
    feedback.className = 'revision-feedback rev-success';
    revState.score++;
    document.getElementById('revisionScore').textContent = revState.score;
  } else {
    input.classList.add('rev-incorrect');
    feedback.innerHTML = `Not quite — the answer is <strong>${q.word}</strong>`;
    feedback.className = 'revision-feedback rev-error';
  }
  feedback.classList.remove('hidden');
  submitBtn.classList.add('hidden');
  nextBtn.classList.remove('hidden');
  input.disabled = true;
}

function handleRevisionChoice(q, selectedIdx) {
  if (revState.answered) return;
  revState.answered = true;

  const correct = selectedIdx === q.correct;
  const optionBtns = document.querySelectorAll('.revision-option');
  const nextBtn = document.getElementById('revNextBtn');
  const explEl = document.getElementById('revExplanation');

  optionBtns.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correct) btn.classList.add('rev-correct');
    else if (i === selectedIdx && !correct) btn.classList.add('rev-incorrect');
    else btn.classList.add('rev-dimmed');
  });

  if (correct) {
    revState.score++;
    document.getElementById('revisionScore').textContent = revState.score;
  }

  if (q.explanation) {
    explEl.textContent = q.explanation;
    explEl.classList.remove('hidden');
  }

  nextBtn.classList.remove('hidden');
}

function advanceRevision() {
  revState.idx++;
  if (revState.idx >= revState.questions.length) {
    showRevisionResults();
  } else {
    renderRevisionQuestion();
  }
}

function showRevisionResults() {
  const total = revState.questions.length;
  const score = revState.score;
  const pct = Math.round((score / total) * 100);
  const wardrobe = getWardrobeForPete();

  const bubble = pct === 100 ? 'Impeccable!' : pct >= 70 ? 'Well done!' : 'Keep at it!';
  const label = pct === 100 ? 'Flawless!' : pct >= 80 ? 'Excellent!' : pct >= 60 ? 'Good work!' : 'Keep practising!';

  document.getElementById('revisionProgressFill').style.width = '100%';
  document.getElementById('revisionCount').textContent = 'Done!';

  document.getElementById('revisionBody').innerHTML = `
    <div class="revision-results">
      <div id="peteRevResults"></div>
      <div class="revision-results-label">${label}</div>
      <div class="revision-results-score">
        <span class="revision-results-num">${score}</span>
        <span class="revision-results-denom">/ ${total}</span>
      </div>
      <div class="revision-results-pct">${pct}% correct</div>
      ${revState.freePlay
        ? `<button class="btn btn-primary" id="revDoneBtn">Play Again</button>
           <button class="btn btn-secondary" id="revHomeBtn" style="margin-top:8px">Back to Home</button>`
        : `<button class="btn btn-primary" id="revDoneBtn">Back to Practice</button>`}
    </div>`;

  const peteEl = document.getElementById('peteRevResults');
  if (peteEl) peteEl.innerHTML = createPeteSVG(90, { wardrobe, bubble });

  document.getElementById('revDoneBtn').addEventListener('click', () => {
    if (revState.freePlay) { startFreePlay(); return; }
    initPractice();
    showScreen(revState.sourceScreen);
  });
  const homeBtn = document.getElementById('revHomeBtn');
  if (homeBtn) homeBtn.addEventListener('click', () => { initHome(); showScreen('home'); });
}

/* ─── BATTLE ─────────────────────────────────────────────────────────────────── */

function pickBattleWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function scoreBattleSentence(sentence, word) {
  if (!sentence || !sentence.trim()) return 0;
  if (!sentence.toLowerCase().includes(word.toLowerCase())) return 0;
  const { score } = evaluateSentence(sentence, word);
  return score * 20; // 1–5 stars → 20–100
}

const battleState = {
  battleId: null,
  role: null,
  word: null,
  wordDefinition: '',
  opponentName: '',
  timerInterval: null,
  timeLeft: 30,
};

function startBattle(battleId, role, wordData, opponentName) {
  battleState.battleId = battleId;
  battleState.role = role;
  battleState.word = wordData.word;
  battleState.wordDefinition = wordData.definition || wordData.wordDefinition || '';
  battleState.opponentName = opponentName;
  document.getElementById('battleVsLabel').textContent = `vs. ${opponentName}`;
  document.getElementById('battleProgressFill').style.width = '0%';
  document.getElementById('battleCount').textContent = '90s';
  showScreen('battle');
  renderBattleChallenge();
}

function renderBattleChallenge() {
  const { word, wordDefinition, opponentName } = battleState;
  battleState.timeLeft = 90;

  const body = document.getElementById('battleBody');
  body.innerHTML = `
    <div class="battle-card">
      <div class="battle-vs-row">
        <div class="battle-vs-you">You</div>
        <div class="battle-vs-divider">vs</div>
        <div class="battle-vs-opp">${battleState.opponentName}</div>
      </div>
      <div class="battle-word-section">
        <div class="battle-word-label">Write a sentence using:</div>
        <div class="battle-word">${word}</div>
        <div class="battle-definition">${wordDefinition}</div>
      </div>
      <div class="battle-timer-wrap">
        <svg class="battle-timer-ring" viewBox="0 0 44 44" width="64" height="64">
          <circle cx="22" cy="22" r="18" fill="none" stroke="#e8ddd0" stroke-width="4"/>
          <circle cx="22" cy="22" r="18" fill="none" stroke="#e8934a" stroke-width="4"
            stroke-dasharray="113" stroke-dashoffset="0" id="battleTimerRing"
            stroke-linecap="round" transform="rotate(-90 22 22)"/>
        </svg>
        <div class="battle-timer-num" id="battleTimer">90</div>
      </div>
      <textarea class="battle-sentence-input" id="battleSentenceInput"
        placeholder="Use '${word}' in your sentence…"
        rows="3" spellcheck="true" autocorrect="on"></textarea>
      <div class="battle-char-count" id="battleCharCount">0 / 10 words minimum</div>
      <button class="btn btn-primary battle-submit-btn" id="battleSubmitBtn" disabled>Submit</button>
    </div>`;

  const input  = document.getElementById('battleSentenceInput');
  const submitBtn = document.getElementById('battleSubmitBtn');
  const charCount = document.getElementById('battleCharCount');

  input.addEventListener('input', () => {
    const words = input.value.trim().split(/\s+/).filter(Boolean).length;
    charCount.textContent = `${words} word${words !== 1 ? 's' : ''}`;
    submitBtn.disabled = input.value.trim().length < 5;
  });
  submitBtn.addEventListener('click', () => submitBattleSentence(input.value.trim()));

  // Countdown timer
  clearInterval(battleState.timerInterval);
  battleState.timerInterval = setInterval(() => {
    battleState.timeLeft--;
    const timerEl = document.getElementById('battleTimer');
    const ring    = document.getElementById('battleTimerRing');
    const fill    = document.getElementById('battleProgressFill');
    if (timerEl) timerEl.textContent = battleState.timeLeft;
    if (ring) {
      const offset = 113 - (113 * (battleState.timeLeft / 90));
      ring.setAttribute('stroke-dashoffset', offset);
      if (battleState.timeLeft <= 15) ring.setAttribute('stroke', '#c83020');
    }
    if (fill) fill.style.width = `${((90 - battleState.timeLeft) / 90) * 100}%`;
    if (timerEl && battleState.timeLeft <= 15) timerEl.classList.add('battle-timer-urgent');
    if (battleState.timeLeft <= 0) {
      clearInterval(battleState.timerInterval);
      submitBattleSentence(input ? input.value.trim() : '');
    }
  }, 1000);

  input.focus();
}

async function submitBattleSentence(sentence) {
  clearInterval(battleState.timerInterval);
  const { battleId, role, word, opponentName } = battleState;
  const score = scoreBattleSentence(sentence, word);

  document.getElementById('battleBody').innerHTML = `
    <div class="battle-waiting">
      <div class="battle-score-big">${score}<span>/100</span></div>
      <div class="battle-waiting-label">Your score</div>
      <div class="battle-waiting-sentence">"${sentence || '(no sentence)'}"</div>
      <div class="battle-waiting-sub">Saving…</div>
    </div>`;

  await fbSubmitBattleScore(battleId, score, sentence, role);
  const battle = await fbGetBattle(battleId);
  if (!battle) return;

  const theirScore    = role === 'creator' ? battle.opponentScore    : battle.creatorScore;
  const theirSentence = role === 'creator' ? battle.opponentSentence : battle.creatorSentence;

  if (theirScore !== null && theirScore !== undefined) {
    showBattleResults(score, sentence, theirScore, theirSentence, opponentName, word);
  } else {
    document.getElementById('battleBody').innerHTML = `
      <div class="battle-waiting">
        <div class="battle-score-big">${score}<span>/100</span></div>
        <div class="battle-waiting-label">Your score</div>
        <div class="battle-waiting-sentence">"${sentence || '(no sentence)'}"</div>
        <div class="battle-waiting-sub">${opponentName} hasn't answered yet — check back later!</div>
        <button class="btn btn-ghost" id="battleDoneWaitBtn">Back to Home</button>
      </div>`;
    document.getElementById('battleDoneWaitBtn').addEventListener('click', () => { initHome(); showScreen('home'); });
  }
}

function showBattleResults(myScore, mySentence, theirScore, theirSentence, opponentName, word) {
  const won = myScore > theirScore;
  const tied = myScore === theirScore;
  const label = tied ? "It's a tie!" : won ? 'You won! ⚔' : `${opponentName} wins`;
  document.getElementById('battleProgressFill').style.width = '100%';
  document.getElementById('battleCount').textContent = 'Done!';
  document.getElementById('battleBody').innerHTML = `
    <div class="battle-results">
      <div class="battle-results-label">${label}</div>
      <div class="battle-results-word">Word: <strong>${word}</strong></div>
      <div class="battle-results-scores">
        <div class="battle-score-block ${won || tied ? 'battle-score-winner' : ''}">
          <div class="battle-score-name">You</div>
          <div class="battle-score-num">${myScore}</div>
          <div class="battle-score-sentence">"${mySentence || '(no sentence)'}"</div>
        </div>
        <div class="battle-score-divider">vs</div>
        <div class="battle-score-block ${!won && !tied ? 'battle-score-winner' : ''}">
          <div class="battle-score-name">${opponentName}</div>
          <div class="battle-score-num">${theirScore}</div>
          <div class="battle-score-sentence">"${theirSentence || '(no sentence)'}"</div>
        </div>
      </div>
      <button class="btn btn-primary" id="battleFinishBtn">Back to Home</button>
    </div>`;
  document.getElementById('battleFinishBtn').addEventListener('click', () => { initHome(); showScreen('home'); });
  // Track win
  if (won && typeof fbRecordBattleWin === 'function') fbRecordBattleWin();
}

/* ─── BATTLE HUB SCREEN ──────────────────────────────────────────────────────── */

let _bhTab = 'friends';

async function initBattleHub() {
  const body = document.getElementById('battlehubBody');
  if (!body) return;
  body.innerHTML = '<div class="battlehub-loading">Loading…</div>';

  document.querySelectorAll('.battlehub-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.bhtab === _bhTab);
    t.onclick = () => { _bhTab = t.dataset.bhtab; initBattleHub(); };
  });

  if (_bhTab === 'friends') {
    // Reuse friends leaderboard data
    let data = _lbData;
    if (!data) {
      const [lb, pending] = await Promise.all([fbGetFriendsLeaderboard(), fbGetPendingBattles()]);
      data = { ...lb, pendingBattles: pending, friendsStreak: lb.streak };
      _lbData = data;
    }

    const myId = localStorage.getItem('pete_uid') || (typeof fbUser !== 'undefined' && fbUser ? fbUser.uid : null);
    const pending = data.pendingBattles || [];
    const entries = (data.friendsStreak || data.streak || []).filter(e => e.id !== myId);

    let html = '';

    pending.forEach(b => {
      html += `<div class="battlehub-challenge">
        <div>
          <div class="battlehub-challenge-from">⚔ Challenge from</div>
          <div class="battlehub-challenge-name">${b.creatorName || 'Someone'}</div>
        </div>
        <button class="battlehub-answer-btn" data-battle-id="${b.id}" data-opponent="${b.creatorName || 'Someone'}">Answer →</button>
      </div>`;
    });

    if (entries.length === 0 && pending.length === 0) {
      html += '<div class="battlehub-empty">Add friends to challenge them to battles!</div>';
    }

    entries.forEach(e => {
      const lastActiveMs = e.lastActive && e.lastActive.toMillis ? e.lastActive.toMillis() : 0;
      const isOnline = Date.now() - lastActiveMs < 5 * 60 * 1000;
      const wardrobe = e.equipped || {};
      const avatar = typeof miniPeteIcon === 'function' ? miniPeteIcon(wardrobe, 32) : '';
      const onlineDot = `<span class="online-dot ${isOnline ? 'online-dot-active' : ''}"></span>`;
      html += `<div class="battlehub-friend-row">
        <div class="battlehub-friend-avatar" style="position:relative">${avatar}${onlineDot}</div>
        <div class="battlehub-friend-name">${e.displayName || 'Anonymous'}</div>
        <button class="battlehub-battle-btn ${isOnline ? '' : 'battlehub-battle-btn-offline'}"
          data-friend-id="${e.id}" data-friend-name="${e.displayName || 'Anonymous'}"
          data-is-online="${isOnline}" ${isOnline ? '' : 'disabled'}>
          ${isOnline ? '⚔ Battle' : 'Offline'}
        </button>
      </div>`;
    });

    body.innerHTML = html;

    body.querySelectorAll('.battlehub-answer-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const battle = await fbGetBattle(btn.dataset.battleId);
        if (battle) startBattle(btn.dataset.battleId, 'opponent', { word: battle.word, wordDefinition: battle.wordDefinition }, btn.dataset.opponent);
      });
    });

    body.querySelectorAll('.battlehub-battle-btn:not([disabled])').forEach(btn => {
      btn.addEventListener('click', async () => {
        btn.disabled = true; btn.textContent = 'Sending…';
        const bw = pickBattleWord();
        const result = await fbCreateBattle(btn.dataset.friendId, btn.dataset.friendName, bw.word, bw.definition);
        if (result.ok) {
          startBattle(result.battleId, 'creator', bw, btn.dataset.friendName);
        } else {
          showToast(result.error || 'Could not send challenge');
          btn.disabled = false; btn.textContent = '⚔ Battle';
        }
      });
    });

  } else {
    // Leaderboard: most battles won
    const rows = await fbGetBattleLeaderboard();
    if (rows.length === 0) {
      body.innerHTML = '<div class="battlehub-empty">No battles completed yet — challenge a friend!</div>';
      return;
    }
    let html = '<div class="battlehub-lb-title">Most Battles Won</div>';
    rows.forEach((r, i) => {
      const wardrobe = r.equipped || {};
      const avatar = typeof miniPeteIcon === 'function' ? miniPeteIcon(wardrobe, 30) : '';
      const badgeClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
      html += `<div class="leaderboard-entry">
        <div class="rank-badge ${badgeClass}">${i + 1}</div>
        <div class="lb-avatar">${avatar}</div>
        <div class="leaderboard-name">${r.displayName || 'Anonymous'}</div>
        <div class="leaderboard-score">${r.battleWins || 0} win${(r.battleWins || 0) !== 1 ? 's' : ''}</div>
      </div>`;
    });
    body.innerHTML = html;
  }
}

/* ─── LEADERBOARD SCREEN ─────────────────────────────────────────────────────── */

let _lbData = null;
let _lbTab  = 'streak';

async function initLeaderboard() {
  const listEl = document.getElementById('leaderboardList');
  if (!listEl) return;
  listEl.innerHTML = '<div class="leaderboard-loading">Loading...</div>';
  if (_lbTab === 'friends') {
    _lbData = _lbData || {};
    const [fData, pending] = await Promise.all([
      fbGetFriendsLeaderboard(),
      fbGetPendingBattles()
    ]);
    _lbData.friendsStreak   = fData.streak;
    _lbData.friendsStars    = fData.stars;
    _lbData.pendingBattles  = pending;
  } else {
    _lbData = await fbGetLeaderboard();
  }
  renderLeaderboardTab(_lbTab);
  renderFriendCodeBar();
}

async function renderFriendCodeBar() {
  const bar = document.getElementById('friendCodeBar');
  if (!bar) return;
  const code = localStorage.getItem('pete_friend_code') || '------';

  // Load pending requests
  let requests = [];
  if (typeof fbGetFriendRequests === 'function') requests = await fbGetFriendRequests();

  const reqHtml = requests.length > 0 ? `
    <div class="friend-requests-section">
      <div class="friend-requests-label">Friend requests</div>
      ${requests.map(r => `
        <div class="friend-request-row" data-req-id="${r.id}" data-from-id="${r.from}">
          <span class="friend-request-name">${r.fromName || 'Someone'}</span>
          <button class="friend-req-accept-btn">Accept</button>
          <button class="friend-req-decline-btn">Decline</button>
        </div>`).join('')}
    </div>` : '';

  bar.innerHTML = `
    <div class="friend-code-section">
      <div class="friend-code-label">Your friend code</div>
      <div class="friend-code-value-row">
        <div class="friend-code-value">${code}</div>
        <button class="friend-share-btn" id="friendShareBtn" title="Share code">
          <svg width="18" height="18" viewBox="0 0 22 22" fill="none"><path d="M11 14V3M11 3L7 7M11 3L15 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 13V18H18V13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Share
        </button>
      </div>
      ${reqHtml}
      <div class="friend-add-row">
        <input class="friend-add-input" id="friendCodeInput" placeholder="Enter a friend's code…" maxlength="6" autocorrect="off" autocapitalize="characters"/>
        <button class="friend-add-btn" id="friendAddBtn">Send Request</button>
      </div>
      <div class="friend-add-msg" id="friendAddMsg"></div>
    </div>`;

  // Share code button
  document.getElementById('friendShareBtn').addEventListener('click', () => {
    const msg = `Join me on Pete's Word Wardrobe! Add me as a friend using code: ${code} 📚`;
    if (navigator.share) {
      navigator.share({ title: "Pete's Word Wardrobe", text: msg }).catch(() => {});
    } else {
      navigator.clipboard.writeText(msg).then(() => showToast('Code copied!')).catch(() => showToast(msg));
    }
  });

  // Accept / Decline request buttons
  bar.querySelectorAll('.friend-request-row').forEach(row => {
    const reqId  = row.dataset.reqId;
    const fromId = row.dataset.fromId;
    row.querySelector('.friend-req-accept-btn').addEventListener('click', async () => {
      row.innerHTML = '<span class="friend-request-name">Accepting…</span>';
      const result = await fbAcceptFriendRequest(reqId, fromId);
      if (result && result.ok) {
        showToast('Friend added!');
        _lbData = null;
        await renderFriendCodeBar();
        initLeaderboard();
      } else {
        showToast(result?.error || 'Something went wrong');
        renderFriendCodeBar();
      }
    });
    row.querySelector('.friend-req-decline-btn').addEventListener('click', async () => {
      row.innerHTML = '<span class="friend-request-name">Declined.</span>';
      await fbDeclineFriendRequest(reqId);
      setTimeout(() => renderFriendCodeBar(), 800);
    });
  });

  // Send friend request
  document.getElementById('friendAddBtn').addEventListener('click', async () => {
    const input = document.getElementById('friendCodeInput');
    const msg   = document.getElementById('friendAddMsg');
    const btn   = document.getElementById('friendAddBtn');
    btn.disabled = true;
    msg.textContent = 'Sending…';
    msg.className = 'friend-add-msg';
    const result = await fbSendFriendRequest(input.value.trim().toUpperCase());
    btn.disabled = false;
    if (result.ok) {
      msg.textContent = `Request sent to ${result.name}!`;
      msg.className = 'friend-add-msg friend-add-ok';
      input.value = '';
    } else {
      msg.textContent = result.error;
      msg.className = 'friend-add-msg friend-add-err';
    }
  });
}

function renderLeaderboardTab(tab) {
  _lbTab = tab;
  const listEl = document.getElementById('leaderboardList');
  if (!listEl || !_lbData) return;
  const myId = typeof fbUser !== 'undefined' ? fbUser?.uid : null;

  if (tab === 'friends') {
    if (!_lbData.friendsStreak) {
      listEl.innerHTML = '<div class="leaderboard-loading">Loading friends…</div>';
      Promise.all([fbGetFriendsLeaderboard(), fbGetPendingBattles()]).then(([fData, pending]) => {
        _lbData.friendsStreak  = fData.streak;
        _lbData.friendsStars   = fData.stars;
        _lbData.pendingBattles = pending;
        renderLeaderboardTab('friends');
      });
      return;
    }

    let html = '';

    // Pending battle challenges (received, not yet answered)
    const pending = _lbData.pendingBattles || [];
    pending.forEach(b => {
      html += `<div class="battle-challenge-banner">
        <div class="battle-challenge-info">
          <div class="battle-challenge-from">⚔ Battle challenge from</div>
          <div class="battle-challenge-name">${b.creatorName || 'Someone'}</div>
        </div>
        <button class="battle-challenge-btn" data-battle-id="${b.id}" data-opponent="${b.creatorName || 'Someone'}">Answer →</button>
      </div>`;
    });

    const entries = _lbData.friendsStreak || [];
    if (entries.length <= 1 && pending.length === 0) {
      listEl.innerHTML = html + '<div class="leaderboard-empty">Add friends with their code below to compare!</div>';
    } else {
      html += entries.map((e, i) => {
        const isMe = e.id === myId;
        const score = `${e.streak || 0} day${(e.streak || 0) !== 1 ? 's' : ''}`;
        const badgeClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
        const wardrobe = isMe ? getEquipped() : (e.equipped || {});
        const avatar = typeof miniPeteIcon === 'function' ? miniPeteIcon(wardrobe, 30) : '';
        const lastActiveMs = e.lastActive && e.lastActive.toMillis ? e.lastActive.toMillis() : 0;
        const isOnline = isMe || (Date.now() - lastActiveMs < 5 * 60 * 1000);
        const onlineDot = `<span class="online-dot ${isOnline ? 'online-dot-active' : ''}"></span>`;
        const battleBtn = !isMe
          ? `<button class="leaderboard-entry-battle-btn" data-friend-id="${e.id}" data-friend-name="${e.displayName || 'Anonymous'}" data-is-online="${isOnline}">${isOnline ? 'Battle' : 'Offline'}</button>`
          : '';
        return `<div class="leaderboard-entry ${isMe ? 'leaderboard-entry-me' : ''}">
          <div class="rank-badge ${badgeClass}">${i + 1}</div>
          <div class="lb-avatar" style="position:relative">${avatar}${onlineDot}</div>
          <div class="leaderboard-name">${e.displayName || 'Anonymous'}${isMe ? ' <span class="lb-you">(you)</span>' : ''}</div>
          <div class="leaderboard-score">${score}</div>
          ${battleBtn}
        </div>`;
      }).join('');
      listEl.innerHTML = html;
    }

    // Wire up "Answer" buttons on pending challenges
    listEl.querySelectorAll('.battle-challenge-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const battleId = btn.dataset.battleId;
        const opponentName = btn.dataset.opponent;
        const battle = await fbGetBattle(battleId);
        if (battle) startBattle(battleId, 'opponent', { word: battle.word, wordDefinition: battle.wordDefinition }, opponentName);
      });
    });

    // Wire up "⚔ Battle" buttons on each friend
    listEl.querySelectorAll('.leaderboard-entry-battle-btn').forEach(btn => {
      if (btn.dataset.isOnline !== 'true') {
        btn.disabled = true;
        return;
      }
      btn.addEventListener('click', async () => {
        const friendId   = btn.dataset.friendId;
        const friendName = btn.dataset.friendName;
        btn.disabled = true;
        btn.textContent = 'Sending…';
        const bw = pickBattleWord();
        const result = await fbCreateBattle(friendId, friendName, bw.word, bw.definition);
        if (result.ok) {
          // Creator plays immediately
          startBattle(result.battleId, 'creator', bw, friendName);
        } else {
          showToast(result.error || 'Could not send challenge');
          btn.disabled = false;
          btn.textContent = 'Battle';
        }
      });
    });

    return;
  }

  const entries = (_lbData[tab] || []).filter(e =>
    tab === 'streak' ? (e.streak || 0) > 0 : (e.totalStars || 0) > 0
  );
  if (entries.length === 0) {
    listEl.innerHTML = '<div class="leaderboard-empty">No entries yet — complete words to appear here.</div>';
    return;
  }
  listEl.innerHTML = entries.map((e, i) => {
    const isMe = e.id === myId;
    const score = tab === 'streak'
      ? `${e.streak} day${e.streak !== 1 ? 's' : ''}`
      : `${e.totalStars || 0} ★`;
    const badgeClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    const wardrobe = isMe ? getEquipped() : (e.equipped || {});
    const avatar = typeof miniPeteIcon === 'function' ? miniPeteIcon(wardrobe, 30) : '';
    return `<div class="leaderboard-entry ${isMe ? 'leaderboard-entry-me' : ''}">
      <div class="rank-badge ${badgeClass}">${i + 1}</div>
      <div class="lb-avatar">${avatar}</div>
      <div class="leaderboard-name">${e.displayName || 'Anonymous'}${isMe ? ' <span class="lb-you">(you)</span>' : ''}</div>
      <div class="leaderboard-score">${score}</div>
    </div>`;
  }).join('');
}

/* ─── PETE'S HOUSE ───────────────────────────────────────────────────────────── */

const HOUSE_CATALOG = [
  // Wallpaper
  { id: 'wall_cream',     type: 'wallpaper', name: 'Classic Cream',  cost: 0,   color: '#f0ebe0' },
  { id: 'wall_sage',      type: 'wallpaper', name: 'Sage Green',     cost: 20,  color: '#8aab8a' },
  { id: 'wall_blush',     type: 'wallpaper', name: 'Blush Rose',     cost: 25,  color: '#e8c4bc' },
  { id: 'wall_navy',      type: 'wallpaper', name: 'Midnight Blue',  cost: 30,  color: '#2a3d5c' },
  { id: 'wall_gold',      type: 'wallpaper', name: 'Antique Gold',   cost: 40,  color: '#c8a040' },
  { id: 'wall_forest',    type: 'wallpaper', name: 'Deep Forest',    cost: 50,  color: '#3a5c3a' },
  // Flooring
  { id: 'floor_oak',      type: 'flooring',  name: 'Oak Hardwood',   cost: 0,   color: '#c8a060' },
  { id: 'floor_dark',     type: 'flooring',  name: 'Dark Walnut',    cost: 20,  color: '#5a3820' },
  { id: 'floor_tile',     type: 'flooring',  name: 'Checkerboard',   cost: 25,  color: 'tile' },
  { id: 'floor_carpet',   type: 'flooring',  name: 'Red Carpet',     cost: 30,  color: '#8a2020' },
  { id: 'floor_marble',   type: 'flooring',  name: 'White Marble',   cost: 60,  color: '#e8e4df' },
  // Furniture
  { id: 'furn_bookshelf',  type: 'furniture', name: 'Bookshelf',       cost: 30 },
  { id: 'furn_sofa',       type: 'furniture', name: 'Velvet Sofa',     cost: 40 },
  { id: 'furn_armchair',   type: 'furniture', name: 'Armchair',        cost: 25 },
  { id: 'furn_desk',       type: 'furniture', name: 'Writing Desk',    cost: 35 },
  { id: 'furn_fireplace',  type: 'furniture', name: 'Fireplace',       cost: 80 },
  { id: 'furn_piano',      type: 'furniture', name: 'Grand Piano',     cost: 70 },
  { id: 'furn_trampoline', type: 'furniture', name: 'Trampoline',      cost: 55 },
  { id: 'furn_pooltable',  type: 'furniture', name: 'Pool Table',      cost: 65 },
  { id: 'furn_arcade',     type: 'furniture', name: 'Arcade Machine',  cost: 80 },
  // Decor
  { id: 'dec_rug',         type: 'decor', name: 'Persian Rug',         cost: 20 },
  { id: 'dec_plant',       type: 'decor', name: 'Potted Plant',        cost: 15 },
  { id: 'dec_lamp',        type: 'decor', name: 'Floor Lamp',          cost: 20 },
  { id: 'dec_painting',    type: 'decor', name: 'Oil Painting',        cost: 45 },
  { id: 'dec_clock',       type: 'decor', name: 'Grandfather Clock',   cost: 40 },
  { id: 'dec_trophy',      type: 'decor', name: 'Trophy Case',         cost: 50 },
  { id: 'dec_globe',       type: 'decor', name: 'Globe',               cost: 35 },
  { id: 'dec_fishtank',    type: 'decor', name: 'Fish Tank',           cost: 45 },
  { id: 'dec_disco',       type: 'decor', name: 'Disco Ball',          cost: 30 },
  { id: 'dec_beanbag',     type: 'decor', name: 'Bean Bag',            cost: 20 },
  // Pets
  { id: 'pet_cat',         type: 'pet',  name: 'Cat',                  cost: 40 },
  { id: 'pet_dog',         type: 'pet',  name: 'Dog',                  cost: 40 },
  { id: 'pet_parrot',      type: 'pet',  name: 'Parrot',               cost: 50 },
  { id: 'pet_hamster',     type: 'pet',  name: 'Hamster',              cost: 25 },
];

function getHouseOwned()    { try { return JSON.parse(localStorage.getItem('pete_house_owned') || '["wall_cream","floor_oak"]'); } catch { return ['wall_cream','floor_oak']; } }
function getHouseEquipped() { try { return JSON.parse(localStorage.getItem('pete_house_equipped') || '{"wallpaper":"wall_cream","flooring":"floor_oak"}'); } catch { return { wallpaper:'wall_cream', flooring:'floor_oak' }; } }
function isHouseOwned(id) { return getHouseOwned().includes(id); }

function ownHouseItem(id) {
  const owned = getHouseOwned();
  if (!owned.includes(id)) { owned.push(id); localStorage.setItem('pete_house_owned', JSON.stringify(owned)); }
}

function equipHouseItem(id, type) {
  const eq = getHouseEquipped();
  if (type === 'wallpaper' || type === 'flooring') {
    eq[type] = eq[type] === id ? (type === 'wallpaper' ? 'wall_cream' : 'floor_oak') : id;
  } else {
    // furniture/decor: toggle
    if (!eq.items) eq.items = [];
    const idx = eq.items.indexOf(id);
    if (idx >= 0) eq.items.splice(idx, 1); else eq.items.push(id);
  }
  localStorage.setItem('pete_house_equipped', JSON.stringify(eq));
  updateHousePreview();
  renderHouseGrid(document.querySelector('.house-tab.active')?.dataset.htab || 'wallpaper');
}

function renderHouseSVG(eq) {
  const wall  = HOUSE_CATALOG.find(i => i.id === eq.wallpaper) || HOUSE_CATALOG[0];
  const floor = HOUSE_CATALOG.find(i => i.id === eq.flooring)  || HOUSE_CATALOG.find(i => i.type === 'flooring');
  const items = eq.items || [];
  const wallColor  = wall.color;
  const floorColor = floor.color;

  // Wall pattern/fill
  let wallFill = `fill="${wallColor}"`;
  let defs = '';
  if (wallColor === '#c8a040') {
    defs += `<pattern id="hp_wall" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="${wallColor}"/><path d="M10 0L20 10L10 20L0 10Z" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="0.8"/></pattern>`;
    wallFill = `fill="url(#hp_wall)"`;
  }

  // Floor pattern/fill
  let floorFill = `fill="${floorColor}"`;
  if (floorColor === 'tile') {
    defs += `<pattern id="hp_floor" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#f0ebe0"/><rect x="10" y="10" width="10" height="10" fill="#f0ebe0"/><rect x="10" y="0" width="10" height="10" fill="#1c1208"/><rect x="0" y="10" width="10" height="10" fill="#1c1208"/></pattern>`;
    floorFill = `fill="url(#hp_floor)"`;
  } else if (floorColor === '#c8a060' || floorColor === '#5a3820') {
    const gc = floorColor === '#c8a060' ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.12)';
    defs += `<pattern id="hp_floor" x="0" y="0" width="40" height="10" patternUnits="userSpaceOnUse"><rect width="40" height="10" fill="${floorColor}"/><line x1="0" y1="5" x2="40" y2="5" stroke="${gc}" stroke-width="0.8"/></pattern>`;
    floorFill = `fill="url(#hp_floor)"`;
  } else if (floorColor === '#e8d8c0') {
    defs += `<pattern id="hp_floor" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse"><rect width="30" height="30" fill="${floorColor}"/><line x1="0" y1="15" x2="30" y2="15" stroke="rgba(0,0,0,0.06)" stroke-width="0.8"/><line x1="15" y1="0" x2="15" y2="30" stroke="rgba(0,0,0,0.06)" stroke-width="0.8"/></pattern>`;
    floorFill = `fill="url(#hp_floor)"`;
  }

  const has = id => items.includes(id);

  // Ceiling light/shadow gradient
  defs += `<linearGradient id="wallShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(0,0,0,0.12)"/><stop offset="100%" stop-color="rgba(0,0,0,0)"/></linearGradient>
  <linearGradient id="floorShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(0,0,0,0.18)"/><stop offset="70%" stop-color="rgba(0,0,0,0.04)"/><stop offset="100%" stop-color="rgba(0,0,0,0)"/></linearGradient>
  <linearGradient id="lightBeamGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fffbe8" stop-opacity="0.55"/><stop offset="100%" stop-color="#fffbe8" stop-opacity="0.0"/></linearGradient>
  <filter id="itemShadow" x="-25%" y="-15%" width="160%" height="160%"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="rgba(0,0,0,0.38)"/></filter>`;

  // ── WALL ITEMS (hang on back wall, y < 155) ──────────────────────────────
  const window_ = `
    <rect x="126" y="14" width="68" height="60" fill="#87CEEB" rx="2" opacity="0.85"/>
    <line x1="160" y1="14" x2="160" y2="74" stroke="white" stroke-width="2.5"/>
    <line x1="126" y1="44" x2="194" y2="44" stroke="white" stroke-width="2.5"/>
    <rect x="123" y="11" width="74" height="66" fill="none" stroke="#7a5228" stroke-width="4" rx="3"/>
    <rect x="121" y="9" width="78" height="70" fill="none" stroke="#5c3a18" stroke-width="2" rx="4"/>`;

  const bookshelf = has('furn_bookshelf') ? `
    <rect x="4" y="10" width="58" height="148" fill="#7a5228" rx="2"/>
    <rect x="6" y="12" width="54" height="144" fill="#4a2c10"/>
    <rect x="6" y="55" width="54" height="4" fill="#7a5228"/><rect x="6" y="97" width="54" height="4" fill="#7a5228"/><rect x="6" y="138" width="54" height="4" fill="#7a5228"/>
    <rect x="8" y="14" width="6" height="40" fill="#b84c2a" rx="1"/><rect x="15" y="14" width="8" height="40" fill="#c8a010" rx="1"/><rect x="24" y="14" width="6" height="40" fill="#1a4a8a" rx="1"/><rect x="31" y="18" width="7" height="36" fill="#2a6e46" rx="1"/><rect x="39" y="14" width="6" height="40" fill="#8a3a80" rx="1"/><rect x="46" y="14" width="7" height="40" fill="#b84c2a" rx="1"/>
    <rect x="8" y="59" width="8" height="37" fill="#2a6e46" rx="1"/><rect x="17" y="59" width="6" height="37" fill="#b84c2a" rx="1"/><rect x="24" y="63" width="7" height="33" fill="#c8a010" rx="1"/><rect x="32" y="59" width="6" height="37" fill="#1a4a8a" rx="1"/><rect x="39" y="59" width="8" height="37" fill="#5c3a18" rx="1"/>
    <rect x="8" y="101" width="7" height="36" fill="#1a4a8a" rx="1"/><rect x="16" y="101" width="6" height="36" fill="#8a3a80" rx="1"/><rect x="23" y="105" width="8" height="32" fill="#b84c2a" rx="1"/><rect x="32" y="101" width="6" height="36" fill="#2a6e46" rx="1"/><rect x="39" y="101" width="8" height="36" fill="#c8a010" rx="1"/>` : '';

  const painting = has('dec_painting') ? `
    <rect x="82" y="12" width="56" height="44" fill="#5c4030" rx="2"/>
    <rect x="85" y="15" width="50" height="38" fill="#a06040"/>
    <rect x="88" y="18" width="44" height="32" fill="#87CEEB" opacity="0.5"/>
    <ellipse cx="110" cy="28" rx="10" ry="8" fill="#f0a850" opacity="0.8"/>
    <rect x="88" y="32" width="44" height="18" fill="#5a8030" opacity="0.6"/>` : '';

  const clock = has('dec_clock') ? `
    <rect x="204" y="10" width="24" height="60" fill="#6a4218" rx="3"/>
    <rect x="206" y="12" width="20" height="56" fill="#5a3210" rx="2"/>
    <circle cx="216" cy="28" r="10" fill="#f5f0e0" stroke="#8a5c28" stroke-width="1.5"/>
    <line x1="216" y1="22" x2="216" y2="28" stroke="#1c1208" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="216" y1="28" x2="221" y2="31" stroke="#1c1208" stroke-width="1" stroke-linecap="round"/>
    <circle cx="216" cy="28" r="1.5" fill="#1c1208"/>
    <rect x="213" y="44" width="6" height="20" fill="#6a4218" rx="2"/>` : '';

  const trophy = has('dec_trophy') ? `
    <rect x="248" y="82" width="24" height="30" fill="#c8a010" rx="2"/>
    <ellipse cx="260" cy="83" rx="12" ry="9" fill="#d4b828"/>
    <rect x="256" y="110" width="8" height="5" fill="#c8a010"/>
    <rect x="252" y="115" width="16" height="3" fill="#8a6808" rx="1"/>
    <path d="M248 92 Q240 98 244 108 Q248 113 248 92Z" fill="#c8a010"/>
    <path d="M272 92 Q280 98 276 108 Q272 113 272 92Z" fill="#c8a010"/>
    <text x="260" y="102" font-size="9" fill="#8a6808" text-anchor="middle" font-weight="bold">1</text>` : '';

  const disco = has('dec_disco') ? `
    <line x1="160" y1="0" x2="160" y2="16" stroke="#888" stroke-width="1.5"/>
    <circle cx="160" cy="22" r="10" fill="#c0c0c0" stroke="#909090" stroke-width="1"/>
    <rect x="153" y="15" width="4" height="4" fill="#88ccff" rx="0.5" opacity="0.9"/>
    <rect x="159" y="15" width="4" height="4" fill="#ff88cc" rx="0.5" opacity="0.9"/>
    <rect x="153" y="22" width="4" height="4" fill="#ffcc44" rx="0.5" opacity="0.9"/>
    <rect x="159" y="22" width="4" height="4" fill="#88ffcc" rx="0.5" opacity="0.9"/>
    <line x1="160" y1="32" x2="136" y2="72" stroke="#88ccff" stroke-width="1" opacity="0.45"/>
    <line x1="160" y1="32" x2="182" y2="68" stroke="#ff88cc" stroke-width="1" opacity="0.45"/>
    <line x1="160" y1="32" x2="116" y2="62" stroke="#ffcc44" stroke-width="1" opacity="0.45"/>
    <line x1="160" y1="32" x2="200" y2="60" stroke="#88ffcc" stroke-width="1" opacity="0.45"/>` : '';

  const arcade = has('furn_arcade') ? `
    <rect x="255" y="52" width="40" height="106" fill="#1a2a5c" rx="3"/>
    <rect x="257" y="55" width="36" height="44" fill="#0a1028" rx="2"/>
    <rect x="259" y="57" width="32" height="40" fill="#102060"/>
    <text x="275" y="70" font-size="6" fill="#00ff88" text-anchor="middle" font-family="monospace">PLAY</text>
    <text x="275" y="80" font-size="5" fill="#00cc66" text-anchor="middle" font-family="monospace">SCORE</text>
    <text x="275" y="90" font-size="7" fill="#ffff00" text-anchor="middle" font-family="monospace">9999</text>
    <rect x="259" y="106" width="12" height="12" fill="#8a2020" rx="6"/>
    <rect x="275" y="106" width="12" height="12" fill="#20208a" rx="6"/>
    <circle cx="266" cy="130" r="7" fill="#3a2a10"/>
    <circle cx="266" cy="127" r="4" fill="#c8a010"/>` : '';

  const fireplace = has('furn_fireplace') ? `
    <rect x="108" y="68" width="84" height="90" fill="#9a8070" rx="2"/>
    <rect x="114" y="74" width="72" height="78" fill="#6a5040"/>
    <rect x="120" y="80" width="60" height="66" fill="#2a1808"/>
    <rect x="104" y="62" width="92" height="10" fill="#b09080" rx="1"/>
    <rect x="108" y="68" width="4" height="90" fill="rgba(0,0,0,0.15)"/>
    <ellipse cx="150" cy="144" rx="26" ry="6" fill="#e05818" opacity="0.85"/>
    <ellipse cx="150" cy="137" rx="18" ry="10" fill="#f5a020" opacity="0.8"/>
    <ellipse cx="145" cy="127" rx="10" ry="14" fill="#f5c040" opacity="0.75"/>
    <ellipse cx="155" cy="125" rx="8" ry="12" fill="#e05818" opacity="0.65"/>` : '';

  // ── FLOOR ITEMS (on the floor, layered back to front) ─────────────────────
  // Back row (against skirting board, y≈148-170)
  const sofa = has('furn_sofa') ? `
    <rect x="60" y="138" width="140" height="8" fill="#6a3c18" rx="2"/>
    <rect x="60" y="138" width="140" height="28" fill="#9a6c38" rx="3"/>
    <rect x="60" y="134" width="140" height="14" fill="#b07840" rx="3"/>
    <rect x="60" y="134" width="12" height="32" fill="#7a4c20" rx="3"/>
    <rect x="188" y="134" width="12" height="32" fill="#7a4c20" rx="3"/>
    <rect x="68" y="140" width="38" height="22" fill="#c08850" rx="2"/>
    <rect x="111" y="140" width="38" height="22" fill="#c08850" rx="2"/>
    <rect x="154" y="140" width="30" height="22" fill="#c08850" rx="2"/>
    <rect x="60" y="162" width="140" height="4" fill="#6a3c18" rx="1"/>` : '';

  const piano = has('furn_piano') ? `
    <rect x="66" y="126" width="58" height="40" fill="#1a1008" rx="2"/>
    <rect x="68" y="128" width="54" height="34" fill="#2a1a0a"/>
    <rect x="64" y="122" width="62" height="7" fill="#1a1008" rx="1"/>
    <rect x="64" y="162" width="62" height="4" fill="#f5f0e8"/>
    <rect x="72" y="162" width="1.5" height="3.5" fill="#c0b8a8"/>
    <rect x="79" y="162" width="1.5" height="3.5" fill="#c0b8a8"/>
    <rect x="86" y="162" width="1.5" height="3.5" fill="#c0b8a8"/>
    <rect x="93" y="162" width="1.5" height="3.5" fill="#c0b8a8"/>
    <rect x="100" y="162" width="1.5" height="3.5" fill="#c0b8a8"/>
    <rect x="107" y="162" width="1.5" height="3.5" fill="#c0b8a8"/>
    <rect x="68" y="162" width="5" height="3" fill="#1a1008" rx="0.5"/>
    <rect x="75" y="162" width="5" height="3" fill="#1a1008" rx="0.5"/>
    <rect x="89" y="162" width="5" height="3" fill="#1a1008" rx="0.5"/>
    <rect x="96" y="162" width="5" height="3" fill="#1a1008" rx="0.5"/>
    <rect x="103" y="162" width="5" height="3" fill="#1a1008" rx="0.5"/>
    <rect x="68" y="166" width="3" height="12" fill="#3a2010"/><rect x="116" y="166" width="3" height="12" fill="#3a2010"/>` : '';

  const desk = has('furn_desk') ? `
    <rect x="205" y="136" width="72" height="8" fill="#8a5c28" rx="2"/>
    <rect x="205" y="144" width="5" height="22" fill="#6a4218"/>
    <rect x="272" y="144" width="5" height="22" fill="#6a4218"/>
    <rect x="210" y="136" width="62" height="3" fill="#a06c38"/>
    ${has('dec_globe') ? `<ellipse cx="240" cy="131" rx="9" ry="9" fill="#1a4a8a"/><path d="M231 131 Q240 125 249 131 Q240 137 231 131Z" fill="#2a6e8a" opacity="0.6"/><line x1="240" y1="122" x2="240" y2="140" stroke="rgba(255,255,255,0.2)" stroke-width="0.8"/><line x1="231" y1="131" x2="249" y2="131" stroke="rgba(255,255,255,0.2)" stroke-width="0.8"/><rect x="237" y="139" width="6" height="2" fill="#5a3820" rx="1"/>` : ''}` : '';

  // Mid floor items (y≈165-195)
  const armchair = has('furn_armchair') ? `
    <rect x="14" y="158" width="52" height="30" fill="#7a4c28" rx="3"/>
    <rect x="14" y="152" width="52" height="14" fill="#8a5c38" rx="2"/>
    <rect x="14" y="152" width="11" height="36" fill="#6a3c18" rx="2"/>
    <rect x="55" y="152" width="11" height="36" fill="#6a3c18" rx="2"/>
    <rect x="20" y="160" width="38" height="24" fill="#9a6c48" rx="2"/>
    <rect x="14" y="185" width="12" height="5" fill="#4a2c10" rx="1"/>
    <rect x="54" y="185" width="12" height="5" fill="#4a2c10" rx="1"/>` : '';

  const pooltable = has('furn_pooltable') ? `
    <rect x="64" y="158" width="136" height="36" fill="#5c3010" rx="4"/>
    <rect x="68" y="162" width="128" height="28" fill="#2a7050" rx="2"/>
    <rect x="68" y="162" width="128" height="5" fill="#1e5438"/>
    <circle cx="132" cy="178" r="5" fill="white" stroke="#ddd" stroke-width="0.5"/>
    <circle cx="152" cy="171" r="4" fill="#e02820"/>
    <circle cx="161" cy="178" r="4" fill="#f5c020"/>
    <circle cx="152" cy="185" r="4" fill="#1a4a8a"/>
    <circle cx="169" cy="171" r="4" fill="#2a6e3a"/>
    <circle cx="169" cy="185" r="4" fill="#8a2880"/>
    <line x1="108" y1="178" x2="132" y2="178" stroke="#a08860" stroke-width="2" stroke-linecap="round"/>
    <rect x="64" y="190" width="11" height="6" fill="#3c1c08" rx="1"/>
    <rect x="189" y="190" width="11" height="6" fill="#3c1c08" rx="1"/>` : '';

  const trampoline = has('furn_trampoline') ? `
    <ellipse cx="220" cy="184" rx="52" ry="12" fill="#5c3a18" stroke="#3c2008" stroke-width="2"/>
    <ellipse cx="220" cy="184" rx="42" ry="8" fill="#3a7a5c"/>
    <ellipse cx="220" cy="184" rx="34" ry="5.5" fill="#4a8a6c" opacity="0.6"/>
    <line x1="168" y1="184" x2="162" y2="200" stroke="#3c2008" stroke-width="3"/>
    <line x1="272" y1="184" x2="278" y2="200" stroke="#3c2008" stroke-width="3"/>
    <line x1="192" y1="192" x2="188" y2="204" stroke="#3c2008" stroke-width="2"/>
    <line x1="248" y1="192" x2="252" y2="204" stroke="#3c2008" stroke-width="2"/>` : '';

  // Decor items
  const fishtank = has('dec_fishtank') ? `
    <rect x="233" y="120" width="62" height="52" fill="#90c0d8" rx="3" opacity="0.82"/>
    <rect x="233" y="120" width="62" height="52" fill="none" stroke="#4a7a90" stroke-width="2.5" rx="3"/>
    <rect x="233" y="165" width="62" height="7" fill="#2a5820" rx="2"/>
    <ellipse cx="252" cy="144" rx="8" ry="5" fill="#f59020" opacity="0.9"/>
    <polygon points="244,144 252,139 252,149" fill="#e07010" opacity="0.9"/>
    <ellipse cx="272" cy="152" rx="7" ry="4.5" fill="#c040a0" opacity="0.9"/>
    <polygon points="265,152 272,148 272,156" fill="#a02880" opacity="0.9"/>
    <rect x="236" y="163" width="14" height="4" fill="#2a6e46" rx="1" opacity="0.8"/>
    <rect x="258" y="159" width="10" height="6" fill="#2a6e46" rx="1" opacity="0.8"/>` : '';

  const lamp = has('dec_lamp') ? `
    <polygon points="199,78 223,78 218,62 204,62" fill="#e8c020" opacity="0.92"/>
    <ellipse cx="211" cy="78" rx="12" ry="5" fill="#c8a010"/>
    <line x1="211" y1="83" x2="211" y2="148" stroke="#8a6828" stroke-width="3"/>
    <ellipse cx="211" cy="150" rx="8" ry="3" fill="#6a4818"/>` : '';

  const plant = has('dec_plant') ? `
    <rect x="5" y="156" width="20" height="24" fill="#8a5c28" rx="2"/>
    <rect x="7" y="153" width="16" height="5" fill="#6a3c18"/>
    <ellipse cx="15" cy="142" rx="13" ry="15" fill="#2a6e46"/>
    <ellipse cx="9" cy="148" rx="8" ry="10" fill="#388844"/>
    <ellipse cx="21" cy="146" rx="9" ry="11" fill="#2a6e46"/>
    <ellipse cx="15" cy="135" rx="7" ry="9" fill="#3a8058"/>` : '';

  // Foreground items (y≈185-215)
  const rug = has('dec_rug') ? `
    <ellipse cx="160" cy="210" rx="100" ry="16" fill="#7a1c1c" opacity="0.9"/>
    <ellipse cx="160" cy="210" rx="88" ry="12" fill="#922020" opacity="0.9"/>
    <ellipse cx="160" cy="210" rx="76" ry="9" fill="none" stroke="#c8a010" stroke-width="1.5"/>
    <ellipse cx="160" cy="210" rx="64" ry="6" fill="#a82828" opacity="0.7"/>` : '';

  const beanbag = has('dec_beanbag') ? `
    <ellipse cx="250" cy="210" rx="28" ry="11" fill="#b83030"/>
    <ellipse cx="250" cy="200" rx="22" ry="18" fill="#c83838"/>
    <ellipse cx="245" cy="195" rx="12" ry="10" fill="#d84848" opacity="0.55"/>` : '';

  const petCat = has('pet_cat') ? `
    <ellipse cx="168" cy="209" rx="15" ry="7" fill="#c8a060"/>
    <circle cx="168" cy="198" r="10" fill="#c8a060"/>
    <polygon points="161,191 163,183 168,191" fill="#c8a060"/>
    <polygon points="168,191 173,183 175,191" fill="#c8a060"/>
    <ellipse cx="164" cy="198" rx="2.5" ry="3" fill="#2a1808"/>
    <ellipse cx="172" cy="198" rx="2.5" ry="3" fill="#2a1808"/>
    <ellipse cx="168" cy="202" rx="2.2" ry="1.8" fill="#e09080"/>
    <path d="M163 202 Q159 200 156 202" stroke="#7a5030" stroke-width="0.8" fill="none"/>
    <path d="M173 202 Q177 200 180 202" stroke="#7a5030" stroke-width="0.8" fill="none"/>
    <path d="M180 207 Q188 199 184 208" stroke="#c8a060" stroke-width="2.5" fill="none" stroke-linecap="round"/>` : '';

  const petDog = has('pet_dog') ? `
    <ellipse cx="144" cy="210" rx="16" ry="7" fill="#c89050"/>
    <circle cx="144" cy="199" r="10" fill="#c89050"/>
    <ellipse cx="136" cy="196" rx="4.5" ry="7" fill="#b07840"/>
    <ellipse cx="152" cy="196" rx="4.5" ry="7" fill="#b07840"/>
    <ellipse cx="140" cy="200" rx="2.5" ry="3" fill="#2a1808"/>
    <ellipse cx="148" cy="200" rx="2.5" ry="3" fill="#2a1808"/>
    <ellipse cx="144" cy="204" rx="3" ry="2.2" fill="#e09080"/>
    <path d="M140 204 Q136 202 133 204" stroke="#7a5030" stroke-width="0.8" fill="none"/>
    <path d="M148 204 Q152 202 155 204" stroke="#7a5030" stroke-width="0.8" fill="none"/>
    <path d="M157 208 Q164 213 160 216" stroke="#c89050" stroke-width="2.5" fill="none" stroke-linecap="round"/>` : '';

  const petParrot = has('pet_parrot') ? `
    <line x1="270" y1="128" x2="292" y2="128" stroke="#5a3820" stroke-width="3"/>
    <circle cx="278" cy="118" r="9" fill="#2a9a2a"/>
    <ellipse cx="278" cy="130" rx="7" ry="10" fill="#38a838"/>
    <ellipse cx="275" cy="116" rx="2.2" ry="2.8" fill="#1a1008"/>
    <path d="M276 122 L271 125 L276 128" fill="#c8a010"/>
    <rect x="271" y="128" width="4" height="6" fill="#c88020"/>
    <rect x="285" y="128" width="4" height="6" fill="#c88020"/>
    <ellipse cx="278" cy="112" rx="4" ry="3" fill="#f5c020" opacity="0.6"/>` : '';

  const petHamster = has('pet_hamster') ? `
    <ellipse cx="202" cy="212" rx="14" ry="7" fill="#e8b880"/>
    <circle cx="202" cy="202" r="11" fill="#e8b880"/>
    <ellipse cx="193" cy="204" rx="6" ry="7" fill="#f0c890"/>
    <ellipse cx="211" cy="204" rx="6" ry="7" fill="#f0c890"/>
    <ellipse cx="198" cy="202" rx="2.2" ry="2.5" fill="#2a1808"/>
    <ellipse cx="206" cy="202" rx="2.2" ry="2.5" fill="#2a1808"/>
    <ellipse cx="202" cy="206" rx="2.5" ry="1.8" fill="#e09080"/>
    <ellipse cx="196" cy="208" rx="4" ry="3" fill="#f5d0a0" opacity="0.7"/>
    <ellipse cx="208" cy="208" rx="4" ry="3" fill="#f5d0a0" opacity="0.7"/>` : '';

  // Baseboard / skirting
  const baseboard = `<rect x="0" y="155" width="320" height="8" fill="#d4b898" rx="0"/>
    <rect x="0" y="155" width="320" height="2" fill="#f0e4d0"/>
    <rect x="0" y="161" width="320" height="2" fill="#b09070"/>`;

  return `<svg viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;border-radius:12px">
  <defs>${defs}</defs>
  <!-- Wall -->
  <rect x="0" y="0" width="320" height="163" ${wallFill}/>
  <rect x="0" y="0" width="320" height="163" fill="url(#wallShade)"/>
  <!-- Floor -->
  <path d="M 0 163 L 320 163 L 320 240 L 0 240 Z" ${floorFill}/>
  <rect x="0" y="163" width="320" height="77" fill="url(#floorShade)"/>
  ${baseboard}
  ${disco ? wrapDraggable('dec_disco', disco) : ''}
  ${window_}
  <polygon points="130,74 190,74 248,240 72,240" fill="url(#lightBeamGrad)"/>
  ${wrapDraggable('furn_bookshelf', bookshelf)}${wrapDraggable('furn_fireplace', fireplace)}${wrapDraggable('dec_painting', painting)}${wrapDraggable('dec_clock', clock)}${wrapDraggable('dec_trophy', trophy)}${wrapDraggable('furn_arcade', arcade)}
  ${wrapDraggable('furn_sofa', sofa)}${wrapDraggable('furn_piano', piano)}${wrapDraggable('furn_desk', desk)}
  ${wrapDraggable('dec_lamp', lamp)}${wrapDraggable('dec_fishtank', fishtank)}
  ${wrapDraggable('furn_armchair', armchair)}${wrapDraggable('furn_pooltable', pooltable)}${wrapDraggable('furn_trampoline', trampoline)}
  ${wrapDraggable('dec_plant', plant)}
  ${wrapDraggable('dec_rug', rug)}${wrapDraggable('dec_beanbag', beanbag)}
  ${wrapDraggable('pet_parrot', petParrot)}${wrapDraggable('pet_cat', petCat)}${wrapDraggable('pet_dog', petDog)}${wrapDraggable('pet_hamster', petHamster)}
</svg>`;
}

function getItemOffset(id) {
  try {
    const p = JSON.parse(localStorage.getItem('pete_house_positions') || '{}');
    return p[id] || { dx: 0, dy: 0 };
  } catch { return { dx: 0, dy: 0 }; }
}

function saveItemOffset(id, dx, dy) {
  try {
    const p = JSON.parse(localStorage.getItem('pete_house_positions') || '{}');
    p[id] = { dx, dy };
    localStorage.setItem('pete_house_positions', JSON.stringify(p));
  } catch {}
}

function wrapDraggable(id, svgContent) {
  if (!svgContent) return '';
  const { dx, dy } = getItemOffset(id);
  return `<g class="house-draggable" data-item-id="${id}" transform="translate(${dx},${dy})" style="cursor:grab" filter="url(#itemShadow)">${svgContent}</g>`;
}

function initHouseDrag(svgEl) {
  let dragging = null;
  let startSVGX = 0, startSVGY = 0, startDX = 0, startDY = 0;

  function getSVGPoint(e) {
    const rect = svgEl.getBoundingClientRect();
    const scaleX = 320 / rect.width;
    const scaleY = 240 / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * scaleX, y: (src.clientY - rect.top) * scaleY };
  }

  function onStart(e) {
    const g = e.target.closest('.house-draggable');
    if (!g) return;
    e.preventDefault();
    dragging = g;
    const pt = getSVGPoint(e);
    startSVGX = pt.x; startSVGY = pt.y;
    const off = getItemOffset(g.dataset.itemId);
    startDX = off.dx; startDY = off.dy;
    g.style.filter = 'drop-shadow(0 4px 12px rgba(0,0,0,0.35))';
    g.style.cursor = 'grabbing';
  }

  function onMove(e) {
    if (!dragging) return;
    e.preventDefault();
    const pt = getSVGPoint(e);
    const dx = startDX + (pt.x - startSVGX);
    const dy = startDY + (pt.y - startSVGY);
    dragging.setAttribute('transform', `translate(${dx},${dy})`);
  }

  function onEnd() {
    if (!dragging) return;
    const m = (dragging.getAttribute('transform') || '').match(/translate\(([^,]+),([^)]+)\)/);
    if (m) saveItemOffset(dragging.dataset.itemId, parseFloat(m[1]), parseFloat(m[2]));
    dragging.style.filter = '';
    dragging.style.cursor = 'grab';
    dragging = null;
  }

  svgEl.addEventListener('mousedown', onStart);
  svgEl.addEventListener('mousemove', onMove);
  svgEl.addEventListener('mouseup', onEnd);
  svgEl.addEventListener('mouseleave', onEnd);
  svgEl.addEventListener('touchstart', onStart, { passive: false });
  svgEl.addEventListener('touchmove', onMove, { passive: false });
  svgEl.addEventListener('touchend', onEnd);
}

function updateHousePreview() {
  const eq = getHouseEquipped();
  const roomEl = document.getElementById('houseRoom');
  const peteEl = document.getElementById('housePete');
  if (roomEl) {
    roomEl.innerHTML = renderHouseSVG(eq);
    const svgEl = roomEl.querySelector('svg');
    if (svgEl) initHouseDrag(svgEl);
  }
  if (peteEl) peteEl.innerHTML = createPeteSVG(70, { wardrobe: getWardrobeForPete() });
}

function renderHouseGrid(tab) {
  const grid = document.getElementById('houseGrid');
  if (!grid) return;
  const owned   = getHouseOwned();
  const eq      = getHouseEquipped();
  const items   = eq.items || [];
  const catalog = HOUSE_CATALOG.filter(i => i.type === tab);

  grid.innerHTML = catalog.map(item => {
    const own  = owned.includes(item.id);
    const equip = (tab === 'wallpaper' || tab === 'flooring') ? eq[tab] === item.id : items.includes(item.id);
    const canAfford = getCoins() >= item.cost;

    let action = '';
    if (!own && item.cost === 0) action = 'equip';
    else if (!own) action = canAfford ? 'buy' : 'locked';
    else action = equip ? 'equipped' : 'equip';

    // Swatch for wallpaper/flooring
    const swatch = (item.color && item.color !== 'tile')
      ? `<div class="house-item-swatch" style="background:${item.color}"></div>`
      : item.color === 'tile'
        ? `<div class="house-item-swatch house-swatch-tile"></div>`
        : `<div class="house-item-swatch house-swatch-icon">${HOUSE_ITEM_ICONS[item.id] || ''}</div>`;

    return `<div class="wardrobe-item ${equip ? 'wardrobe-item-equipped' : ''} ${!own && !canAfford ? 'wardrobe-item-locked' : ''}"
      data-house-id="${item.id}" data-house-type="${item.type}" data-house-action="${action}" data-house-cost="${item.cost}">
      ${swatch}
      <div class="wardrobe-item-name">${item.name}</div>
      <div class="wardrobe-item-cost">
        ${action === 'equipped' ? '<span class="wardrobe-equipped-badge">On</span>'
          : action === 'buy' ? `${item.cost} <svg width="12" height="12" viewBox="0 0 18 18" fill="none" style="vertical-align:middle"><circle cx="9" cy="9" r="8" fill="#c8a010" stroke="#8a6808" stroke-width="1.2"/><circle cx="9" cy="9" r="5.8" fill="#d4b828"/></svg>`
          : action === 'locked' ? `🔒 ${item.cost}`
          : ''}
      </div>
    </div>`;
  }).join('');

  // Click handlers
  grid.querySelectorAll('[data-house-id]').forEach(el => {
    el.addEventListener('click', () => {
      const id     = el.dataset.houseId;
      const type   = el.dataset.houseType;
      const action = el.dataset.houseAction;
      const cost   = parseInt(el.dataset.houseCost, 10);
      if (action === 'locked') { showToast(`Need ${cost} coins`); return; }
      if (action === 'buy') {
        if (getCoins() < cost) { showToast('Not enough coins'); return; }
        const hItem = HOUSE_CATALOG.find(h => h.id === id);
        confirmPurchase(hItem ? hItem.name : id, cost, () => {
          spendCoins(cost);
          ownHouseItem(id);
          equipHouseItem(id, type);
          renderHouseGrid(tab);
        });
        return;
      }
      equipHouseItem(id, type);
      renderHouseGrid(tab);
    });
  });
}

const HOUSE_ITEM_ICONS = {
  furn_bookshelf: `<svg viewBox="0 0 48 38" width="44" height="34"><rect x="4" y="2" width="40" height="34" fill="#5c3a18" rx="2"/><rect x="4" y="14" width="40" height="2" fill="#8a5c28"/><rect x="4" y="26" width="40" height="2" fill="#8a5c28"/><rect x="7" y="4" width="5" height="9" fill="#b84c2a" rx="1"/><rect x="13" y="4" width="7" height="9" fill="#c8a010" rx="1"/><rect x="21" y="4" width="5" height="9" fill="#1a4a8a" rx="1"/><rect x="7" y="16" width="7" height="9" fill="#2a6e46" rx="1"/><rect x="15" y="16" width="5" height="9" fill="#8a3a80" rx="1"/></svg>`,
  furn_sofa: `<svg viewBox="0 0 48 38" width="44" height="34"><rect x="4" y="20" width="40" height="14" fill="#8a5c28" rx="3"/><rect x="4" y="14" width="40" height="10" fill="#a06c38" rx="2"/><rect x="4" y="14" width="7" height="20" fill="#7a4c20" rx="2"/><rect x="37" y="14" width="7" height="20" fill="#7a4c20" rx="2"/><rect x="8" y="20" width="11" height="12" fill="#b07840" rx="2"/><rect x="21" y="20" width="12" height="12" fill="#b07840" rx="2"/></svg>`,
  furn_armchair: `<svg viewBox="0 0 48 38" width="44" height="34"><rect x="8" y="20" width="32" height="16" fill="#7a4c28" rx="3"/><rect x="8" y="14" width="32" height="10" fill="#8a5c38" rx="2"/><rect x="8" y="14" width="7" height="22" fill="#6a3c18" rx="2"/><rect x="33" y="14" width="7" height="22" fill="#6a3c18" rx="2"/><rect x="12" y="20" width="24" height="14" fill="#9a6c48" rx="2"/></svg>`,
  furn_desk: `<svg viewBox="0 0 48 38" width="44" height="34"><rect x="4" y="20" width="40" height="6" fill="#8a5c28" rx="2"/><rect x="6" y="26" width="4" height="10" fill="#6a4218"/><rect x="38" y="26" width="4" height="10" fill="#6a4218"/></svg>`,
  furn_fireplace: `<svg viewBox="0 0 48 38" width="44" height="34"><rect x="6" y="4" width="36" height="30" fill="#8a7060" rx="2"/><rect x="10" y="8" width="28" height="22" fill="#2a1808"/><ellipse cx="24" cy="30" rx="12" ry="4" fill="#e05818" opacity="0.9"/><ellipse cx="24" cy="24" rx="8" ry="8" fill="#f5a020" opacity="0.85"/><ellipse cx="24" cy="18" rx="5" ry="8" fill="#f5c040" opacity="0.8"/></svg>`,
  furn_piano: `<svg viewBox="0 0 48 38" width="44" height="34"><rect x="6" y="4" width="36" height="30" fill="#1a1008" rx="2"/><rect x="8" y="6" width="32" height="24" fill="#241810"/><rect x="6" y="30" width="36" height="4" fill="#f5f0e8"/><rect x="11" y="30" width="3" height="3" fill="#1a1008"/><rect x="18" y="30" width="3" height="3" fill="#1a1008"/><rect x="28" y="30" width="3" height="3" fill="#1a1008"/><rect x="35" y="30" width="3" height="3" fill="#1a1008"/></svg>`,
  furn_trampoline: `<svg viewBox="0 0 48 38" width="44" height="34"><ellipse cx="24" cy="22" rx="20" ry="6" fill="#5c3a18" stroke="#3c2008" stroke-width="1.5"/><ellipse cx="24" cy="22" rx="15" ry="4" fill="#3a7a5c"/><line x1="6" y1="22" x2="4" y2="34" stroke="#3c2008" stroke-width="2"/><line x1="42" y1="22" x2="44" y2="34" stroke="#3c2008" stroke-width="2"/></svg>`,
  furn_pooltable: `<svg viewBox="0 0 48 38" width="44" height="34"><rect x="4" y="10" width="40" height="22" fill="#5c3010" rx="3"/><rect x="7" y="13" width="34" height="16" fill="#2a7050" rx="2"/><circle cx="24" cy="21" r="3" fill="white"/><circle cx="32" cy="17" r="2.5" fill="#e02820"/><circle cx="32" cy="25" r="2.5" fill="#1a4a8a"/></svg>`,
  furn_arcade: `<svg viewBox="0 0 48 38" width="44" height="34"><rect x="14" y="2" width="20" height="34" fill="#1a2a5c" rx="3"/><rect x="16" y="5" width="16" height="16" fill="#102060" rx="1"/><rect x="16" y="25" width="7" height="7" fill="#8a2020" rx="3.5"/><rect x="25" y="25" width="7" height="7" fill="#20208a" rx="3.5"/></svg>`,
  dec_rug: `<svg viewBox="0 0 48 38" width="44" height="34"><rect x="4" y="12" width="40" height="14" fill="#7a1c1c" rx="3"/><rect x="7" y="14" width="34" height="10" fill="#a82828"/><rect x="9" y="15" width="30" height="8" fill="none" stroke="#c8a010" stroke-width="1.2"/></svg>`,
  dec_plant: `<svg viewBox="0 0 48 38" width="44" height="34"><rect x="18" y="26" width="12" height="10" fill="#8a5c28" rx="2"/><ellipse cx="24" cy="20" rx="10" ry="12" fill="#2a6e46"/><ellipse cx="18" cy="24" rx="6" ry="8" fill="#38884"/><ellipse cx="30" cy="22" rx="7" ry="9" fill="#2a6e46"/></svg>`,
  dec_lamp: `<svg viewBox="0 0 48 38" width="44" height="34"><line x1="24" y1="18" x2="24" y2="34" stroke="#8a6828" stroke-width="3"/><polygon points="12,18 36,18 31,6 17,6" fill="#e8c020" opacity="0.9"/><ellipse cx="24" cy="18" rx="12" ry="4" fill="#c8a010"/><ellipse cx="24" cy="34" rx="6" ry="2.5" fill="#6a4818"/></svg>`,
  dec_painting: `<svg viewBox="0 0 48 38" width="44" height="34"><rect x="8" y="4" width="32" height="28" fill="#5c4030" rx="2"/><rect x="11" y="7" width="26" height="22" fill="#a06040"/><ellipse cx="24" cy="14" rx="7" ry="6" fill="#87CEEB" opacity="0.7"/><rect x="14" y="18" width="20" height="8" fill="#8a6030"/></svg>`,
  dec_clock: `<svg viewBox="0 0 48 38" width="44" height="34"><rect x="16" y="2" width="16" height="34" fill="#6a4218" rx="3"/><circle cx="24" cy="16" r="8" fill="#f5f0e0" stroke="#8a5c28" stroke-width="1.5"/><line x1="24" y1="10" x2="24" y2="16" stroke="#1c1208" stroke-width="1.5" stroke-linecap="round"/><line x1="24" y1="16" x2="28" y2="19" stroke="#1c1208" stroke-width="1" stroke-linecap="round"/></svg>`,
  dec_trophy: `<svg viewBox="0 0 48 38" width="44" height="34"><rect x="18" y="2" width="12" height="20" fill="#c8a010" rx="2"/><ellipse cx="24" cy="4" rx="10" ry="6" fill="#d4b828"/><path d="M18 10 Q10 14 12 20 Q16 24 18 10Z" fill="#c8a010"/><path d="M30 10 Q38 14 36 20 Q32 24 30 10Z" fill="#c8a010"/><rect x="20" y="22" width="8" height="4" fill="#c8a010"/><rect x="16" y="26" width="16" height="3" fill="#8a6808" rx="1"/></svg>`,
  dec_globe: `<svg viewBox="0 0 48 38" width="44" height="34"><circle cx="24" cy="18" r="14" fill="#1a4a8a"/><ellipse cx="24" cy="18" rx="14" ry="5" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1"/><line x1="24" y1="4" x2="24" y2="32" stroke="rgba(255,255,255,0.3)" stroke-width="1"/><rect x="20" y="32" width="8" height="3" fill="#5a3820" rx="1"/></svg>`,
  dec_fishtank: `<svg viewBox="0 0 48 38" width="44" height="34"><rect x="4" y="4" width="40" height="30" fill="#90c0d8" rx="3" opacity="0.85"/><rect x="4" y="4" width="40" height="30" fill="none" stroke="#4a7a90" stroke-width="2" rx="3"/><ellipse cx="16" cy="18" rx="6" ry="4" fill="#f59020" opacity="0.9"/><polygon points="10,18 16,14 16,22" fill="#e07010" opacity="0.9"/><ellipse cx="32" cy="22" rx="5" ry="3" fill="#c040a0" opacity="0.9"/></svg>`,
  dec_disco: `<svg viewBox="0 0 48 38" width="44" height="34"><line x1="24" y1="0" x2="24" y2="8" stroke="#888" stroke-width="1.5"/><circle cx="24" cy="14" r="8" fill="#b8b8b8" stroke="#888" stroke-width="1"/><rect x="17" y="8" width="4" height="4" fill="#88ccff" rx="1"/><rect x="27" y="8" width="4" height="4" fill="#ff88cc" rx="1"/><rect x="17" y="16" width="4" height="4" fill="#ffcc44" rx="1"/><rect x="27" y="16" width="4" height="4" fill="#88ffcc" rx="1"/></svg>`,
  dec_beanbag: `<svg viewBox="0 0 48 38" width="44" height="34"><ellipse cx="24" cy="26" rx="18" ry="8" fill="#b83030"/><ellipse cx="24" cy="20" rx="14" ry="12" fill="#c83838"/><ellipse cx="20" cy="16" rx="7" ry="6" fill="#d84848" opacity="0.6"/></svg>`,
  pet_cat: `<svg viewBox="0 0 48 38" width="44" height="34"><ellipse cx="24" cy="30" rx="12" ry="7" fill="#c8a060"/><circle cx="24" cy="20" r="9" fill="#c8a060"/><polygon points="17,13 19,6 23,13" fill="#c8a060"/><polygon points="25,13 29,6 31,13" fill="#c8a060"/><ellipse cx="21" cy="20" rx="2.5" ry="3" fill="#2a1808"/><ellipse cx="27" cy="20" rx="2.5" ry="3" fill="#2a1808"/><ellipse cx="24" cy="23" rx="2" ry="1.5" fill="#e09080"/></svg>`,
  pet_dog: `<svg viewBox="0 0 48 38" width="44" height="34"><ellipse cx="24" cy="30" rx="12" ry="7" fill="#c89050"/><circle cx="24" cy="20" r="9" fill="#c89050"/><ellipse cx="15" cy="18" rx="4" ry="6" fill="#b07840"/><ellipse cx="33" cy="18" rx="4" ry="6" fill="#b07840"/><ellipse cx="21" cy="20" rx="2.5" ry="3" fill="#2a1808"/><ellipse cx="27" cy="20" rx="2.5" ry="3" fill="#2a1808"/><ellipse cx="24" cy="24" rx="3" ry="2" fill="#e09080"/></svg>`,
  pet_parrot: `<svg viewBox="0 0 48 38" width="44" height="34"><circle cx="24" cy="14" r="10" fill="#2a9a2a"/><ellipse cx="24" cy="26" rx="7" ry="10" fill="#38a838"/><ellipse cx="20" cy="12" rx="2.5" ry="3" fill="#1a1008"/><path d="M22 18 L17 21 L22 23" fill="#c8a010"/><path d="M32 14 Q40 8 38 18" stroke="#f04020" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`,
  pet_hamster: `<svg viewBox="0 0 48 38" width="44" height="34"><ellipse cx="24" cy="28" rx="11" ry="7" fill="#e0b870"/><circle cx="24" cy="20" r="9" fill="#e0b870"/><ellipse cx="20" cy="18" rx="2.5" ry="3" fill="#2a1808"/><ellipse cx="28" cy="18" rx="2.5" ry="3" fill="#2a1808"/><ellipse cx="24" cy="22" rx="2.5" ry="2" fill="#e09080"/><ellipse cx="14" cy="20" rx="4" ry="3" fill="#f0c888" opacity="0.75"/><ellipse cx="34" cy="20" rx="4" ry="3" fill="#f0c888" opacity="0.75"/></svg>`,
};

function initHouse() {
  updateHousePreview();
  updateCoinDisplay();
  const activeTab = document.querySelector('.house-tab.active')?.dataset.htab || 'wallpaper';
  renderHouseGrid(activeTab);
}

/* ─── NICKNAME SCREEN ────────────────────────────────────────────────────────── */

function initNickname() {
  const wardrobe = getWardrobeForPete();
  const peteEl = document.getElementById('peteNickname');
  if (peteEl) peteEl.innerHTML = createPeteSVG(100, { wardrobe, bubble: 'Hello!' });
  const input = document.getElementById('nicknameInput');
  const btn   = document.getElementById('nicknameSubmitBtn');
  input.addEventListener('input', () => {
    btn.disabled = input.value.trim().length < 2;
  });
  btn.addEventListener('click', async () => {
    const nickname = input.value.trim();
    if (nickname.length < 2) return;
    localStorage.setItem('pete_nickname', nickname);
    if (typeof fbUpdateNickname === 'function') fbUpdateNickname(nickname);
    initHome();
    showScreen('home');
  });
}

/* ─── SETTINGS ───────────────────────────────────────────────────────────────── */

const NOTIF_PREFS_KEY = 'pete_notif_prefs';

function getNotifPrefs() {
  try { return JSON.parse(localStorage.getItem(NOTIF_PREFS_KEY) || '{}'); } catch { return {}; }
}

function saveNotifPrefs(prefs) {
  localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(prefs));
  if (typeof fbSaveNotifPrefs === 'function') fbSaveNotifPrefs(prefs);
}

function initSettings() {
  const prefs    = getNotifPrefs();
  const daily    = document.getElementById('settingsDailyToggle');
  const battle   = document.getElementById('settingsBattleToggle');
  const streak   = document.getElementById('settingsStreakToggle');
  const fiveStar = document.getElementById('settingsFiveStarToggle');

  daily.checked    = prefs.daily    !== false;
  battle.checked   = prefs.battle   !== false;
  streak.checked   = prefs.streak   !== false;
  fiveStar.checked = prefs.fiveStar !== false;

  const onChange = () => saveNotifPrefs({
    daily:    daily.checked,
    battle:   battle.checked,
    streak:   streak.checked,
    fiveStar: fiveStar.checked,
  });

  daily.onchange    = onChange;
  battle.onchange   = onChange;
  streak.onchange   = onChange;
  fiveStar.onchange = onChange;
}

/* ─── EVENT LISTENERS ────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  // Init Firebase silently in background
  if (typeof fbInit === 'function') fbInit().then(() => {
    // Request push notification permission after Firebase is ready
    initPushNotifications();
  });

  // Check if app needs updating (non-blocking)
  setTimeout(() => checkForUpdate(), 2000);

  // Inject Pete mascot into all screens (also calls initIntro)
  injectAllPetes();

  // Init coins + streak display
  updateCoinDisplay();
  updateStreakDisplay();

  // Check for nickname — show setup screen on first launch
  const hasNickname = localStorage.getItem('pete_nickname');
  if (!hasNickname) {
    initNickname();
    showScreen('nickname');
  } else {
    initHome();
    showScreen('home');
  }

  // Nav logo → home on any screen
  document.getElementById('navHomeBtn').addEventListener('click', () => {
    initHome();
    showScreen('home');
  });

  // Home buttons
  document.getElementById('homeWordBtn').addEventListener('click', () => {
    initIntro();
    showScreen('intro');
  });
  document.getElementById('homePracticeBtn').addEventListener('click', () => {
    initPractice();
    showScreen('practice');
  });
  document.getElementById('practiceBackBtn').addEventListener('click', () => showScreen('home'));
  document.getElementById('masteredHomeBtn').addEventListener('click', () => {
    initHome();
    showScreen('home');
  });
  document.getElementById('wotwBackBtn').addEventListener('click', () => showScreen('home'));
  document.getElementById('leaderboardBackBtn').addEventListener('click', () => showScreen('home'));
  document.getElementById('houseBackBtn').addEventListener('click', () => showScreen('home'));

  // House tabs
  document.querySelectorAll('.house-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.house-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderHouseGrid(tab.dataset.htab);
    });
  });

  // Leaderboard tabs
  document.querySelectorAll('.leaderboard-tab').forEach(tab => {
    tab.addEventListener('click', async () => {
      document.querySelectorAll('.leaderboard-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const t = tab.dataset.lbTab;
      if (t === 'friends' && _lbData && !_lbData.friendsStreak) {
        const listEl = document.getElementById('leaderboardList');
        listEl.innerHTML = '<div class="leaderboard-loading">Loading friends…</div>';
        const [fData, pending] = await Promise.all([fbGetFriendsLeaderboard(), fbGetPendingBattles()]);
        _lbData.friendsStreak  = fData.streak;
        _lbData.friendsStars   = fData.stars;
        _lbData.pendingBattles = pending;
      }
      renderLeaderboardTab(t);
    });
  });

  document.getElementById('revisionQuitBtn').addEventListener('click', () => {
    if (revState.freePlay) { initHome(); showScreen('home'); return; }
    initPractice();
    showScreen(revState.sourceScreen);
  });

  document.getElementById('battlehubBackBtn').addEventListener('click', () => showScreen('home'));

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
    showScreen('home');
  });

  // Streak screen
  let _prevStreakScreen = 'intro';
  document.getElementById('navStreak').addEventListener('click', () => {
    _prevStreakScreen = document.querySelector('.screen.active')?.id?.replace('screen-', '') || 'intro';
    initStreak();
    showScreen('streak');
  });
  document.getElementById('streakBackBtn').addEventListener('click', () => {
    showScreen(_prevStreakScreen);
  });

  // History
  document.getElementById('historyBtn').addEventListener('click', () => {
    initHistory();
    showScreen('history');
  });
  document.getElementById('historyBackBtn').addEventListener('click', () => {
    if (state.word) showScreen('today');
    else showScreen('home');
  });

  // Settings
  document.getElementById('settingsBtn').addEventListener('click', () => {
    initSettings();
    showScreen('settings');
  });
  document.getElementById('settingsBackBtn').addEventListener('click', () => showScreen('home'));

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
