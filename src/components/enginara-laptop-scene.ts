import * as THREE from "three";
import { createLaptopHardware } from "./laptop-hardware";
import { createScreenArt } from "./laptop-screen-art";
import { screenProjection } from "./screen-projection";
import { phase as storyPhase, storyOpacity, SCREEN_HANDOFF, keyboardAssembly } from "./assembly-story";
import { pencilMaterial, pencilEdges } from "./pencil-rendering";
import { createLaptopInspection } from "./laptop-inspection";
import type { AssemblyPartId } from "./assembly-parts";
import { frameCamera } from "./inspection-camera";

export type LaptopScene = { update: (progress: number, reduced: boolean, ink?: number) => void; inspect: (id: AssemblyPartId | null, amount: number, angle?: number) => void; hitInspection: (x: number, y: number) => boolean; dispose: () => void };

type AssemblyOptions = { surface: HTMLElement; annotations?: HTMLElement | null; onSelect?: (id: AssemblyPartId) => void; onHover?: (id: AssemblyPartId | null) => void; onAvailable?: (ids: AssemblyPartId[]) => void };

export function createLaptopScene(host: HTMLElement, assembly?: AssemblyOptions): LaptopScene {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, host.clientWidth < 950 ? 1.35 : 1.7));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 180);
  camera.position.set(0, 2.4, 16);
  camera.lookAt(0, 0.8, 0);
  const hardware = createLaptopHardware(Boolean(assembly));
  const { laptop, chassis, keyboard, trackpad, underside, lid, motherboard, fans } = hardware;
  scene.add(laptop);
  const annotationElements = Array.from(assembly?.annotations?.querySelectorAll<HTMLElement>("[data-part]") ?? []);
  const annotationPoint = new THREE.Vector3();
  const portraitBounds = new THREE.Box3();
  const portraitPartBounds = new THREE.Box3();
  const portraitCenter = new THREE.Vector3();
  const portraitOrientation = new THREE.Quaternion();
  const portraitCorners = Array.from({ length: 8 }, () => new THREE.Vector3());
  const engineeringLines = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: .78, depthTest: true });
  const diagramSurface = pencilMaterial(0xded9d1, 20, .15);
  const paperColors: Record<string, number> = { shell: 0xe8e2d7, edge: 0xc5bcae, graphite: 0x7b827f, keys: 0xc9c5ba, sage: 0xb0beb3, copper: 0xbc7148, orange: 0xd57940, blue: 0xa4b9bc };
  const paperMaterials = new Map<string, THREE.MeshBasicMaterial>();
  for (const [role, color] of Object.entries(paperColors)) paperMaterials.set(role, pencilMaterial(color));
  // White is the multiplier for the individual colored keycaps, never a visible fill.
  const keySurface = pencilMaterial(0xffffff, 7, .13);
  const instanceOutlines: { mesh: THREE.InstancedMesh; lines: THREE.LineSegments[] }[] = [];
  const technicalOutlines: THREE.LineSegments[] = [];
  const originalSurfaces: { mesh: THREE.Mesh; material: THREE.Material | THREE.Material[]; decal: boolean }[] = [];
  {
    // Opaque pencil washes preserve hidden-line geometry while giving each system a role.
    laptop.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      originalSurfaces.push({ mesh: object, material: object.material, decal: object.geometry.type === "PlaneGeometry" });
    });
    originalSurfaces.forEach(({ mesh, material, decal }) => {
      if (mesh.userData.keepInDiagram) return;
      const originalMaterial = Array.isArray(material) ? material[0] : material;
      mesh.material = mesh.userData.individualKeyColors ? keySurface : paperMaterials.get(originalMaterial.userData.paperRole) ?? diagramSurface;
      if (decal) { mesh.visible = false; return; }
      if (mesh instanceof THREE.InstancedMesh) {
        const edgeGeometry = pencilEdges(mesh.geometry);
        const lines = Array.from({ length: mesh.count }, (_, index) => {
          const line = new THREE.LineSegments(edgeGeometry, engineeringLines);
          line.matrixAutoUpdate = false; mesh.getMatrixAt(index, line.matrix); mesh.add(line);
          technicalOutlines.push(line); return line;
        });
        instanceOutlines.push({ mesh, lines });
        return;
      }
      mesh.geometry.computeBoundingBox();
      const size = mesh.geometry.boundingBox!.getSize(new THREE.Vector3());
      if (Math.max(size.x, size.y, size.z) > .25) {
        const line = new THREE.LineSegments(pencilEdges(mesh.geometry), engineeringLines);
        mesh.add(line); technicalOutlines.push(line);
      }
    });
  }
  // Keep the maker's mark as geometry, so it belongs to the drawing too.
  const markPoints: number[] = [];
  [[-.25, 2.30, .37], [-.25, 2.12, .45], [-.25, 1.94, .27]].forEach(([x, y, width]) => {
    const z = -.104, height = .06;
    markPoints.push(x, y, z, x + width, y, z, x + width, y, z, x + width, y + height, z,
      x + width, y + height, z, x, y + height, z, x, y + height, z, x, y, z);
  });
  const markGeometry = new THREE.BufferGeometry();
  markGeometry.setAttribute("position", new THREE.Float32BufferAttribute(markPoints, 3));
  const markColor = new THREE.Color(0x6b6357);
  markGeometry.setAttribute("color", new THREE.Float32BufferAttribute(Array.from({ length: markPoints.length / 3 }, () => markColor.toArray()).flat(), 3));
  const drawnMark = new THREE.LineSegments(markGeometry, engineeringLines); lid.add(drawnMark); technicalOutlines.push(drawnMark);
  const markDot = new THREE.Mesh(new THREE.PlaneGeometry(.075, .06), paperMaterials.get("orange"));
  markDot.position.set(.24, 2.33, -.105); markDot.rotation.y = Math.PI; lid.add(markDot);
  const strokeGeometries = new Set(technicalOutlines.map(line => line.geometry));
  let previousInk = -1;
  const textures = (assembly ? [] : [0, 1, 2, 3]).map(index => {
    const texture = new THREE.CanvasTexture(createScreenArt(index));
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return texture;
  });
  const screenMaterial = new THREE.MeshBasicMaterial({ map: textures[0] ?? null, toneMapped: false });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(6.17, 3.856), screenMaterial);
  screen.position.set(0, 2.1, 0.104); lid.add(screen);
  const nextScreenMaterial = new THREE.MeshBasicMaterial({ map: textures[1] ?? null, toneMapped: false, transparent: true, opacity: 0, depthWrite: false });
  const nextScreen = new THREE.Mesh(screen.geometry, nextScreenMaterial);
  nextScreen.position.set(0, 2.1, 0.105); nextScreen.renderOrder = 1; lid.add(nextScreen);
  const frontCenter = new THREE.Vector3();
  const focus = new THREE.Vector3();
  const corners = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()] as const;
  const paperScreen = new THREE.Color(0xded9d1);
  const poweredScreen = new THREE.Color(0x181711);
  const inspection = assembly ? createLaptopInspection(renderer, scene, camera, laptop) : null;
  let inspectedPart: AssemblyPartId | null = null;
  let inspectionAmount = 0;
  let inspectionAngle = 0;
  let interactive = false;
  let availableKey = "";
  let hoveredPart: AssemblyPartId | null = null;
  const setHover = (id: AssemblyPartId | null) => {
    if (hoveredPart === id) return;
    hoveredPart = id;
    renderer.domElement.style.cursor = id ? "zoom-in" : "default";
    assembly?.onHover?.(id);
  };
  const pointerMove = (event: PointerEvent) => { if (interactive) setHover(inspection?.pick(event.clientX, event.clientY) ?? null); };
  const pointerLeave = () => setHover(null);
  const click = (event: MouseEvent) => {
    if (!interactive) return;
    const id = inspection?.pick(event.clientX, event.clientY);
    if (id) assembly?.onSelect?.(id);
  };
  renderer.domElement.addEventListener("pointermove", pointerMove);
  renderer.domElement.addEventListener("pointerleave", pointerLeave);
  renderer.domElement.addEventListener("click", click);
  const cameraShots = [
    { at: 0, camera: [1, 10, 20], target: [0, .8, 0], x: 4.2, y: 1.3, ry: -.42, rz: -.08, scale: 1.16 },
    { at: .06, camera: [1, 10, 20], target: [0, .8, 0], x: 4.2, y: 1.3, ry: -.42, rz: -.08, scale: 1.16 },
    { at: .18, camera: [1, 10, 20], target: [0, 1.3, 0], x: .65, y: -.7, ry: -.55, rz: -.20, scale: 1.22 },
    { at: .23, camera: [1, 10, 20], target: [0, 1.3, 0], x: .65, y: -.7, ry: -.55, rz: -.20, scale: 1.22 },
    { at: .35, camera: [-1, 9.5, 19], target: [0, 1.1, 0], x: .45, y: -.7, ry: -.7, rz: -.12, scale: 1.22 },
    { at: .43, camera: [-2, 10.5, 17], target: [0, 1, 0], x: -1.95, y: -.5, ry: .48, rz: .13, scale: 1.24 },
    { at: .54, camera: [-.5, 10.5, 16.5], target: [0, 1, 0], x: -2.0, y: -.5, ry: .72, rz: .18, scale: 1.24 },
    { at: .575, camera: [2, 9, 16], target: [0, 1, 0], x: 1.7, y: -.7, ry: -.42, rz: -.09, scale: 1.26 },
    { at: .65, camera: [3, 8, 15], target: [0, .8, 0], x: 1.6, y: -.7, ry: -.48, rz: -.13, scale: 1.32 },
    { at: .735, camera: [1, 5.5, 15], target: [0, .5, 0], x: 1.2, y: -.7, ry: -.25, rz: -.07, scale: 1.30 },
    { at: .80, camera: [0, 3.5, 17], target: [0, .1, 0], x: 0, y: -1.8, ry: -.15, rz: 0, scale: 1.25 },
    { at: .885, camera: [0, 1.2, 15], target: [0, .8, 0], x: 0, y: -1.4, ry: 0, rz: 0, scale: 1 },
  ];

  function updateAssembly(progress: number) {
    if (!assembly) return;
    const p = THREE.MathUtils.clamp(progress, 0, 1);
    const phase = (start: number, end: number) => storyPhase(p, start, end);
    const opening = phase(.755, .855);
    const zoom = phase(.885, SCREEN_HANDOFF);
    const power = phase(.815, .86);
    const unfold = phase(.06, .185);
    const layer = (start: number, end: number) => unfold * (1 - phase(start, end));
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height) return;

    chassis.position.y = -.38 * layer(.27, .35);
    underside.position.y = -.136 - .9 * layer(.30, .36);
    motherboard.position.y = .65 * layer(.52, .61);
    motherboard.visible = p > .08 && p < .67;
    const keyboardPose = keyboardAssembly(p, unfold);
    keyboard.position.set(keyboardPose.x, keyboardPose.y, keyboardPose.z);
    keyboard.rotation.y = keyboardPose.rotation;
    hardware.assembleKeys(keyboardPose.keys);
    // Bring the trackpad around the front of the drawing, below the reading area.
    const trackpadApproach = phase(.55, .62);
    trackpad.position.set(-2.0 * layer(.64, .72), (1.7 - 1.05 * trackpadApproach) * layer(.64, .72), (1.25 + .75 * trackpadApproach) * layer(.64, .72));
    lid.position.set(.75 * layer(.675, .745), .29 + 3.5 * layer(.675, .745), -.38 - 3.0 * layer(.675, .745));
    lid.rotation.x = THREE.MathUtils.lerp(Math.PI / 2, 0, opening);
    const shotIndex = Math.max(0, cameraShots.findIndex((_, index) => p < (cameraShots[index + 1]?.at ?? Infinity)));
    const shot = cameraShots[shotIndex];
    const next = cameraShots[Math.min(shotIndex + 1, cameraShots.length - 1)];
    const travel = shot === next ? 0 : phase(shot.at, next.at);
    const mix = (a: number, b: number) => THREE.MathUtils.lerp(a, b, travel);
    laptop.position.set(mix(shot.x, next.x), mix(shot.y, next.y), 0);
    laptop.rotation.set(0, mix(shot.ry, next.ry), mix(shot.rz, next.rz));
    laptop.scale.setScalar(mix(shot.scale, next.scale));
    if (width < 950) {
      laptop.position.x = 0;
      laptop.rotation.z *= .55;
      laptop.scale.setScalar(1);
    }
    hardware.mechanics.forEach(part => {
      const docked = phase(part.start, part.end);
      part.node.position.copy(part.home).addScaledVector(part.offset, unfold * (1 - docked));
      if (part.turns) part.node.rotation.y = unfold * (1 - docked) * Math.PI * 2 * part.turns;
    });
    instanceOutlines.forEach(({ mesh, lines }) => lines.forEach((line, index) => mesh.getMatrixAt(index, line.matrix)));
    screenMaterial.map = null;
    screenMaterial.color.copy(paperScreen);
    if (width < 950) screenMaterial.color.lerp(poweredScreen, power);
    nextScreen.visible = false;
    scene.updateMatrixWorld(true);
    frontCenter.set(0, 2.1, 0.108).applyMatrix4(lid.matrixWorld);
    camera.position.set(...shot.camera.map((value, index) => mix(value, next.camera[index])) as [number, number, number]);
    focus.set(...shot.target.map((value, index) => mix(value, next.target[index])) as [number, number, number]);
    if (width < 950) {
      // Fit the real assembly below the copy; width alone cannot frame an exploded object.
      portraitBounds.makeEmpty();
      [chassis, underside, motherboard, keyboard, trackpad, lid].forEach(part => {
        if (part.visible) portraitBounds.union(portraitPartBounds.setFromObject(part));
      });
      portraitBounds.getCenter(portraitCenter);
      let cornerIndex = 0;
      for (const x of [portraitBounds.min.x, portraitBounds.max.x]) for (const y of [portraitBounds.min.y, portraitBounds.max.y]) for (const z of [portraitBounds.min.z, portraitBounds.max.z]) portraitCorners[cornerIndex++].set(x, y, z);
      camera.lookAt(focus); camera.updateMatrixWorld(true); portraitOrientation.copy(camera.quaternion);
      const portraitView = frameCamera(portraitCorners, portraitCenter, portraitOrientation, camera.aspect, camera.fov, { left: -.94, right: .94, top: width >= 600 ? .35 : height < 710 ? .16 : .2, bottom: width >= 600 ? -.62 : height < 710 ? -.42 : -.52 });
      camera.position.copy(portraitView.position); focus.copy(portraitView.target);
    }
    focus.lerp(frontCenter, phase(.84, .885));
    // The HTML surface retains the viewport aspect ratio within the physical screen.
    // At the end, this camera distance makes its projected bounds exactly the viewport.
    const surfaceWidth = Math.min(6.15, 3.83 * camera.aspect);
    const surfaceHeight = surfaceWidth / camera.aspect;
    const distance = surfaceHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    camera.position.lerp(new THREE.Vector3(frontCenter.x, frontCenter.y, frontCenter.z + distance), zoom);
    focus.lerp(frontCenter, zoom);
    camera.lookAt(focus); camera.updateMatrixWorld(true);
    fans.forEach((fan, index) => { fan.rotation.y = p * (index ? -4 : 4); });
    inspection?.render(inspectedPart, inspectionAmount, focus, inspectionAngle);
    const canExplore = p >= .195 && p < .81;
    interactive = canExplore && inspectionAmount < .01;
    host.style.pointerEvents = interactive ? "auto" : "none";
    if (!interactive) setHover(null);
    const available = canExplore ? inspection?.available() ?? [] : [];
    const nextAvailableKey = available.join("|");
    if (nextAvailableKey !== availableKey) { availableKey = nextAvailableKey; assembly.onAvailable?.(available); }

    const surface = assembly.surface;
    const entered = p >= SCREEN_HANDOFF;
    surface.inert = !entered;
    surface.setAttribute("aria-hidden", String(!entered));
    surface.style.opacity = String(power);
    surface.style.visibility = power > 0 ? "visible" : "hidden";
    surface.style.pointerEvents = entered ? "auto" : "none";
    surface.style.willChange = power > 0 && !entered ? "transform, opacity" : "auto";
    if (entered) {
      surface.style.transform = "none";
      renderer.domElement.style.opacity = "0";
    } else {
      renderer.domElement.style.opacity = "1";
      const halfW = surfaceWidth / 2;
      const halfH = surfaceHeight / 2;
      corners[0].set(-halfW, 2.1 + halfH, 0.108);
      corners[1].set(halfW, 2.1 + halfH, 0.108);
      corners[2].set(halfW, 2.1 - halfH, 0.108);
      corners[3].set(-halfW, 2.1 - halfH, 0.108);
      const projected = corners.map(corner => {
        corner.applyMatrix4(lid.matrixWorld).project(camera);
        return { x: (corner.x + 1) * width / 2, y: (1 - corner.y) * height / 2 };
      }) as [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }, { x: number; y: number }];
      const transform = screenProjection(projected, width, height);
      if (transform) surface.style.transform = transform;
    }

    // Labels follow real component coordinates as the camera moves.
    const annotationRanges: Record<string, [number, number, number, number, number]> = {
      sketch: [0, .11, 1.6, 2.3, -.104],
      structure: [.21, .365, 2.9, .10, 3.1], core: [.24, .51, 0, .13, .91],
      power: [.40, .555, 0, .12, 2.6], interface: [.575, .73, 2.7, .2, 1.1], display: [.78, .865, 3.0, 3.7, .1],
    };
    annotationElements.forEach(element => {
      const id = element.dataset.part!;
      const anchor = id === "sketch" ? lid : hardware.anchors[id];
      const range = annotationRanges[id];
      if (!anchor || !range) return;
      const alpha = id === "sketch" ? 1 - phase(.04, .11) : storyOpacity(p, range[0], range[1]);
      element.style.opacity = String(alpha);
      if (!alpha) return;
      annotationPoint.set(range[2], range[3], range[4]).applyMatrix4(anchor.matrixWorld).project(camera);
      const x = (annotationPoint.x + 1) * width / 2;
      const y = (1 - annotationPoint.y) * height / 2;
      const placement: Record<string, [number, number]> = { sketch: [.74, .25], structure: [.08, .75], core: [.80, .19], power: [.79, .69], interface: [.79, .76], display: [.80, .78] };
      if (id === "core" && p >= .37) placement.core = [.08, .59];
      const labelX = Math.min(width - 205, width * placement[id][0]);
      const labelY = height * placement[id][1];
      const copy = element.querySelector<HTMLElement>("[data-part-copy]");
      const line = element.querySelector("polyline");
      const dot = element.querySelector("circle");
      if (copy) copy.style.transform = `translate3d(${labelX}px,${labelY}px,0)`;
      const labelOnLeft = placement[id][0] < .5;
      const labelEdge = labelOnLeft ? labelX + 196 : labelX - 7;
      const elbow = labelOnLeft ? labelEdge + 22 : labelEdge - 15;
      line?.setAttribute("points", `${x},${y} ${elbow},${labelY + 11} ${labelEdge},${labelY + 11}`);
      dot?.setAttribute("cx", String(x)); dot?.setAttribute("cy", String(y));
    });
  }

  let lastProgress = 0;
  let lastInk = 1;
  let reducedMotion = false;
  const poses = [
    { x: 3.15, y: -0.92, ry: -0.36, rz: -0.045, rx: 0.10, scale: 0.93, lid: -0.12 },
    { x: -3.2, y: -0.98, ry: 0.23, rz: 0.025, rx: 0.03, scale: 1.0, lid: -0.10 },
    { x: 3.3, y: -0.98, ry: -0.20, rz: -0.015, rx: 0.05, scale: 1.0, lid: -0.07 },
    { x: -3.1, y: -0.98, ry: 0.15, rz: 0.015, rx: 0.015, scale: 1.0, lid: -0.08 },
  ];
  function update(progress: number, reduced: boolean, ink = 1) {
    lastProgress = progress; reducedMotion = reduced; lastInk = ink;
    const visibleInk = reduced ? 1 : Math.max(ink, Math.min(1, progress / .04));
    if (visibleInk !== previousInk) {
      strokeGeometries.forEach(geometry => geometry.setDrawRange(0, Math.floor(geometry.getAttribute("position").count * visibleInk / 2) * 2));
      previousInk = visibleInk;
    }
    if (assembly) { updateAssembly(reduced ? 1 : progress); return; }
    const p = THREE.MathUtils.clamp(progress, 0, 3);
    const index = Math.min(2, Math.floor(p));
    let blend = THREE.MathUtils.smoothstep(p - index, 0.12, 0.87);
    if (reduced) blend = p - index > 0.5 ? 1 : 0;
    const a = poses[index]; const b = poses[index + 1];
    const mix = (v: keyof typeof a) => THREE.MathUtils.lerp(a[v], b[v], blend);
    const narrow = host.clientWidth < 950;
    laptop.position.set(narrow ? 0 : mix("x") * Math.min(1, host.clientWidth / host.clientHeight / 1.75), mix("y"), 0);
    laptop.rotation.set(mix("rx"), mix("ry"), mix("rz"));
    laptop.scale.setScalar(mix("scale") * (narrow ? 0.77 : 1)); lid.rotation.x = mix("lid");
    screenMaterial.map = textures[index];
    nextScreenMaterial.map = textures[index + 1];
    nextScreenMaterial.opacity = reduced ? blend : THREE.MathUtils.smoothstep(p - index, 0.36, 0.64);
    renderer.render(scene, camera);
  }
  const resize = new ResizeObserver(() => {
    const { clientWidth: width, clientHeight: height } = host;
    if (!width || !height) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, width < 950 ? 1.35 : 1.7));
    renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix();
    update(lastProgress, reducedMotion, lastInk);
  });
  resize.observe(host);
  return {
    update,
    inspect(id, amount, angle = 0) {
      inspectedPart = id;
      inspectionAmount = THREE.MathUtils.clamp(amount, 0, 1);
      inspectionAngle = angle;
      update(lastProgress, reducedMotion, lastInk);
    },
    hitInspection: (x, y) => inspection?.hitDetail(x, y) ?? false,
    dispose() {
      resize.disconnect();
      inspection?.dispose();
      renderer.domElement.removeEventListener("pointermove", pointerMove);
      renderer.domElement.removeEventListener("pointerleave", pointerLeave);
      renderer.domElement.removeEventListener("click", click);
      host.style.removeProperty("pointer-events");
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      scene.traverse(object => {
        if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
          geometries.add(object.geometry);
          (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materials.add(material));
        }
      });
      originalSurfaces.forEach(({ material }) => (Array.isArray(material) ? material : [material]).forEach(item => materials.add(item)));
      paperMaterials.forEach(material => materials.add(material)); materials.add(keySurface);
      geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose()); diagramSurface.dispose(); engineeringLines.dispose();
      [...textures, ...hardware.textures].forEach(texture => texture.dispose()); renderer.dispose(); renderer.domElement.remove();
      if (assembly) {
        assembly.surface.removeAttribute("style");
        assembly.surface.removeAttribute("aria-hidden");
        assembly.surface.inert = false;
      }
    },
  };
}
