// Meine Welten (Logik): speichern, öffnen, neu anlegen. Die Oberfläche dazu ist ui/worlds-menu.js.
import '../systems/travel.js'; // Ladereihenfolge: läuft nach systems/travel.js (siehe docs/ARCHITEKTUR.md)
import { exitCar, setMode } from '../ui/modes.js';
import { hint } from '../ui/hint.js';
import { plop, tone } from '../systems/audio.js';
import { sampleWorld } from '../content/sample-world.js';
import { buildCam, canvas, renderer, scene } from '../render/renderer.js';
import { bc, placeBuildCam } from '../render/build-camera.js';
import { $ } from './util.js';
import { CKEY, localStore, store } from './storage.js';
import { game } from './state.js';
import { applyData, emptyWorld, save, serialize } from './save.js';

function snapThumb(){
  try{
    placeBuildCam(); renderer.render(scene,buildCam);
    const src=renderer.domElement,c=document.createElement('canvas');c.width=240;c.height=150;
    const sw=src.width,sh=src.height,ar=240/150;let w=sw,h=sw/ar;if(h>sh){h=sh;w=sh*ar;}
    c.getContext('2d').drawImage(src,(sw-w)/2,(sh-h)/2,w,h,0,0,240,150);
    return c.toDataURL('image/jpeg',.72);
  }catch(e){return '';}
}
function newId(){return 'w_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
async function saveWorld(asNew,silent){
  if(game.saving)return null; game.saving=true;
  try{
    let list=[]; try{list=await store.list();}catch(e){list=[];}
    const existing=(!asNew&&game.curWorld)?list.find(w=>w.id===game.curWorld):null;
    let id,name;
    if(existing){id=existing.id;name=existing.name;}
    else{id=newId();const names=new Set(list.map(w=>w.name));let n=list.length+1;while(names.has('Welt '+n))n++;name='Welt '+n;}
    const w={id,name,updated:Date.now(),thumb:snapThumb(),data:JSON.stringify(serialize())};
    try{await store.put(w);}catch(e){if(store!==localStore){await localStore.put(w);}else throw e;}
    game.curWorld=id; try{localStorage.setItem(CKEY,id);}catch(e){}
    game.worldDirty=false;
    if(!silent){hint('Gespeichert: '+name,2500);tone(523,.1,'sine',.1);tone(784,.16,'sine',.1,.1);}
    return w;
  }catch(e){
    if(!silent)hint('Speichern hat nicht geklappt. Vielleicht ist der Speicher voll: lösche eine alte Welt im Menü.',5000);
    return null;
  }finally{game.saving=false;}
}
async function keepCurrent(){if(game.worldDirty)await saveWorld(false,true);}
function toBuild(){if(game.driveCar)exitCar(true);game.rideTrain=null;if(game.mode!=='build')setMode('build');}
async function openWorld(w){
  await keepCurrent(); toBuild();
  let d=null; try{d=JSON.parse(w.data);}catch(e){d=null;}
  if(!d||!applyData(d)){hint('Diese Welt konnte nicht geladen werden.',3500);return;}
  game.curWorld=w.id; try{localStorage.setItem(CKEY,w.id);}catch(e){}
  game.worldDirty=false; bc.x=0;bc.z=3;bc.d=48; save();
  $('#menu').hidden=true; plop(); hint('Willkommen in '+w.name+'!',2500);
}
async function freshWorld(kind){
  await keepCurrent(); toBuild();
  if(kind==='sample')sampleWorld();else emptyWorld();
  game.curWorld=null; try{localStorage.removeItem(CKEY);}catch(e){}
  game.worldDirty=false; save(); $('#menu').hidden=true; plop();
  hint('Neue Welt! Mit der Wolke oben speicherst du sie.',3500);
}

export { freshWorld, keepCurrent, newId, openWorld, saveWorld, snapThumb, toBuild };
