// Gartenlampen
export default {
  id: 'gartenlampe',
  label: 'Gartenlampen',
  category: 'licht', // Inventar-Kategorie
  walkable: true, // man läuft hindurch
  // Ein Feld ist 4x4 Einheiten, Mitte bei 0, Tür nach +z. Rückgabe: { g, cols, lights }
  model(seed, o, { BX, box, bulbMat, glowWarm, mesh, glow }) {
    const g=new THREE.Group(),cols=[];
    for(const [x,z] of [[-1.3,-1.3],[1.3,-1.3],[-1.3,1.3],[1.3,1.3],[0,0]]){
      box(g,'#3D434B',.18,.5,.18,x,.25,z); mesh(BX(.2,.14,.2),bulbMat,x,.57,z,g,false); box(g,'#3D434B',.26,.04,.26,x,.66,z);
      glow(g,glowWarm,x,z,1.3); cols.push(['c',x,z,.12]);
    }
    for(let k=0;k<7;k++)box(g,'#C9BFAE',.55,.03,.4,-1.5+k*.5,.015,(k%2)*.12-.06,false);
    return {g,cols,lights:[[0,.8,0,0xffe0b0,1.1,7]]};
  },
};
