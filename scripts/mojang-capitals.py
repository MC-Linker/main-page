"""Build static/fonts/mojang-studios.woff2 from the bot repo's Mojangs font.

The font (MC-Linker resources/fonts/The_Mojangs_Font.ttf) only has capitals, and
draws B, D, M, N, Q, T and Y as the lowercase letters b, d, m, n, q, t and y.
This script redraws those seven as capitals, using the font's own measurements
(glyphs span x 50..838 and y -92..687, stems are ~212 units wide, bars ~200 tall,
outer corners slightly rounded, inner corners filleted), then subsets the font
to woff2 for the web.

    pip install fonttools brotli skia-pathops
    python scripts/mojang-capitals.py path/to/The_Mojangs_Font.ttf static/fonts/mojang-studios.woff2
"""
import math
import sys

import pathops
from fontTools import subset
from fontTools.pens.areaPen import AreaPen
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.reverseContourPen import ReverseContourPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont

X0, X1, Y0, Y1 = 50, 838, -92, 687     # the glyph box most letters use
SV, SH = 212, 200                       # stem width, bar height
CX = (X0 + X1) / 2
R_OUT, R_IN = 14, 30                    # outer corner radius, inner fillet radius


def poly(points, radii):
    """A closed polygon with each corner rounded by its own radius."""
    n = len(points)
    if isinstance(radii, (int, float)):
        radii = [radii] * n
    corners = []
    for i in range(n):
        p0, p, p1 = points[i - 1], points[i], points[(i + 1) % n]
        din = (p[0] - p0[0], p[1] - p0[1])
        lin = math.hypot(*din)
        din = (din[0] / lin, din[1] / lin)
        dout = (p1[0] - p[0], p1[1] - p[1])
        lout = math.hypot(*dout)
        dout = (dout[0] / lout, dout[1] / lout)
        turn = math.acos(max(-1, min(1, din[0] * dout[0] + din[1] * dout[1])))
        cut = radii[i] * math.tan(turn / 2) if turn > 1e-6 else 0
        corners.append([p, din, dout, turn, cut, lout])
    # Two corners on one edge share it: shrink both arcs if they don't fit.
    for i in range(n):
        j = (i + 1) % n
        length = corners[i][5]
        if corners[i][4] + corners[j][4] > length:
            k = length / (corners[i][4] + corners[j][4])
            corners[i][4] *= k
            corners[j][4] *= k
    segments = []
    for p, din, dout, turn, cut, _ in corners:
        if cut <= 0:
            segments.append((p,))
            continue
        r = cut / math.tan(turn / 2)
        handle = 4 / 3 * math.tan(turn / 4) * r
        a = (p[0] - din[0] * cut, p[1] - din[1] * cut)
        b = (p[0] + dout[0] * cut, p[1] + dout[1] * cut)
        segments.append((a, (a[0] + din[0] * handle, a[1] + din[1] * handle),
                         (b[0] - dout[0] * handle, b[1] - dout[1] * handle), b))
    path = pathops.Path()
    pen = path.getPen()
    pen.moveTo(segments[0][-1])
    for s in segments[1:] + segments[:1]:
        pen.lineTo(s[0])
        if len(s) == 4:
            pen.curveTo(*s[1:])
    pen.closePath()
    return path


def rrect(x0, y0, x1, y1, tl=R_OUT, tr=R_OUT, br=R_OUT, bl=R_OUT):
    return poly([(x0, y1), (x1, y1), (x1, y0), (x0, y0)], [tl, tr, br, bl])


def union(*paths):
    out = paths[0]
    for p in paths[1:]:
        out = pathops.op(out, p, pathops.PathOp.UNION)
    return out


def minus(path, *holes):
    for h in holes:
        path = pathops.op(path, h, pathops.PathOp.DIFFERENCE)
    return path


def T():
    l, r = CX - SV / 2, CX + SV / 2
    return poly([(X0, Y1), (X1, Y1), (X1, Y1 - SH), (r, Y1 - SH), (r, Y0), (l, Y0), (l, Y1 - SH), (X0, Y1 - SH)],
                [R_OUT, R_OUT, R_OUT, R_IN, R_OUT, R_OUT, R_IN, R_OUT])


