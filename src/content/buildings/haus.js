// Haus
export default {
  id: 'haus',
  label: 'Haus',
  category: 'haus', // Inventar-Kategorie
  house: true, // begehbar
  // Ein Feld ist 4x4 Einheiten, Mitte bei 0, Tür nach +z. Rückgabe: { g, cols, lights }
  model(seed, o, { mulberry, box, shell, gable, chair }) {
    const r=mulberry(seed),g=new THREE.Group(),cols=[];
    const wall=['#F6E6C8','#CFE3F0','#F4D2C4','#DDEBCB','#FFF1B8'][Math.floor(r()*5)];
    const roof=['#C7472E','#8E4A2F','#3F5A73','#B23A48'][Math.floor(r()*4)];
    shell(g,cols,{wall});
    gable(g,3.2,3.2,2.8,wall,roof);
    box(g,'#9C4A3A',.32,.9,.32,.8,3.55,-.7);
    box(g,'#FFFFFF',1,.35,1.7,-.85,.18,-.6); box(g,'#4A90D9',1.03,.12,1.1,-.85,.4,-.33); box(g,'#FFFFFF',.7,.12,.35,-.85,.42,-1.2);
    box(g,'#9B6A3C',.8,.06,.8,.72,.74,-.55); box(g,'#9B6A3C',.1,.72,.1,.72,.36,-.55);
    chair(g,.72,-.05,Math.PI,'#B98552'); chair(g,.72,-1.05,0,'#B98552');
    box(g,'#E06B5C',1.3,.02,.8,.2,.045,.65,false);
    return {g,cols};
  },
};
