// Bahnhof- und Anleger-Panel: Einsteigen und Aussteigen.
import '../systems/player.js'; // Ladereihenfolge: läuft nach systems/player.js (siehe docs/ARCHITEKTUR.md)
import { game } from '../core/state.js';
import { $ } from '../core/util.js';
import { I, center, tileAt } from '../core/grid.js';
import { gAt, groundM, trains } from '../core/world.js';
import { ac, tone } from '../systems/audio.js';
import { pl } from '../systems/player.js';
import { exitTrain, startRide } from './modes.js';

function stationNear(){
  const t=tileAt(pl.x,pl.z);if(!t)return -1;
  for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const i=t.i+di,j=t.j+dj;if(gAt(i,j)!=='bahnhof')continue;
    const k=I(i,j),gm=groundM[k],c=center(i,j),sd=(gm&&gm.userData.side)||[0,0];
    if(Math.hypot(pl.x-(c.x+sd[0]),pl.z-(c.z+sd[1]))<2.9)return k;}
  return -1;
}
const trainAt=k=>trains.find(tr=>tr.state==='halt'&&tr.atStation&&tr.stopK===k);
game.stState = '';
function showStation(state,title,sub,go,alt){
  if(state===game.stState)return;game.stState=state;
  const P=$('#stPanel');if(!state){P.hidden=true;return;}
  P.hidden=false;$('#stTitle').textContent=title;$('#stSub').textContent=sub||'';
  $('#stGo').hidden=!go;if(go)$('#stGo').textContent=go;$('#stAlt').hidden=!alt;if(alt)$('#stAlt').textContent=alt;
  if(state==='here'||state==='ridestop')tone(988,.12,'sine',.07);
}
function updateStationUI(){
  if(game.traveling){showStation('');return;}
  if(game.mode==='walk'){
    const k=stationNear();
    if(k<0){showStation('');return;}
    if(!trains.length){showStation('none','Bahnhof','Hier fährt noch kein Zug. Setz einen Zug aufs Gleis.');return;}
    const tr=trainAt(k);
    if(tr&&!tr.go&&tr.holdT<30){showStation('here','Der Zug ist da!','Willst du mitfahren?','Einsteigen');return;}
    showStation('wait','Bahnhof','Bleib hier stehen. Der Zug kommt und wartet auf dich.');return;
  }
  if(game.mode==='ride'&&game.rideTrain){
    const tr=game.rideTrain;
    if(tr.state==='halt'&&tr.atStation&&!tr.go){showStation('ridestop','Bahnhof!','Willst du hier aussteigen?','Aussteigen','Weiterfahren');return;}
    showStation('');return;
  }
  showStation('');
}
$('#stGo').addEventListener('click',()=>{
  ac();
  if(game.mode==='walk'){const k=stationNear(),tr=k>=0&&trainAt(k);if(tr){showStation('');startRide(tr);}}
  else if(game.mode==='ride'){showStation('');exitTrain(false);}
});
$('#stAlt').addEventListener('click',()=>{ac();if(game.mode==='ride'&&game.rideTrain){game.rideTrain.go=true;game.rideTrain.wait=0;showStation('');}});

export { showStation, stationNear, updateStationUI };
