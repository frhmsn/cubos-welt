// Kamera im Baumodus: Position, Zoom, Verschieben.
import './lights.js'; // Ladereihenfolge: dieses Modul läuft nach render/lights.js
import { game } from '../core/state.js';
import { clamp } from '../core/util.js';
import { buildCam } from './renderer.js';

// ---------- Kamera Bauen ----------
const bc={x:0,z:3,d:48,yaw:.55,yawT:.55};
function placeBuildCam(){
  bc.yaw+=(bc.yawT-bc.yaw)*.18;
  const k=clamp((bc.d-12)/(95-12),0,1),pitch=.55+k*.5+clamp((bc.d-95)/200,0,.2),cp=Math.cos(pitch);
  buildCam.position.set(bc.x+Math.sin(bc.yaw)*cp*bc.d,Math.sin(pitch)*bc.d,bc.z+Math.cos(bc.yaw)*cp*bc.d);
  buildCam.lookAt(bc.x,0,bc.z);
}
function panBy(dx,dy){
  const s=bc.d*2*Math.tan(buildCam.fov*Math.PI/360)/window.innerHeight;
  const rx=Math.cos(bc.yaw),rz=-Math.sin(bc.yaw),fx=-Math.sin(bc.yaw),fz=-Math.cos(bc.yaw);
  bc.x+=(-rx*dx+fx*dy*1.3)*s; bc.z+=(-rz*dx+fz*dy*1.3)*s;
  bc.x=clamp(bc.x,-game.HALF,game.HALF); bc.z=clamp(bc.z,-game.HALF,game.HALF);
}

export { bc, panBy, placeBuildCam };
