// Kurzer Hinweis oben in der Mitte (z. B. "Ab in den Eimer!"). Ohne Abhängigkeiten, darf überall importiert werden.
import { $ } from '../core/util.js';
import { repeatSpeech, speak } from '../systems/speech.js';

let hintT=null;
/** Zeigt txt für ms Millisekunden (Standard 4,2 s) und liest ihn vor, wenn Vorlesen an ist. */
function hint(txt,ms,{silent=false}={}){const h=$('#hint');h.textContent=txt;h.classList.remove('off');clearTimeout(hintT);hintT=setTimeout(()=>h.classList.add('off'),Math.max(ms||4200,txt.length*75));if(!silent)speak(txt);}
// Hinweis antippen: noch einmal vorlesen
$('#hint').addEventListener('click',()=>repeatSpeech());

export { hint };
