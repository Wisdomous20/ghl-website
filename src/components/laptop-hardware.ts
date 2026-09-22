import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { keyboardKeyPose } from "./assembly-story";

export type MechanicalPart = { node: THREE.Group; home: THREE.Vector3; offset: THREE.Vector3; start: number; end: number; turns?: number };

/** Original Enginara hardware, kept independent of the scroll/camera choreography. */
export function createLaptopHardware(assembledInternals: boolean) {
  const textures: THREE.Texture[] = [];
  function texture(width: number, height: number, paint: (context: CanvasRenderingContext2D) => void) {
    const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
    paint(canvas.getContext("2d")!);
    const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4;
    textures.push(map); return map;
  }
  let seed = 41;
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const grain = texture(512, 512, c => {
    c.fillStyle = "#d6d6d6"; c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1200; i++) {
      const shade = 205 + Math.floor(random() * 15);
      c.fillStyle = `rgb(${shade},${shade},${shade})`;
      c.fillRect(random() * 512, random() * 512, 15 + random() * 160, .5);
    }
  });
  grain.colorSpace = THREE.NoColorSpace;
  const metal = new THREE.MeshStandardMaterial({ color: 0x50575f, metalness: 0.7, roughness: 0.57, roughnessMap: grain, envMapIntensity: 0.8 });
  const edge = new THREE.MeshStandardMaterial({ color: 0x69747d, metalness: 0.8, roughness: 0.38, envMapIntensity: 0.8 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x090b0e, metalness: 0.42, roughness: 0.42 });
  const keysMaterial = new THREE.MeshStandardMaterial({ color: 0x11151a, metalness: 0.04, roughness: 0.76 });
  const trackMaterial = new THREE.MeshStandardMaterial({ color: 0x424952, metalness: 0.24, roughness: 0.65 });
  const copper = new THREE.MeshStandardMaterial({ color: 0xc08550, metalness: 0.92, roughness: 0.28 });
  const amber = new THREE.MeshStandardMaterial({ color: 0xe7aa70, metalness: 0.35, roughness: 0.3, emissive: 0xc58a49, emissiveIntensity: 0.4 });
  // Material roles also drive the flat, colored-pencil presentation.
  for (const [material, role] of [[metal, "shell"], [edge, "edge"], [dark, "graphite"], [keysMaterial, "keys"], [trackMaterial, "sage"], [copper, "copper"], [amber, "orange"]] as const) material.userData.paperRole = role;
  const laptop = new THREE.Group();
  laptop.userData.inspectId = "chassis";
  const chassis = new THREE.Group();
  const keyboard = new THREE.Group();
  const trackpad = new THREE.Group();
  const motherboard = new THREE.Group();
  chassis.userData.inspectId = "chassis";
  keyboard.userData.inspectId = "keyboard";
  trackpad.userData.inspectId = "trackpad";
  motherboard.userData.inspectId = "board";
  const fans: THREE.Group[] = [];
  const mechanics: MechanicalPart[] = [];
  const anchors: Record<string, THREE.Object3D> = {};
  function movingPart(parent: THREE.Group, offset: [number, number, number], start: number, end: number, turns = 0) {
    const node = new THREE.Group(); parent.add(node);
    mechanics.push({ node, home: node.position.clone(), offset: new THREE.Vector3(...offset), start, end, turns });
    return node;
  }
  laptop.add(chassis, keyboard, trackpad);
  function box(parent: THREE.Group, w: number, h: number, d: number, x: number, y: number, z: number, material: THREE.Material, radius = 0.04) {
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, radius), material);
    mesh.position.set(x, y, z); parent.add(mesh); return mesh;
  }
  function decal(parent: THREE.Group, map: THREE.Texture, width: number, height: number, position: [number, number, number], rotation: [number, number, number]) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, toneMapped: false }));
    mesh.position.set(...position); mesh.rotation.set(...rotation); parent.add(mesh); return mesh;
  }

  // Flat anodized panels with a narrow chamfer, never a chrome tube around the edge.
  box(chassis, 6.7, 0.18, 4.35, 0, -0.018, 1.62, edge, 0.025);
  box(chassis, 6.67, 0.19, 4.32, 0, 0.003, 1.62, metal, 0.022);
  const underside = box(laptop, 6.59, 0.078, 4.23, 0, -0.136, 1.62, dark, 0.037);
  box(keyboard, 5.78, 0.028, 2.12, 0, 0.113, 1.10, dark, 0.065);

  // A real six-row keyboard: staggered alphanumerics, modifiers, arrows and spacebar.
  type Key = { label: string; units: number };
  const row = (labels: string[]) => labels.map(label => ({ label, units: 1 }));
  const rows: Key[][] = [
    [{ label: "esc", units: 1.4 }, ...row(["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"]), { label: "◉", units: 1.4 }],
    [...row(["~", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "−", "+"]), { label: "delete", units: 1.8 }],
    [{ label: "tab", units: 1.5 }, ...row(["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]"]), { label: "\\", units: 1.3 }],
    [{ label: "caps", units: 1.7 }, ...row(["A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'"]), { label: "return", units: 2.1 }],
    [{ label: "shift", units: 2.2 }, ...row(["Z", "X", "C", "V", "B", "N", "M", ",", ".", "/"]), { label: "shift", units: 2.6 }],
    [{ label: "fn", units: 1 }, { label: "ctrl", units: 1 }, { label: "alt", units: 1 }, { label: "⌘", units: 1.25 }, { label: "", units: 5.3 }, { label: "⌘", units: 1.25 }, { label: "alt", units: 1 }, ...row(["←", "↕", "→"])],
  ];
  const layout = rows.flatMap((keys, rowIndex) => {
    const total = keys.reduce((sum, key) => sum + key.units, 0);
    let cursor = -2.79;
    return keys.map((key, columnIndex) => {
      const width = key.units / total * 5.58;
      const result = { ...key, rowIndex, columnIndex, x: cursor + width / 2, z: .22 + rowIndex * .344, width: width - .035, depth: rowIndex ? .289 : .225 };
      cursor += width; return result;
    });
  });
  const keyGeometry = new RoundedBoxGeometry(1, 0.034, 1, 2, 0.009);
  const sockets = new THREE.InstancedMesh(new RoundedBoxGeometry(1, .012, 1, 2, .012), edge, layout.length);
  const keycaps = new THREE.InstancedMesh(keyGeometry, keysMaterial, layout.length);
  keycaps.userData.individualKeyColors = true;
  const dummy = new THREE.Object3D();
  layout.forEach((key, index) => {
    dummy.position.set(key.x, .131, key.z); dummy.scale.set(key.width + .021, 1, key.depth + .021); dummy.updateMatrix(); sockets.setMatrixAt(index, dummy.matrix);
    dummy.position.set(key.x, .144, key.z); dummy.scale.set(key.width, 1, key.depth); dummy.updateMatrix(); keycaps.setMatrixAt(index, dummy.matrix);
    keycaps.setColorAt(index, new THREE.Color(key.label === "esc" || key.label === "return" ? 0xd28a59 : key.label === "tab" ? 0x9eb5b8 : 0xe3ddd3));
  });
  keyboard.add(sockets, keycaps);
  const legends = texture(2048, 800, c => {
    c.textAlign = "center"; c.textBaseline = "middle";
    layout.forEach(key => {
      c.fillStyle = key.label === "◉" ? "#9c4f27" : "#49433b";
      c.font = `${key.label.length > 1 ? 21 : 30}px monospace`;
      c.fillText(key.label, (key.x / 5.78 + .5) * 2048, ((key.z - 1.1) / 2.12 + .5) * 800);
    });
  });
  const keyLegends = decal(keyboard, legends, 5.78, 2.12, [0, .163, 1.1], [-Math.PI / 2, 0, 0]);
  keyLegends.userData.keepInDiagram = true;
  const keyLegendMaterial = keyLegends.material as THREE.MeshBasicMaterial;
  let movingLegends: THREE.InstancedMesh | null = null;
  if (assembledInternals) {
    keyLegends.visible = false;
    const glyphGeometry = new THREE.PlaneGeometry(1, 1);
    const glyphRects = new Float32Array(layout.length * 4);
    layout.forEach((key, index) => {
      const u = key.x / 5.78 + .5;
      const v = .5 - (key.z - 1.1) / 2.12;
      glyphRects.set([u - key.width / 5.78 / 2, v - key.depth / 2.12 / 2, key.width / 5.78, key.depth / 2.12], index * 4);
    });
    glyphGeometry.setAttribute("keyUv", new THREE.InstancedBufferAttribute(glyphRects, 4));
    const glyphMaterial = new THREE.MeshBasicMaterial({ map: legends, transparent: true, depthWrite: false, toneMapped: false });
    glyphMaterial.onBeforeCompile = shader => {
      shader.vertexShader = `attribute vec4 keyUv;\n${shader.vertexShader}`;
      shader.vertexShader = shader.vertexShader.replace("#include <uv_vertex>", "#include <uv_vertex>\n#ifdef USE_MAP\nvMapUv = vMapUv * keyUv.zw + keyUv.xy;\n#endif");
    };
    movingLegends = new THREE.InstancedMesh(glyphGeometry, glyphMaterial, layout.length);
    movingLegends.userData.keepInDiagram = true;
    movingLegends.renderOrder = 2; keyboard.add(movingLegends);
  }
  const glyphTransform = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
  glyphTransform.setPosition(0, .019, 0);
  const glyphMatrix = new THREE.Matrix4();
  function assembleKeys(progress: number) {
    layout.forEach((key, index) => {
      const pose = keyboardKeyPose(progress, key.rowIndex, key.columnIndex);
      dummy.position.set(key.x * (1 + .065 * pose.spread), .144 + pose.lift, key.z + (key.rowIndex - 2.5) * .09 * pose.spread);
      dummy.rotation.set(pose.tilt, 0, 0); dummy.scale.set(key.width, 1, key.depth); dummy.updateMatrix(); keycaps.setMatrixAt(index, dummy.matrix);
      if (movingLegends) {
        glyphMatrix.multiplyMatrices(dummy.matrix, glyphTransform);
        movingLegends.setMatrixAt(index, glyphMatrix);
      }
    });
    keycaps.instanceMatrix.needsUpdate = true;
    keycaps.computeBoundingBox(); keycaps.computeBoundingSphere();
    if (movingLegends) {
      movingLegends.instanceMatrix.needsUpdate = true;
      movingLegends.computeBoundingBox(); movingLegends.computeBoundingSphere();
    }
    keyLegendMaterial.opacity = THREE.MathUtils.smoothstep(progress, .85, 1);
  }
  if (movingLegends) assembleKeys(0);
  box(trackpad, 2.62, .008, 1.12, 0, .104, 2.94, dark, .02);
  box(trackpad, 2.595, .006, 1.095, 0, .108, 2.94, trackMaterial, .016);
  box(chassis, 1.08, .025, .095, 0, .087, 3.75, dark, .027);

  const deckLabel = texture(1024, 128, c => {
    c.fillStyle = "#a9b2b7"; c.font = "24px monospace"; c.fillText("E N G I N A R A", 0, 47);
    c.fillStyle = "#78838a"; c.font = "16px monospace"; c.fillText("IMAGINE / ENGINEER / EVOLVE", 0, 92);
  });
  decal(chassis, deckLabel, 1.02, .128, [2.36, .102, 3.12], [-Math.PI / 2, 0, 0]);
  [-1, 1].forEach(side => {
    for (let i = 0; i < 2; i++) {
      box(chassis, .018, .070, .24, side * 3.339, -.006, .5 + i * .43, dark, .016);
      box(chassis, .022, .015, .13, side * 3.34, -.007, .5 + i * .43, edge, .004);
    }
    box(chassis, .018, .075, .42, side * 3.34, -.012, 1.72, dark, .015);
    for (let i = 0; i < 38; i++) box(chassis, .22, .009, .008, side * 3.065, .101, .2 + i * .051, dark, .002);
    for (let i = 0; i < 14; i++) box(chassis, .08, .042, .023, side * 3.345, -.02, 2.5 + i * .055, dark, .006);
  });
  box(chassis, .24, .016, .010, 2.83, -.01, 3.797, amber, .004);
  for (const x of [-2.92, 2.92]) for (const z of [-.28, 3.5]) {
    const screw = new THREE.Mesh(new THREE.CylinderGeometry(.033, .033, .006, 12), edge);
    screw.position.set(x, .103, z); chassis.add(screw);
    box(chassis, .033, .004, .005, x, .107, z, dark, .001);
  }

  for (const x of [-2.15, 2.15]) {
    const hinge = new THREE.Mesh(new THREE.CylinderGeometry(.105, .105, 1.08, 24), metal);
    hinge.rotation.z = Math.PI / 2; hinge.position.set(x, .19, -.36); laptop.add(hinge);
  }
  const lid = new THREE.Group(); lid.position.set(0, .29, -.38); laptop.add(lid);
  lid.userData.inspectId = "display";
  box(lid, 6.7, 4.28, .15, 0, 2.09, 0, edge, .025);
  box(lid, 6.67, 4.25, .153, 0, 2.09, -.008, metal, .023);
  box(lid, 6.49, 4.08, .024, 0, 2.09, .085, dark, .015);
  box(lid, 6.58, 4.16, .012, 0, 2.09, -.09, metal, .018);
  const branding = texture(512, 512, c => {
    c.fillStyle = "#bdc4c7";
    [[93, 95, 255, 55], [93, 221, 287, 55], [93, 347, 185, 55]].forEach(([x, y, w, h]) => {
      c.beginPath(); c.roundRect(x, y, w, h, 8); c.fill();
    });
    c.fillStyle = "#dcb084"; c.beginPath(); c.roundRect(385, 95, 55, 55, 8); c.fill();
  });
  decal(lid, branding, .72, .72, [0, 2.12, -.099], [0, Math.PI, 0]);
  const engraved = texture(1024, 90, c => {
    c.fillStyle = "#899298"; c.font = "23px monospace"; c.textAlign = "center";
    c.fillText("E N G I N A R A   /   D E S I G N E D   W I T H   I N T E N T", 512, 52);
  });
  decal(lid, engraved, 2.6, .228, [0, .44, -.099], [0, Math.PI, 0]);
  const bezelBrand = texture(1024, 100, c => {
    c.fillStyle = "#879297"; c.font = "27px monospace"; c.textAlign = "center"; c.fillText("E N G I N A R A", 512, 58);
  });
  decal(lid, bezelBrand, .95, .093, [0, .092, .103], [0, 0, 0]);
  const cameraRing = new THREE.Mesh(new THREE.RingGeometry(.026, .042, 24), edge);
  cameraRing.position.set(0, 4.105, .103); lid.add(cameraRing);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(.024, 20), new THREE.MeshStandardMaterial({ color: 0x091019, metalness: .5, roughness: .10 }));
  lens.position.set(0, 4.105, .104); lid.add(lens);

  if (assembledInternals) {
    laptop.add(motherboard);
    const processor = movingPart(motherboard, [0, 1.45, 1.1], .355, .415);
    const cooling = movingPart(motherboard, [0, 1.1, -.8], .425, .49);
    processor.userData.inspectId = "processor";
    cooling.userData.inspectId = "cooling";
    anchors.core = processor;
    anchors.structure = chassis;
    anchors.interface = keyboard;
    anchors.display = lid;
    const pcbTexture = texture(1536, 900, c => {
      c.fillStyle = "#171e20"; c.fillRect(0, 0, 1536, 900);
      for (let i = 0; i < 150; i++) {
        const x = random() * 1536; const y = random() * 900;
        c.strokeStyle = i % 4 ? "#354844" : "#78623d"; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(x, y); c.lineTo(x + 20, y); c.lineTo(x + 48, y + 28); c.lineTo(x + 90 + random() * 100, y + 28); c.stroke();
        c.fillStyle = "#9d895e"; c.fillRect(x - 2, y - 2, 4, 4);
      }
      for (let i = 0; i < 110; i++) {
        const x = random() * 1480; const y = random() * 350;
        c.fillStyle = "#9d957f"; c.fillRect(x, y, 10, 5);
        c.fillStyle = "#253136"; c.fillRect(x + 2, y, 6, 5);
      }
      c.fillStyle = "#a6aa9e"; c.font = "13px monospace"; c.fillText("ENGINARA / SYSTEM BOARD  —  E.01", 600, 76);
    });
    const pcb = new THREE.MeshStandardMaterial({ color: 0x253534, metalness: .45, roughness: .52 });
    pcb.userData.paperRole = "blue";
    box(motherboard, 5.95, .025, 3.64, 0, .015, 1.62, pcb, .05);
    decal(motherboard, pcbTexture, 5.95, 3.64, [0, .029, 1.62], [-Math.PI / 2, 0, 0]);
    box(processor, 1.0, .065, 1.0, 0, .062, .91, dark, .025);
    box(processor, .78, .025, .78, 0, .11, .91, edge, .014);
    decal(processor, branding, .4, .4, [0, .123, .91], [-Math.PI / 2, 0, 0]);
    // Contact pins make the processor's final docking motion legible.
    for (let i = 0; i < 16; i++) for (const side of [-1, 1]) {
      box(processor, .025, .026, .055, -.43 + i * .057, .018, .91 + side * .53, copper, .003);
    }
    for (const side of [-1, 1]) {
      const fanCarrier = movingPart(motherboard, [side * .65, .85, -.4], .39, .455);
      fanCarrier.userData.inspectId = side < 0 ? "fan-left" : "fan-right";
      const fan = new THREE.Group(); fan.position.set(side * 2.03, .09, .76); fanCarrier.add(fan); fans.push(fan);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(.53, .045, 8, 48), metal);
      ring.rotation.x = -Math.PI / 2; fan.add(ring);
      const fanBed = new THREE.Mesh(new THREE.CylinderGeometry(.51, .51, .052, 48), dark); fan.add(fanBed);
      const bladeGeo = new THREE.BoxGeometry(.28, .017, .047);
      const blades = new THREE.InstancedMesh(bladeGeo, edge, 28);
      for (let i = 0; i < 28; i++) {
        const angle = i / 28 * Math.PI * 2;
        dummy.position.set(Math.cos(angle) * .31, .033, Math.sin(angle) * .31);
        dummy.rotation.set(0, -angle + .42, 0); dummy.scale.set(1, 1, 1); dummy.updateMatrix(); blades.setMatrixAt(i, dummy.matrix);
      }
      fan.add(blades);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(.14, .14, .075, 24), metal); fan.add(hub);
      for (let i = 0; i < 3; i++) {
        const path = new THREE.CatmullRomCurve3([
          new THREE.Vector3(side * .45, .103, .70 + i * .11), new THREE.Vector3(side * .95, .103, .3 + i * .10), new THREE.Vector3(side * 1.65, .103, .23 + i * .11), new THREE.Vector3(side * 2.27, .103, .28 + i * .1),
        ]);
        cooling.add(new THREE.Mesh(new THREE.TubeGeometry(path, 24, .027, 7, false), copper));
      }
      const memory = movingPart(motherboard, [side * .8, .9, .25], .405, .475);
      memory.userData.inspectId = side < 0 ? "memory-left" : "memory-right";
      box(memory, 1.2, .02, .52, side * 1.15, .045, 1.59, pcb, .008);
      for (let i = 0; i < 4; i++) box(memory, .20, .058, .36, side * (.75 + i * .25), .078, 1.59, dark, .006);
      for (let i = 0; i < 18; i++) box(memory, .029, .009, .07, side * 1.15 - .5 + i * .06, .06, 1.87, copper, .002);
    }
    for (let i = 0; i < 3; i++) {
      const battery = movingPart(motherboard, [(i - 1) * .65, .55, 1.1], .47 + i * .018, .535 + i * .018);
      battery.userData.inspectId = `battery-${i + 1}`;
      if (i === 1) anchors.power = battery;
      box(battery, 1.76, .09, 1.30, -1.83 + i * 1.83, .055, 2.58, keysMaterial, .022);
      const cellLabel = texture(512, 256, c => {
        c.fillStyle = "#8a9498"; c.font = "17px monospace"; c.fillText(`ENGINARA / CELL 0${i + 1}`, 30, 49);
        c.fillStyle = "#5b666b"; c.font = "13px monospace"; c.fillText("PRECISION POWER MODULE", 30, 83);
        for (let j = 0; j < 28; j++) c.fillRect(30 + j * 5, 178, 2, 30);
        c.fillText("Li-ion   +   −", 290, 204);
      });
      decal(battery, cellLabel, 1.61, .81, [-1.83 + i * 1.83, .102, 2.58], [-Math.PI / 2, 0, 0]);
      box(battery, .21, .016, .25, -1.83 + i * 1.83, .067, 1.89, copper, .003);
    }
    for (const x of [-2.82, 2.82]) for (const z of [.03, 1.78, 3.23]) {
      const fastener = movingPart(motherboard, [0, 1.2, 0], .535, .58, 3);
      fastener.userData.inspectId = "fasteners";
      fastener.position.set(x, .034, z);
      mechanics[mechanics.length - 1].home.copy(fastener.position);
      const screw = new THREE.Mesh(new THREE.CylinderGeometry(.042, .042, .07, 16), edge);
      fastener.add(screw);
      box(fastener, .046, .005, .008, 0, .038, 0, dark, .001);
    }
  }

  return { laptop, chassis, keyboard, trackpad, underside, lid, motherboard, fans, mechanics, anchors, assembleKeys, textures, amber };
}
