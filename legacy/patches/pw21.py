import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg = await (await b.new_context(viewport={'width':1180,'height':820})).new_page()
        errs=[]; pg.on('pageerror', lambda e: errs.append('PAGEERROR: '+str(e)))
        await pg.goto('file:///tmp/claude-0/smoke/test.html'); await pg.wait_for_timeout(3000)
        E=pg.evaluate; W=pg.wait_for_timeout
        await E("localStorage.clear()")
        await E("__t.setCatch({barsch:5,hecht:3,karpfen:4,wels:2,stoer:2,thunfisch:6,hai:3})")
        # clear area and place aquarium at 9,9
        await E("window.__sel='aquarium';__t.apply(9,9)")
        print('center', await E("JSON.stringify(__t.tiles[__t.idx(9,9)].o)"), 'neigh', await E("JSON.stringify(__t.tiles[__t.idx(10,10)].o)"))
        print('aquariums', await E("__t.aquariums.size"), 'fish', await E("[...__t.aquariums.values()].map(a=>a.fish.length).join()"))
        # second aquarium overlapping should fail
        await E("__t.apply(10,10)"); print('after overlap', await E("__t.aquariums.size"))
        c=await E('__t.center(9,9)')
        await E(f"__t.bc.x={c['x']};__t.bc.z={c['z']};__t.bc.d=30"); await W(1500)
        await pg.screenshot(path='q1_out.png')
        await E('__sim(3)')
        await E("__t.startWalk()"); await W(1500)
        print('mode',await E('__t.mode'),'pl', await E("JSON.stringify({x:__t.pl.x-(%f),z:__t.pl.z-(%f),yaw:__t.pl.yaw})"%(c['x'],c['z'])))
        await pg.screenshot(path='q2_door.png')
        # walk inside onto ring
        await E(f"__t.pl.x=({c['x']})+0;__t.pl.z=({c['z']})+4.2;__t.pl.yaw=0;__t.pl.pitch=0"); await W(1500)
        print('panel hidden', await E("document.querySelector('#aqPanel').hidden"))
        await pg.screenshot(path='q3_inside.png')
        await E(f"__t.pl.x=({c['x']})+4.0;__t.pl.z=({c['z']})-1;__t.pl.yaw=Math.PI/2"); await W(1500)
        await pg.screenshot(path='q4_side.png')
        # erase via teil tile
        await E("window.__sel='radierer';__t.apply(8,10)")
        print('after erase', await E("__t.aquariums.size"), await E("JSON.stringify([__t.tiles[__t.idx(9,9)].o,__t.tiles[__t.idx(8,8)].o])"))
        print('\n'.join(errs) or 'no errors')
        await b.close()
asyncio.run(main())
