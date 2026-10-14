// Three.js-Grundgerüst: Renderer, Szene, Kameras, Sonne, Mond, Himmel.
import { game } from '../core/state.js';
import { $ } from '../core/util.js';

// ---------- Renderer & Szene ----------
const canvas=$('#c');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
let dprMax=Math.min(window.devicePixelRatio||1,2); game.dpr = Math.min(dprMax,1.5);
renderer.setPixelRatio(game.dpr);
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFShadowMap;
const scene=new THREE.Scene();
scene.fog=new THREE.Fog(0x8fd3ff,95,260);
const buildCam=new THREE.PerspectiveCamera(45,1,1,900);
const walkCam=new THREE.PerspectiveCamera(70,1,.05,600); walkCam.rotation.order='YXZ';
game.cam = buildCam;
const hemi=new THREE.HemisphereLight(0xdff2ff,0xb8a88a,.6); scene.add(hemi);
const fill=new THREE.AmbientLight(0xfff4e6,.18); scene.add(fill);
const sun=new THREE.DirectionalLight(0xfff1d6,1); sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-42,right:42,top:42,bottom:-42,near:1,far:220});
sun.shadow.bias=-.0006; sun.shadow.normalBias=.03;
scene.add(sun,sun.target);
const moon=new THREE.DirectionalLight(0x9db2ff,0); scene.add(moon,moon.target);
const outer=new THREE.Mesh(new THREE.PlaneGeometry(1000,1000),new THREE.MeshStandardMaterial({color:0x5c9a40,roughness:1}));
outer.rotation.x=-Math.PI/2; outer.position.y=-.45; outer.receiveShadow=true; scene.add(outer);
const sunBall=new THREE.Mesh(new THREE.SphereGeometry(12,20,14),new THREE.MeshBasicMaterial({color:0xfff2b0,fog:false}));
const moonBall=new THREE.Mesh(new THREE.SphereGeometry(8,20,14),new THREE.MeshBasicMaterial({color:0xe8ecff,fog:false}));
scene.add(sunBall,moonBall);
const stars=(()=>{const n=500,p=new Float32Array(n*3);for(let k=0;k<n;k++){const a=Math.random()*Math.PI*2,e=Math.random()*1.2+.08,r=380;p[k*3]=Math.cos(a)*Math.cos(e)*r;p[k*3+1]=Math.sin(e)*r;p[k*3+2]=Math.sin(a)*Math.cos(e)*r;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));
  const m=new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:2,sizeAttenuation:false,transparent:true,opacity:0,fog:false}));scene.add(m);return m;})();

export { buildCam, canvas, dprMax, fill, hemi, moon, moonBall, renderer, scene, stars, sun, sunBall, walkCam };
