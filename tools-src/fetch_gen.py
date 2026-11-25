import json,subprocess,sys
# usage: fetch_gen.py <status-file> <genid>=<name> ...
t=open(sys.argv[1]).read(); j=json.loads(t[t.index('{'):t.rindex('}')+1])
m=dict(a.split('=') for a in sys.argv[2:])
print('completed', j.get('all_completed'), 'failed', j.get('has_failures'))
for g in j['generations']:
    if g['id'] in m and g['status']=='completed':
        subprocess.run(['curl','-sL','-o','voice-raw/%s.mp3'%m[g['id']],g['content_url']],check=True); print('got',m[g['id']],round(g['duration_secs'],1),'s',g['price']['credits'])
