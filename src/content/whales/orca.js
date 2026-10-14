// Orca. Wale kann man nicht angeln, nur entdecken.
export default {
  id: 'orca',
  label: 'Orca', plural: 'Orcas',
  scale: { sea: .75, underwater: .7 }, // Größe an der Oberfläche und unter Wasser
  model({ g, ell, fluke, box }) {
    ell('#15171A',1.7,1.8,6,0,0,0); ell('#F4F4F2',1.4,.9,4.6,0,-.5,.6);
    for(const x of[-.7,.7])box(g,'#F4F4F2',.08,.4,.9,x*1.0,.25,1.9,false);
    box(g,'#C9CCD0',1.2,.4,.9,0,.75,-.6,false);
    const d=box(g,'#15171A',.15,1.9,.7,0,1.6,-.2);d.rotation.x=-.15;
    for(const x of[-1,1]){const f=box(g,'#15171A',1.2,.1,.7,x*1.1,-.5,1.1);f.rotation.y=x*.4;}
    ell('#15171A',.8,.8,2.6,0,0,-3.1); fluke('#15171A',1.3,-4.4);
  },
};
