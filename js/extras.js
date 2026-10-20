// Home-screen extras: Weekly Quests and a real-life Savings Jar.
window.MQ = window.MQ || {};

(function (MQ) {
  const { $, $$, esc, fmt, toast, modal, closeModal, sound, confetti } = MQ.ui;
  const ST = MQ.state;
  const S = () => ST.get();

  // =====================================================================
  //  WEEKLY QUESTS
  // =====================================================================
  const POOL = [
    { id: 'lessons', e: '📚', t: 'Finish 3 lessons', type: 'lesson', n: 3, go: '#/learn' },
    { id: 'games', e: '🎮', t: 'Play 4 games', type: 'game', n: 4, go: '#/play' },
    { id: 'sim', e: '🏙️', t: 'Finish a simulation', type: 'sim', n: 1, go: '#/sim' },
    { id: 'practice', e: '🎯', t: 'Do 2 practice rounds', type: 'practice', n: 2, go: '#/practice' },
    { id: 'xp', e: '⚡', t: 'Earn 150 XP', type: 'xp', n: 150, go: '#/learn' },
    { id: 'daily', e: '📅', t: 'Answer 3 daily challenges', type: 'daily', n: 3, go: '#/home' },
    { id: 'scam', e: '🚨', t: 'Play the Scam Simulator twice', type: 'scam', n: 2, go: '#/game/scam' }
  ];
  const REWARD = 40, BONUS = 60;

  function week() { return ST.dateKey(ST.weekStart()); }
  function data() {
    const s = S(), wk = week();
    if (!s.quests || s.quests.week !== wk) {
      const r = ST.rng('quests:' + wk + ':' + ((s.profile && s.profile.id) || ''));
      const pool = POOL.slice(), picks = [];
      while (picks.length < 3) picks.push(pool.splice(Math.floor(r() * pool.length), 1)[0].id);
      s.quests = { week: wk, picks, counts: {}, claimed: {}, bonus: false };
      ST.save();
    }
    return s.quests;
  }
  function list() { const q = data(); return q.picks.map(id => POOL.find(p => p.id === id)).filter(Boolean); }

  // Called from addXP with the reason text, so every activity counts automatically.
  function track(amount, why) {
    if (why === 'Quest') return;
    const q = data(), c = q.counts, add = (k, n) => { c[k] = (c[k] || 0) + (n || 1); };
    add('xp', amount);
    if (why === 'Lesson') add('lesson');
    else if (why === 'Practice') add('practice');
    else if (why === 'Daily challenge') add('daily');
    else if (/Life Sim|Portfolio Sim|Market year/.test(why || '')) add('sim');
    else if ((MQ.GAMES || []).some(g => g.title === why)) { add('game'); if (why === 'Scam Simulator') add('scam'); }
    ST.save();
    // Let players know as soon as a quest is ready to claim
    list().forEach(Q => { if (!q.claimed[Q.id] && !q['told_' + Q.id] && (c[Q.type] || 0) >= Q.n) { q['told_' + Q.id] = true; ST.save(); setTimeout(() => toast('🗺️ Quest complete: ' + Q.t + '! Claim it on Home', 'badge'), 600); } });
  }

  function card() {
    const q = data(), qs = list();
    const end = new Date(q.week + 'T00:00:00'); end.setDate(end.getDate() + 7);
    const days = Math.max(0, Math.ceil((end - new Date()) / 86400000));
    const doneAll = qs.every(Q => q.claimed[Q.id]);
    return '<div class="card quests" id="quests"><div class="row"><div><div class="kicker">🗺️ Weekly quests</div><h3>' + (doneAll ? 'All quests done! 🎉' : qs.filter(Q => q.claimed[Q.id]).length + '/3 complete') + '</h3></div><span class="pill small">' + days + (days === 1 ? ' day' : ' days') + ' left</span></div>' +
      qs.map(Q => {
        const have = Math.min(Q.n, q.counts[Q.type] || 0), ready = have >= Q.n, claimed = q.claimed[Q.id];
        return '<div class="quest ' + (claimed ? 'claimed' : ready ? 'ready' : '') + '"><span class="qe">' + Q.e + '</span><div class="qb"><div class="qt"><b>' + Q.t + '</b><small>' + (Q.type === 'xp' ? have + '/' + Q.n + ' XP' : have + '/' + Q.n) + '</small></div><div class="bar"><i style="width:' + (have / Q.n * 100) + '%"></i></div></div>' +
          (claimed ? '<span class="qdone">✓</span>' : ready ? '<button class="btn sm primary qclaim" data-q="' + Q.id + '">+' + REWARD + ' 🪙</button>' : '<a class="btn sm ghost" href="' + Q.go + '">Go</a>') + '</div>';
      }).join('') +
      '<div class="quest-bonus ' + (q.bonus ? 'claimed' : '') + '"><span>🎁</span><small>' + (q.bonus ? 'Bonus chest opened: +' + BONUS + ' XP' : 'Finish all 3 to open the bonus chest (+' + BONUS + ' XP)') + '</small></div></div>';
  }
  function bind(root, rerender) {
    $$('.qclaim', root).forEach(b => b.onclick = () => {
      const q = data(), id = b.dataset.q;
      if (q.claimed[id]) return;
      q.claimed[id] = true;
      S().coins += REWARD;
      sound('coin'); toast('🪙 +' + REWARD + ' coins!', 'good');
      if (list().every(Q => q.claimed[Q.id]) && !q.bonus) {
        q.bonus = true;
        S().badgeFlags = S().badgeFlags || {}; S().badgeFlags.questMaster = true;
        ST.save(); confetti();
        ST.addXP(BONUS, 'Quest');
      }
      ST.save(); ST.checkBadges(); rerender();
    });
  }

  // =====================================================================
  //  REAL-LIFE SAVINGS JAR
  // =====================================================================
  function jar() { return S().jar || null; }
  function jarCard() {
    const j = jar();
    if (!j) {
      return '<div class="card jar" id="jar"><div class="row"><div><div class="kicker">🫙 My real savings jar</div><h3>Saving for something in real life?</h3></div><span class="jar-art">🫙</span></div>' +
        '<p class="muted small">Set a real goal, log money as you actually save it, and watch the jar fill up. Only you can see this.</p><button class="btn primary block" id="jar-new">Start a savings goal</button></div>';
    }
    const pct = Math.min(1, j.saved / j.cost), left = Math.max(0, j.cost - j.saved);
    const weeks = j.weekly > 0 ? Math.ceil(left / j.weekly) : null;
    const done = j.saved >= j.cost;
    return '<div class="card jar" id="jar"><div class="row"><div><div class="kicker">🫙 My real savings jar</div><h3>' + esc(j.e) + ' ' + esc(j.name) + '</h3></div><button class="btn sm ghost" id="jar-edit">Edit</button></div>' +
      '<div class="jar-body"><div class="jar-vis" aria-hidden="true"><div class="jar-fill" style="height:' + Math.round(pct * 100) + '%"></div><span>' + Math.round(pct * 100) + '%</span></div>' +
      '<div class="jar-info"><div class="jar-num"><b>' + fmt(j.saved) + '</b><small>of ' + fmt(j.cost) + '</small></div>' +
      '<p class="small ' + (done ? 'good' : 'muted') + '">' + (done ? '🎉 Goal reached! You did it.' : fmt(left) + ' to go' + (weeks !== null ? ' · about ' + weeks + ' week' + (weeks === 1 ? '' : 's') + ' at ' + fmt(j.weekly) + '/week' : '')) + '</p>' +
      (done ? '<button class="btn sm primary" id="jar-new">New goal</button>' :
        '<div class="jar-add">' + [1, 2, 5].map(m => { const v = MQ.roundNice(Math.max(1, (j.weekly || j.cost / 20) * m / 2)); return '<button class="btn sm jar-quick" data-v="' + v + '">+' + fmt(v) + '</button>'; }).join('') + '<button class="btn sm" id="jar-custom">+ Other</button></div>') +
      '</div></div>' +
      (j.log && j.log.length ? '<p class="hint">Last added: ' + fmt(j.log[j.log.length - 1].v) + ' on ' + esc(j.log[j.log.length - 1].d) + ' · <a href="#" id="jar-undo">undo</a></p>' : '') + '</div>';
  }
  function jarForm(rerender) {
    const j = jar() && jar().saved < jar().cost ? jar() : null;
    const c = MQ.country();
    const sugg = c.goals.teen[0];
    const emojis = ['🎧', '📱', '🎮', '🚲', '👟', '🎒', '💻', '🎁', '✈️', '🎸'];
    let e = j ? j.e : emojis[0];
    modal('<h2>' + (j ? 'Edit your goal' : 'Start a savings goal') + '</h2>' +
      '<label class="label" for="jg-name">What are you saving for?</label><input class="input" id="jg-name" maxlength="30" value="' + esc(j ? j.name : sugg.name.replace(/^pair of /, '')) + '">' +
      '<div class="label">Pick an icon</div><div class="chips">' + emojis.map(x => '<button class="chip ' + (x === e ? 'on' : '') + '" data-e="' + x + '">' + x + '</button>').join('') + '</div>' +
      '<label class="label" for="jg-cost">How much does it cost?</label><input class="input" id="jg-cost" type="number" min="1" inputmode="numeric" value="' + (j ? j.cost : MQ.roundNice((sugg.cost[0] + sugg.cost[1]) / 2)) + '">' +
      '<label class="label" for="jg-saved">Already saved</label><input class="input" id="jg-saved" type="number" min="0" inputmode="numeric" value="' + (j ? j.saved : 0) + '">' +
      '<label class="label" for="jg-week">How much can you save per week?</label><input class="input" id="jg-week" type="number" min="0" inputmode="numeric" value="' + (j ? j.weekly : MQ.roundNice(sugg.cost[0] / 15)) + '">' +
      '<p class="hint" id="jg-hint"></p><p class="error-msg" id="jg-err"></p>' +
      '<div class="row gap">' + (j ? '<button class="btn danger ghost" id="jg-del">Delete goal</button>' : '') + '<button class="btn ghost" data-close>Cancel</button><button class="btn primary" id="jg-save">Save goal</button></div>');
    const hint = () => {
      const cost = +$('#jg-cost').value || 0, saved = +$('#jg-saved').value || 0, wk = +$('#jg-week').value || 0;
      $('#jg-hint').textContent = cost > saved && wk > 0 ? 'At ' + fmt(wk) + ' a week you will get there in about ' + Math.ceil((cost - saved) / wk) + ' weeks.' : '';
    };
    ['#jg-cost', '#jg-saved', '#jg-week'].forEach(id => $(id).oninput = hint); hint();
    $$('.modal [data-e]').forEach(b => b.onclick = () => { e = b.dataset.e; $$('.modal [data-e]').forEach(x => x.classList.toggle('on', x === b)); });
    $('#jg-save').onclick = () => {
      const name = $('#jg-name').value.trim(), cost = +$('#jg-cost').value, saved = Math.max(0, +$('#jg-saved').value || 0), weekly = Math.max(0, +$('#jg-week').value || 0);
      if (!name) { $('#jg-err').textContent = 'Give your goal a name.'; return; }
      if (!(cost > 0)) { $('#jg-err').textContent = 'Enter how much it costs (more than 0).'; return; }
      const prev = jar();
      S().jar = { name, e, cost, saved, weekly, log: prev && j ? prev.log || [] : [], started: prev && j ? prev.started : ST.dateKey() };
      ST.save(); closeModal(); toast('🫙 Goal saved!', 'good'); rerender();
    };
    if ($('#jg-del')) $('#jg-del').onclick = () => { S().jar = null; ST.save(); closeModal(); rerender(); };
  }
  function addToJar(v, rerender) {
    const j = jar(); if (!j || !(v > 0)) return;
    const was = j.saved < j.cost;
    j.saved += v; j.log = (j.log || []).concat([{ v, d: ST.dateKey() }]).slice(-50);
    sound('coin');
    if (was && j.saved >= j.cost) {
      confetti(); toast('🎉 You reached your real goal!', 'good');
      S().badgeFlags = S().badgeFlags || {}; S().badgeFlags.realSaver = true; ST.checkBadges();
    } else toast('🫙 +' + fmt(v) + ' in the jar', 'good');
    ST.save(); rerender();
  }
  function bindJar(root, rerender) {
    if ($('#jar-new', root)) $('#jar-new', root).onclick = () => { if (jar() && jar().saved >= jar().cost) S().jar = null; jarForm(rerender); };
    if ($('#jar-edit', root)) $('#jar-edit', root).onclick = () => jarForm(rerender);
    $$('.jar-quick', root).forEach(b => b.onclick = () => addToJar(+b.dataset.v, rerender));
    if ($('#jar-custom', root)) $('#jar-custom', root).onclick = () => {
      modal('<h2>Add to your jar</h2><label class="label" for="ja-v">Amount you saved</label><input class="input" id="ja-v" type="number" min="1" inputmode="numeric" autofocus><p class="error-msg" id="ja-err"></p><div class="row gap"><button class="btn ghost" data-close>Cancel</button><button class="btn primary" id="ja-ok">Add</button></div>');
      $('#ja-ok').onclick = () => { const v = +$('#ja-v').value; if (!(v > 0)) { $('#ja-err').textContent = 'Enter an amount above 0.'; return; } closeModal(); addToJar(v, rerender); };
    };
    if ($('#jar-undo', root)) $('#jar-undo', root).onclick = ev => { ev.preventDefault(); const j = jar(); const last = j.log.pop(); if (last) j.saved = Math.max(0, j.saved - last.v); ST.save(); rerender(); };
  }

  // Render both into a container and keep them live
  // On wide screens, drop each card into whichever Home column is shorter, so neither side has a big gap.
  function balance() {
    const qw = document.getElementById('x-quests'), jw = document.getElementById('x-jar'), home = document.querySelector('.screen-home .home-cols');
    if (!qw || !jw || !home) return;
    const cols = Array.from(home.children);
    if (window.innerWidth < 960 || cols.length < 2) { cols[cols.length - 1].append(qw, jw); return; }
    [qw, jw].forEach(w => {
      const h = c => c.offsetHeight - (w.parentElement === c ? w.offsetHeight : 0);
      (h(cols[0]) < h(cols[1]) ? cols[0] : cols[1]).appendChild(w);
    });
  }
  function mount(el) {
    el.innerHTML = '<div id="x-quests"></div><div id="x-jar"></div>';
    const qw = el.querySelector('#x-quests'), jw = el.querySelector('#x-jar');
    const draw = () => { qw.innerHTML = card(); jw.innerHTML = jarCard(); bind(qw, draw); bindJar(jw, draw); MQ.app.renderHeader(); balance(); };
    draw();
  }
  window.addEventListener('resize', () => { clearTimeout(balance.t); balance.t = setTimeout(balance, 150); });

  MQ.extras = { track, mount, balance, questCard: card };
})(window.MQ);
