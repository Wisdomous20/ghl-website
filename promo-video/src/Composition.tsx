import {AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Audio, Video} from '@remotion/media';
import {Closing} from './Closing';
import './style.css';

export const Promo = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <AbsoluteFill style={{background:'#ded9d1'}}>
    <Video name="Actual website animation capture" src={staticFile('site-motion.mp4')} durationInFrames={810} premountFor={fps} muted style={{width:'100%',height:'100%'}} />
    <Sequence name="Enginara closing signature" from={795} durationInFrames={105} premountFor={fps}><Closing /></Sequence>
    <Audio name="Inspired Ambient soundtrack" src={staticFile('music.mp3')} trimBefore={8*fps} durationInFrames={900} premountFor={fps} volume={f=>interpolate(f,[0,30,810,899],[0,.65,.65,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})} />
    <div style={{position:'absolute',bottom:0,left:0,height:4,background:'#bb6138',width:`${interpolate(frame,[0,899],[0,100])}%`}} />
  </AbsoluteFill>;
};
