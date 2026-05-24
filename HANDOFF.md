# Pete App — Full Session Handoff

## Project Overview

**Pete** is a vocabulary-learning iOS app built as a vanilla HTML/CSS/JS SPA wrapped in Capacitor for iOS. Users learn a word of the day, write sentences, battle friends, and compete in tournaments.

- **Repo:** `/Users/jessemajor/Documents/GitHub/Pete/`
- **Working files:** `/Users/jessemajor/trading/wordsmith/`
- **Push flow:** copy wordsmith files → Pete repo → git push → Codemagic auto-builds → TestFlight
- **Firebase project:** `pete-s-word-wardrobe`
- **Bundle ID:** `com.jesse.peteapp`
- **Firebase SDK:** compat CDN (not modular)

---

## Current File Versions (index.html)

```
style.css?v=18
firebase.js?v=9
app.js?v=26
pete.js?v=13
```

**Marketing version:** 1.6
**Last git commit:** `4b89b09` — Fix streak leaderboard backward compat

---

## Key Files

| File | Purpose |
|------|---------|
| `app.js` | Main app logic, all screens, scoring, AI detection |
| `firebase.js` | All Firestore reads/writes, auth, FCM token |
| `style.css` | All styles |
| `index.html` | SPA shell, script tags with cache-busting versions |
| `pete.js` | Pete avatar/character logic |
| `words.js` | Word list |
| `quiz.js` | Quiz screen logic |
| `functions/index.js` | Cloud Functions v2 — push notifications |
| `codemagic.yaml` | CI/CD pipeline → TestFlight |
| `ios/App/App/GoogleService-Info.plist` | Firebase iOS config (committed to repo) |

---

## Firestore Collections

| Collection | Notes |
|-----------|-------|
| `users` | `streak`, `streakDate`, `totalStars`, `friendIds`, `friendCode`, `fcmToken`, `lastActive`, `coins` |
| `battles` | `creator`, `opponent`, `creatorScore`, `opponentScore`, `creatorFeedback`, `opponentFeedback`, `word`, `status` |
| `friend_requests` | `from`, `fromName`, `fromCode`, `to`, `status` |
| `five_stars` | `userId`, `sentence`, `word`, `likes` (array of uids) |
| `tournaments` | `code`, `name`, `type`, `creatorId`, `status`, `entryFee`, `prizePool`, `maxPlayers`, `numRounds`, `currentRound`, `playerIds[]`, `players[]`, `winners`, `rounds` |
| `tournaments/{id}/entries` | `r{roundIdx}_{uid}` docs with `uid`, `sentence`, `score`, `feedback` |

---

## Architecture Notes

- `five_stars` uses `userId` field (not `uid`)
- `battles` uses `creator`/`opponent` fields (not `creatorId`)
- Online presence: `lastActive` heartbeat every 2 min, threshold 10 min
- `_bhFriendsData` is separate from `_lbData` — battle hub friends vs global leaderboard
- Tournament `playerIds` is a flat array for `array-contains` Firestore queries
- Prize pool: winner 65%, runner-up 25%, host keeps 10%
- `streakDate` field: format is `'YYYY-M-D'` (no zero-padding)

---

## Codemagic Pipeline (codemagic.yaml)

Current working state:
1. `npm install --legacy-peer-deps` + `@capacitor/core @capacitor/cli @capacitor/ios @capacitor/push-notifications`
2. Copy web files to `www/`
3. `npx cap sync ios`
4. Fetch signing files (App Store distribution)
5. Set up code signing
6. Set build number + marketing version 1.6
7. `xcode-project build-ipa --project` (NOT workspace, NOT CocoaPods)
8. Publish to TestFlight

**Key decisions:**
- `xcode: latest` (requires iOS 26 SDK for App Store upload — Apple mandate)
- `@capacitor-firebase/messaging` removed — broke xcodeproj during cap sync
- `Package.resolved` deleted from repo — was causing SPM version conflict
- `GoogleService-Info.plist` committed directly to `ios/App/App/` (not a secret)
- `--legacy-peer-deps` needed for peer dep conflict

**Environment variables (ios-credentials group):**
- `CERTIFICATE_PRIVATE_KEY`
- `APP_STORE_PASSWORD`
- `GOOGLE_SERVICE_INFO_PLIST` — saved but not currently used in build (plist is in repo instead)

---

