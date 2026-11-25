import asyncio, sys, json
from playwright.async_api import async_playwright
BASE = sys.argv[1] if len(sys.argv)>1 else "http://localhost:8765/class1/"
ONLY = sys.argv[2] if len(sys.argv)>2 else None
OUT = "/workspace/uloom-gamification/screenshots-class1"
import os; os.makedirs(OUT, exist_ok=True)
SOLVE = r"""
async (wrongFirst) => {
 const S = window.__uq.S(); const r = S.rounds[S.i]; const rc = document.querySelector('#rc');
 const sleep = ms => new Promise(x=>setTimeout(x,ms));
 const clickI = i => rc.querySelector(`.opt[data-i="${i}"]`).click();
 if (r.type==='intro') {}
 else if (r.type==='letter') { const bs=[...rc.querySelectorAll('.ball')];
   if (wrongFirst) { const w=bs.find(b=>b.dataset.l!==r.target[0] && b.textContent.trim()!==r.target[0]); if(w){w.click(); await sleep(1500);} }
   bs.find(b=>b.dataset.l===r.target[0] || b.textContent.trim()===r.target[0]).click(); }
 else if (['wordfind','mcq','listen'].includes(r.type)) clickI(r.answer);
 else if (r.type==='tf' || r.type==='car') rc.querySelector(`.opt[data-v="${r.answer?1:0}"]`).click();
 else if (r.type==='match') { for (let i=0;i<r.pairs.length;i++){ rc.querySelector(`.opt[data-side="L"][data-i="${i}"]`).click(); rc.querySelector(`.opt[data-side="R"][data-i="${i}"]`).click(); } }
 else if (r.type==='order') { for (let i=0;i<r.items.length;i++) clickI(i); }
 else if (r.type==='sort') { for (let k=0;k<r.items.length;k++){ const it = S.sortItems ? S.sortItems[k] : null; const txt=rc.querySelector('.sortcard').textContent.trim(); const f=r.items.find(x=>txt.includes(x[0].replace(/\{.\}/g,'').trim().slice(0,15))); rc.querySelector(`.opt[data-v="${f[1]?1:0}"]`).click(); await sleep(800);} }
 return r.type;
}
"""

PLAN = r"""
() => {
 const S = window.__uq.S(); const r = S.rounds[S.i]; const rc = document.querySelector('#rc');
 if (!rc || document.querySelector('#nx')) return {act:'done'};
 const q = s => rc.querySelector(s);
 const t = r.type;
 if (t==='trace') return {act:'trace'};
 if (t==='dragsound' || t==='dragpick') return {act:'drag', from:`.dtile[data-i="${r.answer}"]`, to:'#bk'};
 if (t==='build') { const n = rc.querySelectorAll('.slot.filled').length; const tiles=[...rc.querySelectorAll('.dtile:not(.placed)')]; const k=tiles.find(x=>x.textContent===r.tiles[n]); if(!k) return {act:'wait'}; return {act:'drag', from:`.dtile[data-i="${k.dataset.i}"]:not(.placed)`, to:'#sl'}; }
 if (t==='echo') { const b=q('#eok'); return b.disabled ? {act:'wait'} : {act:'click', sel:'#eok'}; }
 if (t==='swipe') return {act:'drag', from:'#sc', to:`.zone[data-v="${r.answer?1:0}"]`};
 if (t==='basket') { const c=q('#bcd'); if(!c || c.classList.contains('drop-in')) return {act:'wait'}; return {act:'drag', from:'#bcd', to:`.bsk[data-v="${c.dataset.v}"]`}; }
 if (t==='choose2') return {act:'click', sel:`.scene[data-i="${r.answer}"]`};
 if (t==='bodytap') return {act:'click', sel:`.bpart[data-s="${r.side}"]`};
 if (t==='maptap') return {act:'click', sel:`.pin[data-i="${r.answer}"]`};
 if (t==='dragmatch') { const c=q('.mchip:not(.placed)'); if(!c) return {act:'wait'}; return {act:'drag', from:`.mchip[data-i="${c.dataset.i}"]`, to:`.mt[data-i="${c.dataset.i}"]`}; }
 if (t==='sequence') { const n=rc.querySelectorAll('.sslot.filled').length; return {act:'drag', from:`.scard[data-i="${n}"]`, to:'#ss'}; }
 if (t==='memory') { const up1=[...rc.querySelectorAll('.mcard.up:not(.matched)')]; if (up1.length===1) { const p=[...rc.querySelectorAll('.mcard:not(.matched):not(.up)')].find(x=>x.dataset.k===up1[0].dataset.k); if (p) return {act:'click', sel:`.mcard[data-i="${p.dataset.i}"]`}; } if (up1.length===2) return {act:'wait'}; const left=[...rc.querySelectorAll('.mcard:not(.matched):not(.up)')]; if(!left.length) return {act:'wait'}; const a=left[0]; const b=left.find(x=>x!==a && x.dataset.k===a.dataset.k); if(!b) return {act:'wait'}; return {act:'pair', a:`.mcard[data-i="${a.dataset.i}"]`, b:`.mcard[data-i="${b.dataset.i}"]`}; }
 return {act:'old'};
}
"""
NEW_TYPES = {'trace','dragsound','dragpick','build','echo','swipe','basket','choose2','bodytap','maptap','dragmatch','sequence','memory'}
async def touch(pg, cdp, mobile, pts):
    """drag along a list of points with a finger (phone/tablet) or the mouse (desktop)"""
    if mobile:
        tp = lambda x,y: [{"x":x,"y":y,"id":1,"radiusX":6,"radiusY":6,"force":1}]
        await cdp.send("Input.dispatchTouchEvent", {"type":"touchStart","touchPoints":tp(*pts[0])})
        for x,y in pts[1:]:
            await cdp.send("Input.dispatchTouchEvent", {"type":"touchMove","touchPoints":tp(x,y)})
        await cdp.send("Input.dispatchTouchEvent", {"type":"touchEnd","touchPoints":[]})
    else:
        await pg.mouse.move(*pts[0]); await pg.mouse.down()
        for x,y in pts[1:]: await pg.mouse.move(x,y)
        await pg.mouse.up()
