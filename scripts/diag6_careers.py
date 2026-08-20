"""Brute force: exact JSON scanner state trace from the SMM entry start,
printing every string open/close so we see precisely where the description
string begins and ends."""

raw = open('data/careers.json', encoding='utf8').read()
idx = raw.find('analytics dashboards.</li></ul>')
ins = idx + len('analytics dashboards.</li></ul>')
fixed = raw[:ins] + '"\n' + raw[ins + 1:]

i = fixed.find('"id": 19')
brace = fixed.rfind('{', 0, i)

trace = []
pos = brace
depth_obj = 0
in_str = False
esc = False
while pos < len(fixed):
    c = fixed[pos]
    if in_str:
        if esc:
            esc = False
        elif c == '\\':
            esc = True
        elif c == '"':
            in_str = False
            trace.append(('STR_CLOSE', pos, fixed[max(brace, pos-40):pos]))
    else:
        if c == '"':
            in_str = True
            trace.append(('STR_OPEN', pos, fixed[pos:pos+60]))
        elif c == '{':
            depth_obj += 1
        elif c == '}':
            depth_obj -= 1
            if depth_obj == 0:
                break
    pos += 1

for kind, p, ctx in trace:
    print(f'{kind:9} {p} {ctx[:70]!r}')
