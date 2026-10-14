// Buckelwal. Wale kann man nicht angeln, nur entdecken.
export default {
  id: 'buckelwal',
  label: 'Buckelwal', plural: 'Buckelwale',
  scale: { sea: 1, underwater: .55 }, // Größe an der Oberfläche und unter Wasser
  model({ g, ell, fluke, box }) {
    ell('#3A4250',2.2,1.9,7,0,0,0); ell('#D9DDE2',1.9,1.1,6.2,0,-.45,.2);
    for(let k=0;k<6;k++)box(g,'#C2C7CD',.06,.05,2.4,(k-2.5)*.2,-.92,1.4,false);
    for(const x of[-1,1]){const f=box(g,'#E4E7EA',2.8,.12,.55,x*2.1,-.4,1.2);f.rotation.set(0,x*.5,x*-.35);}
    box(g,'#3A4250',.18,.35,.5,0,.95,-1.6);
    ell('#3A4250',1,1,3,0,.05,-3.6); fluke('#3A4250',1.6,-5);
    for(const x of[-.75,.75])box(g,'#151515',.1,.12,.12,x,-.1,2.3,false);
  },
};