BOX = "s => { const e=document.querySelector(s); if(!e) return null; const b=e.getBoundingClientRect(); return [b.left+b.width/2, b.top+b.height/2, b.top, b.bottom]; }"
async def drag(pg, cdp, mobile, a, b, issues):
    A = await pg.evaluate(BOX, a); B = await pg.evaluate(BOX, b)
    if not A or not B: return False
    H = await pg.evaluate("innerHeight")
    if min(A[2],B[2])<0 or max(A[3],B[3])>H:
        lo=min(A[2],B[2]); hi=max(A[3],B[3])
        if hi-lo > H: issues.add(f"drag span taller than screen {a}->{b}")
        await pg.evaluate(f"scrollBy(0, {lo - max(0,(H-(hi-lo))/2)})"); await pg.wait_for_timeout(150)
        A = await pg.evaluate(BOX, a); B = await pg.evaluate(BOX, b)
    n=12; pts=[(A[0]+(B[0]-A[0])*i/n, A[1]+(B[1]-A[1])*i/n) for i in range(n+1)]
    await touch(pg, cdp, mobile, pts); return True
async def tap(pg, cdp, mobile, sel):
    await pg.evaluate(f"document.querySelector('{sel}').scrollIntoView({{block:'center'}})")
    A = await pg.evaluate(BOX, sel)
    if mobile: await pg.touchscreen.tap(A[0],A[1])
    else: await pg.mouse.click(A[0],A[1])
