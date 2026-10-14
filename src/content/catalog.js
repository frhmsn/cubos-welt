// Katalog aller baubaren Dinge (ITEMS) und der Inventar-Kategorien (CATS).
import '../core/grid.js'; // Ladereihenfolge: dieses Modul läuft nach core/grid.js

// ---------- Katalog ----------
const ITEMS={
  hand:{kind:'tool',label:'Schauen'}, radierer:{kind:'tool',label:'Weg damit',paint:true},
  gras:{kind:'ground',label:'Wiese',paint:true}, sand:{kind:'ground',label:'Sand',paint:true},
  wasser:{kind:'ground',label:'Wasser',paint:true}, strasse:{kind:'ground',label:'Straße',paint:true},
  baum:{kind:'obj',label:'Baum',paint:true}, tanne:{kind:'obj',label:'Tanne',paint:true},
  blumen:{kind:'obj',label:'Blumen',paint:true}, berg:{kind:'obj',label:'Berg'},
  groesser:{kind:'action',label:'Welt größer',icon:'<svg viewBox="0 0 24 24" fill="none" stroke="#1F2A37" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="7.5" y="7.5" width="9" height="9" rx="1.5" fill="#8FD46A"/><path d="M3 8V3h5M16 3h5v5M21 16v5h-5M8 21H3v-5"/></svg>'},
  laterne:{kind:'obj',label:'Laterne',rot:true,walkable:true}, gartenlampe:{kind:'obj',label:'Gartenlampen',walkable:true},
  lichterkette:{kind:'obj',label:'Lichterkette',walkable:true}, flutlicht:{kind:'obj',label:'Flutlicht',rot:true},
  lagerfeuer:{kind:'obj',label:'Lagerfeuer'},
  eigen:{kind:'obj',label:'Selbst bauen',house:true}, garage:{kind:'obj',label:'Garage',house:true}, aquarium:{kind:'obj',label:'Aquarium',house:true,big:true}, teil:{kind:'part',label:'',house:true},
  haus:{kind:'obj',label:'Haus',house:true}, villa:{kind:'obj',label:'Villa',house:true},
  hochhaus:{kind:'obj',label:'Hochhaus',house:true}, feuerwache:{kind:'obj',label:'Feuerwache',house:true},
  lambo:{kind:'car',label:'Lamborghini',speed:6.5,max:17}, ferrari:{kind:'car',label:'Ferrari',speed:6,max:16},
  polizei:{kind:'car',label:'Polizei',speed:5,max:14,siren:true}, feuerwehrauto:{kind:'car',label:'Löschauto',speed:4.2,max:11,siren:true},
  bus:{kind:'car',label:'Bus',speed:3.4,max:9},
  schiene:{kind:'ground',label:'Gleis',paint:true}, bahnhof:{kind:'ground',label:'Bahnhof'}, uebergang:{kind:'ground',label:'Bahnübergang'},
  tunnel:{kind:'ground',label:'Tunnel'}, zug:{kind:'train',label:'Regionalzug',speed:5.5}, ice:{kind:'train',label:'Schnellzug',speed:8.5},
  anleger:{kind:'ground',label:'Anleger'}, seetor:{kind:'ground',label:'Seetor'}, faehre:{kind:'ferry',label:'Fähre'},
  meer:{kind:'ground',label:'Meer',paint:true}, boot:{kind:'car',label:'Fischerboot',speed:3,max:9,boat:true}, uboot:{kind:'car',label:'U-Boot',speed:3,max:8,boat:true,sub:true},
  fx_barsch:{kind:'fish',fish:'barsch',label:'Barsch'}, fx_hecht:{kind:'fish',fish:'hecht',label:'Hecht'}, fx_karpfen:{kind:'fish',fish:'karpfen',label:'Karpfen'},
  fx_wels:{kind:'fish',fish:'wels',label:'Wels'}, fx_stoer:{kind:'fish',fish:'stoer',label:'Stör'}, fx_thunfisch:{kind:'fish',fish:'thunfisch',label:'Thunfisch'}, fx_hai:{kind:'fish',fish:'hai',label:'Hai'},
  fx_makrele:{kind:'fish',fish:'makrele',label:'Makrele'}, fx_bonito:{kind:'fish',fish:'bonito',label:'Bonito'}, fx_mahimahi:{kind:'fish',fish:'mahimahi',label:'Mahi-Mahi'}, fx_barrakuda:{kind:'fish',fish:'barrakuda',label:'Barrakuda'}, fx_schwertfisch:{kind:'fish',fish:'schwertfisch',label:'Schwertfisch'}, fx_marlin:{kind:'fish',fish:'marlin',label:'Marlin'}, fx_mondfisch:{kind:'fish',fish:'mondfisch',label:'Mondfisch'},
  hund:{kind:'animal',label:'Hund',speed:1.7}, kuh:{kind:'animal',label:'Kuh',speed:.55},
  pferd:{kind:'animal',label:'Pferd',speed:1.1}, huhn:{kind:'animal',label:'Huhn',speed:.8}
};
const CATS=[
  {id:'land',label:'Land',icon:'strasse',items:['strasse','gras','sand','wasser','groesser']},
  {id:'natur',label:'Natur',icon:'baum',items:['baum','tanne','blumen','berg']},
  {id:'licht',label:'Licht',icon:'laterne',items:['laterne','gartenlampe','lichterkette','flutlicht','lagerfeuer']},
  {id:'haus',label:'Häuser',icon:'haus',items:['eigen','haus','villa','hochhaus','feuerwache','garage','aquarium']},
  {id:'auto',label:'Autos',icon:'lambo',items:['lambo','ferrari','polizei','feuerwehrauto','bus']},
  {id:'bahn',label:'Bahn',icon:'zug',items:['schiene','bahnhof','uebergang','tunnel','zug','ice']},
  {id:'see',label:'Wasser',icon:'boot',items:['meer','wasser','boot','uboot','anleger','faehre','seetor']},
  {id:'fische',label:'Fische',icon:'fx_karpfen',items:['fx_barsch','fx_hecht','fx_karpfen','fx_wels','fx_stoer','fx_thunfisch','fx_hai','fx_makrele','fx_bonito','fx_mahimahi','fx_barrakuda','fx_schwertfisch','fx_marlin','fx_mondfisch']},
  {id:'fang',label:'Mein Fang',icon:'F_thunfisch',special:'fang',items:[]},
  {id:'tier',label:'Tiere',icon:'hund',items:['hund','kuh','pferd','huhn']}
];

export { CATS, ITEMS };
