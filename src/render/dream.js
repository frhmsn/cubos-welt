// Traumfilter: macht aus dem Bild eine weiche Spielzeug-Welt.
//   Miniatur-Unschärfe oben und unten (Tilt-Shift), sanftes Leuchten (Bloom),
//   Pastellfarben mit leicht aufgehellten, lila Schatten, weiche Vignette.
// Leistung: Szene einmal in voller Auflösung (mit Kantenglättung), Unschärfe in halber Auflösung (3 kleine Durchgänge).
// Stile (Spielzeug als Standard, Bilderbuch, Märchenbuch, Abendgold, Pastell, Klar) im Menü wählbar; schaltet sich selbst ab, wenn das Gerät zu langsam ist (core/loop.js).
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
// ---------- Stile ----------
// Jeder Stil ist nur ein Satz Zahlen für denselben Abschluss-Shader. Neuer Stil: Eintrag hier ergänzen.
const STYLES = {
  klar:       { label: 'Klar',        tilt: 0,   focusW: .1,  bloom: 0,   sat: 1,    contrast: 1,    lift: [0, 0, 0],         warm: [1, 1, 1],          vig: 0,   grain: 0,   ink: 0 },
  bilderbuch: { label: 'Bilderbuch',  tilt: .5,  focusW: .14, bloom: 1,   sat: .86,  contrast: .93,  lift: [.05, .04, .065],  warm: [1.03, 1, .965],    vig: .5,  grain: 0,   ink: 0 },
  diorama:    { label: 'Spielzeug',   tilt: .6,  focusW: .12, bloom: .7,  sat: 1.3,  contrast: 1.12, lift: [0, 0, .01],       warm: [1.05, 1.02, .97],  vig: .25, grain: 0,   ink: 0,
    light: { sun: 0xfff6e0, sunK: 1.15, skyTop: 0x2f8cff, skyHor: 0xbfe8ff, skyMix: .8 } },
  maerchen:   { label: 'Märchenbuch', tilt: .2,  focusW: .12, bloom: 1.1, sat: .62,  contrast: .88,  lift: [.1, .085, .055],  warm: [1.06, 1.01, .9],   vig: .75, grain: .2,  ink: 1.6,
    light: { sun: 0xfff0d0, sunK: .95, skyTop: 0x9fc6e8, skyHor: 0xf6ead2, skyMix: .85, ground: 0xc8b8a8 } },
  abendgold:  { label: 'Abendgold',   tilt: .4,  focusW: .14, bloom: 1.9, sat: 1.05, contrast: .95,  lift: [.07, .03, .02],   warm: [1.18, .97, .78],   vig: .8,  grain: 0,   ink: 0,
    light: { sun: 0xffb46a, sunK: 1.05, skyTop: 0x6d7fd0, skyHor: 0xffc58a, skyMix: .9, ground: 0xc79a8a } },
  pastell:    { label: 'Pastell',     tilt: .45, focusW: .14, bloom: 1.3, sat: .55,  contrast: .82,  lift: [.15, .12, .17],   warm: [1.02, .98, 1.04],  vig: .35, grain: .04, ink: 0,
    light: { sun: 0xfff0f6, sunK: .95, skyTop: 0xb9b2f0, skyHor: 0xffd9ec, skyMix: .85, ground: 0xd8c0e8 } },
};
const STYLE_KEY = 'cubos-stil';
let style = 'diorama';
try { const v = localStorage.getItem(STYLE_KEY); if (v && STYLES[v]) style = v; else if (localStorage.getItem(KEY) === '0') style = 'klar'; } catch (e) {}

