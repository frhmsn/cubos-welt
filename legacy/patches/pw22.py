import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg = await (await b.new_context(viewport={'width':1180,'height':820})).new_page()
        errs=[]; pg.on('pageerror', lambda e: errs.append('PAGEERROR: '+str(e)))
        await pg.goto('file:///tmp/claude-0/smoke/test.html'); await pg.wait_for_timeout(3000)
        E=pg.evaluate; W=pg.wait_for_timeout
        print('thumbs', await E("Object.keys(__t.thumbs).filter(k=>/^(F_|W_)/.test(k)&&__t.thumbs[k]).length"))
        # fish model lineup
        await E("""(()=>{const T=window.__t;let x=-8;for(const k of ['makrele','bonito','mahimahi','barrakuda','schwertfisch','marlin','mondfisch']){const m=T.fishModel(k);m.position.set(T.bc.x+x,2.5,T.bc.z+4);m.rotation.y=Math.PI/2;m.scale.setScalar(1.6);T.scene.add(m);x+=2.6;}})()""")
        await E("__t.bc.d=16"); await W(1500); await pg.screenshot(path='z1_fish.png')
        # big sea for whales
        n=await E('__t.N'); print('N',n)
        await E(f"for(let i=0;i<{n};i++)for(let j=0;j<8;j++)__t.setG(i,j,'meer')")
        await E('__sim(10)')
        print('whales', await E("__t.whales.map(w=>w.type+':'+w.st).join()"), 'seafish', await E("JSON.stringify(__t.fishes.reduce((a,f)=>(a[f.type]=(a[f.type]||0)+1,a),{}))"))
        # surface a whale and look
        await E("(()=>{const w=__t.whales[0];if(!w)return;w.st='up';w.t=0;w.y=-.6;})()")
        await E('__sim(.2)')
        w=await E("(()=>{const w=__t.whales[0];return w?{x:w.x,z:w.z}:null})()")
        if w:
            await E(f"__t.bc.x={w['x']};__t.bc.z={w['z']};__t.bc.d=26"); await W(1500); await pg.screenshot(path='z2_whale.png')
        # Fang overview
        await E("__t.setCatch({makrele:3,marlin:1,mondfisch:2,schwertfisch:1,mahimahi:2,bonito:2,barrakuda:1,thunfisch:4,hai:2,barsch:3})")
        await pg.click('.cat >> text=Fang') if await pg.locator('.cat >> text=Fang').count() else None
        await W(600); await pg.screenshot(path='z3_fang.png')
        # aquarium + mini
        await E("window.__sel='aquarium';__t.apply(14,14)")
        c=await E('__t.center(14,14)')
        await E(f"__t.bc.x=({c['x']});__t.bc.z=({c['z']});"); await E('__t.startWalk()'); await W(500)
        await E(f"__t.pl.x=({c['x']});__t.pl.z=({c['z']})+4.2;__t.pl.yaw=0"); await E('__sim(2)'); await W(1200)
        await pg.screenshot(path='z4_aq_full.png')
        await W(5000)
        print('mini', await E("document.querySelector('#aqPanel').className"), await E("document.querySelector('#aqMini').textContent"))
        await pg.screenshot(path='z5_aq_mini.png')
        await E("document.querySelector('#aqPanel').click()"); await W(400)
        print('after tap', await E("document.querySelector('#aqPanel').className"))
        print('\n'.join(errs) or 'no errors')
        await b.close()
asyncio.run(main())
