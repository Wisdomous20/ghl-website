import {Composition} from 'remotion';
import {Promo} from './Composition';
import {Closing} from './Closing';
import {Cinematic, Opening} from './Cinematic';

export const RemotionRoot = () => <>
  <Composition id="Enginara-Cinematic" component={Cinematic} durationInFrames={1800} fps={30} width={1920} height={1080}/>
  <Composition id="Opening" component={Opening} durationInFrames={300} fps={30} width={1920} height={1080}/>
  <Composition id="Enginara-Promo" component={Promo} durationInFrames={900} fps={30} width={1920} height={1080}/>
  <Composition id="Closing" component={Closing} durationInFrames={105} fps={30} width={1920} height={1080}/>
</>;
