// Startpunkt: lädt alle Module in fester Reihenfolge und startet das Spiel.
import './systems/editor.js'; // Kern zuerst laden, in Kettenreihenfolge (tools/rechain.mjs pflegt diese Zeile)
import './debug.js'; // Test-Schnittstelle (nur aktiv in Tests)
// Bedien-Module, die nur Knöpfe verdrahten und von niemandem sonst importiert werden:
import './ui/worlds-menu.js';
import './ui/fullscreen.js';
import './ui/quest-book.js';
import { game } from './core/state.js';
import { setMode } from './ui/modes.js';
import { makeThumbs, renderCats, renderItems, select } from './ui/inventory.js';
import { load, save } from './core/save.js';
import { sampleWorld } from './content/sample-world.js';
import { renderEditTray } from './systems/editor.js';
import { frame, resize } from './core/loop.js';
import { hint } from './ui/hint.js';
import { saveWorld } from './core/worlds.js';
import { nextTask, stars } from './systems/quests.js';

// ---------- Start ----------
resize();
if(!load())sampleWorld();
setMode('build');
select('hand');
renderCats(); renderItems();
requestAnimationFrame(frame);
renderEditTray();
setTimeout(()=>{makeThumbs();renderCats();renderItems();renderEditTray();{const t=nextTask();hint(stars()===0&&t?'Oben links ist dein Aufgabenbuch. Deine erste Aufgabe: '+t.text:'Wähle unten etwas aus und tippe in die Welt. Oben rechts ist das Männchen. Damit läufst du selbst durch die Stadt!',6500);}},60);
document.addEventListener('visibilitychange',()=>{if(document.hidden){save();if(game.worldDirty&&game.curWorld&&game.mode!=='edit')saveWorld(false,true);}});
