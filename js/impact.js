// Measuring impact: the Money Check (a before/after test), the feedback survey, class codes,
// the teacher dashboard and the public "Our story" page.
//
// Money Check design: two parallel forms (A and B) test the same 10 ideas with different numbers
// and wording. Each device is randomly given A or B first and the other one later, so any
// difference between the forms evens out. No answers are revealed, so the second check is fair.
window.MQ = window.MQ || {};

(function (MQ) {
  const { $, $$, esc, money, toast, sound, shuffle } = MQ.ui;
  const ST = MQ.state;
  const LESSONS_BETWEEN = 5; // lessons to finish before the "after" check unlocks

  // [concept, category, form A, form B]
  const ITEMS = [
    ['50/30/20 budgeting', 'budgeting',
      { t: 'num', q: 'Using the 50/30/20 rule, how much of a $500 monthly budget goes to wants?', answer: 150, prefix: '$' },
      { t: 'num', q: 'Using the 50/30/20 rule, how much of a $600 monthly budget goes to savings?', answer: 120, prefix: '$' }],
    ['Small spends add up', 'budgeting',
      { t: 'num', q: 'You buy a $2 snack every school day (about 200 days a year). How much is that per year?', answer: 400, prefix: '$' },
      { t: 'num', q: 'You buy a $4 drink once a week for a whole year (52 weeks). How much is that per year?', answer: 208, prefix: '$' }],
    ['Compound interest', 'saving',
      { t: 'num', q: 'You save $200 at 10% interest a year, compounded yearly. How much do you have after 2 years?', answer: 242, prefix: '$' },
      { t: 'num', q: 'You save $100 at 20% interest a year, compounded yearly. How much do you have after 2 years?', answer: 144, prefix: '$' }],
    ['Why start early', 'saving',
      { t: 'tf', q: 'Compound interest means you also earn interest on the interest you already earned.', answer: true },
      { t: 'tf', q: 'Starting to save 5 years later makes no real difference to how much you end up with.', answer: false }],
    ['Gross vs net pay', 'earning',
      { t: 'num', q: 'A payslip shows gross pay of $800 and deductions of $120. What is the net pay?', answer: 680, prefix: '$' },
      { t: 'num', q: 'A payslip shows gross pay of $600 and deductions of $90. What is the net pay?', answer: 510, prefix: '$' }],
    ['Cost of borrowing', 'credit',
      { t: 'num', q: 'You borrow $500 and repay $50 a month for 12 months. How much interest did you pay in total?', answer: 100, prefix: '$' },
      { t: 'num', q: 'You borrow $300 and repay $30 a month for 12 months. How much interest did you pay in total?', answer: 60, prefix: '$' }],
    ['Credit scores', 'credit',
      { t: 'mcq', q: 'Which of these usually helps a credit score the most?', options: ['Paying bills on time', 'Opening lots of new cards', 'Using your full credit limit', 'Paying only the minimum, late'], answer: 0 },
      { t: 'mcq', q: 'Which of these usually hurts a credit score the most?', options: ['Paying the full balance', 'Keeping balances low', 'Missing payments', 'Checking your own score'], answer: 2 }],
    ['Inflation & real return', 'investing',
      { t: 'mcq', q: 'Your savings earn 4% a year while prices rise 6% a year. Roughly, what happens to your buying power each year?', options: ['It grows about 10%', 'It grows about 2%', 'It shrinks about 2%', 'It stays the same'], answer: 2 },
      { t: 'mcq', q: 'Your savings earn 7% a year while prices rise 3% a year. Roughly, what happens to your buying power each year?', options: ['It grows about 10%', 'It grows about 4%', 'It shrinks about 4%', 'It stays the same'], answer: 1 }],
    ['Risk & diversification', 'risk',
      { t: 'mcq', q: 'Which choice spreads investment risk the most?', options: ['All your money in one company', 'A fund holding hundreds of companies', 'Two trending crypto coins', "A friend's new startup"], answer: 1 },
      { t: 'mcq', q: 'Money you will need in 6 months is best kept in...', options: ['A savings account', 'A single tech stock', 'A new crypto coin', 'A friend\'s business'], answer: 0 }],
    ['Spotting scams', 'safety',
      { t: 'mcq', q: 'A text says your bank account is locked and asks you to tap a link and enter your PIN. What should you do?', options: ['Tap the link quickly', 'Reply with your PIN', 'Ignore the link and call the bank on its official number', 'Forward it to friends'], answer: 2 },
      { t: 'mcq', q: 'Someone online offers to "double your money in 24 hours, guaranteed". This is most likely...', options: ['A great deal', 'A scam', 'A normal bank product', 'A government scheme'], answer: 1 }]
  ];
  const CAT_NAMES = { budgeting: 'Budgeting', saving: 'Saving', earning: 'Income & tax', credit: 'Credit', investing: 'Inflation', risk: 'Risk', safety: 'Scam safety' };
  const AGE_BANDS = [['u13', 'Under 13'], ['13-15', '13–15'], ['16-17', '16–17'], ['18+', '18+'], ['na', 'Prefer not to say']];
  const FAVOURITES = ['Lessons', 'Quizzes & tests', 'Mini-games', 'Life Simulator', 'Portfolio Simulator', 'Scam Simulator', 'Streaks & XP'];

  function S() { return ST.get(); }
  function R() { return MQ.cloud.research(); }
  function checks() { const r = R(); r.checks = r.checks || {}; return r.checks; }
  function lessonsDone() { return ST.countDone(S()); }
  function postUnlocked() { const c = checks(); return !!c.pre && lessonsDone() >= c.pre.lessons + LESSONS_BETWEEN; }
  function surveyOpen() { return !R().survey && (!!checks().post || lessonsDone() >= 8); }
  function pctOf(c) { return Math.round(c.score / c.total * 100); }

  // ---------- Home cards ----------
  function homeCard() {
    const c = checks(), r = R();
    if (r.pendingClass && !r.classCode) return nudge('#/join/' + r.pendingClass, '🏫', 'Class invite', 'Join class ' + esc(r.pendingClass), 'Your teacher will see class averages only, never your name.', '#0ea5e9');
    if (!c.pre) return nudge('#/check', '📊', '3 minutes · +15 XP', 'Take your Money Check', 'A quick 10-question check of what you know now, so you can see how much you improve.', '#0ea5e9');
    if (!c.post && postUnlocked()) return nudge('#/check', '📈', 'Unlocked · +15 XP', 'Money Check: how much have you grown?', 'You scored ' + pctOf(c.pre) + '% before. Take the second check and compare.', '#16a34a');
    if (surveyOpen()) return nudge('#/survey', '🗣️', '1 minute · +20 XP', 'Tell us what you think', 'A short survey that helps make FiQuo better.', '#f59e0b');
    return '';
  }
  function nudge(href, e, kicker, title, sub, color) {
    return '<a class="card nudge" href="' + href + '" style="--c:' + color + '"><span class="emoji-tile">' + e + '</span><div><div class="kicker">' + kicker + '</div><h3>' + title + '</h3><p class="muted small">' + sub + '</p></div><span class="go">›</span></a>';
  }

  // ---------- Research consent (shown before the first check, and in Profile) ----------
  function consentHtml(r) {
    return '<div class="card consent"><label class="check-row"><input type="checkbox" id="rc-consent" ' + (r.consent ? 'checked' : '') + '><span><b>Share my anonymous results to help measure FiQuo\'s impact</b><small>Only scores and survey answers, with a random ID. Never your name. You can switch this off or delete what was sent anytime in Profile.</small></span></label>' +
      '<p class="hint">Under 18? Only tick this if a parent or guardian is OK with it.</p>' +
      '<div class="label">Your age (optional)</div><div class="chips" id="rc-age">' + AGE_BANDS.map(a => '<button class="chip ' + ((r.ageBand || 'na') === a[0] ? 'on' : '') + '" data-age="' + a[0] + '">' + a[1] + '</button>').join('') + '</div></div>';
  }
  function wireConsent(main) {
    const r = R();
    const box = $('#rc-consent', main);
    if (box) box.onchange = () => { MQ.cloud.setConsent(box.checked); };
    $$('#rc-age .chip', main).forEach(b => b.onclick = () => { r.ageBand = b.dataset.age; ST.save(); $$('#rc-age .chip', main).forEach(x => x.classList.toggle('on', x === b)); });
  }

  // ---------- Money Check ----------
  MQ.app.route('check', main => {
    const c = checks(), r = R();
    main.style.setProperty('--c', '#0ea5e9');
    if (c.pre && c.post) { main.innerHTML = '<h1>Money Check</h1>' + compareHtml(c) + '<a class="btn primary block lg" href="#/home">Home</a>'; return; }
    if (c.pre && !postUnlocked()) {
      const left = c.pre.lessons + LESSONS_BETWEEN - lessonsDone();
      main.innerHTML = '<h1>Money Check</h1><div class="card"><div class="kicker">Before</div><h2>' + pctOf(c.pre) + '%</h2><p>Your second check unlocks after <b>' + left + ' more lesson' + (left === 1 ? '' : 's') + '</b>. Then you can see how much you have grown.</p><div class="bar"><i style="width:' + ((LESSONS_BETWEEN - left) / LESSONS_BETWEEN * 100) + '%"></i></div></div><a class="btn primary block lg" href="#/learn">Go to lessons</a>';
      return;
    }
    const phase = c.pre ? 'post' : 'pre';
    if (!r.firstForm) { r.firstForm = Math.random() < 0.5 ? 'A' : 'B'; ST.save(); }
    const form = phase === 'pre' ? r.firstForm : (r.firstForm === 'A' ? 'B' : 'A');
    let confidence = null;
    main.innerHTML = '<div class="result pop check-intro"><div class="big-emoji">' + (phase === 'pre' ? '📊' : '📈') + '</div><h1>' + (phase === 'pre' ? 'Your Money Check' : 'Money Check: round 2') + '</h1>' +
      '<p class="sub">' + (phase === 'pre' ? '10 quick questions to see what you know right now. No hints and no pressure: tap "Not sure" rather than guessing.' : 'Same ideas, new questions. Let\'s see how much you have learned since your first check (' + pctOf(c.pre) + '%).') + '</p></div>' +
      '<div class="card"><div class="label">First: how confident do you feel about managing money?</div><div class="conf-row" id="conf">' + ['😟', '😕', '😐', '🙂', '😎'].map((e, i) => '<button class="conf" data-v="' + (i + 1) + '"><span>' + e + '</span><small>' + ['Not at all', 'A little', 'Somewhat', 'Quite', 'Very'][i] + '</small></button>').join('') + '</div></div>' +
      (r.consent === undefined || !r.consent ? consentHtml(r) : '') +
      '<button class="btn primary block lg" id="go" disabled>Start</button><a class="btn ghost block" href="#/home">Not now</a>';
    wireConsent(main);
    $$('.conf', main).forEach(b => b.onclick = () => { confidence = +b.dataset.v; $$('.conf', main).forEach(x => x.classList.toggle('sel', x === b)); $('#go').disabled = false; });
    $('#go').onclick = () => { if (r.consent === undefined) { r.consent = false; ST.save(); } run(phase, form, confidence); };

    function run(phase, form, confidence) {
      const items = shuffle(ITEMS.map((it, i) => ({ i, cat: it[1], q: it[form === 'A' ? 2 : 3] })));
      const started = Date.now();
      let k = 0;
      const got = [];
      function ask() {
        if (k >= items.length) return finish();
        const it = items[k], q = it.q;
        main.innerHTML = '<div class="lesson-top"><a href="#/home" class="x" aria-label="Quit">✕</a><div class="bar"><i style="width:' + (k / items.length * 100) + '%"></i></div></div>' +
          '<div class="quiz pop"><div class="kicker">📊 Money Check · ' + (k + 1) + ' / ' + items.length + '</div><h2>' + esc(money(q.q)) + '</h2>' +
          (q.t === 'num' ? '<div class="num-in">' + (q.prefix ? '<span>' + esc(MQ.ui.cur()) + '</span>' : '') + '<input id="ans" inputmode="decimal" autocomplete="off" placeholder="Your answer" aria-label="Your answer"></div>'
            : '<div class="opts' + (q.t === 'tf' ? ' tf' : '') + '">' + (q.t === 'tf' ? ['True', 'False'] : q.options).map((o, i) => '<button class="opt" data-i="' + i + '">' + esc(money(o)) + '</button>').join('') + '</div>') +
          '</div><div class="check-bar inline"><div class="row gap"><button class="btn ghost" id="unsure">🤷 Not sure</button><button class="btn primary" id="next" disabled>Next</button></div></div>';
        let pick = null;
        const inp = $('#ans', main);
        if (inp) { inp.oninput = () => { $('#next').disabled = isNaN(MQ.assess.parseNum(inp.value)); }; inp.onkeydown = e => { if (e.key === 'Enter' && !$('#next').disabled) $('#next').click(); }; setTimeout(() => inp.focus(), 50); }
        $$('.opt', main).forEach(b => b.onclick = () => { pick = +b.dataset.i; $$('.opt', main).forEach(x => x.classList.toggle('sel', x === b)); $('#next').disabled = false; });
        const next = ok => { got.push({ cat: it.cat, ok }); sound('tap'); k++; ask(); };
        $('#unsure').onclick = () => next(false);
        $('#next').onclick = () => {
          let ok;
          if (q.t === 'num') ok = Math.abs(MQ.assess.parseNum(inp.value) - q.answer) <= 0.5;
          else if (q.t === 'tf') ok = (pick === 0) === q.answer;
          else ok = pick === q.answer;
          next(ok);
        };
      }
      function finish() {
        const byCat = {};
        got.forEach(g => { const b = byCat[g.cat] = byCat[g.cat] || [0, 0]; if (g.ok) b[0]++; b[1]++; });
        const score = got.filter(g => g.ok).length;
        const rec = { form, score, total: got.length, confidence, byCat, lessons: lessonsDone(), date: ST.dateKey(), seconds: Math.round((Date.now() - started) / 1000) };
        checks()[phase] = rec;
        ST.save();
        MQ.cloud.send('money_checks', { phase, form, score, total: got.length, confidence, by_cat: byCat, seconds: rec.seconds, lessons_done: rec.lessons, difficulty: MQ.difficulty().id });
        if (phase === 'post') ST.flag('beforeAfter');
        ST.addXP(15, 'Money Check');
        MQ.app.renderHeader();
        sound('level');
        if (phase === 'pre') {
          main.innerHTML = '<div class="result pop"><div class="big-emoji bounce">📊</div><h1>Check complete!</h1><div class="result-stats"><div><b>' + score + '/' + got.length + '</b><span>today</span></div><div><b>+15</b><span>XP</span></div></div>' +
            '<div class="card left"><h3>Your starting point</h3>' + catBars(byCat) + '<p class="hint">Answers stay secret so your second check is fair. It unlocks after ' + LESSONS_BETWEEN + ' more lessons.</p></div>' +
            '<a class="btn primary block lg" href="#/learn">Start learning</a><a class="btn ghost block" href="#/home">Home</a></div>';
        } else {
          MQ.ui.confetti();
          main.innerHTML = '<h1>Money Check results</h1>' + compareHtml(checks()) + '<a class="btn primary block lg" href="#/survey">Tell us what you think (+20 XP)</a><a class="btn ghost block" href="#/home">Home</a>';
        }
      }
      ask();
    }
  });
  function catBars(byCat, before) {
    return Object.keys(CAT_NAMES).filter(k => byCat[k]).map(k => {
      const v = byCat[k][0] / byCat[k][1], b = before && before[k] ? before[k][0] / before[k][1] : null;
      return '<div class="unit-prog"><span>' + CAT_NAMES[k] + '</span><div class="bar dual">' + (b !== null ? '<em style="width:' + b * 100 + '%"></em>' : '') + '<i style="width:' + v * 100 + '%"></i></div><b>' + (b !== null ? Math.round(b * 100) + '→' : '') + Math.round(v * 100) + '%</b></div>';
    }).join('');
  }
  function compareHtml(c) {
    const a = pctOf(c.pre), b = pctOf(c.post), d = b - a;
    return '<div class="card compare"><div class="cmp"><div><small>Before</small><b>' + a + '%</b></div><span class="arrow">→</span><div><small>Now</small><b>' + b + '%</b></div><div class="delta ' + (d > 0 ? 'up' : d < 0 ? 'down' : '') + '">' + (d > 0 ? '+' : '') + d + ' pts</div></div>' +
      (c.pre.confidence && c.post.confidence ? '<p class="small">Confidence: ' + ['😟', '😕', '😐', '🙂', '😎'][c.pre.confidence - 1] + ' → ' + ['😟', '😕', '😐', '🙂', '😎'][c.post.confidence - 1] + '</p>' : '') +
      '<h3>By topic</h3>' + catBars(c.post.byCat, c.pre.byCat) +
      '<p class="hint">' + (d > 0 ? 'You improved by ' + d + ' percentage points. That is real progress. 🎉' : d === 0 ? 'Same score as before. Try the units where your bar is shortest.' : 'A dip can happen. Have another go at the topics with the shortest bars.') + '</p></div>';
  }

  // ---------- Survey ----------
  MQ.app.route('survey', main => {
    const r = R();
    main.style.setProperty('--c', '#f59e0b');
    if (r.survey) { main.innerHTML = '<div class="result"><div class="big-emoji">🙏</div><h1>Thanks for your feedback!</h1><p class="sub">You already completed the survey.</p><a class="btn primary block lg" href="#/home">Home</a></div>'; return; }
    const ans = {};
    const likert = (id, q) => '<div class="card"><div class="label">' + q + '</div><div class="likert" data-q="' + id + '">' + ['Strongly disagree', 'Disagree', 'Not sure', 'Agree', 'Strongly agree'].map((l, i) => '<button class="chip" data-v="' + (i + 1) + '">' + l + '</button>').join('') + '</div></div>';
    main.innerHTML = '<h1>Quick survey</h1><p class="sub">1 minute. Your answers help make FiQuo better' + (r.consent ? ' and are shared anonymously.' : '. Turn on anonymous sharing below to help measure FiQuo\'s impact.') + '</p>' +
      likert('learned', 'FiQuo taught me something new about money.') +
      likert('habits', 'I will change how I save or spend because of FiQuo.') +
      '<div class="card"><div class="label">How likely are you to recommend FiQuo to a friend?</div><div class="nps" data-q="nps">' + Array.from({ length: 11 }, (_, i) => '<button class="chip" data-v="' + i + '">' + i + '</button>').join('') + '</div><div class="row small muted"><span>Not likely</span><span>Very likely</span></div></div>' +
      '<div class="card"><div class="label">Your favourite part?</div><div class="chips" data-q="favourite">' + FAVOURITES.map(f => '<button class="chip" data-v="' + esc(f) + '">' + esc(f) + '</button>').join('') + '</div></div>' +
      '<div class="card"><label class="label" for="quote">Anything else? (optional)</label><textarea id="quote" class="input" rows="3" maxlength="280" placeholder="What did you learn, or what should we add?"></textarea>' +
      '<label class="check-row"><input type="checkbox" id="quote-ok"><span><b>FiQuo may share this comment anonymously</b><small>Please don\'t include names or personal details.</small></span></label></div>' +
      (r.consent ? '' : consentHtml(r)) +
      '<button class="btn primary block lg" id="send" disabled>Send feedback</button>';
    wireConsent(main);
    $$('[data-q]', main).forEach(group => $$('.chip', group).forEach(b => b.onclick = () => {
      const k = group.dataset.q;
      ans[k] = k === 'favourite' ? b.dataset.v : +b.dataset.v;
      $$('.chip', group).forEach(x => x.classList.toggle('on', x === b));
      $('#send').disabled = !(ans.learned && ans.habits && ans.nps !== undefined);
    }));
    $('#send').onclick = () => {
      const quote = $('#quote').value.trim().slice(0, 280);
      r.survey = Object.assign({ date: ST.dateKey() }, ans);
      ST.save();
      MQ.cloud.send('surveys', { learned: ans.learned, habits: ans.habits, nps: ans.nps, favourite: ans.favourite || null, quote: quote || null, quote_ok: !!(quote && $('#quote-ok').checked) });
      ST.flag('feedback');
      ST.addXP(20, 'Survey');
      MQ.app.renderHeader();
      MQ.ui.confetti();
      main.innerHTML = '<div class="result pop"><div class="big-emoji bounce">🙏</div><h1>Thank you!</h1><p class="sub">Your feedback shapes what gets built next.</p><a class="btn primary block lg" href="#/home">Home</a><a class="btn ghost block" href="#/about">See FiQuo\'s story & impact</a></div>';
    };
  });

  // ---------- Class codes ----------
  const CODE_RE = /^FQ-[A-Z0-9]{6}$/;
  function normCode(c) { c = String(c || '').toUpperCase().replace(/\s/g, ''); if (/^[A-Z0-9]{6}$/.test(c)) c = 'FQ-' + c; return c; }
  async function joinClass(code) {
    code = normCode(code);
    if (!CODE_RE.test(code)) throw new Error('Class codes look like FQ-ABC123');
    let name = null;
    if (MQ.cloud.enabled()) {
      name = await MQ.cloud.rpc('class_name', { p_code: code });
      if (!name) throw new Error('No class found with code ' + code);
    }
    const r = R();
    r.classCode = code; r.className = name; delete r.pendingClass;
    ST.save();
    return { code, name };
  }
  MQ.app.route('join', (main, args) => {
    const r = R(), code = normCode(args[0]);
    main.style.setProperty('--c', '#0ea5e9');
    main.innerHTML = '<div class="result"><div class="big-emoji">🏫</div><h1>Join a class</h1><p class="sub">Code <b>' + esc(code) + '</b></p><p class="muted small" id="cls-name"></p></div>' +
      '<div class="card"><p>Your teacher will see <b>class averages only</b> (Money Check improvement, unit test scores, survey results), and only once 3 or more classmates have results. Never your name or individual answers.</p></div>' +
      consentHtml(r) + '<button class="btn primary block lg" id="join">Join class</button><a class="btn ghost block" href="#/home">Not now</a>';
    wireConsent(main);
    if (MQ.cloud.enabled()) MQ.cloud.rpc('class_name', { p_code: code }).then(n => { const el = $('#cls-name'); if (el) el.textContent = n ? '📚 ' + n : '⚠️ No class found with this code.'; }).catch(() => {});
    $('#join').onclick = async () => {
      try {
        const res = await joinClass(code);
        if (!R().consent) toast('Joined. Tick "Share my anonymous results" so your scores count for the class.', 'good');
        else toast('🏫 Joined ' + (res.name || res.code), 'good');
        MQ.app.go('#/home');
      } catch (e) { toast(e.message, 'bad'); }
    };
  });

  // ---------- Profile card: research, class code, delete ----------
  function profileHtml() {
    const r = R();
    return '<h2 class="section">📊 Research & class</h2><div class="card research">' +
      (checks().pre ? '<div class="ledger"><div><span>Money Check before</span><b>' + pctOf(checks().pre) + '%</b></div><div><span>Money Check after</span><b>' + (checks().post ? pctOf(checks().post) + '%' : postUnlocked() ? '<a href="#/check">Take it ›</a>' : 'locked') + '</b></div></div>' : '<a class="row-link" href="#/check">📊 Take your Money Check ›</a>') +
      consentHtml(r) +
      '<div class="label">Class code</div><div class="code-row"><input class="input" id="rc-class" maxlength="12" placeholder="FQ-ABC123" value="' + esc(r.classCode || '') + '"><button class="btn" id="rc-join">' + (r.classCode ? 'Change' : 'Join') + '</button></div>' +
      (r.classCode ? '<p class="hint">In class ' + esc(r.className || r.classCode) + '. <a href="#" id="rc-leave">Leave class</a></p>' : '<p class="hint">Got a code from your teacher? Enter it here.</p>') +
      '<button class="btn ghost block sm" id="rc-forget">Delete my shared research data</button>' +
      '<p class="hint">Device ID: ' + esc(r.anonId.slice(0, 8)) + '… · ' + (MQ.cloud.enabled() ? (r.queue.length ? r.queue.length + ' result(s) waiting to send' : 'all results sent') : 'research server not connected yet; nothing leaves this device') + '</p></div>';
  }
  function wireProfile(main) {
    wireConsent(main);
    $('#rc-join').onclick = async () => { try { const res = await joinClass($('#rc-class').value); toast('🏫 Joined ' + (res.name || res.code), 'good'); MQ.app.render(); } catch (e) { toast(e.message, 'bad'); } };
    const leave = $('#rc-leave');
    if (leave) leave.onclick = e => { e.preventDefault(); const r = R(); delete r.classCode; delete r.className; ST.save(); MQ.app.render(); };
    $('#rc-forget').onclick = () => {
      MQ.ui.modal('<h2>Delete shared data?</h2><p>This deletes every score and survey answer this device has sent to FiQuo\'s research database, and turns sharing off. Your progress on this device stays.</p><div class="row gap"><button class="btn ghost" data-close>Cancel</button><button class="btn danger" id="yes">Delete</button></div>');
      $('#yes').onclick = async () => {
        try { const n = await MQ.cloud.forgetMe(); MQ.ui.closeModal(); toast('Deleted ' + (n || 0) + ' shared record(s). Sharing is off.', 'good'); MQ.app.render(); }
        catch (e) { toast('Could not reach the server. Try again when online.', 'bad'); }
      };
    };
  }

  // ---------- Stats rendering (public story page + teacher dashboard) ----------
  function unitTitle(id) {
    const u = MQ.UNITS.concat(MQ.ADV_UNITS || [], Object.values(MQ.COUNTRY_UNITS || {})).find(x => x.id === id);
    return u ? u.emoji + ' ' + u.title : id;
  }
  function tile(v, label, sub) { return '<div class="stat"><b>' + v + '</b><small>' + label + '</small>' + (sub ? '<em>' + sub + '</em>' : '') + '</div>'; }
  function effect(s) {
    if (!(s.pairs >= 5 && s.sd_gain > 0)) return '';
    const d = s.avg_gain / s.sd_gain;
    const size = Math.abs(d) >= 0.8 ? 'large' : Math.abs(d) >= 0.5 ? 'medium' : Math.abs(d) >= 0.2 ? 'small' : 'very small';
    return '<p class="small">Effect size (Cohen\'s d): <b>' + d.toFixed(2) + '</b>, a ' + size + ' effect.</p>';
  }
  function statsHtml(s, teacher) {
    if (s.hidden) return '<div class="card"><h3>Waiting for more students</h3><p>' + s.learners + ' student(s) so far. Results appear once at least 3 students have shared results, so no one can be singled out.</p></div>';
    const n = x => (x === null || x === undefined) ? '–' : x;
    let h = '<div class="stat-grid impact-tiles">' +
      tile(n(s.learners), teacher ? 'students' : 'learners shared results') +
      tile(n(s.checks_pre), 'Money Checks taken') +
      tile(s.pairs ? (s.avg_gain > 0 ? '+' : '') + s.avg_gain + ' pts' : '–', 'average improvement', s.pairs ? s.avg_pre + '% → ' + s.avg_post + '%' : 'needs before & after checks') +
      tile(s.pairs ? s.pct_improved + '%' : '–', 'improved their score', s.pairs ? s.pairs + ' before/after pairs' : '') +
      tile(s.conf_pre && s.conf_post ? s.conf_pre + ' → ' + s.conf_post : '–', 'confidence (1–5)') +
      tile(n(s.tests), 'unit tests completed', s.avg_test !== null && s.avg_test !== undefined ? 'average ' + s.avg_test + '%' : '') +
      '</div>' + effect(s);
    if (s.by_cat && Object.keys(s.by_cat).length) {
      h += '<div class="card"><h3>Improvement by topic</h3>' + Object.keys(CAT_NAMES).filter(k => s.by_cat[k]).map(k => { const c = s.by_cat[k]; return '<div class="unit-prog"><span>' + CAT_NAMES[k] + '</span><div class="bar dual"><em style="width:' + c.pre + '%"></em><i style="width:' + c.post + '%"></i></div><b>' + c.pre + '→' + c.post + '%</b></div>'; }).join('') + '<p class="hint">Light bar: before. Dark bar: after.</p></div>';
    }
    if (teacher && s.units && Object.keys(s.units).length) {
      h += '<div class="card"><h3>Unit test averages</h3>' + Object.keys(s.units).map(u => '<div class="unit-prog"><span>' + esc(unitTitle(u)) + '</span><div class="bar"><i style="width:' + s.units[u].avg + '%"></i></div><b>' + s.units[u].avg + '% · ' + s.units[u].n + '</b></div>').join('') + '</div>';
    }
    if (s.surveys) {
      const fav = Object.entries(s.favourites || {}).sort((a, b) => b[1] - a[1])[0];
      h += '<div class="card"><h3>What learners say (' + s.surveys + ' surveys)</h3><div class="ledger">' +
        '<div><span>"FiQuo taught me something new"</span><b>' + n(s.learned_agree) + '% agree</b></div>' +
        '<div><span>"I will change how I save or spend"</span><b>' + n(s.habits_agree) + '% agree</b></div>' +
        '<div><span>Net Promoter Score (−100 to +100)</span><b>' + n(s.nps) + '</b></div>' +
        (fav ? '<div><span>Favourite feature</span><b>' + esc(fav[0]) + '</b></div>' : '') + '</div></div>';
    }
    if (s.quotes && s.quotes.length) h += '<div class="quotes">' + s.quotes.map(q => '<blockquote class="card">"' + esc(q.q) + '"<cite>Learner' + (q.age && q.age !== 'na' ? ', ' + esc(q.age) : '') + (q.country && MQ.COUNTRIES[q.country] ? ', ' + MQ.COUNTRIES[q.country].flag : '') + '</cite></blockquote>').join('') + '</div>';
    if (!teacher && s.countries && Object.keys(s.countries).length) h += '<p class="small muted center">Learners in ' + Object.keys(s.countries).map(k => MQ.COUNTRIES[k] ? MQ.COUNTRIES[k].flag + ' ' + MQ.COUNTRIES[k].name : k).join(', ') + '.</p>';
    return h;
  }

  // ---------- Our story (public: works without a profile) ----------
  MQ.app.route('about', main => {
    const C = MQ.CONFIG || {};
    const lessons = Object.keys(MQ.LESSONS).length, units = MQ.UNITS.length + (MQ.ADV_UNITS || []).length;
    const games = (MQ.GAMES || []).length;
    const step = (when, title, body) => '<li><span class="when">' + when + '</span><b>' + title + '</b><p>' + body + '</p></li>';
    main.innerHTML =
      '<div class="story-hero"><div class="big-emoji">💸</div><h1>The FiQuo story</h1><p class="sub">A free game that teaches teenagers how money really works, built by ' + (C.founder ? esc(C.founder) + ', a high-school student,' : 'a high-school student') + ' as a CAS project.</p>' +
      (S().profile ? '' : '<a class="btn primary lg" href="#/home">Try FiQuo free</a>') + '</div>' +
      '<section class="card story"><h2>🎯 Why it exists</h2><p>Teens already make money decisions every day: pocket money, online shopping, in-game purchases, UPI payments and scam messages. But most schools never teach personal finance. In S&P Global\'s worldwide financial literacy survey (2015), only about <b>1 in 4 adults in India</b> were financially literate.</p><p>FiQuo turns money skills into a game teens actually want to play: short lessons, games and simulations with streaks and leagues, and no real money involved.</p></section>' +
      '<section class="card story"><h2>🧰 What\'s inside</h2><div class="stat-grid">' + tile(lessons, 'lessons') + tile(units, 'units') + tile(games, 'mini-games') + tile(7, 'question types') + tile(4, 'country modes') + tile(3, 'difficulty levels') + '</div>' +
      '<p class="small">Plus a Life Simulator, a Portfolio Simulator using real historical market periods, unit tests with auto-marked short answers, an adaptive Financial Literacy Score, and friend challenges.</p></section>' +
      '<section class="card story"><h2>📈 Impact so far</h2><div id="impact"><p class="muted">' + (MQ.cloud.enabled() ? 'Loading live numbers…' : 'Live impact numbers will appear here once the research server is connected.') + '</p></div></section>' +
      '<section class="card story"><h2>🔬 How we measure it</h2><ul class="list">' +
      '<li><b>Money Check before and after.</b> Learners take a 10-question check when they start and again after at least ' + LESSONS_BETWEEN + ' more lessons.</li>' +
      '<li><b>Two matched versions.</b> Both checks test the same 10 ideas with different numbers. Each learner is randomly given version A or B first, so neither version being easier can skew the result.</li>' +
      '<li><b>Fair baselines.</b> A before/after pair only counts if the first check was taken before finishing more than 3 lessons.</li>' +
      '<li><b>Answers stay hidden</b> after the first check, so the second one measures learning, not memory.</li>' +
      '<li><b>Plus</b> a confidence rating, unit test scores and a short survey.</li></ul></section>' +
      '<section class="card story"><h2>🛤️ Built with feedback</h2><ol class="timeline">' +
      step('Start', 'First version', 'Lessons, mini-games, a Life Simulator and a Portfolio Simulator, with streaks, leagues and badges.') +
      step('Feedback', '"Salaries aren\'t relevant to us"', 'Teen testers said salary and tax topics felt far away, so I rebuilt the content around pocket money, gaming, friends and FOMO.') +
      step('Feedback', 'Teens in India don\'t have jobs', 'India mode now uses pocket money and allowances; the US and UK keep part-time jobs.') +
      step('Oct 2026', 'Public launch', 'Went live at fiquo.netlify.app on phones, tablets and laptops, listed on Google, with privacy-friendly analytics.') +
      step('Feedback', '"It\'s too easy" and "how does XP work?"', 'Added Beginner, Standard and Advanced difficulty levels and a page explaining XP and levels.') +
      step('Feedback', '"We need real tests"', 'Added Khan Academy-style quizzes and unit tests with 7 question types, including auto-marked short answers, plus 3 advanced courses.') +
      step('Now', 'Measuring impact', 'Added the Money Check, a feedback survey and anonymous class dashboards for teachers.') +
      '</ol></section>' +
      '<section class="card story"><h2>🔒 Privacy first</h2><p>No sign-up, no ads, no real money. Progress stays on your device. Research data is <b>opt-in and anonymous</b>: scores and survey answers with a random ID, never names. Anyone can delete what they shared from Profile.</p></section>' +
      '<section class="card story teach"><h2>🏫 For teachers</h2><p>Use FiQuo in class for free. Create a class code, students join from their phones, and you see anonymous class averages: Money Check improvement, unit test scores and survey results.</p><a class="btn primary" href="#/teacher">Open the teacher dashboard</a>' +
      (C.contactEmail ? '<p class="small">Questions? <a href="mailto:' + esc(C.contactEmail) + '">' + esc(C.contactEmail) + '</a></p>' : '') + '</section>' +
      '<p class="hint center">FiQuo is an educational game. All money, stocks and events are simulated. Not financial advice.</p>';
    if (MQ.cloud.enabled()) MQ.cloud.rpc('public_stats').then(s => { const el = $('#impact'); if (el) el.innerHTML = s && s.learners ? statsHtml(s, false) : '<p class="muted">No shared results yet. Be one of the first: take the Money Check!</p>'; })
      .catch(() => { const el = $('#impact'); if (el) el.innerHTML = '<p class="muted">Could not load live numbers right now.</p>'; });
  });

  // ---------- Teacher dashboard (public: works without a profile) ----------
  MQ.app.route('teacher', main => {
    const T = S().teacher = S().teacher || { classes: [] };
    const link = code => location.origin + location.pathname + '#/join/' + code;
    main.style.setProperty('--c', '#0ea5e9');
    let html = '<h1>🏫 Teacher dashboard</h1><p class="sub">Free class codes with anonymous class averages. No student names or emails, ever.</p>';
    if (!MQ.cloud.enabled()) {
      main.innerHTML = html + '<div class="card"><h3>Coming soon</h3><p>Class dashboards are being connected. You can already use FiQuo in class: students open <b>' + esc(location.host || 'fiquo.netlify.app') + '</b>, pick a nickname and start the Teen Money Life unit.</p></div>';
      return;
    }
    html += '<div class="card"><h3>Create a class</h3><div class="code-row"><input class="input" id="t-name" maxlength="60" placeholder="e.g. Grade 9B Economics"><button class="btn primary" id="t-create">Create</button></div></div>' +
      (T.classes.length ? '<h2 class="section">Your classes</h2>' + T.classes.map((c, i) => '<div class="card class-card"><div class="row"><div><h3>' + esc(c.name) + '</h3><p class="mono">' + esc(c.code) + '</p></div><button class="btn sm" data-open="' + i + '">View results</button></div>' +
        '<p class="small">Students join at <a href="' + esc(link(c.code)) + '">' + esc(link(c.code)) + '</a> or enter <b>' + esc(c.code) + '</b> in Profile.</p>' +
        '<p class="hint">Teacher key (keep it private, it opens the results): <span class="mono">' + esc(c.key) + '</span></p><div class="class-stats" id="cs-' + i + '"></div></div>').join('') : '') +
      '<div class="card"><h3>Open a class from another device</h3><div class="code-row"><input class="input" id="t-code" placeholder="FQ-ABC123"><input class="input" id="t-key" placeholder="Teacher key"><button class="btn" id="t-add">Open</button></div></div>' +
      '<div class="card"><h3>How to run a lesson with FiQuo</h3><ol class="list"><li>Share the join link. Students tick "Share my anonymous results".</li><li>Everyone takes the 3-minute <b>Money Check</b> first.</li><li>Work through a unit together, then the unit test.</li><li>After 5+ lessons, students retake the Money Check and fill in the 1-minute survey.</li><li>Your dashboard shows the class\'s average improvement.</li></ol></div>';
    main.innerHTML = html;
    $('#t-create').onclick = async () => {
      const name = $('#t-name').value.trim();
      if (!name) { toast('Give the class a name', 'bad'); return; }
      try { const c = await MQ.cloud.rpc('create_class', { p_name: name }); T.classes.unshift(c); ST.save(); toast('Class created: ' + c.code, 'good'); MQ.app.render(); }
      catch (e) { toast('Could not create the class: ' + e.message, 'bad'); }
    };
    $('#t-add').onclick = async () => {
      const code = normCode($('#t-code').value), key = $('#t-key').value.trim();
      try { const s = await MQ.cloud.rpc('class_stats', { p_code: code, p_key: key }); T.classes.unshift({ code, key, name: s.name }); ST.save(); MQ.app.render(); }
      catch (e) { toast(e.message, 'bad'); }
    };
    $$('[data-open]', main).forEach(b => b.onclick = async () => {
      const i = +b.dataset.open, c = T.classes[i], el = $('#cs-' + i);
      el.innerHTML = '<p class="muted">Loading…</p>';
      try { el.innerHTML = statsHtml(await MQ.cloud.rpc('class_stats', { p_code: c.code, p_key: c.key }), true); }
      catch (e) { el.innerHTML = '<p class="muted">' + esc(e.message) + '</p>'; }
    });
  });

  MQ.impact = { homeCard, profileHtml, wireProfile, statsHtml, ITEMS, checks, postUnlocked };
})(window.MQ);
