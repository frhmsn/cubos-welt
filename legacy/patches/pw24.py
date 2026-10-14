import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg = await (await b.new_context(viewport={'width':1180,'height':820})).new_page()
        await pg.goto('file:///tmp/claude-0/smoke/test.html'); await pg.wait_for_timeout(3000)
        E=pg.evaluate; W=pg.wait_for_timeout
        await E("for(let i=0;i<20;i++)for(let j=0;j<20;j++)__t.setG(i,j,'meer')")
        await E("__sim(10)")
        await E("(()=>{const w=__t.whales[0];window.__w=w;__t.bc.x=w.x;__t.bc.z=w.z;__t.bc.d=24;})()"); await W(800)
        await E("__w.st='up';__w.t=0;__w.next=99;")
        for k in range(6):
            await E("__sim(.5)"); print(await E("JSON.stringify({st:__w.st,t:__w.t.toFixed(2),blow:__w.blow,y:__w.y.toFixed(2)})"))
        await b.close()
asyncio.run(main())
