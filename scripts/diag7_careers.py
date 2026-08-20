"""raw_decode the SMM object starting at its opening brace."""
import json

raw = open('data/careers.json', encoding='utf8').read()
idx = raw.find('analytics dashboards.</li></ul>')
ins = idx + len('analytics dashboards.</li></ul>')
fixed = raw[:ins] + '"\n' + raw[ins + 1:]

brace_start = fixed.rfind('{', 0, fixed.find('"id": 19'))
print('brace at', brace_start)

decoder = json.JSONDecoder()
try:
    obj, endpos = decoder.raw_decode(fixed, brace_start)
    print('PARSES OK:', obj['title'], '| endpos:', endpos)
except json.JSONDecodeError as e:
    print('FAIL at', e.pos, e.msg)
    print(repr(fixed[max(brace_start, e.pos - 120):e.pos + 60]))
