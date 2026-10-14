// Blöcke der Bauwerkstatt und das Zusammensetzen selbst gebauter Häuser.
import './buildings.js'; // Ladereihenfolge: läuft nach content/models/buildings.js (siehe docs/ARCHITEKTUR.md)
import { nightMat } from '../../render/materials.js';
import { MODELS } from './buildings.js';
import { rot } from '../../core/world.js';

// ---------- Selbst bauen: Blöcke ----------
const VX=8,VY=12,VB=.5,VO=-VX*VB/2;
const VI=(x,y,z)=>(y*VX+z)*VX+x;
const vin=(x,y,z)=>x>=0&&z>=0&&y>=0&&x<VX&&z<VX&&y<VY;
function pixTex(draw){const c=document.createElement('canvas');c.width=c.height=16;const x=c.getContext('2d');draw(x);const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;return t;}
function noiseFill(x,base,vars){x.fillStyle=base;x.fillRect(0,0,16,16);for(let k=0;k<40;k++){x.fillStyle=vars[k%vars.length];x.fillRect(Math.floor(Math.random()*8)*2,Math.floor(Math.random()*8)*2,2,2);}}
const rnd16=()=>Math.floor(Math.random()*16);
const TEX={
  s:pixTex(x=>noiseFill(x,'#8E949B',['#7D838A','#A3A9B0','#868C93'])),
  z:pixTex(x=>{x.fillStyle='#D8CBB6';x.fillRect(0,0,16,16);x.fillStyle='#B4472F';for(let r=0;r<4;r++){const off=r%2?4:0;for(let c=-1;c<2;c++)x.fillRect(c*8+off+1,r*4+1,7,3);}x.fillStyle='#9E3B26';for(let k=0;k<8;k++)x.fillRect(rnd16(),rnd16(),1,1);}),
  h:pixTex(x=>{x.fillStyle='#B98552';x.fillRect(0,0,16,16);x.fillStyle='#9A6A3E';for(let r=0;r<4;r++)x.fillRect(0,r*4+3,16,1);for(let k=0;k<10;k++)x.fillRect(rnd16(),rnd16(),2,1);}),
  p:pixTex(x=>noiseFill(x,'#E2DACA',['#D5CCB8','#ECE6DA'])),
  b:pixTex(x=>{x.fillStyle='#2F6BBE';x.fillRect(0,0,16,16);x.fillStyle='#4A8BDE';x.fillRect(1,1,14,14);}),
  g:pixTex(x=>{x.fillStyle='#D9A514';x.fillRect(0,0,16,16);x.fillStyle='#F5C732';x.fillRect(1,1,14,14);}),
  r:pixTex(x=>{x.fillStyle='#7E2C20';x.fillRect(0,0,16,16);x.fillStyle='#A83C2B';for(let r=0;r<4;r++){const off=r%2?2:0;for(let c=0;c<5;c++)x.fillRect(c*4+off-1,r*4,3,3);}}),
  f:pixTex(x=>{x.fillStyle='#FFFFFF';x.fillRect(0,0,16,16);x.fillStyle='#8CC4E8';[[2,2],[9,2],[2,9],[9,9]].forEach(([a,b])=>x.fillRect(a,b,5,5));x.fillStyle='#D2ECFA';x.fillRect(3,3,2,1);x.fillRect(10,3,2,1);}),
  l:pixTex(x=>{x.fillStyle='#6B5A3A';x.fillRect(0,0,16,16);x.fillStyle='#FFE89A';x.fillRect(2,2,12,12);x.fillStyle='#FFF7D6';x.fillRect(5,5,6,6);}),
  d:pixTex(x=>{x.fillStyle='#6E4222';x.fillRect(0,0,16,16);x.fillStyle='#8E5A30';x.fillRect(1,1,14,14);x.fillStyle='#E8C25A';x.fillRect(11,8,2,2);})
};
const glassEm=pixTex(x=>{x.fillStyle='#000';x.fillRect(0,0,16,16);x.fillStyle='#FFC860';[[2,2],[9,2],[2,9],[9,9]].forEach(([a,b])=>x.fillRect(a,b,5,5));});
const BMAT={};
for(const k of 'szhpbgrd')BMAT[k]=new THREE.MeshStandardMaterial({map:TEX[k],roughness:.9});
BMAT.f=nightMat({map:TEX.f,emissiveMap:glassEm,emissive:0xffffff,roughness:.3},0,1.1);
BMAT.l=nightMat({map:TEX.l,emissiveMap:TEX.l,emissive:0xffffff},.35,1.1);
const BLOCKS=[
  {c:'z',label:'Ziegel'},{c:'s',label:'Stein'},{c:'p',label:'Putz'},{c:'h',label:'Holz'},{c:'b',label:'Blau'},{c:'g',label:'Gelb'},
  {c:'f',label:'Fenster'},{c:'d',label:'Tür'},{c:'r',label:'Dach'},{c:'0',label:'Schräge'},{c:'l',label:'Lampe'}
];
const OPAQUE=new Set(['s','z','h','p','b','g','r','l']);
function meshVoxels(v){
  const buckets={},bk=k=>buckets[k]||(buckets[k]={p:[],n:[],u:[]});
  const get=(x,y,z)=>{if(y<0)return 's';if(!vin(x,y,z))return '.';return v[VI(x,y,z)];};
  const quad=(b,a,c1,c2,d,n)=>{b.p.push(...a,...c1,...c2,...a,...c2,...d);for(let k=0;k<6;k++)b.n.push(...n);b.u.push(0,0,1,0,1,1,0,0,1,1,0,1);};
  const tri=(b,a,c1,c2,n)=>{b.p.push(...a,...c1,...c2);for(let k=0;k<3;k++)b.n.push(...n);b.u.push(0,0,1,0,0,1);};
  const NB=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
  function boxFaces(b,x0,y0,z0,x1,y1,z1,skip){
    const F=[[[x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[1,0,0]],[[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[-1,0,0]],
      [[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0],[0,1,0]],[[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],[0,-1,0]],
      [[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[0,0,1]],[[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],[0,0,-1]]];
    F.forEach((f,k)=>{if(skip&&skip(k))return;quad(b,f[0],f[1],f[2],f[3],f[4]);});
  }
  function wedge(b,x0,y0,z0,d){
    const B=VB,h=B/2,s=Math.SQRT1_2;
    const P=(x,y,z)=>{const r=rot(x-h,z-h,d);return[x0+h+r[0],y0+y,z0+h+r[1]];};
    const Nr=(x,y,z)=>{const r=rot(x,z,d);return[r[0],y,r[1]];};
    quad(b,P(0,0,0),P(B,0,0),P(B,0,B),P(0,0,B),Nr(0,-1,0));
    quad(b,P(B,0,0),P(0,0,0),P(0,B,0),P(B,B,0),Nr(0,0,-1));
    quad(b,P(0,0,B),P(B,0,B),P(B,B,0),P(0,B,0),Nr(0,s,s));
    tri(b,P(0,0,0),P(0,0,B),P(0,B,0),Nr(-1,0,0));
    tri(b,P(B,0,0),P(B,B,0),P(B,0,B),Nr(1,0,0));
  }
  for(let y=0;y<VY;y++)for(let z=0;z<VX;z++)for(let x=0;x<VX;x++){
    const c=v[VI(x,y,z)]; if(!c||c==='.')continue;
    const x0=VO+x*VB,y0=y*VB,z0=VO+z*VB,x1=x0+VB,y1=y0+VB,z1=z0+VB;
    if(OPAQUE.has(c)||c==='f'){
      boxFaces(bk(c),x0,y0,z0,x1,y1,z1,k=>{const nn=get(x+NB[k][0],y+NB[k][1],z+NB[k][2]);return OPAQUE.has(nn)||(c==='f'&&nn==='f');});
    } else if(c>='0'&&c<='3'){
      wedge(bk('r'),x0,y0,z0,+c);
    } else if(c==='d'){
      const isD=(a,b2,cc)=>get(a,b2,cc)==='d',t=.07,b=bk('d');
      const ax=isD(x-1,y,z)||isD(x+1,y,z)?true:(isD(x,y,z-1)||isD(x,y,z+1))?false:(OPAQUE.has(get(x-1,y,z))||OPAQUE.has(get(x+1,y,z)));
      if(ax){if(!isD(x-1,y,z))boxFaces(b,x0,y0,z0,x0+t,y1,z1);if(!isD(x+1,y,z))boxFaces(b,x1-t,y0,z0,x1,y1,z1);}
      else{if(!isD(x,y,z-1))boxFaces(b,x0,y0,z0,x1,y1,z0+t);if(!isD(x,y,z+1))boxFaces(b,x0,y0,z1-t,x1,y1,z1);}
      if(!isD(x,y+1,z)&&OPAQUE.has(get(x,y+1,z))===false&&y+1<VY){}
    }
  }
  const g=new THREE.Group();
  for(const k in buckets){
    const b=buckets[k]; if(!b.p.length)continue;
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(b.u,2));
    geo.computeBoundingSphere();
    const m=new THREE.Mesh(geo,BMAT[k]);m.castShadow=true;m.receiveShadow=true;m.userData.keep=true;m.userData.own=true;g.add(m);
  }
  return g;
}
function voxCols(v){
  const out=[];
  for(let z=0;z<VX;z++)for(let x=0;x<VX;x++){
    let solid=false; for(let y=0;y<4;y++){const c=v[VI(x,y,z)];if(c&&c!=='.'&&c!=='d'){solid=true;break;}}
    if(solid)out.push(['b',VO+x*VB,VO+x*VB+VB,VO+z*VB,VO+z*VB+VB]);
  }
  return out;
}
const TEMPLATE=(()=>{
  const v=new Array(VX*VX*VY).fill('.'),S=(x,y,z,c)=>{v[VI(x,y,z)]=c;};
  // 6 x 6 Haus in der Mitte, ringsum ein freier Rand zum Anbauen
  for(let y=0;y<6;y++)for(let i=1;i<7;i++){const c=y===0?'s':'p';S(i,y,1,c);S(i,y,6,c);S(1,y,i,c);S(6,y,i,c);}
  for(let y=0;y<4;y++){S(3,y,6,'d');S(4,y,6,'d');}
  for(const y of [2,3]){S(2,y,1,'f');S(5,y,1,'f');S(3,y,1,'f');S(4,y,1,'f');S(2,y,6,'f');S(5,y,6,'f');for(const i of [3,4]){S(1,y,i,'f');S(6,y,i,'f');}}
  for(let z=1;z<7;z++)for(let L=0;L<3;L++){
    const y=6+L; S(1+L,y,z,'3'); S(6-L,y,z,'1');
    for(let x=2+L;x<6-L;x++){if(L===0)S(x,y,z,'r');else if(z===1||z===6)S(x,y,z,'p');}
  }
  S(2,5,2,'l');
  return v.join('');
})();
MODELS.eigen=(seed,o)=>{
  const v=(o&&typeof o.b==='string'&&o.b.length===VX*VX*VY)?o.b:TEMPLATE,lights=[];
  for(let k=0;k<v.length&&lights.length<4;k++)if(v[k]==='l'){const x=k%VX,z=Math.floor(k/VX)%VX,y=Math.floor(k/(VX*VX));lights.push([VO+x*VB+VB/2,y>0?y*VB-.15:VB+.3,VO+z*VB+VB/2,0xffe2a8,1.1,6.5]);}
  return{g:meshVoxels(v),cols:voxCols(v),lights};
};

export { BLOCKS, TEMPLATE, VB, VI, VO, VX, VY, meshVoxels, vin };
