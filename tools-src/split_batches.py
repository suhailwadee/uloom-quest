import json, subprocess, re, os
B = json.load(open('tools/batches.json'))
raw = 'voice-raw'; out = 'site/class1-lessons-4-5/audio'; os.makedirs(out, exist_ok=True)
def dur(f): return float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f],capture_output=True,text=True).stdout)
report = []
for b in B:
    f = f"{raw}/{b['name']}.mp3"; n = len(b['ids']); D = dur(f)
    log = subprocess.run(['ffmpeg','-i',f,'-af','silencedetect=noise=-40dB:d=0.25','-f','null','-'],capture_output=True,text=True).stderr
    st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', log)]; en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]
    sil = [(s, e) for s, e in zip(st, en) if s > 0.05 and e < D - 0.05]
    top = sorted(sorted(sil, key=lambda x: x[1]-x[0], reverse=True)[:n-1])
    if len(top) != n-1: print('!! not enough silences', b['name']); continue
    minsep = min(e-s for s,e in top); nxt = sorted([e-s for s,e in sil], reverse=True)
    other = nxt[n-1] if len(nxt) >= n else 0
    print(b['name'], 'n', n, 'weakest split %.2fs, strongest non-split %.2fs' % (minsep, other))
    bounds = [0.0] + [ (s+e)/2 for s,e in top ] + [D]
    for i, cid in enumerate(b['ids']):
        a, z = bounds[i], bounds[i+1]
        o = f"{out}/{cid}.mp3"
        subprocess.run(['ffmpeg','-loglevel','error','-y','-ss',f'{a:.3f}','-to',f'{z:.3f}','-i',f,
          '-af','silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse,loudnorm=I=-16:TP=-1.5:LRA=11,apad=pad_dur=0.05',
          '-ac','1','-ar','24000','-c:a','libmp3lame','-b:a','40k',o], check=True)
        report.append({'id': cid, 'batch': b['name'], 'dur': round(dur(o), 2), 'bytes': os.path.getsize(o)})
json.dump(report, open('tools/clip_report.json','w'), indent=1)
ids = [r['id'] for r in report]
open(f'{out}/manifest.js','w').write('window.UQ_CLIPS = ' + json.dumps(ids) + ';\n')
print('clips', len(ids), 'total KB', sum(r['bytes'] for r in report)//1024)
