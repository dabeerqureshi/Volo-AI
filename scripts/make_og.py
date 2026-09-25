import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1200, 630
img = Image.new('RGB', (W, H))
px = img.load()
top = (13, 15, 30)
bottom = (7, 7, 14)
for y in range(H):
    t = y / (H - 1)
    r = int(top[0] + (bottom[0] - top[0]) * t)
    g = int(top[1] + (bottom[1] - top[1]) * t)
    b = int(top[2] + (bottom[2] - top[2]) * t)
    for x in range(W):
        px[x, y] = (r, g, b)


def glow(c, cx, cy, rad, alpha):
    layer = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(layer)
    d.ellipse([cx - rad, cy - rad, cx + rad, cy + rad], fill=int(255 * alpha))
    layer = layer.filter(ImageFilter.GaussianBlur(rad * 0.45))
    rgb = Image.new('RGB', (W, H), c)
    img.paste(Image.composite(rgb, img, layer), (0, 0), layer)


glow((139, 92, 246), 240, 290, 320, 0.32)
glow((34, 211, 238), 1010, 210, 260, 0.24)
glow((99, 102, 241), 740, 540, 300, 0.18)

# waveform bars on right
bars = 44
x0, ybase = 855, 600
for i in range(bars):
    wave = math.sin(i * 0.33) + 0.6 * math.sin(i * 0.13)
    if wave > 0:
        h = int(60 + 110 * wave)
    else:
        h = int(24 + 40 * abs(math.sin(i * 0.5)))
    h = min(h, 210)
    t = i / bars
    col = (int(139 + (34 - 139) * t), int(92 + (211 - 92) * t), int(246 + (238 - 246) * t))
    d = ImageDraw.Draw(img)
    d.rectangle([x0 + i * 6, ybase - h, x0 + i * 6 + 3, ybase], fill=col)

CAND = [
    '/System/Library/Fonts/Helvetica.ttc',
    '/Library/Fonts/Helvetica.ttc',
    '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
    '/System/Library/Fonts/Arial.ttf',
    '/Library/Fonts/Arial.ttf',
]


def load_font(size):
    for c in CAND:
        try:
            return ImageFont.truetype(c, size)
        except Exception:
            continue
    return ImageFont.load_default()


f_big = load_font(58)
f_sub = load_font(33)
f_line = load_font(27)
f_chip = load_font(26)
vf = load_font(110)

d = ImageDraw.Draw(img)

# badge
bx, by, bw, bh = 96, 180, 168, 168
outer = [bx, by, bx + bw, by + bh]
inner = [bx + 17, by + 17, bx + bw - 17, by + bh - 17]
d.rounded_rectangle(outer, radius=38, fill=(139, 92, 246))
d.rounded_rectangle(inner, radius=24, fill=(7, 7, 14))
tb = d.textbbox((0, 0), 'V', font=vf)
d.text((bx + (bw - (tb[2] - tb[0])) / 2 - tb[0], by + (bh - (tb[3] - tb[1])) / 2 - tb[1]), 'V', font=vf, fill=(240, 242, 255))

x = 320
d.text((x, 176), 'Never miss a call again.', font=f_big, fill=(245, 247, 255))
d.text((x, 300), 'Volo AI  \u00b7  The AI Voice Receptionist for UK Businesses', font=f_sub, fill=(205, 210, 230))
d.text((x, 382), 'Bookings \u00b7 Cancellations \u00b7 Rescheduling \u00b7 FAQs \u2014 handled 24/7', font=f_line, fill=(160, 168, 200))

chip1 = [x, 470, x + 252, 470 + 52]
d.rounded_rectangle(chip1, radius=26, fill=(34, 211, 238))
tb = d.textbbox((0, 0), 'UNLIMITED CALLS', font=f_chip)
d.text((x + 16, 470 + (52 - (tb[3] - tb[1])) / 2 - tb[1]), 'UNLIMITED CALLS', font=f_chip, fill=(7, 7, 14))

chip2 = [x + 268, 470, x + 268 + 190, 470 + 52]
d.rounded_rectangle(chip2, radius=26, fill=(139, 92, 246))
tb = d.textbbox((0, 0), '\u00a3150/MONTH', font=f_chip)
d.text((x + 284, 470 + (52 - (tb[3] - tb[1])) / 2 - tb[1]), '\u00a3150/MONTH', font=f_chip, fill=(245, 247, 255))

img.save('/Users/dabeer/DentalFlow-AI/assets/images/og-image.png', 'PNG')
print('og-image.png generated OK')