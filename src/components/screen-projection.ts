type Point = { x: number; y: number };

/** Map a live, viewport-sized HTML surface to the four projected screen corners.
 * Keeping the same surface throughout the zoom avoids a screenshot-to-DOM jump.
 */
export function screenProjection([tl, tr, br, bl]: [Point, Point, Point, Point], width: number, height: number) {
  const dx1 = tr.x - br.x;
  const dx2 = bl.x - br.x;
  const dx3 = tl.x - tr.x + br.x - bl.x;
  const dy1 = tr.y - br.y;
  const dy2 = bl.y - br.y;
  const dy3 = tl.y - tr.y + br.y - bl.y;
  const determinant = dx1 * dy2 - dx2 * dy1;
  if (Math.abs(determinant) < 0.00001 || width <= 0 || height <= 0) return null;
  const g = (dx3 * dy2 - dx2 * dy3) / determinant;
  const h = (dx1 * dy3 - dx3 * dy1) / determinant;
  const a = tr.x - tl.x + g * tr.x;
  const b = bl.x - tl.x + h * bl.x;
  const d = tr.y - tl.y + g * tr.y;
  const e = bl.y - tl.y + h * bl.y;
  return `matrix3d(${[a / width, d / width, 0, g / width, b / height, e / height, 0, h / height, 0, 0, 1, 0, tl.x, tl.y, 0, 1].join(",")})`;
}
