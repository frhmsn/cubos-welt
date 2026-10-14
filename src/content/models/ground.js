// 3D-Modelle für Bodenarten (Straße, Sand, Wasser, Meer ...).
import { game } from '../../core/state.js';
import { TILE } from '../../core/grid.js';
import { scene } from '../../render/renderer.js';
import { M } from '../../render/materials.js';

// ---------- Boden ----------
/* Wiese ist eine einzige große Fläche, nur Straße, Sand und Wasser sind eigene Kacheln. So bleibt auch eine große Welt flüssig. */
const baseTex=(()=>{const c=document.createElement('canvas');c.width=c.height=2;const x=c.getContext('2d');x.fillStyle='#6BBA47';x.fillRect(0,0,2,2);x.fillStyle='#73C24F';x.fillRect(0,0,1,1);x.fillRect(1,1,1,1);
  const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})();
const baseGround=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshStandardMaterial({map:baseTex,roughness:1}));
baseGround.rotation.x=-Math.PI/2; baseGround.position.y=-.02; baseGround.receiveShadow=true; scene.add(baseGround);
const skirt=new THREE.Mesh(new THREE.BoxGeometry(1,.4,1),M('#8A6A45',{roughness:1})); skirt.position.y=-.25; scene.add(skirt);
function updateBase(){baseGround.scale.set(game.N*TILE,game.N*TILE,1);baseTex.repeat.set(game.N/2,game.N/2);baseTex.needsUpdate=true;skirt.scale.set(game.N*TILE+.02,1,game.N*TILE+.02);}
updateBase();

export { updateBase };
