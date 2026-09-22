/** One playhead drives the physical assembly, its captions and the page handoff. */
export const ASSEMBLY_STORY = [
  { id: "foundation", label: "The foundation", start: .18, end: .365, title: ["A few good questions.", "A clearer picture."], copy: "Who is it for? What should it do? We sketch out the possibilities together, then give the idea a foundation to build on.", detail: "DISCOVERY / SYSTEM ARCHITECTURE" },
  { id: "connections", label: "The connections", start: .365, end: .555, title: ["Separate parts.", "One working system."], copy: "Your website, tools and workflows should work together. We build the connections that keep information moving and remove the manual handoffs.", detail: "DEVELOPMENT / INTEGRATION" },
  { id: "experience", label: "The experience", start: .555, end: .75, title: ["Complex underneath.", "Simple to use."], copy: "Every interaction has a purpose. We bring design and engineering together, then refine the details until the whole experience feels right.", detail: "INTERFACE DESIGN / TESTING" },
  { id: "reveal", label: "The idea takes shape", start: .75, end: .835, title: ["From a first sketch.", "To something useful."], copy: "The pieces come together. Your idea is ready to become part of someone's day. Keep scrolling to step inside.", detail: "BUILT / CONNECTED / READY" },
] as const;

export const SCREEN_HANDOFF = .97;
/** The remaining scroll distance introduces the software chapter after the screen fills. */
export const ASSEMBLY_PORTION = .54;

export function phase(progress: number, start: number, end: number) {
  const t = Math.max(0, Math.min(1, (progress - start) / (end - start)));
  return t * t * (3 - 2 * t);
}

export function storyOpacity(progress: number, start: number, end: number) {
  return phase(progress, start, start + .025) * (1 - phase(progress, end - .025, end));
}

/** Move the intact keyboard clear of the lid before lifting and seating its rows. */
export function keyboardAssembly(progress: number, unfolded: number) {
  const align = phase(progress, .525, .565);
  const liftKeys = phase(progress, .565, .59);
  const seatKeys = phase(progress, .60, .665);
  const seat = phase(progress, .68, .735);
  return {
    x: -.5 * unfolded * (1 - align),
    y: unfolded * (2.25 * (1 - align) + .92 * align) * (1 - seat),
    z: -1.45 * unfolded * (1 - align),
    rotation: -.04 * unfolded * (1 - align),
    // The raised rows would intersect the lid in the earlier exploded poses.
    keys: 1 - unfolded * liftKeys * (1 - seatKeys),
  };
}

export function keyboardKeyPose(progress: number, row: number, column: number) {
  const delay = row * .085 + column * .006;
  const local = Math.max(0, Math.min(1, (progress - delay) / .42));
  const align = phase(local, 0, .56);
  return {
    spread: 1 - align,
    lift: (1 - phase(local, 0, .72)) * (.90 + row * .075) + .09 * (1 - phase(local, .70, 1)),
    tilt: -.10 * (1 - align),
  };
}
