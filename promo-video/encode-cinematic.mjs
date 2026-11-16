import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {readdirSync} from 'node:fs';
const cli=fileURLToPath(new URL('./node_modules/@remotion/cli/remotion-cli.js',import.meta.url));
for(const [scene,expected] of [['assembly',555],['services',270],['software',600]]){
  const folder=`capture-cinematic/${scene}`;
  const frames=readdirSync(folder).filter(f=>/^\d{4}\.jpg$/.test(f));
  if(frames.length!==expected)throw new Error(`${scene}: expected ${expected} frames, got ${frames.length}`);
  const result=spawnSync(process.execPath,[cli,'ffmpeg','-v','error','-y','-framerate','30','-i',`${folder}/%04d.jpg`,'-c:v','libx264','-crf','15','-pix_fmt','yuv420p','-movflags','+faststart',`public/cinematic-${scene}.mp4`],{stdio:'inherit'});
  if(result.status!==0)process.exit(result.status??1);
  console.log(`Encoded ${scene}`);
}
