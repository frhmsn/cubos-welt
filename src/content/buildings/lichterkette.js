// Lichterkette
export default {
  id: 'lichterkette',
  label: 'Lichterkette',
  category: 'licht', // Inventar-Kategorie
  walkable: true, // man läuft hindurch
  // Ein Feld ist 4x4 Einheiten, Mitte bei 0, Tür nach +z. Rückgabe: { g, cols, lights }
  model(seed, o, { G, box, fairyMats, glowWarm, mesh, glow }) {
    const g=new THREE.Group(),cols=[],P=[[-1.65,-1.65],[1.65,-1.65],[1.65,1.65],[-1.65,1.65]];
    for(const [x,z] of P){mesh(G('kpole',()=>new THREE.CylinderGeometry(.05,.07,2.6,6)),'#7A5232',x,1.3,z,g);cols.push(['c',x,z,.12]);}
    let n=0;
    for(let s=0;s<4;s++){
      const a=P[s],b=P[(s+1)%4],steps=8;let prev=null;
      for(let k=0;k<=steps;k++){
        const t=k/steps,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,y=2.5-.55*Math.sin(Math.PI*t);
        if(prev){const dx=x-prev[0],dy=y-prev[1],dz=z-prev[2],L=Math.hypot(dx,dy,dz),w=box(g,'#2A2A2A',.025,.025,L,(x+prev[0])/2,(y+prev[1])/2,(z+prev[2])/2,false);w.lookAt(x,y,z);w.position.set((x+prev[0])/2,(y+prev[1])/2,(z+prev[2])/2);w.lookAt(x,y,z);}
        if(k>0&&k<steps){mesh(G('fbulb',()=>new THREE.SphereGeometry(.09,8,6)),fairyMats[n++%5],x,y-.1,z,g,false);}
        prev=[x,y,z];
      }
    }
    glow(g,glowWarm,0,0,3.4);
    return {g,cols,lights:[[0,2.1,0,0xffc8e0,1.4,10]]};
  },
};
