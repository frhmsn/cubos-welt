// Garage
export default {
  id: 'garage',
  label: 'Garage',
  category: 'haus', // Inventar-Kategorie
  house: true, // begehbar
  // Ein Feld ist 4x4 Einheiten, Mitte bei 0, Tür nach +z. Rückgabe: { g, cols, lights }
  model(seed, o, { BX, G, M, box, bulbMat, doorMat, mesh }) {
    const g=new THREE.Group(),cols=[],w=3.5,d=3.7,h=2.55,t=.16,hw=w/2,hd=d/2,dw=2.8,dh=2.15,wm=M('#D9D4CC');
    box(g,wm,w,h,t,0,h/2,-hd+t/2); cols.push(['b',-hw,hw,-hd,-hd+t]);
    box(g,wm,t,h,d,-hw+t/2,h/2,0); cols.push(['b',-hw,-hw+t,-hd,hd]);
    box(g,wm,t,h,d,hw-t/2,h/2,0); cols.push(['b',hw-t,hw,-hd,hd]);
    const pw=(w-dw)/2;
    box(g,wm,pw,h,t,-hw+pw/2,h/2,hd-t/2); box(g,wm,pw,h,t,hw-pw/2,h/2,hd-t/2);
    cols.push(['b',-hw,-hw+pw,hd-t,hd],['b',hw-pw,hw,hd-t,hd]);
    box(g,wm,dw,h-dh,t,0,dh+(h-dh)/2,hd-t/2);
    box(g,'#5A6168',w+.3,.2,d+.3,0,h+.1,0);
    box(g,'#A9AEB3',w-2*t,.03,d-2*t,0,.015,0,false);
    box(g,'#B8BDC2',dw+.2,.02,.9,0,.01,hd+.45,false);
    box(g,'#F2C230',.08,.02,1.6,0,.035,-.2,false);
    box(g,'#8B6A45',1.8,.08,.42,0,1.25,-hd+.37); box(g,'#8B6A45',1.8,.08,.42,0,1.8,-hd+.37);
    box(g,'#D7261E',.5,.3,.3,-.5,1.44,-hd+.37); box(g,'#3F6FB5',.4,.22,.3,.4,1.4,-hd+.37); box(g,'#F2C230',.3,.25,.3,.1,1.97,-hd+.37);
    for(let k=0;k<3;k++)mesh(G('tyre',()=>new THREE.CylinderGeometry(.32,.32,.2,12)),'#1F1F1F',hw-.5,.1+k*.21,-hd+.55,g);
    mesh(BX(.9,.06,.18),bulbMat,0,h-.07,0,g,false);
    const door=mesh(BX(dw,dh,.07),doorMat,0,dh/2,hd-.09,g); door.userData.keep=true; door.userData.door=dh;
    return {g,cols,lights:[[0,2.25,0,0xfff0d0,1.1,6]]};
  },
};
