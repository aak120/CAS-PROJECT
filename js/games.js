// Mini-games: Needs vs Wants, Scam or Legit?, Interest Showdown.
window.MQ = window.MQ || {};

(function (MQ) {
  const { $, $$, esc, money, fmt, toast, sound, shuffle } = MQ.ui;
  const ST = MQ.state;
  const app = MQ.app;

  // Game registry. games2.js adds more games to MQ.GAMES.
  const CAT_NAMES = { budgeting: 'Budgeting', saving: 'Saving', credit: 'Credit', investing: 'Investing', risk: 'Risk', safety: 'Money safety', earning: 'Taxes & income' };
  MQ.GAMES = MQ.GAMES || [];
  MQ.GAMES.unshift(
    { id: 'needs', e: '🛒', title: 'Needs vs Wants', sub: 'Rapid-fire: sort as many items as you can in 45 seconds. Build combos for bonus points!', color: '#22c55e', cat: 'budgeting', fn: (m, g) => needsGame(m, g) },
    { id: 'scam', e: '🚨', title: 'Scam Simulator', sub: 'Realistic fake messages: is it Legit, Suspicious or a Scam? Then spot the red flags.', color: '#14b8a6', cat: 'safety', fn: (m, g) => scamGame(m, g) },
    { id: 'interest', e: '✨', title: 'Interest Showdown', sub: 'Two savings options. Which one grows bigger? Think compound interest, and think fast.', color: '#8b5cf6', cat: 'saving', fn: (m, g) => interestGame(m, g) }
  );
  const GAMES = MQ.GAMES;

  app.route('play', main => {
    const S = app.S;
    const cats = Object.keys(CAT_NAMES).filter(c => GAMES.some(g => g.cat === c));
    main.innerHTML = '<h1>Play</h1><p class="sub">' + GAMES.length + ' games, each one teaching a money concept. They earn XP and boost your Literacy Score.</p>' +
      cats.map(c => '<h2 class="section">' + (MQ.adaptive ? MQ.adaptive.BY[c].e + ' ' : '') + CAT_NAMES[c] + '</h2>' + GAMES.filter(g => g.cat === c).map(g => {
        const rec = S.games[g.id] || {};
        return '<a class="card game-card" href="#/game/' + g.id + '" style="--c:' + g.color + '"><span class="emoji-tile">' + g.e + '</span><div><h3>' + g.title + '</h3><p class="muted">' + g.sub + '</p>' +
          '<div class="small">' + (rec.plays ? '🏅 Best: ' + rec.best + ' · Played ' + rec.plays + '×' : '✨ New') + '</div></div></a>';
      }).join('')).join('');
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
    g.fn(main, g);
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
          if (MQ.adaptive) MQ.adaptive.recordResult('budgeting', correct / Math.max(1, correct + wrong));
          const xp = Math.min(40, 5 + Math.round(score / 10));
          endScreen(main, g, '<div class="big-emoji bounce">' + (best ? '🏆' : '🛒') + '</div><h1>' + (best ? 'New best!' : 'Time\'s up!') + '</h1>' +
            '<div class="result-stats"><div><b>' + score + '</b><span>score</span></div><div><b>' + correct + '</b><span>correct</span></div><div><b>' + wrong + '</b><span>missed</span></div></div>' +
            '<p class="muted">Remember: a need keeps you healthy, safe and able to learn or work. Everything else is a want, and wants are fine when they fit your budget.</p>', xp);
        }
      }, 1000);
      app.onLeave(() => { clearInterval(timer); document.removeEventListener('keydown', key); });
    });
  }

  // ---------- Scam Simulator ----------
  const FLAGS = {
    urgency: 'Urgency or threats', link: 'Suspicious link / lookalike website', payment: 'Unusual payment (gift card, crypto, "fee")',
    secret: 'Asks for a PIN, OTP or password', tooGood: 'Too good to be true / guaranteed returns', stranger: 'Unexpected contact from a stranger',
    recruit: 'Pays you to recruit others', personal: 'Wants ID documents or personal details', secrecy: 'Tells you to keep it secret', overpay: 'Overpayment / "send the difference back"'
  };
  function scamPool() {
    const c = MQ.country(), IN = c.id === 'IN';
    const k = (c.first.income[0] + c.first.income[1]) / 2 / 3500;
    const A = x => fmt(MQ.roundNice(x * k));
    const bank = MQ.pick(Math.random, ['NovaBank', 'CityTrust Bank', 'Sunrise Bank', 'Harbour Bank']);
    const name = MQ.pick(Math.random, c.names);
    return [
      { type: 'Phishing', from: 'SMS · ' + bank, msg: 'Dear customer, your ' + bank + ' account will be BLOCKED today. ' + (IN ? 'Update your KYC' : 'Verify your identity') + ' now: ' + bank.toLowerCase().replace(/ /g, '') + '-secure-verify.top', v: 'scam', f: ['urgency', 'link'], ex: 'Banks do not threaten to block you by SMS with a link. The domain is not the bank\'s real website.' },
      { type: 'Phishing', from: 'SMS · +44 7700 900' + Math.floor(Math.random() * 900 + 100), msg: 'Your parcel is on hold. Pay the ' + A(2) + ' redelivery fee here: bit.ly/redlvr-' + Math.random().toString(36).slice(2, 6), v: 'scam', f: ['link', 'payment', 'stranger'], ex: 'Delivery "fee" texts with short links are designed to steal card details.' },
      { type: 'Phishing', from: 'billing@streamflix-accounts.co', msg: 'Your payment failed. Update your card within 24 hours or your account will be deleted.', v: 'scam', f: ['urgency', 'link'], ex: 'A lookalike sender plus a deadline. Open the real app yourself instead of clicking.' },
      { type: 'Fake bank call', from: 'Phone call · "' + bank + ' Fraud Team"', msg: '"We blocked a suspicious payment of ' + A(400) + '. To cancel it, read me the code we just texted you."', v: 'scam', f: ['secret', 'urgency'], ex: 'Banks NEVER ask for one-time codes. That code is how the scammer gets into your account.' },
      { type: 'Bank message', from: bank + ' app notification', msg: 'Your card was used for ' + A(25) + ' at GreenGrocer. Not you? Review it in the app.', v: 'legit', f: [], ex: 'A notification inside your real banking app with no link and no request for details is normal. Check in the app.' },
      IN ? { type: 'UPI scam', from: 'UPI collect request', msg: '"OLX buyer ' + name + '" requests ₹' + MQ.roundNice(4000 * k / 13.6).toLocaleString('en-IN') + '. Enter your UPI PIN to RECEIVE the payment.', v: 'scam', f: ['secret', 'stranger'], ex: 'You never enter a PIN to receive money. Approving this SENDS money to the scammer.' }
        : { type: 'Payment app scam', from: 'Payment app', msg: 'Marketplace buyer sent a "payment request". Tap Approve and enter your PIN to receive ' + A(150) + '.', v: 'scam', f: ['secret', 'stranger'], ex: 'Receiving money never needs your PIN or approval. Approving a request sends YOUR money.' },
      { type: 'Fake investment', from: 'DM · @crypto.mentor.' + name.toLowerCase(), msg: 'Invest ' + A(100) + ' today and I\'ll turn it into ' + A(500) + ' in 7 days. 100% guaranteed, I\'ve done it for 300 students 🚀', v: 'scam', f: ['tooGood', 'stranger'], ex: 'Guaranteed returns from a stranger online are always a scam.' },
      { type: 'Unrealistic returns', from: 'Telegram · "Premium Stock Tips VIP"', msg: '90% accurate intraday tips! Pay ' + A(50) + ' for the VIP plan and double your capital this month.', v: 'scam', f: ['tooGood', 'payment'], ex: IN ? 'Check if advisors are SEBI-registered. Nobody can promise to double your money.' : 'Nobody can reliably promise to double your money. Paid "tips" groups are a common trap.' },
      { type: 'Ponzi scheme', from: 'Group chat · Wealth Circle Club', msg: 'Earn 10% EVERY WEEK on your deposit, plus bonuses for every friend you bring in. Spots are limited!', v: 'scam', f: ['tooGood', 'recruit', 'urgency'], ex: 'Paying "returns" from new members\' money is a Ponzi scheme. It always collapses.' },
      { type: 'Pyramid scheme', from: 'Instagram DM · "Be your own boss 👑"', msg: 'Buy our ' + A(200) + ' starter kit and earn by recruiting 5 friends who each buy one too!', v: 'scam', f: ['recruit', 'payment', 'stranger'], ex: 'If you earn mainly by recruiting, not by selling to real customers, it is a pyramid scheme.' },
      { type: 'Social media scam', from: 'Instagram · @official_giveawayz_' + Math.floor(Math.random() * 99), msg: 'CONGRATS you won our iPhone giveaway 🎉 DM us your card details to pay ' + A(5) + ' shipping.', v: 'scam', f: ['payment', 'personal', 'tooGood'], ex: 'Fake giveaway accounts copy real brands. Real prizes do not need your card details.' },
      { type: 'Hacked account', from: 'DM from your friend ' + name, msg: 'omg is this you in this video?? 😳 vid-clips-share.ru/watch', v: 'scam', f: ['link'], ex: 'Hacked accounts send links like this to spread. Ask your friend another way.' },
      { type: 'Social media scam', from: 'Facebook Marketplace', msg: 'Selling 2 concert tickets 50% below face value. Pay by bank transfer to a friend\'s account only, no card payments.', v: 'suspicious', f: ['tooGood', 'payment'], ex: 'Not certainly a scam, but too cheap plus an unprotected payment method is risky. Use an official resale site.' },
      { type: 'Identity theft', from: 'Email · summer-jobs@teenhire-fasttrack.net', msg: 'You got the summer job! Before you start, send a photo of your ID, your parent\'s bank details and a selfie.', v: 'scam', f: ['personal', 'stranger'], ex: 'Real employers do not need your ID and bank details before even interviewing you. This is identity theft.' },
      { type: 'Identity theft', from: 'Pop-up survey', msg: 'Win a free phone! Just enter your full name, date of birth, home address and ID number.', v: 'scam', f: ['personal', 'tooGood'], ex: 'Those details are exactly what criminals need to open accounts in your name.' },
      { type: 'Job scam', from: 'WhatsApp · unknown number', msg: 'Students! Earn ' + A(40) + '/day just liking videos! Pay ' + A(20) + ' to activate your account.', v: 'scam', f: ['payment', 'tooGood', 'stranger'], ex: 'Real jobs pay you. They never charge an "activation" fee.' },
      { type: 'Overpayment scam', from: 'Marketplace buyer', msg: 'I sent ' + A(300) + ' extra by mistake for the bike. Please send the difference back to my mover.', v: 'scam', f: ['overpay'], ex: 'Their payment will bounce or be reversed, and the money you "sent back" is gone.' },
      { type: 'Lottery scam', from: 'Email · prizes@intl-lotto-winners.biz', msg: 'You won ' + A(50000) + '! Pay a ' + A(50) + ' processing fee to release your prize. Keep this confidential.', v: 'scam', f: ['payment', 'tooGood', 'secrecy'], ex: 'You cannot win a lottery you never entered, and real prizes never need a fee.' },
      { type: 'Romance / "wrong number"', from: 'SMS · unknown number', msg: 'Hi, is this ' + name + '? Oh sorry, wrong number 😊 You seem really nice though, want to chat?', v: 'suspicious', f: ['stranger'], ex: 'Friendly "wrong number" chats are a common opener for long investment scams. Don\'t engage.' },
      { type: 'Phishing', from: 'Email · school-fees-office@gmail.com', msg: 'Reminder: pay your term trip fee using this link to avoid losing your place.', v: 'suspicious', f: ['link', 'urgency'], ex: 'A school would normally use its official domain or portal. Check with the school directly.' },
      { type: 'Impersonation', from: 'SMS · new number', msg: 'Hi it\'s me, my phone broke so this is my new number. Can you send me ' + A(80) + ' for a taxi? I\'ll pay you back tonight!', v: 'suspicious', f: ['stranger', 'urgency'], ex: 'Classic "new number" scam. Call the old number or ask a question only they would know.' },
      { type: 'Login code', from: bank + ' (you just tried to log in)', msg: 'Your login code is ' + Math.floor(100000 + Math.random() * 899999) + '. Never share this code with anyone.', v: 'legit', f: [], ex: 'You requested it, and it tells you not to share it. Legit, as long as you keep it to yourself.' },
      { type: 'School portal', from: 'School portal (you logged in)', msg: 'Year 11 trip: payment of ' + A(60) + ' is due Friday. Pay securely in the portal.', v: 'legit', f: [], ex: 'An expected message inside an official system you logged into yourself is normal.' },
      { type: 'Receipt', from: 'School canteen app', msg: 'Top-up of ' + A(10) + ' received. Your new balance is ' + A(14) + '.', v: 'legit', f: [], ex: 'A receipt for a top-up you made yourself, asking nothing from you, is normal.' },
      { type: 'Gaming scam', from: 'Discord DM · @nitro_gift_bot', msg: 'You got a FREE Nitro gift 🎁 Claim in 10 min: discord-gift-claim.app/' + Math.random().toString(36).slice(2, 7), v: 'scam', f: ['link', 'urgency', 'stranger', 'tooGood'], ex: 'Fake "free Nitro / free skins" links steal your login. Real gifts show up inside the official app.' },
      { type: 'Gaming scam', from: 'In-game chat · xX_Trader_Xx', msg: 'Trade me your rare skin first, I\'ll send the ' + A(40) + ' after. Trust me bro, 500+ trades done', v: 'scam', f: ['stranger', 'tooGood'], ex: 'Off-platform "you go first" trades are a classic way to lose items. Only use the game\'s official trade system.' },
      { type: 'Social media scam', from: 'Instagram DM · @glowup.brand.official', msg: 'We love your page! Become our brand ambassador 💅 Just buy ' + A(30) + ' of products first and get 50% commission.', v: 'scam', f: ['payment', 'tooGood', 'stranger'], ex: 'Real brands pay ambassadors. They do not make you buy stock first.' },
      { type: 'Exam scam', from: 'Telegram channel', msg: 'Leaked board exam papers 100% real 📄 Pay ' + A(15) + ' via gift card for instant access.', v: 'scam', f: ['payment', 'tooGood'], ex: 'Leaked-paper sellers just take your money (and cheating could get you disqualified).' }
    ];
  }

  function scamGame(main, g) {
    intro(main, g, () => {
      const pool = shuffle(scamPool());
      const legit = pool.filter(x => x.v === 'legit').slice(0, 2), sus = pool.filter(x => x.v === 'suspicious').slice(0, 2), scams = pool.filter(x => x.v === 'scam').slice(0, 6);
      const rounds = shuffle(legit.concat(sus, scams)).slice(0, 8);
      let i = 0, points = 0, exact = 0, spotted = 0;
      const V = { legit: '✅ Legit', suspicious: '⚠️ Suspicious', scam: '🚩 Scam' };
      function show() {
        const r = rounds[i];
        main.innerHTML = '<div class="game-hud"><a href="#/play" class="x">✕</a><span>Message ' + (i + 1) + '/' + rounds.length + '</span><span>⭐ ' + points + '</span></div>' +
          '<div class="phone pop"><div class="phone-from">' + esc(r.from) + '</div><div class="bubble">' + esc(r.msg) + '</div></div>' +
          '<div class="verdicts"><button class="btn need" data-v="legit">✅ Legit</button><button class="btn warnbtn" data-v="suspicious">⚠️ Suspicious</button><button class="btn want" data-v="scam">🚩 Scam</button></div><div id="fb"></div>';
        $$('.verdicts .btn', main).forEach(b => b.onclick = () => verdict(r, b.dataset.v));
      }
      function verdict(r, v) {
        const ok = v === r.v, close = !ok && v !== 'legit' && r.v !== 'legit';
        points += ok ? 10 : close ? 5 : 0;
        if (ok) exact++;
        if (ok && r.v === 'scam') spotted++;
        if (MQ.adaptive) MQ.adaptive.recordAnswer('safety', ok);
        sound(ok ? 'good' : close ? 'tap' : 'bad');
        $$('.verdicts .btn', main).forEach(b => { b.disabled = true; if (b.dataset.v === r.v) b.classList.add('picked'); });
        const head = '<b>' + (ok ? 'Correct!' : close ? 'Close!' : 'Careful!') + ' This is ' + V[r.v] + '</b> <span class="tag">' + esc(r.type) + '</span>';
        if (!r.f.length) {
          $('#fb').innerHTML = '<div class="check-bar inline ' + (ok ? 'good' : 'bad') + '"><div class="fb-text">' + head + '<p>' + esc(r.ex) + '</p></div><button class="btn primary block" id="nx">' + (i + 1 < rounds.length ? 'Next message' : 'See results') + '</button></div>';
          $('#nx').onclick = next;
          return;
        }
        // Step 2: spot the red flags
        const decoys = shuffle(Object.keys(FLAGS).filter(f => !r.f.includes(f))).slice(0, Math.max(2, 5 - r.f.length));
        const chips = shuffle(r.f.concat(decoys));
        const picked = new Set();
        $('#fb').innerHTML = '<div class="card flagbox"><div class="fb-text">' + head + '</div><p class="muted small">Now tap every red flag you can see in this message:</p><div class="chips">' +
          chips.map(f => '<button class="chip" data-f="' + f + '">' + esc(FLAGS[f]) + '</button>').join('') + '</div><button class="btn primary block" id="chk">Check red flags</button></div>';
        $$('.flagbox .chip', main).forEach(c => c.onclick = () => { const f = c.dataset.f; if (picked.has(f)) picked.delete(f); else picked.add(f); c.classList.toggle('on'); });
        $('#chk').onclick = () => {
          let got = 0, wrong = 0;
          $$('.flagbox .chip', main).forEach(c => {
            const f = c.dataset.f, real = r.f.includes(f), p = picked.has(f);
            c.disabled = true;
            c.classList.toggle('right', real); c.classList.toggle('wrong', p && !real);
            if (real && p) got++; if (!real && p) wrong++;
          });
          const pts = Math.max(0, got * 3 - wrong * 2);
          points += pts;
          $('#chk').outerHTML = '<p class="small"><b>' + got + '/' + r.f.length + ' red flags spotted</b>' + (wrong ? ', ' + wrong + ' false alarm' + (wrong > 1 ? 's' : '') : '') + ' · +' + pts + '</p><p>' + esc(r.ex) + '</p><button class="btn primary block" id="nx">' + (i + 1 < rounds.length ? 'Next message' : 'See results') + '</button>';
          $('#nx').onclick = next;
        };
      }
      function next() { i++; i < rounds.length ? show() : done(); }
      function done() {
        const perfect = exact === rounds.length;
        const S = app.S;
        S.counters.scamsSpotted = (S.counters.scamsSpotted || 0) + spotted;
        record('scam', points, perfect ? { perfect: true } : {});
        endScreen(main, g, '<div class="big-emoji bounce">' + (perfect ? '🛡️' : '🕵️') + '</div><h1>' + points + ' points</h1>' +
          '<div class="result-stats"><div><b>' + exact + '/' + rounds.length + '</b><span>verdicts</span></div><div><b>' + spotted + '</b><span>scams caught</span></div><div><b>' + (S.counters.scamsSpotted) + '</b><span>all-time</span></div></div>' +
          '<p>' + (perfect ? 'Scam-proof! Nobody is fooling you.' : 'Scammers are tricky. Watch for urgency, strange links, requests for codes and anything "guaranteed".') + '</p>', exact * 3 + Math.round(points / 10));
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
        if (MQ.adaptive) MQ.adaptive.recordResult('saving', correct / ROUNDS);
        endScreen(main, g, '<div class="big-emoji bounce">' + (best ? '🏆' : '✨') + '</div><h1>' + (best ? 'New best!' : 'Nice work!') + '</h1>' +
          '<div class="result-stats"><div><b>' + score + '</b><span>score</span></div><div><b>' + correct + '/' + ROUNDS + '</b><span>correct</span></div></div>' +
          '<p class="muted">Compound interest = time × rate × patience. Starting early is the cheat code.</p>', correct * 3 + 4);
      }
      show();
      app.onLeave(() => clearInterval(timer));
    });
  }
  MQ.gameKit = { record, intro, endScreen };
})(window.MQ);
