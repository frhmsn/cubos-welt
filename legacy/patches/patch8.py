import sys
p='/home/claude/kunos-welt.html'
s=open(p).read()
def rep(old,new,count=1):
    global s
    n=s.count(old)
    if n!=count:
        print('MISMATCH',n,repr(old[:90])); sys.exit(1)
    s=s.replace(old,new)

# ----- Arten -----
rep("""const FISH={
  barsch:{label:'Barsch',plural:'Barsche',len:[.18,.45],sil:.75,speed:.8},
  thunfisch:{label:'Thunfisch',plural:'Thunfische',len:[.8,2.2],sil:1.5,speed:1.6},
  hai:{label:'Hai',plural:'Haie',len:[1.5,3.5],sil:2.5,speed:1.2}
};""","""const FISH={
  barsch:{label:'Barsch',plural:'Barsche',len:[.18,.45],sil:.75,speed:.8,jump:1,uw:1.8,aq:.55,where:'in Seen und im Meer'},
  hecht:{label:'Hecht',plural:'Hechte',len:[.45,1.3],sil:1.2,speed:1.3,jump:1,uw:1.4,aq:.4,where:'in Seen'},
  karpfen:{label:'Karpfen',plural:'Karpfen',len:[.3,.9],sil:.95,speed:.5,jump:1,uw:1.6,aq:.5,where:'in Seen'},
  wels:{label:'Wels',plural:'Welse',len:[.8,2.6],sil:1.8,speed:.45,jump:0,uw:1.2,aq:.28,where:'in Seen'},
  stoer:{label:'Stör',plural:'Störe',len:[.8,2.5],sil:1.7,speed:.6,jump:0,uw:1.2,aq:.28,where:'in Seen und im Meer'},
  thunfisch:{label:'Thunfisch',plural:'Thunfische',len:[.8,2.2],sil:1.5,speed:1.6,jump:1,uw:1.3,aq:.36,where:'im Meer'},
  hai:{label:'Hai',plural:'Haie',len:[1.5,3.5],sil:2.5,speed:1.2,jump:0,uw:1.15,aq:.3,where:'im Meer'}
};
const LAKE_FISH=[['barsch',.3],['hecht',.2],['karpfen',.25],['wels',.15],['stoer',.1]];
const SEA_FISH=[['thunfisch',.4],['barsch',.25],['hai',.2],['stoer',.15]];
function pickFish(sea){const L=sea?SEA_FISH:LAKE_FISH;let r=Math.random();for(const [t,w] of L){if((r-=w)<=0){if(t==='hai'&&fishes.filter(f=>f.type==='hai').length>=4)return 'thunfisch';return t;}}return L[0][0];}""")

