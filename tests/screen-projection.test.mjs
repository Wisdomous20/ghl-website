import assert from "node:assert/strict";
import test from "node:test";
import { screenProjection } from "../src/components/screen-projection.ts";

function project(matrix, x, y) {
  const m = matrix.slice(9, -1).split(",").map(Number);
  const w = m[3] * x + m[7] * y + m[15];
  return { x: (m[0] * x + m[4] * y + m[12]) / w, y: (m[1] * x + m[5] * y + m[13]) / w };
}

test("a tilted laptop screen maps all four HTML corners to their projected positions", () => {
  const corners = [{ x: 480, y: 150 }, { x: 1130, y: 220 }, { x: 1080, y: 610 }, { x: 420, y: 520 }];
  const matrix = screenProjection(corners, 1600, 900);
  [[0, 0], [1600, 0], [1600, 900], [0, 900]].forEach(([x, y], index) => {
    const result = project(matrix, x, y);
    assert.ok(Math.abs(result.x - corners[index].x) < 0.00001);
    assert.ok(Math.abs(result.y - corners[index].y) < 0.00001);
  });
});

test("the full-screen handoff preserves pixel positions across desktop aspect ratios", () => {
  for (const [width, height] of [[1280, 720], [1646, 894], [1920, 1080], [2560, 1080]]) {
    const matrix = screenProjection([{ x: 0, y: 0 }, { x: width, y: 0 }, { x: width, y: height }, { x: 0, y: height }], width, height);
    assert.deepEqual(project(matrix, width * 0.31, height * 0.73), { x: width * 0.31, y: height * 0.73 });
  }
});

test("a closed, edge-on display never produces an invalid CSS transform", () => {
  assert.equal(screenProjection([{ x: 0, y: 10 }, { x: 100, y: 10 }, { x: 100, y: 10 }, { x: 0, y: 10 }], 1600, 900), null);
  assert.equal(screenProjection([{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }], 0, 0), null);
});
