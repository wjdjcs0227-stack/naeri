"""Render the rooftop's original note patterns; no third-party recordings.
Requires macOS afconvert for AAC encoding. Output is committed for deployment.
"""
import math, random, wave, struct, subprocess, tempfile, argparse
from pathlib import Path
SR=44100
THEMES={
 'clear':([60,64,67,71,67,64,62,67],[48,45,41,43],1.45,.018,350),
 'rain':([57,60,64,67,64,60,55,59],[45,41,48,43],1.75,.18,2700),
 'snow':([72,79,76,83,79,74,76,71],[48,43,45,41],1.95,.008,600),
}
parser=argparse.ArgumentParser()
parser.add_argument('--theme', choices=list(THEMES))
args=parser.parse_args()
for name,(notes,bass,pace,noise,cutoff) in THEMES.items():
 if args.theme and name != args.theme: continue
 length=round(16*pace*SR); samples=[0.0]*length
 def tone(midi,start,bell,level):
  frequency=440*2**((midi-69)/12); decay=4.8 if bell else 3.8
  partials=[(1,1),(2.76,.12),(5.4,.025)] if bell else [(1,1),(2,.12)]
  offset=round(start*SR)
  for i in range(round(5*SR)):
   t=i/SR;env=t/.035 if t<.035 else math.exp(math.log(.0001/level)*(t-.035)/(decay-.035))
   value=sum(math.sin(2*math.pi*frequency*r*t)*v for r,v in partials)
   samples[(offset+i)%length]+=value*env*level
 for step in range(16):
  tone(notes[step%8],step*pace,name=='snow',.1 if name=='snow' else .13)
  if step%4==0:
   tone(bass[(step//4)%4],step*pace+.1,False,.075)
   tone(bass[(step//4)%4]+7,step*pace+.2,False,.035)
 rng=random.Random(20261106); alpha=1-math.exp(-2*math.pi*cutoff/SR); previous=0
 for i in range(length):
  previous+=alpha*(rng.uniform(-1,1)-previous);samples[i]+=previous*noise
 if name == 'snow':
  # Soft winter gusts and intermittent granular snow compression, all synthesized.
  # Broad, rounded noise avoids rain-like hiss and sharp percussive transients.
  wind=0.0
  for i in range(length):
   wind += .028*(rng.uniform(-1,1)-wind)
   swell=.5-.5*math.cos(2*math.pi*i/length*3)
   samples[i] += wind*(.045+.08*swell)
  for start in (2.4,3.5,9.8,11.0,19.2,20.5,26.7,27.9):
   duration=.7; low=0.0; dust=0.0
   for i in range(round(duration*SR)):
    t=i/SR; u=t/duration
    raw=rng.uniform(-1,1); low+=.08*(raw-low); dust+=.34*(raw-dust)
    envelope=math.sin(math.pi*u)**1.7
    grains=.55+.45*math.sin(2*math.pi*31*t+2*math.sin(2*math.pi*7*t))**2
    samples[(round(start*SR)+i)%length] += (low*.25+dust*.035)*envelope*grains
 # Gentle boundary taper prevents a click when AAC loops; limiter leaves headroom.
 pcm=bytearray()
 for i,x in enumerate(samples):
  fade=min(1,i/(SR*.04),(length-1-i)/(SR*.04)); value=math.tanh(x*1.7)*.65*fade
  pcm.extend(struct.pack('<h',int(value*32767)))
 with tempfile.TemporaryDirectory() as d:
  wav=Path(d)/'source.wav'
  with wave.open(str(wav),'wb') as f:f.setnchannels(1);f.setsampwidth(2);f.setframerate(SR);f.writeframes(pcm)
  out=Path('public/audio')/(name+'.m4a')
  subprocess.run(['/usr/bin/afconvert','-f','m4af','-d','aac ','-b','64000',str(wav),str(out)],check=True)
  print(name,round(length/SR,2),'seconds',out.stat().st_size,'bytes')
