import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg = await (await b.new_context(viewport={'width':1180,'height':820})).new_page()
        errs=[]; pg.on('pageerror', lambda e: errs.append('PAGEERROR: '+str(e)))
        await pg.goto('file:///tmp/claude-0/smoke/test.html'); await pg.wait_for_timeout(3000)
        E=pg.evaluate; W=pg.wait_for_timeout
        await E("__t.setCatch({barsch:2,hecht:1,thunfisch:3,hai:1,makrele:4,bonito:2,mahimahi:2,barrakuda:2,schwertfisch:1,marlin:2,mondfisch:1})")
        await E("window.__sel='aquarium';__t.apply(9,9)")
        print('fish', await E("[...__t.aquariums.values()].map(a=>a.fish.length).join()"))
        c=await E('__t.center(9,9)')
        await E(f"__t.bc.x={c['x']};__t.bc.z={c['z']};__t.bc.d=30"); await W(800)
        await E("__t.startWalk()"); await W(500)
        await E(f"__t.pl.x=({c['x']})+0;__t.pl.z=({c['z']})+4.2;__t.pl.yaw=0;__t.pl.pitch=.1"); await E("__sim(2)"); await W(1200)
        await pg.screenshot(path='z8_aq_open.png')
        await W(5000)
        print('mini', await E("document.querySelector('#aqPanel').className"), await pg.text_content('#aqMini'))
        await pg.screenshot(path='z9_aq_mini.png')
        await E("document.querySelector('#aqPanel').click()"); await W(300)
        print('after tap', await E("document.querySelector('#aqPanel').className"))
        print('\n'.join(errs) or 'no errors')
        await b.close()
asyncio.run(main())
