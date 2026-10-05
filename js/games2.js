// More mini-games: Budget Battle, Compound Interest Race, Inflation Dodge, Credit Score Challenge,
// Loan Detective and Diversification Challenge. Numbers are generated fresh each play and scaled to the player's country.
window.MQ = window.MQ || {};

(function (MQ) {
  const { $, $$, esc, fmt, fmtShort, pct, toast, sound, shuffle, lineChart } = MQ.ui;
  const ST = MQ.state;
  const app = MQ.app;
  const { record, intro, endScreen } = MQ.gameKit;
  const F = n => fmt(Math.round(n));
  const K = () => { const c = MQ.country(); return (c.first.income[0] + c.first.income[1]) / 2 / 3500; };
  const A = x => MQ.roundNice(x * K());
  const rec = (cat, f) => MQ.adaptive && MQ.adaptive.recordResult(cat, f);
  function gauss() { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function hud(i, n, right) { return '<div class="game-hud"><a href="#/play" class="x">✕</a><span>' + i + '</span><span>' + (right || '') + '</span></div>'; }

  // =====================================================================
  //  BUDGET BATTLE: survive a month on a limited budget
  // =====================================================================
  function budgetBattle(main, g) {
    intro(main, g, () => {
      const P = A(1800);
      let bal = P, wb = 70, turn = 0, pending = 0;
      const essentials = [
        { e: '🛒', t: 'Weekly food shop', c: [['Big supermarket shop', -0.12, 0], ['Budget store + cook at home', -0.07, -2], ['Skip it, order takeout all week', -0.2, 4]] },
        { e: '🚌', t: 'Getting around this month', c: [['Monthly bus pass', -0.06, 0], ['Taxis everywhere', -0.15, 4], ['Walk and cycle', 0, -1]] },
        { e: '📱', t: 'Phone bill is due', c: [['Pay it now', -0.04, 0], ['Pay late (late fee)', -0.06, -2]] }
      ];
      const extras = [
        { e: '🎂', t: 'Your friend\'s birthday', c: [['Nice gift', -0.06, 6], ['Handmade card + baking', -0.01, 4], ['Skip the party', 0, -6]] },
        { e: '👟', t: 'FLASH SALE: 50% off trainers', c: [['Buy them', -0.12, 6], ['Walk away', 0, -1]] },
        { e: '💡', t: 'Surprise electricity bill', c: [['Pay it in full', -0.08, 0], ['Ask for a payment plan (half now, half later + fee)', -0.04, -1, 0.05]] },
        { e: '🎬', t: 'Weekend plans', c: [['Movie + dinner out', -0.07, 8], ['Picnic in the park', -0.015, 5], ['Stay in all weekend', 0, -4]] },
        { e: '📺', t: 'Streaming subscription renews', c: [['Keep it', -0.02, 2], ['Cancel it', 0, -1]] },
        { e: '📱', t: 'You cracked your phone screen', c: [['Repair it', -0.14, 2], ['Live with the crack', 0, -6], ['Buy a screen protector kit + DIY', -0.03, -2]] },
        { e: '🏋️', t: 'Gym membership offer', c: [['Join the gym', -0.05, 5], ['Run outside for free', 0, 3]] },
        { e: '🎤', t: 'Concert announced!', c: [['Buy a ticket', -0.11, 10], ['Watch the livestream', 0, -2]] },
        { e: '👶', t: 'A neighbour offers babysitting work', c: [['Take it (+money, tired)', 0.08, -3], ['Decline', 0, 1]] },
        { e: '☕', t: 'Daily coffee habit', c: [['Coffee shop every day', -0.06, 4], ['Make it at home', -0.01, 0]] },
        { e: '🎁', t: 'You find money in an old jacket!', c: [['Nice!', 0.03, 3]] },
        { e: '🍕', t: 'Friends order pizza at movie night', c: [['Chip in', -0.025, 4], ['Bring snacks from home', -0.008, 2]] }
      ];
      const deck = essentials.concat(shuffle(extras).slice(0, 7));
      const order = [essentials[0]].concat(shuffle(deck.slice(1)));
      const days = [1, 3, 6, 9, 12, 15, 18, 21, 25, 28];
      function show() {
        if (turn >= order.length) return done(true);
        const ev = order[turn], day = days[turn] || 29;
        if (day >= 20 && pending) { bal -= pending * P; toast('Payment plan instalment: −' + F(pending * P)); pending = 0; if (bal < 0) return done(false, day); }
        main.innerHTML = hud('Day ' + day + '/30', 0, '') +
          '<div class="card bb-stats"><div><span class="kicker">Money left</span><b class="' + (bal < P * 0.2 ? 'down' : '') + '">' + F(bal) + '</b><div class="bar"><i style="width:' + Math.max(0, bal / P * 100) + '%"></i></div></div><div><span class="kicker">Wellbeing</span><b>' + Math.round(wb) + '</b><div class="bar"><i style="width:' + wb + '%;background:var(--accent2)"></i></div></div></div>' +
          '<p class="muted small center">Survive to day 30 without running out of money or letting wellbeing drop below 30.</p>' +
          '<div class="card event pop"><div class="big-emoji">' + ev.e + '</div><h2>' + esc(ev.t) + '</h2><div class="opts">' +
          ev.c.map((c, i) => '<button class="opt" data-i="' + i + '">' + esc(c[0]) + ' <small class="' + (c[1] < 0 ? 'down' : c[1] > 0 ? 'up' : 'muted') + '">' + (c[1] ? (c[1] > 0 ? '+' : '−') + F(Math.abs(c[1]) * P) : 'free') + '</small></button>').join('') + '</div></div>';
        $$('.opt', main).forEach(b => b.onclick = () => {
          const c = ev.c[+b.dataset.i];
          bal += c[1] * P; wb = Math.max(0, Math.min(100, wb + c[2]));
          if (c[3]) pending += c[3];
          sound(c[1] < -0.1 ? 'bad' : 'tap');
          turn++;
          if (bal < 0) return done(false, days[turn - 1]);
          show();
        });
      }
      function done(survived, day) {
        if (pending) { bal -= pending * P; pending = 0; if (bal < 0) survived = false; }
        const win = survived && wb >= 30;
        const score = win ? Math.round(bal / P * 100) + Math.round(wb) : 0;
        record('budget', score);
        if (win) ST.flag('budgetWin');
        rec('budgeting', win ? 0.5 + bal / P : 0.15);
        endScreen(main, g, '<div class="big-emoji bounce">' + (win ? '⚔️' : survived ? '😫' : '💸') + '</div><h1>' + (win ? 'You survived the month!' : survived ? 'Burned out!' : 'Out of money on day ' + day) + '</h1>' +
          '<div class="result-stats"><div><b>' + F(Math.max(0, bal)) + '</b><span>left over</span></div><div><b>' + Math.round(wb) + '</b><span>wellbeing</span></div><div><b>' + score + '</b><span>score</span></div></div>' +
          '<p class="muted">' + (win ? 'Leftover money can go straight into savings. Pay yourself first next month!' : survived ? 'A budget with no fun rarely lasts. Plan small, cheap treats.' : 'In real life you would have to borrow, often at high interest. A buffer of unplanned money prevents this.') + '</p>', win ? 20 + Math.round(score / 10) : 8);
      }
      show();
    });
  }

  // =====================================================================
  //  COMPOUND INTEREST RACE
  // =====================================================================
  function compoundRace(main, g) {
    intro(main, g, () => {
      const target = A(100000), inc = A(3500);
      const accounts = { mattress: { n: '🛏️ Under the mattress', r: 0 }, savings: { n: '🏦 Savings account', r: 4 }, bonds: { n: '📜 Bond fund', r: 5 }, index: { n: '📊 Index fund (avg ~8%, bumpy)', r: 8, vol: 15 } };
      const me = { amt: MQ.roundNice(inc * 0.1), acct: 'index', age: 16 };
      function setup() {
        main.innerHTML = hud('Set your strategy', 0, '') + '<div class="card"><h2>🏁 First to ' + F(target) + ' wins!</h2><p class="muted">You and 3 rivals each save every month. Choose how much, where and when you start.</p>' +
          '<label class="slider"><span>Monthly saving</span><b id="amt-v"></b><input type="range" id="amt" min="' + MQ.roundNice(inc * 0.02) + '" max="' + MQ.roundNice(inc * 0.4) + '" step="' + MQ.roundNice(inc * 0.01) + '" value="' + me.amt + '"></label>' +
          '<div class="kicker">Where?</div><div class="chips">' + Object.keys(accounts).map(k => '<button class="chip ' + (me.acct === k ? 'on' : '') + '" data-a="' + k + '">' + accounts[k].n + '</button>').join('') + '</div>' +
          '<div class="kicker" style="margin-top:10px">Start saving at age</div><div class="chips">' + [16, 20, 25, 30].map(a => '<button class="chip ' + (me.age === a ? 'on' : '') + '" data-age="' + a + '">' + a + '</button>').join('') + '</div>' +
          '<button class="btn primary block lg" id="race">Start the race 🏁</button></div>';
        const upd = () => $('#amt-v').textContent = F(me.amt) + '/mo';
        $('#amt').oninput = e => { me.amt = +e.target.value; upd(); }; upd();
        $$('[data-a]', main).forEach(b => b.onclick = () => { me.acct = b.dataset.a; $$('[data-a]', main).forEach(x => x.classList.toggle('on', x === b)); });
        $$('[data-age]', main).forEach(b => b.onclick = () => { me.age = +b.dataset.age; $$('[data-age]', main).forEach(x => x.classList.toggle('on', x === b)); });
        $('#race').onclick = race;
      }
      function race() {
        const names = shuffle(MQ.country().names);
        const rivals = [
          { name: names[0] + ' (starts late, saves big)', amt: MQ.roundNice(inc * 0.25), acct: 'index', age: 30 },
          { name: names[1] + ' (plays it safe)', amt: MQ.roundNice(inc * 0.12), acct: 'savings', age: 18 },
          { name: names[2] + ' (cash under the bed)', amt: MQ.roundNice(inc * 0.15), acct: 'mattress', age: 16 }
        ].map(x => Object.assign(x, { amt: Math.max(1, Math.round(x.amt * (0.8 + Math.random() * 0.4))) }));
        const racers = [Object.assign({ name: 'You', you: true }, me)].concat(rivals).map(x => Object.assign(x, { bal: 0, done: null }));
        const yearsR = []; for (let i = 0; i < 60; i++) yearsR.push(8 + 15 * gauss());
        main.innerHTML = hud('Racing…', 0, '<span id="age">Age 16</span>') + '<div class="card race">' + racers.map((r, i) => '<div class="lane ' + (r.you ? 'you' : '') + '"><div class="lane-top"><b>' + esc(r.name) + '</b><small>' + F(r.amt) + '/mo · ' + accounts[r.acct].n.split(' ')[0] + ' · from ' + r.age + '</small></div><div class="bar"><i id="ln' + i + '" style="width:0%"></i></div><small id="lv' + i + '"></small></div>').join('') + '</div><div id="race-end"></div>';
        let age = 16;
        const t = setInterval(() => {
          age++;
          $('#age').textContent = 'Age ' + age;
          racers.forEach((r, i) => {
            if (age > r.age && !r.done) {
              const ret = accounts[r.acct].vol ? yearsR[age - 16] : accounts[r.acct].r;
              r.bal = r.bal * (1 + ret / 100) + r.amt * 12;
              if (r.bal >= target) r.done = age;
            }
            $('#ln' + i).style.width = Math.min(100, r.bal / target * 100) + '%';
            $('#lv' + i).textContent = fmtShort(r.bal) + (r.done ? ' 🏁 reached at ' + r.done : '');
          });
          if (racers.every(r => r.done) || age >= 65) { clearInterval(t); finish(racers); }
        }, 110);
        app.onLeave(() => clearInterval(t));
      }
      function finish(racers) {
        const sorted = racers.slice().sort((a, b) => (a.done || 999) - (b.done || 999) || b.bal - a.bal);
        const pos = sorted.findIndex(r => r.you) + 1, you = racers[0];
        const score = (5 - pos) * 100 + (you.done ? 65 - you.done : 0) * 5;
        record('race', score);
        rec('saving', (5 - pos) / 4);
        const lesson = you.acct === 'mattress' ? 'Money under the mattress never grows. Even a savings account helps, and inflation makes cash shrink in real terms.'
          : you.age >= 25 ? 'Starting later means you need to save MUCH more each month to catch up. Time is the most powerful ingredient.'
            : 'Starting early plus a decent return lets compound interest do the heavy lifting.';
        endScreen(main, g, '<div class="big-emoji bounce">' + ['🥇', '🥈', '🥉', '🐢'][pos - 1] + '</div><h1>You finished #' + pos + '</h1>' +
          '<div class="card">' + sorted.map((r, i) => '<div class="ledger"><div><span>' + (i + 1) + '. ' + esc(r.name) + '</span><b>' + (r.done ? 'age ' + r.done : fmtShort(r.bal) + ' at 65') + '</b></div></div>').join('') + '</div>' +
          '<p class="muted">' + lesson + '</p>', 10 + (5 - pos) * 4);
      }
      setup();
    });
  }

  // =====================================================================
  //  INFLATION DODGE
  // =====================================================================
  function inflationDodge(main, g) {
    intro(main, g, () => {
      const start = A(1000), pizza0 = A(10);
      let money = start, price = pizza0, year = 0;
      const YEARS = 6, log = [];
      const opts = { mattress: '🛏️ Cash under the mattress', savings: '🏦 Savings account', bonds: '📜 Bonds', index: '📊 Index fund', gold: '🥇 Gold' };
      function genYear() {
        const roll = Math.random();
        const regime = roll < 0.25 ? 'spike' : roll < 0.4 ? 'recession' : 'normal';
        const infl = regime === 'spike' ? 8 + Math.random() * 6 : regime === 'recession' ? 1 + Math.random() * 2 : 2 + Math.random() * 2.5;
        const r = regime === 'spike' ? { mattress: 0, savings: infl - 4 + Math.random() * 2, bonds: -8 - Math.random() * 6, index: -6 + gauss() * 12, gold: 12 + Math.random() * 12 }
          : regime === 'recession' ? { mattress: 0, savings: 2 + Math.random(), bonds: 6 + Math.random() * 4, index: -18 + gauss() * 8, gold: 6 + Math.random() * 8 }
            : { mattress: 0, savings: 3 + Math.random() * 1.5, bonds: 3 + gauss() * 3, index: 10 + gauss() * 10, gold: 2 + gauss() * 8 };
        const right = Math.random() < 0.7;
        const shown = right ? regime : MQ.pick(Math.random, ['spike', 'recession', 'normal'].filter(x => x !== regime));
        const headline = { spike: '📰 "Prices are rising fast! Energy and food costs soar."', recession: '📰 "Economy slowing, companies cut jobs."', normal: '📰 "Steady growth, nothing dramatic."' }[shown];
        return { regime, infl, r, headline };
      }
      function show() {
        if (year >= YEARS) return done();
        const Y = genYear();
        const pizzas = money / price;
        main.innerHTML = hud('Year ' + (year + 1) + '/' + YEARS, 0, '🍕 ' + pizzas.toFixed(0)) +
          '<div class="card"><div class="ledger"><div><span>Your money</span><b>' + F(money) + '</b></div><div><span>Price of a pizza</span><b>' + fmt(price, 2) + '</b></div><div class="total"><span>Buying power</span><b>' + pizzas.toFixed(1) + ' pizzas</b></div></div></div>' +
          '<div class="card"><p>' + esc(Y.headline) + '</p><p class="muted small">Headlines are right about 70% of the time. Where do you keep your money for the next year?</p><div class="opts">' +
          Object.keys(opts).map(k => '<button class="opt" data-k="' + k + '">' + opts[k] + '</button>').join('') + '</div></div>';
        $$('.opt', main).forEach(b => b.onclick = () => {
          const k = b.dataset.k, ret = Y.r[k];
          const before = money / price;
          money *= 1 + ret / 100; price *= 1 + Y.infl / 100;
          const after = money / price, real = ret - Y.infl;
          log.push({ k, ret, infl: Y.infl, real });
          sound(after >= before ? 'good' : 'bad');
          $$('.opt', main).forEach(x => { x.disabled = true; const rr = Y.r[x.dataset.k]; x.innerHTML += ' <small class="' + (rr - Y.infl >= 0 ? 'up' : 'down') + '">' + (rr >= 0 ? '+' : '') + rr.toFixed(1) + '%</small>'; if (x === b) x.classList.add('sel'); });
          $('.card:last-child', main).insertAdjacentHTML('beforeend', '<div class="check-bar inline ' + (real >= 0 ? 'good' : 'bad') + '"><div class="fb-text"><b>Inflation was ' + Y.infl.toFixed(1) + '% (' + ({ spike: 'an inflation spike', recession: 'a recession year', normal: 'a normal year' })[Y.regime] + ')</b><p>Your return ' + (ret >= 0 ? '+' : '') + ret.toFixed(1) + '% − inflation ' + Y.infl.toFixed(1) + '% ≈ real return ' + (real >= 0 ? '+' : '') + real.toFixed(1) + '%. Buying power: ' + before.toFixed(1) + ' → ' + after.toFixed(1) + ' pizzas.</p></div><button class="btn primary block" id="nx">' + (year + 1 < YEARS ? 'Next year' : 'See results') + '</button></div>');
          $('#nx').onclick = () => { year++; show(); };
        });
      }
      function done() {
        const ratio = (money / price) / (start / pizza0);
        const score = Math.round(ratio * 100);
        record('inflation', score);
        if (ratio >= 1) ST.flag('inflation');
        rec('investing', Math.min(1, ratio / 1.3));
        const mattress = start / price;
        endScreen(main, g, '<div class="big-emoji bounce">' + (ratio >= 1 ? '🎈' : '🔥') + '</div><h1>' + (ratio >= 1 ? 'You beat inflation!' : 'Inflation got you') + '</h1>' +
          '<div class="result-stats"><div><b>' + (start / pizza0).toFixed(0) + ' → ' + (money / price).toFixed(0) + '</b><span>pizzas</span></div><div><b>' + score + '%</b><span>buying power</span></div></div>' +
          '<p class="muted">If you had kept it all under the mattress you could now buy only ' + mattress.toFixed(0) + ' pizzas. Cash loses value when prices rise. Real return = return − inflation.</p>', 8 + Math.max(0, Math.round((ratio - 0.8) * 40)));
      }
      show();
    });
  }

  // =====================================================================
  //  CREDIT SCORE CHALLENGE
  // =====================================================================
  function creditChallenge(main, g) {
    intro(main, g, () => {
      const C = MQ.country().credit;
      const f = { pay: 0.7, util: 0.75, age: 0.2, newc: 1, mix: 0.3 };
      let autopay = false, month = 0, lastDelta = null, lastWhy = '';
      const score = () => Math.round(C.min + (C.max - C.min) * (0.35 * f.pay + 0.3 * f.util + 0.15 * f.age + 0.1 * f.newc + 0.1 * f.mix));
      const cl = v => Math.max(0, Math.min(1, v));
      const lim = A(1500);
      const pool = [
        { e: '🧾', t: 'Your card bill of ' + F(A(300)) + ' is due.', c: [['Pay it in full', { pay: 0.06 }, 'On-time full payment is the #1 thing that builds your score.'], ['Pay only the minimum', { pay: 0.03, util: -0.12 }, 'On time, but the balance you carried raised your utilization and costs interest.'], ['Pay it late', { pay: -0.25 }, 'A late payment is one of the biggest score killers.']] },
        { e: '🛍️', t: 'A store offers 10% off today if you open their credit card.', c: [['Apply', { newc: -0.3, mix: 0.08 }, 'A new application causes a "hard inquiry" and lowers your average account age.'], ['No thanks', {}, 'Avoiding unnecessary applications protects your score.']] },
        { e: '📈', t: 'Your bank offers to raise your credit limit (no fee).', c: [['Accept', { util: 0.15 }, 'A higher limit with the same spending means lower utilization. Nice, if you do not spend more!'], ['Decline', {}, 'No change.']] },
        { e: '💻', t: 'You want a ' + F(A(1200)) + ' laptop. Your card limit is ' + F(lim) + '.', c: [['Charge it and pay slowly', { util: -0.45, pay: 0.01 }, 'Using 80% of your limit makes you look stretched.'], ['Charge it and pay it all off next month', { util: -0.1, pay: 0.04 }, 'A brief spike in utilization, then it drops. Smart use of credit.'], ['Save up and pay cash', {}, 'No effect on your score, and no interest.']] },
        { e: '✂️', t: 'Close your oldest credit card? (It has no annual fee.)', c: [['Close it', { age: -0.25, util: -0.1 }, 'Closing old accounts shortens your history and shrinks your available credit.'], ['Keep it, use it for one small bill', { age: 0.05 }, 'Old accounts in good standing help your score.']] },
        { e: '🔁', t: 'Set up autopay for all your bills?', c: [['Yes, autopay everything', { pay: 0.02, autopay: true }, 'Autopay prevents accidental missed payments.'], ['No, I will remember', {}, 'Hopefully!']] },
        { e: '😬', t: 'Busy month. Did you remember your phone bill?', forget: true, c: [['Check…', {}, '']] },
        { e: '✍️', t: 'A friend asks you to co-sign their loan.', c: [['Co-sign', { cosign: true }, 'If they miss payments, it hurts YOUR credit too.'], ['Politely decline', {}, 'Co-signing means taking full responsibility for someone else\'s debt.']] },
        { e: '🔍', t: 'Check your credit report for errors (free)?', c: [['Check it', { check: true }, 'Checking your own report does NOT hurt your score.'], ['Skip', {}, '']] },
        { e: '🎟️', t: 'Use Buy Now Pay Later for concert tickets?', c: [['Use BNPL', { bnpl: true }, ''], ['Pay with debit', {}, 'Simple and safe.']] },
        { e: '💸', t: 'Ad: "Instant cash loan! No credit check! (400% APR)"', c: [['Take it', { pay: -0.15, newc: -0.1 }, 'Payday loans are extremely expensive and often lead to missed payments.'], ['Ignore it', {}, 'Wise. Those loans are traps.']] }
      ];
      const months = shuffle(pool.slice(1)).slice(0, 7);
      months.splice(0, 0, pool[0]); months.splice(5, 0, pool[0]);
      function gauge(s) {
        const p = (s - C.min) / (C.max - C.min);
        const col = s >= C.good ? 'var(--good)' : p > 0.55 ? 'var(--gold)' : 'var(--bad)';
        return '<div class="gauge"><b style="color:' + col + '">' + s + '</b><small>' + esc(C.name) + ' · ' + C.min + '–' + C.max + ' · good ≈ ' + C.good + '+</small><div class="bar"><i style="width:' + p * 100 + '%;background:' + col + '"></i></div></div>';
      }
      function factors() {
        const row = (n, v) => '<div class="unit-prog"><span>' + n + '</span><div class="bar"><i style="width:' + Math.round(v * 100) + '%"></i></div><span class="small">' + Math.round(v * 100) + '</span></div>';
        return row('Payment history (35%)', f.pay) + row('Low utilization (30%)', f.util) + row('Account age (15%)', f.age) + row('Few new applications (10%)', f.newc) + row('Credit mix (10%)', f.mix);
      }
      function show() {
        if (month >= months.length) return done();
        const ev = months[month];
        main.innerHTML = hud('Month ' + (month + 1) + '/' + months.length, 0, '') + '<div class="card">' + gauge(score()) +
          (lastDelta !== null ? '<p class="small ' + (lastDelta >= 0 ? 'up' : 'down') + '"><b>' + (lastDelta >= 0 ? '+' : '') + lastDelta + '</b> · ' + esc(lastWhy) + '</p>' : '') + '</div>' +
          '<div class="card event pop"><div class="big-emoji">' + ev.e + '</div><h2>' + esc(ev.t) + '</h2><div class="opts">' + ev.c.map((c, i) => '<button class="opt" data-i="' + i + '">' + esc(c[0]) + '</button>').join('') + '</div></div>' +
          '<details class="card"><summary><b>What makes up the score?</b></summary>' + factors() + '<p class="hint">Fictional model based on commonly published weightings. Real scoring formulas are secret and differ by country and agency.</p></details>';
        $$('.opt', main).forEach(b => b.onclick = () => {
          const c = ev.c[+b.dataset.i], e = c[1], before = score();
          let why = c[2];
          if (ev.forget) { if (autopay) why = 'Autopay paid it for you. Crisis avoided!'; else { f.pay = cl(f.pay - 0.2); why = 'You forgot! A missed payment hurts your score badly. Autopay would have prevented this.'; } }
          ['pay', 'util', 'age', 'newc', 'mix'].forEach(k => { if (e[k]) f[k] = cl(f[k] + e[k]); });
          if (e.autopay) autopay = true;
          if (e.cosign) { if (Math.random() < 0.5) { f.pay = cl(f.pay - 0.2); why += ' Your friend missed payments, and it hit your score.'; } else why += ' Your friend paid on time this time.'; }
          if (e.check) { if (Math.random() < 0.35) { f.pay = cl(f.pay + 0.06); why += ' You found and fixed an error. Score up!'; } else why += ' No errors found.'; }
          if (e.bnpl) { if (Math.random() < 0.35) { f.pay = cl(f.pay - 0.15); why = 'You missed a BNPL instalment. It was reported, and your score dropped.'; } else { f.mix = cl(f.mix + 0.03); why = 'You paid every instalment on time.'; } }
          f.age = cl(f.age + 0.04); f.newc = cl(f.newc + 0.04);
          lastDelta = score() - before; lastWhy = why || 'Small monthly changes as your history ages.';
          sound(lastDelta >= 0 ? 'good' : 'bad');
          month++; show();
        });
      }
      function done() {
        const s = score(), good = s >= C.good;
        record('credit', s);
        if (good) ST.flag('creditGood');
        rec('credit', (s - C.min) / (C.max - C.min));
        endScreen(main, g, '<div class="big-emoji bounce">' + (good ? '💳' : '📉') + '</div><h1>Final score: ' + s + '</h1><div class="card">' + gauge(s) + factors() + '</div>' +
          '<p class="muted">' + (good ? 'Excellent! On-time payments and low utilization did the heavy lifting.' : 'Focus on paying everything on time (autopay helps) and keeping card balances low.') + '</p>', good ? 25 : 12);
      }
      show();
    });
  }

  // =====================================================================
  //  LOAN DETECTIVE
  // =====================================================================
  function loanDetective(main, g) {
    intro(main, g, () => {
      const items = [['📱', 'phone'], ['🛵', 'scooter'], ['💻', 'laptop'], ['🎓', 'coding course'], ['🛋️', 'sofa'], ['🎸', 'guitar']];
      const ROUNDS = 5;
      let round = 0, correct = 0, saved = 0;
      const emi = (p, apr, n) => { const i = apr / 1200; return i ? p * i / (1 - Math.pow(1 + i, -n)) : p / n; };
      function offers(P) {
        const a = 10 + Math.round(Math.random() * 8), n1 = MQ.pick(Math.random, [12, 24]), f1 = Math.round(Math.random() * 2);
        const fee = 4 + Math.round(Math.random() * 5), ins = MQ.roundNice(P * (0.02 + Math.random() * 0.04)), n2 = MQ.pick(Math.random, [6, 9, 12]);
        const a3 = 7 + Math.round(Math.random() * 5), n3 = MQ.pick(Math.random, [48, 60]);
        const flat = 8 + Math.round(Math.random() * 4), n4 = 24;
        const list = [
          { name: '🏦 Bank personal loan', desc: a + '% APR for ' + n1 + ' months' + (f1 ? ', ' + f1 + '% processing fee' : ', no fees'), m: emi(P, a, n1), n: n1, fees: P * f1 / 100 },
          { name: '🎉 "No-cost EMI" from the store', desc: '0% interest for ' + n2 + ' months, but a ' + fee + '% processing fee + mandatory insurance of ' + F(ins), m: P / n2, n: n2, fees: P * fee / 100 + ins },
          { name: '😌 "Low monthly payments!"', desc: a3 + '% APR for ' + n3 + ' months', m: emi(P, a3, n3), n: n3, fees: 0 },
          { name: '🏷️ "Only ' + flat + '% flat interest"', desc: flat + '% flat per year for 24 months (charged on the full amount every year)', m: (P + P * flat / 100 * 2) / n4, n: n4, fees: 0 }
        ];
        return shuffle(list).slice(0, 3).map(o => Object.assign(o, { total: o.m * o.n + o.fees }));
      }
      function show() {
        if (round >= ROUNDS) return done();
        const it = MQ.pick(Math.random, items), P = A(MQ.pick(Math.random, [600, 900, 1200, 1500, 2000]));
        const os = offers(P), best = os.reduce((a, b) => b.total < a.total ? b : a);
        main.innerHTML = hud('Case ' + (round + 1) + '/' + ROUNDS, 0, '🔍 ' + correct) +
          '<div class="card"><div class="big-emoji">' + it[0] + '</div><h2>You need to borrow ' + F(P) + ' for a ' + it[1] + '.</h2><p class="muted">Which offer costs the LEAST in total? Watch out for fees, long terms and "flat" rates.</p></div>' +
          os.map((o, i) => '<button class="card loan-opt" data-i="' + i + '"><b>' + esc(o.name) + '</b><p class="muted small">' + esc(o.desc) + '</p><div class="small">Monthly payment: <b>' + F(o.m) + '</b></div><div class="reveal"></div></button>').join('');
        $$('.loan-opt', main).forEach(b => b.onclick = () => {
          const o = os[+b.dataset.i], ok = o === best;
          if (ok) correct++;
          saved += o.total - best.total;
          sound(ok ? 'good' : 'bad');
          $$('.loan-opt', main).forEach((x, i) => {
            x.disabled = true;
            const oo = os[i];
            x.classList.add(oo === best ? 'right' : x === b ? 'wrong' : 'dim');
            $('.reveal', x).innerHTML = '<div class="ledger small"><div><span>Total repaid</span><b>' + F(oo.total) + '</b></div><div><span>True cost of borrowing</span><b class="down">' + F(oo.total - P) + '</b></div></div>';
          });
          const lowestMonthly = os.reduce((a, c) => c.m < a.m ? c : a);
          main.insertAdjacentHTML('beforeend', '<div class="check-bar inline ' + (ok ? 'good' : 'bad') + '"><div class="fb-text"><b>' + (ok ? 'Case solved! 🕵️' : 'The cheapest was: ' + esc(best.name)) + '</b><p>' +
            (lowestMonthly !== best ? 'Notice: the lowest MONTHLY payment (' + esc(lowestMonthly.name) + ') was not the cheapest overall. ' : '') + 'Always compare the total repaid, not just the monthly payment.</p></div><button class="btn primary block" id="nx">' + (round + 1 < ROUNDS ? 'Next case' : 'Results') + '</button></div>');
          $('#nx').onclick = () => { round++; show(); };
          $('#nx').scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }
      function done() {
        record('loan', correct * 100);
        if (correct === ROUNDS) ST.flag('loanPerfect');
        rec('credit', correct / ROUNDS);
        endScreen(main, g, '<div class="big-emoji bounce">' + (correct === ROUNDS ? '🔍' : '🧾') + '</div><h1>' + correct + '/' + ROUNDS + ' cases solved</h1>' +
          (saved > 0 ? '<p>Your picks would have cost <b>' + F(saved) + '</b> more than the cheapest offers.</p>' : '<p>You always found the cheapest deal!</p>') +
          '<p class="muted">Clues to remember: "0%" can hide fees, long terms add interest, and a "flat" rate is much more expensive than the same APR.</p>', correct * 4 + 2);
      }
      show();
    });
  }

  // =====================================================================
  //  DIVERSIFICATION CHALLENGE
  // =====================================================================
  function diversification(main, g) {
    intro(main, g, () => {
      const AS = [
        { id: 'stocks', e: '🚀', n: 'Growth stocks', mu: 10, sd: 26, b: 1.3 }, { id: 'etf', e: '📊', n: 'Index ETF', mu: 8, sd: 16, b: 1 },
        { id: 'bonds', e: '📜', n: 'Bonds', mu: 4, sd: 6, b: -0.2 }, { id: 'gold', e: '🥇', n: 'Gold', mu: 5, sd: 15, b: -0.3 },
        { id: 'cash', e: '💵', n: 'Cash', mu: 3, sd: 1, b: 0 }, { id: 'realestate', e: '🏠', n: 'Real estate', mu: 6, sd: 10, b: 0.5 }
      ];
      const goals = shuffle([
        { e: '🚗', t: 'Saving for a car in 2 years', h: 2, tol: 5, target: 3, tip: 'Short goal: you cannot wait for a crash to recover, so safety matters most.' },
        { e: '🎓', t: 'University fund in 7 years', h: 7, tol: 15, target: 5, tip: 'Medium goal: some growth, but limit how much you could lose.' },
        { e: '🏖️', t: 'Retirement in 40 years', h: 40, tol: 40, target: 7, tip: 'Very long goal: you have time to ride out crashes, so growth matters most.' }
      ]);
      let round = 0, total = 0;
      function show() {
        if (round >= goals.length) return done();
        const G = goals[round];
        const w = { stocks: 2, etf: 2, bonds: 2, gold: 1, cash: 2, realestate: 1 };
        function draw() {
          const used = Object.values(w).reduce((a, b) => a + b, 0);
          main.innerHTML = hud('Goal ' + (round + 1) + '/' + goals.length, 0, '⭐ ' + total) +
            '<div class="card"><div class="big-emoji">' + G.e + '</div><h2>' + esc(G.t) + '</h2><p class="muted">Spread 10 tokens across assets. Aim for at least ' + G.target + '% growth a year, without risking a loss of more than ' + G.tol + '% in a bad scenario.</p></div>' +
            '<div class="card">' + AS.map(a => '<div class="tok-row"><span>' + a.e + ' ' + a.n + '<small class="muted"> ~' + a.mu + '% avg, swings ±' + a.sd + '%</small></span><button class="btn sm" data-m="' + a.id + '">−</button><b>' + w[a.id] + '</b><button class="btn sm" data-p="' + a.id + '" ' + (used >= 10 ? 'disabled' : '') + '>+</button></div>').join('') +
            '<p class="small">Tokens used: <b>' + used + '/10</b></p><button class="btn primary block" id="sim" ' + (used !== 10 ? 'disabled' : '') + '>Simulate 500 futures 🔮</button></div>';
          $$('[data-m]', main).forEach(b => b.onclick = () => { if (w[b.dataset.m] > 0) { w[b.dataset.m]--; draw(); } });
          $$('[data-p]', main).forEach(b => b.onclick = () => { w[b.dataset.p]++; draw(); });
          $('#sim').onclick = () => simulate(G, w);
        }
        draw();
      }
      function simulate(G, w) {
        const outs = [];
        for (let s = 0; s < 500; s++) {
          let v = 1;
          for (let y = 0; y < G.h; y++) {
            const m = gauss();
            let r = 0;
            AS.forEach(a => { const c = Math.max(-0.9, Math.min(0.9, a.b * 0.7)); const ar = a.mu / 100 + a.sd / 100 * (c * m + Math.sqrt(1 - c * c) * gauss()); r += w[a.id] / 10 * Math.max(-0.9, ar); });
            v *= 1 + r;
          }
          outs.push(v);
        }
        outs.sort((a, b) => a - b);
        const p10 = outs[50], med = outs[250], p90 = outs[450];
        const medCagr = Math.pow(med, 1 / G.h) - 1, loss10 = Math.min(0, p10 - 1);
        const alloc = {}; AS.forEach(a => alloc[a.id] = w[a.id] * 10);
        const div = MQ.portfolio ? MQ.portfolio.divScore(alloc) : 50;
        const safety = Math.max(0, 1 - Math.max(0, -loss10 * 100 - G.tol) / G.tol);
        const growth = Math.max(0, Math.min(1, medCagr * 100 / G.target));
        const pts = Math.round(40 * safety + 40 * growth + 20 * div / 100);
        total += pts;
        main.innerHTML = hud('Goal ' + (round + 1) + '/' + goals.length, 0, '⭐ ' + total) +
          '<div class="card pop"><h2>' + G.e + ' ' + esc(G.t) + '</h2><div class="alloc-bar">' + AS.map(a => '<i style="width:' + w[a.id] * 10 + '%;background:' + ({ stocks: '#ef4444', etf: '#6366f1', bonds: '#0ea5e9', gold: '#eab308', cash: '#22c55e', realestate: '#a855f7' })[a.id] + '"></i>').join('') + '</div>' +
          '<div class="ledger"><div><span>😟 Bad future (worst 10%)</span><b class="' + (p10 >= 1 ? 'up' : 'down') + '">' + pct(p10 - 1, 0) + '</b></div><div><span>😐 Typical future</span><b>' + pct(med - 1, 0) + ' (' + pct(medCagr) + '/yr)</b></div><div><span>😄 Great future (best 10%)</span><b class="up">' + pct(p90 - 1, 0) + '</b></div><div><span>Diversification</span><b>' + div + '/100</b></div></div>' +
          '<div class="ledger"><div><span>Safety (loss under ' + G.tol + '%)</span><b>' + Math.round(safety * 40) + '/40</b></div><div><span>Growth (≥ ' + G.target + '%/yr)</span><b>' + Math.round(growth * 40) + '/40</b></div><div><span>Diversification</span><b>' + Math.round(div / 5) + '/20</b></div><div class="total"><span>Round score</span><b>' + pts + '/100</b></div></div>' +
          '<p class="tip-line">💡 ' + esc(G.tip) + '</p><button class="btn primary block" id="nx">' + (round + 1 < goals.length ? 'Next goal' : 'Results') + '</button></div>';
        sound(pts >= 70 ? 'good' : 'tap');
        $('#nx').onclick = () => { round++; show(); };
      }
      function done() {
        const avg = Math.round(total / goals.length);
        record('diversify', avg);
        rec('risk', avg / 100);
        endScreen(main, g, '<div class="big-emoji bounce">' + (avg >= 75 ? '🌈' : '🧺') + '</div><h1>Average score: ' + avg + '/100</h1><p class="muted">The right mix depends on WHEN you need the money. Short goals need safety, long goals can handle ups and downs, and diversification helps both.</p>', 8 + Math.round(avg / 6));
      }
      show();
    });
  }

  MQ.GAMES.push(
    { id: 'budget', e: '⚔️', title: 'Budget Battle', sub: 'Survive a whole month on a limited budget. Every day brings a new choice.', color: '#f97316', cat: 'budgeting', fn: budgetBattle },
    { id: 'race', e: '🏁', title: 'Compound Interest Race', sub: 'Pick your saving strategy and race 3 rivals to a big target. Who gets there first?', color: '#22c55e', cat: 'saving', fn: compoundRace },
    { id: 'inflation', e: '🎈', title: 'Inflation Dodge', sub: 'Prices keep rising. Move your money each year to protect how many pizzas it can buy.', color: '#ec4899', cat: 'investing', fn: inflationDodge },
    { id: 'credit', e: '💳', title: 'Credit Score Challenge', sub: 'A year of credit decisions. Build a fictional credit score from scratch.', color: '#ef4444', cat: 'credit', fn: creditChallenge },
    { id: 'loan', e: '🔍', title: 'Loan Detective', sub: 'Compare loan offers and find the true cheapest one. Beware of hidden fees!', color: '#0ea5e9', cat: 'credit', fn: loanDetective },
    { id: 'diversify', e: '🧺', title: 'Diversification Challenge', sub: 'Build a portfolio for different goals and test it against 500 possible futures.', color: '#8b5cf6', cat: 'risk', fn: diversification }
  );
})(window.MQ);
