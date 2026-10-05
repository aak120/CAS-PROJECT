// Money personality: a short scenario quiz. The result tailors simulations (which events show up,
// suggested portfolios). It is a learning tool, not a diagnosis or a professional assessment.
window.MQ = window.MQ || {};

(function (MQ) {
  const { $, $$, esc, fmt, sound } = MQ.ui;
  const ST = MQ.state;

  function amt(usd) { const c = MQ.country(); return fmt(MQ.roundNice(usd * (c.first.income[0] + c.first.income[1]) / 2 / 3500)); }

  function questions() {
    return [
      { q: 'You have ' + amt(150) + ' left at the end of the month. What do you do?', a: [
        ['Save most of it', { plan: 2, impulse: -1 }], ['Invest it in an index fund', { plan: 1, risk: 1 }],
        ['Treat myself and my friends', { impulse: 2 }], ['Put it all in a trending crypto coin', { risk: 2, impulse: 1 }]] },
      { q: 'Your favourite sneakers drop: limited edition, ' + amt(120) + ', today only.', a: [
        ['Buy instantly before they sell out', { impulse: 2 }], ['Wait 24 hours, then decide', { plan: 1, impulse: -1 }],
        ['Skip. Not in my budget', { plan: 2, impulse: -1 }], ['Buy two and resell one for profit', { risk: 1, impulse: 1 }]] },
      { q: 'You invested ' + amt(300) + ' and it dropped 20% in a month.', a: [
        ['Sell everything now', { risk: -2 }], ['Hold and wait', { risk: 1, plan: 1 }],
        ['Buy more while it is cheap', { risk: 2 }], ['Find out why it fell before deciding', { plan: 2 }]] },
      { q: 'A friend says a new coin will 10× by next month.', a: [
        ['Put in money I cannot afford to lose', { risk: 2, impulse: 2 }], ['A small amount just for fun', { risk: 1 }],
        ['Research it first', { plan: 1 }], ['Pass. Sounds like hype', { risk: -1, plan: 1 }]] },
      { q: 'How do you usually know how much money you have?', a: [
        ['I track it in an app or notes', { plan: 2 }], ['Rough idea in my head', {}],
        ['When a payment fails 😅', { plan: -2, impulse: 1 }], ['Someone else manages it for me', { plan: -1 }]] },
      { q: 'Payday! What happens first?', a: [
        ['Move money to savings straight away', { plan: 2, impulse: -1 }], ['Pay bills, then see what is left', { plan: 1 }],
        ['Online shopping cart was ready 🛒', { impulse: 2 }], ['Nothing planned, I go with the flow', { plan: -1, impulse: 1 }]] }
    ];
  }

  function classify(t) {
    const plan = t.plan >= 6 ? ['🟢', 'Planner', 'You like knowing where your money goes.'] : t.plan >= 2 ? ['🟡', 'Flexible planner', 'You plan some things and wing others.'] : ['🔴', 'Spontaneous', 'You tend to decide in the moment.'];
    const risk = t.risk >= 4 ? ['🔴', 'High risk tolerance', 'Big swings do not scare you, which can mean big losses too.'] : t.risk >= 0 ? ['🟡', 'Moderate risk tolerance', 'You will take some risk for growth.'] : ['🟢', 'Low risk tolerance', 'You prefer safety and steady progress.'];
    const imp = t.impulse >= 4 ? ['🔴', 'Impulsive spending tendency', 'Sales and hype can pull you in.'] : t.impulse >= 1 ? ['🟡', 'Some impulse spending', 'Mostly in control, with the odd splurge.'] : ['🟢', 'Low impulse spending', 'You rarely buy on a whim.'];
    let arch;
    if (t.plan >= 5 && t.risk <= 1) arch = { e: '🐿️', name: 'The Careful Saver', tip: 'You are great at saving. Make sure inflation is not eating your cash, and learn how investing works.' };
    else if (t.plan >= 4 && t.risk >= 2) arch = { e: '🧭', name: 'The Strategist', tip: 'You plan and you take smart risks. Watch out for overconfidence, and diversify.' };
    else if (t.impulse >= 3 && t.risk >= 3) arch = { e: '🎢', name: 'The Thrill Seeker', tip: 'Excitement drives you. Build an emergency fund first and keep "fun money" for risky bets.' };
    else if (t.impulse >= 3) arch = { e: '🎉', name: 'The Enjoyer', tip: 'You love living in the moment. Try "pay yourself first" so saving happens automatically.' };
    else arch = { e: '⚖️', name: 'The Balancer', tip: 'You balance today and tomorrow. Level up by setting clear goals with deadlines.' };
    return { traits: [plan, risk, imp], arch, raw: t, riskLevel: t.risk >= 4 ? 'high' : t.risk >= 0 ? 'moderate' : 'low', impulseLevel: t.impulse >= 4 ? 'high' : t.impulse >= 1 ? 'moderate' : 'low', date: ST.dateKey() };
  }

  function resultCard(p, showRetake) {
    return '<div class="card persona"><div class="persona-head"><span class="big-emoji">' + p.arch.e + '</span><div><div class="kicker">Your money personality</div><h2>' + p.arch.name + '</h2></div></div>' +
      p.traits.map(t => '<div class="trait"><span>' + t[0] + '</span><div><b>' + t[1] + '</b><small>' + t[2] + '</small></div></div>').join('') +
      '<p class="tip-line">💡 ' + esc(p.arch.tip) + '</p>' +
      '<p class="hint">This is a fun reflection tool, not a diagnosis or professional financial assessment. People change, so retake it anytime.</p>' +
      (showRetake ? '<a class="btn ghost block" href="#/personality">Retake the quiz</a>' : '') + '</div>';
  }

  MQ.app.route('personality', (main, args) => {
    const onboard = args[0] === 'onboard';
    const qs = questions();
    const t = { plan: 0, risk: 0, impulse: 0 };
    let i = 0;
    main.style.setProperty('--c', '#8b5cf6');
    function ask() {
      if (i >= qs.length) return done();
      const q = qs[i];
      main.innerHTML = '<div class="lesson-top">' + (onboard ? '<a href="#/home" class="x" id="skip">Skip</a>' : '<a href="#/profile" class="x">✕</a>') + '<div class="bar"><i style="width:' + (i / qs.length * 100) + '%"></i></div></div>' +
        '<div class="quiz pop"><div class="kicker">🧩 Money personality · ' + (i + 1) + '/' + qs.length + '</div><h2>' + esc(q.q) + '</h2><p class="muted small">No right or wrong answers. Pick what you would really do.</p><div class="opts">' +
        q.a.map((a, j) => '<button class="opt" data-i="' + j + '">' + esc(a[0]) + '</button>').join('') + '</div></div>';
      $$('.opt', main).forEach(b => b.onclick = () => {
        const eff = q.a[+b.dataset.i][1];
        Object.keys(eff).forEach(k => t[k] += eff[k]);
        sound('tap'); i++; ask();
      });
    }
    function done() {
      const S = ST.get();
      S.personality = classify(t);
      ST.save();
      ST.checkBadges();
      MQ.ui.confetti();
      main.innerHTML = resultCard(S.personality, false) +
        '<div class="card"><h3>How MoneyQuest adapts to you</h3><ul class="list">' +
        (S.personality.impulseLevel !== 'low' ? '<li>Life Sim will throw more <b>temptations</b> at you (sales, hype, FOMO) to practise saying no.</li>' : '<li>Life Sim will test your <b>resilience</b> with more surprise costs.</li>') +
        (S.personality.riskLevel === 'high' ? '<li>You will meet more <b>hype investments and crashes</b> to stress-test your risk appetite.</li>' : '<li>The Portfolio Sim will suggest a <b>' + (S.personality.riskLevel === 'low' ? 'cautious' : 'balanced') + '</b> starting mix and show you what extra risk could do.</li>') +
        '</ul></div><a class="btn primary block lg" href="#/home">' + (onboard ? 'Start learning 🚀' : 'Done') + '</a>';
      ST.addXP(10, 'Personality');
      MQ.app.renderHeader();
    }
    ask();
  });

  MQ.personality = { resultCard, get: () => ST.get().personality };
})(window.MQ);
