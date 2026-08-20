"""Check for unicode quote look-alikes around the SMM entry."""
raw = open('data/careers.json', encoding='utf8').read()
idx = raw.find('analytics dashboards.</li></ul>')
ins = idx + len('analytics dashboards.</li></ul>')
fixed = raw[:ins] + '"\n' + raw[ins + 1:]

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

# Scan every char; flag anything outside ASCII printable + \n
suspicious = []
for i, c in enumerate(obj):
    o = ord(c)
    if o > 126 or (o < 32 and c != '\n'):
        suspicious.append((i, o, c))

print('suspicious chars in object:')
for i, o, c in suspicious:
    print(f'  {i}: U+{o:04X} {repr(obj[max(0,i-20):i+20])}')

# Also specifically print code points of every quote in the object
print('\nquote positions and codepoints:')
for i, c in enumerate(obj):
    if c == '"' or ord(c) in (0x201C, 0x201D, 0x2018, 0x2019):
        print(f'  {i}: U+{ord(c):04X} ctx {repr(obj[max(0,i-15):i+15])}')
