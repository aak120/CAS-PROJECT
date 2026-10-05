// App shell: router, header, tab bar and the Home / Learn / Lesson / Ranks / Profile screens.
window.MQ = window.MQ || {};

(function (MQ) {
  const { $, $$, esc, money, fmt, toast, modal, closeModal, sound, ring, shuffle } = MQ.ui;
  const ST = MQ.state;
  let S;
  let cleanup = null; // set by screens that run timers

  const FREE_AVATARS = ['🦊', '🐼', '🐸', '🦁', '🐯', '🐨', '🐵', '🐙', '🐧', '🦉', '🐢', '🐰'];
  const SHOP_AVATARS = [{ e: '🦄', p: 100 }, { e: '🤖', p: 100 }, { e: '🦈', p: 120 }, { e: '🐲', p: 150 }, { e: '😎', p: 150 }, { e: '👑', p: 250 }];
  const GOALS = [{ xp: 15, name: 'Chill' }, { xp: 30, name: 'Regular' }, { xp: 60, name: 'Serious' }, { xp: 100, name: 'Intense' }];

  // ---------- Router ----------
  const routes = {};
  function route(name, fn) { routes[name] = fn; }
  function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }
  function render() {
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    closeModal();
    S = ST.get();
    applyTheme();
    if (!S.profile) { renderOnboarding(); return; }
    const parts = (location.hash.replace(/^#\/?/, '') || 'home').split('/');
    const fn = routes[parts[0]] || routes.home;
    const main = $('#main');
    main.innerHTML = '';
    main.className = 'screen screen-' + parts[0];
    fn(main, parts.slice(1));
    renderHeader();
    renderTabs(parts[0]);
    window.scrollTo(0, 0);
  }
  function onLeave(fn) { cleanup = fn; }

  function applyTheme() {
    const t = (S && S.settings.theme) || 'auto';
    if (t === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
  }

  // ---------- Header & tabs ----------
  function renderHeader() {
    const st = ST.streakNow(), lv = ST.levelInfo(S.xp);
    $('#topbar').innerHTML =
      '<a href="#/profile" class="me" aria-label="Profile"><span class="avatar sm">' + esc(S.profile.avatar) + '</span><span class="lvl">Lv ' + lv.level + '</span></a>' +
      '<div class="stats">' +
      '<a href="#/profile" class="pill streak ' + (st.today ? 'lit' : '') + '" title="Day streak">🔥 ' + st.count + '</a>' +
      '<a href="#/profile" class="pill coins" title="Coins">🪙 ' + S.coins + '</a>' +
      '</div>';
  }
  function renderTabs(active) {
    const map = { lesson: 'learn', practice: 'learn', game: 'play', sim: 'sim', personality: 'home' };
    active = map[active] || active;
    const tabs = [['home', '🏠', 'Home'], ['learn', '📚', 'Learn'], ['play', '🎮', 'Play'], ['sim', '📈', 'Simulate'], ['ranks', '🏆', 'Ranks']];
    $('#tabs').innerHTML = tabs.map(t => '<a href="#/' + t[0] + '" class="tab ' + (active === t[0] ? 'active' : '') + '"><span class="ti">' + t[1] + '</span><span class="tl">' + t[2] + '</span></a>').join('');
    $('#tabs').style.display = ['lesson', 'game', 'practice', 'personality'].includes(location.hash.split('/')[1]) ? 'none' : '';
  }

  // ---------- Onboarding ----------
  function renderOnboarding() {
    $('#topbar').innerHTML = '';
    $('#tabs').innerHTML = '';
    const main = $('#main');
    main.className = 'screen onboarding';
    let avatar = FREE_AVATARS[0], goal = 30, country = guessCountry();
    main.innerHTML =
      '<div class="hero"><div class="logo">💸</div><h1>MoneyQuest</h1><p>Level up your money skills with bite-sized lessons, games and simulations. No real money involved, ever.</p></div>' +
      '<div class="card"><label class="label" for="name">What should we call you?</label><input id="name" class="input" maxlength="16" placeholder="Your nickname" autocomplete="off">' +
      '<p class="hint">Use a nickname, not your full name. Your progress stays on this device.</p>' +
      '<div class="label">Pick an avatar</div><div class="avatar-grid">' + FREE_AVATARS.map(a => '<button class="avatar-pick ' + (a === avatar ? 'sel' : '') + '" data-a="' + a + '">' + a + '</button>').join('') + '</div>' +
      '<div class="label">Where do you live?</div><div class="chips country-chips">' + ['IN', 'US', 'UK', 'GL'].map(k => '<button class="chip ' + (k === country ? 'on' : '') + '" data-c="' + k + '">' + MQ.COUNTRIES[k].flag + ' ' + MQ.COUNTRIES[k].name + '</button>').join('') + '</div>' +
      '<p class="hint">Sets your currency, typical salaries and prices in simulations, and a country-specific unit (tax, banking, credit).</p>' +
      '<div class="label">Daily goal</div><div class="goal-grid">' + GOALS.map(g => '<button class="goal-pick ' + (g.xp === goal ? 'sel' : '') + '" data-g="' + g.xp + '"><b>' + g.name + '</b><span>' + g.xp + ' XP/day</span></button>').join('') + '</div>' +
      '<button id="start" class="btn primary block lg">Start my quest 🚀</button></div>';
    $$('.avatar-pick', main).forEach(b => b.onclick = () => { avatar = b.dataset.a; $$('.avatar-pick', main).forEach(x => x.classList.toggle('sel', x === b)); });
    $$('.goal-pick', main).forEach(b => b.onclick = () => { goal = +b.dataset.g; $$('.goal-pick', main).forEach(x => x.classList.toggle('sel', x === b)); });
    $$('[data-c]', main).forEach(b => b.onclick = () => { country = b.dataset.c; $$('[data-c]', main).forEach(x => x.classList.toggle('on', x === b)); });
    $('#start').onclick = () => {
      const name = $('#name').value.trim();
      if (!name) { $('#name').focus(); toast('Pick a nickname first 🙂'); return; }
      S.profile = { name, avatar, id: Math.random().toString(36).slice(2, 10) };
      S.goal = goal;
      S.settings.country = country;
      ST.save();
      sound('level');
      go('#/personality/onboard');
    };
  }

  function guessCountry() {
    const l = (navigator.language || '').toUpperCase();
    return /-IN$/.test(l) ? 'IN' : /-GB$/.test(l) ? 'UK' : /-US$/.test(l) ? 'US' : 'GL';
  }

  // ---------- Home ----------
  route('home', main => {
    const st = ST.streakNow(), lv = ST.levelInfo(S.xp), tx = ST.todayXp();
    const next = nextLesson();
    const tip = MQ.TIPS[Math.floor(Date.now() / 86400000) % MQ.TIPS.length];
    const rows = ST.leagueTable(), rank = rows.findIndex(r => r.you) + 1, tier = ST.TIERS[S.league.tier];

    // last 7 days strip
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const k = ST.addDays(ST.dateKey(), -i);
      const d = new Date(k + 'T00:00:00');
      days.push('<div class="day ' + (S.xpLog[k] ? 'on' : '') + (i === 0 ? ' today' : '') + '"><span>' + 'SMTWTFS'[d.getDay()] + '</span><i>' + (S.xpLog[k] ? '🔥' : '·') + '</i></div>');
    }

    main.innerHTML =
      '<h1 class="greet">Hey ' + esc(S.profile.name) + ' 👋</h1>' +
      '<p class="sub">' + (st.today ? 'You learned something today. Nice!' : st.atRisk ? 'Learn one thing today to keep your ' + st.count + '-day learning streak.' : 'Finish a lesson, game or simulation to start a learning streak.') + '</p>' +
      homeNudges() +
      '<div class="card goal-card">' + ring(tx / S.goal, 92, Math.min(tx, S.goal) + '/' + S.goal) +
      '<div><div class="kicker">Daily goal</div><h3>' + (tx >= S.goal ? 'Goal smashed! 🎯' : (S.goal - tx) + ' XP to go') + '</h3>' +
      '<div class="week">' + days.join('') + '</div></div></div>' +
      (next ? '<a class="card continue" href="#/lesson/' + next.id + '" style="--c:' + unitOf(next).color + '"><div class="emoji-tile">' + next.emoji + '</div><div><div class="kicker">' + (ST.countDone(S) ? 'Continue learning' : 'Start here') + ' · ' + esc(unitOf(next).title) + '</div><h3>' + esc(next.title) + '</h3></div><span class="go">▶</span></a>'
        : '<div class="card"><h3>🏆 All lessons complete!</h3><p class="muted">Replay lessons for practice, or try the simulations.</p></div>') +
      '<div id="challenge"></div>' +
      '<a class="card league-mini" href="#/ranks"><span class="tier-badge" style="--tc:' + tier.color + '">' + tier.e + '</span><div><div class="kicker">' + tier.name + ' League</div><h3>You are #' + rank + ' this week</h3></div><span class="go">›</span></a>' +
      '<h2 class="section">Simulate & play</h2><div class="grid2">' +
      tile('#/sim/life', '🏙️', 'Life Simulator', 'Your first salary') +
      tile('#/sim/portfolio', '🧺', 'Portfolio Sim', 'Invest through history') +
      tile('#/game/scam', '🚨', 'Scam Simulator', 'Spot the red flags') +
      tile('#/game/budget', '⚔️', 'Budget Battle', 'Survive the month') + '</div>' +
      '<div class="card lit-mini"><div class="kicker">🧠 Financial Literacy Score</div><h3>' + (MQ.adaptive.overall() ? Math.round(MQ.adaptive.overall() * 100) + '%' : 'Answer a few questions to unlock') + '</h3>' + MQ.adaptive.scoreTable() + '<p class="hint">Tap a topic for a 3-minute adaptive challenge.</p></div>' +
      '<div class="card tip"><b>💡 Tip of the day</b><p>' + esc(money(tip)) + '</p></div>' +
      '<div class="card level-card"><div class="row"><div><div class="kicker">Level ' + lv.level + '</div><h3>' + lv.title + '</h3></div><div class="muted">' + S.xp + ' XP</div></div>' +
      '<div class="bar"><i style="width:' + (lv.pct * 100).toFixed(1) + '%"></i></div><div class="muted small">' + (lv.need - lv.into) + ' XP to level ' + (lv.level + 1) + '</div></div>';
    renderChallenge($('#challenge', main));

    if (S.league.result && !S.league.result.seen) showLeagueResult();
  });

  function homeNudges() {
    let out = '';
    if (!S.personality) out += '<a class="card nudge" href="#/personality" style="--c:#8b5cf6"><span class="emoji-tile">🧩</span><div><div class="kicker">2-minute quiz</div><h3>Discover your money personality</h3><p class="muted small">Simulations adapt to how you handle money.</p></div><span class="go">›</span></a>';
    const w = MQ.adaptive.weakest();
    if (w) out += '<a class="card nudge" href="#/practice/' + w.cat.id + '" style="--c:#ef4444"><span class="emoji-tile">' + w.cat.e + '</span><div><div class="kicker">Personal coach · ' + Math.round(w.score * 100) + '%</div><h3>You seem to be struggling with ' + esc(w.cat.concept) + '.</h3><p class="muted small">Want a 3-minute challenge? Easier questions first, with explanations.</p></div><span class="go">›</span></a>';
    return out;
  }

  function tile(href, e, title, sub) {
    return '<a class="tile" href="' + href + '"><span class="te">' + e + '</span><b>' + title + '</b><span>' + sub + '</span></a>';
  }

  function renderChallenge(el) {
    const today = ST.dateKey();
    const r = ST.rng('challenge:' + today);
    const weak = MQ.adaptive.weakest();
    let q, label = '';
    if (weak) { const pool = MQ.adaptive.bankQuestions(weak.cat.id); q = pool[Math.floor(r() * pool.length)]; label = ' · picked for you: ' + weak.cat.name; }
    else q = MQ.ALL_QUESTIONS[Math.floor(r() * MQ.ALL_QUESTIONS.length)];
    const qCat = q.cat || MQ.adaptive.catOfLesson(q.lessonId);
    if (S.challenge.date === today) {
      el.innerHTML = '<div class="card challenge done"><div class="kicker">⚡ Daily challenge</div><h3>' + (S.challenge.correct ? 'Nailed it! Come back tomorrow.' : 'Done for today. New question tomorrow!') + '</h3></div>';
      return;
    }
    el.innerHTML = '<div class="card challenge"><div class="kicker">⚡ Daily challenge · +15 XP' + esc(label) + '</div><h3>' + esc(money(q.q)) + '</h3><div class="opts">' +
      q.options.map((o, i) => '<button class="opt" data-i="' + i + '">' + esc(money(o)) + '</button>').join('') + '</div><div class="fb"></div></div>';
    $$('.opt', el).forEach(b => b.onclick = () => {
      const i = +b.dataset.i, ok = i === q.answer;
      $$('.opt', el).forEach((x, j) => { x.disabled = true; if (j === q.answer) x.classList.add('right'); });
      if (!ok) b.classList.add('wrong');
      $('.fb', el).innerHTML = '<p class="' + (ok ? 'good' : 'bad') + '">' + (ok ? '✅ Correct! ' : '❌ Not quite. ') + esc(money(q.explain)) + '</p>';
      S.challenge = { date: today, correct: ok };
      MQ.adaptive.recordAnswer(qCat, ok, q.qid);
      S.answers.total++; if (ok) S.answers.correct++;
      ST.save();
      sound(ok ? 'good' : 'bad');
      ST.addXP(ok ? 15 : 3, 'Daily challenge');
      renderHeader();
    });
  }

  function unitOf(lesson) { return MQ.UNITS.find(u => u.id === lesson.unitId) || Object.values(MQ.COUNTRY_UNITS).find(u => u.id === lesson.unitId); }
  function isUnlocked(lesson) {
    if (lesson.index === 0) return true;
    const prev = unitOf(lesson).lessons[lesson.index - 1];
    return !!(S.lessons[prev.id] && S.lessons[prev.id].done);
  }
  function nextLesson() {
    for (const u of MQ.visibleUnits()) for (const l of u.lessons) if (!(S.lessons[l.id] && S.lessons[l.id].done) && isUnlocked(l)) return l;
    return null;
  }

  // ---------- Learn ----------
  route('learn', main => {
    const units = MQ.visibleUnits();
    const all = units.reduce((t, u) => t.concat(u.lessons), []);
    const done = all.filter(l => S.lessons[l.id] && S.lessons[l.id].done).length;
    const w = MQ.adaptive.weakest();
    main.innerHTML = '<h1>Learn</h1><p class="sub">' + done + ' of ' + all.length + ' lessons complete. Units can be played in any order.</p>' +
      '<div class="card"><div class="row"><div><div class="kicker">🧠 Financial Literacy Score</div><h3>' + (MQ.adaptive.overall() ? Math.round(MQ.adaptive.overall() * 100) + '% overall' : 'Not enough answers yet') + '</h3></div><a class="btn sm primary" href="#/practice' + (w ? '/' + w.cat.id : '') + '">🎯 Practice</a></div>' + MQ.adaptive.scoreTable() +
      '<p class="hint">Tap a topic for a 3-minute adaptive challenge with freshly generated questions.</p></div>' +
      units.map(u => {
        const d = u.lessons.filter(l => S.lessons[l.id] && S.lessons[l.id].done).length;
        return '<section class="unit" style="--c:' + u.color + '"><div class="unit-head"><span class="unit-emoji">' + u.emoji + '</span><div><h2>' + u.title + '</h2><p>' + esc(u.blurb) + '</p></div><span class="unit-count">' + d + '/' + u.lessons.length + '</span></div>' +
          '<div class="bar unit-bar"><i style="width:' + (d / u.lessons.length * 100) + '%"></i></div>' +
          '<div class="path">' + u.lessons.map(l => {
            const rec = S.lessons[l.id], unlocked = isUnlocked(l);
            const cls = rec && rec.done ? 'done' : unlocked ? 'open' : 'locked';
            const stars = rec && rec.done ? '<span class="stars">' + starStr(rec.best) + '</span>' : '';
            return '<a class="node ' + cls + '" ' + (unlocked ? 'href="#/lesson/' + l.id + '"' : 'aria-disabled="true"') + '><span class="node-dot">' + (cls === 'locked' ? '🔒' : l.emoji) + '</span><span class="node-title">' + esc(l.title) + stars + '</span></a>';
          }).join('') + '</div></section>';
      }).join('');
    $$('.node.locked', main).forEach(n => n.onclick = () => toast('🔒 Finish the previous lesson to unlock this one'));
  });
  function starStr(best) { const n = best >= 1 ? 3 : best >= 0.75 ? 2 : 1; return '★'.repeat(n) + '☆'.repeat(3 - n); }

  // ---------- Lesson player ----------
  route('lesson', (main, args) => {
    const lesson = MQ.LESSONS[args[0]];
    if (!lesson) { go('#/learn'); return; }
    if (!isUnlocked(lesson)) { toast('🔒 Locked'); go('#/learn'); return; }
    const unit = unitOf(lesson);
    const cards = lesson.cards;
    // Queue: first all questions in order; wrong ones come back at the end.
    let queue = lesson.quiz.map((q, i) => i);
    const firstTry = {}; // question index -> correct on first try
    let step = 0; // index into cards, then quiz
    let qPos = 0;
    main.style.setProperty('--c', unit.color);

    function progress() {
      const totalSteps = cards.length + lesson.quiz.length;
      const doneSteps = Math.min(step, cards.length) + Object.keys(firstTry).filter(k => firstTry[k] !== undefined).length;
      return doneSteps / totalSteps;
    }
    function frame(inner) {
      main.innerHTML = '<div class="lesson-top"><a href="#/learn" class="x" aria-label="Quit lesson">✕</a><div class="bar"><i style="width:' + (progress() * 100) + '%"></i></div></div>' + inner;
    }
    function showCard() {
      const c = cards[step];
      frame('<div class="lesson-card pop"><div class="big-emoji">' + c.emoji + '</div><h2>' + esc(money(c.title)) + '</h2><p>' + money(c.body) + '</p></div>' +
        '<div class="lesson-foot"><span class="muted">' + (step + 1) + ' / ' + cards.length + '</span>' +
        (step > 0 ? '<button class="btn ghost" id="back">Back</button>' : '') +
        '<button class="btn primary" id="next">' + (step === cards.length - 1 ? 'Start quiz ✏️' : 'Next') + '</button></div>');
      $('#next').onclick = () => { step++; sound('tap'); step < cards.length ? showCard() : showQ(); };
      if ($('#back')) $('#back').onclick = () => { step--; showCard(); };
    }
    function showQ() {
      if (qPos >= queue.length) { finish(); return; }
      const qi = queue[qPos], q = lesson.quiz[qi];
      const retry = firstTry[qi] === false;
      frame('<div class="quiz pop">' + (retry ? '<div class="kicker warn">🔁 Try this one again</div>' : '<div class="kicker">Question</div>') + '<h2>' + esc(money(q.q)) + '</h2><div class="opts">' +
        q.options.map((o, i) => '<button class="opt" data-i="' + i + '">' + esc(money(o)) + '</button>').join('') + '</div></div>' +
        '<div class="check-bar"><button class="btn primary block" id="check" disabled>Check</button></div>');
      let pick = null;
      $$('.opt', main).forEach(b => b.onclick = () => { pick = +b.dataset.i; $$('.opt', main).forEach(x => x.classList.toggle('sel', x === b)); $('#check').disabled = false; });
      $('#check').onclick = () => {
        const ok = pick === q.answer;
        if (firstTry[qi] === undefined) { firstTry[qi] = ok; S.answers.total++; if (ok) S.answers.correct++; MQ.adaptive.recordAnswer(MQ.adaptive.catOfLesson(lesson.id), ok, lesson.id + ':' + qi); ST.save(); }
        if (!ok) queue.push(qi);
        sound(ok ? 'good' : 'bad');
        $$('.opt', main).forEach((x, j) => { x.disabled = true; if (j === pick && !ok) x.classList.add('wrong'); if (ok && j === q.answer) x.classList.add('right'); });
        const bar = $('.check-bar', main);
        bar.className = 'check-bar ' + (ok ? 'good' : 'bad');
        bar.innerHTML = '<div class="fb-text"><b>' + (ok ? pickOne(['Nice! 🎉', 'Correct! ✅', 'You got it! 💪', 'Money brain! 🧠']) : 'Not quite 🤔') + '</b><p>' + (ok ? esc(money(q.explain)) : 'Have another think. This question comes back at the end.') + '</p></div><button class="btn ' + (ok ? 'primary' : 'danger') + ' block" id="cont">Continue</button>';
        $('#cont').onclick = () => { qPos++; showQ(); };
      };
    }
    function finish() {
      const n = lesson.quiz.length;
      const correct = Object.values(firstTry).filter(Boolean).length;
      const score = correct / n;
      const prev = S.lessons[lesson.id];
      const firstTime = !(prev && prev.done);
      let xp = 10 + correct * 3 + (score === 1 ? 5 : 0);
      if (!firstTime) xp = Math.ceil(xp / 2);
      S.lessons[lesson.id] = { done: true, best: Math.max(score, (prev && prev.best) || 0), plays: ((prev && prev.plays) || 0) + 1 };
      ST.save();
      const nxt = lesson.index + 1 < unit.lessons.length ? unit.lessons[lesson.index + 1] : null;
      main.innerHTML = '<div class="result pop"><div class="big-emoji bounce">' + (score === 1 ? '🏆' : score >= 0.75 ? '🎉' : '👍') + '</div><h1>Lesson complete!</h1>' +
        '<div class="result-stats"><div><b>' + correct + '/' + n + '</b><span>first try</span></div><div><b>+' + xp + '</b><span>XP</span></div><div><b>' + starStr(score) + '</b><span>stars</span></div></div>' +
        (firstTime ? '' : '<p class="muted">Replays earn half XP. Nice practice!</p>') +
        (nxt ? '<a class="btn primary block lg" href="#/lesson/' + nxt.id + '">Next: ' + esc(nxt.title) + ' ▶</a>' : '<a class="btn primary block lg" href="#/learn">Back to units</a>') +
        '<a class="btn ghost block" href="#/home">Home</a></div>';
      MQ.ui.confetti();
      ST.addXP(xp, 'Lesson');
      renderHeader();
    }
    showCard();
  });
  function pickOne(a) { return a[Math.floor(Math.random() * a.length)]; }

  // ---------- Ranks ----------
  route('ranks', (main, args) => {
    const tab = args[0] === 'friends' ? 'friends' : 'league';
    const cat = args[1] || 'weekXp';
    main.innerHTML = '<h1>Leaderboards</h1><div class="seg"><a href="#/ranks" class="' + (tab === 'league' ? 'on' : '') + '">Weekly league</a><a href="#/ranks/friends" class="' + (tab === 'friends' ? 'on' : '') + '">Friends & categories</a></div><div id="rk"></div>';
    const el = $('#rk', main);
    if (tab === 'league') {
      const tier = ST.TIERS[S.league.tier], rows = ST.leagueTable();
      const end = new Date(S.league.week + 'T00:00:00'); end.setDate(end.getDate() + 7);
      const hrs = Math.max(0, Math.round((end - new Date()) / 3600000));
      el.innerHTML = '<div class="card league-head" style="--tc:' + tier.color + '"><span class="tier-badge big">' + tier.e + '</span><div><h2>' + tier.name + ' League</h2><p class="muted">' + (hrs > 48 ? Math.round(hrs / 24) + ' days' : hrs + ' hours') + ' left · Top 3 move up' + (S.league.tier > 0 ? ', bottom 3 move down' : '') + '</p></div></div>' +
        '<div class="tiers">' + ST.TIERS.map((t, i) => '<span class="' + (i === S.league.tier ? 'on' : i < S.league.tier ? 'past' : '') + '" title="' + t.name + '">' + t.e + '</span>').join('') + '</div>' +
        '<ol class="board">' + rows.map((r, i) => {
          const zone = i < 3 && S.league.tier < ST.TIERS.length - 1 ? 'up' : i >= 7 && S.league.tier > 0 ? 'down' : '';
          return '<li class="' + (r.you ? 'you ' : '') + zone + '"><span class="pos">' + (i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1) + '</span><span class="avatar sm">' + esc(r.avatar) + '</span><span class="nm">' + esc(r.name) + (r.you ? ' (you)' : '') + '</span><span class="xp">' + r.xp + ' XP</span></li>';
        }).join('') + '</ol>' +
        '<p class="hint center">League rivals are simulated players so you always have someone to race. Use the Friends tab to compare with real classmates.</p>';
    } else {
      renderFriends(el, cat);
    }
  });

  const BOARD_CATS = [
    { id: 'weekXp', name: '⚡ Weekly XP', fmt: v => v + ' XP' },
    { id: 'sim', name: '🏙️ Best simulator', fmt: v => (v >= 0 ? '+' : '') + v + '%', hint: 'Net-worth growth in the Life Simulator, as a % of total income' },
    { id: 'decisions', name: '🧠 Best decisions', fmt: v => v + '/100', hint: 'Best Life Simulator decision score' },
    { id: 'streakBest', name: '🔥 Longest streak', fmt: v => v + ' days' },
    { id: 'improved', name: '📈 Most improved', fmt: v => '+' + v + ' pts', hint: 'Literacy Score gained this week' },
    { id: 'diversify', name: '🌈 Best diversification', fmt: v => v + '/100', hint: 'Best Portfolio Simulator diversification score' },
    { id: 'xp', name: '🏆 All-time XP', fmt: v => v + ' XP' }
  ];

  let showBots = true;
  function renderFriends(el, catId) {
    const cat = BOARD_CATS.find(c => c.id === catId) || BOARD_CATS[0];
    const val = r => cat.id === 'xp' ? r.xp : ((r.stats || {})[cat.id] || 0);
    const me = { name: S.profile.name, avatar: S.profile.avatar, xp: S.xp, streak: ST.streakNow().count, lessons: ST.countDone(S), you: true, stats: ST.myStats() };
    // League rivals get plausible (seeded, clearly labelled) stats so every board has competition before friends join.
    const bots = ST.leagueTable().filter(r => !r.you).slice(0, 6).map(r => {
      const g = ST.rng(S.league.week + ':' + r.name);
      return { name: r.name, avatar: r.avatar, bot: true, xp: 200 + Math.round(g() * 2500), streak: Math.round(g() * 12), lessons: Math.round(g() * 18),
        stats: { weekXp: r.xp, streakBest: 2 + Math.round(g() * 30), sim: Math.round(-8 + g() * 40), decisions: Math.round(35 + g() * 45), improved: Math.round(g() * 12), diversify: Math.round(30 + g() * 60) } };
    });
    const rows = S.friends.map(f => Object.assign({}, f)).concat(showBots ? bots : [], [me]).sort((a, b) => val(b) - val(a));
    el.innerHTML = '<div class="card"><h3>🤝 Compete with friends</h3><p class="muted">Share your friend code with classmates (chat, email, anything). Paste theirs below to add them. Codes are snapshots, so swap new ones to update the board.</p>' +
      '<label class="label">Your friend code</label><div class="code-row"><input class="input mono" readonly id="mycode" value="' + esc(ST.friendCode()) + '"><button class="btn" id="copy">Copy</button></div>' +
      '<label class="label" for="fc">Add a friend</label><div class="code-row"><input class="input mono" id="fc" placeholder="Paste MQ2-… code"><button class="btn primary" id="add">Add</button></div></div>' +
      '<div class="chips board-cats">' + BOARD_CATS.map(c => '<a class="chip ' + (c.id === cat.id ? 'on' : '') + '" href="#/ranks/friends/' + c.id + '">' + c.name + '</a>').join('') + '</div>' +
      '<p class="hint">' + esc(cat.hint || 'Different boards reward different skills, not just grinding.') + '</p>' +
      '<label class="set-row small"><span>Include simulated rivals 🤖</span><input type="checkbox" id="bots" ' + (showBots ? 'checked' : '') + '></label>' +
      '<ol class="board">' + rows.map((r, i) => '<li class="' + (r.you ? 'you' : '') + '"><span class="pos">' + (i < 3 && rows.length > 1 ? ['🥇', '🥈', '🥉'][i] : i + 1) + '</span><span class="avatar sm">' + esc(r.avatar) + '</span><span class="nm">' + esc(r.name) + (r.you ? ' (you)' : '') + '<small>🔥' + r.streak + ' · 📚' + r.lessons + (r.date ? ' · as of ' + esc(r.date) : '') + (!r.you && !r.stats ? ' · old code' : '') + (r.bot ? ' · 🤖 simulated' : '') + '</small></span><span class="xp">' + cat.fmt(val(r)) + '</span>' + (r.you ? '' : (r.bot ? '' : '<button class="rm" data-id="' + esc(r.id) + '" aria-label="Remove">✕</button>')) + '</li>').join('') + '</ol>';
    $('#bots', el).onchange = e => { showBots = e.target.checked; renderFriends(el, cat.id); };
    $('#copy', el).onclick = () => {
      const inp = $('#mycode', el);
      inp.select();
      (navigator.clipboard ? navigator.clipboard.writeText(inp.value) : Promise.reject()).then(() => toast('📋 Copied!'), () => { document.execCommand('copy'); toast('📋 Copied!'); });
    };
    $('#add', el).onclick = () => {
      try { const f = ST.addFriend($('#fc', el).value); toast('Added ' + f.name + '!', 'good'); renderFriends(el, cat.id); }
      catch (e) { toast(e.message, 'bad'); }
    };
    $$('.rm', el).forEach(b => b.onclick = () => { S.friends = S.friends.filter(f => f.id !== b.dataset.id); ST.save(); renderFriends(el, cat.id); });
  }

  function showLeagueResult() {
    const r = S.league.result;
    r.seen = true; ST.save();
    const t = ST.TIERS[r.to];
    const msg = r.outcome === 'promoted' ? 'You finished #' + r.rank + ' and moved up to ' + t.name + '! ' + t.e
      : r.outcome === 'demoted' ? 'You finished #' + r.rank + ' and dropped to ' + t.name + '. Bounce back this week!'
        : 'You finished #' + r.rank + ' and stay in ' + t.name + ' League.';
    if (r.outcome === 'promoted') MQ.ui.confetti();
    modal('<div class="celebrate"><div class="big-emoji">' + (r.outcome === 'promoted' ? '🚀' : r.outcome === 'demoted' ? '📉' : '🏁') + '</div><h2>Last week\'s league</h2><p>' + msg + '</p><button class="btn primary block" data-close>Let\'s go</button></div>');
    ST.checkBadges();
  }

  // ---------- Profile ----------
  route('profile', main => {
    const lv = ST.levelInfo(S.xp), st = ST.streakNow();
    const acc = S.answers.total ? Math.round(S.answers.correct / S.answers.total * 100) : 0;
    const bars = [];
    let maxX = 1;
    const days = [];
    for (let i = 6; i >= 0; i--) { const k = ST.addDays(ST.dateKey(), -i); days.push(k); maxX = Math.max(maxX, S.xpLog[k] || 0); }
    days.forEach(k => { const v = S.xpLog[k] || 0; const d = new Date(k + 'T00:00:00'); bars.push('<div class="col"><span class="v">' + (v || '') + '</span><i style="height:' + (v / maxX * 100) + '%"></i><span>' + 'SMTWTFS'[d.getDay()] + '</span></div>'); });

    main.innerHTML =
      '<div class="profile-head"><span class="avatar xl">' + esc(S.profile.avatar) + '</span><div><h1>' + esc(S.profile.name) + '</h1><p class="muted">Level ' + lv.level + ' · ' + lv.title + '</p></div><button class="btn ghost sm" id="edit">Edit</button></div>' +
      '<div class="card"><div class="bar"><i style="width:' + lv.pct * 100 + '%"></i></div><div class="muted small">' + lv.into + ' / ' + lv.need + ' XP to level ' + (lv.level + 1) + '</div></div>' +
      '<div class="stat-grid">' +
      stat('⚡', S.xp, 'Total XP') + stat('🔥', st.count, 'Day streak') + stat('🏅', S.streak.best, 'Best streak') +
      stat('📚', ST.countDone(S), 'Lessons done') + stat('🎯', acc + '%', 'Quiz accuracy') + stat('🪙', S.coins, 'Coins') + '</div>' +
      '<h2 class="section">🧠 Financial Literacy Score</h2><div class="card"><div class="row"><h3>' + (MQ.adaptive.overall() ? Math.round(MQ.adaptive.overall() * 100) + '% overall' : 'Answer questions to build your score') + '</h3>' + (MQ.adaptive.improvement() > 0.005 ? '<span class="pill up">+' + Math.round(MQ.adaptive.improvement() * 100) + ' this week</span>' : '') + '</div>' + MQ.adaptive.scoreTable() +
      (MQ.adaptive.strongest() ? '<p class="small">💪 Strongest: <b>' + MQ.adaptive.strongest().cat.name + '</b>' + (MQ.adaptive.weakest() ? ' · 🎯 Work on: <b>' + MQ.adaptive.weakest().cat.name + '</b>' : '') + '</p>' : '') + '</div>' +
      (S.personality ? MQ.personality.resultCard(S.personality, true) : '<a class="card nudge" href="#/personality" style="--c:#8b5cf6"><span class="emoji-tile">🧩</span><div><h3>Discover your money personality</h3><p class="muted small">A 6-question scenario quiz.</p></div><span class="go">›</span></a>') +
      '<h2 class="section">🏅 Personal records</h2><div class="card"><div class="ledger">' +
      '<div><span>🏙️ Life Sim best decision score</span><b>' + (S.records.lifeScore !== undefined ? S.records.lifeScore + '/100' : '–') + '</b></div>' +
      '<div><span>💰 Life Sim best net-worth growth</span><b>' + (S.records.lifeNet !== undefined ? S.records.lifeNet + '% of income' : '–') + '</b></div>' +
      '<div><span>🌈 Best diversification</span><b>' + (S.records.diversify !== undefined ? S.records.diversify + '/100' : '–') + '</b></div>' +
      '<div><span>🚨 Scams spotted</span><b>' + (S.counters.scamsSpotted || 0) + '</b></div>' +
      '<div><span>⚔️ Challenges won</span><b>' + S.challenges.filter(c => c.win).length + '/' + S.challenges.length + '</b></div></div></div>' +
      '<h2 class="section">Last 7 days</h2><div class="card"><div class="xp-chart">' + bars.join('') + '</div></div>' +
      '<h2 class="section">Units</h2><div class="card">' + MQ.visibleUnits().map(u => {
        const d = u.lessons.filter(l => S.lessons[l.id] && S.lessons[l.id].done).length;
        return '<div class="unit-prog" style="--c:' + u.color + '"><span>' + u.emoji + ' ' + u.title + '</span><div class="bar"><i style="width:' + d / u.lessons.length * 100 + '%"></i></div><span class="muted small">' + d + '/' + u.lessons.length + '</span></div>';
      }).join('') + '</div>' +
      '<h2 class="section">Badges · ' + Object.keys(S.badges).length + '/' + ST.BADGES.length + '</h2><div class="badges">' +
      ST.BADGES.map(b => '<div class="badge ' + (S.badges[b.id] ? 'got' : '') + '" title="' + esc(b.desc) + '"><span>' + b.e + '</span><b>' + b.name + '</b><small>' + esc(b.desc) + '</small></div>').join('') + '</div>' +
      '<h2 class="section">Shop</h2><div class="card shop">' +
      '<div class="shop-row"><span class="se">🧊</span><div><b>Streak Freeze</b><p class="muted small">Protects your streak if you miss a day. You have ' + S.streak.freezes + ' (max 2).</p></div><button class="btn" id="buy-freeze" ' + (S.streak.freezes >= 2 ? 'disabled' : '') + '>50 🪙</button></div>' +
      SHOP_AVATARS.map(a => { const own = S.ownedAvatars.includes(a.e); return '<div class="shop-row"><span class="se">' + a.e + '</span><div><b>Avatar</b><p class="muted small">' + (own ? 'Owned' : 'Unlock a new look') + '</p></div><button class="btn buy-av" data-e="' + a.e + '" data-p="' + a.p + '">' + (own ? (S.profile.avatar === a.e ? 'Wearing' : 'Wear') : a.p + ' 🪙') + '</button></div>'; }).join('') +
      '</div>' +
      '<h2 class="section">Settings</h2><div class="card settings">' +
      '<label class="set-row"><span>Daily goal</span><select id="s-goal">' + GOALS.map(g => '<option value="' + g.xp + '" ' + (S.goal === g.xp ? 'selected' : '') + '>' + g.name + ' (' + g.xp + ' XP)</option>').join('') + '</select></label>' +
      '<label class="set-row"><span>Country mode</span><select id="s-country">' + ['IN', 'US', 'UK', 'GL'].map(k => '<option value="' + k + '" ' + (MQ.country().id === k ? 'selected' : '') + '>' + MQ.COUNTRIES[k].flag + ' ' + MQ.COUNTRIES[k].name + '</option>').join('') + '</select></label>' +
      (MQ.country().id === 'GL' ? '<label class="set-row"><span>Currency symbol</span><select id="s-cur">' + ['$', '£', '€', '₹', '¥', 'A$', 'C$', 'S$', 'HK$', 'R', 'AED '].map(c => '<option ' + (S.settings.currency === c ? 'selected' : '') + '>' + c + '</option>').join('') + '</select></label>' : '') +
      '<p class="hint">Country mode changes currency, number format, simulation prices and adds a country unit in Learn. Finish running simulations before switching.</p>' +
      '<label class="set-row"><span>Theme</span><select id="s-theme">' + [['auto', 'Match device'], ['light', 'Light'], ['dark', 'Dark']].map(t => '<option value="' + t[0] + '" ' + (S.settings.theme === t[0] ? 'selected' : '') + '>' + t[1] + '</option>').join('') + '</select></label>' +
      '<label class="set-row"><span>Sound effects</span><input type="checkbox" id="s-sound" ' + (S.settings.sound ? 'checked' : '') + '></label>' +
      '<button class="btn danger ghost block" id="reset">Reset all progress</button></div>' +
      '<p class="hint center">MoneyQuest is an educational game. All money, stocks and events are simulated. Not financial advice.</p>';

    $('#buy-freeze').onclick = () => {
      if (S.coins < 50) { toast('Not enough coins. Earn XP to get more 🪙', 'bad'); return; }
      S.coins -= 50; S.streak.freezes++; ST.save(); sound('coin'); toast('🧊 Streak Freeze equipped!', 'good'); render();
    };
    $$('.buy-av', main).forEach(b => b.onclick = () => {
      const e = b.dataset.e, p = +b.dataset.p;
      if (!S.ownedAvatars.includes(e)) {
        if (S.coins < p) { toast('Not enough coins 🪙', 'bad'); return; }
        S.coins -= p; S.ownedAvatars.push(e); sound('coin');
      }
      S.profile.avatar = e; ST.save(); render();
    });
    $('#s-goal').onchange = e => { S.goal = +e.target.value; ST.save(); };
    if ($('#s-cur')) $('#s-cur').onchange = e => { S.settings.currency = e.target.value; ST.save(); render(); };
    $('#s-country').onchange = e => { S.settings.country = e.target.value; ST.save(); toast(MQ.country().flag + ' ' + MQ.country().name + ' mode on'); render(); };
    $('#s-theme').onchange = e => { S.settings.theme = e.target.value; ST.save(); applyTheme(); };
    $('#s-sound').onchange = e => { S.settings.sound = e.target.checked; ST.save(); };
    $('#reset').onclick = () => {
      modal('<h2>Reset everything?</h2><p>This deletes your XP, streak, badges and simulations on this device. It cannot be undone.</p><div class="row gap"><button class="btn ghost" data-close>Cancel</button><button class="btn danger" id="yes">Reset</button></div>');
      $('#yes').onclick = () => { ST.reset(); closeModal(); go('#/home'); };
    };
    $('#edit').onclick = () => {
      const avs = FREE_AVATARS.concat(S.ownedAvatars);
      modal('<h2>Edit profile</h2><label class="label">Nickname</label><input class="input" id="nn" maxlength="16" value="' + esc(S.profile.name) + '"><div class="label">Avatar</div><div class="avatar-grid">' +
        avs.map(a => '<button class="avatar-pick ' + (a === S.profile.avatar ? 'sel' : '') + '" data-a="' + a + '">' + a + '</button>').join('') + '</div><button class="btn primary block" id="sv">Save</button>');
      let av = S.profile.avatar;
      $$('.modal .avatar-pick').forEach(b => b.onclick = () => { av = b.dataset.a; $$('.modal .avatar-pick').forEach(x => x.classList.toggle('sel', x === b)); });
      $('#sv').onclick = () => { const n = $('#nn').value.trim(); if (n) S.profile.name = n; S.profile.avatar = av; ST.save(); closeModal(); render(); };
    };
  });
  function stat(e, v, l) { return '<div class="stat"><span>' + e + '</span><b>' + v + '</b><small>' + l + '</small></div>'; }

  // ---------- Boot ----------
  MQ.app = { route, go, render, onLeave, renderHeader, get S() { return S; } };

  window.addEventListener('hashchange', render);
  document.addEventListener('DOMContentLoaded', () => {
    S = ST.load();
    render();
    // keep the header fresh if the app stays open past midnight
    setInterval(() => { if (S && S.profile) renderHeader(); }, 60000);
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  });
})(window.MQ);
