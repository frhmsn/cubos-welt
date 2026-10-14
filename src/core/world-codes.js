// Welt-Codes: Welten als Text kodieren und wieder einlesen.
import '../systems/travel.js'; // Ladereihenfolge: dieses Modul läuft nach systems/travel.js

// ---------- Welt-Codes ----------
function b64(u8){let s='';for(let i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s);}
function unb64(s){const bin=atob(s),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u;}
async function encodeWorld(obj){
  const bytes=new TextEncoder().encode(JSON.stringify(obj));
  if(window.CompressionStream){try{const st=new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'));return 'KUNOWELT1:'+b64(new Uint8Array(await new Response(st).arrayBuffer()));}catch(e){}}
  return 'KUNOWELT0:'+b64(bytes);
}
async function decodeWorld(code){
  const m=String(code).replace(/\s+/g,'').match(/^KUNOWELT([01]):([A-Za-z0-9+/=]+)$/);if(!m)throw new Error('format');
  let u=unb64(m[2]);
  if(m[1]==='1'){if(!window.DecompressionStream)throw new Error('gzip');const st=new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'));u=new Uint8Array(await new Response(st).arrayBuffer());}
  return JSON.parse(new TextDecoder().decode(u));
}

export { decodeWorld, encodeWorld };
