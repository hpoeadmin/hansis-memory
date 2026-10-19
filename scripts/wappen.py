# Zeichnet die 26 Kantonswappen (vereinfacht) als SVG.
# Aufruf: python3 scripts/wappen.py public/spiele/kantone
import os, sys

ZIEL = sys.argv[1]
K = '#2E2A26'
ROT = '#D52B1E'
BLAU = '#1E63B5'
HBLAU = '#2F7FD0'
GELB = '#F5C400'
SCHW = '#1C1C1C'
GRUEN = '#2E8B3A'
WEISS = '#FFFFFF'

SCHILD = 'M6 6 H94 V64 C94 92 74 107 50 116 C26 107 6 92 6 64 Z'


def svg(inhalt):
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 122">'
        f'<defs><clipPath id="s"><path d="{SCHILD}"/></clipPath></defs>'
        f'<g clip-path="url(#s)">{inhalt}</g>'
        f'<path d="{SCHILD}" fill="none" stroke="{K}" stroke-width="4" stroke-linejoin="round"/>'
        '</svg>\n'
    )


def feld(farbe):
    return f'<rect width="100" height="122" fill="{farbe}"/>'


def kreuz(cx, cy, g, farbe=WEISS):
    a = g / 2
    b = g / 6
    return f'<path d="M{cx-b} {cy-a} h{2*b} v{a-b} h{a-b} v{2*b} h{-(a-b)} v{a-b} h{-2*b} v{-(a-b)} h{-(a-b)} v{-2*b} h{a-b} Z" fill="{farbe}"/>'


def stern(cx, cy, r, farbe):
    import math
    pkt = []
    for i in range(10):
        rr = r if i % 2 == 0 else r * 0.42
        w = math.radians(-90 + i * 36)
        pkt.append(f'{cx + rr * math.cos(w):.1f},{cy + rr * math.sin(w):.1f}')
    return f'<polygon points="{" ".join(pkt)}" fill="{farbe}"/>'


# Bär nach links schreitend, lokale Koordinaten ca. 0..64 x 0..40
def baer_schreitend(farbe=SCHW):
    return (
        f'<g fill="{farbe}">'
        '<ellipse cx="36" cy="20" rx="22" ry="12"/>'
        '<circle cx="13" cy="13" r="9"/><circle cx="16" cy="4.5" r="3.5"/>'
        '<ellipse cx="4" cy="16" rx="5" ry="3.6"/>'
        '<rect x="17" y="24" width="7" height="15" rx="2"/><rect x="27" y="25" width="7" height="13" rx="2"/>'
        '<rect x="43" y="24" width="7" height="15" rx="2"/><rect x="51" y="22" width="7" height="13" rx="2"/>'
        '<path d="M56 14 l8 -3 l-2 6 Z"/>'
        '</g>'
        f'<path d="M1 18 l-3 3 l4 0 Z" fill="{ROT}"/>'
        f'<path d="M17 39 l-2 2 M20 39 l0 2.5 M23 39 l2 2 M43 39 l-2 2 M46 39 l0 2.5 M49 39 l2 2" stroke="{ROT}" stroke-width="1.2"/>'
        f'<circle cx="10" cy="11" r="1.3" fill="{WEISS}"/>'
    )


