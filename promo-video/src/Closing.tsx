import {AbsoluteFill, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export const Closing = () => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const enter=spring({frame:frame-5,fps,config:{damping:200},durationInFrames:30});
  return <AbsoluteFill style={{background:'#ded9d1',color:'#292823',fontFamily:'Sora',padding:'94px 116px',opacity:interpolate(frame,[0,15],[0,1],{extrapolateRight:'clamp'}),overflow:'hidden'}}>
    <style>{`@font-face {font-family:Sora;src:url('${staticFile('sora.woff2')}') format('woff2');font-weight:100 800;}`}</style>
    <div style={{position:'absolute',right:-80,top:-160,width:900,height:900,border:'1px solid #bfb8ac',borderRadius:'50%',scale:interpolate(frame,[0,104],[.9,1.04])}} />
    <div style={{position:'absolute',right:30,top:-50,width:680,height:680,border:'1px solid #c8c0b3',borderRadius:'50%'}} />
    <div style={{fontSize:19,letterSpacing:5,color:'#8e4b2c'}}>FROM IDEA TO EVERYDAY.</div>
    <div style={{display:'flex',alignItems:'center',gap:30,marginTop:75,translate:`0 ${(1-enter)*45}px`,opacity:enter}}>
      <svg width="118" height="100" viewBox="0 0 58 48"><rect fill="currentColor" width="36" height="10" rx="3"/><rect fill="#bb6138" width="10" height="10" rx="3" x="42"/><rect fill="currentColor" width="40" height="10" rx="3" y="19"/><rect fill="currentColor" width="26" height="10" rx="3" y="38"/></svg>
      <div style={{fontSize:150,fontWeight:500,letterSpacing:-10}}>Enginara<span style={{color:'#bb6138'}}>.</span></div>
    </div>
    <div style={{marginTop:65,fontSize:69,lineHeight:1.2,letterSpacing:-3,translate:`0 ${interpolate(frame,[12,38],[25,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}px`,opacity:interpolate(frame,[12,30],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}>
      You imagine. <span style={{color:'#a85934'}}>We build.</span><br/>We manage.
    </div>
    <div style={{position:'absolute',bottom:95,left:116,right:116,borderTop:'1px solid #bdb5a9',paddingTop:30,display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:26}}>
      <span>What should we build together? <span style={{color:'#a85934'}}>↗</span></span>
      <span style={{fontSize:23}}>info@enginara.tech</span>
    </div>
  </AbsoluteFill>;
};
