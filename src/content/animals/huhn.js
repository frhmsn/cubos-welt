// Huhn
export default {
  id: 'huhn',
  label: 'Huhn',
  speed: .8, // Laufgeschwindigkeit
  // Tier schaut nach +z. Beine mit leg(g, legs, breite, höhe, x, y, z, farbe, phase) anlegen, dann wackeln sie beim Laufen.
  model({ g, box, leg, legs }) {
    box(g,'#FBFBF7',.28,.28,.36,0,.33,0); box(g,'#FBFBF7',.17,.2,.17,0,.55,.17); box(g,'#E23B2E',.05,.1,.14,0,.7,.17);
    box(g,'#F5A623',.07,.05,.1,0,.55,.29); box(g,'#E23B2E',.05,.08,.04,0,.47,.27); box(g,'#EDEDE6',.05,.2,.16,0,.45,-.2);
    leg(g,legs,.04,.2,-.07,.2,0,'#F5A623',0); leg(g,legs,.04,.2,.07,.2,0,'#F5A623',Math.PI);
  },
};