# Bär aufrecht nach links (Appenzell), lokale Koordinaten ca. 0..50 x 0..76
def baer_aufrecht(farbe=SCHW):
    return (
        f'<g fill="{farbe}">'
        '<ellipse cx="28" cy="40" rx="15" ry="22"/>'
        '<circle cx="18" cy="14" r="10"/><circle cx="22" cy="5" r="3.6"/>'
        '<ellipse cx="8" cy="17" rx="6" ry="4"/>'
        '<path d="M16 28 L2 24 L2 30 L14 36 Z"/><path d="M20 40 L4 44 L5 50 L22 48 Z"/>'
        '<rect x="18" y="56" width="9" height="18" rx="3"/><rect x="32" y="56" width="9" height="18" rx="3"/>'
        '<path d="M40 50 l8 4 l-6 4 Z"/>'
        '</g>'
        f'<path d="M3 19 l-4 3 l5 1 Z" fill="{ROT}"/>'
        f'<path d="M2 24 l-3 -1 M2 27 l-3 0 M2 30 l-3 1 M4 44 l-3 -1 M4 47 l-3 0 M5 50 l-3 1" stroke="{ROT}" stroke-width="1.3"/>'
        f'<circle cx="14" cy="12" r="1.4" fill="{WEISS}"/>'
    )


# Schlüssel senkrecht, Bart nach rechts (oder links)
def schluessel(x, farbe, links=False):
    s = -1 if links else 1
    bart = f'M{x} 84 h{s*14} v6 h{-s*5} v5 h{s*5} v6 h{-s*14} Z'
    return (
        f'<g fill="{farbe}"><path d="{bart}"/>'
        f'<rect x="{x-3}" y="34" width="6" height="68"/>'
        f'<circle cx="{x}" cy="26" r="12"/></g>'
        f'<circle cx="{x}" cy="26" r="5.5" fill="none"/>'
    )


def schluessel_mit_loch(x, farbe, grund, links=False):
    return schluessel(x, farbe, links) + f'<circle cx="{x}" cy="26" r="5" fill="{grund}"/>'


# Baselstab: Krümme nach links (Basel-Stadt) oder rechts (Basel-Land)
def baselstab(farbe, nach_links=True, krabben=False):
    teile = (
        '<path d="M50 30 C50 14 36 10 30 18 C25 25 32 32 38 28 L40 31 C30 40 20 30 22 20 C25 6 52 4 56 24 L56 30 Z"/>'
        '<rect x="44" y="30" width="12" height="6" rx="1"/>'
        '<path d="M46 36 H54 L53 80 H47 Z"/>'
        '<path d="M42 80 H58 L56 86 H44 Z"/>'
        '<path d="M44 86 H56 L50 108 Z"/>'
    )
    if krabben:
        for x, y in [(22, 10), (31, 5), (42, 5), (52, 11), (57, 21), (18, 22), (21, 32)]:
            teile += f'<circle cx="{x}" cy="{y}" r="3.2"/>'
    g = f'<g fill="{farbe}">{teile}</g>'
    return g if nach_links else f'<g transform="translate(100 0) scale(-1 1)">{g}</g>'


W = {}

W['zh'] = feld(WEISS) + f'<polygon points="0,0 100,122 0,122" fill="{HBLAU}"/>'
W['be'] = feld(ROT) + f'<polygon points="0,-4 26,-4 104,96 104,126 78,126 0,24" fill="{GELB}"/>' + \
    f'<g transform="translate(52 56) rotate(42) scale(1.05) translate(-32 -21)">{baer_schreitend()}</g>'
