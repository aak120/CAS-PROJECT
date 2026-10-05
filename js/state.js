// Player state: XP, levels, streaks, coins, badges, leagues and friends.
// Everything is saved in the browser (localStorage), so no account or server is needed.
window.MQ = window.MQ || {};

(function (MQ) {
  const KEY = 'moneyquest.v1';

  // ---------- Date helpers ----------
  function dateKey(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function daysBetween(a, b) {
    return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);
  }
  function addDays(key, n) {
    const d = new Date(key + 'T00:00:00');
    d.setDate(d.getDate() + n);
    return dateKey(d);
  }
  function weekStart(d) {
    d = new Date(d || new Date());
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
    return d;
  }

  // ---------- Seeded random (so simulated rivals stay consistent) ----------
  function hashStr(s) {
    let h = 1779033703 ^ s.length;
    for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    return (h >>> 0);
  }
  function rng(seed) {
    let a = typeof seed === 'string' ? hashStr(seed) : seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ---------- Defaults ----------
  function fresh() {
    return {
      v: 1,
      profile: null, // { name, avatar }
      xp: 0, coins: 20,
      streak: { count: 0, best: 0, lastDate: null, freezes: 0 },
      goal: 30,
      xpLog: {},
      lessons: {},
      answers: { correct: 0, total: 0 },
      games: {},
      badges: {},
      league: { week: dateKey(weekStart()), tier: 0, weekXp: 0, result: null },
      challenge: { date: null },
      market: null,
      life: null,
      friends: [],
      ownedAvatars: [],
      settings: { currency: '$', sound: true, theme: 'auto' }
    };
  }

  let S;
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      S = raw ? Object.assign(fresh(), JSON.parse(raw)) : fresh();
    } catch (e) { S = fresh(); }
    S.settings = Object.assign(fresh().settings, S.settings || {});
    rolloverLeague();
    return S;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage full or blocked */ }
  }
  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) {}
    S = fresh();
    save();
  }

  // ---------- Levels ----------
  const LEVEL_TITLES = ['Piggy Bank Rookie', 'Coin Collector', 'Budget Builder', 'Savings Specialist', 'Interest Wizard', 'Market Maven', 'Money Master', 'Finance Legend'];
  function xpForLevel(l) { return 25 * l * (l - 1); } // L1:0 L2:50 L3:150 L4:300 ...
  function levelInfo(xp) {
    let l = 1;
    while (xp >= xpForLevel(l + 1)) l++;
    const base = xpForLevel(l), next = xpForLevel(l + 1);
    return { level: l, title: LEVEL_TITLES[Math.min(l - 1, LEVEL_TITLES.length - 1)], into: xp - base, need: next - base, pct: (xp - base) / (next - base) };
  }

  // ---------- Streaks ----------
  function touchStreak() {
    const t = dateKey(), st = S.streak;
    if (st.lastDate === t) return null;
    let msg = null;
    if (!st.lastDate) st.count = 1;
    else {
      const gap = daysBetween(st.lastDate, t);
      if (gap === 1) st.count++;
      else if (gap > 1) {
        const missed = gap - 1;
        if (st.freezes >= missed) { st.freezes -= missed; st.count++; msg = '🧊 Streak freeze used. Your streak is safe!'; }
        else { st.count = 1; }
      }
    }
    st.lastDate = t;
    st.best = Math.max(st.best, st.count);
    return msg;
  }
  // What the streak looks like right now (it may already be broken even before the next activity).
  function streakNow() {
    const st = S.streak;
    if (!st.lastDate) return { count: 0, today: false, atRisk: false };
    const gap = daysBetween(st.lastDate, dateKey());
    if (gap === 0) return { count: st.count, today: true, atRisk: false };
    if (gap === 1) return { count: st.count, today: false, atRisk: true };
    if (st.freezes >= gap - 1) return { count: st.count, today: false, atRisk: true, frozen: true };
    return { count: 0, today: false, atRisk: false };
  }

  // ---------- XP ----------
  function todayXp() { return S.xpLog[dateKey()] || 0; }
  function addXP(amount, why) {
    amount = Math.max(0, Math.round(amount));
    if (!amount) return;
    const before = levelInfo(S.xp).level;
    const goalBefore = todayXp() >= S.goal;
    rolloverLeague();
    const streakMsg = touchStreak();
    S.xp += amount;
    S.coins += Math.ceil(amount / 2);
    const k = dateKey();
    S.xpLog[k] = (S.xpLog[k] || 0) + amount;
    S.league.weekXp += amount;
    // keep the log small
    const keys = Object.keys(S.xpLog).sort();
    while (keys.length > 60) delete S.xpLog[keys.shift()];
    save();
    MQ.ui.toast('+' + amount + ' XP' + (why ? ' · ' + why : ''), 'xp');
    if (streakMsg) MQ.ui.toast(streakMsg);
    if (!goalBefore && todayXp() >= S.goal) { MQ.ui.toast('🎯 Daily goal reached!', 'good'); MQ.ui.sound('level'); }
    const after = levelInfo(S.xp);
    if (after.level > before) {
      S.coins += 25; save();
      MQ.ui.celebrate('Level ' + after.level + '!', after.title + ' · +25 🪙 bonus');
    }
    checkBadges();
  }

  // ---------- Badges ----------
  const BADGES = [
    { id: 'first-lesson', e: '🎓', name: 'First Steps', desc: 'Finish your first lesson', test: s => countDone(s) >= 1 },
    { id: 'five-lessons', e: '📚', name: 'Bookworm', desc: 'Finish 5 lessons', test: s => countDone(s) >= 5 },
    { id: 'all-lessons', e: '🏆', name: 'Graduate', desc: 'Finish every lesson', test: s => countDone(s) >= Object.keys(MQ.LESSONS).length },
    { id: 'perfect', e: '💯', name: 'Perfectionist', desc: 'Get 100% on a quiz', test: s => Object.values(s.lessons).some(l => l.best === 1) },
    { id: 'unit', e: '🧩', name: 'Unit Cleared', desc: 'Complete a whole unit', test: s => MQ.UNITS.some(u => u.lessons.every(l => s.lessons[l.id] && s.lessons[l.id].done)) },
    { id: 'streak3', e: '🔥', name: 'On Fire', desc: 'Reach a 3-day streak', test: s => s.streak.best >= 3 },
    { id: 'streak7', e: '🌋', name: 'Unstoppable', desc: 'Reach a 7-day streak', test: s => s.streak.best >= 7 },
    { id: 'xp500', e: '⚡', name: 'Power Up', desc: 'Earn 500 XP', test: s => s.xp >= 500 },
    { id: 'gamer', e: '🕹️', name: 'Gamer', desc: 'Play all 3 mini-games', test: s => ['needs', 'scam', 'interest'].every(g => s.games[g] && s.games[g].plays) },
    { id: 'scam-proof', e: '🛡️', name: 'Scam-Proof', desc: 'Score 100% in Scam or Legit', test: s => s.games.scam && s.games.scam.perfect },
    { id: 'first-trade', e: '📈', name: 'First Trade', desc: 'Buy your first stock in the Market Sim', test: s => s.badgeFlags && s.badgeFlags.trade },
    { id: 'diversified', e: '🧺', name: 'Diversified', desc: 'Hold 4+ different investments at once', test: s => s.badgeFlags && s.badgeFlags.diversified },
    { id: 'profit', e: '💹', name: 'In the Green', desc: 'Finish a Market Sim year with a profit', test: s => s.badgeFlags && s.badgeFlags.profit },
    { id: 'life-win', e: '🎯', name: 'Goal Getter', desc: 'Hit your savings goal in Life Sim', test: s => s.badgeFlags && s.badgeFlags.lifeWin },
    { id: 'debt-free', e: '🕊️', name: 'Debt-Free', desc: 'Finish Life Sim with zero debt', test: s => s.badgeFlags && s.badgeFlags.debtFree },
    { id: 'promoted', e: '🚀', name: 'Promoted', desc: 'Get promoted to a higher league', test: s => s.league.tier >= 1 },
    { id: 'friend', e: '🤝', name: 'Squad Up', desc: 'Add a friend with a friend code', test: s => s.friends.length >= 1 }
  ];
  function countDone(s) { return Object.values(s.lessons).filter(l => l.done).length; }
  function flag(name) { S.badgeFlags = S.badgeFlags || {}; S.badgeFlags[name] = true; save(); checkBadges(); }
  function checkBadges() {
    BADGES.forEach(b => {
      if (!S.badges[b.id] && b.test(S)) {
        S.badges[b.id] = dateKey();
        S.coins += 10;
        save();
        MQ.ui.toast(b.e + ' Badge unlocked: ' + b.name + ' (+10 🪙)', 'badge');
      }
    });
  }

  // ---------- Leagues (simulated rivals) ----------
  const TIERS = [
    { name: 'Bronze', e: '🥉', color: '#cd7f32' }, { name: 'Silver', e: '🥈', color: '#9ca3af' },
    { name: 'Gold', e: '🥇', color: '#eab308' }, { name: 'Platinum', e: '💠', color: '#06b6d4' }, { name: 'Diamond', e: '💎', color: '#8b5cf6' }
  ];
  const BOT_NAMES = ['PennyPincher', 'StonksKid', 'BudgetNinja', 'CoinFlip22', 'SavvySam', 'DividendDiva', 'CashCat', 'ThriftyTay', 'BullRunBen',
    'InterestIzzy', 'FrugalFinn', 'LedgerLuna', 'CentsiblePriya', 'RupeeRaj', 'EuroEmma', 'YenYuki', 'PesoPablo', 'MoneyMoMo', 'NickelNia', 'QuarterQuinn',
    'LoonieLeo', 'KronaKai', 'WalletWes', 'SavingsSofia', 'PocketPete'];
  const BOT_AVATARS = ['🦊', '🐼', '🐸', '🦁', '🐯', '🐨', '🐵', '🦄', '🐙', '🐧', '🦉', '🐢', '🐬', '🐲', '🐻', '🐰'];

  function weekProgress(weekKey, now) {
    const start = new Date(weekKey + 'T00:00:00');
    const f = ((now || new Date()) - start) / (7 * 86400000);
    return Math.max(0, Math.min(1, f));
  }
  function leagueBots(weekKey, tier, progress) {
    const r = rng(weekKey + ':' + tier);
    const names = BOT_NAMES.slice();
    const bots = [];
    const base = 120 * (tier + 1);
    for (let i = 0; i < 9; i++) {
      const name = names.splice(Math.floor(r() * names.length), 1)[0];
      const target = Math.round(base * (0.25 + r() * 1.5));
      const curve = 0.6 + r() * 0.9; // some grind early, some late
      bots.push({ name, avatar: BOT_AVATARS[Math.floor(r() * BOT_AVATARS.length)], xp: Math.round(target * Math.min(1, 0.04 + Math.pow(progress, curve))), bot: true });
    }
    return bots;
  }
  function leagueTable(at) {
    const L = S.league;
    const p = at === undefined ? weekProgress(L.week) : at;
    const rows = leagueBots(L.week, L.tier, p);
    rows.push({ name: (S.profile && S.profile.name) || 'You', avatar: (S.profile && S.profile.avatar) || '🙂', xp: L.weekXp, you: true });
    rows.sort((a, b) => b.xp - a.xp || (a.you ? -1 : 1));
    return rows;
  }
  function rolloverLeague() {
    const cur = dateKey(weekStart());
    const L = S.league;
    if (L.week === cur) return;
    const rows = leagueTable(1);
    const rank = rows.findIndex(r => r.you) + 1;
    const oldTier = L.tier;
    let outcome = 'stayed';
    if (L.weekXp > 0 && rank <= 3 && L.tier < TIERS.length - 1) { L.tier++; outcome = 'promoted'; }
    else if (rank >= 8 && L.tier > 0) { L.tier--; outcome = 'demoted'; }
    L.result = { rank, outcome, from: oldTier, to: L.tier, xp: L.weekXp, seen: false };
    L.week = cur;
    L.weekXp = 0;
    save();
  }

  // ---------- Friend codes (share progress without a server) ----------
  function b64encode(str) { return btoa(String.fromCharCode.apply(null, new TextEncoder().encode(str))); }
  function b64decode(b64) { return new TextDecoder().decode(Uint8Array.from(atob(b64), c => c.charCodeAt(0))); }
  function friendCode() {
    const p = S.profile || { name: 'Player', avatar: '🙂' };
    const data = { n: p.name, a: p.avatar, x: S.xp, s: streakNow().count, l: countDone(S), d: dateKey(), id: p.id };
    return 'MQ1-' + b64encode(JSON.stringify(data));
  }
  function addFriend(code) {
    code = (code || '').trim();
    if (!code.startsWith('MQ1-')) throw new Error('That does not look like a MoneyQuest friend code.');
    let d;
    try { d = JSON.parse(b64decode(code.slice(4))); } catch (e) { throw new Error('That code is damaged. Ask your friend to copy it again.'); }
    if (!d || typeof d.n !== 'string' || typeof d.x !== 'number') throw new Error('That code is missing information.');
    if (S.profile && d.id && d.id === S.profile.id) throw new Error('That is your own code! Share it with a friend instead.');
    const f = { id: d.id || d.n, name: String(d.n).slice(0, 20), avatar: String(d.a || '🙂').slice(0, 4), xp: Math.max(0, d.x | 0), streak: Math.max(0, d.s | 0), lessons: Math.max(0, d.l | 0), date: String(d.d || '') };
    const i = S.friends.findIndex(x => x.id === f.id);
    if (i >= 0) S.friends[i] = f; else S.friends.push(f);
    save();
    checkBadges();
    return f;
  }

  MQ.state = {
    load, save, reset, get: () => S,
    dateKey, daysBetween, addDays, weekStart, rng,
    levelInfo, addXP, todayXp, streakNow,
    BADGES, checkBadges, flag,
    TIERS, leagueTable, weekProgress,
    friendCode, addFriend, countDone
  };
})(window.MQ);
