// Aufgabenbuch (Logik): hört auf Spiel-Ereignisse, zählt Fortschritt, vergibt Sterne und schaltet Boni frei.
// Ohne Oberfläche und ohne Grafik, deshalb in Node testbar (tests/unit/quests.test.js).
// Oberfläche: buch.js. Inhalte: kapitel/. Zurzeit ausgebaut, siehe README.md.
import { on, emit } from '../../core/events.js';
import { ALL_TASKS, CHAPTERS } from './kapitel/index.js';

const KEY = 'cubos-aufgaben';
let state = { done: {}, cnt: {} };
try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && s.done) state = { done: s.done, cnt: s.cnt || {} }; } catch (e) {}
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };

const chapterDone = (c) => c.tasks.every((t) => state.done[t.id]);
/** Sterne gesamt (einer pro erledigter Aufgabe). */
const stars = () => ALL_TASKS.filter((t) => state.done[t.id]).length;
const totalStars = () => ALL_TASKS.length;
/** Ist das Kapitel mit dieser ID geschafft? (für Bonus-Dinge mit bonus: '<kapitel>') */
const isUnlocked = (chapterId) => { const c = CHAPTERS.find((x) => x.id === chapterId); return !!c && chapterDone(c); };
/** Aktuelles Kapitel: das erste, das noch nicht fertig ist (sonst das letzte). */
const currentChapter = () => CHAPTERS.find((c) => !chapterDone(c)) || CHAPTERS[CHAPTERS.length - 1];
/** Nächste offene Aufgabe im aktuellen Kapitel, oder null, wenn alles geschafft ist. */
const nextTask = () => { const c = currentChapter(); const t = c.tasks.find((x) => !state.done[x.id]); return t ? { ...t, chapter: c.id } : null; };
const isDone = (taskId) => !!state.done[taskId];
const progressOf = (task) => Math.min(state.cnt[task.id] || 0, task.count || 1);

function complete(task) {
  state.done[task.id] = true; persist();
  const c = CHAPTERS.find((x) => x.id === task.chapter);
  emit('aufgabe:geschafft', { chapter: c.id, task: task.id, stars: stars() });
  if (chapterDone(c)) emit('kapitel:geschafft', { chapter: c.id, bonus: c.bonus || null });
}

// Für jedes Ereignis, auf das irgendeine Aufgabe hört, einen Empfänger anmelden
for (const ev of new Set(ALL_TASKS.map((t) => t.on))) {
  on(ev, (d = {}) => {
    for (const t of ALL_TASKS) {
      if (t.on !== ev || state.done[t.id]) continue;
      if (t.when && !t.when(d)) continue;
      state.cnt[t.id] = (state.cnt[t.id] || 0) + 1;
      if (state.cnt[t.id] >= (t.count || 1)) complete(t); else persist();
    }
  });
}

/** Für Welt-Codes: Fortschritt mitnehmen und beim Einfügen zusammenführen (erledigt bleibt erledigt). */
const questData = () => ({ done: state.done, cnt: state.cnt });
function mergeQuests(q) {
  if (!q || typeof q !== 'object') return false;
  let ch = false;
  for (const t of ALL_TASKS) {
    if (q.done && q.done[t.id] && !state.done[t.id]) { state.done[t.id] = true; ch = true; }
    const n = +((q.cnt || {})[t.id]) || 0; if (n > (state.cnt[t.id] || 0)) { state.cnt[t.id] = n; ch = true; }
  }
  if (ch) { persist(); emit('aufgaben:geladen', {}); }
  return ch;
}

export { currentChapter, isDone, isUnlocked, mergeQuests, nextTask, progressOf, questData, stars, totalStars };