# ----- Modelle -----
rep("""  } else if(type==='thunfisch'){
    body('#1F3D78',.36,.46,1.25,.03,0);""","""  } else if(type==='hecht'){
    body('#5E7A3A',.24,.28,1.5,0,0); body('#D9D8B0',.2,.14,1.3,-.08,.05);
    for(const [x,z] of[[.12,.3],[-.12,.1],[.12,-.1],[-.12,-.3],[.12,-.45],[-.12,.45]])box(g,'#C9C78A',.03,.07,.1,x,.04,z,false);
    box(g,'#5E7A3A',.16,.1,.36,0,-.02,.8);
    box(g,'#7A6A2E',.04,.24,.26,0,.18,-.5); const t=box(g,'#7A6A2E',.04,.34,.24,0,0,-.86);
    box(g,'#151515',.26,.05,.05,0,.06,.6,false);
  } else if(type==='karpfen'){
    body('#B8862E',.34,.56,1.0,0,0); body('#E2C27A',.3,.3,.85,-.12,.02);
    for(const z of[-.25,-.05,.15])for(const y of[.1,-.05])box(g,'#9C6E22',.36,.06,.05,0,y,z,false);
    box(g,'#A0522D',.04,.22,.5,0,.3,-.05); const t=box(g,'#A0522D',.04,.4,.26,0,0,-.6);
    for(const x of[-.07,.07]){const b=box(g,'#8C6A3A',.02,.02,.14,x,-.06,.55,false);b.rotation.x=.5;}
    box(g,'#151515',.34,.06,.06,0,.08,.36,false);
  } else if(type==='wels'){
    body('#3E3A34',.46,.34,1.6,0,0); body('#8C8578',.4,.18,1.4,-.1,0);
    box(g,'#3E3A34',.5,.22,.42,0,0,.72);
    for(const x of[-1,1]){const b=box(g,'#2A2622',.03,.03,.7,x*.28,0,.95,false);b.rotation.y=x*.6;}
    for(const x of[-.06,.06]){const b=box(g,'#2A2622',.02,.02,.24,x,-.12,.86,false);b.rotation.x=.6;}
    box(g,'#3E3A34',.04,.12,.9,0,-.16,-.3); const t=box(g,'#3E3A34',.04,.34,.24,0,0,-.86);
    box(g,'#151515',.44,.05,.05,0,.08,.62,false);
  } else if(type==='stoer'){
    body('#6E6A60',.3,.3,1.7,0,0); body('#D8D2C4',.26,.16,1.5,-.08,0);
    box(g,'#6E6A60',.14,.1,.4,0,-.04,.95);
    for(let k=0;k<6;k++){const z=-.55+k*.22;box(g,'#EDE6D6',.06,.06,.08,0,.16,z,false);for(const x of[-.15,.15])box(g,'#EDE6D6',.05,.05,.07,x,.04,z,false);}
    const t1=box(g,'#6E6A60',.04,.5,.14,0,.18,-.95);t1.rotation.x=-.7;const t2=box(g,'#6E6A60',.04,.22,.12,0,-.08,-.9);t2.rotation.x=.5;
    for(const x of[-.04,.04]){const b=box(g,'#EDE6D6',.02,.02,.1,x,-.1,.95,false);b.rotation.x=.9;}
    box(g,'#151515',.32,.05,.05,0,.05,.66,false);
  } else if(type==='thunfisch'){
    body('#1F3D78',.36,.46,1.25,.03,0);""")

# ----- Lebensräume, ausgesetzte Fische -----
rep("""function fishOk(type,x,z){const t=tileAt(x,z);if(!t)return false;const g=gAt(t.i,t.j);return type==='barsch'?(g==='wasser'||g==='meer'):g==='meer';}""",
"""function fishOk(type,x,z){const t=tileAt(x,z);if(!t)return false;const g=gAt(t.i,t.j);
  if(type==='barsch'||type==='stoer')return g==='wasser'||g==='meer';
  if(type==='thunfisch'||type==='hai')return g==='meer';return g==='wasser';}
function anyWater(x,z){const t=tileAt(x,z);if(!t)return false;const g=gAt(t.i,t.j);return g==='wasser'||g==='meer';}
const okF=(f,x,z)=>f.free?anyWater(x,z):fishOk(f.type,x,z);""")
rep("""    if(!fishOk(f.type,f.x,f.z)){removeFish(f);continue;}""","""    if(!okF(f,f.x,f.z)){removeFish(f);continue;}""")
rep("""if(fishOk(f.type,nx,nz)){f.tx=nx;f.tz=nz;break;}}dx=f.tx-f.x;""","""if(okF(f,nx,nz)){f.tx=nx;f.tz=nz;break;}}dx=f.tx-f.x;""")
rep("""      if(fishOk(f.type,nx,nz)){f.x=nx;f.z=nz;}else{f.tx=f.x;f.tz=f.z;}}""","""      if(okF(f,nx,nz)){f.x=nx;f.z=nz;}else{f.tx=f.x;f.tz=f.z;}}""")
rep("""    if(f.type!=='hai'&&!f.hook){f.jumpT-=dt;""","""    if(FISH[f.type].jump&&!f.hook){f.jumpT-=dt;""")
rep("""if(d<bd*1.8&&fishOk(f.type,F.x,F.z)){bd=d;best=f;}}""","""if(d<bd*1.8&&okF(f,F.x,F.z)){bd=d;best=f;}}""")
rep("""z=F.z+Math.sin(a)*7,r=Math.random(),type=sea?(r<.45?'thunfisch':r<.75?'barsch':'hai'):'barsch';""",
"""z=F.z+Math.sin(a)*7,type=pickFish(sea);""")
rep("""        const type=r<.45?'thunfisch':(r<.75||sharks>=4)?'barsch':'hai';addFish(type,""","""        const type=pickFish(true);addFish(type,""")
rep("""      if(lakeN+q<wantLake&&lake.length){const k=lake[Math.floor(Math.random()*lake.length)],c=center(k%N,(k/N)|0);addFish('barsch',""",
"""      if(lakeN+q<wantLake&&lake.length){const k=lake[Math.floor(Math.random()*lake.length)],c=center(k%N,(k/N)|0);addFish(pickFish(false),""")
rep("""wantLake=Math.min(8,Math.round(lake.length*.25));""","""wantLake=Math.min(12,Math.round(lake.length*.3));""")
rep("""    const lakeN=fishes.length-nSea;""","""    const lakeN=fishes.filter(f=>!f.free).length-nSea;""")
rep("""  F.model=fishModel(F.type);F.model.scale.setScalar(F.type==='barsch'?1.6:F.type==='thunfisch'?1.1:.9);scene.add(F.model);""",
"""  F.model=fishModel(F.type);F.model.scale.setScalar(F.type==='barsch'||F.type==='karpfen'?1.6:F.type==='hecht'?1.2:F.type==='thunfisch'?1.1:.9);scene.add(F.model);""")
rep("""m=fishModel(f.type);m.scale.setScalar(f.type==='barsch'?1.8:f.type==='thunfisch'?1.3:1.15);""","""m=fishModel(f.type);m.scale.setScalar(FISH[f.type].uw);""")
rep("""if(fishOk(f.type,nx,nz)){f.tx=nx;f.tz=nz;}}
    m.position.set(""","""if(okF(f,nx,nz)){f.tx=nx;f.tz=nz;}}
    m.position.set(""")
