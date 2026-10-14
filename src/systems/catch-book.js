// Fangbuch: wie viele Fische jeder Art gefangen wurden, Rekordlängen und gesehene Wale.
// Hält die Daten, speichert sie im Gerät und meldet Änderungen als Ereignis.
// Ohne Abhängigkeit zu Angeln, Aquarium oder Inventar: die hören auf 'fang:geaendert' und 'wal:gesehen'.
import { FISH } from '../content/fish/index.js';
import { WHALE } from '../content/whales/index.js';
import { emit } from '../core/events.js';

// Gespeichert unter den alten Schlüsseln (nie umbenennen, sonst ist das Fangbuch leer)
let catchBook={};for(const k of Object.keys(FISH))catchBook[k]=0;try{const c=JSON.parse(localStorage.getItem('kunos-fang')||'null');if(c)catchBook=Object.assign(catchBook,c);}catch(e){}
let catchRec={};try{catchRec=JSON.parse(localStorage.getItem('kunos-fang-rekord')||'{}')||{};}catch(e){catchRec={};}
let whaleBook={};for(const k of Object.keys(WHALE))whaleBook[k]=0;try{const c=JSON.parse(localStorage.getItem('kunos-wale')||'null');if(c)whaleBook=Object.assign(whaleBook,c);}catch(e){}

/** Länge schön für Kinder: unter 1 m in cm, sonst "1,85 m". */
function fmtLen(m){return m<1?Math.round(m*100)+' cm':m.toFixed(2).replace('.',',')+' m';}

/** Neuen Fang eintragen. Rückgabe: true, wenn es ein Längenrekord ist. */
function recordCatch(type,len){
  catchBook[type]++;const rec=!catchRec[type]||len>catchRec[type];if(rec)catchRec[type]=len;
  try{localStorage.setItem('kunos-fang',JSON.stringify(catchBook));localStorage.setItem('kunos-fang-rekord',JSON.stringify(catchRec));}catch(e){}
  emit('fang:geaendert',{type});
  return rec;
}
/** Wal zum ersten Mal gesehen. */
function markWhaleSeen(type){
  whaleBook[type]++;try{localStorage.setItem('kunos-wale',JSON.stringify(whaleBook));}catch(e){}
  emit('wal:gesehen',{type});
}
/** Für Welt-Codes: Fangbuch als Daten, und Einlesen (es zählt jeweils der höhere Wert). */
function fangData(){return {c:catchBook,r:catchRec,w:whaleBook};}
function mergeFang(f){
  if(!f||typeof f!=='object')return false;let ch=false;
  for(const k of Object.keys(FISH)){const n=+((f.c||{})[k])||0;if(n>(catchBook[k]||0)){catchBook[k]=n;ch=true;}const r=+((f.r||{})[k])||0;if(r>(catchRec[k]||0)){catchRec[k]=r;ch=true;}}
  for(const k of Object.keys(WHALE)){const n=+((f.w||{})[k])||0;if(n>(whaleBook[k]||0)){whaleBook[k]=n;ch=true;}}
  if(ch){try{localStorage.setItem('kunos-fang',JSON.stringify(catchBook));localStorage.setItem('kunos-fang-rekord',JSON.stringify(catchRec));localStorage.setItem('kunos-wale',JSON.stringify(whaleBook));}catch(e){}
    emit('fang:geaendert',{});}
  return ch;
}

export { catchBook, catchRec, fangData, fmtLen, markWhaleSeen, mergeFang, recordCatch, whaleBook };
