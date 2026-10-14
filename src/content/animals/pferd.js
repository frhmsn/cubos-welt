// Pferd
export default {
  id: 'pferd',
  label: 'Pferd',
  speed: 1.1, // Laufgeschwindigkeit
  // Tier schaut nach +z. Beine mit leg(g, legs, breite, höhe, x, y, z, farbe, phase) anlegen, dann wackeln sie beim Laufen.
  model({ g, box, leg, legs }) {
    const c='#8B5A2B',m='#3A2414';
    box(g,c,.52,.56,1.34,0,1.3,0);
    const nk=box(g,c,.3,.75,.32,0,1.68,.62); nk.rotation.x=.55;
    const hd=box(g,c,.28,.28,.58,0,2.0,.92); hd.rotation.x=.35;
    const mn=box(g,m,.08,.7,.14,0,1.75,.5); mn.rotation.x=.55;
    const tl=box(g,m,.1,.6,.12,0,1.15,-.72); tl.rotation.x=-.35;
    leg(g,legs,.13,1.02,-.17,1.05,.5,c,0); leg(g,legs,.13,1.02,.17,1.05,.5,c,Math.PI); leg(g,legs,.13,1.02,-.17,1.05,-.5,c,Math.PI); leg(g,legs,.13,1.02,.17,1.05,-.5,c,0);
  },
};