rep("""if(fishOk(lastCatch.type,x,z)){const f=addFish(lastCatch.type,x,z);""","""if(anyWater(x,z)){const f=addFish(lastCatch.type,x,z);f.free=!fishOk(lastCatch.type,x,z);""")

# ----- Fangbuch -----
rep("""let catchBook={barsch:0,thunfisch:0,hai:0};""","""let catchBook={};for(const k of Object.keys(FISH))catchBook[k]=0;""")
rep("""  $('#catchTitle').textContent=type==='hai'?'Wow, ein Hai!':'Du hast einen '+S.label+' gefangen!';""",
"""  $('#catchTitle').textContent=type==='hai'?'Wow, ein Hai!':(type==='wels'&&len>2)?'Wow, ein Riesen-Wels!':'Du hast einen '+S.label+' gefangen!';""")
rep("""  $('#catchBook').textContent='Dein Fang: '+Object.keys(FISH).map(k=>catchBook[k]+' '+(catchBook[k]===1?FISH[k].label:FISH[k].plural)).join(', ');""",
"""  $('#catchBook').textContent='Dein Fang: '+Object.keys(FISH).filter(k=>catchBook[k]).map(k=>catchBook[k]+' '+(catchBook[k]===1?FISH[k].label:FISH[k].plural)).join(', ');""")
rep("""(ft==='barsch'?'Barsche gibt es in Seen und im Meer.':FISH[ft].plural+' gibt es nur im Meer.')""","""(FISH[ft].plural+' gibt es '+FISH[ft].where+'.')""")

# ----- Aquarium -----
rep("""  const names=['BARSCH','THUNFISCH','HAI'];
  names.forEach((n,k)=>box(g,signMat(n,'#2A3442'),.8,.2,.03,-1.05+k*1.05,.38,tz+.42,false));""",
"""  box(g,signMat('MEINE FISCHE','#2A3442'),1.6,.22,.03,0,.38,tz+.42,false);""")
rep("""  const list=[];for(const k of Object.keys(FISH))for(let q=0;q<Math.min(catchBook[k]||0,4);q++)list.push(k);
  const sc={barsch:.55,thunfisch:.36,hai:.3};
  list.slice(0,10).forEach((type,k)=>{""","""  const list=[];for(const k of Object.keys(FISH))for(let q=0;q<Math.min(catchBook[k]||0,3);q++)list.push(k);
  const sc={};for(const k of Object.keys(FISH))sc[k]=FISH[k].aq;
  list.slice(0,14).forEach((type,k)=>{""")
