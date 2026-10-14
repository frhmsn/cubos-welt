// Hund
export default {
  id: 'hund',
  label: 'Hund',
  speed: 1.7, // Laufgeschwindigkeit
  // Tier schaut nach +z. Beine mit leg(g, legs, breite, höhe, x, y, z, farbe, phase) anlegen, dann wackeln sie beim Laufen.
  model({ g, box, leg, legs }) {
    const c='#A0673A';
    box(g,c,.32,.3,.72,0,.47,0); box(g,c,.3,.28,.32,0,.66,.46); box(g,'#7A4A28',.16,.13,.16,0,.6,.66); box(g,'#151515',.07,.06,.04,0,.63,.75);
    box(g,'#6B3F20',.08,.16,.1,-.13,.78,.42); box(g,'#6B3F20',.08,.16,.1,.13,.78,.42);
    const t=box(g,c,.07,.07,.32,0,.62,-.46); t.rotation.x=-.6;
    leg(g,legs,.09,.33,-.1,.34,.26,c,0); leg(g,legs,.09,.33,.1,.34,.26,c,Math.PI); leg(g,legs,.09,.33,-.1,.34,-.26,c,Math.PI); leg(g,legs,.09,.33,.1,.34,-.26,c,0);
  },
};
