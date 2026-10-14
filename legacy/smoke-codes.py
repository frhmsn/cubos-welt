import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        ctx=await b.new_context(viewport={'width':1180,'height':820},permissions=['clipboard-read','clipboard-write'])
        pg = await ctx.new_page()
        errs=[]; pg.on('pageerror', lambda e: errs.append('PAGEERROR: '+str(e)))
        await pg.goto('file:///tmp/claude-0/smoke/test.html'); await pg.wait_for_timeout(3000)
        E=pg.evaluate; W=pg.wait_for_timeout
        print('store', await E('__t.store.kind'))
        await E("localStorage.removeItem('kunos-welten')")
        # make 2 worlds via the menu
        async def menu(): await E("document.querySelector('#btnMenu, [aria-label=\"Menü\"]')?.click()"); await W(500)
        ids=await E("Array.from(document.querySelectorAll('.rb')).map(b=>b.id+':'+(b.getAttribute('aria-label')||'')).join(' | ')")
        print(ids)
        await E("""(async()=>{const st=__t.store;await st.put({id:'w_a',name:'Stadt A',updated:1,thumb:'',data:JSON.stringify({tiles:[],n:20})});await st.put({id:'w_b',name:'Meer B',updated:2,thumb:'',data:JSON.stringify({tiles:[1],n:20})});})()""")
        await E("__t.setCatch({hai:3,marlin:2,barsch:5})")
        await E("document.querySelector('#mExportAll').click()"); await W(1500)
        info=await E("document.querySelector('#codeInfo').textContent"); code=await E("document.querySelector('#codeTxt').value")
        print(info, len(code), code[:12])
        # wipe and import
        await E("localStorage.removeItem('kunos-welten');__t.resetFang()")
        await E("document.querySelector('#mImport').click()"); await W(300)
        await E("(c)=>{document.querySelector('#codeTxt').value=c;document.querySelector('#codeGo').click();}", code); await W(3000)
        print('worlds', await E("(async()=>(await __t.store.list()).map(w=>w.name).join())()"))
        print('fang', await E("JSON.stringify({hai:__t.catchBook.hai,marlin:__t.catchBook.marlin,barsch:__t.catchBook.barsch})"), await E("document.querySelector('#hint')?.textContent"))
        # import again: no duplicates
        await E("document.querySelector('#mImport').click()"); await W(300)
        await E("(c)=>{document.querySelector('#codeTxt').value=c;document.querySelector('#codeGo').click();}", code); await W(2500)
        print('worlds2', await E("(async()=>(await __t.store.list()).length)()"), await E("document.querySelector('#hint')?.textContent"))
        # single export includes fang
        await E("document.querySelector('#mExport').click()"); await W(3000)
        c1=await E("document.querySelector('#codeTxt').value")
        await E("__t.resetFang();document.querySelector('#mImport').click()"); await W(300)
        await E("(c)=>{document.querySelector('#codeTxt').value=c;document.querySelector('#codeGo').click();}", c1); await W(2500)
        print('c1', c1[:14], len(c1), await E("document.querySelector('#codeInfo').textContent"), await E("document.querySelector('#codeBox').hidden"))
        print('single fang', await E("__t.catchBook.marlin"), 'worlds3', await E("(async()=>(await __t.store.list()).length)()"))
        print('\n'.join(errs) or 'no errors')
        await b.close()
asyncio.run(main())
