// Töne und Geräusche (Web Audio).
import { ITEMS } from '../content/catalog.js';
import { ac } from './audio-ctx.js';

// ---------- Sound ----------
function tone(f,d,type,vol,at,slide){const a=ac();if(!a)return;const t0=a.currentTime+(at||0),o=a.createOscillator(),g=a.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t0);if(slide)o.frequency.exponentialRampToValueAtTime(f*slide,t0+d);g.gain.setValueAtTime(vol||.1,t0);g.gain.exponentialRampToValueAtTime(.0005,t0+d+.04);o.connect(g).connect(a.destination);o.start(t0);o.stop(t0+d+.06);}
const plop=()=>tone(420,.09,'sine',.14,0,1.8);
const nopeSnd=()=>tone(180,.14,'triangle',.12,0,.7);
function honk(type){
  if(ITEMS[type].sub){tone(1400,.18,'sine',.07);tone(1400,.6,'sine',.025,.25);tone(1400,.8,'sine',.012,.6);return;}
  if(ITEMS[type].boat){tone(98,.9,'sawtooth',.07);tone(123,.9,'sawtooth',.05);return;}
  if(ITEMS[type].siren){for(let k=0;k<4;k++)tone(k%2?622:466,.36,'square',.05,k*.4);}
  else{tone(392,.38,'sawtooth',.06);tone(494,.38,'sawtooth',.05);}
}

/* Zughorn: zwei tiefe, kräftige Töne wie beim echten Zug ("Dööö, düt") */
function hornNote(a,out,f,t0,dur,vol){
  const g=a.createGain(),lp=a.createBiquadFilter(),bp=a.createBiquadFilter();
  lp.type='lowpass';lp.frequency.value=f*5;lp.Q.value=.7;
  bp.type='peaking';bp.frequency.value=f*2;bp.Q.value=1.2;bp.gain.value=6;
  g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol,t0+.05);
  g.gain.setValueAtTime(vol,t0+dur-.08);g.gain.linearRampToValueAtTime(0,t0+dur+.06);
  g.connect(lp);lp.connect(bp);bp.connect(out);
  for(const [type,m,v] of [['sawtooth',1,.55],['sawtooth',1.006,.45],['square',.5,.25],['sawtooth',1.5,.12]]){
    const o=a.createOscillator(),og=a.createGain();o.type=type;
    o.frequency.setValueAtTime(f*m*.95,t0);o.frequency.exponentialRampToValueAtTime(f*m,t0+.07);
    og.gain.value=v;o.connect(og);og.connect(g);o.start(t0);o.stop(t0+dur+.1);
  }
}
function whistle(type,v){
  const a=ac();if(!a)return;v=v||1;
  const out=a.createGain();out.gain.value=.16*v;
  const comp=a.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=4;
  out.connect(comp);comp.connect(a.destination);
  const t=a.currentTime+.01;
  if(type==='ice'){hornNote(a,out,392,t,.32,1);hornNote(a,out,330,t+.4,.55,1);}
  else{hornNote(a,out,262,t,.75,1);hornNote(a,out,330,t+.85,.28,1);}
}
function chime(){tone(784,.5,'sine',.07);tone(622,.8,'sine',.07,.45);}

export { ac, chime, honk, nopeSnd, plop, tone, whistle };
