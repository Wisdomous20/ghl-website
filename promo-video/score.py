"""Original sixty-second 'Graphite / Circuit' score. No stock music or samples.

Sparse glass/wood resonances, sustained harmonics, graphite-like friction,
and tiny assembly clicks follow the film's drawing -> engineering -> system arc.
"""
import wave
from pathlib import Path
import numpy as np

SR=48000
DURATION=60
rng=np.random.default_rng(187)
mix=np.zeros((SR*DURATION,2),dtype=np.float64)

def add(signal,start,gain=1,pan=0):
    i=round(start*SR)
    n=min(len(signal),len(mix)-i)
    if n<=0:return
    angle=(pan+1)*np.pi/4
    mix[i:i+n,0]+=signal[:n]*gain*np.cos(angle)
    mix[i:i+n,1]+=signal[:n]*gain*np.sin(angle)

def env(t,attack,release,duration):
    return np.minimum(1,t/attack)**2*np.minimum(1,np.maximum(0,(duration-t)/release))**2

def pad(freq,duration):
    t=np.arange(round(duration*SR))/SR
    s=np.sin(2*np.pi*freq*t+.07*np.sin(2*np.pi*.17*t))
    s+=.28*np.sin(2*np.pi*freq*2.001*t+.12*np.sin(2*np.pi*.11*t))
    s+=.09*np.sin(2*np.pi*freq*3*t)
    return s*env(t,3,4,duration)*(.87+.13*np.sin(2*np.pi*.085*t))

def note(freq,duration=4):
    t=np.arange(round(duration*SR))/SR
    s=np.sin(2*np.pi*freq*t)*np.exp(-t/1.6)
    s+=.22*np.sin(2*np.pi*freq*2.003*t)*np.exp(-t/.6)
    s+=.07*np.sin(2*np.pi*freq*3.99*t)*np.exp(-t/.22)
    return s*(1-np.exp(-t/.018))*np.minimum(1,(duration-t)/.2)

def texture(duration,low,high):
    n=round(duration*SR)
    raw=rng.normal(0,1,n)
    f=np.fft.rfftfreq(n,1/SR)
    weight=np.exp(-(f/high)**4)*(1-np.exp(-(f/low)**4))
    signal=np.fft.irfft(np.fft.rfft(raw)*weight,n)
    return signal/(np.std(signal)+1e-8)

# Sustained open fifths and added ninths: slow tonal movement without a pop beat.
for start,dur,freq,gain,pan in [
    (0,20,164.81,.035,-.3),(2,23,246.94,.022,.35),(6,27,82.41,.045,0),
    (10,25,185,.018,.45),(18,25,196,.024,-.45),(26,23,123.47,.028,.2),
    (34,22,164.81,.035,-.2),(36,22,246.94,.022,.4),(46,14,82.41,.04,0),
    (51,9,329.63,.023,-.3),(52,8,369.99,.014,.35)]:
    add(pad(freq,dur),start,gain,pan)

# Delicate graphite strokes during the actual eight-second hand drawing.
for start,dur in [(.35,.6),(1.15,.8),(2.2,.6),(3.1,.9),(4.2,.65),(5.15,.85),(6.3,.55),(7,.8)]:
    t=np.arange(round(dur*SR))/SR
    friction=texture(dur,900,5600)*env(t,.05,.12,dur)
    friction*=.35+.65*np.sin(2*np.pi*(6+t*2)*t)**2
    add(friction,start,.016,(-.3+start*.08))

# Widely spaced, damped resonances. They leave air around each visual reveal.
for start,freq,gain,pan in [
    (1.0,329.63,.055,-.3),(4.6,493.88,.035,.3),(8.15,659.25,.04,0),
    (10.2,164.81,.07,-.2),(14.3,246.94,.05,.25),(18.1,329.63,.045,-.25),
    (22.0,369.99,.04,.3),(25.8,493.88,.045,0),(28.4,164.81,.055,-.2),
    (32.0,329.63,.04,.2),(35.6,246.94,.06,-.3),(39.8,369.99,.045,.3),
    (43.8,493.88,.045,-.2),(47.8,329.63,.05,.3),(51.8,246.94,.04,-.15),
    (54.8,164.81,.07,0),(55.5,329.63,.045,-.3),(56.1,493.88,.035,.3)]:
    add(note(freq),start,gain,pan)

# Mechanical seating ticks and subtle signal pulses, not drums.
for j,start in enumerate([12.7,15.0,17.4,19.7,21.9,24.1,29.7,32.3,36.2,38.2,40.2,42.2,44.2,46.2,48.2,50.2,52.2]):
    dur=.14;t=np.arange(round(dur*SR))/SR
    click=(texture(dur,400,4200)*.3+np.sin(2*np.pi*820*t))*np.exp(-t/0.018)*(1-np.exp(-t/.001))
    add(click,start,.023,(-.35 if j%2 else .35))
for start in [9.3,27,35.2,54.4]:
    dur=1.2;t=np.arange(round(dur*SR))/SR
    brush=texture(dur,160,1600)*np.sin(np.pi*t/dur)**3
    add(brush,max(0,start-.5),.009,-.1)

# Quiet stereo room reflections with no feedback; deterministic and clipping-safe.
dry=mix.copy()
for delay,decay in [(.113,.16),(.239,.12),(.421,.09),(.683,.06),(1.013,.035)]:
    offset=round(delay*SR)
    mix[offset:]+=dry[:-offset,::-1]*decay
t=np.arange(len(mix))/SR
mix*=np.minimum(1,t/1.1)[:,None]*np.minimum(1,np.maximum(0,(DURATION-t)/3.4))[:,None]**1.5
peak=np.max(np.abs(mix))
mix*=.63/max(peak,1e-9)
Path('public').mkdir(exist_ok=True)
with wave.open('public/graphite-circuit.wav','wb') as out:
    out.setnchannels(2);out.setsampwidth(2);out.setframerate(SR)
    out.writeframes((np.clip(mix,-1,1)*32767).astype('<i2').tobytes())
print(f'Original score: {DURATION}s stereo; peak {20*np.log10(np.max(np.abs(mix))):.1f} dBFS')
