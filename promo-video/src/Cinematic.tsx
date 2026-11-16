import {AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Audio, Video} from '@remotion/media';
import {Closing} from './Closing';

const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;

export const Opening = () => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  return <AbsoluteFill style={{background:'#e7e0d1',overflow:'hidden'}}>
    <style>{`@font-face{font-family:Sora;src:url('${staticFile('sora.woff2')}') format('woff2');font-weight:100 800;}`}</style>
    <div style={{position:'absolute',inset:0,scale:interpolate(frame,[0,299],[1,1.02],clamp)}}>
      <Video name="Full original pencil drawing" src={staticFile('opening-drawing.mp4')} durationInFrames={240} premountFor={fps} muted objectFit="contain" style={{width:'100%',height:'100%'}}/>
      <Img name="Hold the completed Enginara wordmark" src={staticFile('opening-complete.png')} from={240} durationInFrames={60} premountFor={fps} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'contain'}}/>
    </div>
    <div style={{position:'absolute',top:94,left:116,fontFamily:'Sora',fontSize:18,letterSpacing:5,color:'#746656',opacity:interpolate(frame,[12,50],[0,1],clamp)}}>EVERY SYSTEM STARTS WITH AN IDEA.</div>
    <div style={{position:'absolute',left:116,right:116,bottom:100,display:'flex',alignItems:'center',gap:24,opacity:interpolate(frame,[210,255],[0,1],clamp)}}>
      <div style={{width:54,height:2,background:'#ac623a'}}/><span style={{fontFamily:'Sora',fontSize:24,letterSpacing:1,color:'#524b40'}}>You imagine. We build. We manage.</span>
    </div>
  </AbsoluteFill>;
};

const FilmShot = ({src,frames}:{src:string;frames:number}) => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  return <AbsoluteFill style={{opacity:interpolate(frame,[0,21],[0,1],clamp),overflow:'hidden'}}>
    <Video src={staticFile(src)} durationInFrames={frames} premountFor={fps} muted objectFit="cover" style={{width:'100%',height:'100%',scale:interpolate(frame,[0,frames-1],[1,1.025],clamp)}}/>
  </AbsoluteFill>;
};

export const Cinematic = () => {
  const {fps}=useVideoConfig();
  return <AbsoluteFill style={{background:'#ded9d1'}}>
    <style>{`@font-face{font-family:Sora;src:url('${staticFile('sora.woff2')}') format('woff2');font-weight:100 800;}`}</style>
    <Sequence name="01 — The complete opening drawing" durationInFrames={300} premountFor={fps}><Opening/></Sequence>
    <Sequence name="02 — Architecture, connection, assembly" from={279} durationInFrames={555} premountFor={fps}><FilmShot src="cinematic-assembly.mp4" frames={555}/></Sequence>
    <Sequence name="03 — From the machine into the system" from={810} durationInFrames={270} premountFor={fps}><FilmShot src="cinematic-services.mp4" frames={270}/></Sequence>
    <Sequence name="04 — Build, connect, expand, care, approach" from={1056} durationInFrames={600} premountFor={fps}><FilmShot src="cinematic-software.mp4" frames={600}/></Sequence>
    <Sequence name="05 — A quiet brand signature" from={1632} durationInFrames={168} premountFor={fps}><Closing/></Sequence>
    <Audio name="Graphite / Circuit — original sound design" src={staticFile('graphite-circuit.wav')} durationInFrames={1800} premountFor={fps} volume={.8}/>
  </AbsoluteFill>;
};
