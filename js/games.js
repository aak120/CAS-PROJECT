// Mini-games: Needs vs Wants, Scam or Legit?, Interest Showdown.
window.MQ = window.MQ || {};

(function (MQ) {
  const { $, $$, esc, money, fmt, toast, sound, shuffle } = MQ.ui;
  const ST = MQ.state;
  const app = MQ.app;

  const GAMES = [
    { id: 'needs', e: '🛒', title: 'Needs vs Wants', sub: 'Sort as many items as you can in 45 seconds. Build combos for bonus points!', color: '#22c55e' },
    { id: 'scam', e: '🕵️', title: 'Scam or Legit?', sub: 'Read real-style messages and call out the scams before they get you.', color: '#14b8a6' },
    { id: 'interest', e: '✨', title: 'Interest Showdown', sub: 'Two savings options. Which one grows bigger? Think compound interest, and think fast.', color: '#8b5cf6' }
  ];

  app.route('play', main => {
    const S = app.S;
    main.innerHTML = '<h1>Play</h1><p class="sub">Quick games that earn XP and coins.</p>' +
      GAMES.map(g => {
        const rec = S.games[g.id] || {};
        return '<a class="card game-card" href="#/game/' + g.id + '" style="--c:' + g.color + '"><span class="emoji-tile">' + g.e + '</span><div><h3>' + g.title + '</h3><p class="muted">' + g.sub + '</p>' +
          '<div class="small">' + (rec.plays ? '🏅 Best: ' + rec.best + ' · Played ' + rec.plays + '×' : '✨ New') + '</div></div></a>';
      }).join('');
  });

  function record(id, score, extra) {
    const S = app.S;
    const rec = S.games[id] = S.games[id] || { best: 0, plays: 0 };
    const isBest = score > rec.best;
    rec.best = Math.max(rec.best, score);
    rec.plays++;
    Object.assign(rec, extra || {});
    ST.save();
    return isBest;
  }

  function intro(main, g, start) {
    const rec = app.S.games[g.id] || {};
    main.innerHTML = '<div class="lesson-top"><a href="#/play" class="x" aria-label="Back">✕</a></div>' +
      '<div class="result pop" style="--c:' + g.color + '"><div class="big-emoji">' + g.e + '</div><h1>' + g.title + '</h1><p>' + g.sub + '</p>' +
      (rec.best ? '<p class="muted">Your best: <b>' + rec.best + '</b></p>' : '') +
      '<button class="btn primary block lg" id="go">Play ▶</button></div>';
    $('#go').onclick = start;
  }

  function endScreen(main, g, html, xp) {
    main.innerHTML = '<div class="result pop" style="--c:' + g.color + '">' + html +
      '<button class="btn primary block lg" id="again">Play again 🔁</button><a class="btn ghost block" href="#/play">More games</a></div>';
    $('#again').onclick = () => app.render();
    if (xp) ST.addXP(xp, g.title);
    app.renderHeader();
  }

  app.route('game', (main, args) => {
    const g = GAMES.find(x => x.id === args[0]);
    if (!g) { app.go('#/play'); return; }
    main.style.setProperty('--c', g.color);
    ({ needs: needsGame, scam: scamGame, interest: interestGame })[g.id](main, g);
  });

  // ---------- Needs vs Wants ----------
  function needsGame(main, g) {
    intro(main, g, () => {
      let time = 45, score = 0, combo = 0, correct = 0, wrong = 0, deck = [], item, timer, locked = false;
      const draw = () => { if (!deck.length) deck = shuffle(MQ.NEEDS_WANTS); item = deck.pop(); };
      main.innerHTML = '<div class="game-hud"><a href="#/play" class="x">✕</a><span class="timer">⏱ <b id="t">45</b>s</span><span>Score <b id="sc">0</b></span><span class="combo" id="cb"></span></div>' +
        '<div class="nw-stage"><div class="nw-card" id="card"></div></div><p class="nw-fb" id="nfb">&nbsp;</p>' +
        '<div class="nw-buttons"><button class="btn need" id="bn">⬅ NEED</button><button class="btn want" id="bw">WANT ➡</button></div><p class="hint center">Tip: swipe the card, tap a button, or use your arrow keys.</p>';
      const card = $('#card');
      function show() { draw(); card.className = 'nw-card pop'; card.innerHTML = '<span>' + item.e + '</span><b>' + esc(item.t) + '</b>'; }
      function answer(need) {
        if (locked || time <= 0) return;
        const ok = need === item.need;
        if (ok) { combo++; correct++; const mult = combo >= 6 ? 3 : combo >= 3 ? 2 : 1; score += 10 * mult; sound('good'); }
        else { combo = 0; wrong++; time = Math.max(0, time - 2); sound('bad'); }
        $('#nfb').className = 'nw-fb ' + (ok ? 'good' : 'bad');
        $('#nfb').textContent = ok ? '✅ ' + item.t + ' is a ' + (item.need ? 'need' : 'want') : '❌ ' + item.t + ' is a ' + (item.need ? 'need' : 'want') + ' (−2s)';
        $('#sc').textContent = score;
        $('#t').textContent = time;
        $('#cb').textContent = combo >= 3 ? '🔥 x' + (combo >= 6 ? 3 : 2) : '';
        locked = true;
        card.className = 'nw-card fly-' + (need ? 'left' : 'right') + (ok ? ' ok' : ' no');
        setTimeout(() => { locked = false; if (time > 0) show(); }, 220);
      }
      $('#bn').onclick = () => answer(true);
      $('#bw').onclick = () => answer(false);
      const key = e => { if (e.key === 'ArrowLeft') answer(true); if (e.key === 'ArrowRight') answer(false); };
      document.addEventListener('keydown', key);
      let sx = null;
      card.addEventListener('pointerdown', e => { sx = e.clientX; });
      card.addEventListener('pointerup', e => { if (sx === null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 40) answer(dx < 0); });
      show();
      timer = setInterval(() => {
        time--; $('#t').textContent = Math.max(0, time);
        if (time <= 0) {
          clearInterval(timer);
          document.removeEventListener('keydown', key);
          const best = record('needs', score);
          const xp = Math.min(40, 5 + Math.round(score / 10));
          endScreen(main, g, '<div class="big-emoji bounce">' + (best ? '🏆' : '🛒') + '</div><h1>' + (best ? 'New best!' : 'Time\'s up!') + '</h1>' +
            '<div class="result-stats"><div><b>' + score + '</b><span>score</span></div><div><b>' + correct + '</b><span>correct</span></div><div><b>' + wrong + '</b><span>missed</span></div></div>' +
            '<p class="muted">Remember: a need keeps you healthy, safe and able to learn or work. Everything else is a want, and wants are fine when they fit your budget.</p>', xp);
        }
      }, 1000);
      app.onLeave(() => { clearInterval(timer); document.removeEventListener('keydown', key); });
    });
  }

  // ---------- Scam or Legit ----------
  function scamGame(main, g) {
    intro(main, g, () => {
      const rounds = shuffle(MQ.SCAMS).slice(0, 8);
      let i = 0, correct = 0;
      function show() {
        const r = rounds[i];
        main.innerHTML = '<div class="game-hud"><a href="#/play" class="x">✕</a><span>Message ' + (i + 1) + '/' + rounds.length + '</span><span>✅ ' + correct + '</span></div>' +
          '<div class="phone pop"><div class="phone-from">' + esc(r.from) + '</div><div class="bubble">' + esc(money(r.msg)) + '</div></div>' +
          '<div class="nw-buttons"><button class="btn want" id="scam">🚩 Scam</button><button class="btn need" id="legit">✅ Legit</button></div><div id="fb"></div>';
        const pick = isScam => {
          const ok = isScam === r.scam;
          if (ok) correct++;
          sound(ok ? 'good' : 'bad');
          $$('.nw-buttons .btn', main).forEach(b => b.disabled = true);
          $('#fb').innerHTML = '<div class="check-bar inline ' + (ok ? 'good' : 'bad') + '"><div class="fb-text"><b>' + (ok ? 'Correct! ' : 'Careful! ') + (r.scam ? 'This is a SCAM 🚩' : 'This one is legit ✅') + '</b><p>' + esc(money(r.explain)) + '</p></div><button class="btn primary block" id="nx">' + (i + 1 < rounds.length ? 'Next message' : 'See results') + '</button></div>';
          $('#nx').onclick = () => { i++; i < rounds.length ? show() : done(); };
        };
        $('#scam').onclick = () => pick(true);
        $('#legit').onclick = () => pick(false);
      }
      function done() {
        const perfect = correct === rounds.length;
        record('scam', correct, perfect ? { perfect: true } : {});
        endScreen(main, g, '<div class="big-emoji bounce">' + (perfect ? '🛡️' : '🕵️') + '</div><h1>' + correct + '/' + rounds.length + ' spotted</h1>' +
          '<p>' + (perfect ? 'Scam-proof! Nobody is fooling you.' : correct >= 6 ? 'Sharp eyes! Review the ones you missed.' : 'Scammers are tricky. Watch for urgency, weird links and "too good to be true".') + '</p>', correct * 3 + (perfect ? 6 : 0));
      }
      show();
    });
  }

  // ---------- Interest Showdown ----------
  function interestGame(main, g) {
    intro(main, g, () => {
      const ROUNDS = 8, LIMIT = 15;
      let round = 0, score = 0, correct = 0, timer;
      const fv = o => o.p * Math.pow(1 + o.r / 100, o.t);
      function option() {
        return { p: [100, 250, 500, 1000, 2000, 5000][Math.floor(Math.random() * 6)], r: [1, 2, 3, 4, 5, 6, 7, 8, 10, 12][Math.floor(Math.random() * 10)], t: [5, 10, 15, 20, 30, 40][Math.floor(Math.random() * 6)] };
      }
      function pair() {
        for (;;) {
          const a = option(), b = option();
          const fa = fv(a), fb = fv(b);
          // Avoid near-ties and make "bigger start" not always the answer.
          if (Math.abs(fa - fb) / Math.max(fa, fb) > 0.06 && (a.p !== b.p || a.r !== b.r || a.t !== b.t)) return [a, b];
        }
      }
      function show() {
        const [a, b] = pair();
        let left = LIMIT;
        const box = o => '<div class="io-line"><b>' + fmt(o.p) + '</b> start</div><div class="io-line">' + o.r + '% / year</div><div class="io-line">' + o.t + ' years</div>';
        main.innerHTML = '<div class="game-hud"><a href="#/play" class="x">✕</a><span>Round ' + (round + 1) + '/' + ROUNDS + '</span><span class="timer">⏱ <b id="t">' + LIMIT + '</b></span><span>Score <b>' + score + '</b></span></div>' +
          '<h2 class="center">Which ends up with more money?</h2>' +
          '<div class="io-grid"><button class="io-opt" data-k="a"><span class="io-tag">A</span>' + box(a) + '</button><button class="io-opt" data-k="b"><span class="io-tag">B</span>' + box(b) + '</button></div>' +
          '<p class="hint center">Hint: the Rule of 72. Money doubles roughly every 72 ÷ rate years.</p><div id="fb"></div>';
        const resolve = k => {
          clearInterval(timer);
          const fa = fv(a), fb = fv(b), win = fa > fb ? 'a' : 'b', ok = k === win;
          if (ok) { correct++; score += 100 + left * 10; }
          sound(ok ? 'good' : 'bad');
          $$('.io-opt', main).forEach(x => { x.disabled = true; x.classList.add(x.dataset.k === win ? 'right' : 'wrong'); });
          $$('.io-opt', main)[0].insertAdjacentHTML('beforeend', '<div class="io-result">→ ' + fmt(Math.round(fa)) + '</div>');
          $$('.io-opt', main)[1].insertAdjacentHTML('beforeend', '<div class="io-result">→ ' + fmt(Math.round(fb)) + '</div>');
          $('#fb').innerHTML = '<div class="check-bar inline ' + (ok ? 'good' : 'bad') + '"><div class="fb-text"><b>' + (k === null ? '⏰ Time\'s up!' : ok ? 'Correct! +' + (100 + left * 10) : 'Not this time') + '</b><p>' + explain(a, b) + '</p></div><button class="btn primary block" id="nx">' + (round + 1 < ROUNDS ? 'Next round' : 'See results') + '</button></div>';
          $('#nx').onclick = () => { round++; round < ROUNDS ? show() : done(); };
        };
        $$('.io-opt', main).forEach(x => x.onclick = () => resolve(x.dataset.k));
        timer = setInterval(() => { left--; const t = $('#t'); if (t) t.textContent = left; if (left <= 0) resolve(null); }, 1000);
      }
      function explain(a, b) {
        const longer = a.t === b.t ? null : (a.t > b.t ? 'A' : 'B');
        const higher = a.r === b.r ? null : (a.r > b.r ? 'A' : 'B');
        if (longer && higher && longer === higher) return 'Option ' + longer + ' has both more time and a higher rate, a double win for compounding.';
        if (longer && higher) return 'Rate vs time: ' + higher + ' has the higher rate but ' + longer + ' has more years. Compounding rewards both.';
        if (higher) return 'Same time, so the higher rate wins unless the starting amount is much smaller.';
        if (longer) return 'Same rate, so more years of compounding usually wins.';
        return 'Same rate and time, so the bigger starting amount wins.';
      }
      function done() {
        const best = record('interest', score);
        endScreen(main, g, '<div class="big-emoji bounce">' + (best ? '🏆' : '✨') + '</div><h1>' + (best ? 'New best!' : 'Nice work!') + '</h1>' +
          '<div class="result-stats"><div><b>' + score + '</b><span>score</span></div><div><b>' + correct + '/' + ROUNDS + '</b><span>correct</span></div></div>' +
          '<p class="muted">Compound interest = time × rate × patience. Starting early is the cheat code.</p>', correct * 3 + 4);
      }
      show();
      app.onLeave(() => clearInterval(timer));
    });
  }
})(window.MQ);