## Firestore Security Rules (current — published)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['friendIds']);
    }
    match /battles/{battleId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && (request.auth.uid == resource.data.creator || request.auth.uid == resource.data.opponent);
    }
    match /friend_requests/{reqId} {
      allow read: if request.auth != null && (request.auth.uid == resource.data.from || request.auth.uid == resource.data.to);
      allow create: if request.auth != null && request.auth.uid == request.resource.data.from;
      allow update, delete: if request.auth != null && (request.auth.uid == resource.data.from || request.auth.uid == resource.data.to);
    }
    match /five_stars/{docId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null;
    }
    match /tournaments/{tournId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && (request.auth.uid in resource.data.playerIds || request.auth.uid == resource.data.creatorId || resource.data.status == 'lobby');
      match /entries/{entryId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null && request.auth.uid == request.resource.data.uid;
      }
    }
  }
}
```

---

## Cloud Functions (deployed)

Located at `functions/index.js`. Last deployed this session via `firebase deploy --only functions`.

| Function | Trigger | Purpose |
|---------|---------|---------|
| `onBattleCreated` | Firestore write | Notifies opponent of battle challenge |
| `onFiveStarEarned` | Firestore write | Notifies user of 5-star achievement |
| `sendDailyReminder` | Scheduled (cron) | Daily word reminder push |
| `sendStreakWarning` | Scheduled (cron) | Warns users about streak expiry |

**Node version:** 22 (2nd Gen functions)
**Region note:** `onBattleCreated` is in `us-central1` but trigger is `australia-southeast1` — harmless warning

---

## Scoring System

### Daily Word: `evaluateSentence(sentence, word)` → stars (0–5)

- **0 stars** — AI detected OR missing the word
- **1 star** — too short
- **2 stars** — has word, basic length
- **3 stars** — 8+ words, comma or basic connective (and/but/because/so)
- **4 stars** — 12+ words, personal pronoun (I/my/me/etc.), complexity
- **5 stars** — 22+ words, personal voice, advanced punctuation (semicolon or 3+ commas), AND one rare connective (although/nevertheless/hitherto/etc.)

### Battles/Tournaments: `scoreSentenceDetailed(sentence, word)` → 0–100 float

5 components:
- Word integration (0–20)
- Length (0–20)
- Grammar (0–25)
- Vocabulary (0–20)
- Personal voice (0–15)
- ±0.4 noise to avoid ties

### AI Detection: `detectAI(sentence)` → boolean

Flags if sentence contains ANY of these phrases:
`delve into`, `tapestry of`, `testament to`, `it is worth noting`, `in the realm of`, `cannot be overstated`, `at its core`, `fosters a sense of`, `the human experience`, `shed light on`, `in today's world`, `navigate the complexities`, `embark on a journey`, `serves as a reminder`, `in conclusion,`, `multifaceted nature`, `paramount importance`, `myriad of`, `not only does`, etc.

Also flags if 3+ rare connectives appear in one sentence.

**Result:** 0 stars / 0 score with message "Pete squints. This sentence was written by a robot."

---

## Features Added This Session

### 1. Tournament System
- **Bracket** (March Madness style, up to 16 players, elimination)
- **Round Robin** (everyone vs everyone, highest accumulated score wins)
- Pay-to-enter with coins, prize pool split: 65% winner / 25% runner-up / 10% host
- Join by 6-character code
- `_showTournamentTab()`, `_showCreateTournament()`, `_showJoinTournament()`, `_showTournamentDetail()`, `_showTournamentRound()`, `_showTournamentWaiting()`, `_showTournamentFinal()`
- Firebase: `fbCreateTournament`, `fbJoinTournament`, `fbGetTournament`, `fbStartTournament`, `fbSubmitTournamentEntry`, `fbGetTournamentEntries`, `fbGetMyTournaments`

### 2. Notifications Fix
- Switched from APNs tokens to FCM tokens
- `initPushNotifications()` tries `FirebaseMessaging` (capawesome) first, falls back to `@capacitor/push-notifications`
- `GoogleService-Info.plist` committed to iOS project for Firebase to work
- **Status:** Still unconfirmed working on device — needs real device test after TestFlight build lands

### 3. 100-Point Battle Scoring
- `scoreSentenceDetailed()` replaces simple integer scoring in battles/tournaments
- Feedback array returned and displayed under scores in results screen
- `fbSubmitBattleScore()` saves `creatorFeedback`/`opponentFeedback` to Firestore

