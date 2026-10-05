// Small UI helpers: toasts, celebrations, confetti, sounds and formatting.
window.MQ = window.MQ || {};

(function (MQ) {
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function cur() { return (MQ.state.get() && MQ.state.get().settings.currency) || '$'; }
  // Swap "$" amounts in content text for the player's currency symbol.
  function money(text) { const c = cur(); return c === '$' ? text : String(text).replace(/\$(?=\d)/g, c); }
  function fmt(n, decimals) {
    const d = decimals === undefined ? (Math.abs(n) < 100 && n % 1 !== 0 ? 2 : 0) : decimals;
    const s = Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
    return (n < 0 ? '−' : '') + cur() + s;
  }
  function pct(n, d) { return (n >= 0 ? '+' : '−') + Math.abs(n * 100).toFixed(d === undefined ? 1 : d) + '%'; }

  // ---------- Toasts ----------
  function toast(text, kind) {
    let box = $('#toasts');
    if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
    const el = document.createElement('div');
    el.className = 'toast ' + (kind || '');
    el.textContent = text;
    box.appendChild(el);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => el.classList.add('out'), 2600);
    setTimeout(() => el.remove(), 3000);
  }

  // ---------- Modal ----------
  function modal(html, opts) {
    closeModal();
    const wrap = document.createElement('div');
    wrap.className = 'modal-wrap';
    wrap.innerHTML = '<div class="modal" role="dialog" aria-modal="true">' + html + '</div>';
    if (!(opts && opts.sticky)) wrap.addEventListener('click', e => { if (e.target === wrap) closeModal(); });
    document.body.appendChild(wrap);
    $$('[data-close]', wrap).forEach(b => b.addEventListener('click', closeModal));
    return wrap;
  }
  function closeModal() { $$('.modal-wrap').forEach(m => m.remove()); }

  function celebrate(title, sub) {
    confetti();
    sound('level');
    modal('<div class="celebrate"><div class="big-emoji bounce">🎉</div><h2>' + esc(title) + '</h2><p>' + esc(sub || '') + '</p><button class="btn primary block" data-close>Awesome!</button></div>');
  }

  // ---------- Confetti ----------
  function confetti() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = document.createElement('canvas');
    c.className = 'confetti';
    document.body.appendChild(c);
    const ctx = c.getContext('2d');
    const W = c.width = innerWidth, H = c.height = innerHeight;
    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#facc15'];
    const parts = Array.from({ length: 120 }, () => ({
      x: W / 2 + (Math.random() - 0.5) * 80, y: H / 3, vx: (Math.random() - 0.5) * 12, vy: -Math.random() * 12 - 4,
      s: 4 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: colors[(Math.random() * colors.length) | 0]
    }));
    let frame = 0;
    (function tick() {
      ctx.clearRect(0, 0, W, H);
      parts.forEach(p => {
        p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6); ctx.restore();
      });
      if (++frame < 140) requestAnimationFrame(tick); else c.remove();
    })();
  }

  // ---------- Sound (tiny synth beeps, no audio files) ----------
  let actx;
  function sound(kind) {
    const S = MQ.state.get();
    if (!S || !S.settings.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const notes = { good: [660, 880], bad: [220, 160], level: [523, 659, 784, 1047], tap: [440], coin: [988, 1319] }[kind] || [440];
      notes.forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = kind === 'bad' ? 'sawtooth' : 'triangle';
        o.frequency.value = f;
        const t = actx.currentTime + i * 0.09;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
        o.connect(g).connect(actx.destination);
        o.start(t); o.stop(t + 0.18);
      });
    } catch (e) { /* audio not available */ }
    if (navigator.vibrate && (kind === 'bad' || kind === 'good')) navigator.vibrate(kind === 'bad' ? [40, 40, 40] : 15);
  }

  // ---------- Progress ring (SVG) ----------
  function ring(p, size, label, color) {
    const r = (size - 10) / 2, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(1, p)));
    return '<svg class="ring" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" class="ring-bg"/>' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" class="ring-fg" style="stroke:' + (color || 'var(--accent)') + '" stroke-dasharray="' + c + '" stroke-dashoffset="' + off + '" transform="rotate(-90 ' + size / 2 + ' ' + size / 2 + ')"/>' +
      '<text x="50%" y="50%" dominant-baseline="central" text-anchor="middle">' + label + '</text></svg>';
  }

  // ---------- Line chart on canvas ----------
  function lineChart(canvas, series, opts) {
    opts = opts || {};
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 300, h = canvas.clientHeight || 140;
    canvas.width = w * dpr; canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    const all = series.flatMap(s => s.data);
    if (all.length < 2) return;
    let min = Math.min.apply(null, all), max = Math.max.apply(null, all);
    if (opts.baseline !== undefined) { min = Math.min(min, opts.baseline); max = Math.max(max, opts.baseline); }
    const pad = (max - min) * 0.1 || 1; min -= pad; max += pad;
    const n = Math.max.apply(null, series.map(s => s.data.length));
    const X = i => (i / Math.max(1, (opts.length || n) - 1)) * (w - 4) + 2;
    const Y = v => h - 4 - ((v - min) / (max - min)) * (h - 8);
    const css = getComputedStyle(document.documentElement);
    if (opts.baseline !== undefined) {
      ctx.strokeStyle = css.getPropertyValue('--line').trim() || '#ccc';
      ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, Y(opts.baseline)); ctx.lineTo(w, Y(opts.baseline)); ctx.stroke();
      ctx.setLineDash([]);
    }
    series.forEach(s => {
      ctx.strokeStyle = s.color; ctx.lineWidth = s.width || 2.5; ctx.lineJoin = 'round';
      ctx.beginPath();
      s.data.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))));
      ctx.stroke();
      if (s.fill) {
        ctx.lineTo(X(s.data.length - 1), h); ctx.lineTo(X(0), h); ctx.closePath();
        ctx.globalAlpha = 0.12; ctx.fillStyle = s.color; ctx.fill(); ctx.globalAlpha = 1;
      }
    });
  }

  function shuffle(a, r) { a = a.slice(); r = r || Math.random; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  MQ.ui = { $, $$, esc, money, fmt, pct, toast, modal, closeModal, celebrate, confetti, sound, ring, lineChart, shuffle };
})(window.MQ);
