// Spielszenarien für den Regressionstest. Jedes Szenario spielt einen typischen Ablauf
// durch und hält Zwischenstände als Fingerabdruck (fp) und als Screenshot fest.
// Alle Szenarien laufen gegen die Test-Schnittstelle window.__cubo.

const api = (page, name, ...args) => page.evaluate(([n, a]) => window.__cubo[n](...a), [name, args]);
const frames = (page, n) => page.evaluate((k) => window.__cubo.frames(k), n);
const click = (page, sel) => page.evaluate((s) => { const e = document.querySelector(s); if (!e) throw new Error('fehlt: ' + s); e.click(); }, sel);
async function place(page, id, cells) { await api(page, 'sel', id); for (const [i, j] of cells) await api(page, 'tap', i, j); }
async function cam(page, i, j, d, yaw) { const c = await api(page, 'center', i, j); await api(page, 'setCam', c.x, c.z, d, yaw); }
async function hold(page, key, n) { await page.keyboard.down(key); await frames(page, n); await page.keyboard.up(key); }
const line = (i0, i1, j) => Array.from({ length: i1 - i0 + 1 }, (_, k) => [i0 + k, j]);
const col = (i, j0, j1) => Array.from({ length: j1 - j0 + 1 }, (_, k) => [i, j0 + k]);
const rect = (i0, i1, j0, j1) => { const r = []; for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) r.push([i, j]); return r; };

