"""Check for TAB characters (valid in file whitespace but invalid inside JSON
string values) which my earlier scan excluded."""
raw = open('data/careers.json', encoding='utf8').read()

# find string boundaries by token walk
in_string = False
esc = False
for i, c in enumerate(raw):
    if in_string:
        if esc:
            esc = False
        elif c == '\\':
            esc = True
        elif c == '"':
            in_string = False
        elif c == '\t':
            print(f'TAB INSIDE STRING at {i}: {raw[max(0,i-60):i+60]!r}')
    else:
        if c == '"':
            in_string = True

print('scan done')
