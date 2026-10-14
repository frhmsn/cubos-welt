// Speichern anstoßen, ohne core/save.js zu importieren (das würde einen Import-Zyklus bilden).
// core/save.js meldet beim Start seine Speicherfunktion an.
import { game } from './state.js';

let saveT=null, saver=null;
/** Wird einmal von core/save.js aufgerufen. */
function setSaver(fn){saver=fn;}
/** Speichert die aktuelle Welt 0,6 s nach der letzten Änderung. */
function saveSoon(){clearTimeout(saveT);saveT=setTimeout(()=>saver&&saver(),600);game.dirty=false;game.worldDirty=true;}

export { saveSoon, setSaver };
