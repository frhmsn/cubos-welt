// U-Boot
export default {
  id: 'uboot',
  label: 'U-Boot',
  category: 'see', // Inventar-Kategorie: 'auto' oder 'see'
  speed: 3, max: 8, // Beschleunigung und Höchstgeschwindigkeit
  boat: true, sub: true, // kann abtauchen
  // Fahrzeug schaut nach +z. Rückgabe optional: fertige Gruppe (sonst wird g zusammengefasst).
  model({ g, M, G, BX, bake, box, mesh, headMat, winMat }) {
    const y=M('#F5C211',{roughness:.4,metalness:.25}),dk=M('#2A2D31');
    mesh(G('subbody',()=>{const c=new THREE.CylinderGeometry(.55,.55,2.3,16);c.rotateX(Math.PI/2);return c;}),y,0,.2,0,g);
    for(const z of[-1.15,1.15]){const e=mesh(G('subend',()=>new THREE.SphereGeometry(.55,16,10)),y,0,.2,z,g);e.scale.set(1,1,z>0?1.25:.9);}
    box(g,y,.5,.6,.95,0,.85,-.1);
    box(g,dk,.52,.14,.97,0,1.08,-.1,false);
    mesh(G('peri',()=>new THREE.CylinderGeometry(.04,.04,.6,6)),'#5A6168',.12,1.4,.15,g);box(g,'#5A6168',.08,.08,.22,.12,1.68,.24);
    for(const z of[-.6,0,.6])for(const x of[-1,1]){const w=mesh(G('port',()=>{const c=new THREE.CylinderGeometry(.13,.13,.06,12);c.rotateZ(Math.PI/2);return c;}),winMat,x*.54,.32,z,g,false);}
    box(g,y,1.5,.06,.35,0,.2,-1.3); box(g,y,.06,.7,.35,0,.25,-1.3);
    mesh(BX(.22,.14,.06),headMat,0,.25,1.83,g,false);
    const pr=new THREE.Group();pr.position.set(0,.2,-1.68);g.add(pr);
    for(const a of[0,Math.PI/2]){const bl=box(pr,'#C9A227',.08,.6,.05,0,0,0);bl.rotation.z=a;}
    pr.children.forEach(m=>{m.userData.keep=true;m.userData.prop=1;});
    const out=bake(g);out.userData.props=out.children.filter(m=>m.userData.prop);return out;
  },
};
