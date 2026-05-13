/* ─── PETE FIREBASE INTEGRATION ──────────────────────────────────────────────── */
// Requires Firebase compat CDN scripts loaded before this file

const firebaseConfig = {
  apiKey: "AIzaSyCB8FDHK94QPKsmrIYzpeEGz-vlEiHkPUg",
  authDomain: "pete-s-word-wardrobe.firebaseapp.com",
  projectId: "pete-s-word-wardrobe",
  storageBucket: "pete-s-word-wardrobe.firebasestorage.app",
  messagingSenderId: "634737746995",
  appId: "1:634737746995:web:05cca6e1b1c22670ea2f46"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

let fbUser = null;

function _fbGenerateFriendCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function fbGetWeekKey(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  const wn = 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  return `${d.getFullYear()}-W${String(wn).padStart(2, '0')}`;
}

async function fbInit() {
  return new Promise(resolve => {
    auth.onAuthStateChanged(async user => {
      if (!user) {
        try { user = (await auth.signInAnonymously()).user; }
        catch (e) { console.warn('Pete: Firebase auth failed', e); return resolve(null); }
      }
      fbUser = user;
      try {
        const ref  = db.collection('users').doc(user.uid);
        const snap = await ref.get();
        const localNickname = localStorage.getItem('pete_nickname') || '';
        if (!snap.exists) {
          const friendCode = _fbGenerateFriendCode();
          await ref.set({
            displayName: localNickname,
            friendCode,
            streak: 0,
            totalStars: 0,
            totalFiveStars: 0,
            battleWins: 0,
            trophies: 0,
            friendIds: [],
            lastActive: firebase.firestore.FieldValue.serverTimestamp()
          });
          localStorage.setItem('pete_friend_code', friendCode);
        } else {
          const data = snap.data();
          if (data.friendCode) localStorage.setItem('pete_friend_code', data.friendCode);
          // Local nickname always wins — push it to Firestore if it differs
          if (localNickname && localNickname !== data.displayName) {
            await ref.update({ displayName: localNickname });
          } else if (data.displayName && !localNickname) {
            localStorage.setItem('pete_nickname', data.displayName);
          }
          // Sync local equipped state to Firestore if not yet saved
          if (!data.equipped) {
            try {
              const localEquipped = JSON.parse(localStorage.getItem('pete_equipped') || '{}');
              if (Object.keys(localEquipped).length > 0) {
                await ref.update({ equipped: localEquipped });
              }
            } catch (e) {}
          }
          // Load notification prefs from Firestore into localStorage
          if (data.notifPrefs) {
            localStorage.setItem('pete_notif_prefs', JSON.stringify(data.notifPrefs));
          }
        }
      } catch (e) { console.warn('Pete: user doc init', e); }
      resolve(user);
    });
  });
}

async function fbRecordBattleWin() {
  if (!fbUser) return;
  try {
    await db.collection('users').doc(fbUser.uid).update({
      battleWins: firebase.firestore.FieldValue.increment(1),
      trophies: firebase.firestore.FieldValue.increment(30)
    });
  } catch (e) { console.warn('Pete: fbRecordBattleWin', e); }
}

async function fbRecordBattleLoss() {
  if (!fbUser) return;
  try {
    await db.runTransaction(async tx => {
      const ref = db.collection('users').doc(fbUser.uid);
      const snap = await tx.get(ref);
      const current = (snap.data() && snap.data().trophies) || 0;
      tx.update(ref, { trophies: Math.max(0, current - 10) });
    });
  } catch (e) { console.warn('Pete: fbRecordBattleLoss', e); }
}

async function fbUpdateLastActive() {
  if (!fbUser) return;
  try {
    await db.collection('users').doc(fbUser.uid).update({
      lastActive: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (e) {} // silent — presence heartbeat
}

async function fbUpdateStreak(count, dateKey) {
  if (!fbUser) return;
  try {
    await db.collection('users').doc(fbUser.uid).update({
      streak: count,
      streakDate: dateKey
    });
  } catch (e) { console.warn('Pete: fbUpdateStreak', e); }
}

async function fbGetBattleLeaderboard() {
  try {
    const snap = await db.collection('users')
      .orderBy('trophies', 'desc')
      .limit(20)
      .get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => (u.trophies || 0) > 0);
  } catch (e) { console.warn('Pete: fbGetBattleLeaderboard', e); return []; }
}

async function fbUpdateNickname(nickname) {
  if (!fbUser) return;
  try {
    await db.collection('users').doc(fbUser.uid).update({ displayName: nickname });
  } catch (e) { console.warn('Pete: fbUpdateNickname', e); }
}

async function fbSaveNotifPrefs(prefs) {
  if (!fbUser) return;
  try {
    await db.collection('users').doc(fbUser.uid).update({ notifPrefs: prefs });
  } catch (e) { console.warn('Pete: fbSaveNotifPrefs', e); }
}

async function fbSaveFCMToken(token) {
  if (!fbUser || !token) return;
  try {
    await db.collection('users').doc(fbUser.uid).update({
      fcmTokens: firebase.firestore.FieldValue.arrayUnion(token),
      lastActive: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (e) { console.warn('Pete: fbSaveFCMToken', e); }
}

async function fbSaveEquipped(equipped) {
  if (!fbUser) return;
  try {
    await db.collection('users').doc(fbUser.uid).update({ equipped });
  } catch (e) { console.warn('Pete: fbSaveEquipped', e); }
}

async function fbSaveHouseEquipped(houseEquipped) {
  if (!fbUser) return;
  try {
    await db.collection('users').doc(fbUser.uid).update({ houseEquipped });
  } catch (e) { console.warn('Pete: fbSaveHouseEquipped', e); }
}

async function fbGetUserProfile(uid) {
  try {
    const snap = await db.collection('users').doc(uid).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() };
  } catch (e) { console.warn('Pete: fbGetUserProfile', e); return null; }
}

async function fbSyncUser(streak) {
  if (!fbUser) return;
  try {
    await db.collection('users').doc(fbUser.uid).update({
      streak,
      lastActive: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (e) { console.warn('Pete: fbSyncUser', e); }
}

async function fbCreateBattle(opponentId, opponentName, word, wordDefinition) {
  if (!fbUser) return { error: 'Not signed in' };
  try {
    const myName = localStorage.getItem('pete_nickname') || 'Anonymous';
    const doc = await db.collection('battles').add({
      creator: fbUser.uid,
      creatorName: myName,
      opponent: opponentId,
      opponentName,
      word,
      wordDefinition,
      creatorSentence: null,
      creatorScore: null,
      opponentSentence: null,
      opponentScore: null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return { ok: true, battleId: doc.id };
  } catch (e) { console.warn('Pete: fbCreateBattle', e); return { error: 'Something went wrong' }; }
}

async function fbGetPendingBattles() {
  if (!fbUser) return [];
  try {
    const snap = await db.collection('battles')
      .where('opponent', '==', fbUser.uid)
      .limit(10).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .filter(b => b.opponentScore === null || b.opponentScore === undefined);
  } catch (e) { console.warn('Pete: fbGetPendingBattles', e); return []; }
}

async function fbSubmitBattleScore(battleId, score, sentence, role, feedback = []) {
  if (!fbUser) return;
  const scoreField    = role === 'creator' ? 'creatorScore'    : 'opponentScore';
  const sentenceField = role === 'creator' ? 'creatorSentence' : 'opponentSentence';
  const feedbackField = role === 'creator' ? 'creatorFeedback' : 'opponentFeedback';
  try {
    await db.collection('battles').doc(battleId).update({
      [scoreField]: score,
      [sentenceField]: sentence,
      [feedbackField]: feedback
    });
  } catch (e) { console.warn('Pete: fbSubmitBattleScore', e); }
}

async function fbGetBattle(battleId) {
  try {
    const doc = await db.collection('battles').doc(battleId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  } catch (e) { console.warn('Pete: fbGetBattle', e); return null; }
}

async function fbSubmitSentenceStars(word, sentence, stars) {
  if (!fbUser || !stars || stars < 1) return;
  try {
    const weekKey     = fbGetWeekKey();
    const displayName = localStorage.getItem('pete_nickname') || 'Anonymous';
    // For WOTW, only record 5-star entries (avoid duplicates per word per week)
    if (stars === 5) {
      const dup = await db.collection('five_stars')
        .where('userId', '==', fbUser.uid)
        .where('word', '==', word)
        .where('weekKey', '==', weekKey)
        .limit(1).get();
      if (dup.empty) {
        await db.collection('five_stars').add({
          userId: fbUser.uid,
          displayName,
          word,
          sentence,
          weekKey,
          likes: [],
          date: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    }
    // Only increment totalStars by improvement over personal best for this word
    const userSnap = await db.collection('users').doc(fbUser.uid).get();
    const wordBestStars = (userSnap.data() && userSnap.data().wordBestStars) || {};
    const currentBest = wordBestStars[word] || 0;
    const improvement = Math.max(0, stars - currentBest);
    const updates = {};
    if (improvement > 0) {
      updates.totalStars = firebase.firestore.FieldValue.increment(improvement);
      updates[`wordBestStars.${word}`] = stars;
    }
    if (Object.keys(updates).length > 0) {
      await db.collection('users').doc(fbUser.uid).update(updates);
    }
  } catch (e) { console.warn('Pete: fbSubmitSentenceStars', e); }
}

async function fbLikeSentence(docId, liked) {
  if (!fbUser) return { error: 'Not signed in' };
  try {
    const op = liked
      ? firebase.firestore.FieldValue.arrayUnion(fbUser.uid)
      : firebase.firestore.FieldValue.arrayRemove(fbUser.uid);
    await db.collection('five_stars').doc(docId).update({ likes: op });
    return { ok: true };
  } catch (e) { console.warn('Pete: fbLikeSentence', e); return { error: 'Something went wrong' }; }
}

// Keep old name as alias for backward compat
const fbSubmitFiveStar = (word, sentence) => fbSubmitSentenceStars(word, sentence, 5);

async function fbGetWotw() {
  try {
    // No orderBy to avoid needing composite index — sort in JS
    const snap = await db.collection('five_stars')
      .where('weekKey', '==', fbGetWeekKey())
      .limit(30)
      .get();
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    docs.sort((a, b) => {
      const at = a.date && a.date.toMillis ? a.date.toMillis() : 0;
      const bt = b.date && b.date.toMillis ? b.date.toMillis() : 0;
      return bt - at;
    });
    return docs;
  } catch (e) { console.warn('Pete: fbGetWotw', e); return null; }
}

function _activeStreakDates() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const fmt = d => `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
  return new Set([fmt(today), fmt(yesterday)]);
}

async function fbGetLeaderboard() {
  try {
    const activeDates = _activeStreakDates();
    const [s1, s2] = await Promise.all([
      db.collection('users').orderBy('streak', 'desc').limit(50).get(),
      db.collection('users').orderBy('totalStars', 'desc').limit(10).get()
    ]);
    const activeStreaks = s1.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(u => (u.streak || 0) > 0 && activeDates.has(u.streakDate || ''))
      .slice(0, 10);
    return {
      streak: activeStreaks,
      stars:  s2.docs.map(d => ({ id: d.id, ...d.data() }))
    };
  } catch (e) { console.warn('Pete: fbGetLeaderboard', e); return { streak: [], stars: [] }; }
}

async function fbSendFriendRequest(code) {
  if (!fbUser) return { error: 'Not signed in' };
  const clean = code.trim().toUpperCase();
  if (clean.length !== 6) return { error: 'Codes are 6 characters' };
  const myCode = localStorage.getItem('pete_friend_code');
  if (clean === myCode) return { error: "That's your own code!" };
  try {
    const snap = await db.collection('users').where('friendCode', '==', clean).limit(1).get();
    if (snap.empty) return { error: 'No user found with that code' };
    const friendDoc  = snap.docs[0];
    const friendId   = friendDoc.id;
    const friendData = friendDoc.data();
    // Check already friends
    const mySnap = await db.collection('users').doc(fbUser.uid).get();
    const myData = mySnap.data();
    if (myData.friendIds && myData.friendIds.includes(friendId)) {
      return { error: 'Already friends!' };
    }
    // Check if a pending request already exists (single-field query to avoid composite index)
    const existingReq = await db.collection('friend_requests')
      .where('from', '==', fbUser.uid)
      .limit(20).get();
    const alreadySent = existingReq.docs.some(d => d.data().to === friendId && d.data().status === 'pending');
    if (alreadySent) return { error: 'Request already sent!' };
    const myName = localStorage.getItem('pete_nickname') || 'Someone';
    await db.collection('friend_requests').add({
      from: fbUser.uid,
      fromName: myName,
      fromCode: myCode || '',
      to: friendId,
      status: 'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return { ok: true, name: friendData.displayName || 'Anonymous' };
  } catch (e) { console.warn('Pete: fbSendFriendRequest', e); return { error: 'Something went wrong' }; }
}

async function fbGetFriendRequests() {
  if (!fbUser) return [];
  try {
    // Single-field query only — avoids needing a composite Firestore index
    const snap = await db.collection('friend_requests')
      .where('to', '==', fbUser.uid)
      .limit(20).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .filter(d => d.status === 'pending');
  } catch (e) { console.warn('Pete: fbGetFriendRequests', e); return []; }
}

async function fbAcceptFriendRequest(requestId, fromId) {
  if (!fbUser) return;
  try {
    const batch = db.batch();
    batch.update(db.collection('friend_requests').doc(requestId), { status: 'accepted' });
    batch.update(db.collection('users').doc(fbUser.uid), {
      friendIds: firebase.firestore.FieldValue.arrayUnion(fromId)
    });
    batch.update(db.collection('users').doc(fromId), {
      friendIds: firebase.firestore.FieldValue.arrayUnion(fbUser.uid)
    });
    await batch.commit();
    const cached = JSON.parse(localStorage.getItem('pete_friend_ids') || '[]');
    if (!cached.includes(fromId)) { cached.push(fromId); localStorage.setItem('pete_friend_ids', JSON.stringify(cached)); }
    return { ok: true };
  } catch (e) { console.warn('Pete: fbAcceptFriendRequest', e); return { error: 'Something went wrong' }; }
}

async function fbDeclineFriendRequest(requestId) {
  if (!fbUser) return;
  try {
    await db.collection('friend_requests').doc(requestId).delete();
    return { ok: true };
  } catch (e) { console.warn('Pete: fbDeclineFriendRequest', e); return { error: 'Something went wrong' }; }
}

// Keep old name for backward compat
const fbAddFriend = fbSendFriendRequest;

async function fbGetFriendsLeaderboard() {
  if (!fbUser) return { streak: [], stars: [] };
  try {
    const mySnap = await db.collection('users').doc(fbUser.uid).get();
    const myData = mySnap.data();
    const friendIds = (myData && myData.friendIds) || [];
    // Cache locally
    localStorage.setItem('pete_friend_ids', JSON.stringify(friendIds));
    const allIds = [fbUser.uid, ...friendIds];
    // Firestore 'in' supports up to 30
    const snap = await db.collection('users')
      .where(firebase.firestore.FieldPath.documentId(), 'in', allIds.slice(0, 30))
      .get();
    const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const activeDates = _activeStreakDates();
    const byStreak = [...users]
      .filter(u => (u.streak || 0) > 0 && activeDates.has(u.streakDate || ''))
      .sort((a, b) => (b.streak || 0) - (a.streak || 0));
    const byStars  = [...users].sort((a, b) => (b.totalStars || 0) - (a.totalStars || 0));
    return { streak: byStreak, stars: byStars };
  } catch (e) { console.warn('Pete: fbGetFriendsLeaderboard', e); return { streak: [], stars: [] }; }
}

/* ─── TOURNAMENT FUNCTIONS ───────────────────────────────────────────────────── */

function _fbTournamentCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function fbCreateTournament(type, name, entryFee) {
  if (!fbUser) return { error: 'Not signed in' };
  const myName = localStorage.getItem('pete_nickname') || 'Anonymous';
  const equipped = JSON.parse(localStorage.getItem('pete_equipped') || '{}');
  const code = _fbTournamentCode();
  const maxPlayers = type === 'bracket' ? 8 : 16;
  const numRounds = type === 'bracket' ? 3 : 5;
  const fee = Math.max(0, parseInt(entryFee, 10) || 0);
  const coins = parseInt(localStorage.getItem('pete_coins_earned') || '0', 10) - parseInt(localStorage.getItem('pete_coins_spent') || '0', 10);
  if (fee > 0 && coins < fee) return { error: `You need ${fee} coins to create this tournament` };
  try {
    const ref = await db.collection('tournaments').add({
      code,
      name: (name || `${myName}'s Tournament`).slice(0, 40),
      type,
      creatorId: fbUser.uid,
      creatorName: myName,
      status: 'lobby',
      entryFee: fee,
      prizePool: fee,
      maxPlayers,
      numRounds,
      currentRound: 0,
      playerIds: [fbUser.uid],
      players: [{ uid: fbUser.uid, displayName: myName, equipped, totalScore: 0, eliminated: false }],
      winners: [],
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    if (fee > 0) {
      const spent = parseInt(localStorage.getItem('pete_coins_spent') || '0', 10);
      localStorage.setItem('pete_coins_spent', String(spent + fee));
    }
    return { ok: true, tournamentId: ref.id, code };
  } catch (e) { console.warn('Pete: fbCreateTournament', e); return { error: 'Something went wrong' }; }
}

async function fbJoinTournament(code) {
  if (!fbUser) return { error: 'Not signed in' };
  const clean = (code || '').trim().toUpperCase();
  if (clean.length !== 6) return { error: 'Codes are 6 characters' };
  const myName = localStorage.getItem('pete_nickname') || 'Anonymous';
  const equipped = JSON.parse(localStorage.getItem('pete_equipped') || '{}');
  try {
    const snap = await db.collection('tournaments')
      .where('code', '==', clean).where('status', '==', 'lobby').limit(1).get();
    if (snap.empty) return { error: 'Tournament not found or already started' };
    const doc = snap.docs[0];
    const t = doc.data();
    if ((t.playerIds || []).includes(fbUser.uid)) return { error: "You're already in this tournament!" };
    if ((t.players || []).length >= t.maxPlayers) return { error: 'Tournament is full!' };
    const fee = t.entryFee || 0;
    if (fee > 0) {
      const coins = parseInt(localStorage.getItem('pete_coins_earned') || '0', 10) - parseInt(localStorage.getItem('pete_coins_spent') || '0', 10);
      if (coins < fee) return { error: `You need ${fee} coins to enter!` };
      const spent = parseInt(localStorage.getItem('pete_coins_spent') || '0', 10);
      localStorage.setItem('pete_coins_spent', String(spent + fee));
    }
    await db.collection('tournaments').doc(doc.id).update({
      playerIds: firebase.firestore.FieldValue.arrayUnion(fbUser.uid),
      players: firebase.firestore.FieldValue.arrayUnion({ uid: fbUser.uid, displayName: myName, equipped, totalScore: 0, eliminated: false }),
      prizePool: firebase.firestore.FieldValue.increment(fee)
    });
    return { ok: true, tournamentId: doc.id };
  } catch (e) { console.warn('Pete: fbJoinTournament', e); return { error: 'Something went wrong' }; }
}

async function fbGetTournament(id) {
  try {
    const doc = await db.collection('tournaments').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  } catch (e) { console.warn('Pete: fbGetTournament', e); return null; }
}

async function fbStartTournament(id) {
  if (!fbUser) return { error: 'Not signed in' };
  try {
    const doc = await db.collection('tournaments').doc(id).get();
    if (!doc.exists) return { error: 'Tournament not found' };
    const t = doc.data();
    if (t.creatorId !== fbUser.uid) return { error: 'Only the creator can start' };
    if (t.status !== 'lobby') return { error: 'Already started' };
    const minPlayers = t.type === 'bracket' ? 4 : 2;
    if ((t.players || []).length < minPlayers) return { error: `Need at least ${minPlayers} players to start` };
    await db.collection('tournaments').doc(id).update({
      status: 'playing',
      startedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return { ok: true };
  } catch (e) { console.warn('Pete: fbStartTournament', e); return { error: 'Something went wrong' }; }
}

async function fbSubmitTournamentEntry(tournamentId, roundIdx, word, sentence, score, feedback) {
  if (!fbUser) return { error: 'Not signed in' };
  const myName = localStorage.getItem('pete_nickname') || 'Anonymous';
  try {
    await db.collection('tournaments').doc(tournamentId)
      .collection('entries').doc(`r${roundIdx}_${fbUser.uid}`).set({
        uid: fbUser.uid, displayName: myName, roundIdx, word, sentence, score, feedback,
        submittedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

    const tDoc = await db.collection('tournaments').doc(tournamentId).get();
    if (!tDoc.exists) return { error: 'Tournament not found' };
    const t = tDoc.data();
    const activePlayers = (t.players || []).filter(p => !p.eliminated);
    const entriesSnap = await db.collection('tournaments').doc(tournamentId)
      .collection('entries').where('roundIdx', '==', roundIdx).get();
    const submittedUids = new Set(entriesSnap.docs.map(d => d.data().uid));
    const allSubmitted = activePlayers.every(p => submittedUids.has(p.uid));

    if (allSubmitted) {
      const entries = entriesSnap.docs.map(d => d.data());
      let updates = {};
      if (t.type === 'bracket') {
        const updatedPlayers = (t.players || []).map(p => ({ ...p }));
        const active = updatedPlayers.filter(p => !p.eliminated);
        for (let i = 0; i < active.length - 1; i += 2) {
          const p1 = active[i], p2 = active[i + 1];
          const s1 = (entries.find(e => e.uid === p1.uid) || {}).score || 0;
          const s2 = (entries.find(e => e.uid === p2.uid) || {}).score || 0;
          const loser = s1 >= s2 ? p2 : p1;
          const li = updatedPlayers.findIndex(p => p.uid === loser.uid);
          if (li >= 0) updatedPlayers[li].eliminated = true;
        }
        const remaining = updatedPlayers.filter(p => !p.eliminated);
        if (remaining.length <= 1) {
          const byScore = [...updatedPlayers].sort((a, b) => (b.totalScore||0) - (a.totalScore||0));
          updates = { status: 'done', players: updatedPlayers, currentRound: roundIdx + 1,
            winners: byScore.slice(0, 2).map(p => p.uid),
            completedAt: firebase.firestore.FieldValue.serverTimestamp() };
        } else {
          updates = { currentRound: roundIdx + 1, players: updatedPlayers };
        }
      } else {
        // Round robin — accumulate scores
        const updatedPlayers = (t.players || []).map(p => {
          const e = entries.find(e => e.uid === p.uid);
          return { ...p, totalScore: (p.totalScore || 0) + (e ? e.score : 0) };
        });
        if (roundIdx + 1 >= (t.numRounds || 5)) {
          const sorted = [...updatedPlayers].sort((a, b) => (b.totalScore||0) - (a.totalScore||0));
          updates = { status: 'done', players: updatedPlayers, currentRound: roundIdx + 1,
            winners: sorted.slice(0, 2).map(p => p.uid),
            completedAt: firebase.firestore.FieldValue.serverTimestamp() };
        } else {
          updates = { currentRound: roundIdx + 1, players: updatedPlayers };
        }
      }
      await db.collection('tournaments').doc(tournamentId).update(updates);
    }
    return { ok: true, allSubmitted };
  } catch (e) { console.warn('Pete: fbSubmitTournamentEntry', e); return { error: 'Something went wrong' }; }
}

async function fbGetTournamentEntries(tournamentId, roundIdx) {
  try {
    const snap = await db.collection('tournaments').doc(tournamentId)
      .collection('entries').where('roundIdx', '==', roundIdx).get();
    return snap.docs.map(d => d.data());
  } catch (e) { console.warn('Pete: fbGetTournamentEntries', e); return []; }
}

async function fbGetMyTournaments() {
  if (!fbUser) return [];
  try {
    const snap = await db.collection('tournaments')
      .where('playerIds', 'array-contains', fbUser.uid).limit(20).get();
    const results = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return results.sort((a, b) => {
      const at = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
      const bt = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
      return bt - at;
    });
  } catch (e) { console.warn('Pete: fbGetMyTournaments', e); return []; }
}
