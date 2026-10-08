// Simulations: a live fake stock market and a 12-month life/budget simulator.
// Everything here is fictional. No real companies, prices or money.
window.MQ = window.MQ || {};

(function (MQ) {
  const { $, $$, esc, money, fmt, pct, toast, modal, closeModal, sound, shuffle, lineChart } = MQ.ui;
  const ST = MQ.state;
  const app = MQ.app;

  app.route('sim', (main, args) => {
    if (args[0] === 'market') return market(main);
    if (args[0] === 'life') return MQ.lifesim.screen(main, args);
    if (args[0] === 'portfolio') return MQ.portfolio.screen(main, args);
    const S = app.S;
    const m = S.market, l = S.lifeSim, pf = S.portfolio;
    const status = (cond1, t1, cond2, t2) => cond1 ? t1 : cond2 ? t2 : '✨ New';
    main.innerHTML = '<h1>Simulate</h1><p class="sub">Practise real decisions with fake money. Nothing here is real, so experiment and learn from mistakes!</p>' +
      card('#/sim/life', '#f59e0b', '🏙️', 'Life Simulator', 'Live a year of teen money life: pocket money' + (MQ.country().teenJob ? ', a part-time job' : ' and gifts') + ', school trips, games, friends and a big goal. Make your choices, then replay "What if…?" versions. Also: Future You (first salary), custom lives and multiplayer challenges.',
        status(l && l.phase !== 'done', '▶ In progress · ' + (l && l.scn ? esc(l.scn.name) + ', month ' + Math.min(l.st.m, l.scn.months) : ''), l && l.phase === 'done', '✅ Finished · start a new life')) +
      card('#/sim/portfolio', '#0ea5e9', '🧺', 'Portfolio Simulator', 'Split ' + fmt(MQ.country().portfolioStart) + ' across stocks, bonds, ETFs, gold, cash and real estate, then live through real historical periods (like 2008 or 2020) or a random future. Find out WHY it happened.',
        status(pf && pf.run && !pf.run.done, '▶ In progress', pf && pf.best, '🏅 Best diversification: ' + (S.records.diversify || 0) + '/100')) +
      card('#/sim/market', '#8b5cf6', '📈', 'Market Mania', 'Trade fictional companies while prices move live and breaking news shakes the market. Can you beat the index fund?',
        status(m && !m.done, '▶ In progress · Day ' + (m ? m.day : 0) + '/' + (m ? m.length : 0), m && m.done, '✅ Finished a year · tap to start again')) +
      '<p class="hint center">These are educational simulations. Fictional or historical data only, never real trading.</p>';
  });
  function card(href, color, e, title, desc, status) {
    return '<a class="card game-card" href="' + href + '" style="--c:' + color + '"><span class="emoji-tile">' + e + '</span><div><h3>' + title + '</h3><p class="muted">' + desc + '</p><div class="small">' + status + '</div></div></a>';
  }


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
})(window.MQ);
