// Startpunkt: lädt alle Module in fester Reihenfolge und startet das Spiel.
import './systems/editor.js'; // Kern zuerst laden, in Kettenreihenfolge (tools/rechain.mjs pflegt diese Zeile)
import './debug.js'; // Test-Schnittstelle (nur aktiv in Tests)
// Bedien-Module, die nur Knöpfe verdrahten und von niemandem sonst importiert werden:
import './ui/worlds-menu.js';
import './ui/fullscreen.js';
import './ui/places.js';
import { game } from './core/state.js';
import { setMode } from './ui/modes.js';
import { makeThumbs, renderCats, renderItems, select } from './ui/inventory.js';
import { load, save } from './core/save.js';
import { sampleWorld } from './content/sample-world.js';
import { renderEditTray } from './systems/editor.js';
import { frame, resize } from './core/loop.js';
import { hint } from './ui/hint.js';
import { saveWorld } from './core/worlds.js';
import { tiles } from './core/world-data.js';

// ---------- Start ----------
resize();
if(!load())sampleWorld();
setMode('build');
select('hand');
renderCats(); renderItems();
requestAnimationFrame(frame);
renderEditTray();
setTimeout(()=>{makeThumbs();renderCats();renderItems();renderEditTray();hint(tiles.some(t=>t.o&&t.o.t==='auftragshaus')?'Im Auftragshaus bekommst du Aufträge und Taler. Tippe auf das Haus mit der goldenen Münze!':'Bau ein Auftragshaus! Du findest es unten bei den Häusern. Dort bekommst du Aufträge und Taler.',6500);},60);
document.addEventListener('visibilitychange',()=>{if(document.hidden){save();if(game.worldDirty&&game.curWorld&&game.mode!=='edit')saveWorld(false,true);}});
