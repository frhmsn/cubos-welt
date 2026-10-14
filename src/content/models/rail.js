// 3D-Modelle für Gleise, Bahnhof, Bahnübergang, Tunnel, Anleger und Seetor.
import './ground.js'; // Ladereihenfolge: dieses Modul läuft nach content/models/ground.js
import { DIRS, TILE } from '../../core/grid.js';
import { BX, G, M, box, bulbMat, glowTex, mesh, seaMat, waterMat } from '../../render/materials.js';
import { rot } from '../../core/world.js';

// ---------- Gleise, Bahnhof, Häfen ----------
const railMat=M('#9097A0',{metalness:.6,roughness:.35});
const darkMat=new THREE.MeshBasicMaterial({color:0x08090b});
const blinkMat=new THREE.MeshStandardMaterial({color:0x991111,emissive:0xff2020,emissiveIntensity:.1});
const armMat=(()=>{const c=document.createElement('canvas');c.width=64;c.height=8;const x=c.getContext('2d');for(let k=0;k<8;k++){x.fillStyle=k%2?'#FFFFFF':'#D7261E';x.fillRect(k*8,0,8,8);}return new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),roughness:.5});})();
const portalMat=new THREE.MeshBasicMaterial({map:glowTex,color:0x9be7ff,transparent:true,opacity:.75,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
const signCache={};
function signMat(text,bg){if(signCache[text])return signCache[text];const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,256,64);x.fillStyle='#fff';x.font='bold 38px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(text,128,35);return signCache[text]=new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),roughness:.6});}
function lsub(g,r){const s=new THREE.Group();s.rotation.y=r*Math.PI/2;g.add(s);return s;}
function lcol(ud,r,cl){
  if(cl[0]==='c'){const q=rot(cl[1],cl[2],r);ud.cols.push(['c',q[0],q[1],cl[3]]);}
  else{const a=rot(cl[1],cl[3],r),b=rot(cl[2],cl[4],r);ud.cols.push(['b',Math.min(a[0],b[0]),Math.max(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[1],b[1])]);}
}
function llight(ud,r,x,y,z,c,i,d){const q=rot(x,z,r);ud.lights.push([q[0],y,q[1],c,i,d]);}
function trackPiece(g,x0,z0,x1,z1,yo){
  const dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz);if(L<.01)return;
  const s=new THREE.Group();s.position.set((x0+x1)/2,yo||0,(z0+z1)/2);s.rotation.y=Math.atan2(dx,dz);g.add(s);
  box(s,'#A0937F',1.7,.08,L,0,.04,0,false);
  const n=Math.max(1,Math.round(L/.55));
  for(let k=0;k<n;k++)box(s,'#6B4F32',1.35,.06,.2,0,.1,-L/2+(k+.5)*L/n,false);
  for(const x of[-.42,.42])box(s,railMat,.09,.09,L,x,.175,0,false);
}
function railTrack(g,dirs){
  const h=TILE/2;
  if(dirs.length===2&&(dirs[0]+dirs[1])%2===1){
    const a=DIRS[dirs[0]],b=DIRS[dirs[1]],cx=(a[0]+b[0])*h,cz=(a[1]+b[1])*h;let prev=null;
    for(let k=0;k<=6;k++){const t=k/6*Math.PI/2,px=cx+(-b[0]*Math.cos(t)-a[0]*Math.sin(t))*h,pz=cz+(-b[1]*Math.cos(t)-a[1]*Math.sin(t))*h;if(prev)trackPiece(g,prev[0],prev[1],px,pz,(k%2)*.008);prev=[px,pz];}
    return;
  }
  if(!dirs.length){trackPiece(g,-h,0,h,0,0);return;}
  const left=new Set(dirs);let n=0;
  for(const d of[0,1]){if(left.has(d)&&left.has(d+2)){const v=DIRS[d];trackPiece(g,-v[0]*h,-v[1]*h,v[0]*h,v[1]*h,n++*.008);left.delete(d);left.delete(d+2);}}
  for(const d of left){const v=DIRS[d],st=dirs.length===1?-.9:0;trackPiece(g,v[0]*st,v[1]*st,v[0]*h,v[1]*h,n++*.008);
    if(dirs.length===1){const pb=box(g,'#D7261E',1.3,.45,.25,-v[0]*1.0,.3,-v[1]*1.0);pb.rotation.y=Math.atan2(v[0],v[1]);}}
}
const stationAxis=rl=>(rl.includes(1)||rl.includes(3))?1:(rl.length?0:1);
function stationBits(g,conn){
  const rl=conn.rail||[],r=stationAxis(rl),ud=g.userData;let sg=1;
  if(conn.side!=null){const q=rot(1,0,r);sg=(q[0]===DIRS[conn.side][0]&&q[1]===DIRS[conn.side][1])?1:-1;}
  const s=lsub(g,r),X=v=>sg*v;
  box(s,'#BFC3C8',1.15,.22,TILE-.04,X(1.43),.11,0);
  box(s,'#F2C230',.1,.012,TILE-.04,X(.93),.226,0,false);
  for(const z of[-1.25,1.25]){box(s,'#4A5058',.1,2.3,.1,X(1.75),1.37,z);lcol(ud,r,['c',X(1.75),z,.14]);}
  box(s,'#2F6BBE',1.35,.1,3.2,X(1.45),2.56,0);
  box(s,'#8B6A45',.4,.08,1.1,X(1.72),.58,0); box(s,'#8B6A45',.06,.36,1.1,X(1.9),.78,0);
  for(const z of[-.45,.45])box(s,'#4A5058',.3,.36,.06,X(1.72),.4,z);
  box(s,signMat('BAHNHOF','#1E5AA8'),.06,.42,1.6,X(1.82),2.2,0);
  mesh(BX(.5,.05,.16),bulbMat,X(1.45),2.49,0,s,false);
  llight(ud,r,X(1.45),2.3,0,0xffe2b0,1.2,8);
  ud.side=rot(X(1.5),0,r);
}
function crossingBits(g,conn){
  const rl=conn.rail||[],rd=conn.dirs||[];
  let r;if(rl.includes(1)||rl.includes(3))r=1;else if(rl.length)r=0;else r=(rd.includes(1)||rd.includes(3))?0:1;
  box(g,'#3D434B',TILE,.4,TILE,0,-.2,0,false);
  const s=lsub(g,r),ud=g.userData;
  box(s,'#6E737A',1.1,.02,TILE,0,.01,0,false);
  for(const x of[-.42,.42])box(s,railMat,.09,.05,TILE,x,.025,0,false);
  for(const [x,z,ry] of [[-1.3,-1.8,0],[1.3,1.8,Math.PI]]){
    box(s,'#F4F4F2',.13,1.15,.13,x,.575,z); lcol(ud,r,['c',x,z,.12]);
    mesh(BX(.17,.17,.07),blinkMat,x,.95,z+(ry?.09:-.09),s,false);
    const arm=mesh(G('arm',()=>{const b=new THREE.BoxGeometry(.09,.09,1.65);b.translate(0,0,.82);return b;}),armMat,x,1.08,z,s,true);
    arm.rotation.y=ry; arm.userData.keep=true; arm.userData.arm=1;
  }
}
function tunnelBits(g,conn){
  const rl=conn.rail||[],r=rl.length?rl[0]:1,s=lsub(g,r),ud=g.userData;
  trackPiece(s,0,-1.2,0,TILE/2,0);
  box(s,'#7A7F86',3.6,3.15,1.5,0,1.57,.2);
  mesh(BX(1.95,2.25,.12),darkMat,0,1.27,.98,s,false);
  box(s,'#9AA0A6',.45,2.75,.4,-1.2,1.37,1.05); box(s,'#9AA0A6',.45,2.75,.4,1.2,1.37,1.05); box(s,'#9AA0A6',2.85,.45,.4,0,2.75,1.05);
  mesh(G('tmount',()=>new THREE.ConeGeometry(2.45,4.8,7)),M('#6E8B4C',{flatShading:true}),0,2.4,-1.6,s);
  mesh(G('tsnow',()=>new THREE.ConeGeometry(.85,1.3,7)),M('#F4F6F8',{flatShading:true}),0,4.2,-1.6,s);
  mesh(G('trock',()=>new THREE.DodecahedronGeometry(.6,0)),M('#8E949B',{flatShading:true}),-1.55,.4,.5,s);
  mesh(G('trock2',()=>new THREE.DodecahedronGeometry(.45,0)),M('#8E949B',{flatShading:true}),1.6,.3,.2,s);
  lcol(ud,r,['b',-2,2,-2,.95]);
}
function seetorBits(g,conn){
  const r=conn.water!=null?conn.water:0,s=lsub(g,r),ud=g.userData;ud.water=r;
  for(const x of[-1.78,1.78]){
    for(let k=0;k<5;k++)mesh(G('tw',()=>new THREE.CylinderGeometry(.32,.36,.72,10)),M(k%2?'#F4F4F2':'#D7261E'),x,.36+k*.72,0,s);
    mesh(G('twtop',()=>new THREE.CylinderGeometry(.22,.22,.35,10)),bulbMat,x,3.78,0,s,false);
    llight(ud,r,x,3.8,0,0xfff0c0,1.3,10); lcol(ud,r,['c',x,0,.4]);
  }
  box(s,'#F4F4F2',3.95,.28,.28,0,4.08,0);
  mesh(G('portalp',()=>new THREE.PlaneGeometry(3.1,3.6)),portalMat,0,1.95,0,s,false);
  for(const [x,z,c] of [[-1.3,1.6,'#D7261E'],[1.3,1.6,'#2E9E4F'],[-1.3,-1.6,'#D7261E'],[1.3,-1.6,'#2E9E4F']])mesh(G('buoy',()=>new THREE.ConeGeometry(.2,.5,8)),c,x,.2,z,s);
}
function anlegerBits(g,conn){
  const r=conn.land!=null?conn.land:0,s=lsub(g,r),ud=g.userData;ud.land=r;
  for(const x of[-1.8,1.8]){
    box(s,'#9B7650',.42,.12,3.7,x,.16,0);
    for(const z of[-1.6,0,1.6])mesh(G('ppost',()=>new THREE.CylinderGeometry(.08,.08,.7,6)),'#5E4632',x,-.1,z,s);
    mesh(G('boll',()=>new THREE.CylinderGeometry(.09,.11,.22,8)),'#2A2A2A',x,.33,-1.2,s);
  }
  box(s,'#9B7650',3.2,.12,.16,0,.16,1.92);
  mesh(G('lpole',()=>new THREE.CylinderGeometry(.06,.08,3.1,8)),'#3D434B',1.8,1.55,1.5,s);
  mesh(BX(.3,.05,.2),bulbMat,1.8,3.08,1.5,s,false); llight(ud,r,1.8,2.9,1.5,0xffd49a,1.3,10);
  box(s,signMat('FÄHRE','#1E8F7E'),.06,.42,1.2,-1.85,1.15,1.5);
  box(s,'#3D434B',.08,.95,.08,-1.85,.48,1.5);
  lcol(ud,r,['c',1.8,1.5,.12]);
}
function groundModel(type,conn){
  const g=new THREE.Group(); g.userData.cols=[]; g.userData.lights=[];
  const water=()=>mesh(BX(TILE,.03,TILE),waterMat,0,0,0,g,false);
  if(type==='wasser'){water();return g;}
  if(type==='meer'){mesh(BX(TILE,.03,TILE),seaMat,0,0,0,g,false);return g;}
  if(type==='anleger'){water();anlegerBits(g,conn);return g;}
  if(type==='seetor'){water();seetorBits(g,conn);return g;}
  if(type==='schiene'){railTrack(g,conn.rail||[]);return g;}
  if(type==='bahnhof'){const rl=conn.rail||[];if(rl.length>=2)railTrack(g,rl);else railTrack(g,stationAxis(rl)?[1,3]:[0,2]);stationBits(g,conn);return g;}
  if(type==='uebergang'){crossingBits(g,conn);return g;}
  if(type==='tunnel'){tunnelBits(g,conn);return g;}
  const col=type==='gras'?(conn.alt?'#73C24F':'#6BBA47'):type==='sand'?'#EAD08D':'#3D434B';
  box(g,col,TILE,.4,TILE,0,-.2,0,false);
  if(type==='strasse'){
    const h=TILE/2;
    for(let d=0;d<4;d++){
      if(conn.dirs.includes(d)){
        for(const s of [.6,1.5]){ if(d%2) box(g,'#F4F4F2',.5,.02,.12,DIRS[d][0]*s,.01,0,false); else box(g,'#F4F4F2',.12,.02,.5,0,.01,DIRS[d][1]*s,false); }
      } else {
        if(d%2) box(g,'#C9CCD1',.45,.1,TILE,DIRS[d][0]*(h-.225),.05,0,false); else box(g,'#C9CCD1',TILE,.1,.45,0,.05,DIRS[d][1]*(h-.225),false);
      }
    }
  }
  return g;
}

export { blinkMat, groundModel, portalMat, signMat, stationAxis };
