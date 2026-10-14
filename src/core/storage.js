// Speicherort der Welten: Claude-Speicher im Artifact oder localStorage in der App.
import '../ui/modes.js'; // Ladereihenfolge: dieses Modul läuft nach ui/modes.js
import { game } from './state.js';
import { $ } from './util.js';
import { renderWorlds } from '../ui/worlds-menu.js';

// ---------- Meine Welten ----------
const LKEY='kunos-welten',CKEY='kunos-welt-cur';
game.curWorld = null; try{game.curWorld=localStorage.getItem(CKEY);}catch(e){}
game.worldDirty = false; game.saving = false; game.worldCache = [];
const localStore={kind:'local',
  async list(){try{const a=JSON.parse(localStorage.getItem(LKEY)||'[]');return Array.isArray(a)?a:[];}catch(e){return [];}},
  async put(w){const a=await localStore.list();const i=a.findIndex(x=>x.id===w.id);if(i>=0)a[i]=w;else a.push(w);localStorage.setItem(LKEY,JSON.stringify(a));},
  async del(id){const a=(await localStore.list()).filter(x=>x.id!==id);localStorage.setItem(LKEY,JSON.stringify(a));}
};
let store=localStore;
(async()=>{
  try{
    if(!window.claude||typeof window.claude.use!=='function')return;
    const [db,user]=await Promise.all([window.claude.use('db'),window.claude.use('user')]);
    if(!db||!user)return;
    const uid=await user.id(); if(!uid)return;
    const col=db.collection('data/users/'+uid);
    store={kind:'db',
      async list(){const s=await col.get();return s.docs.filter(d=>d.exists&&d.id.indexOf('w_')===0).map(d=>Object.assign({},d.data(),{id:d.id}));},
      async put(w){const body={name:w.name,updated:w.updated,thumb:w.thumb,data:w.data};await col.doc(w.id).set(body);},
      async del(id){await col.doc(id).delete();}
    };
    const loc=await localStore.list();
    if(loc.length){let ok=true;for(const w of loc){try{await store.put(w);}catch(e){ok=false;}}if(ok){try{localStorage.removeItem(LKEY);}catch(e){}}}
    if(!$('#menu').hidden)renderWorlds();
  }catch(e){store=localStore;}
})();

export { CKEY, localStore, store };
