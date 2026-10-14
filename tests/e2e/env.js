// Wird vor dem Spiel in jede Testseite geladen: macht Zufall und Zeit vorhersagbar.
// Three.js erzeugt IDs mit Math.random; diese Aufrufe bekommen einen eigenen Strom,
// damit die Spielzufälle nicht davon abhängen, in welcher Reihenfolge Objekte entstehen.
(() => {
  const mk = (seed) => { let s = seed | 0; return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  const game = mk(12345), lib = mk(999);
  Math.random = function () {
    const st = new Error().stack || '';
    return st.includes('generateUUID') ? lib() : game();
  };
  let now = 1000;
  performance.now = () => now;
  const q = [];
  window.requestAnimationFrame = (cb) => { q.push(cb); return q.length; };
  window.cancelAnimationFrame = () => {};
  // Nur das letzte Bild eines Blocks wird wirklich gezeichnet, das spart in Swiftshader viel Zeit.
  // Three.js r128 legt render() im Konstruktor an, deshalb wird der Konstruktor beim Laden umhüllt.
  let skip = false;
  Object.defineProperty(window, 'THREE', {
    configurable: true,
    get() { return undefined; },
    set(ns) {
      Object.defineProperty(window, 'THREE', { value: ns, writable: true, configurable: true, enumerable: true });
      let R;
      Object.defineProperty(ns, 'WebGLRenderer', {
        configurable: true, enumerable: true,
        get() { return R; },
        set(C) {
          R = function (...a) { const r = new C(...a); const orig = r.render.bind(r); r.render = (...x) => (skip ? undefined : orig(...x)); return r; };
          R.prototype = C.prototype;
        },
      });
    },
  });
  window.__frames = (n, ms = 20) => {
    for (let i = 0; i < n; i++) { skip = i < n - 1; now += ms; const cbs = q.splice(0); for (const cb of cbs) cb(now); }
    skip = false;
  };
  window.__CUBO_DEBUG = true;
})();
