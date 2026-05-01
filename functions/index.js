const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();
const db = getFirestore();

// ─── Helper: send notification to a user by uid ──────────────────────────────
async function sendToUser(uid, title, body, data = {}) {
  try {
    const snap = await db.collection('users').doc(uid).get();
    if (!snap.exists) return;
    const tokens = snap.data().fcmTokens || [];
    if (!tokens.length) return;

    const message = {
      notification: { title, body },
      data,
      apns: { payload: { aps: { sound: 'default', badge: 1 } } },
      tokens,
    };
    const result = await getMessaging().sendEachForMulticast(message);

    // Clean up invalid tokens
    const invalidTokens = [];
    result.responses.forEach((r, i) => {
      if (!r.success) invalidTokens.push(tokens[i]);
    });
    if (invalidTokens.length) {
      await db.collection('users').doc(uid).update({
        fcmTokens: FieldValue.arrayRemove(...invalidTokens),
      });
    }
  } catch (e) {
    console.error('sendToUser error', e);
  }
}

// ─── 1. Battle challenge notification ────────────────────────────────────────
exports.onBattleCreated = onDocumentCreated('battles/{battleId}', async (event) => {
  const battle = event.data.data();
  if (!battle || !battle.opponent || !battle.creatorName) return;

  await sendToUser(
    battle.opponent,
    'Battle Challenge!',
    `${battle.creatorName} has challenged you to a word battle!`,
    { screen: 'battle', battleId: event.params.battleId }
  );
});

// ─── 2. Daily practice reminder (6pm every day) ───────────────────────────────
exports.sendDailyReminder = onSchedule('0 18 * * *', async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  const usersSnap = await db.collection('users').get();
  const promises = [];

  usersSnap.forEach(doc => {
    const data = doc.data();
    const tokens = data.fcmTokens || [];
    if (!tokens.length) return;

    // Only notify if user hasn't been active today
    const lastActive = data.lastActive ? data.lastActive.toMillis() : 0;
    if (lastActive >= todayMs) return;

    promises.push(
      sendToUser(
        doc.id,
        "Time to practice!",
        "Keep your streak alive — today's word is waiting for you.",
        { screen: 'home' }
      )
    );
  });

  await Promise.all(promises);
});

// ─── 3. Streak warning (8pm — if no practice today and streak > 0) ────────────
exports.sendStreakWarning = onSchedule('0 20 * * *', async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  const usersSnap = await db.collection('users').where('streak', '>', 0).get();
  const promises = [];

  usersSnap.forEach(doc => {
    const data = doc.data();
    const tokens = data.fcmTokens || [];
    if (!tokens.length) return;

    const lastActive = data.lastActive ? data.lastActive.toMillis() : 0;
    if (lastActive >= todayMs) return; // Already practiced today

    const streak = data.streak || 0;
    promises.push(
      sendToUser(
        doc.id,
        'Streak at risk!',
        `Your ${streak}-day streak ends at midnight. Practice now to keep it!`,
        { screen: 'home' }
      )
    );
  });

  await Promise.all(promises);
});
