// Kollision von Spielfigur und Fahrzeugen mit Gebäuden.
import { game } from './state.js';
import { clamp } from './util.js';
import { I, TILE, inb } from './grid.js';
import { cols, groundM } from './world-data.js';

// ---------- Kollision ----------
function resolve(p,rad){
  let hit=false; const ti=Math.floor((p.x+game.HALF)/TILE),tj=Math.floor((p.z+game.HALF)/TILE);
  for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){
    const i=ti+di,j=tj+dj; if(!inb(i,j))continue;
    const gm=groundM[I(i,j)],lists=gm&&gm.userData.cols&&gm.userData.cols.length?[cols[I(i,j)],gm.userData.cols]:[cols[I(i,j)]];
    for(const list of lists)for(const c of list){
      if(c.off)continue;
      if(c.c){const dx=p.x-c.x,dz=p.z-c.z,dd=Math.hypot(dx,dz),m=rad+c.r;if(dd<m&&dd>1e-6){p.x=c.x+dx/dd*m;p.z=c.z+dz/dd*m;hit=true;}}
      else{
        const qx=clamp(p.x,c.x0,c.x1),qz=clamp(p.z,c.z0,c.z1),dx=p.x-qx,dz=p.z-qz,dd=Math.hypot(dx,dz);
        if(dd<rad){
          if(dd>1e-6){p.x=qx+dx/dd*rad;p.z=qz+dz/dd*rad;}
          else{const l=p.x-c.x0,rr=c.x1-p.x,b=p.z-c.z0,f=c.z1-p.z,mn=Math.min(l,rr,b,f);
            if(mn===l)p.x=c.x0-rad;else if(mn===rr)p.x=c.x1+rad;else if(mn===b)p.z=c.z0-rad;else p.z=c.z1+rad;}
          hit=true;
        }
      }
    }
  }
  const lim=game.HALF-.3; if(Math.abs(p.x)>lim||Math.abs(p.z)>lim){p.x=clamp(p.x,-lim,lim);p.z=clamp(p.z,-lim,lim);hit=true;}
  return hit;
}

export { resolve };
