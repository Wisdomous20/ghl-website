import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';

const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1,reducedMotion:'no-preference'});
await page.goto('http://localhost:3000',{waitUntil:'networkidle'});
await page.waitForSelector('#imagine canvas');
await page.waitForSelector('#build[data-enhanced=true]');
await page.evaluate(()=>document.fonts.ready);
// Film styling applies only to this disposable render page, never the website source.
await page.addStyleTag({content:`
html{scroll-behavior:auto!important} ::-webkit-scrollbar{display:none} nextjs-portal{display:none!important}
header,nav,[class*="stageHeader"],[class*="serviceHeader"],[class*="serviceFooter"],
[class*="status"],[class*="motionToggle"],[class*="sheetFooter"],
[class*="explore"] {visibility:hidden!important}
a,button {visibility:hidden!important}
[class*="routes"] button,[class*="processTabs"] button {visibility:visible!important;pointer-events:none!important}
`});
const layout=await page.evaluate(()=>({a:document.querySelector('#imagine').offsetHeight-innerHeight,b:document.querySelector('#build').offsetTop,c:document.querySelector('#build').offsetHeight-innerHeight}));
await page.clock.install();
await page.clock.pauseAt(new Date(Date.now()+1000));
const A=p=>layout.a*p;
const B=p=>layout.b+layout.c*p;
const shots=[
  {name:'assembly',seconds:18.5,keys:[[0,A(.075)],[1.8,A(.12)],[4.8,A(.19)],[6.5,A(.24)],[9,A(.30)],[11.8,A(.37)],[14,A(.425)],[15.4,A(.445)],[18.5,A(.54)]]},
  {name:'services',seconds:9,keys:[[0,A(.54)],[1.6,A(.60)],[2.8,A(.68)],[4.2,A(.71)],[5.2,A(.78)],[6.2,A(.81)],[7.3,A(.90)],[9,A(.93)]]},
  {name:'software',seconds:20,keys:[[0,B(.085)],[2.8,B(.13)],[4,B(.30)],[6.8,B(.34)],[8,B(.49)],[10.8,B(.54)],[12,B(.68)],[14.8,B(.73)],[16,B(.87)],[20,B(.94)]]},
];
const requested=process.argv.slice(2);
for(const shot of shots.filter(s=>requested.length===0||requested.includes(s.name))){
  await mkdir(`capture-cinematic/${shot.name}`,{recursive:true});
  await page.evaluate(y=>window.scrollTo(0,y),shot.keys[0][1]);
  await page.clock.runFor(2000);
  await page.evaluate(()=>{ window.__filmAnimations=new Map(); });
  const count=Math.round(shot.seconds*30);
  for(let frame=0;frame<count;frame++){
    const time=frame/30;
    const index=shot.keys.findIndex((k,i)=>i<shot.keys.length-1&&time>=k[0]&&time<shot.keys[i+1][0]);
    const a=shot.keys[Math.max(0,index)],b=shot.keys[Math.max(0,index)+1];
    const p=Math.min(1,Math.max(0,(time-a[0])/(b[0]-a[0])));
    const y=a[1]+(b[1]-a[1])*p*p*(3-2*p);
    await page.evaluate(y=>window.scrollTo(0,y),y);
    await page.clock.runFor(frame%3===0?34:33);
    // CSS timelines use the compositor clock, independently of JS clock mocking.
    // Pause and seek them explicitly so expensive WebGL captures cannot accelerate loops.
    await page.evaluate(time=>{
      for(const animation of document.getAnimations()){
        const cache=window.__filmAnimations;
        if(!cache.has(animation))cache.set(animation,{at:time,offset:Number(animation.currentTime)||0});
        const start=cache.get(animation);
        animation.pause();
        animation.currentTime=start.offset+(time-start.at)*1000;
      }
    },time);
    await page.screenshot({path:`capture-cinematic/${shot.name}/${String(frame).padStart(4,'0')}.jpg`,type:'jpeg',quality:95});
    if(frame%120===0)console.log(`${shot.name}: ${frame}/${count}`);
  }
}
await browser.close();
console.log('Cinematic capture complete');
