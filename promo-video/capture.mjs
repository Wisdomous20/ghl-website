import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

// A dedicated rendering browser records the site's real WebGL, GSAP and CSS motion.
// No application source is altered. Scroll and browser time advance at 30 fps.
const probe = process.argv.includes('--probe');
await mkdir('capture', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
page.on('pageerror', error => console.error(error.message));
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await page.waitForSelector('#imagine canvas');
await page.waitForSelector('#build[data-enhanced=true]');
await page.evaluate(() => document.fonts.ready);
await page.addStyleTag({ content: 'html {scroll-behavior:auto!important} ::-webkit-scrollbar {display:none} nextjs-portal {display:none!important}' });
const layout = await page.evaluate(() => {
  const intro = document.querySelector('#imagine');
  const software = document.querySelector('#build');
  return { introTop: intro.offsetTop, introTravel: intro.offsetHeight-innerHeight, softwareTop: software.offsetTop, softwareTravel: software.offsetHeight-innerHeight };
});
console.log('Capture layout:', layout);
await writeFile('capture/layout.json', JSON.stringify(layout, null, 2));
await page.clock.install();
await page.clock.pauseAt(new Date(Date.now()+1000));
const smooth = t => t*t*(3-2*t);
const keys = [
  [0,0], [2,0], [3,layout.introTravel*.10],
  [9.5,layout.introTravel*.54], [14,layout.introTravel],
  [14.5,layout.softwareTop], [16.6,layout.softwareTop+layout.softwareTravel*.16],
  [19,layout.softwareTop+layout.softwareTravel*.35],
  [21.5,layout.softwareTop+layout.softwareTravel*.55],
  [24,layout.softwareTop+layout.softwareTravel*.75],
  [26.2,layout.softwareTop+layout.softwareTravel*.94], [27,layout.softwareTop+layout.softwareTravel*.94],
];
function scrollAt(t) {
  const i = keys.findIndex((k,j)=>j<keys.length-1 && t>=k[0] && t<keys[j+1][0]);
  if(i<0) return keys.at(-1)[1];
  const a=keys[i], b=keys[i+1];
  return a[1]+(b[1]-a[1])*smooth((t-a[0])/(b[0]-a[0]));
}
for (let frame=0; frame<810; frame++) {
  const t=frame/30;
  await page.evaluate(({y,t})=>{
    window.scrollTo(0,y);
    const video=document.querySelector('video');
    if(video && t<3) { video.pause(); video.currentTime=Math.min(t*2,Number.isFinite(video.duration)?video.duration-.05:t*2); }
  },{y:scrollAt(t),t});
  await page.clock.runFor(frame%3===0?34:33);
  if (!probe || frame%90===0) await page.screenshot({path:`capture/frame-${String(frame).padStart(4,'0')}.jpg`,type:'jpeg',quality:94,timeout:30000});
  if(frame%90===0) console.log(`Captured ${frame}/810 (${t}s)`);
}
await browser.close();
console.log('Capture complete.');