### 4. 5-Star Difficulty Increase
- Removed the "story trajectory" path that was giving too many 5-stars
- Now requires ALL of: 22+ words + personal voice + complexity + advanced punctuation + rare connective

### 5. AI Sentence Detection + 150-Word Limit
- `detectAI()` function with phrase list and rare connective count
- Applied to daily word, battles, and tournaments
- Live word counter on all sentence inputs showing `X / 150 words`

### 6. Likes on 5-Star Sentences
- Heart button on sentences in WOTW screen
- `fbLikeFiveStar(docId)` — toggles uid in `likes` array
- `fbGetFiveStars()` returns `likes` count per sentence

### 7. Free Play Fixes
- `handleStartPractice()` always starts from spelling in free play
- `initChallenge()` skips "already done" check in free play
- `challengeSkipBtn` calls `startFreePlay()` instead of "Come back tomorrow"

### 8. Online Presence Fixes
- Threshold changed from 5 min → 10 min
- `_bhFriendsData` separated from `_lbData` (was showing all global users as friends)
- `document.addEventListener('resume', ...)` refreshes lastActive on foreground

### 9. Star Rankings Fix
- Stars only go up per word (tracks personal best)
- Minimum 1 star, maximum 5 stars per word entry

### 10. Streak Leaderboard — Active Only
- Filter: show users where `streakDate` is today or yesterday
- Backward compat: users WITHOUT `streakDate` field also shown (existing users)
- Dead streaks (old `streakDate`) hidden

---

## Known Issues / Next Steps

### Notifications (highest priority)
- `@capacitor-firebase/messaging` was removed because it broke the Xcode build
- Currently using `@capacitor/push-notifications` fallback only
- Cloud Functions use `sendEachForMulticast` which requires FCM tokens
- `GoogleService-Info.plist` is in the iOS project — this is correct for Firebase to work
- **Root problem:** On iOS, APNs tokens ≠ FCM tokens. Without `@capacitor-firebase/messaging`, the token saved to Firestore is an APNs token, not FCM
- **Proper fix:** Either find a way to add `@capacitor-firebase/messaging` without breaking the build, OR update Cloud Functions to handle APNs tokens directly (using `sendMulticast` with APNs config instead of FCM)

### App Store Version
- Version 1.4 and 1.5 are both closed (approved builds)
- Current version in codemagic.yaml: **1.6**
- Apple requires iOS 26 SDK → `xcode: latest` is required
- Publishing was failing with "validation failed" in older Xcode versions

### Tournament Bugs (reported, may be fixed in latest build)
- Users couldn't join — was a Firestore rules issue (now fixed)
- Pay-to-enter coin check was failing — was reading wrong field (now fixed)
- **Needs device testing** after latest TestFlight build

### Streak Leaderboard Reset (fixed)
- Filter was too strict — excluded all existing users without `streakDate`
- Fixed: `!u.streakDate || activeDates.has(u.streakDate)`

---

## Push to Codemagic Flow

```bash
# Edit files in /Users/jessemajor/trading/wordsmith/
# Then copy to Pete repo:
cp /Users/jessemajor/trading/wordsmith/app.js /Users/jessemajor/Documents/GitHub/Pete/app.js
cp /Users/jessemajor/trading/wordsmith/firebase.js /Users/jessemajor/Documents/GitHub/Pete/firebase.js
cp /Users/jessemajor/trading/wordsmith/style.css /Users/jessemajor/Documents/GitHub/Pete/style.css
cp /Users/jessemajor/trading/wordsmith/index.html /Users/jessemajor/Documents/GitHub/Pete/index.html
cd /Users/jessemajor/Documents/GitHub/Pete
git add -A
git commit -m "description"
git push origin main
# Codemagic auto-triggers on push to main
```

Also update version query strings in `index.html` when changing `app.js`, `firebase.js`, or `style.css`.

---

## Deploy Cloud Functions

```bash
cd /Users/jessemajor/Documents/GitHub/Pete
npx firebase-tools deploy --only functions --project pete-s-word-wardrobe
```

---

## User Preferences

- No emojis in responses
- Brief and direct
- Build first, explain after
- Dark themes always
- Coin SVG symbol (not text, not emoji) on entry fee buttons — use the same SVG from the nav bar (18×18 viewBox)
