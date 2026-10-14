import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg = await (await b.new_context(viewport={'width':1180,'height':820})).new_page()
        errs=[]; pg.on('pageerror', lambda e: errs.append('PAGEERROR: '+str(e)))
        await pg.goto('file:///tmp/claude-0/smoke/test.html'); await pg.wait_for_timeout(3000)
        E=pg.evaluate; W=pg.wait_for_timeout
        # make a lake
        await E("for(let i=14;i<=17;i++)for(let j=15;j<=18;j++)__t.setG(i,j,'wasser')")
        await E('__sim(12)')
        print('fish', await E('JSON.stringify(__t.fishes.reduce((a,f)=>(a[f.type]=(a[f.type]||0)+1,a),{}))'))
        await pg.click('.cat >> text=Fische'); await W(500)
        await pg.click('#items .it[data-id="fx_wels"]')
        c=await E('__t.center(15,16)')
        await E(f"__t.bc.x={c['x']};__t.bc.z={c['z']};__t.bc.d=24"); await W(800)
        await pg.mouse.click(590,410); await W(400)
        print('free fish', await E('__t.fishes.filter(f=>f.free).map(f=>f.type).join()'), await pg.text_content('#hint'))
        await pg.screenshot(path='b1_cat.png')
        # show all fish models in a row for checking
        await E("""(()=>{const T=window.__t;let x=-6;for(const k of ['barsch','hecht','karpfen','wels','stoer','thunfisch','hai']){const m=T.fishModel(k);m.position.set(T.bc.x+x,2.5,T.bc.z+4);m.rotation.y=Math.PI/2;m.scale.setScalar(1.5);T.scene.add(m);x+=2.1;}})()""")
        await E(f"__t.bc.d=14"); await W(1500)
        await pg.screenshot(path='b2_models.png')
        print('\n'.join(errs) or 'no errors')
        await b.close()
asyncio.run(main())
