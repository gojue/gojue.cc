/** A point beyond the edge of a rectangle in the direction of another point. */
export function outsideRect(rect, toward, gap) {
  const center = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  const dx = toward.x - center.x;
  const dy = toward.y - center.y;
  const length = Math.hypot(dx, dy);
  if (!length) return center;
  const ux = dx / length;
  const uy = dy / length;
  const edge = Math.min(
    Math.abs(ux) > 1e-8 ? rect.width / 2 / Math.abs(ux) : Infinity,
    Math.abs(uy) > 1e-8 ? rect.height / 2 / Math.abs(uy) : Infinity,
  );
  return { x: center.x + ux * (edge + gap), y: center.y + uy * (edge + gap) };
}

/** Trim both ends, including breathing room for the satellite's floating motion. */
export function connectionGeometry(core, satellite, gap = 24) {
  const coreCenter = { x: core.x + core.width / 2, y: core.y + core.height / 2 };
  const satelliteCenter = { x: satellite.x + satellite.width / 2, y: satellite.y + satellite.height / 2 };
  const start = outsideRect(core, satelliteCenter, gap);
  const end = outsideRect(satellite, coreCenter, gap);
  // Mobile diagonals can be nearly vertical. Keep control points within the gap.
  const bend = (end.x - start.x) * .38;
  const c1 = { x: start.x + bend, y: start.y };
  const c2 = { x: end.x - bend, y: end.y };
  const point = (p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
  return {
    d: `M ${point(start)} C ${point(c1)}, ${point(c2)}, ${point(end)}`,
    start, end,
    label: {
      x: (start.x + 3 * c1.x + 3 * c2.x + end.x) / 8,
      y: (start.y + 3 * c1.y + 3 * c2.y + end.y) / 8,
    },
  };
}

/** Only the two original circles move, within a small ellipse in SVG coordinates. */
export function eyeOffset(point, center, reach = 240) {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  const distance = Math.hypot(dx, dy);
  const amount = Math.min(distance / reach, 1);
  if (!distance) return { x: 0, y: 0 };
  return { x: dx / distance * 40 * amount, y: dy / distance * 27 * amount };
}
