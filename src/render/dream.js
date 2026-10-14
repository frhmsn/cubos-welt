// Traumfilter: macht aus dem Bild eine weiche Spielzeug-Welt.
//   Miniatur-Unschärfe oben und unten (Tilt-Shift), sanftes Leuchten (Bloom),
//   Pastellfarben mit leicht aufgehellten, lila Schatten, weiche Vignette.
// Leistung: Szene einmal in voller Auflösung (mit Kantenglättung), Unschärfe in halber Auflösung (3 kleine Durchgänge).
// Abschaltbar im Menü; schaltet sich selbst ab, wenn das Gerät zu langsam ist (core/loop.js).
import { renderer } from './renderer.js';

const KEY = 'cubos-traumfilter';
let enabled = true, autoOff = false;
try { enabled = localStorage.getItem(KEY) !== '0'; } catch (e) {}

const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const quadScene = new THREE.Scene();
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null);
quad.frustumCulled = false; quadScene.add(quad);
const VERT = 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';

const downMat = new THREE.ShaderMaterial({
  uniforms: { tSrc: { value: null }, uTexel: { value: new THREE.Vector2() } },
  vertexShader: VERT,
  fragmentShader: `uniform sampler2D tSrc;uniform vec2 uTexel;varying vec2 vUv;
    void main(){vec2 o=uTexel*.75;gl_FragColor=.25*(texture2D(tSrc,vUv+vec2(-o.x,-o.y))+texture2D(tSrc,vUv+vec2(o.x,-o.y))+texture2D(tSrc,vUv+vec2(-o.x,o.y))+texture2D(tSrc,vUv+vec2(o.x,o.y)));}`,
  depthTest: false, depthWrite: false,
});
const blurMat = new THREE.ShaderMaterial({
  uniforms: { tSrc: { value: null }, uDir: { value: new THREE.Vector2() } },
  vertexShader: VERT,
  fragmentShader: `uniform sampler2D tSrc;uniform vec2 uDir;varying vec2 vUv;
    void main(){vec4 c=texture2D(tSrc,vUv)*.227;
      c+=(texture2D(tSrc,vUv+uDir*1.385)+texture2D(tSrc,vUv-uDir*1.385))*.316;
      c+=(texture2D(tSrc,vUv+uDir*3.231)+texture2D(tSrc,vUv-uDir*3.231))*.0703;
      gl_FragColor=c;}`,
  depthTest: false, depthWrite: false,
});
const compMat = new THREE.ShaderMaterial({
  uniforms: { tScene: { value: null }, tBlur: { value: null }, uTilt: { value: 1 }, uFocus: { value: .5 }, uBloom: { value: 1 }, uNight: { value: 0 } },
  vertexShader: VERT,
  fragmentShader: `uniform sampler2D tScene,tBlur;uniform float uTilt,uFocus,uBloom,uNight;varying vec2 vUv;
    void main(){
      vec3 c=texture2D(tScene,vUv).rgb,b=texture2D(tBlur,vUv).rgb;
      float t=smoothstep(.1,.46,abs(vUv.y-uFocus))*uTilt;
      c=mix(c,b,t);
      float bl=max(dot(b,vec3(.299,.587,.114))-mix(.74,.42,uNight),0.)/.26;
      c+=b*bl*uBloom*(.35+uNight*.5);
      float l=dot(c,vec3(.299,.587,.114));
      c=mix(vec3(l),c,.86);
      c=c*.93+vec3(.05,.04,.065)*(1.-uNight*.5);
      c*=vec3(1.03,1.,.965);
      vec2 q=vUv-.5;c*=1.-dot(q,q)*.5;
      gl_FragColor=vec4(c,1.);}`,
  depthTest: false, depthWrite: false,
});

let rtScene = null, rtA = null, rtB = null;
const size = new THREE.Vector2();
function ensureTargets() {
  renderer.getDrawingBufferSize(size);
  const w = Math.max(1, size.x | 0), h = Math.max(1, size.y | 0);
  if (rtScene && rtScene.width === w && rtScene.height === h) return;
  for (const r of [rtScene, rtA, rtB]) if (r) r.dispose();
  const ms = renderer.capabilities.isWebGL2 && THREE.WebGLMultisampleRenderTarget;
  rtScene = ms ? new THREE.WebGLMultisampleRenderTarget(w, h) : new THREE.WebGLRenderTarget(w, h);
  if (ms) rtScene.samples = 4;
  const hw = Math.max(1, w >> 1), hh = Math.max(1, h >> 1);
  rtA = new THREE.WebGLRenderTarget(hw, hh, { depthBuffer: false });
  rtB = new THREE.WebGLRenderTarget(hw, hh, { depthBuffer: false });
}
function pass(mat, target) { quad.material = mat; renderer.setRenderTarget(target); renderer.render(quadScene, quadCam); }

/**
 * Zeichnet scene mit cam, mit oder ohne Traumfilter.
 * tilt: Stärke der Miniatur-Unschärfe (1 im Baumodus, wenig beim Laufen), night: 0..1 (nachts leuchtet es stärker).
 */
function renderDream(scene, cam, { tilt = 1, night = 0 } = {}) {
  if (!enabled || autoOff) { renderer.setRenderTarget(null); renderer.render(scene, cam); return; }
  ensureTargets();
  renderer.setRenderTarget(rtScene); renderer.render(scene, cam);
  downMat.uniforms.tSrc.value = rtScene.texture; downMat.uniforms.uTexel.value.set(1 / rtScene.width, 1 / rtScene.height); pass(downMat, rtA);
  blurMat.uniforms.tSrc.value = rtA.texture; blurMat.uniforms.uDir.value.set(1.6 / rtA.width, 0); pass(blurMat, rtB);
  blurMat.uniforms.tSrc.value = rtB.texture; blurMat.uniforms.uDir.value.set(0, 1.6 / rtA.height); pass(blurMat, rtA);
  const u = compMat.uniforms;
  u.tScene.value = rtScene.texture; u.tBlur.value = rtA.texture; u.uTilt.value = tilt; u.uNight.value = night;
  pass(compMat, null);
}

function setDream(on) { enabled = !!on; autoOff = false; try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {} }
const dreamOn = () => enabled && !autoOff;
/** Von der Spielschleife aufgerufen, wenn das Gerät trotz kleinster Auflösung zu langsam ist. */
function dreamAutoOff() { if (enabled && !autoOff) { autoOff = true; return true; } return false; }

export { dreamAutoOff, dreamOn, renderDream, setDream };
