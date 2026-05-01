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
        }
      } catch (e) { console.warn('Pete: user doc init', e); }
      resolve(user);
    });
  });
}

async function fbUpdateNickname(nickname) {
  if (!fbUser) return;
  try {
    await db.collection('users').doc(fbUser.uid).update({ displayName: nickname });
  } catch (e) { console.warn('Pete: fbUpdateNickname', e); }
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

async function fbSubmitBattleScore(battleId, score, sentence, role) {
  if (!fbUser) return;
  const scoreField    = role === 'creator' ? 'creatorScore'    : 'opponentScore';
  const sentenceField = role === 'creator' ? 'creatorSentence' : 'opponentSentence';
  try {
    await db.collection('battles').doc(battleId).update({
      [scoreField]: score,
      [sentenceField]: sentence
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
          date: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    }
    // Always increment totalStars by the star rating earned
    await db.collection('users').doc(fbUser.uid).update({
      totalStars: firebase.firestore.FieldValue.increment(stars)
    });
  } catch (e) { console.warn('Pete: fbSubmitSentenceStars', e); }
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

async function fbGetLeaderboard() {
  try {
    const [s1, s2] = await Promise.all([
      db.collection('users').orderBy('streak', 'desc').limit(10).get(),
      db.collection('users').orderBy('totalStars', 'desc').limit(10).get()
    ]);
    return {
      streak: s1.docs.map(d => ({ id: d.id, ...d.data() })),
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
    // Check if a pending request already exists
    const existingReq = await db.collection('friend_requests')
      .where('from', '==', fbUser.uid)
      .where('to', '==', friendId)
      .where('status', '==', 'pending')
      .limit(1).get();
    if (!existingReq.empty) return { error: 'Request already sent!' };
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
    const snap = await db.collection('friend_requests')
      .where('to', '==', fbUser.uid)
      .where('status', '==', 'pending')
      .limit(10).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
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
    const byStreak = [...users].sort((a, b) => (b.streak || 0) - (a.streak || 0));
    const byStars  = [...users].sort((a, b) => (b.totalStars || 0) - (a.totalStars || 0));
    return { streak: byStreak, stars: byStars };
  } catch (e) { console.warn('Pete: fbGetFriendsLeaderboard', e); return { streak: [], stars: [] }; }
}
