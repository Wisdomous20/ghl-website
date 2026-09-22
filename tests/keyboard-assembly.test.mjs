import test from "node:test";
import assert from "node:assert/strict";
import { keyboardAssembly, keyboardKeyPose } from "../src/components/assembly-story.ts";

test("keys stay on the tray until it has moved clear of the lid", () => {
  for (let tick = 60; tick <= 565; tick++) {
    const pose = keyboardAssembly(tick / 1000, 1);
    assert.equal(pose.keys, 1);
  }
  const raised = keyboardAssembly(.595, 1);
  assert.equal(raised.keys, 0);
  assert.equal(raised.y, .92);
  assert.ok(Math.abs(raised.x) === 0 && Math.abs(raised.z) === 0);
});

test("key rows retain vertical clearance from the lid throughout their reveal", () => {
  // The flat lid's underside sits at y=3.69 until its final descent.
  for (let tick = 185; tick <= 675; tick++) {
    const tray = keyboardAssembly(tick / 1000, 1);
    for (let row = 0; row < 6; row++) for (let column = 0; column < 15; column++) {
      const cap = keyboardKeyPose(tray.keys, row, column);
      const capTop = tray.y + .144 + cap.lift + .035;
      assert.ok(capTop < 2.5, `row ${row}, column ${column} at ${tick / 1000}`);
    }
  }
});

test("key rows are seated before the tray starts its final descent", () => {
  const aligned = keyboardAssembly(.675, 1);
  const descending = keyboardAssembly(.71, 1);
  assert.equal(aligned.keys, 1);
  assert.equal(descending.keys, 1);
  assert.ok(aligned.y > descending.y && descending.y > 0);
  for (let row = 0; row < 6; row++) {
    for (let column = 0; column < 15; column++) {
      const key = keyboardKeyPose(aligned.keys, row, column);
      assert.equal(key.lift, 0);
      assert.equal(key.spread, 0);
      assert.ok(Math.abs(key.tilt) === 0);
    }
  }
});

test("the final seating path stays aligned and descends without overshoot", () => {
  let previousY = Infinity;
  for (let tick = 675; tick <= 750; tick++) {
    const pose = keyboardAssembly(tick / 1000, 1);
    assert.ok(Math.abs(pose.x) === 0 && Math.abs(pose.z) === 0 && Math.abs(pose.rotation) === 0);
    assert.ok(pose.y <= previousY && pose.y >= 0);
    previousY = pose.y;
  }
  assert.equal(previousY, 0);
});

test("raised rows align first and settle progressively without passing through their sockets", () => {
  assert.ok(keyboardKeyPose(0, 5, 4).lift > keyboardKeyPose(0, 0, 4).lift);
  assert.ok(keyboardKeyPose(.5, 0, 4).lift < keyboardKeyPose(.5, 4, 4).lift);
  for (let row = 0; row < 6; row++) for (let column = 0; column < 15; column++) {
    let previous = Infinity;
    for (let tick = 0; tick <= 100; tick++) {
      const pose = keyboardKeyPose(tick / 100, row, column);
      assert.ok(pose.lift >= 0 && pose.lift <= previous);
      assert.ok(pose.spread >= 0 && pose.spread <= 1);
      if (pose.lift < .08) assert.equal(pose.spread, 0);
      previous = pose.lift;
    }
    assert.equal(previous, 0);
  }
});

test("closed and completed laptop states have no displaced keys or tray", () => {
  for (const pose of [keyboardAssembly(0, 0), keyboardAssembly(1, 1)]) {
    assert.ok(Math.abs(pose.x) === 0 && Math.abs(pose.y) === 0 && Math.abs(pose.z) === 0);
    assert.equal(pose.keys, 1);
  }
});