W['lu'] = feld(WEISS) + f'<rect width="50" height="122" fill="{HBLAU}"/>'
W['ur'] = feld(GELB) + (
    f'<g fill="{SCHW}">'
    '<path d="M30 40 C14 38 10 22 16 14 C18 26 26 30 34 30 Z"/>'
    '<path d="M70 40 C86 38 90 22 84 14 C82 26 74 30 66 30 Z"/>'
    '<path d="M30 30 C40 24 60 24 70 30 C76 46 72 70 64 84 C58 94 42 94 36 84 C28 70 24 46 30 30 Z"/>'
    '<ellipse cx="24" cy="44" rx="9" ry="5" transform="rotate(-20 24 44)"/>'
    '<ellipse cx="76" cy="44" rx="9" ry="5" transform="rotate(20 76 44)"/>'
    '</g>'
    f'<circle cx="41" cy="50" r="3.5" fill="{WEISS}"/><circle cx="59" cy="50" r="3.5" fill="{WEISS}"/>'
    f'<circle cx="41" cy="50" r="1.6" fill="{ROT}"/><circle cx="59" cy="50" r="1.6" fill="{ROT}"/>'
    f'<circle cx="50" cy="88" r="7" fill="none" stroke="{ROT}" stroke-width="3"/>'
    f'<path d="M46 80 q4 10 8 0" fill="{ROT}"/>'
)
W['sz'] = feld(ROT) + kreuz(26, 26, 22)
W['ow'] = (
    f'<rect width="100" height="58" fill="{ROT}"/><rect y="58" width="100" height="64" fill="{WEISS}"/>'
    '<clipPath id="o1"><rect width="100" height="58"/></clipPath><clipPath id="o2"><rect y="58" width="100" height="64"/></clipPath>'
    f'<g clip-path="url(#o1)">{schluessel_mit_loch(50, WEISS, ROT)}</g>'
    f'<g clip-path="url(#o2)">{schluessel(50, ROT)}</g>'
)
W['nw'] = feld(ROT) + schluessel_mit_loch(36, WEISS, ROT, links=True) + schluessel_mit_loch(64, WEISS, ROT)
W['gl'] = feld(ROT) + (
    f'<circle cx="46" cy="24" r="11" fill="{GELB}"/>'
    f'<circle cx="46" cy="25" r="7" fill="#F2D6B3"/>'
    f'<path d="M37 21 C38 12 54 12 55 21 Z" fill="{SCHW}"/>'
    f'<path d="M36 34 C40 31 52 31 56 34 L64 104 H30 Z" fill="{SCHW}"/>'
    f'<line x1="28" y1="30" x2="22" y2="106" stroke="{SCHW}" stroke-width="3.5" stroke-linecap="round"/>'
    f'<rect x="54" y="52" width="11" height="14" rx="1.5" fill="{GELB}" stroke="{SCHW}" stroke-width="1.5"/>'
    f'<path d="M30 48 L24 46" stroke="{SCHW}" stroke-width="5" stroke-linecap="round"/>'
)
W['zg'] = feld(WEISS) + f'<rect y="42" width="100" height="32" fill="{HBLAU}"/>'
W['fr'] = feld(WEISS) + f'<rect width="100" height="58" fill="{SCHW}"/>'
W['so'] = feld(WEISS) + f'<rect width="100" height="58" fill="{ROT}"/>'
W['bs'] = feld(WEISS) + baselstab(SCHW, nach_links=True)
W['bl'] = feld(WEISS) + baselstab(ROT, nach_links=False, krabben=True)
W['sh'] = feld(GELB) + (
    f'<g fill="{SCHW}">'
    '<path d="M44 40 C52 34 66 38 68 52 C70 66 64 80 60 92 L66 106 H58 L52 94 L46 106 H38 L44 90 C38 80 36 60 44 40 Z"/>'
    '<ellipse cx="34" cy="30" rx="12" ry="9" transform="rotate(-25 34 30)"/>'
    '<path d="M36 52 L20 58 L22 64 L40 60 Z"/><path d="M40 64 L24 74 L28 79 L44 70 Z"/>'
    '<path d="M68 70 C80 74 82 86 76 92 C78 84 72 78 66 78 Z"/>'
    '</g>'
    f'<path d="M36 22 C46 12 56 22 48 30 C44 34 40 30 42 26" fill="none" stroke="{GELB}" stroke-width="3.5"/>'
    f'<circle cx="30" cy="27" r="1.6" fill="{WEISS}"/>'
)
W['ar'] = feld(WEISS) + f'<g transform="translate(30 24)">{baer_aufrecht()}</g>' + \
    f'<text x="22" y="46" font-size="16" font-family="Georgia, serif" font-weight="700" fill="{SCHW}">V</text>' + \
    f'<text x="70" y="46" font-size="16" font-family="Georgia, serif" font-weight="700" fill="{SCHW}">R</text>'
