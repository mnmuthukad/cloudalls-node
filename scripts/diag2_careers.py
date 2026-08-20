"""Find why json.loads still fails at 7247 after adding the closing quote.

Walk the fixed content token-by-token like the JSON decoder: track whether we
are inside the SMM description string, and log every bare quote position.
"""
raw = open('data/careers.json', encoding='utf8').read()
prefix = 'analytics dashboards.</li></ul>'
idx = raw.find(prefix)
fixed = raw[:idx + len(prefix)] + '"\n' + raw[idx + len(prefix) + 1:]

# Token walk
in_string = False
esc = False
quotes = []
for i, c in enumerate(fixed):
    if in_string:
        if esc:
            esc = False
        elif c == '\\':
            esc = True
        elif c == '"':
            in_string = False
            quotes.append(('close', i))
    else:
        if c == '"':
            in_string = True
            quotes.append(('open', i))

# print quote pairs
pairs = []
stack = []
for kind, pos in quotes:
    if kind == 'open':
        stack.append(pos)
    else:
        if not stack:
            print('STRAY close quote at', pos, repr(fixed[pos-30:pos+30]))
        else:
            pairs.append((stack.pop(), pos))
for s in stack:
    print('UNCLOSED open quote at', s, repr(fixed[s:s+40]))

print('total pairs:', len(pairs))
# which pair contains char 7247?
for s, e in pairs:
    if s <= 7247 <= e:
        print('char 7247 inside pair', s, '-', e)
        print('pair content:', repr(fixed[s:e+1][:100]), '...', repr(fixed[s:e+1][-100:]))
        break