rep("""sp:type==='barsch'?.35:type==='thunfisch'?.6:.45,""","""sp:FISH[type].speed*.35+.15,""")

# ----- Aussetzen: Inventar-Kategorie -----
rep("""  {id:'fang',label:'Mein Fang',""","""  {id:'fische',label:'Fische',icon:'fx_karpfen',items:['fx_barsch','fx_hecht','fx_karpfen','fx_wels','fx_stoer','fx_thunfisch','fx_hai']},
  {id:'fang',label:'Mein Fang',""")
rep("""  hund:{kind:'animal',label:'Hund',speed:1.7},""","""  fx_barsch:{kind:'fish',fish:'barsch',label:'Barsch'}, fx_hecht:{kind:'fish',fish:'hecht',label:'Hecht'}, fx_karpfen:{kind:'fish',fish:'karpfen',label:'Karpfen'},
  fx_wels:{kind:'fish',fish:'wels',label:'Wels'}, fx_stoer:{kind:'fish',fish:'stoer',label:'Stör'}, fx_thunfisch:{kind:'fish',fish:'thunfisch',label:'Thunfisch'}, fx_hai:{kind:'fish',fish:'hai',label:'Hai'},
  hund:{kind:'animal',label:'Hund',speed:1.7},""")
rep("""  if(it.kind==='animal'){""","""  if(it.kind==='fish'){
    if(!(gAt(i,j)==='wasser'||gAt(i,j)==='meer')){nope();hint('Fische brauchen Wasser. Tippe auf einen See oder aufs Meer.',3000);return;}
    if(fishes.length>=70){nope();hint('Das Wasser ist voll. Angle erst ein paar Fische!',2500);return;}
    const c=center(i,j),x=c.x+(Math.random()-.5)*2,z=c.z+(Math.random()-.5)*2,f=addFish(it.fish,x,z);f.free=true;f.flee=1.5;
    splash(x,z,true);tone(520,.1,'sine',.08,0,.5);tone(300,.25,'sine',.06,.1,.6);dirty=true;
    if(!fishOk(it.fish,x,z))hint(FISH[it.fish].plural+' leben eigentlich '+FISH[it.fish].where+'. Hier schwimmt er trotzdem.',3000);
    return;
  }
  if(it.kind==='animal'){""")
rep("""  for(const ft of Object.keys(FISH)){
    const obj=fishModel(ft);""","""  for(const ft of Object.keys(FISH)){
    const obj=fishModel(ft);thumbs['fx_'+ft]=null;""")
rep("""    R.render(S,C);thumbs['F_'+ft]=R.domElement.toDataURL('image/png');S.remove(obj);""","""    R.render(S,C);thumbs['F_'+ft]=thumbs['fx_'+ft]=R.domElement.toDataURL('image/png');S.remove(obj);""")

# ----- Speichern ausgesetzter Fische -----
rep("""    animals:animals.map(a=>[a.type,+a.x.toFixed(2),+a.z.toFixed(2)]),""","""    animals:animals.map(a=>[a.type,+a.x.toFixed(2),+a.z.toFixed(2)]),
    fish:fishes.filter(f=>f.free).map(f=>[f.type,+f.x.toFixed(2),+f.z.toFixed(2)]),""")
rep("""  (d.ferries||[]).forEach(f=>{const tl=tileAt(f[0],f[1]);if(tl&&isWater(tl.i,tl.j)){const fe=spawnFerry(f[0],f[1],f[2]);fe.wait=3;}});""",
"""  (d.ferries||[]).forEach(f=>{const tl=tileAt(f[0],f[1]);if(tl&&isWater(tl.i,tl.j)){const fe=spawnFerry(f[0],f[1],f[2]);fe.wait=3;}});
  (d.fish||[]).forEach(f=>{if(FISH[f[0]]&&anyWater(f[1],f[2])){addFish(f[0],f[1],f[2]).free=true;}});""")
open(p,'w').write(s)
print('ok8')
