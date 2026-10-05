// Portfolio Simulator: split fictional money across 6 asset classes and live through historical periods
// (or a randomly generated future). Explains WHY things happened, with crash decisions and What-If replays.
//
// Historical data = approximate calendar-year returns (%) rounded from public index data
// (e.g. S&P 500 total return, Nasdaq-100, US 10-year Treasury, T-bills, gold, US home prices, CPI;
// Nifty 50, Nifty Midcap 100, Indian gilts, gold in INR, typical FD rates, housing indices, CPI).
// They are for learning, not exact, and past returns never guarantee future ones.
window.MQ = window.MQ || {};

(function (MQ) {
  const { $, $$, esc, fmt, fmtShort, pct, toast, modal, closeModal, sound, lineChart } = MQ.ui;
  const ST = MQ.state;
  const F = n => fmt(Math.round(n));

  const ASSETS = [
    { id: 'stocks', e: '🚀', name: 'Stocks', color: '#ef4444' },
    { id: 'etf', e: '📊', name: 'ETFs', color: '#6366f1' },
    { id: 'bonds', e: '📜', name: 'Bonds', color: '#0ea5e9' },
    { id: 'gold', e: '🥇', name: 'Gold', color: '#eab308' },
    { id: 'cash', e: '💵', name: 'Cash', color: '#22c55e' },
    { id: 'realestate', e: '🏠', name: 'Real estate', color: '#a855f7' }
  ];

  const DATA = {
    US: {
      name: 'US markets', flag: '🇺🇸', from: 2000,
      labels: { stocks: 'Tech-heavy stocks (Nasdaq-100)', etf: 'S&P 500 index ETF', bonds: 'US 10-year Treasury bonds', gold: 'Gold', cash: 'Cash (T-bills / savings)', realestate: 'US home prices' },
      r: {
        stocks: [-36.8, -32.7, -37.6, 49.1, 10.4, 1.5, 6.8, 18.7, -41.9, 53.5, 19.2, 2.7, 16.8, 35.0, 17.9, 8.4, 5.9, 31.5, -1.0, 38.0, 47.6, 26.6, -33.0, 53.8, 24.9],
        etf: [-9.0, -11.9, -22.0, 28.4, 10.7, 4.8, 15.6, 5.5, -36.6, 25.9, 14.8, 2.1, 15.9, 32.1, 13.5, 1.4, 11.8, 21.6, -4.2, 31.2, 18.0, 28.5, -18.0, 26.1, 24.9],
        bonds: [16.7, 5.6, 15.1, 0.4, 4.5, 2.9, 2.0, 10.2, 20.1, -11.1, 8.5, 16.0, 3.0, -9.1, 10.8, 1.3, 0.7, 2.8, 0.0, 9.6, 11.3, -4.4, -17.8, 3.9, -1.6],
        gold: [-5.4, 2.5, 25.6, 19.9, 4.6, 17.8, 23.0, 31.6, 5.8, 25.0, 29.5, 10.2, 7.0, -28.0, -1.5, -10.4, 8.6, 13.1, -1.6, 18.3, 25.1, -3.6, -0.3, 13.1, 27.2],
        cash: [5.8, 3.7, 1.7, 1.0, 1.2, 3.0, 4.7, 4.6, 1.6, 0.1, 0.1, 0.0, 0.1, 0.1, 0.1, 0.2, 0.5, 0.9, 1.9, 2.1, 0.4, 0.1, 2.0, 5.1, 5.0],
        realestate: [9.3, 6.7, 9.6, 9.8, 13.6, 13.5, 1.7, -5.4, -12.0, -3.9, -4.1, -3.9, 6.4, 10.7, 4.5, 5.2, 5.3, 6.2, 4.5, 3.7, 10.4, 18.9, 5.6, 5.5, 4.0]
      },
      cpi: [3.4, 1.6, 2.4, 1.9, 3.3, 3.4, 2.5, 4.1, 0.1, 2.7, 1.5, 3.0, 1.7, 1.5, 0.8, 0.7, 2.1, 2.1, 1.9, 2.3, 1.4, 7.0, 6.5, 3.4, 2.9],
      notes: {
        2000: 'The dot-com bubble burst: wildly overvalued internet companies collapsed. Investors ran to the safety of government bonds.',
        2001: 'A recession and the 9/11 attacks hit markets. Tech kept falling and the central bank cut interest rates sharply.',
        2002: 'Accounting scandals (Enron, WorldCom) destroyed trust. Stocks fell for a third straight year while gold began to rise.',
        2003: 'Recovery! Very low interest rates fuelled a strong stock rebound, especially in beaten-down tech.',
        2004: 'Steady growth. Cheap mortgages started a housing boom.',
        2005: 'House prices soared as lending got looser and looser.',
        2006: 'Housing peaked. Stocks were strong and gold climbed as the dollar weakened.',
        2007: 'Cracks appeared: risky "subprime" mortgages started failing, home prices fell, and gold surged as investors got nervous.',
        2008: 'The Global Financial Crisis: Lehman Brothers collapsed and banks failed. Stocks crashed while government bonds and gold acted as safe havens.',
        2009: 'Massive government stimulus and near-zero interest rates. Stocks bounced back hard from their March lows.',
        2010: 'The recovery continued. Gold hit records amid worries about money printing.',
        2011: 'The European debt crisis and a US credit-rating downgrade. Stocks went nowhere; bonds and gold shone.',
        2012: 'Calm returned as central banks promised to support the economy.',
        2013: 'A huge stock rally. Gold crashed 28% as fear faded, and bonds fell when rates rose (the "taper tantrum").',
        2014: 'Steady gains. Oil prices collapsed and inflation stayed low.',
        2015: 'A choppy year with fears about China\'s slowdown. Stocks flat, gold down.',
        2016: 'Surprise votes (Brexit, the US election) scared markets briefly, then stocks recovered.',
        2017: 'Strong global growth and unusually calm markets. Stocks rose steadily.',
        2018: 'Rising interest rates and a trade war caused a late-year sell-off. Almost everything ended slightly down.',
        2019: 'The central bank cut rates and both stocks and bonds rallied.',
        2020: 'COVID-19: stocks fell about 34% in weeks, then huge stimulus and the shift to online life sparked a massive rebound, led by tech.',
        2021: 'The reopening boom. House prices jumped and inflation started rising fast.',
        2022: 'Inflation hit 40-year highs and interest rates rose at record speed. Stocks AND bonds fell together, a rare double hit.',
        2023: 'Excitement about AI powered tech stocks while inflation cooled.',
        2024: 'The AI rally continued, gold hit record highs, and interest rates began to come down.'
      }
    },
    IN: {
      name: 'Indian markets', flag: '🇮🇳', from: 2008,
      labels: { stocks: 'Mid-cap stocks (Nifty Midcap 100)', etf: 'Nifty 50 index ETF', bonds: 'Government bonds (gilts)', gold: 'Gold (in ₹)', cash: 'Fixed deposits', realestate: 'Home prices' },
      r: {
        stocks: [-59.0, 98.0, 19.0, -31.0, 39.0, -5.0, 56.0, 6.5, 6.5, 47.0, -15.0, -4.0, 21.0, 46.0, 3.0, 46.6, 24.0],
        etf: [-51.8, 75.8, 17.9, -24.6, 27.7, 6.8, 31.4, -4.1, 3.0, 28.6, 3.2, 12.0, 14.9, 24.1, 4.3, 20.0, 8.8],
        bonds: [12, -1, 4, 3, 9, 2, 15, 8, 14, -1, 5, 11, 12, 1, 1, 7, 9],
        gold: [30, 22, 23, 31, 12, -5, -2, -6, 11, 5, 8, 24, 28, -4, 14, 15, 21],
        cash: [9, 7, 7, 9, 9, 9, 8.75, 8, 7, 6.5, 6.75, 6.5, 5.5, 5.25, 6, 7, 7],
        realestate: [10, 8, 15, 18, 18, 14, 12, 10, 7, 6, 6, 4, 3, 2, 4, 5, 4]
      },
      cpi: [9.1, 12.3, 10.5, 8.9, 9.3, 10.9, 6.4, 4.9, 4.5, 3.6, 3.4, 4.8, 6.2, 5.5, 6.7, 5.4, 4.9],
      notes: {
        2008: 'The Global Financial Crisis: foreign investors pulled money out of India and the Nifty roughly halved. Gold jumped.',
        2009: 'Global stimulus and a stable election result triggered a huge rebound, one of the best years ever for Indian stocks.',
        2010: 'Strong growth lifted markets, but inflation was high.',
        2011: 'High inflation, RBI rate hikes and the Europe crisis: stocks fell hard while gold soared over 30%.',
        2012: 'Global money flowed back and markets recovered.',
        2013: 'The "taper tantrum": the rupee crashed, foreign money left and mid-caps fell. The RBI raised rates to defend the rupee.',
        2014: 'Election optimism sparked a big rally, and mid-caps soared over 50%.',
        2015: 'Global slowdown and China fears brought a mild dip.',
        2016: 'Demonetisation in November shocked the cash economy and hit real estate.',
        2017: 'Monthly SIP money poured into mutual funds and mid-caps boomed.',
        2018: 'The IL&FS crisis sparked worries about lenders, and mid-caps tumbled.',
        2019: 'Corporate tax cuts helped big companies while mid-caps lagged. Gold was strong.',
        2020: 'COVID crash in March, then a sharp recovery. Gold surged as a safe haven.',
        2021: 'A retail-investing boom: millions opened demat accounts and mid-caps soared.',
        2022: 'Global rate hikes. India held up better than most markets, and gold rose as the rupee weakened.',
        2023: 'A strong economy and steady domestic investing powered a big mid-cap rally.',
        2024: 'Election-year volatility. Gold hit records and markets still ended higher.'
      }
    }
  };
  ['US', 'IN'].forEach(k => { DATA[k].to = DATA[k].from + DATA[k].cpi.length - 1; });

  // Randomly generated future with booms, crashes and inflation spikes.
  function randomData(seed, years) {
    const r = ST.rng('pf:' + seed);
    const g = () => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    const out = { name: 'Random future (simulated)', flag: '🎲', from: 1, labels: { stocks: 'Growth stocks', etf: 'Broad index ETF', bonds: 'Government bonds', gold: 'Gold', cash: 'Cash savings', realestate: 'Property' }, r: {}, cpi: [], notes: {}, random: true };
    ASSETS.forEach(a => out.r[a.id] = []);
    for (let y = 0; y < years; y++) {
      const m = g(), roll = r();
      let ret = { stocks: 10 + 25 * (0.8 * m + 0.6 * g()), etf: 8 + 15 * m, bonds: 4 + 6 * g() - 1.5 * m, gold: 5 + 14 * g() - 3 * m, cash: 3 + r(), realestate: 5 + 7 * g() + 2 * m };
      let cpi = 2.5 + 1.2 * g(), note;
      if (roll < 0.12) { ret = { stocks: -40 + 10 * g(), etf: -28 + 6 * g(), bonds: 7 + 3 * g(), gold: 12 + 6 * g(), cash: 2, realestate: -9 + 4 * g() }; cpi = 1 + r(); note = 'Simulated recession: companies earned less, people panicked, and investors fled to bonds and gold.'; }
      else if (roll < 0.22) { ret = { stocks: -12 + 10 * g(), etf: -8 + 6 * g(), bonds: -12 + 4 * g(), gold: 18 + 8 * g(), cash: 6, realestate: 6 + 4 * g() }; cpi = 9 + 3 * r(); note = 'Simulated inflation spike: prices jumped, interest rates rose, bonds lost value and gold held up.'; }
      else if (roll < 0.34) { ret.stocks = 38 + 12 * g(); ret.etf = 24 + 6 * g(); note = 'Simulated boom: a new technology wave and cheap money sent stocks flying.'; }
      else note = m > 0.6 ? 'Simulated good year: the economy grew and profits rose.' : m < -0.6 ? 'Simulated rough year: growth slowed and stocks wobbled.' : 'Simulated normal year: nothing dramatic, which is most years!';
      ASSETS.forEach(a => out.r[a.id].push(Math.round(Math.max(-70, ret[a.id]) * 10) / 10));
      out.cpi.push(Math.round(cpi * 10) / 10);
      out.notes[y + 1] = note;
    }
    out.to = years;
    return out;
  }

  const PRESETS = {
    cautious: { name: '🛡️ Cautious', a: { stocks: 0, etf: 25, bonds: 35, gold: 10, cash: 20, realestate: 10 } },
    balanced: { name: '⚖️ Balanced', a: { stocks: 10, etf: 40, bonds: 20, gold: 10, cash: 5, realestate: 15 } },
    aggressive: { name: '🚀 Aggressive', a: { stocks: 35, etf: 45, bonds: 5, gold: 5, cash: 0, realestate: 10 } },
    yolo: { name: '🎰 All-in tech', a: { stocks: 100, etf: 0, bonds: 0, gold: 0, cash: 0, realestate: 0 } }
  };

  function dataFor(cfg) { return cfg.dataset === 'RND' ? randomData(cfg.seed, cfg.years) : DATA[cfg.dataset]; }

  // ---------- Engine ----------
  function run(cfg, decisions, mods) {
    mods = mods || {};
    const D = mods.dataOverride || dataFor(cfg);
    const alloc = mods.alloc || cfg.alloc;
    const start = mods.start !== undefined ? mods.start : cfg.start;
    const years = cfg.years;
    let h = {}; ASSETS.forEach(a => h[a.id] = cfg.amount * alloc[a.id] / 100);
    const total = () => ASSETS.reduce((t, a) => t + h[a.id], 0);
    const rebalance = mods.rebalance !== undefined ? mods.rebalance : cfg.rebalance;
    let sold = false, price = 1;
    const hist = [{ y: start - 1, v: cfg.amount, real: cfg.amount }], yearsOut = [];
    for (let i = 0; i < years; i++) {
      const y = start + i, idx = y - D.from;
      if (idx < 0 || idx >= D.cpi.length) break;
      const before = total(), contrib = {};
      ASSETS.forEach(a => { const r = D.r[a.id][idx] / 100; contrib[a.id] = h[a.id] * r; h[a.id] *= 1 + r; });
      const infl = (mods.inflation !== undefined ? mods.inflation : D.cpi[idx]) / 100;
      price *= 1 + infl;
      const v = total(), ret = v / before - 1;
      const dec = (mods.holdAll ? 'hold' : decisions[y]) || null;
      if (dec === 'sell' && !sold) { const t = total(); ASSETS.forEach(a => h[a.id] = 0); h.cash = t; sold = true; }
      else if (dec === 'buy' || (rebalance && !sold)) { const t = total(); ASSETS.forEach(a => h[a.id] = t * alloc[a.id] / 100); }
      yearsOut.push({ y, idx, ret, contrib, infl, dec, v: total() });
      hist.push({ y, v: total(), real: total() / price });
    }
    const end = total(), n = yearsOut.length;
    const cagr = n ? Math.pow(end / cfg.amount, 1 / n) - 1 : 0;
    const realEnd = end / price, realCagr = n ? Math.pow(realEnd / cfg.amount, 1 / n) - 1 : 0;
    let peak = cfg.amount, mdd = 0; hist.forEach(p => { peak = Math.max(peak, p.v); mdd = Math.min(mdd, p.v / peak - 1); });
    const worst = yearsOut.reduce((a, b) => (!a || b.ret < a.ret ? b : a), null), best = yearsOut.reduce((a, b) => (!a || b.ret > a.ret ? b : a), null);
    const sumContrib = {}; ASSETS.forEach(a => sumContrib[a.id] = yearsOut.reduce((t, y) => t + y.contrib[a.id], 0));
    return { D, end, realEnd, cagr, realCagr, mdd, worst, best, hist, years: yearsOut, sold, sumContrib, inflTotal: price - 1, alloc };
  }

  function divScore(alloc) {
    const w = ASSETS.map(a => alloc[a.id] / 100);
    const hhi = w.reduce((t, x) => t + x * x, 0);
    const classes = w.filter(x => x >= 0.1).length;
    let s = 60 * (1 - hhi) / (1 - 1 / 6) + 40 * Math.min(1, classes / 4);
    if (alloc.stocks + alloc.etf > 80) s -= 10;
    return Math.max(0, Math.min(100, Math.round(s)));
  }

  // ---------- UI ----------
  function S() { return ST.get(); }
  function P() { const s = S(); s.portfolio = s.portfolio || {}; return s.portfolio; }
  function head(title, back) { return '<div class="sim-head"><a href="' + (back || '#/sim') + '" class="x">‹</a><h1>' + title + '</h1></div>'; }
  function getVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }

  function screen(main, args) {
    const p = P();
    if (args[1] === 'run' && p.run) return p.run.done ? results(main) : runScreen(main);
    if (p.run && !p.run.done && args[1] !== 'new') return runScreen(main);
    return setup(main);
  }

  function setup(main) {
    const p = P(), c = MQ.country();
    const pers = S().personality;
    const suggest = pers ? (pers.riskLevel === 'low' ? 'cautious' : pers.riskLevel === 'high' ? 'aggressive' : 'balanced') : 'balanced';
    const cfg = p.cfg || { dataset: c.dataset === 'IN' ? 'IN' : 'US', start: 2008, years: 10, alloc: Object.assign({}, PRESETS[suggest].a), rebalance: true, amount: c.portfolioStart };
    cfg.amount = c.portfolioStart;
    function draw() {
      const D = cfg.dataset === 'RND' ? null : DATA[cfg.dataset];
      if (D) { cfg.start = Math.max(D.from, Math.min(cfg.start, D.to - 4)); cfg.years = Math.min(cfg.years, D.to - cfg.start + 1); }
      const sum = ASSETS.reduce((t, a) => t + cfg.alloc[a.id], 0);
      main.innerHTML = head('Portfolio Simulator') +
        '<p class="sub">You have <b>' + F(cfg.amount) + '</b> of fictional money. Split it, then live through ' + (cfg.dataset === 'RND' ? 'a randomly generated future' : 'real history') + ' one year at a time.</p>' +
        '<div class="card"><div class="kicker">1 · Choose a period</div><div class="chips">' +
        ['US', 'IN', 'RND'].map(k => '<button class="chip ' + (cfg.dataset === k ? 'on' : '') + '" data-ds="' + k + '">' + (k === 'RND' ? '🎲 Random future' : DATA[k].flag + ' ' + DATA[k].name + ' ' + DATA[k].from + '–' + DATA[k].to) + '</button>').join('') + '</div>' +
        (D ? '<div class="row" style="margin-top:10px"><label>Start in <select id="start">' + range(D.from, D.to - 4).map(y => '<option ' + (y === cfg.start ? 'selected' : '') + '>' + y + '</option>').join('') + '</select></label>' +
          '<label>for <select id="years">' + [5, 10, 15, 20].filter(n => cfg.start + n - 1 <= D.to).map(n => '<option ' + (n === cfg.years ? 'selected' : '') + '>' + n + '</option>').join('') + '</select> years</label></div>' +
          '<p class="hint">"What would have happened if you invested ' + F(cfg.amount) + ' in January ' + cfg.start + '?"</p>'
          : '<label class="row" style="margin-top:10px">Years <select id="years">' + [5, 10, 15, 20].map(n => '<option ' + (n === cfg.years ? 'selected' : '') + '>' + n + '</option>').join('') + '</select></label><p class="hint">A brand-new random future every time, with booms, crashes and inflation spikes.</p>') + '</div>' +
        '<div class="card"><div class="kicker">2 · Build your portfolio</div><div class="chips">' + Object.keys(PRESETS).map(k => '<button class="chip" data-pre="' + k + '">' + PRESETS[k].name + (k === suggest && pers ? ' ⭐' : '') + '</button>').join('') + '</div>' +
        (pers ? '<p class="hint">⭐ Suggested for your ' + pers.riskLevel + ' risk tolerance (from your money personality).</p>' : '') +
        ASSETS.map(a => '<label class="slider alloc"><span>' + a.e + ' ' + a.name + ' <small class="muted">' + esc((D || randomData(1, 1)).labels[a.id]) + '</small></span><b>' + cfg.alloc[a.id] + '%</b><input type="range" min="0" max="100" step="5" data-a="' + a.id + '" value="' + cfg.alloc[a.id] + '" ' + (a.id === 'cash' ? 'disabled' : '') + '></label>').join('') +
        '<p class="hint">Cash automatically takes whatever is left so the total is always 100%.</p>' +
        '<div class="alloc-bar">' + ASSETS.map(a => '<i style="width:' + cfg.alloc[a.id] + '%;background:' + a.color + '" title="' + a.name + '"></i>').join('') + '</div>' +
        '<div class="ledger"><div><span>Diversification score</span><b>' + divScore(cfg.alloc) + '/100</b></div></div>' +
        '<label class="set-row"><span>Rebalance back to these % every year</span><input type="checkbox" id="reb" ' + (cfg.rebalance ? 'checked' : '') + '></label></div>' +
        '<button class="btn primary block lg" id="go" ' + (sum !== 100 ? 'disabled' : '') + '>Start investing ▶</button>' +
        '<p class="hint center">Historical returns are approximate yearly figures for learning. Past performance never guarantees the future.</p>';
      $$('[data-ds]', main).forEach(b => b.onclick = () => { cfg.dataset = b.dataset.ds; if (cfg.dataset !== 'RND') cfg.start = DATA[cfg.dataset].from; draw(); });
      if ($('#start')) $('#start').onchange = e => { cfg.start = +e.target.value; draw(); };
      $('#years').onchange = e => { cfg.years = +e.target.value; draw(); };
      $$('[data-pre]', main).forEach(b => b.onclick = () => { cfg.alloc = Object.assign({}, PRESETS[b.dataset.pre].a); draw(); });
      $$('input[data-a]', main).forEach(inp => {
        const set = () => {
          const id = inp.dataset.a;
          const others = ASSETS.filter(a => a.id !== id && a.id !== 'cash').reduce((t, a) => t + cfg.alloc[a.id], 0);
          const v = Math.min(+inp.value, 100 - others);
          cfg.alloc[id] = v; cfg.alloc.cash = 100 - others - v;
          return v;
        };
        inp.oninput = () => {
          const v = set();
          inp.value = v; inp.parentElement.querySelector('b').textContent = v + '%';
          const cashInp = $('input[data-a="cash"]', main);
          cashInp.value = cfg.alloc.cash; cashInp.parentElement.querySelector('b').textContent = cfg.alloc.cash + '%';
        };
        inp.onchange = () => { set(); draw(); };
      });
      $('#reb').onchange = e => { cfg.rebalance = e.target.checked; };
      $('#go').onclick = () => {
        cfg.seed = Math.floor(Math.random() * 1e9);
        if (cfg.dataset === 'RND') cfg.start = 1;
        p.cfg = JSON.parse(JSON.stringify(cfg));
        p.run = { i: 0, decisions: {}, done: false };
        ST.save();
        MQ.app.go('#/sim/portfolio/run');
      };
    }
    draw();
  }
  function range(a, b) { const o = []; for (let i = a; i <= b; i++) o.push(i); return o; }

  function yearLabel(D, y) { return D.random ? 'Year ' + y : String(y); }

  function runScreen(main) {
    const p = P(), cfg = p.cfg, R = p.run;
    const res = run(cfg, R.decisions);
    const D = res.D, shown = res.years.slice(0, R.i), cur = shown[shown.length - 1];
    const value = R.i ? cur.v : cfg.amount;
    main.innerHTML = head('Portfolio Simulator', '#/sim') +
      '<div class="card"><div class="mk-top"><div class="mk-val"><span class="kicker">' + (R.i ? 'End of ' + yearLabel(D, cur.y) : 'Starting value') + '</span><b>' + F(value) + '</b><span class="' + (value >= cfg.amount ? 'up' : 'down') + '">' + pct(value / cfg.amount - 1) + ' total</span></div>' +
      '<div class="mk-side"><div><span class="kicker">Year</span><b>' + R.i + ' / ' + res.years.length + '</b></div></div></div>' +
      '<canvas id="pfc" class="chart"></canvas><div class="legend"><span><i style="background:var(--accent)"></i>Your portfolio</span><span><i style="background:var(--muted)"></i>After inflation</span></div></div>' +
      (cur ? yearCard(D, cur, cfg) : '<div class="card"><h3>' + (D.random ? 'Ready for year 1' : 'January ' + cfg.start) + '</h3><p class="muted">You invested ' + F(cfg.amount) + '. Press "Next year" to see what happens and why.</p></div>') +
      '<button class="btn primary block lg" id="nx">' + (R.i >= res.years.length ? 'See results 🏁' : 'Next year ▶') + '</button>' +
      '<button class="btn ghost block" id="ff">⏩ Skip to the end</button>';
    const hist = res.hist.slice(0, R.i + 1);
    lineChart($('#pfc'), [{ data: hist.map(x => x.real), color: getVar('--muted'), width: 1.5 }, { data: hist.map(x => x.v), color: getVar('--accent'), fill: true }], { length: res.years.length + 1, baseline: cfg.amount });
    const advance = () => {
      if (R.i >= res.years.length) { finish(); return; }
      R.i++;
      const yr = run(cfg, R.decisions).years[R.i - 1];
      ST.save();
      if (yr.ret <= -0.1 && !R.decisions[yr.y] && !res.sold) crashPrompt(yr, D);
      else MQ.app.render();
    };
    $('#nx').onclick = advance;
    $('#ff').onclick = () => {
      // Keep going but still stop at crashes, because that decision matters.
      while (R.i < res.years.length) {
        R.i++;
        const yr = run(cfg, R.decisions).years[R.i - 1];
        if (yr.ret <= -0.1 && !R.decisions[yr.y] && !run(cfg, R.decisions).sold) { ST.save(); crashPrompt(yr, D); return; }
      }
      ST.save(); MQ.app.render();
    };
  }
  function yearCard(D, yr, cfg) {
    const rows = ASSETS.map(a => {
      const r = D.r[a.id][yr.idx];
      return '<div class="yr-row"><span>' + a.e + ' ' + a.name + '</span><b class="' + (r >= 0 ? 'up' : 'down') + '">' + (r >= 0 ? '+' : '') + r + '%</b><small class="' + (yr.contrib[a.id] >= 0 ? 'up' : 'down') + '">' + (cfg.alloc[a.id] || yr.contrib[a.id] ? (yr.contrib[a.id] >= 0 ? '+' : '−') + fmtShort(Math.abs(yr.contrib[a.id])) : '–') + '</small></div>';
    }).join('');
    return '<div class="card pop"><div class="kicker">' + (D.random ? '🎲 ' : '📅 ') + yearLabel(D, yr.y) + ' · inflation ' + (yr.infl * 100).toFixed(1) + '%</div>' +
      '<h3 class="' + (yr.ret >= 0 ? 'up' : 'down') + '">Your portfolio: ' + pct(yr.ret) + '</h3>' +
      '<p><b>Why?</b> ' + esc(D.notes[yr.y] || '') + '</p>' +
      '<div class="yr-table"><div class="yr-row head"><span>Asset</span><b>Return</b><small>Your gain</small></div>' + rows + '</div>' +
      (yr.dec ? '<p class="tip-line">Your decision: ' + ({ sell: '😱 Sold everything to cash', hold: '🧘 Held steady', buy: '💪 Rebalanced and bought the dip' })[yr.dec] + '</p>' : '') + '</div>';
  }
  function crashPrompt(yr, D) {
    const p = P();
    modal('<div class="celebrate"><div class="big-emoji">📉</div><h2>Your portfolio fell ' + Math.abs(Math.round(yr.ret * 100)) + '% in ' + yearLabel(D, yr.y) + '</h2><p class="muted">' + esc(D.notes[yr.y] || '') + '</p><p><b>Everyone around you is panicking. What do you do?</b></p>' +
      '<div class="opts"><button class="opt" data-d="sell">😱 Sell everything and move to cash</button><button class="opt" data-d="hold">🧘 Hold my plan</button><button class="opt" data-d="buy">💪 Rebalance: buy more of what fell</button></div></div>', { sticky: true });
    $$('.modal .opt').forEach(b => b.onclick = () => {
      p.run.decisions[yr.y] = b.dataset.d;
      if (b.dataset.d !== 'sell') ST.flag('survivor');
      ST.save(); closeModal(); MQ.app.render();
    });
  }

  function finish() {
    const p = P(), cfg = p.cfg, R = p.run;
    R.done = true;
    const res = run(cfg, R.decisions);
    const div = divScore(cfg.alloc);
    if (!R.rewarded) {
      R.rewarded = true;
      if (ASSETS.filter(a => cfg.alloc[a.id] >= 10).length >= 4) ST.flag('assetClasses4');
      ST.record('diversify', res.realCagr > 0 ? div : Math.round(div * 0.6));
      p.best = Math.max(p.best || 0, div);
      if (MQ.adaptive) MQ.adaptive.recordResult('investing', Math.min(1, div / 100 * 0.6 + (res.sold ? 0 : 0.4)));
      ST.save();
      ST.addXP(30 + Math.round(div / 5), 'Portfolio Sim');
    }
    ST.save();
    MQ.app.render();
  }

  function whatIfs(cfg, R, res) {
    const out = [];
    const D = res.D;
    if (res.sold) out.push({ id: 'hold', label: 'What if you had held through every crash?', mods: { holdAll: true } });
    out.push({ id: 'reb', label: cfg.rebalance ? 'What if you had NOT rebalanced every year?' : 'What if you had rebalanced every year?', mods: { rebalance: !cfg.rebalance } });
    if (cfg.alloc.etf < 90) out.push({ id: 'etf', label: 'What if you had put 100% in a simple index ETF?', mods: { alloc: { stocks: 0, etf: 100, bonds: 0, gold: 0, cash: 0, realestate: 0 } } });
    if (cfg.alloc.cash < 90) out.push({ id: 'cash', label: 'What if you had kept everything in cash?', mods: { alloc: { stocks: 0, etf: 0, bonds: 0, gold: 0, cash: 100, realestate: 0 } } });
    if (!D.random && cfg.start - 5 >= D.from) out.push({ id: 'early', label: 'What if you had started 5 years earlier (' + (cfg.start - 5) + ')?', mods: { start: cfg.start - 5 } });
    else if (!D.random && cfg.start + 5 + cfg.years - 1 <= D.to) out.push({ id: 'late', label: 'What if you had started 5 years later (' + (cfg.start + 5) + ')?', mods: { start: cfg.start + 5 } });
    out.push({ id: 'infl', label: 'What if inflation had been 6% every year?', mods: { inflation: 6 } });
    return out;
  }

  function results(main) {
    const p = P(), cfg = p.cfg, R = p.run;
    const res = run(cfg, R.decisions), D = res.D, div = divScore(cfg.alloc);
    const singles = ASSETS.map(a => { const al = {}; ASSETS.forEach(b => al[b.id] = b.id === a.id ? 100 : 0); return { a, r: run(cfg, {}, { alloc: al, rebalance: false, holdAll: true }) }; }).sort((x, y) => y.r.end - x.r.end);
    const contrib = ASSETS.filter(a => cfg.alloc[a.id] > 0).map(a => ({ a, v: res.sumContrib[a.id] })).sort((x, y) => y.v - x.v);
    const why = [];
    if (res.worst) why.push('Worst year: ' + yearLabel(D, res.worst.y) + ' (' + pct(res.worst.ret) + '). ' + (D.notes[res.worst.y] || ''));
    if (res.best) why.push('Best year: ' + yearLabel(D, res.best.y) + ' (' + pct(res.best.ret) + '). ' + (D.notes[res.best.y] || ''));
    if (contrib.length) why.push('Your biggest helper was ' + contrib[0].a.name.toLowerCase() + ' (' + (contrib[0].v >= 0 ? '+' : '−') + F(Math.abs(contrib[0].v)) + ' over the whole period).');
    if (contrib.length > 1 && contrib[contrib.length - 1].v < 0) why.push(contrib[contrib.length - 1].a.name + ' dragged you down (' + '−' + F(Math.abs(contrib[contrib.length - 1].v)) + ').');
    const cushion = res.years.find(y => D.r.etf[y.idx] <= -15 && ((cfg.alloc.gold > 0 && D.r.gold[y.idx] > 0) || (cfg.alloc.bonds > 0 && D.r.bonds[y.idx] > 0)));
    if (cushion) why.push('In ' + yearLabel(D, cushion.y) + ' stocks fell ' + Math.abs(D.r.etf[cushion.idx]) + '%, but your ' + (D.r.gold[cushion.idx] > 0 && cfg.alloc.gold ? 'gold (+' + D.r.gold[cushion.idx] + '%)' : 'bonds (+' + D.r.bonds[cushion.idx] + '%)') + ' cushioned the fall. That is diversification at work.');
    if (res.sold) why.push('You sold during a crash. Your money then sat in cash and missed the recovery that followed.');
    why.push('Prices rose ' + Math.round(res.inflTotal * 100) + '% over the period, so your real (after-inflation) growth was ' + pct(res.realCagr) + ' a year instead of ' + pct(res.cagr) + '.');
    main.innerHTML = head('Portfolio results') +
      '<div class="result pop"><div class="big-emoji">' + (res.realCagr > 0.04 ? '🏆' : res.realCagr > 0 ? '📈' : '📉') + '</div><h1>' + F(cfg.amount) + ' → ' + F(res.end) + '</h1><p class="muted">' + esc(D.name) + (D.random ? '' : ', ' + cfg.start + '–' + (cfg.start + res.years.length - 1)) + '</p></div>' +
      '<div class="card"><h3>📊 Your numbers</h3><div class="ledger">' +
      '<div><span>Yearly growth (CAGR)</span><b class="' + (res.cagr >= 0 ? 'up' : 'down') + '">' + pct(res.cagr) + '</b></div>' +
      '<div><span>After inflation</span><b class="' + (res.realCagr >= 0 ? 'up' : 'down') + '">' + pct(res.realCagr) + ' / year</b></div>' +
      '<div><span>Worst drop (peak to bottom)</span><b class="down">' + pct(res.mdd) + '</b></div>' +
      '<div><span>Diversification score</span><b>' + div + '/100</b></div>' +
      '<div><span>Rebalancing</span><b>' + (cfg.rebalance ? 'Every year' : 'Never') + '</b></div></div></div>' +
      '<div class="card"><h3>🤔 Why did this happen?</h3><ul class="list">' + why.map(w => '<li>' + esc(w) + '</li>').join('') + '</ul></div>' +
      '<div class="card"><h3>If you had picked just one asset…</h3>' + singles.map(s => '<div class="unit-prog"><span>' + s.a.e + ' ' + s.a.name + '</span><div class="bar"><i style="width:' + Math.max(2, s.r.end / singles[0].r.end * 100) + '%;background:' + s.a.color + '"></i></div><span class="small">' + fmtShort(s.r.end) + '</span></div>').join('') +
      '<div class="unit-prog you-row"><span>⭐ Your mix</span><div class="bar"><i style="width:' + Math.max(2, res.end / singles[0].r.end * 100) + '%"></i></div><span class="small"><b>' + fmtShort(res.end) + '</b></span></div>' +
      '<p class="hint">Nobody knows in advance which asset will win. That is why mixing them makes sense.</p></div>' +
      '<div class="card"><h3>📈 Growth</h3><canvas id="pfr" class="chart"></canvas><div class="legend" id="pfl"><span><i style="background:var(--accent)"></i>Your portfolio</span></div></div>' +
      '<h2 class="section">🧪 What if…?</h2><div class="whatifs">' + whatIfs(cfg, R, res).map(w => '<button class="btn whatif" data-id="' + w.id + '">' + esc(w.label) + '</button>').join('') + '</div><div id="pwi"></div>' +
      '<button class="btn primary block lg" id="again">Try another portfolio</button><button class="btn ghost block" id="same">Replay the same period</button>';
    lineChart($('#pfr'), [{ data: res.hist.map(x => x.v), color: getVar('--accent'), fill: true }], { baseline: cfg.amount });
    $('#again').onclick = () => { p.run = null; ST.save(); MQ.app.go('#/sim/portfolio/new'); };
    $('#same').onclick = () => { p.run = { i: 0, decisions: {}, done: false }; ST.save(); MQ.app.render(); };
    $$('.whatif', main).forEach(b => b.onclick = () => {
      const w = whatIfs(cfg, R, res).find(x => x.id === b.dataset.id);
      const alt = run(cfg, w.mods.holdAll ? {} : R.decisions, w.mods);
      $$('.whatif', main).forEach(x => x.classList.toggle('on', x === b));
      const realView = w.id === 'infl';
      lineChart($('#pfr'), [{ data: (realView ? alt.hist.map(x => x.real) : alt.hist.map(x => x.v)), color: getVar('--accent2'), width: 2 }, { data: (realView ? res.hist.map(x => x.real) : res.hist.map(x => x.v)), color: getVar('--accent'), fill: true }], { baseline: cfg.amount, length: Math.max(alt.hist.length, res.hist.length) });
      $('#pfl').innerHTML = '<span><i style="background:var(--accent)"></i>Your portfolio' + (realView ? ' (after inflation)' : '') + '</span><span><i style="background:var(--accent2)"></i>What-if</span>';
      const a = realView ? alt.realEnd : alt.end, me = realView ? res.realEnd : res.end;
      const explain = {
        hold: 'Staying invested meant you were still holding when markets recovered.',
        reb: cfg.rebalance ? 'Without rebalancing, winners grow to dominate the portfolio: more upside, but more risk.' : 'Rebalancing sells some winners and buys laggards, keeping risk steady and often smoothing the ride.',
        etf: 'A single broad index fund is simple and cheap, but you ride every stock-market drop with no cushion.',
        cash: 'Cash feels safe, but after inflation it usually loses buying power over long periods.',
        early: 'A different start date changes everything. That is why investing regularly beats trying to time it.',
        late: 'A different start date changes everything. That is why investing regularly beats trying to time it.',
        infl: 'With 6% inflation, the same portfolio buys much less in real terms. Assets that beat inflation matter more.'
      }[w.id];
      $('#pwi').innerHTML = '<div class="card pop"><div class="kicker">' + esc(w.label) + '</div><h3>' + F(me) + ' → ' + F(a) + (realView ? ' in today\'s money' : '') + ' (' + (a >= me ? '+' : '−') + F(Math.abs(a - me)) + ')</h3>' +
        '<div class="ledger"><div><span>Yearly growth</span><b>' + pct(res.cagr) + ' → ' + pct(alt.cagr) + '</b></div><div><span>Worst drop</span><b>' + pct(res.mdd) + ' → ' + pct(alt.mdd) + '</b></div></div><p class="tip-line">💡 ' + esc(explain) + '</p></div>';
      ST.flag('whatIf');
    });
  }

  MQ.portfolio = { screen, run, divScore, DATA, ASSETS };
})(window.MQ);
