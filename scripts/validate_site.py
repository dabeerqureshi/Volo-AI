"""Final full-site validation: tag balance, JSON-LD JSON validity, stale content scan."""
import html.parser
import json
import re
import sys

VOID = {'br', 'img', 'meta', 'link', 'input', 'hr', 'source', 'area', 'base',
        'col', 'embed', 'param', 'track', 'wbr'}

fails = 0


class P(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.errors = []

    def handle_starttag(self, tag, attrs):
        if tag not in VOID:
            self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if self.stack and self.stack[-1] == tag:
            self.stack.pop()
        elif tag in self.stack:
            while self.stack and self.stack[-1] != tag:
                self.errors.append('unclosed ' + self.stack.pop())
            if self.stack:
                self.stack.pop()
        else:
            self.errors.append('stray close ' + tag)


files_html = ['index.html', 'comparison.html', 'privacy-policy.html',
              'terms-and-conditions.html', '404.html']

print('== HTML tag balance ==')
for f in files_html:
    p = P()
    p.feed(open(f).read())
    ok = not p.errors and not p.stack
    if not ok:
        fails += 1
    print('%-28s -> %s' % (f, 'OK' if ok else ('ERR %s %s' % (p.stack[:3], p.errors[:3]))))

print('\n== JSON-LD validity ==')
src = open('index.html').read()
for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', src, re.S):
    try:
        data = json.loads(m.group(1))
        offers = data['@graph'][1]['offers']
        types = [node.get('@type') for node in data['@graph']]
        print('JSON-LD OK | lowPrice=%s highPrice=%s offerCount=%s' % (
            offers['lowPrice'], offers['highPrice'], offers['offerCount']))
        print('JSON-LD nodes:', ', '.join(types))
        for required in ('ItemList', 'FAQPage'):
            if required not in types:
                fails += 1
                print('JSON-LD MISSING node:', required)
    except Exception as e:
        fails += 1
        print('JSON-LD INVALID:', e)

print('\n== Stale content scan ==')
stale_terms = ['£1,620', '£135/mo', '7-day', 'qureshidabeer', 'dental',
               'dhqlimited', '$1', 'calendly', 'airtable', 'hubspot', 'whatsapp',
               '14-day', '£29', '£79', '£129']
# £150 is intentionally used in comparison.html to show human-receptionist costs
for f in files_html + ['README.md', 'script.js', 'roi-calculator.js',
                       'sitemap.xml', 'robots.txt']:
    text = open(f).read().lower()
    hits = [t for t in stale_terms if t in text]
    if hits:
        fails += 1
        print('%-28s -> STALE: %s' % (f, hits))

print('\n== Correct pricing present ==')
index_text = open('index.html').read()
prices = ['£150/month', '£1,500/year', 'Two months free']
missing = [p for p in prices if p not in index_text]
if missing:
    fails += 1
    print('index.html MISSING prices:', missing)
else:
    print('index.html package prices present')

print('\n== Features / FAQ count ==')
print('feature cards in index:', index_text.count('feature-card'))
capabilities = ['Check availability', 'Book appointments', 'Cancel appointments',
                'Reschedule appointments', 'Transfer call to the owner', 'Answer FAQs',
                'Google Sheets CRM', 'Google Calendar booking',
                'Email notifications to both', 'Full 24/7 support']
print('capabilities:', all(x in index_text for x in capabilities))
if not all(x in index_text for x in capabilities):
    fails += 1
    print('index.html MISSING capabilities')
faqs = ['How much does Volo cost?', 'Can Volo transfer a call to me?',
        'Who gets notified when an appointment is booked?',
        'Is my data safe and GDPR-compliant?']
print('new FAQs:', all(x in index_text for x in faqs))
if not all(x in index_text for x in faqs):
    fails += 1
    print('index.html MISSING FAQs')

print('\n== Industry demos section ==')
industries = ['AI receptionist for hair & beauty salons',
              'AI receptionist for driving schools',
              'AI receptionist for pet groomers',
              'AI receptionist for physiotherapy & sports massage',
              'AI receptionist for aesthetics & beauty clinics']
missing_industries = [i for i in industries if i not in index_text]
problems = []
if 'id="demos"' not in index_text:
    problems.append('missing #demos section')
if index_text.count('class="demo-card') < 5:
    problems.append('fewer than 5 demo cards')
if 'src="demos.js"' not in index_text:
    problems.append('demos.js not linked')
if 'id="lightbox"' not in index_text:
    problems.append('missing lightbox dialog')
if missing_industries:
    problems.append('missing industries: %s' % missing_industries)
if problems:
    fails += 1
    print('index.html PROBLEMS:', '; '.join(problems))
else:
    print('5 industry demo cards, demos.js and the lightbox are all present')

print('\n== Contact details ==')
contact_email = 'volo.ai.uk@gmail.com'
if contact_email not in index_text:
    fails += 1
    print('index.html MISSING contact email:', contact_email)
else:
    print('index.html contact email present:', contact_email)
for f in files_html + ['README.md']:
    text = open(f).read().lower()
    banned = [b for b in ('wa.me', 'hello@voloai.uk', 'whatsapp', '+92 314 4781120', 'calendly', 'airtable', 'hubspot') if b in text]
    if banned:
        fails += 1
        print('%-28s -> BANNED contact/legacy: %s' % (f, banned))

print('\n== Summary ==')
print('PASS' if fails == 0 else '%d PROBLEM(S) FOUND' % fails)
sys.exit(1 if fails else 0)