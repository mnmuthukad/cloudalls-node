"""Fix the broken Social Media Manager description in data/careers.json.

Root cause: the description string value is missing its closing quote AND the
comma that follows it, so the value runs into the next key:

    ...analytics dashboards.</li></ul>
        "start_date": ...

After fix it becomes valid JSON:

    ...analytics dashboards.</li></ul>",
        "start_date": ...
"""
import json
import sys

PATH = 'data/careers.json'
ANCHOR = 'analytics dashboards.</li></ul>'

raw = open(PATH, encoding='utf8').read()
idx = raw.find(ANCHOR)
if idx < 0:
    print('anchor not found')
    sys.exit(1)

ins = idx + len(ANCHOR)
# raw[ins] is the bare newline; replace it with '"\n        ,'  (closing quote +
# comma after the newline, keeping the same indentation as the surrounding keys)
indent = ''
j = ins + 1
while j < len(raw) and raw[j] in ' \t':
    indent += raw[j]
    j += 1
fixed = raw[:ins] + '",\n' + indent + raw[ins + 1:]

data = json.loads(fixed)
print('valid JSON:', len(data), 'entries')
smm = [e for e in data if e.get('id') == 19][0]
print('SMM title:', smm['title'])
print('SMM desc tail:', smm['description'][-60:])
print('SMM start_date:', smm.get('start_date'))

open(PATH, 'w', encoding='utf8').write(fixed)
print('written back to', PATH)
