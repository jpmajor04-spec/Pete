from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

_HERE = Path(__file__).parent

def _font_path(bundled_name, system_path):
    bundled = _HERE / "fonts" / bundled_name
    return str(bundled) if bundled.exists() else system_path

FONT_SERIF_BOLD = _font_path("Georgia Bold.ttf",      "/System/Library/Fonts/Supplemental/Georgia Bold.ttf")
FONT_LABEL      = _font_path("DIN Alternate Bold.ttf", "/System/Library/Fonts/Supplemental/DIN Alternate Bold.ttf")
FONT_SANS       = _font_path("SFNS.ttf",               "/System/Library/Fonts/SFNS.ttf")

BG         = (245, 240, 232)
BORDER     = (221, 214, 200)
TEXT       = (28, 18, 8)
TEXT_SEC   = (92, 79, 61)
TEXT_MUTED = (160, 144, 122)
TERRACOTTA = (184, 76, 42)
OLD_WORD   = (180, 162, 138)


def vmetrics(draw, text, font):
    """Returns (x_bearing, visual_w, visual_h, y_bearing)."""
    bb = draw.textbbox((0, 0), text, font=font)
    return bb[0], bb[2] - bb[0], bb[3] - bb[1], bb[1]


def draw_center(draw, text, font, W, y, fill):
    x0, vw, vh, _ = vmetrics(draw, text, font)
    draw.text(((W - vw) // 2 - x0, y), text, font=font, fill=fill)
    return vw, vh


def fit_font(draw, text, font_path, max_w, start=180, stop=60):
    for size in range(start, stop, -4):
        f = ImageFont.truetype(font_path, size)
        _, vw, _, _ = vmetrics(draw, text, f)
        if vw <= max_w:
            return f
    return ImageFont.truetype(font_path, stop)


def wrap_text(draw, text, font, max_w):
    words, lines, line = text.split(), [], ""
    for word in words:
        test = f"{line} {word}".strip()
        _, vw, _, _ = vmetrics(draw, test, font)
        if vw > max_w and line:
            lines.append(line)
            line = word
        else:
            line = test
    if line:
        lines.append(line)
    return lines


def make_vocab_post(old_word, new_word, definition, out_path):
    W, H  = 1080, 1350
    pad   = 88

    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    # warm vignette
    vig = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    vd  = ImageDraw.Draw(vig)
    for i in range(160):
        a = int((1 - i / 160) * 20)
        vd.rectangle([(i, i), (W - i, H - i)], outline=(180, 100, 50, a))
    img = Image.alpha_composite(img.convert("RGBA"), vig).convert("RGB")
    draw = ImageDraw.Draw(img)

    # accent bars
    draw.rectangle([(0, 0), (W, 8)],     fill=TERRACOTTA)
    draw.rectangle([(0, H - 8), (W, H)], fill=TERRACOTTA)

    f_label = ImageFont.truetype(FONT_LABEL,      46)
    f_old   = ImageFont.truetype(FONT_SERIF_BOLD, 120)
    f_def   = ImageFont.truetype(FONT_SANS,       44)
    f_brand = ImageFont.truetype(FONT_SERIF_BOLD, 60)
    f_cta   = ImageFont.truetype(FONT_SANS,       32)

    f_new = fit_font(draw, new_word.upper(), FONT_SERIF_BOLD, W - pad * 2, start=190)

    # ── Fixed proportional Y positions ──
    # Spread content evenly so nothing bunches up at top or bottom.
    y_instead = int(H * 0.07)   # 94
    y_old     = int(H * 0.14)   # 189
    y_div1    = int(H * 0.30)   # 405
    y_use     = int(H * 0.34)   # 459
    y_new     = int(H * 0.42)   # 567
    y_div2    = int(H * 0.62)   # 837
    y_def     = int(H * 0.67)   # 905
    y_brand   = int(H * 0.88)   # 1188

    # INSTEAD OF
    draw_center(draw, "INSTEAD OF", f_label, W, y_instead, TERRACOTTA)

    # old word + strikethrough
    old_upper = old_word.upper()
    x0, ow, oh, _ = vmetrics(draw, old_upper, f_old)
    draw.text(((W - ow) // 2 - x0, y_old), old_upper, font=f_old, fill=OLD_WORD)
    vl = (W - ow) // 2
    vr = vl + ow
    draw.line([(vl - 16, y_old + oh // 2 + 4), (vr + 16, y_old + oh // 2 + 4)],
              fill=TERRACOTTA, width=12)

    # divider 1
    draw.line([(pad, y_div1), (W - pad, y_div1)], fill=BORDER, width=2)

    # USE
    draw_center(draw, "USE", f_label, W, y_use, TERRACOTTA)

    # new word — large, bold, terracotta so it pops against the background
    new_upper = new_word.upper()
    x0, nw, nh, _ = vmetrics(draw, new_upper, f_new)
    draw.text(((W - nw) // 2 - x0, y_new), new_upper, font=f_new, fill=TERRACOTTA)

    # divider 2
    draw.line([(pad, y_div2), (W - pad, y_div2)], fill=BORDER, width=2)

    # definition
    lines = wrap_text(draw, definition, f_def, W - pad * 2)
    y = y_def
    for ln in lines:
        _, lh = draw_center(draw, ln, f_def, W, y, TEXT_SEC)
        y += lh + 14

    # Pete branding
    _, brand_h = draw_center(draw, "Pete", f_brand, W, y_brand, TEXT)
    draw_center(draw, "Vocab app · App Store", f_cta, W, y_brand + brand_h + 8, TEXT_MUTED)

    img.save(out_path, "PNG")
    print(f"Saved {out_path}")


WORDS = [
    ("Happy",   "Elated",       "Ecstatically happy — not just content, overwhelmingly joyful."),
    ("Tired",   "Languid",      "Slow and relaxed from weariness — a tiredness you can feel in your bones."),
    ("Angry",   "Livid",        "Furiously angry — past annoyed, past frustrated, fully burning."),
    ("Big",     "Colossal",     "So large it's hard to comprehend — not just big, impossibly big."),
    ("Scared",  "Petrified",    "Frozen solid with fear — past nervous, past worried, completely paralysed."),
    ("Sad",     "Despondent",   "Deep hopeless sadness — not just down, feeling like things won't improve."),
    ("Walk",    "Saunter",      "To walk slowly and confidently — like you own the place and you know it."),
    ("Smart",   "Astute",       "Sharply perceptive — reads a room, a person, or a problem in an instant."),
    ("Brave",   "Intrepid",     "Fearlessly bold — not reckless, just genuinely unbothered by danger."),
    ("Quiet",   "Reticent",     "Reluctant to speak — holding back deliberately, not just being shy."),
    ("Upset",   "Distraught",   "Deeply distressed — past upset, past hurt, completely overwhelmed by it."),
    ("Eat",     "Devour",       "To consume hungrily and fast — less a meal, more an attack on the food."),
]

for old, new, defn in WORDS:
    slug = f"{old.lower()}-{new.lower()}"
    make_vocab_post(old, new, defn, f"instagram/vocab-{slug}.png")
