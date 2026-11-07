#!/usr/bin/env python3
"""Builds the surah header ornament layers from assets/source/surah-header.png.

The source is the finished artwork for Al-Fatiha (name in the cartouche, ayah
count and order in the two circles, all on green). For every surah the app
draws the same ornament with its own name and numbers, in the app's colour:

  1. The baked-in text is removed: letters in the cartouche (dark shapes that
     touch no green, so the cartouche's own outline is kept) and the two
     circles (refilled with their flat green).
  2. The image is split into layers that are stacked in the app:
       mask.png         white where the ornament is green — tinted with the
                        app colour at run time (Image tintColor)
       shade-dark.png   black, alpha = how much darker than the reference
                        green each green pixel is (frame bands, shadows)
       shade-light.png  white, alpha = how much lighter (highlights, edges)
       fixed.png        everything that is not green (white, the yellow and
                        white flowers, leaves, outlines), transparent elsewhere
                        and in the white margin around the frame
     Stacked over a tint of the reference green, they give back the original
     (mean difference about 1/255); over any other colour they keep all the
     shading and detail.

    python3 scripts/surah-header-layers.py        # needs numpy, scipy, pillow

Writes assets/surah-header/*.png.
"""
import json
import os
from collections import deque

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SOURCE = os.path.join(ROOT, 'assets', 'source', 'surah-header.png')
OUT = os.path.join(ROOT, 'assets', 'surah-header')

# Geometry of the source artwork (1024 × 204).
CARTOUCHE_BOX = (300, 15, 731, 193)        # x0, y0, x1, y1 around the name
CARTOUCHE_CENTRE = (512, 105)
CIRCLES = {'ayat': (205, 100), 'order': (815, 100)}   # centres of the two circles
REFERENCE_GREEN = np.array([20, 102, 66]) / 255       # the circles' flat green


def channels(img):
    mx, mn = img.max(2), img.min(2)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    lum = 0.2126 * img[..., 0] + 0.7152 * img[..., 1] + 0.0722 * img[..., 2]
    return mx, mn, sat, lum


def hue_deg(img):
    r, g, b = img[..., 0], img[..., 1], img[..., 2]
    mx, mn = img.max(2), img.min(2)
    d = np.maximum(mx - mn, 1e-6)
    rc, gc, bc = (mx - r) / d, (mx - g) / d, (mx - b) / d
    h = np.where(mx == r, bc - gc, np.where(mx == g, 2 + rc - bc, 4 + gc - rc))
    return (h / 6) % 1 * 360


def flood(lum, seed, ok):
    h, w = lum.shape
    seen = np.zeros((h, w), bool)
    q = deque([seed])
    seen[seed[1], seed[0]] = True
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not seen[ny, nx] and ok(nx, ny):
                seen[ny, nx] = True
                q.append((nx, ny))
    return seen


def remove_text(img):
    h, w, _ = img.shape
    _, _, sat, lum = channels(img)
    clean = img.copy()

    # Cartouche: erase dark achromatic shapes that touch no green (the letters);
    # shapes touching green are the cartouche's outline and are kept.
    x0, y0, x1, y1 = CARTOUCHE_BOX
    box = np.zeros((h, w), bool)
    box[y0:y1, x0:x1] = True
    ink = box & (lum < 0.97) & (sat < 0.25)
    lab, n = ndi.label(ink, structure=np.ones((3, 3)))
    near_green = ndi.binary_dilation((sat > 0.35) & (lum < 0.8), iterations=2)
    for i in range(1, n + 1):
        comp = lab == i
        if not (comp & near_green).any():
            clean[comp] = 1.0
    # ...and wipe faint leftovers: near-white pixels connected to its inside.
    _, _, csat, clum = channels(clean)
    light, _ = ndi.label((clum > 0.88) & (csat < 0.15))
    clean[light == light[CARTOUCHE_CENTRE[1], CARTOUCHE_CENTRE[0]]] = 1.0

    # Circles: refill everything inside the white ring with the flat green.
    for cx, cy in CIRCLES.values():
        inside = flood(lum, (cx, cy), lambda x, y: lum[y, x] < 0.75 and abs(x - cx) < 90)
        clean[inside] = np.median(img[inside & (sat > 0.5) & (lum > 0.25) & (lum < 0.4)], axis=0)
    return clean


def split_layers(clean):
    h, w, _ = clean.shape
    _, _, sat, lum = channels(clean)
    green = (hue_deg(clean) >= 110) & (hue_deg(clean) <= 205) & (sat > 0.2) & (lum < 0.85)
    g = REFERENCE_GREEN
    l0 = 0.2126 * g[0] + 0.7152 * g[1] + 0.0722 * g[2]
    dark = np.where(green & (lum < l0), np.clip(1 - lum / l0, 0, 1), 0)
    light = np.where(green & (lum > l0), np.clip((lum - l0) / (1 - l0), 0, 1), 0)

    def rgba(rgb, alpha):
        arr = np.zeros((h, w, 4), np.uint8)
        arr[..., :3] = rgb
        arr[..., 3] = (alpha * 255).round().astype(np.uint8)
        return Image.fromarray(arr)

    # The white margin around the frame becomes transparent, so the ornament
    # sits on the app's own background (light or dark).
    lab, _ = ndi.label((lum > 0.9) & (sat < 0.15))
    margin = np.isin(lab, np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]])))
    margin &= lab > 0

    fixed = np.zeros((h, w, 4), np.uint8)
    fixed[..., :3] = (clean * 255).round().astype(np.uint8)
    fixed[..., 3] = np.where(green | margin, 0, 255)
    return {
        'mask': rgba(255, green.astype(float)),
        'shade-dark': rgba(0, dark),
        'shade-light': rgba(255, light),
        'fixed': Image.fromarray(fixed),
    }


def main():
    img = np.array(Image.open(SOURCE).convert('RGB')).astype(float) / 255
    clean = remove_text(img)
    os.makedirs(OUT, exist_ok=True)
    for name, layer in split_layers(clean).items():
        layer.save(os.path.join(OUT, f'{name}.png'), optimize=True)
    print(json.dumps({'size': [img.shape[1], img.shape[0]], 'written': sorted(os.listdir(OUT))}))


if __name__ == '__main__':
    main()
