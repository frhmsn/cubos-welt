// Katalog aller baubaren Dinge (ITEMS) und der Inventar-Kategorien (CATS).
import { FISH_LIST } from './fish/index.js';
import { VEHICLE_LIST, vehicleItem } from './vehicles/index.js';
import { ANIMAL_LIST, animalItem } from './animals/index.js';
import { BUILDING_LIST, buildingItem } from './buildings/index.js';

// ---------- Katalog ----------
const ITEMS={
  hand:{kind:'tool',label:'Schauen'}, radierer:{kind:'tool',label:'Weg damit',paint:true},
  gras:{kind:'ground',label:'Wiese',paint:true}, sand:{kind:'ground',label:'Sand',paint:true},
  wasser:{kind:'ground',label:'Wasser',paint:true}, strasse:{kind:'ground',label:'Straße',paint:true},
  groesser:{kind:'action',label:'Welt größer',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="#1F2A37" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="7.5" y="7.5" width="9" height="9" rx="1.5" fill="#8FD46A"/><path d="M3 8V3h5M16 3h5v5M21 16v5h-5M8 21H3v-5"/></svg>'},
  eigen:{kind:'obj',label:'Selbst bauen',house:true}, teil:{kind:'part',label:'',house:true},
  schiene:{kind:'ground',label:'Gleis',paint:true}, bahnhof:{kind:'ground',label:'Bahnhof'}, uebergang:{kind:'ground',label:'Bahnübergang'},
  tunnel:{kind:'ground',label:'Tunnel'}, zug:{kind:'train',label:'Regionalzug',speed:5.5}, ice:{kind:'train',label:'Schnellzug',speed:8.5},
  anleger:{kind:'ground',label:'Anleger'}, seetor:{kind:'ground',label:'Seetor'}, faehre:{kind:'ferry',label:'Fähre'},
  meer:{kind:'ground',label:'Meer',paint:true},
  insel:{kind:'tool',label:'Insel-Pinsel',paint:true,icon:'<svg viewBox="0 0 24 24" fill="none" stroke="#1F2A37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18c2.5 1.5 5 1.5 7.5 0s5-1.5 7.5 0 3.5 1 5 0" stroke="#2F7FD0"/><ellipse cx="12" cy="13.5" rx="7.5" ry="3" fill="#F2DFA0" stroke="#C9A65A"/><ellipse cx="12" cy="12.5" rx="5" ry="2.2" fill="#7CC75A" stroke="#4E9A3A"/><path d="M14 12.5V5" stroke="#7A5232"/><path d="M14 5c-2-1.5-4.5-1-5.5.5M14 5c2-1.5 4.5-1 5.5.5M14 5c-.5-2 .5-3.5 2-4" stroke="#3E9B4F" stroke-width="2.2"/></svg>'},
};
// Gebäude, Pflanzen, Lichter: ein Eintrag je Datei aus content/buildings/
for(const b of BUILDING_LIST)ITEMS[b.id]=buildingItem(b);
// Fahrzeuge und Tiere: ein Eintrag je Datei aus content/vehicles/ und content/animals/
for(const v of VEHICLE_LIST)ITEMS[v.id]=vehicleItem(v);
for(const a of ANIMAL_LIST)ITEMS[a.id]=animalItem(a);
// Fische zum Aussetzen: ein Eintrag je Art aus content/fish/
for(const f of FISH_LIST)ITEMS['fx_'+f.id]={kind:'fish',fish:f.id,label:f.label};
const CATS=[
  {id:'land',label:'Land',icon:'strasse',items:['strasse','gras','sand','wasser','insel','groesser']},
  {id:'natur',label:'Natur',icon:'baum',items:BUILDING_LIST.filter(b=>b.category==='natur').map(b=>b.id)},
  {id:'licht',label:'Licht',icon:'laterne',items:BUILDING_LIST.filter(b=>b.category==='licht').map(b=>b.id)},
  {id:'haus',label:'Häuser',icon:'haus',items:['eigen',...BUILDING_LIST.filter(b=>b.category==='haus').map(b=>b.id)]},
  {id:'auto',label:'Autos',icon:'lambo',items:VEHICLE_LIST.filter(v=>v.category==='auto').map(v=>v.id)},
  {id:'bahn',label:'Bahn',icon:'zug',items:['schiene','bahnhof','uebergang','tunnel','zug','ice']},
  {id:'see',label:'Wasser',icon:'boot',items:['meer','insel','wasser',...VEHICLE_LIST.filter(v=>v.category==='see').map(v=>v.id),'anleger','faehre','seetor']},
  {id:'fische',label:'Fische',icon:'fx_karpfen',items:FISH_LIST.map(f=>'fx_'+f.id)},
  {id:'fang',label:'Mein Fang',icon:'F_thunfisch',special:'fang',items:[]},
  {id:'tier',label:'Tiere',icon:'hund',items:ANIMAL_LIST.map(a=>a.id)}
];

export { CATS, ITEMS };
