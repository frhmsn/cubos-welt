// Schwebende Lichtpunkte: tagsüber Pollen, nachts Glühwürmchen. Nur in der Nähe des Blickpunkts.
// Eigener Zufall (mulberry), damit der Spiel-Zufall (Math.random) unverändert bleibt.
import { mulberry } from '../core/util.js';
import { scene } from './renderer.js';

const N = 90, R = 26, rnd = mulberry(2024);
const tex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d');
  const g = x.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 32, 32); return new THREE.CanvasTexture(c);
})();
const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
const parts = Array.from({ length: N }, () => ({ x: (rnd() - .5) * 2 * R, y: .4 + rnd() * 5, z: (rnd() - .5) * 2 * R, ph: rnd() * 6.3, sp: .3 + rnd() * .6 }));
const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
const mat = new THREE.PointsMaterial({ size: .32, map: tex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
const points = new THREE.Points(geo, mat); points.frustumCulled = false; scene.add(points);
let t = 0;

/** Jedes Bild: Punkte um den Blickpunkt schweben lassen. night 0..1 */
function updateSparkles(dt, focus, night, visible) {
  points.visible = visible;
  if (!visible) return;
  t += dt;
  const day = 1 - night;
  for (let k = 0; k < N; k++) {
    const p = parts[k];
    p.x += Math.sin(t * .3 + p.ph) * dt * .4 * p.sp; p.z += Math.cos(t * .27 + p.ph * 1.3) * dt * .4 * p.sp;
    p.y += Math.sin(t * .5 + p.ph * 2) * dt * .15;
    if (p.x > R) p.x -= 2 * R; else if (p.x < -R) p.x += 2 * R;
    if (p.z > R) p.z -= 2 * R; else if (p.z < -R) p.z += 2 * R;
    const fy = night > .5 ? .3 + (p.y % 2.2) : p.y;
    pos[k * 3] = focus.x + p.x; pos[k * 3 + 1] = fy; pos[k * 3 + 2] = focus.z + p.z;
    const blink = Math.max(0, Math.sin(t * (1.3 + p.sp) + p.ph * 3)) ** 2;
    const a = day * .35 + night * blink * 1.1;
    col[k * 3] = a * (day > .5 ? 1 : .75); col[k * 3 + 1] = a * (day > .5 ? .97 : 1); col[k * 3 + 2] = a * (day > .5 ? .85 : .35);
  }
  geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true;
}

export { updateSparkles };
