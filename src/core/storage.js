// Speicherort der Welten: localStorage im Gerät (Schlüssel siehe docs/ARCHITEKTUR.md).
import { game } from './state.js';

// ---------- Meine Welten ----------
const LKEY='kunos-welten',CKEY='kunos-welt-cur';
game.curWorld = null; try{game.curWorld=localStorage.getItem(CKEY);}catch(e){}
const localStore={kind:'local',
  async list(){try{const a=JSON.parse(localStorage.getItem(LKEY)||'[]');return Array.isArray(a)?a:[];}catch(e){return [];}},
  async put(w){const a=await localStore.list();const i=a.findIndex(x=>x.id===w.id);if(i>=0)a[i]=w;else a.push(w);localStorage.setItem(LKEY,JSON.stringify(a));},
  async del(id){const a=(await localStore.list()).filter(x=>x.id!==id);localStorage.setItem(LKEY,JSON.stringify(a));}
};
// Nur noch die App (GitHub Pages): Welten liegen im Gerät. Der frühere Claude-Speicher des Artifacts ist entfernt.
const store=localStore;

export { CKEY, localStore, store };
