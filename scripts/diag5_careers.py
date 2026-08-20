"""Isolate the exact failure: reconstruct the SMM object from the fixed raw
file using proper brace matching, then parse it standalone."""
import json
import re

raw = open('data/careers.json', encoding='utf8').read()
idx = raw.find('analytics dashboards.</li></ul>')
ins = idx + len('analytics dashboards.</li></ul>')
fixed = raw[:ins] + '"\n' + raw[ins + 1:]

# locate the SMM object by brace matching from '"id": 19'
start = fixed.find('"id": 19')
brace_start = fixed.rfind('{', 0, start)
depth = 0
end = brace_start
for i in range(brace_start, len(fixed)):
    if fixed[i] == '{':
        depth += 1
    elif fixed[i] == '}':
        depth -= 1
        if depth == 0:
            end = i
            break

obj = fixed[brace_start:end + 1]
print('object length:', len(obj))
try:
    data = json.loads(obj)
    print('OBJECT PARSES OK:', data['title'])
except json.JSONDecodeError as e:
    print('fails at', e.pos, e.msg)
    print(repr(obj[max(0, e.pos - 100):e.pos + 60]))