export const scenarios = {
  async start({ page, snap }) {
    await frames(page, 90);
    await snap('beispielstadt');
    await frames(page, 600);
    await snap('nach-10s');
  },

  async bauen({ page, snap }) {
    await api(page, 'emptyWorld');
    await place(page, 'strasse', [...line(2, 17, 5), ...col(9, 0, 19)]);
    await place(page, 'haus', [[3, 4], [5, 6]]);
    await place(page, 'villa', [[7, 4]]);
    await place(page, 'hochhaus', [[11, 6]]);
    await place(page, 'feuerwache', [[13, 4]]);
    await place(page, 'garage', [[15, 6]]);
    await place(page, 'laterne', [[4, 6], [12, 4]]);
    await place(page, 'baum', [[1, 1], [2, 2]]);
    await place(page, 'tanne', [[3, 1]]);
    await place(page, 'blumen', [[4, 1]]);
    await place(page, 'berg', [[17, 17]]);
    await place(page, 'lagerfeuer', [[6, 2]]);
    await place(page, 'lambo', [[2, 5]]);
    await place(page, 'bus', [[16, 5]]);
    await place(page, 'hund', [[6, 8]]);
    await place(page, 'kuh', [[3, 9]]);
    await place(page, 'wasser', rect(12, 15, 12, 15));
    await place(page, 'fx_karpfen', [[13, 13]]);
    await place(page, 'aquarium', [[5, 15]]);
    await place(page, 'radierer', [[2, 2]]);
    await frames(page, 30);
    await cam(page, 9, 9, 70);
    await frames(page, 60);
    await snap('gebaut');
    await place(page, 'groesser', [[0, 0]]);
    await frames(page, 30);
    await snap('groesser');
  },

  async laufen({ page, snap }) {
    await cam(page, 7, 7, 40);
    await api(page, 'startWalk');
    await frames(page, 20);
    await snap('start');
    await hold(page, 'w', 90);
    await hold(page, 'a', 30);
    await hold(page, 'w', 60);
    await snap('gelaufen');
  },

  async fahren({ page, snap }) {
    await api(page, 'emptyWorld');
    await place(page, 'strasse', [...line(1, 18, 9), ...col(9, 1, 18)]);
    await place(page, 'ferrari', [[3, 9]]);
    await frames(page, 10);
    await api(page, 'enterCar', 'ferrari');
    await frames(page, 20);
    await snap('eingestiegen');
    await hold(page, 'w', 120);
    await hold(page, 'd', 25);
    await hold(page, 'w', 60);
    await snap('gefahren');
    await api(page, 'exitCar');
    await frames(page, 20);
    await snap('ausgestiegen');
  },

  async zug({ page, snap }) {
    await frames(page, 30);
    await place(page, 'zug', [[7, 1]]);
    await frames(page, 30);
    await cam(page, 10, 2, 45);
    await snap('zug-steht');
    await frames(page, 900);
    await snap('nach-15s');
    await api(page, 'rideFirstTrain');
    await frames(page, 400);
    await snap('mitfahren');
  },

  async werkstatt({ page, snap }) {
    await api(page, 'emptyWorld');
    await place(page, 'strasse', line(2, 17, 11));
    await place(page, 'eigen', [[9, 10]]);
    await api(page, 'openEditor', 9, 10);
    await frames(page, 10);
    for (const [x, y] of [[590, 420], [590, 380], [640, 420], [540, 420], [590, 340]]) { await api(page, 'editTap', x, y); await frames(page, 2); }
    await frames(page, 10);
    await snap('in-der-werkstatt');
    await api(page, 'closeEditor');
    await frames(page, 30);
    await cam(page, 9, 10, 26);
    await frames(page, 30);
    await snap('haus-in-der-welt');
  },

  async reise({ page, snap }) {
    await api(page, 'emptyWorld');
    await place(page, 'schiene', line(2, 12, 10));
    await place(page, 'bahnhof', [[4, 10]]);
    await place(page, 'tunnel', [[13, 10]]);
    await place(page, 'zug', [[6, 10]]);
    await frames(page, 30);
    await api(page, 'rideFirstTrain');
    for (let k = 0; k < 80; k++) {
      if ((await page.evaluate(() => window.__cubo.fp().ui.travel))) break;
      await frames(page, 15);
    }
    await snap('am-tunnel');
    await click(page, '#tvNewEmpty');
    await frames(page, 120);
    await snap('neue-welt');
  },

  async inseln({ page, snap }) {
    await api(page, 'islandWorld');
    await frames(page, 60);
    await snap('inselwelt');
    await api(page, 'emptyWorld');
    await place(page, 'meer', rect(0, 19, 0, 19));
    await place(page, 'insel', [...rect(6, 9, 7, 10), [10, 9], [11, 9], [12, 10]]);
    await cam(page, 9, 9, 40);
    await frames(page, 30);
    await snap('mit-pinsel-gemalt');
  },

  async aufgaben({ page, snap }) {
    await api(page, 'emptyWorld');
    await frames(page, 10);
    await snap('start');
    await place(page, 'strasse', line(4, 12, 9));
    await place(page, 'haus', [[6, 8]]);
    await frames(page, 20);
    await snap('zwei-sterne');
    await place(page, 'baum', [[3, 3], [4, 3]]);
    await place(page, 'lambo', [[8, 9]]);
    await api(page, 'startWalk');
    await frames(page, 10);
    await api(page, 'enterCar', 'lambo');
    await frames(page, 10);
    await click(page, '#btnHonk');
    await frames(page, 10);
    await snap('kapitel-geschafft');
    await api(page, 'exitCar');
    await api(page, 'setMode', 'build');
    await page.evaluate(() => document.querySelector('#questToast').hidden = true);
    await click(page, '#btnQuest');
    await frames(page, 5);
    await snap('aufgabenbuch');
    await click(page, '#qbClose');
    await page.evaluate(() => { const b = [...document.querySelectorAll('#cats button')].find((x) => /Autos/.test(x.textContent)); b && b.click(); });
    await frames(page, 5);
    await snap('gold-lambo-im-inventar');
  },

  async faehre({ page, snap }) {
    await place(page, 'faehre', [[10, 18]]);
    await frames(page, 60);
    await cam(page, 10, 17, 50);
    await snap('faehre');
    await frames(page, 1200);
    await snap('nach-20s');
  },

  async angeln({ page, snap }) {
    await place(page, 'boot', [[6, 18]]);
    await place(page, 'fx_thunfisch', [[6, 19], [5, 19]]);
    await frames(page, 30);
    await api(page, 'enterCar', 'boot');
    await frames(page, 30);
    await snap('im-boot');
    await click(page, '#btnFish');
    await frames(page, 100);
    await snap('angel-draussen');
    // Warten, bis ein Fisch beißt (zufällig, spätestens nach einigen Sekunden), dann einholen
    for (let k = 0; k < 60; k++) {
      if ((await page.evaluate(() => window.__cubo.fp().fishing)) === 'bite') break;
      await frames(page, 10);
    }
    await click(page, '#btnFish');
    await frames(page, 300);
    await snap('nach-einholen');
  },

  async uboot({ page, snap }) {
    await place(page, 'uboot', [[4, 18]]);
    await place(page, 'fx_hai', [[4, 19]]);
    await frames(page, 30);
    await api(page, 'enterCar', 'uboot');
    await frames(page, 30);
    await click(page, '#btnDive');
    await frames(page, 180);
    await snap('unter-wasser');
    await hold(page, 'w', 90);
    await snap('getaucht');
    await click(page, '#btnDive');
    await frames(page, 180);
    await snap('aufgetaucht');
  },

  async aquarium({ page, snap }) {
    await api(page, 'emptyWorld');
    await api(page, 'setCatch', { barsch: 4, hecht: 2, karpfen: 3, wels: 1, stoer: 2, thunfisch: 5, hai: 2, makrele: 3, marlin: 1, mondfisch: 1 });
    await place(page, 'strasse', line(2, 17, 13));
    await place(page, 'aquarium', [[9, 9]]);
    await frames(page, 30);
    await cam(page, 9, 9, 30);
    await frames(page, 30);
    await snap('aussen');
    await api(page, 'startWalk');
    await frames(page, 30);
    await snap('vor-der-tuer');
    const c = await api(page, 'center', 9, 9);
    await api(page, 'setPl', c.x, c.z + 4.2, 0);
    await frames(page, 120);
    await snap('drinnen');
    await page.waitForTimeout(5200);
    await frames(page, 5);
    await snap('drinnen-knopf');
    await api(page, 'setMode', 'build');
    await place(page, 'radierer', [[10, 10]]);
    await frames(page, 10);
    await snap('abgebaut');
  },

  async wale({ page, snap }) {
    await api(page, 'emptyWorld');
    await place(page, 'meer', rect(0, 19, 0, 11));
    await frames(page, 1500);
    await cam(page, 9, 5, 80);
    await snap('meer-mit-walen');
  },

  async nacht({ page, snap }) {
    await click(page, '#btnTime');
    await frames(page, 400);
    await cam(page, 9, 9, 55);
    await frames(page, 20);
    await snap('nacht');
  },

  async welten({ page, snap }) {
    await click(page, '#btnMenu');
    await page.waitForTimeout(300);
    await click(page, '#mSaveNew');
    await page.waitForTimeout(600);
    await click(page, '#mEmpty');
    await page.waitForTimeout(600);
    await place(page, 'haus', [[5, 5]]);
    await click(page, '#btnMenu');
    await page.waitForTimeout(300);
    await click(page, '#mSaveNew');
    await page.waitForTimeout(600);
    await api(page, 'setCatch', { hai: 2, marlin: 1 });
    await click(page, '#mExportAll');
    await page.waitForFunction(() => document.querySelector('#codeTxt').value.length > 20, null, { polling: 100 });
    const code = await page.evaluate(() => document.querySelector('#codeTxt').value);
    await snap('menue');
    // Code in leeren Speicher einfügen
    await page.evaluate(() => { localStorage.clear(); });
    await click(page, '#mImport');
    await page.evaluate((c) => { document.querySelector('#codeTxt').value = c; document.querySelector('#codeGo').click(); }, code);
    await page.waitForTimeout(1500);
    await frames(page, 5);
    await snap('importiert', { worlds: await page.evaluate(() => JSON.parse(localStorage.getItem('kunos-welten') || '[]').map((w) => w.name)) });
  },
};