W['ai'] = feld(WEISS) + f'<g transform="translate(26 22) scale(1.05)">{baer_aufrecht()}</g>'
W['sg'] = feld(GRUEN) + (
    f'<g fill="{WEISS}" stroke="{GRUEN}" stroke-width="1">'
    '<rect x="40" y="22" width="6" height="84" rx="2"/><rect x="46" y="22" width="6" height="84" rx="2"/><rect x="52" y="22" width="6" height="84" rx="2"/>'
    '<rect x="37" y="34" width="24" height="5" rx="1.5"/><rect x="37" y="62" width="24" height="5" rx="1.5"/><rect x="37" y="90" width="24" height="5" rx="1.5"/>'
    '<path d="M46 14 V24 M44 14 C30 12 26 26 28 32 C34 28 40 26 46 26 Z" stroke-width="1.5"/>'
    '</g>'
)
gr_ibex = (
    f'<g fill="{SCHW}" transform="translate(28 66)">'
    '<ellipse cx="22" cy="20" rx="16" ry="9" transform="rotate(-30 22 20)"/>'
    '<circle cx="10" cy="8" r="6"/>'
    '<path d="M10 3 C14 -10 28 -12 34 -4 C28 -8 18 -6 13 5 Z"/>'
    '<path d="M24 26 L18 42 L23 42 L28 28 Z"/><path d="M34 22 L40 40 L45 38 L38 20 Z"/>'
    '<path d="M14 18 L2 22 L3 27 L16 24 Z"/><path d="M16 12 L4 6 L2 11 L14 16 Z"/>'
    '</g>'
)
W['gr'] = (
    f'<rect width="100" height="122" fill="{WEISS}"/>'
    f'<rect x="0" y="0" width="25" height="58" fill="{SCHW}"/>'
    f'<rect x="50" y="0" width="25" height="29" fill="{HBLAU}"/><rect x="75" y="0" width="25" height="29" fill="{GELB}"/>'
    f'<rect x="50" y="29" width="25" height="29" fill="{GELB}"/><rect x="75" y="29" width="25" height="29" fill="{HBLAU}"/>'
    f'<rect x="71" y="0" width="8" height="29" fill="{GELB}"/><rect x="50" y="25" width="25" height="8" fill="{GELB}"/>'
    f'<rect x="71" y="29" width="8" height="29" fill="{HBLAU}"/><rect x="75" y="25" width="25" height="8" fill="{HBLAU}"/>'
    f'<line x1="0" y1="58" x2="100" y2="58" stroke="{K}" stroke-width="2"/><line x1="50" y1="0" x2="50" y2="58" stroke="{K}" stroke-width="2"/>'
    + gr_ibex
)
welle = 'M0 {y} q6.25 -6 12.5 0 t12.5 0 t12.5 0 t12.5 0'
W['ag'] = (
    f'<rect width="50" height="122" fill="{SCHW}"/><rect x="50" width="50" height="122" fill="{HBLAU}"/>'
    f'<path d="{welle.format(y=56)}" fill="none" stroke="{WEISS}" stroke-width="6"/>'
    f'<path d="{welle.format(y=70)}" fill="none" stroke="{WEISS}" stroke-width="6"/>'
    + stern(66, 34, 9, WEISS) + stern(84, 34, 9, WEISS) + stern(75, 62, 9, WEISS)
)
loewe = (
    f'<g fill="{GELB}" stroke="{K}" stroke-width="0.8">'
    '<ellipse cx="22" cy="14" rx="15" ry="7"/>'
    '<circle cx="7" cy="8" r="7"/>'
    '<path d="M2 3 C6 -2 14 0 14 6" fill="#E0A800"/>'
    '<rect x="9" y="17" width="4" height="10" rx="1"/><rect x="15" y="18" width="4" height="9" rx="1"/>'
    '<rect x="27" y="18" width="4" height="9" rx="1"/><rect x="33" y="17" width="4" height="10" rx="1"/>'
    '<path d="M36 12 C44 8 46 0 42 -4 C44 4 40 8 35 9 Z"/>'
    '</g>'
    f'<path d="M0 10 l-3 2 l3 1 Z" fill="{ROT}"/>'
)
W['tg'] = (
    feld(WEISS) + f'<polygon points="0,0 100,122 0,122" fill="{GRUEN}"/>'
    f'<g transform="translate(48 18) scale(0.95)">{loewe}</g>'
    f'<g transform="translate(14 72) scale(0.95)">{loewe}</g>'
)
W['ti'] = f'<rect width="50" height="122" fill="{ROT}"/><rect x="50" width="50" height="122" fill="{HBLAU}"/>'
W['vd'] = (
    f'<rect width="100" height="58" fill="{WEISS}"/><rect y="58" width="100" height="64" fill="{GRUEN}"/>'
    f'<text x="50" y="28" text-anchor="middle" font-size="12.5" font-family="Georgia, serif" font-weight="700" fill="#C9A100">LIBERTÉ</text>'
    f'<text x="50" y="46" text-anchor="middle" font-size="12.5" font-family="Georgia, serif" font-weight="700" fill="#C9A100">ET PATRIE</text>'
)
vs_sterne = ''
for i, (x, y) in enumerate([(22, 20), (22, 38), (22, 56), (22, 74), (34, 30), (34, 48), (34, 66),
                            (66, 30), (66, 48), (66, 66), (78, 20), (78, 38), (78, 56)]):
    vs_sterne += stern(x, y, 6, ROT if x < 50 else WEISS)
