// Thunfisch. Werte siehe content/fish/README.md.
export default {
  id: 'thunfisch',
  label: 'Thunfisch', plural: 'Thunfische',
  length: [.8, 2.2], // Meter, zufällig beim Fang
  habitat: ['meer'],
  taler: 6, // so viele Taler gibt der Markt für einen Fisch
  spawn: { meer: .23 }, // Häufigkeit je Gewässer
  speed: 1.6, jumps: true,
  scale: { shadow: 1.5, underwater: 1.3, aquarium: .36, rod: 1.1, jump: 1.1 },
  model({ g, body, box, mesh, M, finGeo, fl }) {
    body('#1F3D78',.36,.46,1.25,.03,0); body('#C9D2DA',.32,.26,1.1,-.1,0);
    const t1=box(g,'#1F3D78',.04,.5,.12,0,.2,-.74);t1.rotation.x=-.6;const t2=box(g,'#1F3D78',.04,.5,.12,0,-.2,-.74);t2.rotation.x=.6;
    for(const z of[-.3,-.42])box(g,'#F2C230',.06,.08,.06,0,.2,z,false);
    box(g,'#151515',.38,.06,.06,0,.08,.45,false);
  },
};
