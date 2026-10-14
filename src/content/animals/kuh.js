// Kuh
export default {
  id: 'kuh',
  label: 'Kuh',
  speed: .55, // Laufgeschwindigkeit
  // Tier schaut nach +z. Beine mit leg(g, legs, breite, höhe, x, y, z, farbe, phase) anlegen, dann wackeln sie beim Laufen.
  model({ g, box, leg, legs }) {
    const c='#F7F7F2',p='#1D1D1D';
    box(g,c,.72,.66,1.32,0,1.02,0); box(g,p,.74,.32,.36,0,1.1,.15); box(g,p,.4,.04,.4,.1,1.36,-.35); box(g,p,.74,.25,.25,0,.92,-.4);
    box(g,c,.42,.42,.46,0,1.18,.84); box(g,'#F2A7A7',.36,.2,.12,0,1.06,1.1); box(g,'#EDE3C8',.08,.14,.08,-.18,1.45,.8); box(g,'#EDE3C8',.08,.14,.08,.18,1.45,.8);
    box(g,'#F2A7A7',.3,.14,.3,0,.66,-.3);
    leg(g,legs,.15,.7,-.23,.72,.45,c,0); leg(g,legs,.15,.7,.23,.72,.45,c,Math.PI); leg(g,legs,.15,.7,-.23,.72,-.45,c,Math.PI); leg(g,legs,.15,.7,.23,.72,-.45,c,0);
  },
};
