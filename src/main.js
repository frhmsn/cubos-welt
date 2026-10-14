// Startpunkt: lädt alle Module in fester Reihenfolge und startet das Spiel.
import './debug.js'; // Test-Schnittstelle (nur aktiv in Tests)
import { game } from './core/state.js';
import { hint, setMode } from './ui/modes.js';
import { saveWorld } from './ui/worlds-menu.js';
import { makeThumbs, renderCats, renderItems, select } from './ui/inventory.js';
import { load, save } from './core/save.js';
import { sampleWorld } from './content/sample-world.js';
import { renderEditTray } from './systems/editor.js';
import { frame, resize } from './core/loop.js';

// ---------- Start ----------
resize();
if(!load())sampleWorld();
setMode('build');
select('hand');
renderCats(); renderItems();
requestAnimationFrame(frame);
renderEditTray();
setTimeout(()=>{makeThumbs();renderCats();renderItems();renderEditTray();hint('Wähle unten etwas aus und tippe in die Welt. Oben rechts das Männchen: selbst durch die Stadt laufen!',6500);},60);
document.addEventListener('visibilitychange',()=>{if(document.hidden){save();if(game.worldDirty&&game.curWorld&&game.mode!=='edit')saveWorld(false,true);}});
