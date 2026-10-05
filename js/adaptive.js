// Adaptive learning: per-category Financial Literacy Score, generated practice questions and weak-spot review.
window.MQ = window.MQ || {};

(function (MQ) {
  const { $, $$, esc, money, fmt, toast, sound, shuffle } = MQ.ui;
  const ST = MQ.state;

  const CATS = [
    { id: 'budgeting', name: 'Budgeting', e: '📝', unit: 'basics', lesson: 'basics-2', concept: 'the 50/30/20 rule and tracking spending', refresher: 'A budget is a plan: income − expenses. A simple split is 50% needs, 30% wants, 20% savings. Small daily habits add up: multiply by 365 (or 260 for school days) to see the yearly cost.' },
    { id: 'saving', name: 'Saving', e: '🐷', unit: 'saving', lesson: 'saving-3', concept: 'compound interest and emergency funds', refresher: 'Compound interest = interest on your interest. Each year multiply by (1 + rate). The Rule of 72: 72 ÷ rate ≈ years to double. An emergency fund is a few months of essential expenses.' },
    { id: 'earning', name: 'Taxes & Income', e: '💼', unit: 'earning', lesson: 'earning-1', concept: 'gross vs net pay and how tax brackets work', refresher: 'Gross pay = hours × rate. Net pay = gross − deductions (tax etc.). Tax brackets only tax the part of income above each threshold at the higher rate. Profit = revenue − costs.' },
    { id: 'credit', name: 'Credit', e: '💳', unit: 'credit', lesson: 'credit-2', concept: 'APR, total cost of borrowing and credit utilization', refresher: 'The total cost of a loan = all payments − amount borrowed. Longer loans have smaller payments but usually cost more in total. Credit utilization = balance ÷ limit; under ~30% looks good.' },
    { id: 'investing', name: 'Investing', e: '📈', unit: 'investing', lesson: 'investing-3', concept: 'risk, inflation and diversification', refresher: 'Higher potential return means higher risk. Inflation shrinks buying power: future price = price × (1 + inflation)^years. Real return ≈ return − inflation. Spreading money across assets (diversification) softens losses.' },
    { id: 'safety', name: 'Money Safety', e: '🛡️', unit: 'safety', lesson: 'safety-1', concept: 'spotting scam red flags', refresher: 'Red flags: urgency or threats, requests for PINs/OTPs/passwords, strange links, payment by gift card or crypto, guaranteed returns, and "pay a fee to get your prize".' }
  ];
  const BY = {}; CATS.forEach(c => BY[c.id] = c);
  const UNIT_CAT = { basics: 'budgeting', saving: 'saving', earning: 'earning', credit: 'credit', investing: 'investing', safety: 'safety' };

  function S() { return ST.get(); }
  function catOfLesson(id) { const l = MQ.LESSONS[id]; return l ? (l.cat || UNIT_CAT[l.unitId] || 'budgeting') : 'budgeting'; }

  // ---------- Scoring (decayed accuracy, so recent answers matter more) ----------
  function ensureWeek() {
    const s = S(), wk = ST.dateKey(ST.weekStart());
    if (!s.skillWeek || s.skillWeek.week !== wk) s.skillWeek = { week: wk, base: overall() };
  }
  function recordAnswer(cat, ok, qid, weight) {
    if (!BY[cat]) return;
    ensureWeek();
    weight = weight || 1;
    const s = S(), sk = s.skills[cat] = s.skills[cat] || { c: 0, t: 0, n: 0 };
    sk.c = sk.c * 0.9 + (ok ? weight : 0);
    sk.t = sk.t * 0.9 + weight;
    sk.n++;
    if (qid) {
      const q = s.qstats[qid] = s.qstats[qid] || { r: 0, w: 0 };
      if (ok) q.r++; else q.w++;
      q.last = ST.dateKey();
    }
    ST.save();
  }
  // A game result between 0 and 1 counts like a couple of answers.
  function recordResult(cat, fraction, weight) {
    if (!BY[cat]) return;
    ensureWeek();
    weight = weight || 2;
    const s = S(), sk = s.skills[cat] = s.skills[cat] || { c: 0, t: 0, n: 0 };
    const f = Math.max(0, Math.min(1, fraction));
    sk.c = sk.c * 0.85 + f * weight;
    sk.t = sk.t * 0.85 + weight;
    sk.n += 2;
    ST.save();
  }
  function score(cat) { const sk = S().skills[cat]; return sk && sk.n ? (sk.c + 1) / (sk.t + 2) : null; }
  function attempts(cat) { const sk = S().skills[cat]; return sk ? sk.n : 0; }
  function overall() {
    const v = CATS.map(c => score(c.id)).filter(x => x !== null);
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
  }
  function improvement() { const s = S(); if (!s.skillWeek || s.skillWeek.week !== ST.dateKey(ST.weekStart())) return 0; return Math.max(0, overall() - s.skillWeek.base); }
  function allAbove(x) { return CATS.every(c => attempts(c.id) >= 3 && score(c.id) >= x); }
  function weakest() {
    let best = null;
    CATS.forEach(c => { const sc = score(c.id); if (attempts(c.id) >= 3 && sc < 0.6 && (!best || sc < best.score)) best = { cat: c, score: sc }; });
    return best;
  }
  function strongest() {
    let best = null;
    CATS.forEach(c => { const sc = score(c.id); if (attempts(c.id) >= 3 && (!best || sc > best.score)) best = { cat: c, score: sc }; });
    return best;
  }

  // ---------- Question generators (fresh numbers every time) ----------
  function k() { const c = MQ.country(); return (c.first.income[0] + c.first.income[1]) / 2 / 3500; }
  function M(x) { return MQ.roundNice(x * k()); }
  function ri(r, a, b) { return a + Math.floor(r() * (b - a + 1)); }
  function mc(r, correct, wrongs, explain, extra) {
    const uniq = [];
    [correct].concat(wrongs).forEach(o => { if (!uniq.includes(o)) uniq.push(o); });
    const opts = shuffle(uniq, r);
    return Object.assign({ options: opts, answer: opts.indexOf(correct), explain }, extra);
  }
  const F = n => fmt(Math.round(n));

  const GEN = {
    budgeting: [
      (r, lvl) => {
        const part = MQ.pick(r, [['needs', 50], ['wants', 30], ['savings and debt payments', 20]]);
        return mc(r, part[1] + '%', ['50%', '30%', '20%', '10%'].filter(x => x !== part[1] + '%').slice(0, 3), 'In 50/30/20: 50% needs, 30% wants, 20% savings and debt payments.', { q: 'In the 50/30/20 rule, what share goes to ' + part[0] + '?' });
      },
      (r, lvl) => {
        const inc = M(ri(r, 3, 9) * 100), part = MQ.pick(r, [['wants', 0.3], ['savings', 0.2], ['needs', 0.5]]);
        const a = inc * part[1];
        return mc(r, F(a), [F(inc * 0.1), F(inc * (part[1] === 0.3 ? 0.2 : 0.3)), F(inc * (part[1] === 0.5 ? 0.2 : 0.5))], part[1] * 100 + '% of ' + F(inc) + ' = ' + F(a) + '.', { q: 'You take home ' + F(inc) + ' a month. Using 50/30/20, how much goes to ' + part[0] + '?' });
      },
      (r, lvl) => {
        const inc = M(ri(r, 4, 9) * 100), exp = inc + M((ri(r, -12, 12) * 10) || 30);
        const d = inc - exp;
        const word = d >= 0 ? 'surplus of ' + F(d) : 'deficit of ' + F(-d);
        return mc(r, word, ['surplus of ' + F(Math.abs(d) + M(20)), 'deficit of ' + F(Math.abs(d) + M(40)), d >= 0 ? 'deficit of ' + F(d) : 'surplus of ' + F(-d)], 'Income − expenses = ' + F(inc) + ' − ' + F(exp) + ' = ' + (d >= 0 ? '' : '−') + F(Math.abs(d)) + '.', { q: 'Income: ' + F(inc) + '. Expenses: ' + F(exp) + '. What do you have?' });
      },
      (r, lvl) => {
        const d = M(ri(3, 7)), y = d * 260;
        return mc(r, F(y), [F(d * 52), F(d * 30), F(d * 1000)], d + ' × 5 school days × 52 weeks = ' + F(y) + '. Small habits add up!', { q: 'You spend ' + F(d) + ' on snacks every school day (5 days a week, all year). About how much is that per year?' });
      }
    ],
    saving: [
      (r, lvl) => {
        const p = M(ri(5, 20) * 100), rate = ri(3, 9), a = p * (1 + rate / 100);
        return mc(r, F(a), [F(p + rate), F(p * (1 + rate / 10)), F(p * rate / 100)], p + ' × ' + (1 + rate / 100).toFixed(2) + ' = ' + F(a) + '.', { q: F(p) + ' earns ' + rate + '% interest for one year. How much do you have at the end?' });
      },
      (r, lvl) => {
        const p = M(ri(5, 20) * 100), rate = MQ.pick(r, [5, 10, 8]), a = p * Math.pow(1 + rate / 100, 2);
        return mc(r, F(a), [F(p * (1 + 2 * rate / 100)), F(p * (1 + rate / 100)), F(p * Math.pow(1 + rate / 100, 3))], 'Year 1: ×' + (1 + rate / 100) + ', year 2: ×' + (1 + rate / 100) + ' again. Compounding beats simple interest of ' + F(p * (1 + 2 * rate / 100)) + '.', { q: F(p) + ' grows at ' + rate + '% per year, compounded yearly. Value after 2 years?' });
      },
      (r, lvl) => {
        const rate = MQ.pick(r, [3, 4, 6, 8, 9, 12]), y = 72 / rate;
        return mc(r, 'About ' + y + ' years', ['About ' + (y * 2) + ' years', 'About ' + Math.max(1, Math.round(y / 2)) + ' years', 'About ' + (y + 10) + ' years'], 'Rule of 72: 72 ÷ ' + rate + ' ≈ ' + y + ' years.', { q: 'Using the Rule of 72, how long does money take to double at ' + rate + '% a year?' });
      },
      (r, lvl) => {
        const e = M(ri(8, 20) * 100), m = MQ.pick(r, [3, 6]);
        return mc(r, F(e * m), [F(e), F(e * 12), F(e * m / 2)], m + ' months × ' + F(e) + ' = ' + F(e * m) + '.', { q: 'Your essential costs are ' + F(e) + ' a month. How big is a ' + m + '-month emergency fund?' });
      }
    ],
    earning: [
      (r, lvl) => {
        const h = ri(8, 20), rate = M(ri(10, 16)), g = h * rate;
        return mc(r, F(g), [F(g + rate), F(h + rate), F(g * 0.8)], h + ' hours × ' + F(rate) + ' = ' + F(g) + '.', { q: 'You work ' + h + ' hours at ' + F(rate) + ' an hour. What is your gross pay?' });
      },
      (r, lvl) => {
        const g = M(ri(4, 12) * 100), d = MQ.pick(r, [10, 15, 20, 25]), n = g * (1 - d / 100);
        return mc(r, F(n), [F(g), F(g * d / 100), F(g * (1 + d / 100))], 'Net = gross − ' + d + '% = ' + F(g) + ' − ' + F(g * d / 100) + ' = ' + F(n) + '.', { q: 'Your gross pay is ' + F(g) + ' and ' + d + '% is deducted. What is your net (take-home) pay?' });
      },
      (r, lvl) => {
        const price = M(ri(8, 20)), cost = Math.round(price * (0.3 + r() * 0.4)), n = ri(10, 40), p = (price - cost) * n;
        return mc(r, F(p), [F(price * n), F(cost * n), F((price + cost) * n)], 'Profit per item ' + F(price - cost) + ' × ' + n + ' = ' + F(p) + '.', { q: 'You sell ' + n + ' items at ' + F(price) + '. Each costs ' + F(cost) + ' to make. Total profit?' });
      },
      (r, lvl) => {
        const t = M(ri(10, 20) * 1000), x = M(ri(2, 9) * 1000), tax = x * 0.2;
        return mc(r, F(tax), [F((t + x) * 0.2), F(t * 0.2), 'Nothing'], 'Only the ' + F(x) + ' above the threshold is taxed at 20%: ' + F(tax) + '.', { q: 'Income up to ' + F(t) + ' is tax-free. Income above that is taxed at 20%. You earn ' + F(t + x) + '. How much tax?' });
      }
    ],
    credit: [
      (r, lvl) => {
        const lim = M(ri(5, 20) * 100), b = Math.round(lim * MQ.pick(r, [0.1, 0.2, 0.5, 0.8, 0.9]) / 10) * 10, u = Math.round(b / lim * 100);
        return mc(r, u + '%' + (u <= 30 ? ' (healthy)' : ' (high)'), [u + '%' + (u <= 30 ? ' (high)' : ' (healthy)'), Math.min(100, u + 20) + '%' + ' (high)', Math.max(1, Math.round(u / 3)) + '% (healthy)'], F(b) + ' ÷ ' + F(lim) + ' = ' + u + '%. Under about 30% looks responsible.', { q: 'Credit limit ' + F(lim) + ', balance ' + F(b) + '. What is your utilization?' });
      },
      (r, lvl) => {
        const p = M(ri(5, 15) * 100), apr = MQ.pick(r, [12, 18, 24, 30]), n = MQ.pick(r, [12, 24]);
        const i = apr / 1200, m = Math.round(p * i / (1 - Math.pow(1 + i, -n))), tot = m * n - p;
        return mc(r, F(tot), [F(p * apr / 100), F(m), F(tot / 2)], F(m) + ' × ' + n + ' months = ' + F(m * n) + ', minus the ' + F(p) + ' borrowed = ' + F(tot) + ' of interest.', { q: 'You borrow ' + F(p) + ' and repay ' + F(m) + ' a month for ' + n + ' months. How much interest do you pay in total?' });
      },
      (r, lvl) => {
        const p = M(ri(8, 20) * 100);
        const tot = (apr, n) => { const i = apr / 1200, m = p * i / (1 - Math.pow(1 + i, -n)); return m * n - p; };
        const a = tot(12, 12), b = tot(10, 48);
        const ans = a < b ? '12 months at 12% APR' : '48 months at 10% APR';
        return mc(r, ans, [ans === '12 months at 12% APR' ? '48 months at 10% APR' : '12 months at 12% APR', 'They cost exactly the same'], 'Total interest: 12 months at 12% ≈ ' + F(a) + ', 48 months at 10% ≈ ' + F(b) + '. A longer loan means more months of interest, even at a lower rate.', { q: 'Borrowing ' + F(p) + '. Which costs LESS interest in total?' });
      },
      (r, lvl) => {
        const p = M(ri(5, 15) * 100), y = MQ.pick(r, [1, 2, 3]), flat = p * 0.1 * y;
        return mc(r, F(flat), [F(p * 0.1), F(flat / 2), F(p * Math.pow(1.1, y) - p + p * 0.05)], '"Flat" interest charges 10% of the ORIGINAL amount every year, even as you repay: ' + F(p) + ' × 10% × ' + y + ' = ' + F(flat) + '. The true APR is much higher than 10%.', { q: 'A shop offers ' + F(p) + ' at "10% flat interest per year" for ' + y + ' year' + (y > 1 ? 's' : '') + '. Total interest?' });
      }
    ],
    investing: [
      (r, lvl) => mc(r, 'A single new start-up\'s stock', ['A savings account', 'A government bond', 'A broad index fund'], 'One young company can fail completely. Index funds spread risk over many companies; savings and government bonds are the least risky.', { q: 'Which of these is usually the RISKIEST?' }),
      (r, lvl) => {
        const p = M(ri(2, 9) * 10), inf = MQ.pick(r, [3, 5, 7]), n = MQ.pick(r, [5, 10]), fp = p * Math.pow(1 + inf / 100, n);
        return mc(r, F(fp), [F(p), F(p * (1 + inf * n / 100) * 0.85), F(p * (1 + inf / 100))], F(p) + ' × ' + (1 + inf / 100) + '^' + n + ' ≈ ' + F(fp) + '. Same item, more money: inflation.', { q: 'Pizza costs ' + F(p) + ' today. With ' + inf + '% inflation every year, roughly what does it cost in ' + n + ' years?' });
      },
      (r, lvl) => {
        const a = MQ.pick(r, [4, 6, 8, 10]), b = MQ.pick(r, [2, 3, 5, 7]), real = a - b;
        return mc(r, 'About ' + real + '%', ['About ' + (a + b) + '%', 'About ' + a + '%', 'About ' + (-b) + '%'], 'Real return ≈ return − inflation = ' + a + '% − ' + b + '% = ' + real + '%.', { q: 'Your investment returned ' + a + '% this year and inflation was ' + b + '%. Roughly what is your REAL return?' });
      },
      (r, lvl) => {
        const x = MQ.pick(r, [10, 20, 30]), y = MQ.pick(r, [10, 20, 40]), tot = (x - y) / 2;
        return mc(r, (tot >= 0 ? '+' : '') + tot + '%', ['−' + y + '%', '+' + x + '%', (tot >= 0 ? '−' : '+') + Math.abs(tot) + '%'].filter(o => o !== (tot >= 0 ? '+' : '') + tot + '%'), 'Half your money gained ' + x + '%, half lost ' + y + '%: (' + x + ' − ' + y + ') ÷ 2 = ' + tot + '%. Diversification softened the loss.', { q: 'You split money 50/50: fund A rises ' + x + '%, fund B falls ' + y + '%. Overall change?' });
      }
    ],
    safety: [
      (r, lvl) => {
        const items = [
          ['"Your account is locked! Verify within 30 minutes or lose access."', 'Urgency and threats'],
          ['"Pay the ' + F(M(20)) + ' processing fee to release your ' + F(M(5000)) + ' prize."', 'Paying a fee to receive a prize'],
          ['"Send me your one-time code so I can verify your account."', 'Asking for an OTP / one-time code'],
          ['"Guaranteed 30% monthly returns. Zero risk!"', 'Guaranteed high returns'],
          ['"Earn more by recruiting 3 friends who each pay to join."', 'Paid to recruit others (pyramid/Ponzi)'],
          ['"Please pay with gift cards. Scratch them and send photos."', 'Gift card payment']
        ];
        const it = MQ.pick(r, items);
        const others = shuffle(items.filter(x => x !== it), r).slice(0, 3).map(x => x[1]);
        return mc(r, it[1], others, 'This message shows the red flag: ' + it[1].toLowerCase() + '.', { q: 'What is the main red flag here? ' + it[0] });
      },
      (r, lvl) => mc(r, 'Hang up and call the number on the back of your card', ['Give them the code. They are the bank', 'Click the link in their text', 'Send a small test payment'], 'Contact your bank yourself using official details. Never share codes.', { q: 'Someone calls "from your bank" asking you to read out a code they just sent. Best move?' }),
      (r, lvl) => mc(r, 'Money would leave your account', ['You would receive the money', 'Nothing happens', 'Your bank gives a bonus'], 'You never need a PIN or code to RECEIVE money. A request for one means you are about to send.', { q: 'A buyer says "enter your PIN on this payment request so I can send you ' + F(M(150)) + '". What really happens?' })
    ]
  };

  function genQuestion(cat, level, seed) {
    const r = seed === undefined ? Math.random : ST.rng(seed);
    const gens = GEN[cat];
    // Lower levels favour the first generators (simpler ideas), higher levels the later ones.
    const span = Math.max(1, Math.min(gens.length, level + 1));
    const idx = level >= 3 ? gens.length - 1 - Math.floor(r() * 2) : Math.floor(r() * span);
    const q = gens[Math.max(0, idx)](r, level);
    q.cat = cat; q.gen = true;
    return q;
  }
  function bankQuestions(cat) {
    const out = [];
    MQ.visibleUnits().forEach(u => u.lessons.forEach(l => {
      if (catOfLesson(l.id) !== cat) return;
      l.quiz.forEach((q, i) => out.push(Object.assign({ qid: l.id + ':' + i, cat }, q)));
    }));
    return out;
  }
  // Prefer questions answered wrong before (spaced review), then unseen ones.
  function reviewQuestion(cat, exclude) {
    const qs = S().qstats, pool = bankQuestions(cat).filter(q => !exclude.includes(q.qid));
    const missed = pool.filter(q => qs[q.qid] && qs[q.qid].w > qs[q.qid].r);
    const unseen = pool.filter(q => !qs[q.qid]);
    const from = missed.length ? missed : unseen.length ? unseen : pool;
    return from[Math.floor(Math.random() * from.length)];
  }

  // ---------- Practice screen ----------
  MQ.app.route('practice', (main, args) => {
    const app = MQ.app;
    const w = weakest();
    const cat = BY[args[0]] ? BY[args[0]] : (w ? w.cat : MQ.pick(Math.random, CATS));
    const before = score(cat.id);
    let level = before === null ? 1 : before < 0.5 ? 1 : before < 0.75 ? 2 : 3;
    const N = 6, used = [];
    let i = 0, correct = 0;
    main.style.setProperty('--c', '#6366f1');

    function frame(inner) {
      main.innerHTML = '<div class="lesson-top"><a href="#/learn" class="x" aria-label="Quit">✕</a><div class="bar"><i style="width:' + (i / N * 100) + '%"></i></div><span class="pill small">Lv ' + level + '</span></div>' + inner;
    }
    function intro() {
      frame('<div class="lesson-card pop"><div class="big-emoji">' + cat.e + '</div><div class="kicker">3-minute challenge</div><h2>' + cat.name + '</h2><p>' + esc(money(cat.refresher)) + '</p>' +
        '<p class="muted small">Questions adapt as you go: get one right and they get harder, miss one and you get an easier one with a worked explanation.</p></div>' +
        '<div class="lesson-foot"><span class="muted">' + (before === null ? 'New topic' : 'Current score ' + Math.round(before * 100) + '%') + '</span><button class="btn primary" id="next">Start ▶</button></div>');
      $('#next').onclick = ask;
    }
    function ask() {
      if (i >= N) return finish();
      let q;
      if (i % 3 === 2) { q = reviewQuestion(cat.id, used); if (q) used.push(q.qid); }
      if (!q) q = genQuestion(cat.id, level);
      frame('<div class="quiz pop"><div class="kicker">' + (q.gen ? '🎲 Fresh question' : '🔁 Review') + ' · ' + cat.name + '</div><h2>' + esc(money(q.q)) + '</h2><div class="opts">' +
        q.options.map((o, j) => '<button class="opt" data-i="' + j + '">' + esc(money(o)) + '</button>').join('') + '</div></div><div class="check-bar"><button class="btn primary block" id="check" disabled>Check</button></div>');
      let pick = null;
      $$('.opt', main).forEach(b => b.onclick = () => { pick = +b.dataset.i; $$('.opt', main).forEach(x => x.classList.toggle('sel', x === b)); $('#check').disabled = false; });
      $('#check').onclick = () => {
        const ok = pick === q.answer;
        recordAnswer(cat.id, ok, q.qid);
        if (ok) { correct++; level = Math.min(3, level + 1); } else level = Math.max(1, level - 1);
        sound(ok ? 'good' : 'bad');
        $$('.opt', main).forEach((x, j) => { x.disabled = true; if (j === q.answer) x.classList.add('right'); if (j === pick && !ok) x.classList.add('wrong'); });
        const bar = $('.check-bar', main);
        bar.className = 'check-bar ' + (ok ? 'good' : 'bad');
        bar.innerHTML = '<div class="fb-text"><b>' + (ok ? 'Correct! Level up ⬆️' : 'Here is how it works 👇') + '</b><p>' + esc(money(q.explain)) + '</p></div><button class="btn ' + (ok ? 'primary' : 'danger') + ' block" id="cont">Continue</button>';
        $('#cont').onclick = () => { i++; ask(); };
      };
    }
    function finish() {
      const after = score(cat.id);
      const xp = 8 + correct * 2;
      main.innerHTML = '<div class="result pop"><div class="big-emoji bounce">' + (correct >= 5 ? '🧠' : '💪') + '</div><h1>' + correct + '/' + N + ' correct</h1>' +
        '<div class="result-stats"><div><b>' + (before === null ? '–' : Math.round(before * 100) + '%') + '</b><span>before</span></div><div><b>' + Math.round(after * 100) + '%</b><span>' + cat.name + ' now</span></div></div>' +
        '<p class="muted">' + (after >= 0.75 ? 'Strong! Try a harder topic next.' : 'Keep practising. Scores are based on your recent answers, so they climb quickly.') + '</p>' +
        '<a class="btn primary block lg" href="#/practice/' + cat.id + '">Another round</a><a class="btn ghost block" href="#/lesson/' + cat.lesson + '">Review the lesson</a><a class="btn ghost block" href="#/learn">Back</a></div>';
      ST.addXP(xp, 'Practice');
      app.renderHeader();
    }
    intro();
  });

  // Literacy score table (used on Learn and Profile)
  function scoreTable() {
    return '<div class="lit">' + CATS.map(c => {
      const sc = score(c.id), n = attempts(c.id);
      const pct = sc === null ? 0 : Math.round(sc * 100);
      const col = sc === null ? 'var(--line)' : pct >= 75 ? 'var(--good)' : pct >= 55 ? 'var(--gold)' : 'var(--bad)';
      return '<a class="lit-row" href="#/practice/' + c.id + '"><span>' + c.e + ' ' + c.name + '</span><div class="bar"><i style="width:' + pct + '%;background:' + col + '"></i></div><b>' + (n ? pct + '%' : '–') + '</b></a>';
    }).join('') + '</div>';
  }

  MQ.adaptive = { CATS, BY, catOfLesson, recordAnswer, recordResult, score, attempts, overall, improvement, allAbove, weakest, strongest, genQuestion, bankQuestions, scoreTable };
})(window.MQ);
