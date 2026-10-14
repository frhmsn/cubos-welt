// Makrele. Werte siehe content/fish/README.md.
export default {
  id: 'makrele',
  label: 'Makrele', plural: 'Makrelen', article: 'eine',
  length: [.25, .5], // Meter, zufällig beim Fang
  habitat: ['meer'],
  spawn: { meer: .14 }, // Häufigkeit je Gewässer
  speed: 1.4, jumps: true,
  scale: { shadow: .7, underwater: 1.8, aquarium: .5, rod: 1.6, jump: 1.1 },
  model({ g, body, box, mesh, M, finGeo, fl }) {
    body('#2F7F8F',.2,.26,1.0,.02,0); body('#E4ECEE',.18,.14,.85,-.08,0);
    for(let k=0;k<6;k++){const b=box(g,'#16343B',.21,.04,.06,0,.09,-.3+k*.12,false);b.rotation.x=(k%2?.5:-.5);}
    const t1=box(g,'#2A5560',.04,.3,.1,0,.12,-.56);t1.rotation.x=-.6;const t2=box(g,'#2A5560',.04,.3,.1,0,-.12,-.56);t2.rotation.x=.6;
    for(const z of[-.3,-.4])box(g,'#F2D24A',.05,.06,.05,0,.14,z,false);
    box(g,'#151515',.22,.05,.05,0,.05,.36,false);
  },
};
