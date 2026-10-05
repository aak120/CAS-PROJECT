// Simulations: a live fake stock market and a 12-month life/budget simulator.
// Everything here is fictional. No real companies, prices or money.
window.MQ = window.MQ || {};

(function (MQ) {
  const { $, $$, esc, money, fmt, pct, toast, modal, closeModal, sound, shuffle, lineChart } = MQ.ui;
  const ST = MQ.state;
  const app = MQ.app;

  app.route('sim', (main, args) => {
    if (args[0] === 'market') return market(main);
    if (args[0] === 'life') return life(main);
    const S = app.S;
    const m = S.market, l = S.life;
    main.innerHTML = '<h1>Simulate</h1><p class="sub">Practise real decisions with fake money. Nothing here is real, so experiment and learn from mistakes!</p>' +
      '<a class="card game-card" href="#/sim/market" style="--c:#8b5cf6"><span class="emoji-tile">📈</span><div><h3>Market Mania</h3><p class="muted">Start with ' + fmt(10000) + ' of pretend money. Trade fictional companies while prices move live and breaking news shakes the market. Can you beat the index fund?</p>' +
      '<div class="small">' + (m && !m.done ? '▶ In progress · Day ' + m.day + '/' + m.length : m && m.done ? '✅ Finished a year · tap to start again' : '✨ New') + '</div></div></a>' +
      '<a class="card game-card" href="#/sim/life" style="--c:#f59e0b"><span class="emoji-tile">🧑‍💼</span><div><h3>Life Sim: First Paychecks</h3><p class="muted">12 months, a part-time job and a savings goal. Budget each payday, handle surprises and avoid the debt trap.</p>' +
      '<div class="small">' + (l && l.phase !== 'done' && l.phase !== 'setup' ? '▶ In progress · Month ' + l.month + '/12' : l && l.phase === 'done' ? '✅ Finished · tap to play again' : '✨ New') + '</div></div></a>' +
      '<p class="hint center">These are educational simulations. Prices are random and not connected to any real market.</p>';
  });

  // =====================================================================
  //  MARKET MANIA
  // =====================================================================
  const STOCKS = [
    { sym: 'BLOOP', name: 'Bloop Burgers', e: '🍔', p: 42, mu: 0.0004, beta: 0.9, vol: 0.015, desc: 'Fast-food chain. Steady customers, slow growth.' },
    { sym: 'NOVA', name: 'Nova Rockets', e: '🚀', p: 120, mu: 0.0008, beta: 1.5, vol: 0.036, desc: 'Space start-up. Huge dreams, huge swings.' },
    { sym: 'LEAF', name: 'GreenLeaf Energy', e: '🌱', p: 65, mu: 0.0007, beta: 1.1, vol: 0.022, desc: 'Solar and wind power. Growing fast, sensitive to news.' },
    { sym: 'PIXL', name: 'PixelPlay Games', e: '🎮', p: 88, mu: 0.0006, beta: 1.2, vol: 0.025, desc: 'Video game studio. Lives and dies by its next hit.' },
    { sym: 'SAFE', name: 'SafeHarbor Bank', e: '🏦', p: 30, mu: 0.0003, beta: 0.8, vol: 0.011, div: 0.01, desc: 'Boring, big bank. Pays a dividend every quarter.' },
    { sym: 'CHOC', name: 'ChocoLoco Snacks', e: '🍫', p: 24, mu: 0.0003, beta: 0.6, vol: 0.011, div: 0.008, desc: 'People buy chocolate in good times and bad. Pays a dividend.' },
    { sym: 'ZIPP', name: 'ZipCart Delivery', e: '🛵', p: 15, mu: 0.0000, beta: 1.3, vol: 0.042, desc: 'Hyped delivery app. Popular online, still losing money.' }
  ];
  const FUNDS = [
    { sym: 'MQX', name: 'Total Market Index Fund', e: '📊', p: 100, fund: 'index', desc: 'Owns a slice of every company above. Lower risk through diversification.' },
    { sym: 'BOND', name: 'Steady Bond Fund', e: '📜', p: 50, fund: 'bond', desc: 'Lends to governments and companies. Small, steady returns.' }
  ];
  const ALL = STOCKS.concat(FUNDS);
  const BY = {}; ALL.forEach(s => BY[s.sym] = s);
  const FEE = 1;
  const SPEEDS = [{ label: '⏸', ms: 0 }, { label: '1×', ms: 1400 }, { label: '2×', ms: 700 }, { label: '4×', ms: 300 }];

  const COMPANY_NEWS = [
    [+0.08, '{n} beats earnings expectations 📊'], [-0.09, '{n} misses earnings targets 📉'], [-0.07, '{n} CEO resigns unexpectedly 😮'],
    [+0.06, '{n} announces an exciting new product ✨'], [+0.11, 'Viral trend sends {n} buzzing online 📱'], [-0.08, '{n} hit by a data breach 🔓'],
    [-0.05, 'Regulators investigate {n} 🔍'], [+0.07, '{n} wins a huge new contract 🤝']
  ];
  const SPECIAL_NEWS = {
    NOVA: [[+0.2, 'Nova Rockets lands its first reusable booster! 🚀'], [-0.25, 'Nova Rockets test launch explodes 💥']],
    LEAF: [[+0.12, 'Government announces clean-energy subsidies 🌱'], [-0.1, 'Cloudy summer hurts GreenLeaf output ☁️']],
    PIXL: [[+0.18, 'PixelPlay\'s new game is a smash hit 🎮'], [-0.2, 'PixelPlay delays its big game by a year 😩']],
    ZIPP: [[+0.3, 'Influencers hype ZipCart, the stock moons 🌕'], [-0.3, 'ZipCart runs low on cash, shares plunge 🕳️']],
    BLOOP: [[+0.06, 'Bloop Burgers\' new spicy burger sells out 🌶️'], [-0.08, 'Bloop Burgers recalls fries 🍟']],
    CHOC: [[-0.06, 'Cocoa prices spike 🍫'], [+0.05, 'ChocoLoco opens 200 new stores 🏪']],
    SAFE: [[-0.06, 'Loan defaults worry bank investors 🏦'], [+0.04, 'SafeHarbor reports record deposits 💰']]
  };
  const MARKET_NEWS = [
    [-0.03, 'Central bank raises interest rates 📉', -0.012], [+0.025, 'Strong jobs report lifts the market 📈', 0],
    [-0.04, 'Global supply-chain scare rattles investors 😬', 0.004], [+0.03, 'Inflation cools and investors cheer 🎉', 0.01],
    [-0.02, 'Recession fears grow 🌧️', 0.006]
  ];

  function gauss() { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

  function newMarket() {
    const prices = {}, hist = {};
    ALL.forEach(s => { prices[s.sym] = s.p; hist[s.sym] = [s.p]; });
    return { day: 0, length: 250, start: 10000, cash: 10000, prices, hist, holdings: {}, portHist: [10000], news: [{ day: 0, text: 'Welcome to Market Mania! Buy some investments, then press ▶ to start trading days.', kind: 'info' }], trades: 0, fees: 0, divs: 0, speed: 0, done: false, sel: 'MQX' };
  }
  function value(m) { return m.cash + Object.keys(m.holdings).reduce((t, k) => t + m.holdings[k].qty * m.prices[k], 0); }
  function holdCount(m) { return Object.keys(m.holdings).filter(k => m.holdings[k].qty > 0).length; }

  function step(m) {
    m.day++;
    let mShock = gauss() * 0.008, bondShock = 0;
    const rets = {};
    const add = (text, kind) => m.news.unshift({ day: m.day, text, kind });
    // market-wide news
    const roll = Math.random();
    if (roll < 0.003) { mShock -= 0.08; bondShock += 0.01; add('MARKET CRASH! Panic selling everywhere 🔻 (Long-term investors: breathe.)', 'bad'); }
    else if (roll < 0.018) { const n = MARKET_NEWS[Math.floor(Math.random() * MARKET_NEWS.length)]; mShock += n[0]; bondShock += n[2]; add(n[1], n[0] > 0 ? 'good' : 'bad'); }
    // company news
    let jumpSym = null, jump = 0;
    if (Math.random() < 0.07) {
      const s = STOCKS[Math.floor(Math.random() * STOCKS.length)];
      const pool = (SPECIAL_NEWS[s.sym] || []).concat(COMPANY_NEWS);
      const n = pool[Math.floor(Math.random() * pool.length)];
      jumpSym = s.sym; jump = n[0] * (0.7 + Math.random() * 0.6);
      add(n[1].replace('{n}', s.name) + ' (' + s.sym + ' ' + pct(jump, 0) + ')', jump > 0 ? 'good' : 'bad');
    }
    STOCKS.forEach(s => {
      let r = s.mu + s.beta * mShock + s.vol * gauss() + (s.sym === jumpSym ? jump : 0);
      r = Math.max(-0.5, r);
      rets[s.sym] = r;
      m.prices[s.sym] = Math.max(0.5, m.prices[s.sym] * (1 + r));
    });
    const idx = STOCKS.reduce((t, s) => t + rets[s.sym], 0) / STOCKS.length;
    m.prices.MQX *= 1 + idx;
    m.prices.BOND *= 1 + 0.00018 + 0.0018 * gauss() + bondShock * 0.3 - mShock * 0.05;
    // quarterly dividends
    if (m.day % 63 === 0) {
      STOCKS.filter(s => s.div).forEach(s => {
        const h = m.holdings[s.sym];
        if (h && h.qty > 0) {
          const d = h.qty * m.prices[s.sym] * s.div;
          m.cash += d; m.divs += d;
          add(s.name + ' paid you a dividend of ' + fmt(d, 2) + ' 💵', 'good');
        }
      });
    }
    ALL.forEach(s => { m.hist[s.sym].push(m.prices[s.sym]); });
    m.portHist.push(value(m));
    if (m.news.length > 40) m.news.length = 40;
    if (m.day >= m.length) m.done = true;
  }

  function market(main) {
    const S = app.S;
    if (!S.market || S.market.done && S.market.acknowledged) S.market = newMarket();
    let m = S.market;
    let timer = null;

    main.innerHTML =
      '<div class="sim-head"><a href="#/sim" class="x">‹</a><h1>Market Mania</h1><button class="btn ghost sm" id="help">How to play</button></div>' +
      '<div class="card mk-summary"><div class="mk-top"><div class="mk-val"><span class="kicker">Portfolio value</span><b id="mk-v"></b><span id="mk-r"></span></div>' +
      '<div class="mk-side"><div><span class="kicker">Cash</span><b id="mk-c"></b></div><div><span class="kicker">Day</span><b id="mk-d"></b></div></div></div>' +
      '<canvas id="mk-chart" class="chart"></canvas><div class="legend"><span><i style="background:var(--accent)"></i>You</span><span><i style="background:var(--muted)"></i>If you held the index fund</span></div>' +
      '<div class="speed" id="speed"></div></div>' +
      '<div class="card trade" id="trade"></div>' +
      '<h2 class="section">Market</h2><div class="mk-list" id="mk-list"></div>' +
      '<h2 class="section">📰 News feed</h2><div class="card news" id="news"></div>' +
      '<p class="hint center">All companies are fictional and prices are randomly generated. A ' + fmt(FEE) + ' fee applies to each trade.</p>';

    function bench() { return m.start * m.prices.MQX / BY.MQX.p; }
    function benchHist() { return m.hist.MQX.map(p => m.start * p / BY.MQX.p); }

    function drawSpeed() {
      $('#speed').innerHTML = m.done ? '<button class="btn primary block" id="res">See results 🏁</button>' :
        SPEEDS.map((s, i) => '<button class="sp ' + (m.speed === i ? 'on' : '') + '" data-i="' + i + '">' + (i === 0 && m.speed === 0 ? '⏸ Paused' : s.label) + '</button>').join('') + '<button class="sp" id="skip" title="Skip 1 week">+5 days ⏭</button>';
      $$('.sp[data-i]').forEach(b => b.onclick = () => { m.speed = +b.dataset.i; ST.save(); run(); drawSpeed(); });
      if ($('#skip')) $('#skip').onclick = () => { for (let i = 0; i < 5 && !m.done; i++) step(m); ST.save(); update(); if (m.done) finish(); };
      if ($('#res')) $('#res').onclick = finish;
    }

    function update() {
      const v = value(m), r = v / m.start - 1;
      $('#mk-v').textContent = fmt(v, 2);
      $('#mk-r').className = r >= 0 ? 'up' : 'down';
      $('#mk-r').textContent = pct(r) + ' all time';
      $('#mk-c').textContent = fmt(m.cash, 2);
      $('#mk-d').textContent = m.day + ' / ' + m.length;
      lineChart($('#mk-chart'), [{ data: benchHist(), color: getVar('--muted'), width: 1.5 }, { data: m.portHist, color: getVar('--accent'), fill: true }], { length: m.length + 1, baseline: m.start });
      $('#mk-list').innerHTML = ALL.map(s => {
        const p = m.prices[s.sym], h = m.hist[s.sym], prev = h[Math.max(0, h.length - 2)], ch = p / prev - 1, tot = p / s.p - 1;
        const hold = m.holdings[s.sym];
        return '<button class="mk-row ' + (m.sel === s.sym ? 'sel' : '') + '" data-s="' + s.sym + '"><span class="mk-e">' + s.e + '</span><span class="mk-n"><b>' + s.sym + '</b><small>' + esc(s.name) + (hold && hold.qty ? ' · own ' + hold.qty : '') + '</small></span>' +
          '<canvas class="spark" data-s="' + s.sym + '"></canvas><span class="mk-p"><b>' + fmt(p, 2) + '</b><small class="' + (ch >= 0 ? 'up' : 'down') + '">' + pct(ch, 2) + '</small></span></button>';
      }).join('');
      $$('.mk-row').forEach(b => b.onclick = () => { m.sel = b.dataset.s; drawTrade(); update(); $('#trade').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
      $$('canvas.spark').forEach(c => { const h = m.hist[c.dataset.s].slice(-40); lineChart(c, [{ data: h, color: h[h.length - 1] >= h[0] ? getVar('--good') : getVar('--bad'), width: 1.5 }]); });
      $('#news').innerHTML = m.news.slice(0, 12).map(n => '<div class="news-item ' + n.kind + '"><span class="nd">D' + n.day + '</span>' + esc(n.text) + '</div>').join('');
      updateTrade();
    }

    function drawTrade() {
      const s = BY[m.sel];
      $('#trade').innerHTML = '<div class="tr-head"><span class="mk-e big">' + s.e + '</span><div><h3>' + esc(s.name) + ' <small class="muted">' + s.sym + '</small></h3><p class="muted small">' + esc(s.desc) + '</p></div></div>' +
        '<canvas id="tr-chart" class="chart sm"></canvas>' +
        '<div class="tr-info" id="tr-info"></div>' +
        '<div class="tr-controls"><button class="btn sm" data-q="-10">−10</button><button class="btn sm" data-q="-1">−1</button><input id="qty" class="input qty" type="number" min="1" value="1" inputmode="numeric"><button class="btn sm" data-q="1">+1</button><button class="btn sm" data-q="10">+10</button><button class="btn sm" id="max">Max</button></div>' +
        '<div class="tr-btns"><button class="btn primary" id="buy">Buy</button><button class="btn danger" id="sell">Sell</button></div>';
      const q = $('#qty');
      $$('[data-q]', $('#trade')).forEach(b => b.onclick = () => { q.value = Math.max(1, (+q.value || 0) + +b.dataset.q); updateTrade(); });
      $('#max').onclick = () => { q.value = Math.max(1, Math.floor((m.cash - FEE) / m.prices[m.sel])); updateTrade(); };
      q.oninput = updateTrade;
      $('#buy').onclick = () => trade(+1);
      $('#sell').onclick = () => trade(-1);
      updateTrade();
    }
    function updateTrade() {
      const s = BY[m.sel], p = m.prices[s.sym], h = m.holdings[s.sym] || { qty: 0, cost: 0 };
      const q = Math.max(1, Math.floor(+$('#qty').value || 1));
      const gain = h.qty ? h.qty * p - h.cost : 0;
      $('#tr-info').innerHTML = '<div><span class="kicker">Price</span><b>' + fmt(p, 2) + '</b></div><div><span class="kicker">You own</span><b>' + h.qty + '</b></div>' +
        '<div><span class="kicker">Gain/loss</span><b class="' + (gain >= 0 ? 'up' : 'down') + '">' + (h.qty ? fmt(gain, 2) : '-') + '</b></div><div><span class="kicker">Order total</span><b>' + fmt(q * p + FEE, 2) + '</b></div>';
      lineChart($('#tr-chart'), [{ data: m.hist[s.sym], color: getVar('--accent2'), fill: true }], { length: m.length + 1 });
      $('#buy').disabled = m.done || q * p + FEE > m.cash;
      $('#sell').disabled = m.done || q > h.qty;
    }
    function trade(dir) {
      const s = m.sel, p = m.prices[s], q = Math.max(1, Math.floor(+$('#qty').value || 1));
      const h = m.holdings[s] = m.holdings[s] || { qty: 0, cost: 0 };
      if (dir > 0) {
        if (q * p + FEE > m.cash) { toast('Not enough cash', 'bad'); return; }
        m.cash -= q * p + FEE; h.qty += q; h.cost += q * p;
        toast('Bought ' + q + ' ' + s + ' 🛒', 'good');
        ST.flag('trade');
        if (holdCount(m) >= 4) ST.flag('diversified');
      } else {
        if (q > h.qty) { toast('You do not own that many', 'bad'); return; }
        h.cost -= h.cost * (q / h.qty); h.qty -= q;
        m.cash += q * p - FEE;
        toast('Sold ' + q + ' ' + s + ' 💵', 'good');
      }
      m.trades++; m.fees += FEE;
      m.portHist[m.portHist.length - 1] = value(m);
      sound('coin');
      ST.save();
      update();
    }

    function run() {
      clearInterval(timer);
      const ms = SPEEDS[m.speed].ms;
      if (!ms || m.done) return;
      timer = setInterval(() => {
        step(m);
        ST.save();
        update();
        if (m.done) { clearInterval(timer); finish(); }
      }, ms);
    }

    function finish() {
      clearInterval(timer);
      m.speed = 0;
      drawSpeed();
      const v = value(m), r = v / m.start - 1, br = bench() / m.start - 1;
      const first = !m.rewarded;
      if (first) {
        m.rewarded = true;
        if (r > 0) ST.flag('profit');
        ST.save();
        ST.addXP(30 + (r > 0 ? 10 : 0) + (r > br ? 10 : 0), 'Market year');
      }
      const lesson = r > br && r < 0 ? 'You lost money, but less than the index fund. It was a rough year for the whole market. Over long periods, markets have historically recovered from bad years.'
        : r > br ? 'You beat the index this time! Remember, over many years most professional investors fail to beat the index, so luck plays a big part.'
        : r >= 0 ? 'You made money but the index fund did better. Simply buying the whole market and holding often beats picking stocks.'
          : 'A losing year happens to everyone. Diversification and time are your best protection. Panic-selling after drops usually makes it worse.';
      modal('<div class="celebrate"><div class="big-emoji">' + (r > br ? '🏆' : r >= 0 ? '📈' : '📉') + '</div><h2>One year complete!</h2>' +
        '<div class="result-stats"><div><b class="' + (r >= 0 ? 'up' : 'down') + '">' + pct(r) + '</b><span>your return</span></div><div><b class="' + (br >= 0 ? 'up' : 'down') + '">' + pct(br) + '</b><span>index fund</span></div></div>' +
        '<p>Final value: <b>' + fmt(v, 2) + '</b> · Trades: ' + m.trades + ' · Fees: ' + fmt(m.fees) + ' · Dividends: ' + fmt(m.divs, 2) + '</p><p class="muted">' + lesson + '</p>' +
        '<button class="btn primary block" id="again">Start a new year</button><button class="btn ghost block" data-close>Look at my results</button></div>', { sticky: true });
      $('#again').onclick = () => { S.market = newMarket(); ST.save(); closeModal(); app.render(); };
      m.acknowledged = true;
      ST.save();
    }

    $('#help').onclick = () => modal('<h2>How Market Mania works</h2><ul class="list">' +
      '<li>You start with <b>' + fmt(10000) + '</b> of pretend money.</li><li>Tap an investment to see its chart, then buy or sell. Each trade costs ' + fmt(FEE) + '.</li>' +
      '<li>Press <b>1×, 2× or 4×</b> to run the market. Each tick is one trading day, and a year is ' + m.length + ' days.</li>' +
      '<li>Watch the <b>news feed</b>. Big events move prices, but reacting to every headline is rarely a winning plan.</li>' +
      '<li><b>MQX</b> holds every company, so it is diversified. <b>BOND</b> is slow and steady. <b>SAFE</b> and <b>CHOC</b> pay dividends every quarter.</li>' +
      '<li>Goal: finish the year with more than you started, and try to beat the grey "index fund" line.</li></ul><button class="btn primary block" data-close>Got it</button>');

    drawSpeed();
    drawTrade();
    update();
    run();
    if (m.day === 0 && !m.trades && !S.badgeFlags?.trade) $('#help').click();
    if (m.done && !m.acknowledged) finish();
    app.onLeave(() => { clearInterval(timer); });
  }
  function getVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }

  // =====================================================================
  //  LIFE SIM: First Paychecks
  // =====================================================================
  const INCOME = 520;
  const FIXED = [['📱 Phone plan', 35], ['🚌 Transport', 45], ['🥪 Lunches & snacks', 90]];
  const GOALS = [
    { id: 'laptop', e: '💻', name: 'New laptop', amt: 1200, diff: 'Easy' },
    { id: 'car', e: '🚗', name: 'First car fund', amt: 2000, diff: 'Medium' },
    { id: 'trip', e: '🌍', name: 'Gap-year trip', amt: 2800, diff: 'Hard' }
  ];
  const SAVE_RATE = 0.0025, BOOST_RATE = 0.0041, DEBT_RATE = 0.02; // ~3% / ~5% savings APY, ~24% credit card APR

  const EVENTS = {
    phone: { e: '📱💥', t: 'Your phone screen cracks!', c: [['Repair it ($120)', { cash: -120 }], ['Live with the crack', { happy: -8 }], ['Buy the newest phone ($700)', { cash: -700, happy: 10 }]] },
    birthday: { e: '🎂', t: 'Birthday! Your grandparents send you $100.', c: [['Save all of it', { save: 100 }], ['Spend it on a fun day out', { happy: 8 }], ['Split it 50/50', { save: 50, happy: 4 }]] },
    concert: { e: '🎤', t: 'Your friends are going to a concert. Tickets are $150.', c: [['Go! 🎶', { cash: -150, happy: 12 }], ['Skip it', { happy: -6 }], ['Suggest a cheap picnic instead', { cash: -15, happy: 5 }]] },
    shifts: { e: '💼', t: 'Your manager offers you extra weekend shifts this month.', c: [['Take them (+$160)', { cash: 160, happy: -5 }], ['Decline, I need rest', {}]] },
    sneakers: { e: '👟', t: 'FLASH SALE: limited sneakers for $140. "Only 2 left!"', c: [['Buy them now', { cash: -140, happy: 5 }], ['Use the 24-hour rule', { happy: -1, note: 'The next day the "only 2 left" banner was still there 😉 Scarcity is a sales trick.' }]] },
    stream: { e: '📺', t: 'Your free trial of StreamMax ends. Keep it for $15/month?', c: [['Keep it', { sub: 15, happy: 3, note: 'Added $15 to your monthly fixed costs. That is $180 a year.' }], ['Cancel it', {}]] },
    scam: { e: '💸', t: 'A DM promises to turn your $200 into $2,000 in one week, guaranteed.', c: [['Send $200', { cash: -200, happy: -10, note: 'It was a scam. The account disappeared with your money. Guaranteed returns are always a red flag.' }], ['Report & block', { happy: 2, note: 'Smart move! Guaranteed huge returns are always a scam.' }]] },
    borrow: { e: '🤝', t: 'A friend asks to borrow $60 until next month.', c: [['Lend it', { cash: -60, chance: { p: 0.5, eff: { cash: 60 }, yes: 'They paid you back! 🙌', no: 'They "forgot" to pay you back 😬 Only lend what you can afford to lose.' } }], ['Politely say no', { happy: -2 }]] },
    sell: { e: '🧺', t: 'Your room is cluttered. Sell old stuff online?', c: [['Sell it (+$80)', { cash: 80, happy: 2 }], ['Keep everything', {}]] },
    dentist: { e: '🦷', t: 'Toothache! A dentist visit costs $90.', c: [['Go now', { cash: -90 }], ['Ignore it and hope it goes away', { happy: -6, next: 'dentist2' }]] },
    dentist2: { e: '😖', t: 'That toothache got worse. Emergency treatment costs $320.', followUp: true, c: [['Pay for treatment', { cash: -320, note: 'Ignoring small problems often makes them expensive problems.' }]] },
    holiday: { e: '🎁', t: 'Holiday season! Time for gifts.', c: [['Handmade gifts ($25)', { cash: -25, happy: 5 }], ['Buy gifts ($120)', { cash: -120, happy: 8 }], ['Huge spree on a credit card ($350)', { debt: 350, happy: 12, note: '$350 went on a credit card at 24% APR. Interest starts next month.' }]] },
    hysa: { e: '🏦', t: 'Your bank offers a high-yield savings account paying 5% instead of 3%.', c: [['Switch to it', { boost: true, happy: 1, note: 'Your savings now earn more interest every month.' }], ['Not now', {}]] },
    trip: { e: '✈️', t: 'There is a school trip abroad. It costs $250.', c: [['Go!', { cash: -250, happy: 15 }], ['Skip it', { happy: -8 }]] },
    wallet: { e: '😱', t: 'You lose your wallet with $40 cash and your bank card inside.', c: [['Freeze the card in the app right away', { cash: -40, note: 'Quick thinking! Freezing the card stopped anyone using it.' }], ['Wait and see if it turns up', { cash: -40, chance: { p: 0.6, eff: { cash: -150 }, yes: 'Someone used your card for $150 before you froze it 😩', no: 'Phew, nobody used the card. Next time, freeze it straight away.' } }]] },
    bike: { e: '🚲', t: 'Your bike gets a flat tyre.', c: [['Fix it yourself with a $12 kit', { cash: -12, happy: 2 }], ['Take it to a bike shop ($35)', { cash: -35 }], ['Use ride-shares this month ($90)', { cash: -90 }]] },
    raise: { e: '🎉', t: 'Great work! Your boss gives you a $40/month raise.', c: [['Awesome!', { income: 40, happy: 5, note: 'Tip: try saving your raise instead of upgrading your lifestyle.' }]] },
    game: { e: '🎮', t: 'A new game drops for $70, or you could buy loot boxes at $5 each.', c: [['Buy the game', { cash: -70, happy: 6 }], ['Buy 10 loot boxes ($50)', { cash: -50, happy: 1, note: 'Mostly duplicates... Loot boxes are designed like gambling.' }], ['Skip it', { happy: -2 }]] },
    refund: { e: '🧾', t: 'A tax refund arrives: +$120!', c: [['Save it', { save: 120 }], ['Treat yourself', { happy: 6 }]] }
  };

  function newLife(goal) {
    const deck = shuffle(Object.keys(EVENTS).filter(k => !EVENTS[k].followUp)).slice(0, 12);
    return { phase: 'budget', month: 1, goal, checking: 0, savings: 0, debt: 0, happy: 70, income: INCOME, subs: 0, boost: false, deck, next: null, earned: 0, paid: 0, log: [], covered: 0, carded: 0 };
  }

  function life(main) {
    const S = app.S;
    let L = S.life;
    const save = () => { S.life = L; ST.save(); };
    const fixedTotal = () => FIXED.reduce((t, f) => t + f[1], 0) + L.subs;

    function shell(inner) {
      main.innerHTML = '<div class="sim-head"><a href="#/sim" class="x">‹</a><h1>Life Sim</h1>' + (L && L.phase !== 'setup' && L.phase !== 'done' ? '<span class="pill">Month ' + L.month + '/12</span>' : '') + '</div>' + (L && L.phase !== 'setup' ? hud() : '') + inner;
    }
    function hud() {
      const g = L.goal;
      return '<div class="card life-hud"><div class="lh-goal"><span>' + g.e + ' ' + esc(g.name) + '</span><b>' + fmt(L.savings) + ' / ' + fmt(g.amt) + '</b></div><div class="bar"><i style="width:' + Math.min(100, L.savings / g.amt * 100) + '%"></i></div>' +
        '<div class="lh-stats"><div><span class="kicker">Checking</span><b>' + fmt(L.checking) + '</b></div><div><span class="kicker">Savings</span><b>' + fmt(L.savings) + '</b></div><div><span class="kicker">Debt</span><b class="' + (L.debt > 0 ? 'down' : '') + '">' + fmt(L.debt) + '</b></div>' +
        '<div><span class="kicker">Happiness</span><b>' + moodEmoji(L.happy) + ' ' + Math.round(L.happy) + '</b></div></div></div>';
    }
    function moodEmoji(h) { return h >= 80 ? '😄' : h >= 60 ? '🙂' : h >= 40 ? '😐' : h >= 20 ? '😟' : '😫'; }

    function setup() {
      L = null;
      shell('<div class="card"><h2>Welcome to your first year of paychecks 👋</h2><p>You are 17 with a part-time job paying <b>' + fmt(INCOME) + '/month</b> after tax. Each month you will budget your pay, handle a surprise event and try to reach a savings goal in <b>12 months</b>, without letting happiness crash or debt pile up.</p>' +
        '<ul class="list"><li>Savings earn interest (about 3% a year).</li><li>If your checking account runs dry, your savings cover the gap first (that is your emergency fund!), then the rest goes on a credit card at <b>24% APR</b>.</li><li>Fun spending keeps you happy. Zero fun = burnout.</li></ul></div>' +
        '<h2 class="section">Pick your goal</h2>' + GOALS.map(g => '<button class="card goal-opt" data-g="' + g.id + '"><span class="emoji-tile">' + g.e + '</span><div><h3>' + g.name + '</h3><p class="muted">Save ' + fmt(g.amt) + ' · ' + g.diff + '</p></div><span class="go">▶</span></button>').join(''));
      $$('.goal-opt', main).forEach(b => b.onclick = () => { L = newLife(GOALS.find(g => g.id === b.dataset.g)); L.checking = 0; payday(); });
    }

    function payday() {
      L.carry = Math.max(0, L.checking);
      L.checking += L.income - fixedTotal();
      L.phase = 'budget';
      save();
      budget();
    }

    function budget() {
      const avail = Math.max(0, Math.floor(L.checking));
      shell('<div class="card"><h2>💸 Payday! Month ' + L.month + '</h2>' +
        '<div class="ledger">' + (L.carry >= 1 ? '<div><span>Left over from last month</span><b>' + fmt(L.carry) + '</b></div>' : '') + '<div><span>Pay (after tax)</span><b class="up">+' + fmt(L.income) + '</b></div>' + FIXED.map(f => '<div><span>' + f[0] + '</span><b class="down">−' + fmt(f[1]) + '</b></div>').join('') +
        (L.subs ? '<div><span>📺 Subscriptions</span><b class="down">−' + fmt(L.subs) + '</b></div>' : '') +
        '<div class="total"><span>Available in checking</span><b>' + fmt(L.checking) + '</b></div></div></div>' +
        '<div class="card"><h3>Plan your month</h3>' +
        slider('fun', '🎉 Fun & going out', avail) + slider('sav', '🐷 Move to savings', avail) + (L.debt > 0 ? slider('pay', '💳 Pay off credit card', Math.min(avail, Math.ceil(L.debt))) : '') +
        '<div class="ledger"><div class="total"><span>Left in checking (buffer for surprises)</span><b id="left"></b></div></div><p class="muted small" id="mood"></p>' +
        '<button class="btn primary block lg" id="go">Lock in my budget</button></div>' +
        '<p class="hint center">💡 Keeping a buffer in checking means surprise costs will not drain your savings or go on the credit card.</p>');
      const get = id => $('#' + id) ? +$('#' + id).value : 0;
      function sync(changed) {
        // keep total spending within what is available
        let f = get('fun'), s = get('sav'), p = get('pay');
        const over = f + s + p - avail;
        if (over > 0) {
          const order = ['pay', 'sav', 'fun'].filter(x => x !== changed && $('#' + x));
          let rem = over;
          order.forEach(id => { const v = get(id), cut = Math.min(v, rem); $('#' + id).value = v - cut; rem -= cut; });
        }
        ['fun', 'sav', 'pay'].forEach(id => { if ($('#' + id)) $('#' + id + '-v').textContent = fmt(get(id)); });
        const left = avail - get('fun') - get('sav') - get('pay');
        $('#left').textContent = fmt(left);
        const d = happyDelta(get('fun'));
        $('#mood').textContent = 'Happiness this month: ' + (d >= 0 ? '+' : '') + d + (L.debt > 0 && get('pay') < Math.min(L.debt, 50) ? ' · ⚠️ Unpaid card debt grows 2% every month!' : '');
      }
      $$('input[type=range]', main).forEach(r => r.oninput = () => sync(r.id));
      // sensible starting values
      if ($('#pay')) $('#pay').value = Math.min(Math.ceil(L.debt), Math.floor(avail * 0.3));
      $('#fun').value = Math.min(80, avail);
      $('#sav').value = Math.max(0, Math.floor((avail - get('fun') - get('pay')) * 0.6));
      sync('fun');
      $('#go').onclick = () => {
        const f = get('fun'), s = get('sav'), p = get('pay');
        L.checking -= f + s + p; L.savings += s; L.debt = Math.max(0, L.debt - p);
        L.happy = clamp(L.happy + happyDelta(f));
        L.monthFun = f;
        L.phase = 'event';
        sound('coin');
        save();
        event();
      };
    }
    function slider(id, label, max) {
      return '<label class="slider"><span>' + label + '</span><b id="' + id + '-v"></b><input type="range" id="' + id + '" min="0" max="' + max + '" step="5" value="0"></label>';
    }
    function happyDelta(fun) { return Math.round(Math.min(14, fun / 10) - 7); }
    function clamp(h) { return Math.max(0, Math.min(100, h)); }

    function event() {
      const id = L.next || L.deck[L.month - 1];
      const ev = EVENTS[id];
      shell('<div class="card event pop"><div class="big-emoji">' + ev.e + '</div><div class="kicker">Life happens…</div><h2>' + esc(money(ev.t)) + '</h2><div class="opts">' +
        ev.c.map((c, i) => '<button class="opt" data-i="' + i + '">' + esc(money(c[0])) + '</button>').join('') + '</div></div>');
      $$('.opt', main).forEach(b => b.onclick = () => {
        const [label, eff] = ev.c[+b.dataset.i];
        L.next = null;
        const notes = [];
        apply(eff, notes);
        if (eff.chance) {
          if (Math.random() < eff.chance.p) { apply(eff.chance.eff, notes); notes.push(eff.chance.yes); }
          else notes.push(eff.chance.no);
        }
        if (eff.note) notes.push(eff.note);
        L.lastEvent = { e: ev.e, t: ev.t, choice: label, notes };
        endMonth();
      });
    }
    function apply(eff, notes) {
      if (eff.cash) L.checking += eff.cash;
      if (eff.save) L.savings += eff.save;
      if (eff.debt) L.debt += eff.debt;
      if (eff.happy) L.happy = clamp(L.happy + eff.happy);
      if (eff.sub) L.subs += eff.sub;
      if (eff.income) L.income += eff.income;
      if (eff.boost) L.boost = true;
      if (eff.next) L.next = eff.next;
      // Overdrawn? Emergency fund first, then the credit card.
      if (L.checking < 0) {
        const need = -L.checking;
        const fromSav = Math.min(need, L.savings);
        L.savings -= fromSav; L.checking += fromSav; L.covered += fromSav;
        if (fromSav > 0) notes.push('🧯 Your savings covered ' + fmt(fromSav) + '. That is what an emergency fund is for, but it set your goal back.');
        if (L.checking < 0) {
          const c = -L.checking;
          L.debt += c; L.checking = 0; L.carded += c;
          notes.push('💳 ' + fmt(c) + ' went on your credit card at 24% APR.');
        }
      }
    }
    function endMonth() {
      const rate = L.boost ? BOOST_RATE : SAVE_RATE;
      const earned = L.savings * rate, owed = L.debt * DEBT_RATE;
      L.savings += earned; L.debt += owed; L.earned += earned; L.paid += owed;
      L.lastEvent.earned = earned; L.lastEvent.owed = owed;
      if (L.happy <= 10) L.lastEvent.notes.push('😫 Burnout warning! You need some fun in your budget.');
      L.log.push({ m: L.month, sav: Math.round(L.savings), debt: Math.round(L.debt), happy: Math.round(L.happy) });
      L.phase = 'summary';
      save();
      summary();
    }
    function summary() {
      const e = L.lastEvent;
      shell('<div class="card pop"><div class="kicker">End of month ' + L.month + '</div><h2>' + e.e + ' ' + esc(money(e.choice)) + '</h2>' +
        (e.notes.length ? '<ul class="list">' + e.notes.map(n => '<li>' + esc(money(n)) + '</li>').join('') + '</ul>' : '') +
        '<div class="ledger">' + (e.earned > 0.005 ? '<div><span>🌱 Interest earned on savings</span><b class="up">+' + fmt(e.earned, 2) + '</b></div>' : '') +
        (e.owed > 0.005 ? '<div><span>💳 Interest charged on card debt</span><b class="down">+' + fmt(e.owed, 2) + ' owed</b></div>' : '') + '</div>' +
        '<button class="btn primary block lg" id="nx">' + (L.month < 12 ? 'Next month ▶' : 'See my year 🏁') + '</button></div>' +
        (L.log.length > 1 ? '<div class="card"><h3>Your progress</h3><canvas id="lchart" class="chart"></canvas><div class="legend"><span><i style="background:var(--good)"></i>Savings</span><span><i style="background:var(--bad)"></i>Debt</span></div></div>' : ''));
      if ($('#lchart')) lineChart($('#lchart'), [{ data: [0].concat(L.log.map(x => x.sav)), color: getVar('--good'), fill: true }, { data: [0].concat(L.log.map(x => x.debt)), color: getVar('--bad') }], { length: 13 });
      $('#nx').onclick = () => {
        if (L.month >= 12) { L.phase = 'done'; save(); done(); return; }
        L.month++;
        payday();
      };
    }
    function done() {
      const g = L.goal, win = L.savings >= g.amt && L.debt < 0.5, debtFree = L.debt < 0.5;
      const grade = (L.savings >= g.amt ? 2 : L.savings >= g.amt * 0.75 ? 1 : 0) + (debtFree ? 1 : 0) + (L.happy >= 50 ? 1 : 0);
      const letter = ['D', 'C', 'B', 'A', 'A+'][grade];
      if (!L.rewarded) {
        L.rewarded = true; save();
        if (win) ST.flag('lifeWin');
        if (debtFree) ST.flag('debtFree');
        ST.addXP(40 + (win ? 20 : 0), 'Life Sim');
      }
      if (win) MQ.ui.confetti();
      shell('<div class="result pop"><div class="big-emoji bounce">' + (win ? '🎯' : '📘') + '</div><h1>' + (win ? 'Goal reached!' : 'Year complete') + '</h1>' +
        '<div class="grade">' + letter + '</div>' +
        '<div class="result-stats"><div><b>' + fmt(L.savings) + '</b><span>saved</span></div><div><b class="' + (debtFree ? '' : 'down') + '">' + fmt(L.debt) + '</b><span>debt</span></div><div><b>' + moodEmoji(L.happy) + ' ' + Math.round(L.happy) + '</b><span>happiness</span></div></div>' +
        '<div class="card"><div class="ledger"><div><span>🌱 Interest you earned</span><b class="up">' + fmt(L.earned, 2) + '</b></div><div><span>💳 Interest you paid</span><b class="down">' + fmt(L.paid, 2) + '</b></div>' +
        '<div><span>🧯 Emergencies covered by savings</span><b>' + fmt(L.covered) + '</b></div><div><span>📺 Subscriptions at the end</span><b>' + fmt(L.subs) + '/mo</b></div></div></div>' +
        '<p class="muted">' + (win ? 'You balanced fun, saving and surprises like a pro.' : L.debt > 0 ? 'Credit card interest worked against you. Paying it off fast is like earning a guaranteed 24% return!' : L.happy < 30 ? 'You saved hard but burned out. A good budget includes some fun.' : 'Close! Keeping a bigger buffer and skipping a few wants would get you there.') + '</p>' +
        '<button class="btn primary block lg" id="again">Play again</button><a class="btn ghost block" href="#/sim">Back to simulations</a></div>');
      $('#again').onclick = () => { S.life = null; ST.save(); setup(); };
    }

    // resume where we left off
    if (!L || !L.phase || L.phase === 'setup') setup();
    else if (L.phase === 'budget') budget();
    else if (L.phase === 'event') event();
    else if (L.phase === 'summary') summary();
    else done();
  }
})(window.MQ);