async def solve_new(pg, cdp, mobile, issues, shot=None):
    for step in range(60):
        a = await pg.evaluate(PLAN)
        if os.environ.get('DBG'): print('  act', a, flush=True)
        if a['act']=='done': return True
        if a['act']=='wait': await pg.wait_for_timeout(500); continue
        if a['act']=='trace':
            await pg.evaluate("document.querySelector('.trace-cv').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(700)
            runs = await pg.evaluate("document.querySelector('#rc').__strokes()")
            if not runs: await pg.wait_for_timeout(500); continue
            if shot:
                await touch(pg, cdp, mobile, runs[len(runs)//3]); await touch(pg, cdp, mobile, runs[len(runs)//2]); await pg.wait_for_timeout(200); await pg.screenshot(path=shot); shot=None
            for run in runs:
                if await pg.query_selector('#nx'): break
                pts = run if len(run)>1 else run+[(run[0][0]+2, run[0][1])]
                await touch(pg, cdp, mobile, pts)
            await pg.wait_for_timeout(400)
            if not await pg.query_selector('#nx'): issues.add("trace not accepted"); return False
            continue
        if a['act']=='drag':
            if shot: await pg.screenshot(path=shot); shot=None
            if not await drag(pg, cdp, mobile, a['from'], a['to'], issues): await pg.wait_for_timeout(400)
            await pg.wait_for_timeout(450); continue
        if a['act']=='click':
            if shot: await pg.screenshot(path=shot); shot=None
            await tap(pg, cdp, mobile, a['sel']); await pg.wait_for_timeout(400); continue
        if a['act']=='pair':
            await tap(pg, cdp, mobile, a['a']); await pg.wait_for_timeout(400)
            await tap(pg, cdp, mobile, a['b'])
            if shot: await pg.wait_for_timeout(300); await pg.screenshot(path=shot); shot=None
            await pg.wait_for_timeout(800); continue
        return False
    issues.add("round did not finish"); return False
async def run(name, vp, mobile, levels):
    async with async_playwright() as p:
        b = await p.chromium.launch(channel="chrome", args=["--autoplay-policy=no-user-gesture-required"])
        ctx = await b.new_context(viewport=vp, device_scale_factor=2 if mobile else 1, is_mobile=mobile, has_touch=mobile)
        pg = await ctx.new_page(); errs=[]; missing=set(); issues=set(); shots=set()
        cdp = await ctx.new_cdp_session(pg)
        pg.on("pageerror", lambda e: errs.append(str(e)))
        def oncon(m):
            if "MISSING_CLIP" in m.text: missing.add(m.text)
            elif m.type=="error" and "Failed to load resource" not in m.text: errs.append(m.text)
        pg.on("console", oncon)
        audio={"ok":set(),"bad":[]}
        pg.on("response", lambda r: r.status>=400 and "/audio/" not in r.url and errs.append(f"HTTP {r.status} {r.url}"))
        pg.on("response", lambda r: "/audio/" in r.url and (audio["ok"].add(r.url.split("/")[-1]) if r.status<400 else audio["bad"].append((r.status,r.url))))
        await pg.goto(BASE); await pg.wait_for_timeout(300)
        # migration: old single-path keys -> per-book keys
        await pg.evaluate("localStorage.clear(); localStorage.setItem('uq_best_l3','2'); localStorage.setItem('uq_best_r1','3'); localStorage.setItem('uq_streak', JSON.stringify({last:null,count:0,best:4}))")
        await pg.reload(); await pg.wait_for_timeout(800)
        mig = await pg.evaluate("['quran-3','akhlaaq-3','tareekh-3','fiqh-3','quran-r1'].map(k=>localStorage.getItem('uq_best_'+k))")
        print(name, "migration", mig); assert mig==['2','2','2','2','3'], mig
        await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(1000)
        await pg.click("#play"); await pg.wait_for_timeout(1000)
        await pg.screenshot(path=f"{OUT}/{name}-hub.png")
        cards = await pg.evaluate("[...document.querySelectorAll('.book-card')].map(a=>a.dataset.book+':'+a.querySelector('.bk-meta').textContent)")
        print(name, "hub cards:", cards); assert len(cards)==6, cards
        await pg.click(".book-card[data-book='akhlaaq']"); await pg.wait_for_timeout(900)
        assert pg.url.rstrip('/').endswith('/akhlaaq'), pg.url
        await pg.screenshot(path=f"{OUT}/{name}-book-akhlaaq.png")
        # every book URL opens its own map directly
        for bk in ['quran','aqaaid','fiqh','akhlaaq','hadeeth','tareekh']:
            p2 = await ctx.new_page(); e2=[]; p2.on("pageerror", lambda e: e2.append(str(e)))
            await p2.goto(BASE + bk + "/"); await p2.wait_for_timeout(700); await p2.click("#play"); await p2.wait_for_timeout(700)
            h = await p2.evaluate("document.querySelector('.book-head h1') && document.querySelector('.book-head h1').textContent")
            n_nodes = await p2.evaluate("document.querySelectorAll('.node').length")
            if bk=='fiqh' and name=='phone': await p2.screenshot(path=f"{OUT}/{name}-book-url-fiqh.png")
            print(name, "book url", bk, "->", h, n_nodes, "nodes", e2); assert h and not e2
            await p2.close()
        ids = await pg.evaluate("window.__uq.LV.map(l=>l.id)")
        if levels: ids=[i for i in ids if i in levels]
        res=[]
        async def play(k, lid):
                pass
                await pg.evaluate(f"window.__uq.startLevel('{lid}')"); await pg.wait_for_timeout(500)
                n=0; types=[]
                while await pg.evaluate("document.querySelector('#rc')!==null") and n<40:
                    t = await pg.evaluate("window.__uq.S().rounds[window.__uq.S().i].type"); types.append(t)
                    wrong = (name=='phone' and lid=='quran-2' and t=='letter' and n<3)
                    if t in NEW_TYPES:
                        sh=None
                        if name=='phone' and t not in shots: shots.add(t); sh=f"{OUT}/phone-v3-{t}.png"
                        try: ok = await asyncio.wait_for(solve_new(pg, cdp, mobile, issues, sh), 60)
                        except asyncio.TimeoutError:
                            try: st = await asyncio.wait_for(pg.evaluate("(()=>{const S=window.__uq.S();const r=S.rounds[S.i];return JSON.stringify({i:S.i,type:r.type,say:r.say||r.q||''})})()"), 5)
                            except Exception: st = "PAGE FROZEN"
                            issues.add(f"HANG {lid} {t} {st}"); print(name, "HANG", lid, t, st, flush=True)
                            try: await asyncio.wait_for(pg.screenshot(path=f"{OUT}/{name}-hang-{lid}.png"), 8)
                            except Exception: pass
                            break
                        if not ok: issues.add(f"{lid} round {n} {t} unsolved"); 
                        await pg.wait_for_timeout(300)
                    else: await pg.evaluate(SOLVE, wrong)
                    if wrong:
                        await pg.wait_for_timeout(250); await pg.screenshot(path=f"{OUT}/{name}-bubble-win-{n}.png")
                    await pg.wait_for_timeout(1000 if t in ('letter','sort') else 350)
                    if not await pg.query_selector("#nx"): await pg.wait_for_timeout(1200)
                    try: await pg.click("#nx", timeout=12000)
                    except Exception:
                        st = await pg.evaluate("(()=>{const S=window.__uq.S();const r=S.rounds[S.i];return JSON.stringify({i:S.i,type:r.type,q:r.q||r.say||'',ans:r.answer})})()")
                        issues.add(f"STUCK {lid} {st}"); await pg.screenshot(path=f"{OUT}/{name}-stuck-{lid}.png"); break
                    await pg.wait_for_timeout(250); n+=1
                await pg.wait_for_timeout(700)
                S = await pg.evaluate("[window.__uq.S().score, window.__uq.S().first, window.__uq.S().scored]")
                stars = await pg.evaluate("localStorage.getItem('uq_best_%s')" % lid)
                badge = await pg.evaluate("document.title")
                res.append((lid,n,S,stars)); print(name, lid, n, S, stars, flush=True)
        for k,lid in enumerate(ids):
            try: await asyncio.wait_for(play(k, lid), 420)
            except asyncio.TimeoutError:
                try: st = await asyncio.wait_for(pg.evaluate("(()=>{const S=window.__uq.S();const r=S.rounds[S.i];return JSON.stringify({i:S.i,type:r.type})})()"), 5)
                except Exception: st="PAGE FROZEN"
                issues.add(f"LEVEL TIMEOUT {lid} {st}"); print(name,"LEVEL TIMEOUT",lid,st,flush=True)
                try: await asyncio.wait_for(pg.reload(), 15); await pg.wait_for_timeout(800)
                except Exception: pass
            if lid in ('quran-1','akhlaaq-3','fiqh-12'): await pg.screenshot(path=f"{OUT}/{name}-end-{lid}.png")
        print(name, json.dumps(res))
        await pg.evaluate("window.__uq.showMap()"); await pg.wait_for_timeout(800)
        await pg.screenshot(path=f"{OUT}/{name}-hub-after.png")
        await pg.evaluate("window.__uq.showStickers()"); await pg.wait_for_timeout(900)
        await pg.screenshot(path=f"{OUT}/{name}-stickers.png", full_page=False)
        await pg.evaluate("window.__uq.showCertificate('akhlaaq-3')"); await pg.wait_for_timeout(800)
        await pg.fill("#nm","Aisha"); await pg.wait_for_timeout(600)
        await pg.screenshot(path=f"{OUT}/{name}-certificate.png")
        if name=='desktop':
            png = await pg.evaluate("document.querySelector('canvas#cert').toDataURL('image/png')")
            import base64; open(f"{OUT}/certificate-akhlaaq-3.png","wb").write(base64.b64decode(png.split(',')[1]))
        print(name, "issues:", sorted(issues)[:20])
        print(name, "errors:", errs[:10]); print(name, "missing clips:", len(missing), sorted(missing)[:8])
        print(name, "audio OK:", len(audio["ok"]), "bad:", audio["bad"][:5])
        await b.close()
async def main():
    lv = ONLY.split(',') if ONLY and ONLY!='all' else None
    DEV = sys.argv[3] if len(sys.argv)>3 else None
    for name,vp,mob in (("desktop",{"width":1280,"height":800},False),("phone",{"width":390,"height":844},True),("tablet",{"width":820,"height":1180},True)):
        if DEV and DEV!=name: continue
        await run(name,vp,mob,lv)
asyncio.run(main())
