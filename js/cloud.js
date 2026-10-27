// Research backend client (Supabase REST, no library needed).
// Nothing is sent unless the player has opted in, and never a name: only a random device ID,
// scores, survey answers, country, age band and class code. If Supabase isn't set up yet, or the
// device is offline, submissions wait in a small queue and are sent later.
window.MQ = window.MQ || {};

(function (MQ) {
  const ST = MQ.state;
  const C = MQ.CONFIG || {};
  const MAX_QUEUE = 60;

  function enabled() { return !!(C.supabaseUrl && C.supabaseKey); }
  function R() {
    const S = ST.get();
    S.research = S.research || {};
    const r = S.research;
    if (!r.anonId) r.anonId = uuid();
    if (!r.queue) r.queue = [];
    return r;
  }
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    const b = new Uint8Array(16);
    (window.crypto || {}).getRandomValues ? crypto.getRandomValues(b) : b.forEach((_, i) => b[i] = Math.random() * 256);
    b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    const h = Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
    return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
  }
  function headers() {
    const h = { apikey: C.supabaseKey, 'Content-Type': 'application/json' };
    // Legacy anon keys are JWTs and also go in Authorization; new publishable keys don't.
    if (/^eyJ/.test(C.supabaseKey)) h.Authorization = 'Bearer ' + C.supabaseKey;
    return h;
  }
  function base() { return C.supabaseUrl.replace(/\/+$/, '') + '/rest/v1/'; }

  async function rpc(fn, params) {
    if (!enabled()) throw new Error('offline-mode');
    const res = await fetch(base() + 'rpc/' + fn, { method: 'POST', headers: headers(), body: JSON.stringify(params || {}) });
    const text = await res.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch (e) { body = text; }
    if (!res.ok) throw new Error((body && body.message) || ('HTTP ' + res.status));
    return body;
  }
  async function insert(table, row) {
    const res = await fetch(base() + table, { method: 'POST', headers: Object.assign({ Prefer: 'return=minimal' }, headers()), body: JSON.stringify(row) });
    // 409 = already sent (e.g. a retry after a dropped connection), which counts as done.
    if (!res.ok && res.status !== 409) {
      const err = new Error('HTTP ' + res.status);
      err.permanent = res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429;
      throw err;
    }
  }

  // Every row gets the device ID and context; never a name.
  function context() {
    const S = ST.get(), r = R();
    return { anon_id: r.anonId, country: (S.settings.country || 'GL').slice(0, 2), age_band: r.ageBand || 'na', class_code: r.classCode || null };
  }
  function send(table, row) {
    const r = R();
    if (!r.consent) return;
    const full = Object.assign(context(), row);
    if (table === 'test_results') delete full.age_band;
    r.queue.push({ table, row: full });
    while (r.queue.length > MAX_QUEUE) r.queue.shift();
    ST.save();
    flush();
  }
  let flushing = false;
  async function flush() {
    const r = R();
    if (!enabled() || flushing || !r.queue.length || !navigator.onLine) return;
    flushing = true;
    try {
      while (r.queue.length) {
        const item = r.queue[0];
        try { await insert(item.table, item.row); }
        catch (e) { if (!e.permanent) break; } // keep it for later unless the server rejected it for good
        r.queue.shift();
        ST.save();
      }
    } finally { flushing = false; }
  }
  // Turning sharing off drops anything not yet sent; "forget me" also deletes what was sent.
  function setConsent(on) { const r = R(); r.consent = !!on; if (!on) r.queue = []; ST.save(); if (on) flush(); }
  async function forgetMe() {
    const r = R();
    let n = 0;
    if (enabled()) n = await rpc('forget_me', { p_anon: r.anonId });
    r.anonId = uuid(); r.queue = []; r.consent = false;
    ST.save();
    return n;
  }

  window.addEventListener('online', () => flush());
  document.addEventListener('DOMContentLoaded', () => setTimeout(flush, 1500));

  MQ.cloud = { enabled, rpc, send, flush, research: R, setConsent, forgetMe };
})(window.MQ);