def D():
    outer = rrect(X0, Y0, X1, Y1, tr=300, br=300)
    hole = rrect(X0 + SV, Y0 + SH, X1 - SV, Y1 - SH, tl=10, tr=110, br=110, bl=10)
    return minus(outer, hole)


def B():
    """Like the font's R: a big round top right, a bite at the waist, and P's round bottom right."""
    outer = poly([(X0, Y1), (800, Y1), (800, 342), (676, 342), (676, 262), (X1, 262), (X1, Y0), (X0, Y0)],
                 [R_OUT, 240, 40, 34, 34, 40, 270, R_OUT])
    upper = rrect(X0 + SV, 372, 600, Y1 - 190, tl=8, tr=48, br=48, bl=8)
    lower = rrect(X0 + SV, Y0 + SH, X1 - SV, 226, tl=8, tr=48, br=60, bl=8)
    return minus(outer, upper, lower)


def Y():
    """A cup on a stem, with the stepped corners of the font's V."""
    l, r = CX - SV / 2, CX + SV / 2
    cup = Y1 - SH - 190
    return poly([(X0, Y1), (X0 + SV, Y1), (X0 + SV, Y1 - SH), (X1 - SV, Y1 - SH), (X1 - SV, Y1), (X1, Y1),
                 (X1, cup), (r, cup), (r, Y0), (l, Y0), (l, cup), (X0, cup)],
                [R_OUT, R_OUT, R_IN + 10, R_IN + 10, R_OUT, R_OUT, 45, 60, R_OUT, R_OUT, 60, 45])


def M():
    """Two stems with a V hanging between them. As wide as the original M."""
    x1 = 938
    xl, xr, c = X0 + SV, x1 - SV, (X0 + x1) / 2
    shoulder, notch, joint, tip = 118, 470, 400, 170
    return poly([(X0, Y1), (xl + shoulder, Y1), (c, notch), (xr - shoulder, Y1), (x1, Y1), (x1, Y0), (xr, Y0),
                 (xr, joint), (c, tip), (xl, joint), (xl, Y0), (X0, Y0)],
                [R_OUT, 18, 22, 18, R_OUT, R_OUT, R_OUT, 26, 30, 26, R_OUT, R_OUT])


def N():
    """A diagonal from the top of the left stem to the foot of the right one."""
    stem, band, joint = 200, 190, 130
    xl, xr = X0 + stem, X1 - stem
    upper = poly([(xl + band, Y1 + 60), (xr, Y1 + 60), (xr, Y0 + joint)], [0, 0, 14])
    lower = poly([(xl, Y1 - joint), (xr - band, Y0 - 60), (xl, Y0 - 60)], [14, 0, 0])
    return minus(rrect(X0, Y0, X1, Y1), upper, lower)


def Q(glyphs):
    """The O, with a square tail at the bottom right."""
    o = pathops.Path()
    glyphs['O'].draw(o.getPen())
    return union(o, rrect(560, Y0, 870, 110, tl=0, bl=0))


def main(src, out):
    font = TTFont(src)
    glyphs = font.getGlyphSet()
    glyf, hmtx = font['glyf'], font['hmtx']

    def put(name, path, advance):
        path.simplify(fix_winding=True)
        rec = RecordingPen()
        path.draw(rec)
        area = AreaPen()
        rec.replay(area)
        tt = TTGlyphPen(None)
        # TrueType wants clockwise outer contours (negative area with y up).
        rec.replay(Cu2QuPen(ReverseContourPen(tt) if area.value > 0 else tt, max_err=0.8))
        glyph = tt.glyph()
        glyph.recalcBounds(glyf)
        glyf[name] = glyph
        hmtx[name] = (advance, glyph.xMin)

    put('B', B(), 888)
    put('D', D(), 888)
    put('M', M(), 988)
    put('N', N(), 888)
    put('Q', Q(glyphs), 905)
    put('T', T(), 888)
    put('Y', Y(), 888)

    options = subset.Options()
    options.flavor = 'woff2'
    options.notdef_outline = True
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=font.getBestCmap().keys())
    subsetter.subset(font)
    font.flavor = 'woff2'
    font.save(out)


if __name__ == '__main__':
    main(*sys.argv[1:3])
