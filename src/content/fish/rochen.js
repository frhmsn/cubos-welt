// Rochen: flach und breit wie ein Drachen, mit langem, dünnem Schwanz.
export default {
  id: 'rochen',
  label: 'Rochen', plural: 'Rochen',
  length: [.5, 2], // Meter, zufällig beim Fang
  habitat: ['meer'],
  spawn: { meer: .06 }, // Häufigkeit je Gewässer
  speed: .7, jumps: false,
  scale: { shadow: 1.4, underwater: 1.3, aquarium: .4, rod: 1.1, jump: 1.1 },
  model({ g, body, box }) {
    // Rautenform: zwei flache, um 45 Grad gedrehte Platten (oben braun, unten hell)
    box(g,'#8A7458',1.05,.1,1.05,0,0,0).rotation.y = Math.PI / 4;
    box(g,'#EDE6D8',.98,.04,.98,0,-.07,0,false).rotation.y = Math.PI / 4;
    body('#7A6650',.5,.16,.7,.04,.05);
    for (const [x, z] of [[.3,.1],[-.35,0],[.12,-.25],[-.15,.3],[.45,-.12],[-.5,-.1]]) box(g,'#5E4E3A',.08,.02,.08,x,.065,z,false);
    const t = box(g,'#6E5C44',.08,.08,1.3,0,.02,-1.25); t.rotation.x = .05;
    box(g,'#151515',.07,.07,.07,.13,.12,.32,false); box(g,'#151515',.07,.07,.07,-.13,.12,.32,false);
  },
};
