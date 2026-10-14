// Töne und Geräusche (Web Audio).
import './animals.js'; // Ladereihenfolge: dieses Modul läuft nach systems/animals.js
import { ITEMS } from '../content/catalog.js';

// ---------- Sound ----------
let AC=null;
function ac(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)();}catch(e){AC=null;}}if(AC&&AC.state==='suspended')AC.resume();return AC;}
function tone(f,d,type,vol,at,slide){const a=ac();if(!a)return;const t0=a.currentTime+(at||0),o=a.createOscillator(),g=a.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t0);if(slide)o.frequency.exponentialRampToValueAtTime(f*slide,t0+d);g.gain.setValueAtTime(vol||.1,t0);g.gain.exponentialRampToValueAtTime(.0005,t0+d+.04);o.connect(g).connect(a.destination);o.start(t0);o.stop(t0+d+.06);}
const plop=()=>tone(420,.09,'sine',.14,0,1.8);
const nopeSnd=()=>tone(180,.14,'triangle',.12,0,.7);
function honk(type){
  if(ITEMS[type].sub){tone(1400,.18,'sine',.07);tone(1400,.6,'sine',.025,.25);tone(1400,.8,'sine',.012,.6);return;}
  if(ITEMS[type].boat){tone(98,.9,'sawtooth',.07);tone(123,.9,'sawtooth',.05);return;}
  if(ITEMS[type].siren){for(let k=0;k<4;k++)tone(k%2?622:466,.36,'square',.05,k*.4);}
  else{tone(392,.38,'sawtooth',.06);tone(494,.38,'sawtooth',.05);}
}

export { ac, honk, nopeSnd, plop, tone };
