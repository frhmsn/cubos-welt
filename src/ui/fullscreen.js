// Vollbild-Knopf.
import { $ } from '../core/util.js';
import { ac } from '../systems/audio.js';
import { hint } from './modes.js';
import { resize } from '../core/loop.js';

const ICON_FULL='<svg viewBox="0 0 24 24" fill="none" stroke="#1F2A37" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>';
const ICON_SMALL='<svg viewBox="0 0 24 24" fill="none" stroke="#1F2A37" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5"/></svg>';
const fsElement=()=>document.fullscreenElement||document.webkitFullscreenElement||null;
function updFs(){$('#btnFull').innerHTML=fsElement()?ICON_SMALL:ICON_FULL;setTimeout(resize,120);}
if(navigator.standalone||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||(window.matchMedia&&matchMedia('(display-mode: fullscreen)').matches))$('#btnFull').hidden=true;
document.addEventListener('fullscreenchange',updFs);document.addEventListener('webkitfullscreenchange',updFs);
$('#btnFull').addEventListener('click',()=>{
  ac();
  const de=document.documentElement,can=document.fullscreenEnabled||document.webkitFullscreenEnabled;
  const no=()=>hint('Vollbild ist in der Claude-App gesperrt. Nutze die Web-Version vom Home-Bildschirm, dann läuft das Spiel randlos.',6500);
  try{
    if(fsElement()){(document.exitFullscreen||document.webkitExitFullscreen).call(document);return;}
    if(!can)return no();
    const fn=de.requestFullscreen||de.webkitRequestFullscreen; if(!fn)return no();
    const r=fn.call(de); if(r&&r.catch)r.catch(no);
  }catch(e){no();}
});