W['vs'] = f'<rect width="50" height="122" fill="{WEISS}"/><rect x="50" width="50" height="122" fill="{ROT}"/>' + vs_sterne
W['ne'] = (
    f'<rect width="34" height="122" fill="{GRUEN}"/><rect x="34" width="33" height="122" fill="{WEISS}"/><rect x="67" width="33" height="122" fill="{ROT}"/>'
    + kreuz(83, 24, 18)
)
adler = (
    f'<g fill="{SCHW}">'
    '<path d="M50 30 C44 26 40 30 40 36 L50 40 Z"/>'
    '<path d="M50 40 L40 38 C30 34 18 40 10 50 C20 48 28 48 34 52 C24 54 16 60 12 70 C22 64 30 62 38 64 C32 70 28 78 28 88 C36 80 44 76 50 76 Z"/>'
    '<path d="M50 76 L44 92 L50 90 Z"/>'
    '</g>'
    f'<path d="M40 30 l-6 2 l4 3 Z" fill="{GELB}"/>'
    f'<path d="M41 24 l3 -6 l3 4 l3 -6 v10 h-9 Z" fill="{GELB}" stroke="{K}" stroke-width="0.6"/>'
    f'<circle cx="45" cy="33" r="1.2" fill="{WEISS}"/>'
)
W['ge'] = (
    f'<rect width="50" height="122" fill="{GELB}"/><rect x="50" width="50" height="122" fill="{ROT}"/>'
    + adler + schluessel_mit_loch(72, GELB, ROT, links=False)
)
W['ju'] = (
    f'<rect width="50" height="122" fill="{WEISS}"/><rect x="50" width="50" height="122" fill="{ROT}"/>'
    + ''.join(f'<rect x="50" y="{y}" width="50" height="10" fill="{WEISS}"/>' for y in (22, 46, 70))
    + f'<g transform="translate(-26 10) scale(0.88)">{baselstab(ROT, nach_links=False)}</g>'
)

os.makedirs(ZIEL, exist_ok=True)
for kz, inhalt in W.items():
    with open(os.path.join(ZIEL, f'{kz}.svg'), 'w') as f:
        f.write(svg(inhalt))
print(len(W))
