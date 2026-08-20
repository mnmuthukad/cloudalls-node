"""Chunk 5 fails at char 1060 'Expecting ,'. Dump exact bytes around it and
hunt for invisible characters (NBSP, zero-width, etc.) in the whole SMM entry.
"""
import json
import re

raw = open('data/careers.json', encoding='utf8').read()
idx = raw.find('analytics dashboards.</li></ul>')
ins = idx + len('analytics dashboards.</li></ul>')
fixed = raw[:ins] + '"\n' + raw[ins + 1:]

inner = fixed.strip()[1:-1]
objs = re.split(r'\},\s*\n\s*\{', inner)
chunk = '{' + objs[5] + '}' if len(objs) == 6 else objs[5]

seg = chunk[1050:1075]
print('repr:', repr(seg))
print('bytes:', seg.encode('utf8'))
for i, c in enumerate(seg):
    if ord(c) > 127 or (ord(c) < 32 and c not in '\n'):
        print(f'suspicious char {ord(c):#x} at offset {1050+i}')

# Also scan whole chunk for any non-ASCII
for i, c in enumerate(chunk):
    o = ord(c)
    if o > 127:
        print(f'non-ASCII {o:#x} at {i}: {chunk[max(0,i-30):i+30]!r}')
