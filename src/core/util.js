// Kleine Helfer ohne Spielbezug: DOM-Abfrage, clamp, Zufallsgenerator mit Startwert.

const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

/** Kleinster Winkelunterschied a-b im Bereich -PI..PI. */
const angDiff=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));

export { $, angDiff, clamp, mulberry };
