import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg = await (await b.new_context(viewport={'width':1024,'height':768})).new_page()
        errs=[]
        pg.on('pageerror', lambda e: errs.append('PAGEERROR: '+str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type=='error' and 'ERR_TUNNEL' not in m.text else None)
        await pg.goto('file:///tmp/claude-0/smoke/test.html'); await pg.wait_for_timeout(2500)
        W=pg.wait_for_timeout
        # world build: paint road
        await pg.click('.cat >> text=Land'); await pg.click('#items .it[data-id="strasse"]')
        await pg.mouse.move(150,300); await pg.mouse.down(); 
        for x in range(150,420,20): await pg.mouse.move(x,300)
        await pg.mouse.up(); await W(300)
        await pg.click('.cat >> text=Autos'); await pg.click('#items .it[data-id="lambo"]'); await pg.mouse.click(300,300); await W(200)
        await pg.click('.cat >> text=Tiere'); await pg.click('#items .it[data-id="kuh"]'); await pg.mouse.click(250,420); await W(300)
        await pg.screenshot(path='w1.png')
        # workshop
        await pg.click('.cat >> text=Häuser'); await pg.click('#items .it[data-id="eigen"]'); await pg.mouse.click(330,430); await W(1200)
        print('pad hidden in edit:', await pg.is_hidden('#pad'), 'joy hidden:', await pg.is_hidden('#joy'))
        await pg.screenshot(path='e1.png')
        for pt in [(560,560),(600,575),(640,590),(420,520),(380,500)]:
            await pg.mouse.click(*pt); await W(150)
        await pg.screenshot(path='e2.png')
        # stack up on placed blocks
        for pt in [(560,545),(560,520),(560,495)]:
            await pg.mouse.click(*pt); await W(150)
        await pg.click('#editTray .it[data-id="B_b"]')
        await pg.mouse.click(700,420); await W(150)
        # rotate by drag
        await pg.mouse.move(500,300); await pg.mouse.down()
        for x in range(500,300,-20): await pg.mouse.move(x,300)
        await pg.mouse.up(); await W(300)
        await pg.screenshot(path='e3.png')
        # door on wall + erase + undo
        await pg.click('#editTray .it[data-id="B_d"]'); await pg.mouse.click(512,380); await W(200)
        await pg.screenshot(path='e4.png')
        await pg.click('#eUndo'); await W(200)
        await pg.click('#eDone'); await W(1200)
        await pg.screenshot(path='w2.png')
        print('back in build, inv visible:', await pg.is_visible('#inv'))
        # walk
        await pg.click('#btnView'); await W(500)
        await pg.keyboard.down('w'); await W(1500); await pg.keyboard.up('w')
        await pg.screenshot(path='k1.png')
        print('\n'.join(errs) or 'no errors')
        await b.close()
asyncio.run(main())
