// Life Simulator: a generated character with a real-feeling monthly budget, random life events,
// a big purchase decision (save / loan / BNPL / card), investing, analytics, What-If replays
// and multiplayer challenge codes.
//
// The engine is deterministic: a scenario (seed) + the player's decisions always produce the same
// result. That is what makes What-If replays and fair multiplayer challenges possible.
window.MQ = window.MQ || {};

(function (MQ) {
  const { $, $$, esc, fmt, fmtShort, pct, toast, modal, closeModal, sound, lineChart } = MQ.ui;
  const ST = MQ.state;
  const F = n => fmt(Math.round(n));
  const nice = MQ.roundNice;

  // =====================================================================
  //  EVENTS (costs scale with the character's income, so they feel real in any country)
  // =====================================================================
  const EV = {
    carRepair: { kind: 'shock', e: '🚗', modes: ['first', 'custom'], gen: (r, s) => ({ c: nice(s.income * (0.4 + r() * 0.4)) }),
      t: p => 'Your vehicle broke down. The repair costs ' + F(p.c) + '.',
      c: p => [['Pay for the repair', { cash: -p.c }], ['Cheaper fix at a local garage (' + F(p.c * 0.6) + ')', { cash: -p.c * 0.6, chance: { p: 0.4, eff: { cash: -p.c * 0.5 }, yes: 'The cheap fix failed and cost another ' + F(p.c * 0.5) + '. Cheapest is not always cheapest.', no: 'The cheap fix held up. Nice!' } }], ['Put it on the credit card', { debt: p.c }]] },
    bikeRepair: { kind: 'shock', e: '🚲', modes: ['teen'], gen: (r, s) => ({ c: nice(s.income * (0.1 + r() * 0.12)) }),
      t: p => 'Your bike needs new brakes and a tyre: ' + F(p.c) + '.', c: p => [['Get it fixed', { cash: -p.c }], ['Watch a tutorial and fix it yourself (' + F(p.c * 0.35) + ')', { cash: -p.c * 0.35, happy: 2 }], ['Take rides for a month (' + F(p.c * 1.6) + ')', { cash: -p.c * 1.6 }]] },
    phoneStolen: { kind: 'shock', e: '📱', modes: ['first', 'teen', 'custom'], gen: (r, s) => ({ c: nice(s.income * (0.35 + r() * 0.6)) }),
      t: p => 'Your phone was stolen. The same model costs ' + F(p.c) + '.',
      c: p => [['Replace it with the same model', { cash: -p.c }], ['Buy a cheaper model (' + F(p.c * 0.4) + ')', { cash: -p.c * 0.4, happy: -4 }], ['Get the newest flagship on a 12-month EMI', { emi: { total: p.c * 1.5, months: 12, apr: 18, name: 'Phone EMI' }, happy: 6, impulse: p.c * 0.5 }]] },
    dentist: { kind: 'shock', e: '🦷', modes: ['first', 'teen', 'custom'], gen: (r, s) => ({ c: nice(s.income * (0.08 + r() * 0.12)) }),
      t: p => 'Toothache! A dentist visit costs ' + F(p.c) + '.', c: p => [['Go now', { cash: -p.c }], ['Ignore it and hope it goes away', { happy: -6, follow: { id: 'dentist2', p: { c: p.c * 3.5 } } }]] },
    dentist2: { kind: 'shock', e: '😖', modes: [], followOnly: true, t: p => 'That toothache got worse. Emergency treatment costs ' + F(p.c) + '.', c: p => [['Pay for treatment', { cash: -p.c, note: 'Ignoring small problems often turns them into expensive ones.' }]] },
    laptopBreak: { kind: 'shock', e: '💻', modes: ['teen', 'first', 'custom'], gen: (r, s) => ({ c: nice(s.income * (0.2 + r() * 0.3)) }),
      t: p => 'Coffee meets keyboard ☕💥. Repair costs ' + F(p.c) + '.', c: p => [['Repair it', { cash: -p.c }], ['Borrow a family laptop for a while', { happy: -5 }]] },
    rentHike: { kind: 'shock', e: '🏠', modes: ['first', 'custom'], needsRent: true, gen: (r, s) => ({ pc: 5 + Math.floor(r() * 6) }),
      t: p => 'Your landlord raises the rent by ' + p.pc + '% from next month.',
      c: p => [['Accept it', { rentMul: 1 + p.pc / 100 }], ['Move somewhere cheaper (moving costs half a month\'s rent)', { rentMoveCost: 0.5, rentMul: 0.88, happy: -3 }], ['Get a flatmate (rent −30%)', { rentMul: 0.7, happy: -5 }]] },
    family: { kind: 'shock', e: '👪', modes: ['first', 'custom'], gen: (r, s) => ({ c: nice(s.income * (0.2 + r() * 0.3)) }),
      t: p => 'A family member needs help with a medical bill: ' + F(p.c) + '.', c: p => [['Help fully', { cash: -p.c, happy: 4 }], ['Help with half', { cash: -p.c / 2 }], ['Say you cannot this time', { happy: -6 }]] },
    promotion: { kind: 'opportunity', e: '💼', modes: ['first', 'custom'], gen: (r, s) => ({ d: nice(s.income * (0.1 + r() * 0.18)) }),
      t: p => 'You got a promotion! Income +' + F(p.d) + '/month.',
      c: p => [['Auto-save the raise (live like before)', { income: p.d, autoSave: p.d, note: 'Avoiding "lifestyle inflation" is one of the most powerful money habits.' }], ['Enjoy it: upgrade my lifestyle', { income: p.d, sub: p.d * 0.8, happy: 6, note: 'Most of the raise now goes on a nicer lifestyle every month.' }], ['Split it 50/50', { income: p.d, autoSave: p.d / 2, sub: p.d * 0.4, happy: 3 }]] },
    extraShifts: { kind: 'opportunity', e: '⏰', modes: ['teen'], gen: (r, s) => ({ d: nice(s.income * (0.25 + r() * 0.2)) }),
      t: p => 'Your manager offers extra shifts this month (+' + F(p.d) + ').', c: p => [['Take them', { cash: p.d, happy: -4 }], ['Decline. Exams are coming', { happy: 1 }]] },
    sideGig: { kind: 'opportunity', e: '🎨', modes: ['first', 'teen', 'custom'], gen: (r, s) => ({ d: nice(s.income * (0.2 + r() * 0.25)) }),
      t: p => 'A side gig pops up: ' + F(p.d) + ' for a weekend project.', c: p => [['Take it and save the money', { toEF: p.d, happy: -3 }], ['Take it and invest the money', { toInv: p.d, happy: -3 }], ['Rest instead', { happy: 3 }]] },
    windfall: { kind: 'opportunity', e: '🎁', modes: ['first', 'teen', 'custom'], gen: (r, s) => ({ d: nice(s.income * (0.2 + r() * 0.35)) }),
      t: p => 'Surprise money! A bonus/gift of ' + F(p.d) + ' arrives.', c: p => [['Save it', { toEF: p.d }], ['Invest it', { toInv: p.d }], ['Spend it on something fun', { happy: 7 }], ['Put it towards my goal', { toGoal: p.d }]] },
    match: { kind: 'opportunity', e: '🏦', modes: ['first', 'custom'], gen: (r, s) => ({ pc: 5 }),
      t: p => 'Your employer offers a retirement plan: put in ' + p.pc + '% of pay and they MATCH it 100%.',
      c: p => [['Join. Free money!', { pension: p.pc / 100, note: 'Every contribution is doubled by your employer and invested.' }], ['Not now. I need the cash', {}]] },
    hysa: { kind: 'opportunity', e: '🌱', modes: ['first', 'teen', 'custom'], gen: () => ({}),
      t: () => 'A bank offers a savings account paying 2% more interest than yours.', c: () => [['Switch accounts (takes 10 minutes)', { savBoost: 2, note: 'Your savings now earn more every month.' }], ['Too much effort', {}]] },
    sneakerDrop: { kind: 'temptation', e: '👟', modes: ['first', 'teen', 'custom'], gen: (r, s) => ({ c: nice(s.income * (0.12 + r() * 0.2)) }),
      t: p => 'LIMITED DROP: sneakers for ' + F(p.c) + '. "Only 3 left!"',
      c: p => [['Buy now!', { cash: -p.c, happy: 5, impulse: p.c }], ['Use the 24-hour rule', { chance: { p: 0.6, eff: { happy: 0 }, yes: 'Next day you did not even want them anymore. Saved ' + F(p.c) + '!', no: 'You still wanted them, so you bought them, guilt-free.', noEff: { cash: -p.c, happy: 4 } } }], ['Skip', { happy: -1 }]] },
    trip: { kind: 'temptation', e: '🏖️', modes: ['first', 'teen', 'custom'], gen: (r, s) => ({ c: nice(s.income * (0.25 + r() * 0.3)) }),
      t: p => 'Friends are planning a weekend trip: ' + F(p.c) + ' each.', c: p => [['Go all in!', { cash: -p.c, happy: 12, impulse: p.c * 0.4 }], ['Suggest a cheaper day trip (' + F(p.c * 0.25) + ')', { cash: -p.c * 0.25, happy: 6 }], ['Skip it', { happy: -7 }], ['Go, and put it on the card', { debt: p.c, happy: 10, impulse: p.c }]] },
    subscription: { kind: 'temptation', e: '📺', modes: ['first', 'teen', 'custom'], gen: (r, s) => ({ c: nice(s.income * (0.015 + r() * 0.02)) }),
      t: p => 'Streaming + music + gaming bundle: just ' + F(p.c) + '/month!', c: p => [['Subscribe', { sub: p.c, happy: 3, note: 'That is ' + F(p.c * 12) + ' a year.' }], ['No thanks', {}]] },
    eatingOut: { kind: 'temptation', e: '🍕', modes: ['first', 'teen', 'custom'], gen: (r, s) => ({ c: nice(s.income * (0.05 + r() * 0.05)) }),
      t: p => 'Your friends start eating out every Friday (about ' + F(p.c) + '/month).', c: p => [['Join every week', { sub: p.c, happy: 6 }], ['Join every other week', { sub: p.c / 2, happy: 3 }], ['Host cheap potlucks instead', { sub: p.c * 0.15, happy: 4 }]] },
    gadgetEMI: { kind: 'temptation', e: '🎧', modes: ['first', 'teen', 'custom'], gen: (r, s) => ({ c: nice(s.income * (0.3 + r() * 0.3)) }),
      t: p => '"No-cost EMI!" Premium headphones for ' + F(p.c) + ' in 6 easy payments (processing fee applies).', c: p => [['Buy on EMI', { emi: { total: p.c * 1.06, months: 6, apr: 0, name: 'Headphones EMI' }, happy: 4, impulse: p.c, note: 'The "processing fee" added ' + F(p.c * 0.06) + '. "No-cost" EMIs often have hidden costs.' }], ['Pay in full', { cash: -p.c, happy: 4, impulse: p.c }], ['My old ones work fine', {}]] },
    borrow: { kind: 'social', e: '🤝', modes: ['first', 'teen', 'custom'], gen: (r, s) => ({ c: nice(s.income * 0.1) }),
      t: p => 'A friend asks to borrow ' + F(p.c) + ' until next month.', c: p => [['Lend it', { cash: -p.c, chance: { p: 0.5, eff: { cash: p.c }, yes: 'They paid you back! 🙌', no: 'They "forgot" to pay you back 😬 Only lend what you can afford to lose.' } }], ['Politely say no', { happy: -2 }]] },
    wedding: { kind: 'social', e: '💐', modes: ['first', 'custom'], gen: (r, s) => ({ c: nice(s.income * (0.15 + r() * 0.15)) }),
      t: p => 'A cousin\'s wedding: outfit + gift ≈ ' + F(p.c) + '.', c: p => [['Go all out', { cash: -p.c * 1.4, happy: 8, impulse: p.c * 0.4 }], ['Keep it simple', { cash: -p.c * 0.6, happy: 5 }]] },
    hypeCoin: { kind: 'market', e: '🪙', modes: ['first', 'teen', 'custom'], gen: (r, s) => ({ c: nice(s.income * 0.3) }),
      t: p => 'A meme coin your friends love is up 300% this month. Everyone is buying.', c: p => [['Buy ' + F(p.c) + ' worth', { cash: -p.c, toHype: p.c, impulse: p.c }], ['Pass', {}]] },
    scamInvest: { kind: 'market', e: '💸', modes: ['first', 'teen', 'custom'], gen: (r, s) => ({ c: nice(s.income * 0.4) }),
      t: p => 'A DM promises "guaranteed 20% a month" if you invest ' + F(p.c) + ' today.', c: p => [['Invest', { cash: -p.c, impulse: p.c, note: 'It was a Ponzi scheme. The money is gone. Guaranteed high returns do not exist.' }], ['Report & block', { happy: 2, note: 'Smart. That was a scam.' }]] },
    crash: { kind: 'market', e: '📉', modes: ['first', 'teen', 'custom'], gen: (r) => ({ d: 15 + Math.floor(r() * 10) }),
      t: p => 'Markets crashed ' + p.d + '%! Headlines are screaming. Your investments just dropped.',
      c: p => [['Sell everything before it gets worse', { crash: 'sell' }], ['Hold steady', { crash: 'hold' }], ['Buy more while prices are low', { crash: 'buy' }]] },
    burnout: { kind: 'shock', e: '😫', modes: [], followOnly: true, gen: () => ({}), t: () => 'You are burned out from too little fun. You need a break.', c: (p, s) => [['Take a weekend off (spend a little)', { cash: -s.scn.income * 0.08, happy: 20 }], ['Push through', { happy: 5, note: 'Pushing through works for a while. A budget with zero fun rarely lasts.' }]] }
  };

  // =====================================================================
  //  SCENARIO GENERATION
  // =====================================================================
  function gauss(r) { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

  function makeScenario(opts) {
    const seed = opts.seed || Math.floor(Math.random() * 1e9);
    const r = ST.rng('life:' + seed);
    const c = MQ.COUNTRIES[opts.country] || MQ.country();
    const mode = opts.mode || 'first';
    const base = mode === 'teen' ? c.teen : c.first;
    let scn;
    if (mode === 'custom') {
      const cu = opts.custom;
      scn = { name: cu.name || 'You', age: cu.age, job: 'your job', income: cu.income, exp: { rent: cu.rent, food: cu.food, transport: cu.other, phone: 0 }, savings: cu.savings, goal: { e: '🎯', name: cu.goalName || 'goal', cost: cu.goalCost } };
    } else {
      const goal = MQ.pick(r, c.goals[mode === 'teen' ? 'teen' : 'first']);
      scn = {
        name: MQ.pick(r, c.names), age: Math.floor(base.age[0] + r() * (base.age[1] - base.age[0] + 1)), job: MQ.pick(r, base.job),
        income: MQ.pickRange(r, base.income),
        exp: { rent: MQ.pickRange(r, base.rent), food: MQ.pickRange(r, base.food), transport: MQ.pickRange(r, base.transport), phone: MQ.pickRange(r, base.phone) },
        savings: MQ.pickRange(r, base.savings), goal: { e: goal.e, name: goal.name, cost: MQ.pickRange(r, goal.cost) }
      };
    }
    const tx = (c.tax || MQ.COUNTRIES.US.tax)[mode === 'teen' ? 'teen' : 'first'];
    Object.assign(scn, {
      taxRate: tx.rate, taxLabel: tx.label,
      v: 1, seed, country: c.id, mode, months: opts.months || 12, inflation: c.inflation, savingsAPY: c.savingsAPY, cardAPR: c.cardAPR, loanAPR: c.loanAPR + 2,
      indexName: c.indexName
    });
    // Personalised event mix: temptations for impulsive players, market drama for risk-lovers, shocks for planners.
    const p = opts.personality;
    const w = { shock: 1.3, opportunity: 1, temptation: 1, social: 0.7, market: 0.6 };
    if (p) {
      if (p.impulseLevel === 'high') w.temptation = 2.2; else if (p.impulseLevel === 'moderate') w.temptation = 1.5;
      if (p.riskLevel === 'high') w.market = 1.6;
      if (p.impulseLevel === 'low') w.shock = 1.8;
    }
    const pool = Object.keys(EV).filter(k => !EV[k].followOnly && k !== 'crash' && EV[k].modes.includes(mode) && !(EV[k].needsRent && !scn.exp.rent));
    const used = new Set(), events = [];
    for (let m = 1; m <= scn.months; m++) {
      if (r() > (m === 1 ? 0.55 : 0.8)) continue;
      const cand = pool.filter(k => !used.has(k));
      if (!cand.length) break;
      const tot = cand.reduce((t, k) => t + w[EV[k].kind], 0);
      let x = r() * tot, pick = cand[0];
      for (const k of cand) { x -= w[EV[k].kind]; if (x <= 0) { pick = k; break; } }
      used.add(pick);
      events.push({ m, id: pick, p: EV[pick].gen(r, scn) });
    }
    // Maybe a market crash in the middle of the year
    let crashM = null;
    if (r() < (p && p.riskLevel === 'high' ? 0.75 : 0.5)) {
      crashM = 4 + Math.floor(r() * Math.max(1, scn.months - 6));
      const i = events.findIndex(e => e.m === crashM);
      const ev = { m: crashM, id: 'crash', p: EV.crash.gen(r) };
      if (i >= 0) events[i] = ev; else events.push(ev);
      events.sort((a, b) => a.m - b.m);
    }
    // Monthly market paths (the crash itself is applied by the event; afterwards markets slowly recover)
    const mk = { index: [], gold: [], hype: [] };
    for (let m = 1; m <= scn.months; m++) {
      const g = gauss(r), rec = crashM && m > crashM && m <= crashM + 4 ? 1 : 0;
      mk.index.push(0.006 + 0.032 * g + rec * 0.025);
      mk.gold.push(0.004 + 0.025 * gauss(r) - 0.15 * 0.032 * g);
      mk.hype.push(m <= 3 ? 0.08 + 0.1 * gauss(r) : -0.04 + 0.16 * gauss(r) + rec * 0.03);
    }
    scn.events = events; scn.market = mk;
    return scn;
  }

  // =====================================================================
  //  ENGINE
  // =====================================================================
  function essentials(st) { return st.exp.rent + st.exp.food + st.exp.transport + st.exp.phone; }
  function debtTotal(st) { return st.card + st.loans.reduce((t, l) => t + l.bal, 0); }
  function invTotal(st) { return st.inv.index + st.inv.gold + st.inv.hype; }
  function netWorth(st) { return st.checking + st.ef + st.goalFund + invTotal(st) - debtTotal(st); }

  function initState(scn, mods) {
    mods = mods || {};
    const st = {
      m: 1, checking: 0, ef: scn.savings, goalFund: 0, inv: { index: 0, gold: 0, hype: 0 }, card: 0, loans: [],
      income: scn.income, exp: Object.assign({}, scn.exp), subs: 0, autoSave: 0, pension: 0, happy: 65,
      savAPY: scn.savingsAPY, inflation: mods.inflation || scn.inflation,
      owned: false, ownedHow: null, ownedMonth: null, pendingCash: false,
      t: { income: 0, fun: 0, saved: 0, invested: 0, intEarned: 0, intPaid: 0, fees: 0, impulse: 0, disc: 0, matched: 0, efUsed: 0, carded: 0, invGain: 0 },
      hist: [], follow: null, crashAct: null, sawCrash: false, loanPaidOff: false, notes: [], ledger: []
    };
    st.startNW = netWorth(st);
    st.hist.push({ m: 0, nw: st.startNW, happy: st.happy });
    return st;
  }

  // Pay an expense: checking first, then emergency fund, then goal fund, then credit card.
  function pay(st, amt, notes) {
    let need = amt;
    const take = (key) => { const x = Math.min(need, Math.max(0, st[key])); st[key] -= x; need -= x; return x; };
    take('checking');
    if (need > 0.5) { const x = take('ef'); st.t.efUsed += x; if (x > 0.5 && notes) notes.push('🧯 Your emergency fund covered ' + F(x) + '.'); }
    if (need > 0.5) { const x = take('goalFund'); if (x > 0.5 && notes) notes.push('🎯 ' + F(x) + ' came out of your goal fund.'); }
    if (need > 0.5) { st.card += need; st.t.carded += need; if (notes) notes.push('💳 ' + F(need) + ' went on your credit card at ' + st.scnCardAPR + '% APR.'); need = 0; }
  }

  function payday(st, scn) {
    st.scnCardAPR = scn.cardAPR;
    st.notes = [];
    if (st.m > 1) { const f = 1 + st.inflation / 1200; st.exp.food *= f; st.exp.transport *= f; }
    const pensionC = st.pension * st.income;
    st.checking += st.income - pensionC;
    st.t.income += st.income;
    if (pensionC) { st.inv.index += pensionC * 2; st.t.matched += pensionC; st.t.saved += pensionC; st.t.invested += pensionC * 2; }
    const gross = scn.taxRate ? st.income / (1 - scn.taxRate) : 0;
    const led = scn.taxRate ? [['Gross pay', gross], ['✂️ ' + scn.taxLabel, -(gross - st.income)]] : [['Pay (take-home)', st.income]];
    if (pensionC) led.push(['Retirement plan (matched ×2)', -pensionC]);
    const bills = [['🏠 Rent', st.exp.rent], ['🍲 Food', st.exp.food], ['🚌 Transport', st.exp.transport], ['📱 Phone', st.exp.phone], ['🔁 Subscriptions & habits', st.subs]];
    bills.forEach(b => { if (b[1] > 0.5) { pay(st, b[1], st.notes); led.push([b[0], -b[1]]); } });
    st.loans.slice().forEach(l => {
      const interest = l.bal * l.apr / 1200, pmt = Math.min(l.emi, l.bal + interest), principal = pmt - interest;
      pay(st, pmt, st.notes);
      l.bal = Math.max(0, l.bal - principal); l.left--; st.t.intPaid += interest;
      led.push(['🧾 ' + l.name, -pmt]);
      if (l.bal < 1 || l.left <= 0) { st.loans.splice(st.loans.indexOf(l), 1); if (l.big) { st.loanPaidOff = true; st.notes.push('🔓 ' + l.name + ' fully paid off!'); } }
    });
    if (st.card > 0.5) { const min = Math.min(st.card, Math.max(st.card * 0.05, st.income * 0.01)); st.checking -= min; st.card -= min; if (st.checking < 0) { const d = -st.checking; st.checking = 0; pay(st, d, st.notes); } led.push(['💳 Card minimum payment', -min]); }
    if (st.autoSave > 0) { const x = Math.min(st.autoSave, Math.max(0, st.checking)); st.checking -= x; st.ef += x; st.t.saved += x; led.push(['🤖 Auto-save to emergency fund', -x]); }
    st.ledger = led;
  }

  function loanFor(cost, apr, months) { const i = apr / 1200; return i ? cost * i / (1 - Math.pow(1 + i, -months)) : cost / months; }

  function canBuyCash(st, scn) { return st.goalFund + Math.max(0, st.checking) + st.ef >= scn.goal.cost; }
  function buy(st, scn, method) {
    const cost = scn.goal.cost, notes = st.notes;
    if (method === 'cash') {
      const fromGoal = Math.min(st.goalFund, cost); st.goalFund -= fromGoal;
      let need = cost - fromGoal;
      const fromChk = Math.min(Math.max(0, st.checking), need); st.checking -= fromChk; need -= fromChk;
      if (need > 0) { st.ef -= need; st.t.efUsed += need; notes.push('🧯 ' + F(need) + ' came out of your emergency fund to complete the purchase.'); }
    } else if (method === 'loan') {
      const fee = cost * 0.02;
      pay(st, fee, notes); st.t.fees += fee;
      st.loans.push({ name: scn.goal.name + ' loan', bal: cost, apr: scn.loanAPR, emi: loanFor(cost, scn.loanAPR, 12), left: 12, big: true });
      notes.push('🧾 Loan taken: ' + F(loanFor(cost, scn.loanAPR, 12)) + '/month for 12 months at ' + scn.loanAPR + '% APR, plus a ' + F(fee) + ' processing fee.');
    } else if (method === 'bnpl') {
      st.loans.push({ name: scn.goal.name + ' (BNPL)', bal: cost, apr: 0, emi: cost / 3, left: 3, big: true });
      notes.push('🛍️ Buy Now Pay Later: 3 payments of ' + F(cost / 3) + '. Miss one and it lands on your card.');
    } else if (method === 'card') {
      st.card += cost; st.t.carded += cost;
      notes.push('💳 ' + F(cost) + ' on the credit card at ' + scn.cardAPR + '% APR.');
    }
    st.owned = true; st.ownedHow = method; st.ownedMonth = st.m; st.happy = Math.min(100, st.happy + 10);
  }

  const MIXES = {
    index: { name: 'All index fund', w: { index: 1, gold: 0, hype: 0 } },
    balanced: { name: 'Balanced (70/20/10)', w: { index: 0.7, gold: 0.2, hype: 0.1 } },
    safe: { name: 'Cautious (50% gold)', w: { index: 0.5, gold: 0.5, hype: 0 } },
    hype: { name: 'All-in hype stock', w: { index: 0, gold: 0, hype: 1 } }
  };

  function allocate(st, scn, a, mix, mods) {
    mods = mods || {};
    const avail = Math.max(0, st.checking);
    let amt = { fun: a.fun * avail, ef: a.ef * avail, goal: a.goal * avail, inv: a.inv * avail, debt: a.debt * avail };
    if (mods.wantsCut) { const cut = amt.fun * 0.2; amt.fun -= cut; amt.ef += cut; }
    if (mods.efFirst && st.m <= 4) { const cut = amt.fun * 0.5 + amt.inv * 0.5; amt.fun *= 0.5; amt.inv *= 0.5; amt.ef += cut; }
    if (mods.debtFirst && st.card > 0) { const x = amt.fun * 0.3 + Math.max(0, avail - (amt.fun + amt.ef + amt.goal + amt.inv + amt.debt)); amt.fun -= amt.fun * 0.3; amt.debt += x; }
    if (mods.investMore) {
      let extra = scn.income * 0.1;
      const left = Math.max(0, avail - (amt.fun + amt.ef + amt.goal + amt.inv + amt.debt));
      const fromLeft = Math.min(left, extra); extra -= fromLeft;
      const fromFun = Math.min(amt.fun, extra); amt.fun -= fromFun; extra -= fromFun;
      const fromGoal = Math.min(amt.goal, extra); amt.goal -= fromGoal;
      amt.inv += fromLeft + fromFun + fromGoal;
    }
    if (mods.noBorrow && st.pendingCash) { /* goal money keeps flowing */ }
    amt.debt = Math.min(amt.debt, st.card);
    const sum = amt.fun + amt.ef + amt.goal + amt.inv + amt.debt;
    if (sum > avail && sum > 0) Object.keys(amt).forEach(k => amt[k] *= avail / sum);
    st.checking -= amt.fun + amt.ef + amt.goal + amt.inv + amt.debt;
    st.ef += amt.ef; st.goalFund += amt.goal; st.card -= amt.debt;
    const w = (MIXES[mix] || MIXES.index).w;
    st.inv.index += amt.inv * w.index; st.inv.gold += amt.inv * w.gold; st.inv.hype += amt.inv * w.hype;
    st.t.fun += amt.fun; st.t.disc += avail; st.t.saved += amt.ef + amt.goal + amt.inv; st.t.invested += amt.inv;
    const base = Math.max(1, scn.income * 0.1);
    st.happy = Math.max(0, Math.min(100, st.happy + Math.max(-8, Math.min(8, 6 * amt.fun / base - 6))));
    st.lastAlloc = amt;
    return amt;
  }

  function eventFor(st, scn) {
    if (st.follow) return st.follow;
    return scn.events.find(e => e.m === st.m) || null;
  }

  function applyEffect(st, scn, eff, ev, notes) {
    if (eff.cash) { if (eff.cash < 0) pay(st, -eff.cash, notes); else st.checking += eff.cash; }
    if (eff.debt) { st.card += eff.debt; st.t.carded += eff.debt; notes.push('💳 ' + F(eff.debt) + ' added to your credit card at ' + scn.cardAPR + '% APR.'); }
    if (eff.impulse) st.t.impulse += eff.impulse;
    if (eff.happy) st.happy = Math.max(0, Math.min(100, st.happy + eff.happy));
    if (eff.income) st.income += eff.income;
    if (eff.sub) st.subs += eff.sub;
    if (eff.autoSave) st.autoSave += eff.autoSave;
    if (eff.pension) st.pension = eff.pension;
    if (eff.savBoost) st.savAPY += eff.savBoost;
    if (eff.toEF) { st.ef += eff.toEF; st.t.saved += eff.toEF; }
    if (eff.toInv) { st.inv.index += eff.toInv; st.t.saved += eff.toInv; st.t.invested += eff.toInv; }
    if (eff.toGoal) { st.goalFund += eff.toGoal; st.t.saved += eff.toGoal; }
    if (eff.toHype) { st.inv.hype += eff.toHype; st.t.invested += eff.toHype; }
    if (eff.rentMul) st.exp.rent *= eff.rentMul;
    if (eff.rentMoveCost) pay(st, st.exp.rent * eff.rentMoveCost, notes);
    if (eff.emi) { const e = eff.emi; st.loans.push({ name: e.name, bal: e.total, apr: e.apr, emi: loanFor(e.total, e.apr, e.months), left: e.months }); notes.push('🧾 New EMI: ' + F(loanFor(e.total, e.apr, e.months)) + '/month for ' + e.months + ' months.'); }
    if (eff.follow) st.followNext = eff.follow;
    if (eff.crash) {
      const d = ev.p.d / 100;
      const before = invTotal(st);
      st.inv.index *= 1 - d; st.inv.hype *= 1 - d * 1.8; st.inv.gold *= 1 + d * 0.15;
      st.sawCrash = true; st.crashAct = eff.crash;
      notes.push('📉 Your investments went from ' + F(before) + ' to ' + F(invTotal(st)) + ' (gold usually holds up in a crash).');
      if (eff.crash === 'sell') { const v = invTotal(st); st.checking += v; st.inv = { index: 0, gold: 0, hype: 0 }; notes.push('You sold everything at the bottom and locked in the loss. Markets often recover after crashes, but your money is no longer invested.'); }
      if (eff.crash === 'buy') { const x = Math.min(st.ef * 0.3, st.ef); st.ef -= x; st.inv.index += x; st.t.invested += x; notes.push('You moved ' + F(x) + ' from your emergency fund into the index fund while prices were low. Bold, but it shrinks your safety net.'); }
      if (eff.crash === 'hold') notes.push('You held steady. Paper losses only become real losses if you sell.');
    }
    if (eff.note) notes.push(eff.note);
  }

  function resolveEvent(st, scn, ev, choice) {
    const tpl = EV[ev.id];
    const ch = tpl.c(ev.p, { scn, st })[Math.max(0, Math.min(choice, tpl.c(ev.p, { scn, st }).length - 1))];
    const notes = st.notes;
    applyEffect(st, scn, ch[1], ev, notes);
    if (ch[1].chance) {
      const r = ST.rng('chance:' + scn.seed + ':' + st.m + ':' + ev.id);
      const c = ch[1].chance;
      if (r() < c.p) { applyEffect(st, scn, c.eff, ev, notes); notes.push(c.yes); }
      else { if (c.noEff) applyEffect(st, scn, c.noEff, ev, notes); notes.push(c.no); }
    }
    st.lastEvent = { e: tpl.e, t: tpl.t(ev.p, { scn, st }), choice: ch[0] };
    st.follow = null;
  }

  function endMonth(st, scn, mods) {
    mods = mods || {};
    const mi = st.m - 1;
    if (mods.crash25 && st.m === Math.min(6, scn.months) && !st.sawCrash) {
      st.inv.index *= 0.75; st.inv.hype *= 0.55; st.inv.gold *= 1.04; st.sawCrash = true;
    }
    const e = (st.ef + st.goalFund) * st.savAPY / 1200;
    st.ef += st.ef * st.savAPY / 1200; st.goalFund += st.goalFund * st.savAPY / 1200; st.t.intEarned += e;
    const before = invTotal(st);
    let idxR = scn.market.index[mi], hypeR = scn.market.hype[mi];
    if (mods.crash25 && st.m > 6 && st.m <= 10) idxR += 0.02;
    st.inv.index *= 1 + idxR; st.inv.gold *= 1 + scn.market.gold[mi]; st.inv.hype *= 1 + hypeR;
    st.t.invGain += invTotal(st) - before;
    const ci = st.card * scn.cardAPR / 1200; st.card += ci; st.t.intPaid += ci;
    // "No borrowing" what-if: buy with cash once affordable
    if (st.pendingCash && !st.owned && st.goalFund + Math.max(0, st.checking) >= scn.goal.cost) { buy(st, scn, 'cash'); st.pendingCash = false; }
    if (st.happy < 15 && !st.followNext) st.followNext = { id: 'burnout', p: {} };
    st.follow = st.followNext || null; st.followNext = null;
    st.hist.push({ m: st.m, nw: netWorth(st), happy: st.happy, debt: debtTotal(st), inv: invTotal(st), cash: st.checking + st.ef + st.goalFund });
    st.m++;
  }

  // Replay a full run with the same scenario and decisions, optionally with "what if" changes.
  function replay(scn, dec, mods) {
    const s2 = Object.assign({}, scn);
    const st = initState(s2, mods);
    for (let m = 1; m <= scn.months; m++) {
      const d = dec.months[m - 1] || dec.months[dec.months.length - 1] || { alloc: { fun: 0.3, ef: 0.3, goal: 0.3, inv: 0.1, debt: 0 }, mix: 'index' };
      payday(st, s2);
      if (d.buy && !st.owned) {
        if (mods && mods.noBorrow && d.buy !== 'cash') st.pendingCash = true;
        else if (d.buy !== 'cash' || canBuyCash(st, s2)) buy(st, s2, d.buy);
      }
      allocate(st, s2, d.alloc, d.mix, mods);
      const ev = eventFor(st, s2);
      if (ev) {
        let choice = dec.choices[ev.id] !== undefined ? dec.choices[ev.id] : 0;
        if (mods && mods.holdCrash && ev.id === 'crash') choice = 1;
        resolveEvent(st, s2, ev, choice);
      }
      endMonth(st, s2, mods);
    }
    return st;
  }

  // =====================================================================
  //  ANALYTICS
  // =====================================================================
  const CONCEPTS = {
    saving: { name: 'Pay yourself first', lesson: 'saving-1' },
    resilience: { name: 'Emergency funds', lesson: 'saving-1' },
    debtLoan: { name: 'APR vs interest rate and the total cost of borrowing', lesson: 'credit-1' },
    debtCard: { name: 'The minimum payment trap', lesson: 'credit-2' },
    investing: { name: 'Diversification', lesson: 'investing-3' },
    investStart: { name: 'Compound interest', lesson: 'saving-3' },
    spending: { name: 'Needs vs wants and the 24-hour rule', lesson: 'basics-1' },
    goal: { name: 'SMART goals', lesson: 'saving-1' },
    wellbeing: { name: 'Budgeting for fun (50/30/20)', lesson: 'basics-2' }
  };
  function metrics(st, scn) {
    const nw = netWorth(st), inv = invTotal(st);
    const monthlyDebt = st.loans.reduce((t, l) => t + l.emi, 0) + (st.card > 0 ? Math.max(st.card * 0.05, st.income * 0.01) : 0);
    const savingsRate = st.t.income ? st.t.saved / st.t.income : 0;
    const efMonths = st.ef / Math.max(1, essentials(st));
    const dti = monthlyDebt / Math.max(1, st.income);
    let div;
    const total = Math.max(1, st.checking + st.ef + st.goalFund + inv);
    if (inv < total * 0.03) div = 12;
    else {
      const w = [st.inv.index / inv, st.inv.gold / inv, st.inv.hype / inv];
      const hhi = w.reduce((t, x) => t + x * x, 0);
      const spread = (1 - hhi) / (2 / 3);
      div = 100 * (0.3 * Math.min(1, inv / total / 0.35) + 0.3 * spread + 0.4 * w[0] - 0.5 * Math.max(0, w[2] - 0.2));
      div = Math.max(5, Math.min(100, div));
    }
    const impulseShare = st.t.impulse / Math.max(1, st.t.disc + st.t.impulse);
    const impulse = impulseShare < 0.1 ? 'Low' : impulseShare < 0.25 ? 'Moderate' : 'High';
    const goalPct = st.owned ? 1 : Math.min(1, st.goalFund / scn.goal.cost);
    const sub = {
      saving: Math.min(100, savingsRate / 0.25 * 100),
      resilience: Math.min(100, efMonths / 3 * 100),
      debt: Math.max(0, 100 - Math.min(70, dti / 0.36 * 70) - Math.min(30, st.t.intPaid / Math.max(1, scn.income) * 60)),
      investing: Math.min(100, div * 0.6 + Math.min(40, inv / Math.max(1, nw > 0 ? nw : total) / 0.2 * 40)),
      spending: Math.max(0, 100 - impulseShare * 250),
      goal: goalPct * 100,
      wellbeing: st.happy
    };
    const W = { saving: 0.2, resilience: 0.18, debt: 0.2, investing: 0.14, spending: 0.1, goal: 0.12, wellbeing: 0.06 };
    const score = Object.keys(W).reduce((t, k) => t + sub[k] * W[k], 0);
    const keys = Object.keys(sub);
    const strong = keys.reduce((a, b) => sub[b] > sub[a] ? b : a);
    const weak = keys.reduce((a, b) => sub[b] < sub[a] ? b : a);
    let concept = CONCEPTS[weak] || CONCEPTS.saving;
    if (weak === 'debt') concept = st.t.carded > st.t.fees * 5 || st.card > 0 ? CONCEPTS.debtCard : CONCEPTS.debtLoan;
    if (weak === 'investing' && inv < total * 0.03) concept = CONCEPTS.investStart;
    const growth = (nw - st.startNW) / Math.max(1, st.t.income) * 100;
    return { nw, startNW: st.startNW, savingsRate, efMonths, dti, div: Math.round(div), impulse, impulseShare, sub, score: Math.round(score), strong, weak, concept, growth, owned: st.owned, ownedHow: st.ownedHow, intPaid: st.t.intPaid, intEarned: st.t.intEarned, invGain: st.t.invGain, matched: st.t.matched, happy: Math.round(st.happy), inv, debt: debtTotal(st), sold: st.crashAct === 'sell' };
  }
  const SUBNAMES = { saving: 'Saving', resilience: 'Financial resilience', debt: 'Debt management', investing: 'Investing', spending: 'Spending control', goal: 'Reaching your goal', wellbeing: 'Wellbeing' };
  function grade(score) { return score >= 85 ? 'A+' : score >= 75 ? 'A' : score >= 62 ? 'B' : score >= 50 ? 'C' : score >= 38 ? 'D' : 'E'; }

  // Explain why two runs differ (used by What-If and multiplayer).
  function explainDiff(a, b, la, lb) {
    const out = [];
    const d = b.nw - a.nw;
    out.push((d >= 0 ? lb + ' ended ' + F(d) + ' richer' : lb + ' ended ' + F(-d) + ' poorer') + ' than ' + la + '.');
    if (Math.abs(b.intPaid - a.intPaid) > 1) out.push(b.intPaid < a.intPaid ? lb + ' paid ' + F(a.intPaid - b.intPaid) + ' less in interest.' : lb + ' paid ' + F(b.intPaid - a.intPaid) + ' more in interest.');
    if (Math.abs(b.invGain - a.invGain) > 1) out.push('Investment gains: ' + la + ' ' + F(a.invGain) + ' vs ' + lb + ' ' + F(b.invGain) + '.');
    if (Math.abs(b.savingsRate - a.savingsRate) > 0.02) out.push('Savings rate: ' + Math.round(a.savingsRate * 100) + '% vs ' + Math.round(b.savingsRate * 100) + '%.');
    if (Math.abs(b.efMonths - a.efMonths) > 0.3) out.push('Emergency fund: ' + a.efMonths.toFixed(1) + ' vs ' + b.efMonths.toFixed(1) + ' months of expenses.');
    if (a.ownedHow !== b.ownedHow) out.push('The goal: ' + la + ' ' + howText(a) + ', ' + lb + ' ' + howText(b) + '.');
    if (a.sold !== b.sold) out.push((a.sold ? la : lb) + ' panic-sold during the crash and missed the recovery.');
    if (Math.abs(a.matched - b.matched) > 1) out.push((a.matched > b.matched ? la : lb) + ' got ' + F(Math.abs(a.matched - b.matched)) + ' more in free employer matching.');
    if (Math.abs(a.happy - b.happy) > 8) out.push('Happiness: ' + a.happy + ' vs ' + b.happy + '. Money is not everything!');
    return out.map(x => x.charAt(0).toUpperCase() + x.slice(1));
  }
  function howText(m) { return !m.owned ? 'did not buy it' : m.ownedHow === 'cash' ? 'paid cash' : m.ownedHow === 'loan' ? 'took a loan' : m.ownedHow === 'bnpl' ? 'used Buy Now Pay Later' : 'used a credit card'; }

  // Personalised What-If questions based on what the player actually did.
  function whatIfs(L) {
    const m = metrics(L.st, L.scn), list = [];
    if (L.st.ownedHow && L.st.ownedHow !== 'cash') list.push({ id: 'noBorrow', label: 'What if you saved up for the ' + L.scn.goal.name + ' instead of borrowing?', mods: { noBorrow: true } });
    if (m.sold) list.push({ id: 'holdCrash', label: 'What if you had held through the crash?', mods: { holdCrash: true } });
    if (L.st.t.invested < L.st.t.income * 0.08) list.push({ id: 'investMore', label: 'What if you invested 10% more of your income?', mods: { investMore: true } });
    if (L.st.t.fun > L.st.t.disc * 0.3) list.push({ id: 'wantsCut', label: 'What if you spent 20% less on wants?', mods: { wantsCut: true } });
    if (m.efMonths < 1.5) list.push({ id: 'efFirst', label: 'What if you built your emergency fund first?', mods: { efFirst: true } });
    if (m.intPaid > 1) list.push({ id: 'debtFirst', label: 'What if you attacked your debt first?', mods: { debtFirst: true } });
    if (list.length < 3 && !list.some(x => x.id === 'investMore')) list.push({ id: 'investMore', label: 'What if you invested 10% more of your income?', mods: { investMore: true } });
    list.push({ id: 'inflation', label: 'What if inflation was ' + (L.scn.inflation < 6 ? 6 : 10) + '% instead of ' + L.scn.inflation + '%?', mods: { inflation: L.scn.inflation < 6 ? 6 : 10 } });
    list.push({ id: 'crash25', label: 'What if the market crashed 25%?', mods: { crash25: true } });
    return list.slice(0, 6);
  }

  // =====================================================================
  //  CHALLENGE CODES (multiplayer without a server)
  // =====================================================================
  function summary(m) { return { nw: Math.round(m.nw), sc: m.score, sr: +m.savingsRate.toFixed(3), ef: +m.efMonths.toFixed(2), dti: +m.dti.toFixed(3), ip: Math.round(m.intPaid), ig: Math.round(m.invGain), ow: m.owned ? 1 : 0, how: m.ownedHow || '', sold: m.sold ? 1 : 0, hp: m.happy, mt: Math.round(m.matched), dv: m.div }; }
  function unsummary(r) { return { nw: r.nw, score: r.sc, savingsRate: r.sr, efMonths: r.ef, dti: r.dti, intPaid: r.ip, invGain: r.ig, owned: !!r.ow, ownedHow: r.how || null, sold: !!r.sold, happy: r.hp, matched: r.mt || 0, div: r.dv }; }
  function challengeCode(L, m) {
    const S = ST.get();
    return 'MQC1-' + ST.b64encode(JSON.stringify({ scn: L.scn, by: S.profile.name, r: summary(m) }));
  }
  function resultCode(L, m) {
    const S = ST.get();
    return 'MQR1-' + ST.b64encode(JSON.stringify({ seed: L.scn.seed, by: S.profile.name, r: summary(m) }));
  }
  function parseCode(code) {
    code = (code || '').trim();
    const m = code.match(/^(MQC1|MQR1)-(.+)$/);
    if (!m) throw new Error('That is not a MoneyQuest challenge or result code.');
    let d;
    try { d = JSON.parse(ST.b64decode(m[2])); } catch (e) { throw new Error('That code is damaged. Ask your friend to copy it again.'); }
    if (m[1] === 'MQC1' && (!d.scn || !d.scn.events || !d.scn.market)) throw new Error('That challenge code is missing its scenario.');
    return { kind: m[1], data: d };
  }

  // =====================================================================
  //  UI
  // =====================================================================
  function S() { return ST.get(); }
  function L() { return S().lifeSim; }
  function save() { ST.save(); }

  function screen(main, args) {
    const sub = args[1];
    if (sub === 'new') return chooseMode(main);
    const cur = L();
    if (!cur || cur.phase === 'done' && sub !== 'result') return hub(main);
    if (cur.phase === 'intro') return intro(main);
    if (cur.phase === 'month') return monthScreen(main);
    if (cur.phase === 'event') return eventScreen(main);
    if (cur.phase === 'summary') return summaryScreen(main);
    return results(main);
  }

  function head(main, title, right) {
    return '<div class="sim-head"><a href="#/sim" class="x">‹</a><h1>' + title + '</h1>' + (right || '') + '</div>';
  }

  function hub(main) {
    const cur = L();
    const past = cur && cur.phase === 'done' ? metrics(cur.st, cur.scn) : null;
    main.innerHTML = head(main, 'Life Simulator') +
      '<p class="sub">Live a fictional financial life. Every character, price and surprise is generated for you, and your choices decide what happens next.</p>' +
      (past ? '<a class="card game-card" href="#/sim/life/result" style="--c:#f59e0b"><span class="emoji-tile">📊</span><div><h3>Last run: ' + esc(cur.scn.name) + ' · Grade ' + grade(past.score) + '</h3><p class="muted">Open your analytics and What-If replays.</p></div></a>' : '') +
      modeCards() +
      '<h2 class="section">⚔️ Multiplayer challenge</h2><div class="card"><p class="muted">Paste a friend\'s challenge code to play their exact scenario: same character, same events, same market. Or paste a result code to compare.</p><div class="code-row"><input class="input mono" id="ccode" placeholder="MQC1-… or MQR1-…"><button class="btn primary" id="cgo">Go</button></div></div>' +
      challengeHistory();
    bindModes(main);
    $('#cgo').onclick = () => {
      try {
        const p = parseCode($('#ccode').value);
        if (p.kind === 'MQC1') { startRun(p.data.scn, { by: p.data.by, r: p.data.r }); }
        else compareResult(main, p.data);
      } catch (e) { toast(e.message, 'bad'); }
    };
  }
  function challengeHistory() {
    const list = S().challenges.slice(-5).reverse();
    if (!list.length) return '';
    return '<div class="card"><h3>Recent challenges</h3>' + list.map(c => '<div class="ledger"><div><span>' + (c.win ? '🏆' : c.win === false ? '😤' : '🤝') + ' vs ' + esc(c.opp) + ' · ' + esc(c.date) + '</span><b>' + fmtShort(c.me) + ' vs ' + fmtShort(c.them) + '</b></div></div>').join('') + '</div>';
  }
  function modeCards() {
    const c = MQ.country();
    return '<div class="mode-grid">' +
      '<button class="card mode" data-mode="first"><span class="emoji-tile" style="--c:#f59e0b">💼</span><div><h3>First Salary</h3><p class="muted small">Your first full-time job, rent, bills and a big goal. 12 months.</p></div></button>' +
      '<button class="card mode" data-mode="teen"><span class="emoji-tile" style="--c:#22c55e">🧑‍🎓</span><div><h3>Teen Part-Timer</h3><p class="muted small">Part-time job, living at home, saving for something big.</p></div></button>' +
      '<button class="card mode" data-mode="custom"><span class="emoji-tile" style="--c:#6366f1">✍️</span><div><h3>Custom life</h3><p class="muted small">Type in your own numbers: income, rent, savings, goal.</p></div></button></div>' +
      '<p class="hint">Scenarios use typical ' + esc(c.name) + ' numbers (' + c.flag + '). Change country in Profile → Settings.</p>';
  }
  function bindModes(main) {
    $$('.mode', main).forEach(b => b.onclick = () => {
      if (b.dataset.mode === 'custom') return customForm(main);
      startRun(makeScenario({ mode: b.dataset.mode, country: MQ.country().id, personality: S().personality }));
    });
  }
  function chooseMode(main) { main.innerHTML = head(main, 'New life') + modeCards(); bindModes(main); }

  function customForm(main) {
    const c = MQ.country(), b = c.first;
    const f = (id, label, val) => '<label class="set-row"><span>' + label + '</span><input class="input sm-input" type="number" min="0" id="' + id + '" value="' + val + '" inputmode="numeric"></label>';
    main.innerHTML = head(main, 'Custom life') + '<div class="card"><p class="muted">Example: "You\'re 19. You earn ' + F(MQ.roundNice(b.income[0] * 1.1)) + '/month. Rent ' + F(b.rent[0] * 1.5) + ', food ' + F(b.food[1]) + '. You want a ' + F(c.goals.first[0].cost[0]) + ' laptop and have ' + F(b.savings[1] / 2) + ' saved."</p>' +
      f('cu-age', 'Age', 19) + f('cu-inc', 'Take-home pay / month (' + MQ.ui.cur() + ')', MQ.roundNice(b.income[0] * 1.1)) + f('cu-rent', 'Rent / month', MQ.roundNice(b.rent[0] * 1.5)) + f('cu-food', 'Food / month', b.food[1]) +
      f('cu-other', 'Transport & other bills / month', b.transport[1] + b.phone[1]) + f('cu-sav', 'Savings right now', MQ.roundNice(b.savings[1] / 2)) +
      '<label class="set-row"><span>Goal</span><input class="input sm-input" id="cu-goal" value="laptop" maxlength="24"></label>' + f('cu-cost', 'Goal cost', c.goals.first[0].cost[0]) +
      '<label class="set-row"><span>Months to simulate</span><select id="cu-months"><option>6</option><option selected>12</option></select></label>' +
      '<button class="btn primary block lg" id="cu-go">Start this life ▶</button></div>';
    $('#cu-go').onclick = () => {
      const v = id => Math.max(0, +$('#' + id).value || 0);
      const custom = { age: v('cu-age') || 19, income: v('cu-inc'), rent: v('cu-rent'), food: v('cu-food'), other: v('cu-other'), savings: v('cu-sav'), goalName: $('#cu-goal').value.trim() || 'goal', goalCost: v('cu-cost') || 1, name: S().profile.name };
      if (!custom.income) { toast('Enter an income first', 'bad'); return; }
      if (custom.rent + custom.food + custom.other >= custom.income) toast('⚠️ Your costs are higher than your income. This will be a tough life!', 'bad');
      startRun(makeScenario({ mode: 'custom', custom, months: +$('#cu-months').value, country: MQ.country().id, personality: S().personality }));
    };
  }

  function startRun(scn, challenge) {
    const s = S();
    s.lifeSim = { scn, st: initState(scn), dec: { months: [], choices: {} }, phase: 'intro', challenge: challenge || null, mix: 'balanced' };
    save();
    if (location.hash === '#/sim/life') MQ.app.render(); else MQ.app.go('#/sim/life');
  }

  function intro(main) {
    const { scn, challenge } = L();
    const ess = scn.exp.rent + scn.exp.food + scn.exp.transport + scn.exp.phone;
    main.innerHTML = head(main, 'Meet your character') +
      (challenge ? '<div class="card challenge-banner">⚔️ Challenge from <b>' + esc(challenge.by) + '</b>: same life, same surprises. Can you beat their net worth of <b>' + F(challenge.r.nw) + '</b>?</div>' : '') +
      '<div class="card char pop"><div class="big-emoji">' + (scn.mode === 'teen' ? '🧑‍🎓' : '🧑‍💼') + '</div><h2>' + esc(scn.name) + ', ' + scn.age + '</h2><p class="muted">' + esc(scn.mode === 'custom' ? 'Your custom life' : 'Works as a ' + scn.job) + '</p>' +
      '<div class="ledger">' + (scn.taxRate ? '<div><span>💼 Gross salary</span><b>' + F(scn.income / (1 - scn.taxRate)) + '/mo</b></div><div><span>✂️ ' + esc(scn.taxLabel) + '</span><b class="down">−' + F(scn.income / (1 - scn.taxRate) - scn.income) + '</b></div>' : '') +
      '<div><span>💰 Take-home pay</span><b class="up">' + F(scn.income) + '/mo</b></div>' +
      (scn.exp.rent ? '<div><span>🏠 Rent</span><b>' + F(scn.exp.rent) + '</b></div>' : '<div><span>🏠 Rent</span><b>Lives with family</b></div>') +
      '<div><span>🍲 Food</span><b>' + F(scn.exp.food) + '</b></div><div><span>🚌 Transport & bills</span><b>' + F(scn.exp.transport + scn.exp.phone) + '</b></div>' +
      '<div class="total"><span>Left after essentials</span><b>' + F(scn.income - ess) + '/mo</b></div>' +
      '<div><span>🐷 Savings now</span><b>' + F(scn.savings) + '</b></div><div><span>' + scn.goal.e + ' Wants a ' + esc(scn.goal.name) + '</span><b>' + F(scn.goal.cost) + '</b></div></div></div>' +
      '<div class="card"><h3>How it works</h3><ul class="list"><li>Each payday, essentials are paid first. You split the rest between <b>wants</b>, an <b>emergency fund</b>, your <b>goal fund</b>, <b>investing</b> and <b>paying off debt</b>.</li>' +
      '<li>Buy your goal any month: <b>cash</b>, a <b>loan</b> (' + scn.loanAPR + '% APR), <b>Buy Now Pay Later</b>, or a <b>credit card</b> (' + scn.cardAPR + '% APR).</li>' +
      '<li>Surprises happen. If cash runs out, your emergency fund pays first, then your credit card.</li>' +
      '<li>After ' + scn.months + ' months you get your analytics and can replay "What if…?" versions of your life.</li></ul></div>' +
      '<button class="btn primary block lg" id="go">Start month 1 ▶</button>' +
      (challenge ? '' : '<button class="btn ghost block" id="reroll">🎲 Different character</button>');
    $('#go').onclick = () => { const l = L(); payday(l.st, l.scn); l.phase = 'month'; save(); MQ.app.render(); };
    if ($('#reroll')) $('#reroll').onclick = () => startRun(makeScenario({ mode: scn.mode === 'custom' ? 'first' : scn.mode, country: scn.country, personality: S().personality }));
  }

  function hud(l) {
    const st = l.st, nw = netWorth(st);
    return '<div class="card life-hud"><div class="lh-goal"><span>' + l.scn.goal.e + ' ' + esc(l.scn.goal.name) + (st.owned ? ' ✅' : '') + '</span><b>' + (st.owned ? 'Owned!' : F(st.goalFund) + ' / ' + F(l.scn.goal.cost)) + '</b></div>' +
      '<div class="bar"><i style="width:' + (st.owned ? 100 : Math.min(100, st.goalFund / l.scn.goal.cost * 100)) + '%"></i></div>' +
      '<div class="lh-stats"><div><span class="kicker">Checking</span><b>' + fmtShort(st.checking) + '</b></div><div><span class="kicker">Emergency</span><b>' + fmtShort(st.ef) + '</b></div>' +
      '<div><span class="kicker">Invested</span><b>' + fmtShort(invTotal(st)) + '</b></div><div><span class="kicker">Debt</span><b class="' + (debtTotal(st) > 0.5 ? 'down' : '') + '">' + fmtShort(debtTotal(st)) + '</b></div></div>' +
      '<div class="lh-foot"><span>Net worth <b class="' + (nw >= st.startNW ? 'up' : 'down') + '">' + F(nw) + '</b></span><span>' + mood(st.happy) + ' ' + Math.round(st.happy) + '</span></div></div>';
  }
  function mood(h) { return h >= 80 ? '😄' : h >= 60 ? '🙂' : h >= 40 ? '😐' : h >= 20 ? '😟' : '😫'; }

  // First Salary / Teen modes tell a story and unlock concepts step by step. Custom lives get everything at once.
  function unlocked(scn, m) {
    if (scn.mode === 'custom') return { buy: true, inv: true };
    return { buy: m >= 2, inv: m >= 3 };
  }
  function mentor(l) {
    const st = l.st, scn = l.scn, m = st.m;
    if (scn.mode === 'custom') return null;
    const ess = essentials(st), name = MQ.country().id === 'IN' ? 'Kiran' : MQ.country().id === 'UK' ? 'Ellie' : 'Sam';
    const foodNow = st.exp.food, food0 = scn.exp.food;
    const beats = {
      1: ['🎉 First payday!', 'Welcome to your first ' + (scn.mode === 'teen' ? 'pay packet' : 'real salary') + '. Needs come first, and they are already paid. Before treating yourself, start an <b>emergency fund</b>: future-you will thank you. Investing and big purchases unlock soon.', 'saving-1'],
      2: ['🔓 Big purchases unlocked', 'You can now buy your ' + esc(scn.goal.name) + ': cash, loan, Buy Now Pay Later or credit card. Compare the <b>total cost</b>, not the monthly payment. Or keep saving.', 'credit-1'],
      3: ['🔓 Investing unlocked', 'Money you will not need for years can go into an <b>index fund</b>, which owns hundreds of companies. It goes up and down, so keep emergency money separate.', 'investing-2'],
      4: ['🔁 Subscription check', 'Look at your bills. Small monthly costs (' + F(st.subs) + '/mo right now) quietly add up to ' + F(st.subs * 12) + ' a year.', 'basics-3'],
      5: ['🧯 Emergency fund target', 'A solid target is 3 months of essentials: ' + F(ess * 3) + '. You have ' + F(st.ef) + ' (' + (st.ef / ess).toFixed(1) + ' months).', 'saving-1'],
      6: ['📈 Halfway there', 'Your net worth went from ' + F(st.startNW) + ' to ' + F(netWorth(st)) + '. Is the line going up? If not, what is leaking?', 'basics-2'],
      7: ['💳 Credit card rule', 'Only use a card for what you can pay off in full. Card interest here is ' + scn.cardAPR + '% a year.' + (st.card > 1 ? ' You owe ' + F(st.card) + '. Attack it!' : ''), 'credit-2'],
      8: ['🧺 Diversify', 'Do not put everything in one hype stock. Mixing index funds, gold and cash softens crashes.', 'investing-3'],
      9: ['🎈 Inflation check', 'Your food bill went from ' + F(food0) + ' to ' + F(foodNow) + ' a month, with no change in what you eat. That is inflation at ' + st.inflation + '% a year.', 'investing-1'],
      10: ['🧾 Payslip lesson', scn.taxRate ? 'You earn ' + F(st.income / (1 - scn.taxRate)) + ' gross but take home ' + F(st.income) + '. Deductions like ' + esc(scn.taxLabel) + ' come out first. Always budget with take-home pay.' : 'Your pay is below the tax threshold, so take-home = gross. Once you earn more, tax and deductions come out first. Always budget with take-home pay.', 'earning-1'],
      11: ['🎯 SMART goals', 'Specific, measurable, time-bound goals beat "save more". How close are you to your ' + esc(scn.goal.name) + '?', 'saving-1'],
      12: ['🏁 Final month', 'Last payday of the year! After this you will see your analytics and can replay "What if…?" versions of your choices.', null]
    };
    const b = beats[m];
    return b ? '<div class="card mentor pop"><div class="mentor-head"><span class="avatar sm">🧑‍🏫</span><div><small>' + name + ', your money mentor</small><b>' + b[0] + '</b></div></div><p>' + b[1] + '</p>' + (b[2] ? '<a class="small" href="#/lesson/' + b[2] + '">📚 Quick lesson ›</a>' : '') + '</div>' : '';
  }

  function monthScreen(main) {
    const l = L(), st = l.st, scn = l.scn;
    const last = l.dec.months[l.dec.months.length - 1];
    const def = Object.assign({}, last ? last.alloc : { fun: 0.3, ef: st.ef < essentials(st) * 3 ? 0.25 : 0.1, goal: 0.3, inv: 0.1, debt: 0 });
    const avail = Math.max(0, Math.floor(st.checking));
    const un = unlocked(scn, st.m);
    if (!un.inv) def.inv = 0;
    main.innerHTML = head(main, 'Month ' + st.m + '/' + scn.months, '<span class="pill">' + (l.challenge ? '⚔️ ' : '') + esc(scn.name) + '</span>') + hud(l) +
      '<div class="card"><h3>💸 Payday</h3><div class="ledger">' + st.ledger.map(x => '<div><span>' + esc(x[0]) + '</span><b class="' + (x[1] >= 0 ? 'up' : 'down') + '">' + (x[1] >= 0 ? '+' : '−') + F(Math.abs(x[1])) + '</b></div>').join('') +
      '<div class="total"><span>Available to plan</span><b>' + F(avail) + '</b></div></div>' + (st.notes.length ? '<ul class="list small">' + st.notes.map(n => '<li>' + esc(n) + '</li>').join('') + '</ul>' : '') + '</div>' +
      (mentor(l) || '') +
      (st.owned ? '' : un.buy ? goalPanel(l) : '<div class="card locked-card">🔒 <b>Buying your ' + esc(scn.goal.name) + '</b> unlocks next month. For now, build your goal fund.</div>') +
      '<div class="card"><h3>Plan the month</h3>' +
      slider('fun', '🎉 Wants & fun', avail) + slider('ef', '🧯 Emergency fund', avail) + slider('goal', scn.goal.e + ' Goal fund', avail) + (un.inv ? slider('inv', '📈 Invest', avail) : '<p class="muted small">🔒 Investing unlocks in month 3.</p>') + (st.card > 0.5 ? slider('debt', '💳 Extra card payment', avail) : '') +
      (!un.inv ? '' : '<div class="mix"><span class="kicker">Invest in</span><div class="chips">' + Object.keys(MIXES).map(k => '<button class="chip ' + (l.mix === k ? 'on' : '') + '" data-mix="' + k + '">' + MIXES[k].name + '</button>').join('') + '</div></div>') +
      '<div class="ledger"><div class="total"><span>Left in checking (buffer)</span><b id="left"></b></div></div><p class="muted small" id="hint"></p>' +
      '<button class="btn primary block lg" id="lock">Lock in month ' + st.m + '</button></div>';
    const ids = ['fun', 'ef', 'goal', 'inv', 'debt'].filter(id => $('#' + id));
    const get = id => $('#' + id) ? +$('#' + id).value : 0;
    ids.forEach(id => { $('#' + id).value = Math.round((def[id] || 0) * avail); });
    function sync(changed) {
      let over = ids.reduce((t, id) => t + get(id), 0) - avail;
      if (over > 0) ids.filter(id => id !== changed).reverse().forEach(id => { const v = get(id), cut = Math.min(v, over); $('#' + id).value = v - cut; over -= cut; });
      ids.forEach(id => $('#' + id + '-v').textContent = F(get(id)));
      const left = avail - ids.reduce((t, id) => t + get(id), 0);
      $('#left').textContent = F(left);
      const funPct = avail ? get('fun') / scn.income : 0;
      const hints = [];
      if (funPct < 0.05) hints.push('😟 Very little fun this month. Happiness will drop.');
      if (st.ef < essentials(st) && get('ef') === 0) hints.push('⚠️ Your emergency fund covers less than 1 month of essentials.');
      if (st.card > 0.5 && get('debt') < st.card * 0.2) hints.push('💳 Card debt grows at ' + scn.cardAPR + '% APR. Paying it down is a guaranteed "return".');
      if (avail && left / avail > 0.4) hints.push('💤 Lots of money sitting idle in checking earns nothing.');
      $('#hint').textContent = hints.join(' ');
    }
    $$('input[type=range]', main).forEach(r => r.oninput = () => sync(r.id));
    sync('fun');
    $$('.chip[data-mix]', main).forEach(b => b.onclick = () => { l.mix = b.dataset.mix; save(); $$('.chip[data-mix]', main).forEach(x => x.classList.toggle('on', x === b)); });
    bindGoal(main, l);
    $('#lock').onclick = () => {
      const alloc = {};
      ['fun', 'ef', 'goal', 'inv', 'debt'].forEach(id => alloc[id] = avail ? get(id) / avail : 0);
      const rec = { alloc, mix: l.mix, buy: l.pendingBuy || null };
      l.pendingBuy = null;
      l.dec.months[st.m - 1] = rec;
      allocate(st, scn, alloc, l.mix);
      sound('coin');
      const ev = eventFor(st, scn);
      l.phase = ev ? 'event' : 'summary';
      if (!ev) { st.lastEvent = null; endMonth(st, scn); }
      save(); MQ.app.render();
    };
  }
  function slider(id, label, max) { return '<label class="slider"><span>' + label + '</span><b id="' + id + '-v"></b><input type="range" id="' + id + '" min="0" max="' + max + '" step="' + Math.max(1, MQ.roundNice(max / 100) || 1) + '" value="0"></label>'; }

  function goalPanel(l) {
    const scn = l.scn, st = l.st, cost = scn.goal.cost;
    const cashOk = canBuyCash(st, scn);
    const usesEF = st.goalFund + Math.max(0, st.checking) < cost;
    const emi = loanFor(cost, scn.loanAPR, 12);
    return '<div class="card goal-panel"><h3>' + scn.goal.e + ' Buy the ' + esc(scn.goal.name) + ' (' + F(cost) + ')?</h3>' +
      '<div class="buy-opts">' +
      '<button class="buy-opt" data-buy="cash" ' + (cashOk ? '' : 'disabled') + '><b>💵 Pay cash</b><small>' + (cashOk ? (usesEF ? '⚠️ Dips into your emergency fund' : 'From your goal fund + checking') : 'Need ' + F(cost - st.goalFund - Math.max(0, st.checking) - st.ef) + ' more') + '</small></button>' +
      '<button class="buy-opt" data-buy="loan"><b>🏦 Loan</b><small>' + F(emi) + '/mo × 12 at ' + scn.loanAPR + '% APR + 2% fee. Total ≈ ' + F(emi * 12 + cost * 0.02) + '</small></button>' +
      '<button class="buy-opt" data-buy="bnpl"><b>🛍️ Buy Now Pay Later</b><small>3 × ' + F(cost / 3) + '. 0% if you never miss</small></button>' +
      '<button class="buy-opt" data-buy="card"><b>💳 Credit card</b><small>' + scn.cardAPR + '% APR on whatever you do not repay</small></button>' +
      '</div><p class="hint">Or keep saving. You can buy any month.</p></div>';
  }
  function bindGoal(main, l) {
    $$('.buy-opt', main).forEach(b => b.onclick = () => {
      const method = b.dataset.buy;
      buy(l.st, l.scn, method);
      l.pendingBuy = method;
      sound('level');
      toast(l.scn.goal.e + ' You got the ' + l.scn.goal.name + '!', 'good');
      save(); MQ.app.render();
    });
  }

  function eventScreen(main) {
    const l = L(), st = l.st, scn = l.scn, ev = eventFor(st, scn), tpl = EV[ev.id];
    const ctx = { scn, st };
    main.innerHTML = head(main, 'Month ' + st.m + '/' + scn.months) + hud(l) +
      '<div class="card event pop"><div class="big-emoji">' + tpl.e + '</div><div class="kicker">' + ({ shock: 'Life happens…', opportunity: 'Opportunity!', temptation: 'Temptation…', social: 'Friends & family', market: 'Markets' })[tpl.kind] + '</div>' +
      '<h2>' + esc(tpl.t(ev.p, ctx)) + '</h2>' +
      (tpl.kind === 'shock' ? '<p class="muted small">You have ' + F(Math.max(0, st.checking)) + ' in checking and ' + F(st.ef) + ' in your emergency fund.</p>' : '') +
      '<div class="opts">' + tpl.c(ev.p, ctx).map((c, i) => '<button class="opt" data-i="' + i + '">' + esc(c[0]) + '</button>').join('') + '</div></div>';
    $$('.opt', main).forEach(b => b.onclick = () => {
      const i = +b.dataset.i;
      l.dec.choices[ev.id] = i;
      resolveEvent(st, scn, ev, i);
      endMonth(st, scn);
      l.phase = 'summary';
      save(); MQ.app.render();
    });
  }

  function summaryScreen(main) {
    const l = L(), st = l.st, scn = l.scn, h = st.hist[st.hist.length - 1], prev = st.hist[st.hist.length - 2];
    const done = st.m > scn.months;
    main.innerHTML = head(main, 'End of month ' + (st.m - 1)) + hud(l) +
      '<div class="card pop">' + (st.lastEvent ? '<div class="kicker">' + st.lastEvent.e + ' ' + esc(st.lastEvent.t) + '</div><h3>You chose: ' + esc(st.lastEvent.choice) + '</h3>' : '<div class="kicker">A quiet month</div><h3>No surprises this month 😌</h3>') +
      (st.notes.length ? '<ul class="list">' + st.notes.map(n => '<li>' + esc(n) + '</li>').join('') + '</ul>' : '') +
      '<div class="ledger"><div><span>Net worth change</span><b class="' + (h.nw >= prev.nw ? 'up' : 'down') + '">' + (h.nw >= prev.nw ? '+' : '−') + F(Math.abs(h.nw - prev.nw)) + '</b></div></div>' +
      '<canvas id="nwchart" class="chart sm"></canvas></div>' +
      '<button class="btn primary block lg" id="nx">' + (done ? 'See my results 📊' : 'Next payday ▶') + '</button>';
    lineChart($('#nwchart'), [{ data: st.hist.map(x => x.nw), color: getVar('--accent'), fill: true }], { length: scn.months + 1, baseline: st.startNW });
    $('#nx').onclick = () => {
      if (done) { finish(); return; }
      payday(st, scn); l.phase = 'month'; save(); MQ.app.render();
    };
  }
  function getVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }

  function finish() {
    const l = L(), m = metrics(l.st, l.scn);
    l.phase = 'done';
    if (!l.rewarded) {
      l.rewarded = true;
      ST.record('lifeScore', m.score);
      ST.record('lifeNet', Math.round(m.growth));
      if (m.efMonths >= 3) ST.flag('efund');
      if (l.st.loanPaidOff) ST.flag('loanPaid');
      if (l.scn.mode === 'first') ST.flag('firstSalary');
      if (m.debt < 1) ST.flag('debtFree');
      if ((m.owned && m.ownedHow === 'cash') || l.st.goalFund >= l.scn.goal.cost) ST.flag('lifeWin');
      if (MQ.adaptive) {
        MQ.adaptive.recordResult('budgeting', m.sub.spending / 100); MQ.adaptive.recordResult('saving', (m.sub.saving + m.sub.resilience) / 200);
        MQ.adaptive.recordResult('credit', m.sub.debt / 100); MQ.adaptive.recordResult('investing', m.sub.investing / 100);
        if (l.st.sawCrash) MQ.adaptive.recordResult('risk', m.sold ? 0.2 : 0.9);
      }
      if (l.challenge) {
        const them = l.challenge.r;
        S().challenges.push({ date: ST.dateKey(), opp: l.challenge.by, me: Math.round(m.nw), them: them.nw, win: m.nw > them.nw ? true : m.nw < them.nw ? false : null });
        ST.checkBadges();
      }
      save();
      ST.addXP(40 + Math.round(m.score / 4), 'Life Sim');
    }
    save();
    MQ.app.go('#/sim/life/result');
  }

  function results(main) {
    const l = L(), st = l.st, scn = l.scn, m = metrics(st, scn);
    const subs = Object.keys(m.sub);
    main.innerHTML = head(main, 'Your year in review') +
      '<div class="result pop"><div class="big-emoji">' + (m.owned ? scn.goal.e : '📘') + '</div><h1>' + esc(scn.name) + '\'s ' + scn.months + ' months</h1><div class="grade">' + grade(m.score) + '</div><p class="muted">Decision score ' + m.score + '/100</p></div>' +
      (l.challenge ? challengeCompare(l, m) : '') +
      '<div class="card"><h3>📊 Your financial decisions</h3><div class="ledger">' +
      row('Net worth', F(m.startNW) + ' → ' + F(m.nw), m.nw >= m.startNW ? 'up' : 'down') +
      row('Savings rate', Math.round(m.savingsRate * 100) + '%', m.savingsRate >= 0.2 ? 'up' : '') +
      row('Emergency fund', m.efMonths.toFixed(1) + ' months of essentials', m.efMonths >= 3 ? 'up' : m.efMonths < 1 ? 'down' : '') +
      row('Debt-to-income', Math.round(m.dti * 100) + '%', m.dti > 0.36 ? 'down' : '') +
      row('Investment diversification', m.div + '/100', '') +
      row('Impulse spending', m.impulse, m.impulse === 'High' ? 'down' : m.impulse === 'Low' ? 'up' : '') +
      row('Interest earned vs paid', F(m.intEarned) + ' vs ' + F(m.intPaid), m.intPaid > m.intEarned ? 'down' : 'up') +
      row('Investment gains', F(m.invGain), m.invGain >= 0 ? 'up' : 'down') +
      (m.matched ? row('Free employer match', F(m.matched), 'up') : '') +
      row('Goal', m.owned ? 'Bought (' + howText(m).replace('paid ', '') + ')' : Math.round(Math.min(1, st.goalFund / scn.goal.cost) * 100) + '% saved', m.owned ? 'up' : '') + '</div></div>' +
      '<div class="card"><h3>Skill breakdown</h3>' + subs.map(k => '<div class="unit-prog"><span>' + SUBNAMES[k] + '</span><div class="bar"><i style="width:' + Math.round(m.sub[k]) + '%;background:' + (m.sub[k] >= 70 ? 'var(--good)' : m.sub[k] >= 45 ? 'var(--gold)' : 'var(--bad)') + '"></i></div><span class="muted small">' + Math.round(m.sub[k]) + '</span></div>').join('') +
      '<div class="insights"><div class="ins good"><span>💪</span><div><small>Biggest strength</small><b>' + SUBNAMES[m.strong] + '</b></div></div><div class="ins bad"><span>🎯</span><div><small>Biggest weakness</small><b>' + SUBNAMES[m.weak] + '</b></div></div>' +
      '<a class="ins learn" href="#/lesson/' + m.concept.lesson + '"><span>📚</span><div><small>Concept to learn next</small><b>' + esc(m.concept.name) + ' ›</b></div></a></div></div>' +
      '<div class="card"><h3>📈 Net worth over time</h3><canvas id="nwc" class="chart"></canvas><div id="wi-legend" class="legend"><span><i style="background:var(--accent)"></i>Your run</span></div></div>' +
      '<h2 class="section">🧪 What if…?</h2><p class="muted small">Same character, same surprises, same market. We change one thing and replay your exact decisions.</p>' +
      '<div class="whatifs">' + whatIfs(l).map(w => '<button class="btn whatif" data-id="' + w.id + '">' + esc(w.label) + '</button>').join('') + '</div><div id="wi-out"></div>' +
      '<h2 class="section">⚔️ Challenge a friend</h2><div class="card"><p class="muted small">Send this code. Your friend plays the same life and sees how your decisions compare.</p><div class="code-row"><input class="input mono" readonly id="cc" value="' + esc(challengeCode(l, m)) + '"><button class="btn" id="ccopy">Copy</button></div>' +
      (l.challenge ? '<p class="muted small">Send your result back to ' + esc(l.challenge.by) + ':</p><div class="code-row"><input class="input mono" readonly id="rc" value="' + esc(resultCode(l, m)) + '"><button class="btn" id="rcopy">Copy</button></div>' : '') + '</div>' +
      (l.challenge ? '' : '<div class="card"><h3>👥 Pass & play</h3><p class="muted small">Same phone, same classroom? Hand it to a friend: they play this exact life and see how they compare with you. (Your records are saved; this replaces the run on screen.)</p><button class="btn block" id="pass">Hand the phone to a friend</button></div>') +
      '<button class="btn primary block lg" id="again">New life 🎲</button><button class="btn ghost block" id="same">Replay this exact life</button>';
    lineChart($('#nwc'), [{ data: st.hist.map(x => x.nw), color: getVar('--accent'), fill: true }], { length: scn.months + 1, baseline: m.startNW });
    const copy = id => () => { const i = $('#' + id); i.select(); (navigator.clipboard ? navigator.clipboard.writeText(i.value) : Promise.reject()).then(() => toast('📋 Copied!'), () => { document.execCommand('copy'); toast('📋 Copied!'); }); };
    $('#ccopy').onclick = copy('cc'); if ($('#rcopy')) $('#rcopy').onclick = copy('rc');
    $('#again').onclick = () => MQ.app.go('#/sim/life/new');
    $('#same').onclick = () => startRun(scn, l.challenge);
    if ($('#pass')) $('#pass').onclick = () => { const me = S().profile.name; toast('📱 Hand the phone over! Challenger: ' + me); startRun(scn, { by: me, r: summary(m), local: true }); };
    $$('.whatif', main).forEach(b => b.onclick = () => {
      const w = whatIfs(l).find(x => x.id === b.dataset.id);
      const alt = replay(scn, l.dec, w.mods), am = metrics(alt, scn);
      $$('.whatif', main).forEach(x => x.classList.toggle('on', x === b));
      lineChart($('#nwc'), [{ data: alt.hist.map(x => x.nw), color: getVar('--accent2'), width: 2 }, { data: st.hist.map(x => x.nw), color: getVar('--accent'), fill: true }], { length: scn.months + 1, baseline: m.startNW });
      $('#wi-legend').innerHTML = '<span><i style="background:var(--accent)"></i>Your run</span><span><i style="background:var(--accent2)"></i>What-if</span>';
      const d = am.nw - m.nw;
      $('#wi-out').innerHTML = '<div class="card pop"><div class="kicker">' + esc(w.label) + '</div><h3>' + (d >= 0 ? '+' : '−') + F(Math.abs(d)) + ' net worth · Grade ' + grade(m.score) + ' → ' + grade(am.score) + '</h3>' +
        '<ul class="list">' + explainDiff(m, am, 'your run', 'the what-if').map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' + lessonFor(w.id) + '</div>';
      $('#wi-out').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      ST.flag('whatIf');
    });
  }
  function lessonFor(id) {
    const t = { noBorrow: 'Borrowing lets you have it sooner, but interest and fees mean you pay more for the same thing.', holdCrash: 'Selling after a crash turns a temporary drop into a permanent loss.', investMore: 'Small, regular investing compounds. Over decades, this difference becomes huge.', wantsCut: 'Trimming wants a little is often painless and adds up fast.', efFirst: 'An emergency fund turns surprises into inconveniences instead of debt.', debtFirst: 'Paying off high-interest debt is a guaranteed return equal to its APR.', inflation: 'Higher inflation makes everyday costs climb, so cash quietly loses value.', crash25: 'A crash hurts more the more you hold in risky assets. Time and diversification help you recover.' }[id];
    return t ? '<p class="tip-line">💡 ' + esc(t) + '</p>' : '';
  }
  function row(a, b, cls) { return '<div><span>' + a + '</span><b class="' + (cls || '') + '">' + b + '</b></div>'; }

  function challengeCompare(l, m) {
    const them = unsummary(l.challenge.r), by = l.challenge.by;
    const win = m.nw > them.nw;
    return '<div class="card challenge-banner"><h3>' + (win ? '🏆 You beat ' : m.nw === them.nw ? '🤝 You tied with ' : '😤 ' + 'You lost to ') + esc(by) + '!</h3>' +
      '<div class="vs"><div><small>You</small><b>' + F(m.nw) + '</b><span>Grade ' + grade(m.score) + '</span></div><div class="vs-mid">VS</div><div><small>' + esc(by) + '</small><b>' + F(them.nw) + '</b><span>Grade ' + grade(them.score) + '</span></div></div>' +
      '<h4>Why your outcomes differed</h4><ul class="list">' + explainDiff(them, m, by, 'you').map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></div>';
  }

  function compareResult(main, data) {
    const l = L();
    if (!l || !l.scn || l.scn.seed !== data.seed || l.phase !== 'done') { toast('Finish the same challenge first, then paste their result here.', 'bad'); return; }
    const m = metrics(l.st, l.scn), them = unsummary(data.r);
    S().challenges.push({ date: ST.dateKey(), opp: data.by, me: Math.round(m.nw), them: them.nw, win: m.nw > them.nw ? true : m.nw < them.nw ? false : null });
    save(); ST.checkBadges();
    modal('<div class="celebrate"><h2>' + (m.nw > them.nw ? '🏆 You win!' : m.nw < them.nw ? '😤 ' + esc(data.by) + ' wins' : '🤝 Tie') + '</h2><div class="vs"><div><small>You</small><b>' + F(m.nw) + '</b></div><div class="vs-mid">VS</div><div><small>' + esc(data.by) + '</small><b>' + F(them.nw) + '</b></div></div><ul class="list" style="text-align:left">' + explainDiff(m, them, 'you', data.by).map(x => '<li>' + esc(x) + '</li>').join('') + '</ul><button class="btn primary block" data-close>Nice</button></div>');
  }

  MQ.lifesim = { screen, makeScenario, initState, payday, allocate, buy, resolveEvent, endMonth, replay, metrics, explainDiff, EV, grade };
})(window.MQ);
