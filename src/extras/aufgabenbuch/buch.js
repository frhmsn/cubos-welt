// Aufgabenbuch (Oberfläche): Stern-Knopf oben links, aktuelle Aufgabe als Leiste, Buch mit Kapiteln und Haken,
// Feier bei geschafften Aufgaben. Logik: logik.js. Zurzeit ausgebaut, siehe README.md.
import { $ } from '../../core/util.js';
import { game } from '../../core/state.js';
import { on } from '../../core/events.js';
import { CHAPTERS } from './kapitel/index.js';
import { ITEMS } from '../../content/catalog.js';
import { currentChapter, isDone, isUnlocked, nextTask, progressOf, stars, totalStars } from './logik.js';
import { speak } from '../../systems/speech.js';
import { ac, plop, tone } from '../../systems/audio.js';
import { thumbs } from '../../ui/inventory.js';

const SPEAKER = '<svg viewBox="0 0 24 24" fill="none" stroke="#1F2A37" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" fill="#FFC21A"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>';
let shownChapter = null;

/** Stern-Zahl und aktuelle Aufgabe oben links aktualisieren. */
function updateDock() {
  $('#questStars').textContent = stars();
  const t = nextTask();
  $('#questPill').hidden = !t || game.mode === 'edit';
  $('#questDock').hidden = game.mode === 'edit';
  if (t) $('#questPillTxt').textContent = t.text;
}

function renderBook() {
  const cur = shownChapter || currentChapter().id;
  $('#qbStars').textContent = `Du hast ${stars()} von ${totalStars()} Sternen gesammelt.`;
  const chs = $('#qbChapters'); chs.innerHTML = '';
  for (const c of CHAPTERS) {
    const n = c.tasks.filter((t) => isDone(t.id)).length, b = document.createElement('button');
    b.className = 'qch' + (c.id === cur ? ' on' : '') + (n === c.tasks.length ? ' done' : '');
    b.innerHTML = `${thumbs[c.icon] ? `<img alt="" src="${thumbs[c.icon]}">` : ''}<span>${c.title}</span><small>${n}/${c.tasks.length}</small>`;
    b.addEventListener('click', () => { ac(); plop(); shownChapter = c.id; renderBook(); speak(c.title); });
    chs.appendChild(b);
  }
  const ch = CHAPTERS.find((c) => c.id === cur), next = nextTask();
  const list = $('#qbTasks'); list.innerHTML = '';
  for (const t of ch.tasks) {
    const ok = isDone(t.id), el = document.createElement('div');
    el.className = 'qt' + (ok ? ' ok' : '') + (next && next.id === t.id ? ' next' : '');
    const cnt = t.count && !ok ? `<small>${progressOf(t)} von ${t.count}</small>` : '';
    el.innerHTML = `<div class="ck">${ok ? '✓' : ''}</div><div class="tx"><b>${t.text}</b>${ok ? '' : `<span>${t.tip}</span>`}${cnt}</div><button class="say" aria-label="Vorlesen">${SPEAKER}</button><div class="st" aria-hidden="true">★</div>`;
    el.querySelector('.say').addEventListener('click', () => { ac(); speak(ok ? t.text + ' Geschafft!' : t.text + ' ' + t.tip, { force: true }); });
    list.appendChild(el);
  }
  const bo = $('#qbBonus');
  if (ch.bonus) {
    const un = isUnlocked(ch.id), it = ITEMS[ch.bonus.item];
    bo.className = un ? '' : 'locked';
    bo.innerHTML = `${thumbs[ch.bonus.item] ? `<img alt="" src="${thumbs[ch.bonus.item]}">` : ''}<span>${un ? `Geschafft! Du hast ${ch.bonus.akk || ch.bonus.text}. Er steht bei ${it && it.kind === 'car' ? 'den Autos' : 'deinen Sachen'}.` : `Schaff alle Aufgaben in diesem Kapitel, dann bekommst du ${ch.bonus.akk || ch.bonus.text}!`}</span>`;
  } else bo.innerHTML = '';
}

function openBook() { ac(); plop(); shownChapter = null; renderBook(); $('#questBook').hidden = false; const t = nextTask(); if (t) speak('Deine nächste Aufgabe: ' + t.text); }
$('#btnQuest').addEventListener('click', openBook);
$('#questPill').addEventListener('click', () => { ac(); const t = nextTask(); if (t) speak(t.text + ' ' + t.tip, { force: true }); });
$('#qbClose').addEventListener('click', () => { $('#questBook').hidden = true; });
$('#questBook').addEventListener('click', (e) => { if (e.target.id === 'questBook') $('#questBook').hidden = true; });

// ---------- Feiern ----------
let toastT = 0, bigUntil = 0;
/** Zeigt die Feier-Karte. Eine neue ersetzt die alte; während einer Kapitel-Feier (big) werden kleine übersprungen. */
function toast(title, sub, ms, big = false) {
  const now = performance.now();
  if (!big && now < bigUntil) return;
  if (big) bigUntil = now + ms;
  $('#questToastTitle').textContent = title; $('#questToastSub').textContent = sub;
  const el = $('#questToast'); el.hidden = false; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, ms);
}
on('aufgabe:geschafft', () => {
  tone(523, .12, 'sine', .09); tone(784, .12, 'sine', .09, .12); tone(1047, .3, 'sine', .09, .24);
  const t = nextTask();
  toast('Super, ein Stern!', t ? 'Nächste Aufgabe: ' + t.text : 'Du hast alle Aufgaben geschafft!', 3200);
  speak('Super! Du hast einen Stern bekommen.' + (t ? ' Nächste Aufgabe: ' + t.text : ''));
  updateDock(); if (!$('#questBook').hidden) renderBook();
});
on('kapitel:geschafft', (d) => {
  const c = CHAPTERS.find((x) => x.id === d.chapter);
  const sub = d.bonus ? `Dein Geschenk: ${d.bonus.text}!` : 'Ein ganzes Kapitel!';
  toast(`Kapitel „${c.title}“ geschafft!`, sub, 4500, true);
  setTimeout(() => speak(`Toll! Das Kapitel ${c.title} ist geschafft. ${d.bonus ? 'Du bekommst ' + (d.bonus.akk || d.bonus.text) + '!' : ''}`), 3300);
  tone(523, .15, 'sine', .09, .4); tone(659, .15, 'sine', .09, .55); tone(784, .15, 'sine', .09, .7); tone(1047, .4, 'sine', .09, .85);
});
on('aufgaben:geladen', () => { updateDock(); if (!$('#questBook').hidden) renderBook(); });
on('modus', updateDock);
updateDock();

export { openBook, updateDock };
