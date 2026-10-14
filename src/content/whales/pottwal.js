// Pottwal. Wale kann man nicht angeln, nur entdecken.
export default {
  id: 'pottwal',
  label: 'Pottwal', plural: 'Pottwale',
  scale: { sea: 1, underwater: .55 }, // Größe an der Oberfläche und unter Wasser
  model({ g, ell, fluke, box }) {
    ell('#4A4440',2.1,2.1,4.4,0,.1,1.5); box(g,'#4A4440',1.5,1.5,.8,0,.15,3.4); ell('#4A4440',2,1.9,5.4,0,0,-.8);
    box(g,'#3A3430',.6,.3,2.8,0,-.95,2.1);
    for(let k=0;k<5;k++)box(g,'#EDE6D6',.05,.12,.05,.15,-.8,1.2+k*.5,false);
    box(g,'#4A4440',.3,.3,.8,0,.95,-1.8);
    for(const x of[-1,1]){const f=box(g,'#3A3430',.9,.1,.4,x*1.1,-.5,1);f.rotation.y=x*.6;}
    ell('#4A4440',1,1,2.8,0,0,-3.9); fluke('#3A3430',1.5,-5.2);
    for(const x of[-1.01,1.01])box(g,'#151515',.05,.12,.12,x,-.2,1.2,false);
  },
};
