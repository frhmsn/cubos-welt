// Kurzer Hinweis oben in der Mitte (z. B. "Ab in den Eimer!"). Ohne Abhängigkeiten, darf überall importiert werden.
import { $ } from '../core/util.js';

let hintT=null;
/** Zeigt txt für ms Millisekunden (Standard 4,2 s). */
function hint(txt,ms){const h=$('#hint');h.textContent=txt;h.classList.remove('off');clearTimeout(hintT);hintT=setTimeout(()=>h.classList.add('off'),ms||4200);}

export { hint };
