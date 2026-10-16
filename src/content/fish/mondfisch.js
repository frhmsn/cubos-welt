// Mondfisch. Werte siehe content/fish/README.md.
export default {
  id: 'mondfisch',
  label: 'Mondfisch', plural: 'Mondfische',
  length: [1, 3], // Meter, zufällig beim Fang
  habitat: ['meer'],
  taler: 10, // so viele Taler gibt der Markt für einen Fisch
  spawn: { meer: .05 }, // Häufigkeit je Gewässer
  speed: .3, jumps: false,
  scale: { shadow: 1.8, underwater: 1, aquarium: .28, rod: .9, jump: 1.1 },
  wow: true, // besonderer Fang: "Wow, ein ...!"
  model({ g, body, box, mesh, M, finGeo, fl }) {
    body('#A7AFB6',.24,1.15,1.0,0,0); body('#D9DEE2',.2,.7,.75,-.15,.05);
    box(g,'#8D959C',.05,.75,.2,0,.8,-.25); box(g,'#8D959C',.05,.75,.2,0,-.8,-.25);
    box(g,'#9CA4AB',.06,1.0,.12,0,0,-.5);
    box(g,'#8D959C',.12,.08,.06,0,-.02,.5,false);
    box(g,'#151515',.26,.08,.08,0,.18,.34,false);
  },
};