const compMat = new THREE.ShaderMaterial({
  uniforms: {
    tScene: { value: null }, tBlur: { value: null }, uTexel: { value: new THREE.Vector2() },
    uTilt: { value: 1 }, uFocus: { value: .5 }, uFocusW: { value: .1 }, uBloom: { value: 1 }, uNight: { value: 0 },
    uSat: { value: .86 }, uContrast: { value: .93 }, uLift: { value: new THREE.Vector3() }, uWarm: { value: new THREE.Vector3(1, 1, 1) },
    uVig: { value: .5 }, uGrain: { value: 0 }, uInk: { value: 0 },
  },
  vertexShader: VERT,
  fragmentShader: `uniform sampler2D tScene,tBlur;uniform vec2 uTexel;uniform float uTilt,uFocus,uFocusW,uBloom,uNight,uSat,uContrast,uVig,uGrain,uInk;uniform vec3 uLift,uWarm;varying vec2 vUv;
    float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
    float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
    float lum(vec3 c){return dot(c,vec3(.299,.587,.114));}
    void main(){
      vec3 c=texture2D(tScene,vUv).rgb,b=texture2D(tBlur,vUv).rgb;
      if(uInk>0.){
        vec2 t=uTexel*(1.2+uInk*.6);
        float l00=lum(texture2D(tScene,vUv+vec2(-t.x,-t.y)).rgb),l10=lum(texture2D(tScene,vUv+vec2(t.x,-t.y)).rgb);
        float l01=lum(texture2D(tScene,vUv+vec2(-t.x,t.y)).rgb),l11=lum(texture2D(tScene,vUv+vec2(t.x,t.y)).rgb);
        float e=length(vec2(l00+l01-l10-l11,l00+l10-l01-l11));
        c*=1.-smoothstep(.06,.3,e)*min(uInk,1.)*.75;
        c=mix(c,b,.18*uInk);
      }
      float tt=smoothstep(uFocusW,.46,abs(vUv.y-uFocus))*min(uTilt,1.);
      c=mix(c,b,tt);
      if(uTilt>1.)c=mix(c,b,smoothstep(.3,.5,abs(vUv.y-uFocus))*(uTilt-1.));
      float bl=max(lum(b)-mix(.74,.42,uNight),0.)/.26;
      c+=b*bl*uBloom*(.35+uNight*.5);
      float l=lum(c);
      c=mix(vec3(l),c,uSat);
      c=(c-.5)*uContrast+.5;
      c=c+uLift*(1.-uNight*.5);
      c*=uWarm;
      if(uGrain>0.){vec2 fp=gl_FragCoord.xy;float n=vn(fp*.012)*.6+vn(fp*.05)*.3+h(fp)*.1;c*=1.-uGrain*(n-.5);}
      vec2 q=vUv-.5;c*=1.-dot(q,q)*uVig;
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
  // Mit Stencil bekommt das Bild einen 24-Bit-Tiefenpuffer. Ohne nimmt Three.js r128 nur 16 Bit,
  // und weit herausgezoomt flimmern Wiese und Boden dann in Streifen durcheinander.
  const opt = { stencilBuffer: true };
  rtScene = ms ? new THREE.WebGLMultisampleRenderTarget(w, h, opt) : new THREE.WebGLRenderTarget(w, h, opt);
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
  if (!enabled || autoOff || style === 'klar') { renderer.setRenderTarget(null); renderer.render(scene, cam); return; }
  ensureTargets();
  renderer.setRenderTarget(rtScene); renderer.render(scene, cam);
  downMat.uniforms.tSrc.value = rtScene.texture; downMat.uniforms.uTexel.value.set(1 / rtScene.width, 1 / rtScene.height); pass(downMat, rtA);
  blurMat.uniforms.tSrc.value = rtA.texture; blurMat.uniforms.uDir.value.set(1.6 / rtA.width, 0); pass(blurMat, rtB);
  blurMat.uniforms.tSrc.value = rtB.texture; blurMat.uniforms.uDir.value.set(0, 1.6 / rtA.height); pass(blurMat, rtA);
  const u = compMat.uniforms;
  const st = STYLES[style];
  u.tScene.value = rtScene.texture; u.tBlur.value = rtA.texture; u.uTexel.value.set(1 / rtScene.width, 1 / rtScene.height);
  u.uTilt.value = tilt * st.tilt; u.uFocusW.value = st.focusW; u.uNight.value = night; u.uBloom.value = st.bloom;
  u.uSat.value = st.sat; u.uContrast.value = st.contrast; u.uLift.value.fromArray(st.lift); u.uWarm.value.fromArray(st.warm);
  u.uVig.value = st.vig; u.uGrain.value = st.grain; u.uInk.value = st.ink;
  pass(compMat, null);
}

/** Stil wählen (ID aus STYLES). 'klar' heißt ohne Filter. */
function setStyle(id) { if (!STYLES[id]) return; style = id; enabled = true; autoOff = false; try { localStorage.setItem(STYLE_KEY, id); localStorage.setItem(KEY, '1'); } catch (e) {} }
const styleId = () => style;
/** Licht-Angaben des aktuellen Stils für Tag und Nacht (oder null). */
const styleLight = () => (enabled && !autoOff && STYLES[style].light) || null;
const STYLE_ORDER = Object.keys(STYLES);
const styleLabel = (id = style) => STYLES[id].label;
function setDream(on) { enabled = !!on; autoOff = false; try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {} }
const dreamOn = () => enabled && !autoOff;
/** Von der Spielschleife aufgerufen, wenn das Gerät trotz kleinster Auflösung zu langsam ist. */
function dreamAutoOff() { if (enabled && !autoOff) { autoOff = true; return true; } return false; }

export { STYLE_ORDER, dreamAutoOff, dreamOn, renderDream, setDream, setStyle, styleId, styleLabel, styleLight };
