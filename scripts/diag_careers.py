"""Diagnose careers.json structure: walk tokens and find the first parse
failure point with full context."""
import json

raw = open('data/careers.json', encoding='utf8').read()

# apply the known fix (missing closing quote before newline)
fixed = raw.replace('</li></ul>\n    "start_date"', '</li></ul>"\n    "start_date"', 1)

decoder = json.JSONDecoder()
try:
    decoder.decode(fixed)
    print("OK")
except json.JSONDecodeError as e:
    print("fails at char", e.pos)
    print("context:")
    print(repr(fixed[e.pos-120:e.pos+40]))
    # Find surrounding line start
    line_start = fixed.rfind('\n', 0, e.pos)
    print("line context:")
    print(repr(fixed[line_start+1:e.pos+40]))
