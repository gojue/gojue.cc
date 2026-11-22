import test from 'node:test';
import assert from 'node:assert/strict';
import { connectionGeometry, eyeOffset } from '../scripts/geometry.js';

function distanceFromRect(point, rect) {
  return Math.hypot(Math.max(rect.x - point.x, 0, point.x - rect.x - rect.width), Math.max(rect.y - point.y, 0, point.y - rect.y - rect.height));
}

test('both line ends stay separated from every desktop logo, including a floated satellite', () => {
  const core = { x: 640, y: 360, width: 320, height: 320 };
  for (const x of [278, 1142]) {
    for (const y of [250, 600]) {
      const satellite = { x, y, width: 180, height: 180 };
      const { start, end, d } = connectionGeometry(core, satellite, 26);
      assert.ok(distanceFromRect(start, core) >= 15, 'core has breathing room');
      assert.ok(distanceFromRect(end, satellite) >= 15, 'satellite has breathing room');
      assert.ok(distanceFromRect(end, { ...satellite, y: y - 8 }) >= 10, 'floating does not close the gap');
      assert.ok(!d.includes('NaN'));
    }
  }
});

test('narrow touch layouts retain finite, separated connector endpoints', () => {
  const core = { x: 111, y: 340, width: 168, height: 168 };
  for (const satellite of [{ x: 33, y: 219, width: 98, height: 98 }, { x: 259, y: 219, width: 98, height: 98 }, { x: 33, y: 536, width: 98, height: 98 }, { x: 259, y: 536, width: 98, height: 98 }]) {
    const { start, end } = connectionGeometry(core, satellite, 12);
    assert.ok(distanceFromRect(start, core) > 7);
    assert.ok(distanceFromRect(end, satellite) > 7);
    assert.ok(Number.isFinite(start.x + start.y + end.x + end.y));
  }
});

test('eye travel is bounded and points toward the cursor in all directions', () => {
  const center = { x: 800, y: 440 };
  for (const point of [{ x: -1e5, y: -1e5 }, { x: 1e5, y: -1e5 }, { x: -1e5, y: 1e5 }, { x: 1e5, y: 1e5 }]) {
    const result = eyeOffset(point, center);
    assert.ok(Math.abs(result.x) <= 40 && Math.abs(result.y) <= 27);
    assert.equal(Math.sign(result.x), Math.sign(point.x - center.x));
    assert.equal(Math.sign(result.y), Math.sign(point.y - center.y));
  }
  assert.deepEqual(eyeOffset(center, center), { x: 0, y: 0 });
});
