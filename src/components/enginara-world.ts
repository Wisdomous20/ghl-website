import * as THREE from "three";

export type SceneMetric = {
  height: number;
  top: number;
  viewport: number;
};

export type EnginaraWorld = {
  destroy: () => void;
  resize: () => void;
  setMetrics: (metrics: SceneMetric[]) => void;
  setPathBias: (value: -1 | 0 | 1) => void;
  setPaused: (paused: boolean) => void;
  setPointer: (
    normalizedX: number,
    normalizedY: number,
    clientX: number,
    clientY: number,
  ) => void;
  setScroll: (scrollY: number) => void;
};

type WorldOptions = {
  canvas: HTMLCanvasElement;
  labelHost: HTMLElement;
  onFailure?: () => void;
  onReady?: () => void;
  tooltip: HTMLElement;
};

type TrackedLabel = {
  element: HTMLSpanElement;
  object: THREE.Object3D;
  offset: THREE.Vector3;
  window: [number, number];
};

const OFF_WHITE = 0xf6f4ef;
const SIGNAL_ORANGE = 0xf36b21;
const GRAPHITE = 0x171717;
const GRAPHITE_DEEP = 0x0f1012;
const GRAPHITE_SOFT = 0x2b2c2f;

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));
const lerp = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;
const smooth = (value: number) => value * value * (3 - 2 * value);
const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

const ramp = (value: number, start: number, end: number) =>
  smooth(clamp((value - start) / Math.max(0.0001, end - start)));

function eachMaterial(
  object: THREE.Object3D,
  callback: (material: THREE.Material) => void,
) {
  const candidate = object as THREE.Object3D & {
    material?: THREE.Material | THREE.Material[];
  };
  if (!candidate.material) return;
  if (Array.isArray(candidate.material)) {
    candidate.material.forEach(callback);
  } else {
    callback(candidate.material);
  }
}

function rememberOpacity(root: THREE.Object3D) {
  root.traverse((object) => {
    eachMaterial(object, (material) => {
      material.userData.baseOpacity = material.opacity;
      material.transparent = true;
    });
  });
}

function setOpacity(root: THREE.Object3D, amount: number) {
  root.visible = amount > 0.001;
  root.traverse((object) => {
    eachMaterial(object, (material) => {
      const base = Number(material.userData.baseOpacity ?? material.opacity);
      material.opacity = base * amount;
    });
  });
}

function lineMaterial(color: number, opacity: number) {
  const material = new THREE.LineBasicMaterial({
    color,
    opacity,
    transparent: true,
  });
  material.userData.baseOpacity = opacity;
  return material;
}

function solidMaterial(
  emissive = OFF_WHITE,
  intensity = 0.06,
  surface = GRAPHITE_SOFT,
) {
  const material = new THREE.MeshStandardMaterial({
    color: surface,
    emissive,
    emissiveIntensity: intensity,
    flatShading: true,
    metalness: 0.06,
    opacity: 1,
    roughness: 0.82,
    transparent: true,
  });
  material.userData.baseOpacity = 1;
  return material;
}

function brandSurfaceMaterial(color: number, emissiveIntensity = 0) {
  const material = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity,
    metalness: 0.02,
    opacity: 1,
    roughness: 0.78,
    transparent: true,
  });
  material.userData.baseOpacity = 1;
  return material;
}

function roundedRailGeometry(
  width: number,
  height: number,
  depth: number,
  radius: number,
) {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const corner = Math.min(radius, halfWidth, halfHeight);
  const shape = new THREE.Shape();

  shape.moveTo(-halfWidth + corner, -halfHeight);
  shape.lineTo(halfWidth - corner, -halfHeight);
  shape.quadraticCurveTo(halfWidth, -halfHeight, halfWidth, -halfHeight + corner);
  shape.lineTo(halfWidth, halfHeight - corner);
  shape.quadraticCurveTo(halfWidth, halfHeight, halfWidth - corner, halfHeight);
  shape.lineTo(-halfWidth + corner, halfHeight);
  shape.quadraticCurveTo(-halfWidth, halfHeight, -halfWidth, halfHeight - corner);
  shape.lineTo(-halfWidth, -halfHeight + corner);
  shape.quadraticCurveTo(-halfWidth, -halfHeight, -halfWidth + corner, -halfHeight);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: Math.min(0.04, depth * 0.16),
    bevelThickness: Math.min(0.04, depth * 0.16),
    depth,
    steps: 1,
  });
  geometry.center();
  return geometry;
}

function createSignalRailMark(scale = 1) {
  const mark = new THREE.Group();
  const railSpecs = [
    { width: 3.6, x: -0.8, y: 1.9 },
    { width: 4, x: -0.6, y: 0 },
    { width: 2.6, x: -1.3, y: -1.9 },
  ];

  railSpecs.forEach(({ width, x, y }) => {
    const rail = edged(
      roundedRailGeometry(width, 1, 0.3, 0.28),
      brandSurfaceMaterial(OFF_WHITE),
      GRAPHITE,
      0.34,
    );
    rail.position.set(x, y, 0);
    mark.add(rail);
  });

  const terminal = edged(
    roundedRailGeometry(1, 1, 0.36, 0.28),
    brandSurfaceMaterial(SIGNAL_ORANGE, 0.16),
    GRAPHITE,
    0.36,
  );
  terminal.position.set(2.1, 1.9, 0.03);
  terminal.userData.signalTerminal = true;
  mark.add(terminal);
  mark.scale.setScalar(scale);
  return mark;
}

function edged(
  geometry: THREE.BufferGeometry,
  solid: THREE.Material | null,
  edgeColor: number,
  edgeOpacity: number,
) {
  const group = new THREE.Group();
  if (solid) group.add(new THREE.Mesh(geometry, solid));
  group.add(
    new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      lineMaterial(edgeColor, edgeOpacity),
    ),
  );
  return group;
}

function disposeObject(root: THREE.Object3D) {
  root.traverse((object) => {
    const disposable = object as THREE.Object3D & {
      geometry?: THREE.BufferGeometry;
    };
    disposable.geometry?.dispose();
    eachMaterial(object, (material) => material.dispose());
  });
}

export function createEnginaraWorld({
  canvas,
  labelHost,
  onFailure,
  onReady,
  tooltip,
}: WorldOptions): EnginaraWorld {
  let renderer: THREE.WebGLRenderer;

  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas,
      powerPreference: "high-performance",
    });
  } catch {
    onFailure?.();
    throw new Error("WebGL is unavailable");
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.98;
  renderer.setClearColor(GRAPHITE_DEEP, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(GRAPHITE_DEEP, 0.008);

  const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 220);
  camera.position.set(0, 0.15, 8.2);

  const ambientLight = new THREE.AmbientLight(0xbdb9b0, 1.9);
  const keyLight = new THREE.DirectionalLight(OFF_WHITE, 2.4);
  keyLight.position.set(4, 6, 8);
  const rimLight = new THREE.DirectionalLight(0x77756f, 0.55);
  rimLight.position.set(-6, -3, -6);
  const signalLight = new THREE.PointLight(SIGNAL_ORANGE, 0, 20);
  signalLight.position.set(2.2, 1.7, -10);
  scene.add(ambientLight, keyLight, rimLight, signalLight);

  const guidePoints: THREE.Vector3[] = [];
  for (let z = 3; z >= -45; z -= 4) {
    [-2.8, 0, 2.8].forEach((y) => {
      guidePoints.push(
        new THREE.Vector3(-9, y, z),
        new THREE.Vector3(9, y, z),
      );
    });
    guidePoints.push(
      new THREE.Vector3(-0.08, -3.05, z),
      new THREE.Vector3(-0.08, 3.05, z),
    );
  }
  const guideMaterial = lineMaterial(OFF_WHITE, 0.065);
  const guides = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(guidePoints),
    guideMaterial,
  );
  guides.position.z = -0.35;
  scene.add(guides);

  const core = new THREE.Group();
  const nucleus = createSignalRailMark(0.72);
  core.add(nucleus);

  type CoreModule = THREE.Group & {
    userData: {
      end: THREE.Vector3;
      spin: THREE.Vector3;
      start: THREE.Vector3;
    };
  };
  const coreModules: CoreModule[] = [];
  const moduleGeometries = [
    new THREE.BoxGeometry(0.3, 0.13, 0.15),
    new THREE.BoxGeometry(0.22, 0.22, 0.14),
    new THREE.BoxGeometry(0.42, 0.12, 0.16),
  ];
  const railSlots = [1.35, 0, -1.35].flatMap((y) =>
    [-1.5, -0.5, 0.5, 1.5].map((x) => new THREE.Vector3(x, y, -0.34)),
  );
  for (let index = 0; index < 12; index += 1) {
    const coreModule = edged(
      moduleGeometries[index % moduleGeometries.length].clone(),
      solidMaterial(OFF_WHITE, 0.045),
      OFF_WHITE,
      0.36,
    ) as CoreModule;
    const end = railSlots[index];
    const direction = index % 4 < 2 ? -1 : 1;
    const start = end.clone().add(
      new THREE.Vector3(direction * (2.2 + (index % 3) * 0.28), 0, 0),
    );
    coreModule.position.copy(start);
    coreModule.userData = {
      end,
      spin: new THREE.Vector3(),
      start,
    };
    coreModules.push(coreModule);
    core.add(coreModule);
  }
  const coreLineGeometry = new THREE.BufferGeometry();
  coreLineGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(coreModules.length * 6), 3),
  );
  const coreLines = new THREE.LineSegments(
    coreLineGeometry,
    lineMaterial(OFF_WHITE, 0.28),
  );
  core.add(coreLines);
  rememberOpacity(core);
  scene.add(core);

  type Fragment = THREE.Group & {
    userData: {
      end: THREE.Vector3;
      start: THREE.Vector3;
      startRotation: THREE.Euler;
    };
  };
  const custom = new THREE.Group();
  const fragments: Fragment[] = [];
  const fragmentGeometries = [
    roundedRailGeometry(0.86, 0.26, 0.12, 0.07),
    new THREE.BoxGeometry(0.54, 0.24, 0.14),
    roundedRailGeometry(0.62, 0.22, 0.11, 0.06),
    new THREE.PlaneGeometry(0.72, 0.28),
    new THREE.BoxGeometry(0.82, 0.2, 0.16),
  ];
  const lattice: THREE.Vector3[] = [];
  [
    { width: 3.4, y: 1.25 },
    { width: 3.8, y: 0 },
    { width: 2.45, y: -1.25 },
  ].forEach(({ width, y }) => {
    for (let column = 0; column < 4; column += 1) {
      const x = -1.9 + (width / 3) * column;
      lattice.push(new THREE.Vector3(x, y, 0));
    }
  });
  for (let index = 0; index < 12; index += 1) {
    const fragment = edged(
      fragmentGeometries[index % fragmentGeometries.length].clone(),
      index % 4 === 1 ? solidMaterial(OFF_WHITE, 0.035) : null,
      OFF_WHITE,
      index % 3 ? 0.3 : 0.5,
    ) as Fragment;
    const end = lattice[index];
    const direction = index % 4 < 2 ? -1 : 1;
    const start = end.clone().add(
      new THREE.Vector3(direction * (1.25 + (index % 2) * 0.22), 0, 0),
    );
    const startRotation = new THREE.Euler(0, 0, direction * 0.08);
    fragment.position.copy(start);
    fragment.rotation.copy(startRotation);
    fragment.userData = { end, start, startRotation };
    fragments.push(fragment);
    custom.add(fragment);
  }
  const customWirePoints: THREE.Vector3[] = [];
  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 3; column += 1) {
      customWirePoints.push(lattice[row * 4 + column], lattice[row * 4 + column + 1]);
    }
  }
  [1, 2].forEach((row) => {
    customWirePoints.push(lattice[(row - 1) * 4 + 1], lattice[row * 4 + 1]);
  });
  const customWire = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(customWirePoints),
    lineMaterial(OFF_WHITE, 0.48),
  );
  customWire.geometry.setDrawRange(0, 0);
  custom.add(customWire);
  custom.position.set(-1.2, 0, 0);
  custom.scale.setScalar(0.001);
  rememberOpacity(custom);
  scene.add(custom);

  type ProvenModule = THREE.Group & {
    userData: {
      end: THREE.Vector3;
      order: number;
      start: THREE.Vector3;
    };
  };
  const proven = new THREE.Group();
  const provenModules: ProvenModule[] = [];
  const snapOrder = [4, 1, 3, 5, 7, 0, 2, 6, 8];
  for (let index = 0; index < 9; index += 1) {
    const x = ((index % 3) - 1) * 0.98;
    const y = (1 - Math.floor(index / 3)) * 0.98;
    const provenModule = edged(
      new THREE.BoxGeometry(0.82, 0.3, 0.24),
      solidMaterial(OFF_WHITE, 0.035),
      OFF_WHITE,
      0.5,
    ) as ProvenModule;
    const end = new THREE.Vector3(x, y, 0);
    const column = index % 3;
    const direction = column === 0 ? -1 : column === 2 ? 1 : index < 5 ? -1 : 1;
    const start = end.clone().add(
      new THREE.Vector3(direction * (1.35 + (index % 2) * 0.2), 0, 0),
    );
    provenModule.position.copy(start);
    provenModule.userData = {
      end,
      order: snapOrder.indexOf(index),
      start,
    };
    provenModules.push(provenModule);
    proven.add(provenModule);
  }
  const provenFrame = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(3.55, 3.1, 0.5)),
    lineMaterial(OFF_WHITE, 0.36),
  );
  proven.add(provenFrame);
  proven.position.set(1.2, 0, 0);
  proven.scale.setScalar(0.001);
  rememberOpacity(proven);
  scene.add(proven);

  const capabilities = [
    ["Custom Software", "Applications engineered around the way your operation actually works."],
    ["Web & Mobile Apps", "Client-facing and internal tools for browser, iOS, and Android."],
    ["AI Agents", "Assistants that qualify, answer, summarize, and act inside your systems."],
    ["Workflow Automation", "Manual steps removed and handoffs that trigger themselves."],
    ["CRM", "Pipelines, contacts, and lifecycle built around your customer journey."],
    ["Integrations", "Your tools finally talking to each other through reliable connectors."],
    ["Cloud Infrastructure", "Deployment, scaling, observability, and security underneath it all."],
    ["Operations", "Human-run processes designed, documented, and managed."],
    ["Marketing Automation", "Campaigns, nurture, and follow-up that run consistently."],
    ["Finance & Admin", "Back-office workflows kept accurate and moving."],
    ["Customer Support", "Knowledge, routing, and real people where they matter."],
    ["Reporting & Analytics", "KPIs that show the state of the business in real time."],
  ] as const;

  type NetworkNode = THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial> & {
    userData: {
      description: string;
      home: THREE.Vector3;
      hover: number;
      hoverTarget: number;
      name: string;
    };
  };

  const network = new THREE.Group();
  network.position.set(0, 0, -10);
  const networkCenter = createSignalRailMark(0.25);
  networkCenter.position.x = -3.4;
  network.add(networkCenter);
  const networkNodes: NetworkNode[] = [];
  const networkLinePoints: THREE.Vector3[] = [];
  capabilities.forEach(([name, description], index) => {
    const row = Math.floor(index / 4);
    const column = index % 4;
    const home = new THREE.Vector3(
      -0.85 + column * 1.35,
      (1 - row) * 1.3,
      column % 2 === 0 ? -0.04 : 0.04,
    );
    const node = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.18, 0.15),
      solidMaterial(OFF_WHITE, 0.06),
    ) as NetworkNode;
    node.position.copy(home);
    node.userData = {
      description,
      home,
      hover: 0,
      hoverTarget: 0,
      name,
    };
    networkNodes.push(node);
    network.add(node);
    networkLinePoints.push(new THREE.Vector3(-2.7, home.y, 0), home);
  });
  const networkLines = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(networkLinePoints),
    lineMaterial(OFF_WHITE, 0.24),
  );
  network.add(networkLines);
  rememberOpacity(network);
  setOpacity(network, 0);
  scene.add(network);

  const supportRail = new THREE.Group();
  supportRail.position.copy(network.position);
  const supportRailPoints: THREE.Vector3[] = [];
  [1.25, 0, -1.25].forEach((y) => {
    supportRailPoints.push(
      new THREE.Vector3(-4, y, 0),
      new THREE.Vector3(4, y, 0),
    );
  });
  supportRail.add(
    new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(supportRailPoints),
      lineMaterial(OFF_WHITE, 0.28),
    ),
  );
  const managedTerminal = new THREE.Mesh(
    roundedRailGeometry(0.42, 0.42, 0.22, 0.12),
    brandSurfaceMaterial(SIGNAL_ORANGE, 0.28),
  );
  managedTerminal.position.set(4.25, 1.25, 0.02);
  supportRail.add(managedTerminal);
  const supportSignals: Array<
    THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial> & {
      userData: { phase: number; rail: number };
    }
  > = [];
  for (let index = 0; index < 8; index += 1) {
    const signal = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.14, 0.16),
      new THREE.MeshStandardMaterial({
        color: SIGNAL_ORANGE,
        emissive: SIGNAL_ORANGE,
        emissiveIntensity: 0.7,
        metalness: 0.02,
        opacity: 1,
        roughness: 0.72,
        transparent: true,
      }),
    ) as (typeof supportSignals)[number];
    signal.userData = { phase: index / 8, rail: index % 3 };
    supportSignals.push(signal);
    supportRail.add(signal);
    const tetherGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(),
      new THREE.Vector3(),
    ]);
    const tether = new THREE.Line(
      tetherGeometry,
      lineMaterial(SIGNAL_ORANGE, 0.16),
    );
    tether.userData.signal = signal;
    supportRail.add(tether);
  }
  rememberOpacity(supportRail);
  setOpacity(supportRail, 0);
  scene.add(supportRail);

  const process = new THREE.Group();
  const processMinis: THREE.Group[] = [];
  const processZ = [-18, -21, -24, -27];

  const discovery = new THREE.Group();
  discovery.add(createSignalRailMark(0.13));
  processMinis.push(discovery);

  const blueprint = new THREE.Group();
  blueprint.add(
    new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(1.15, 1.15, 1.15)),
      lineMaterial(OFF_WHITE, 0.62),
    ),
  );
  const grid = new THREE.GridHelper(1.7, 6, OFF_WHITE, GRAPHITE_SOFT);
  grid.rotation.x = Math.PI / 2;
  grid.position.z = -0.58;
  eachMaterial(grid, (material) => {
    material.opacity = 0.42;
    material.transparent = true;
  });
  blueprint.add(grid);
  processMinis.push(blueprint);

  const connected = new THREE.Group();
  const connectedPoints = [
    new THREE.Vector3(-0.55, 0.35, 0),
    new THREE.Vector3(0.5, 0.55, -0.2),
    new THREE.Vector3(0.05, -0.5, 0.15),
  ];
  connectedPoints.forEach((position) => {
    const block = edged(
      new THREE.BoxGeometry(0.42, 0.42, 0.42),
      solidMaterial(OFF_WHITE, 0.08),
      OFF_WHITE,
      0.5,
    );
    block.position.copy(position);
    connected.add(block);
  });
  connected.add(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        ...connectedPoints,
        connectedPoints[0],
      ]),
      lineMaterial(OFF_WHITE, 0.5),
    ),
  );
  processMinis.push(connected);

  const operated = new THREE.Group();
  operated.add(createSignalRailMark(0.17));
  for (let index = 0; index < 3; index += 1) {
    const operator = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.1, 0.1),
      new THREE.MeshBasicMaterial({ color: SIGNAL_ORANGE, transparent: true }),
    );
    operator.userData.phase = index / 3;
    operator.userData.rail = index;
    operated.userData[`signal${index}`] = operator;
    operated.add(operator);
  }
  processMinis.push(operated);

  processMinis.forEach((mini, index) => {
    mini.position.set(index % 2 === 0 ? 1.7 : 1.95, 0.1, processZ[index]);
    rememberOpacity(mini);
    setOpacity(mini, 0);
    process.add(mini);
  });
  scene.add(process);

  const labels: TrackedLabel[] = [];
  const createLabel = (
    text: string,
    object: THREE.Object3D,
    offset: THREE.Vector3,
    window: [number, number],
    signal = false,
  ) => {
    const element = document.createElement("span");
    element.className = signal ? "world-label world-label-brass" : "world-label";
    element.style.setProperty("--steel-soft", "rgb(246 244 239 / 42%)");
    if (signal) {
      element.style.setProperty("--brass", "#f36b21");
      element.style.setProperty("--brass-soft", "rgb(243 107 33 / 58%)");
    }
    element.textContent = text;
    labelHost.appendChild(element);
    labels.push({ element, object, offset, window });
  };

  [
    "AI Agent",
    "Custom CRM",
    "Application",
    "API",
    "Automation",
    "Dashboard",
    "Database",
    "Cloud",
  ].forEach((label, index) => {
    createLabel(
      label,
      fragments[index],
      new THREE.Vector3(0.15, 0.38, 0),
      [2.08 + index * 0.035, 2.98],
    );
  });

  [
    "CRM",
    "Lead Capture",
    "Sales Pipeline",
    "Follow-Up",
    "Appointments",
    "Marketing",
    "Reporting",
    "Support",
    "Analytics",
  ].forEach((label, index) => {
    createLabel(
      label,
      provenModules[index],
      new THREE.Vector3(0, 0.6, 0),
      [3.08 + provenModules[index].userData.order * 0.035, 3.98],
    );
  });

  networkNodes.forEach((node) => {
    createLabel(
      node.userData.name,
      node,
      new THREE.Vector3(0, 0.34, 0),
      [5.08, 6.5],
    );
  });

  [
    ["Monitoring", 0],
    ["Optimization", 3],
    ["User Support", 6],
  ].forEach(([label, index]) => {
    createLabel(
      String(label),
      supportSignals[Number(index)],
      new THREE.Vector3(0, 0.4, 0),
      [6.08, 6.68],
      true,
    );
  });

  const cameraPath = [
    { look: [0, 0, 0], position: [0, 0.15, 8.6] },
    { look: [0, 0, 0], position: [0, 0.15, 8.8] },
    { look: [-3.8, 0, 0], position: [-3.8, 0.15, 7.5] },
    { look: [3.8, 0, 0], position: [3.8, 0.15, 7.5] },
    { look: [0, 0, 0], position: [0, 0.15, 8.8] },
    { look: [0, 0, -10], position: [0, 0.15, -1.8] },
    { look: [1.6, 0, -10], position: [1.6, 0.15, -1.8] },
    { look: [1.8, 0, -18], position: [1.8, 0.15, -10.5] },
    { look: [1.8, 0, -27], position: [1.8, 0.15, -19.5] },
    { look: [0, 0, -27], position: [0, 0.15, -19.5] },
    { look: [0, 0, -27], position: [0, 0.15, -19.5] },
  ] as const;

  tooltip.style.backgroundColor = "rgb(23 23 23 / 96%)";
  tooltip.style.borderColor = "rgb(246 244 239 / 28%)";
  tooltip.style.color = "#f6f4ef";

  let metrics: SceneMetric[] = [];
  let scrollPosition = 0;
  let pathBiasTarget = 0;
  let pathBias = 0;
  let pointerX = 0;
  let pointerY = 0;
  let pointerSmoothX = 0;
  let pointerSmoothY = 0;
  let pointerClientX = 0;
  let pointerClientY = 0;
  let hoveredNode: NetworkNode | null = null;
  let destroyed = false;
  let paused = false;
  let raf = 0;
  let elapsed = 0;
  let previousTimestamp = performance.now();
  let readySent = false;

  const projected = new THREE.Vector3();
  const cameraPosition = camera.position.clone();
  const cameraLook = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  const pointerVector = new THREE.Vector2();

  const sceneStart = (index: number) => {
    const metric = metrics[index];
    if (!metric) return 0;
    return index === 0 ? metric.top : metric.top - metric.viewport;
  };

  const sceneEnd = (index: number) => {
    const metric = metrics[index];
    if (!metric) return sceneStart(index) + 1;
    if (index < metrics.length - 1) return sceneStart(index + 1);
    return metric.top + metric.height - metric.viewport;
  };

  const localProgress = (index: number) => {
    if (!metrics[index]) return index === 0 ? 0 : scrollPosition > 0 ? 1 : 0;
    const start = sceneStart(index);
    return clamp((scrollPosition - start) / Math.max(1, sceneEnd(index) - start));
  };

  const globalProgress = () => {
    if (!metrics.length) return 0;
    let index = 0;
    for (let cursor = 0; cursor < metrics.length; cursor += 1) {
      if (scrollPosition >= sceneStart(cursor)) index = cursor;
    }
    return index + localProgress(index);
  };

  const updateLabels = (progress: number) => {
    scene.updateMatrixWorld(true);
    labels.forEach((label) => {
      const [start, end] = label.window;
      let opacity = 0;
      if (progress > start && progress < end) {
        opacity = Math.min(1, (progress - start) * 4, (end - progress) * 4);
      }
      if (opacity <= 0) {
        label.element.style.opacity = "0";
        return;
      }
      label.object.getWorldPosition(projected);
      projected.add(label.offset).project(camera);
      if (projected.z > 1) {
        label.element.style.opacity = "0";
        return;
      }
      label.element.style.transform = `translate3d(${(
        (projected.x * 0.5 + 0.5) * window.innerWidth
      ).toFixed(1)}px, ${(
        (-projected.y * 0.5 + 0.5) * window.innerHeight
      ).toFixed(1)}px, 0) translate(-50%, -50%)`;
      label.element.style.opacity = opacity.toFixed(3);
    });
  };

  const updateHover = (progress: number, delta: number) => {
    if (progress < 5.04 || progress > 6.5) {
      if (hoveredNode) hoveredNode.userData.hoverTarget = 0;
      hoveredNode = null;
      tooltip.style.opacity = "0";
      return;
    }
    pointerVector.set(pointerX, -pointerY);
    raycaster.setFromCamera(pointerVector, camera);
    const hit = raycaster.intersectObjects(networkNodes, false)[0];
    const next = (hit?.object as NetworkNode | undefined) ?? null;
    if (next !== hoveredNode) {
      if (hoveredNode) hoveredNode.userData.hoverTarget = 0;
      hoveredNode = next;
      if (next) {
        next.userData.hoverTarget = 1;
        const name = tooltip.querySelector<HTMLElement>("[data-tooltip-name]");
        const description = tooltip.querySelector<HTMLElement>(
          "[data-tooltip-description]",
        );
        if (name) name.textContent = next.userData.name;
        if (description) description.textContent = next.userData.description;
      }
    }
    tooltip.style.opacity = hoveredNode ? "1" : "0";
    tooltip.style.transform = `translate3d(${pointerClientX + 16}px, ${
      pointerClientY + 16
    }px, 0)`;
    networkNodes.forEach((node) => {
      node.userData.hover = lerp(
        node.userData.hover,
        node.userData.hoverTarget,
        1 - Math.pow(0.001, Math.max(delta, 0.001)),
      );
    });
  };

  const renderFrame = (timestamp: number, schedule = true) => {
    if (destroyed) return;
    const delta = Math.min(0.05, Math.max(0, (timestamp - previousTimestamp) / 1000));
    previousTimestamp = timestamp;
    if (!paused) elapsed += delta;

    const progress = globalProgress();
    const heroProgress = localProgress(0);
    const splitProgress = localProgress(1);
    const customProgress = localProgress(2);
    const provenProgress = localProgress(3);
    const pathsProgress = localProgress(4);
    const capabilityProgress = localProgress(5);
    const supportProgress = localProgress(6);
    const processProgress = localProgress(7);
    const problemProgress = localProgress(8);
    const finalProgress = localProgress(9);
    const finalEase = easeOutCubic(finalProgress);

    const coreAssembly = ramp(heroProgress, 0.36, 0.92);
    const coreVisibility =
      ramp(heroProgress, 0.44, 0.58) * (1 - ramp(splitProgress, 0.04, 0.36));
    const branchVisibility =
      ramp(splitProgress, 0.04, 0.28) *
      (1 - ramp(pathsProgress, 0.54, 0.68));
    const networkVisibility =
      ramp(capabilityProgress, 0.04, 0.32) *
      (1 - ramp(supportProgress, 0.48, 0.64));
    const supportVisibility =
      ramp(supportProgress, 0.05, 0.34) *
      (1 - ramp(supportProgress, 0.58, 0.68));
    const processVisibility = 1 - ramp(problemProgress, 0.02, 0.2);

    const dim = 1 - 0.62 * easeOutCubic(problemProgress) * (1 - finalEase);
    ambientLight.intensity = 1.9 * dim;
    keyLight.intensity = 2.4 * dim;
    rimLight.intensity = 0.55 * dim;
    signalLight.intensity = 2 * supportVisibility * dim;
    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.density = 0.008 * (1 - 0.45 * finalEase);
    }
    guideMaterial.opacity =
      0.05 * ramp(heroProgress, 0.12, 0.34) * dim * processVisibility;

    core.position.y = 0;
    const lineArray = coreLineGeometry.attributes.position.array as Float32Array;
    coreModules.forEach((module, index) => {
      const amount = easeOutCubic(clamp(coreAssembly * 1.45 - index * 0.032));
      module.position.lerpVectors(module.userData.start, module.userData.end, amount);
      module.rotation.set(0, 0, 0);
      lineArray[index * 6] = module.position.x;
      lineArray[index * 6 + 1] = module.position.y;
      lineArray[index * 6 + 2] = module.position.z;
      lineArray[index * 6 + 3] = module.userData.end.x;
      lineArray[index * 6 + 4] = module.userData.end.y;
      lineArray[index * 6 + 5] = module.userData.end.z;
    });
    coreLineGeometry.attributes.position.needsUpdate = true;
    const coreOpacity = coreVisibility * dim;
    core.scale.setScalar(
      lerp(0.46, 0.56, coreAssembly) * lerp(1, 0.9, splitProgress),
    );
    setOpacity(core, coreOpacity);
    coreLines.material.opacity =
      clamp(coreAssembly * 1.3 - 0.15) * 0.28 * coreOpacity * dim;

    const splitEase = easeOutCubic(splitProgress);
    pathBias = lerp(pathBias, progress > 3.7 && progress < 4.9 ? pathBiasTarget : 0, 0.08);
    custom.scale.setScalar(Math.max(0.001, splitEase));
    proven.scale.setScalar(Math.max(0.001, splitEase));
    custom.position.x = -1.2 - 3.1 * splitEase;
    proven.position.x = 1.2 + 3.1 * splitEase;
    custom.position.z = pathBias < 0 ? Math.abs(pathBias) * 0.36 : -Math.abs(pathBias) * 0.12;
    proven.position.z = pathBias > 0 ? Math.abs(pathBias) * 0.36 : -Math.abs(pathBias) * 0.12;
    custom.rotation.y = 0;
    proven.rotation.y = 0;
    const branchDetail = lerp(0.4, 1, Math.max(customProgress, provenProgress));
    const customVisibility =
      branchVisibility * branchDetail * (1 - 0.38 * clamp(pathBias)) * dim;
    const provenVisibility =
      branchVisibility * branchDetail * (1 - 0.38 * clamp(-pathBias)) * dim;
    setOpacity(custom, customVisibility);
    setOpacity(proven, provenVisibility);

    fragments.forEach((fragment, index) => {
      const delay = 0.28 * (index / Math.max(1, fragments.length - 1));
      const amount = ramp(customProgress, delay, delay + 0.72);
      fragment.position.lerpVectors(fragment.userData.start, fragment.userData.end, amount);
      fragment.rotation.set(
        fragment.userData.startRotation.x * (1 - amount),
        fragment.userData.startRotation.y * (1 - amount),
        fragment.userData.startRotation.z * (1 - amount),
      );
    });
    customWire.geometry.setDrawRange(
      0,
      Math.floor(customWirePoints.length * ramp(customProgress, 0.16, 0.92)),
    );

    provenModules.forEach((module) => {
      const delay =
        0.3 * (module.userData.order / Math.max(1, provenModules.length - 1));
      const amount = ramp(provenProgress, delay, delay + 0.7);
      module.position.lerpVectors(module.userData.start, module.userData.end, amount);
    });
    const frameFade = ramp(provenProgress, 0.7, 0.95);
    eachMaterial(provenFrame, (material) => {
      material.opacity =
        Number(material.userData.baseOpacity ?? 1) *
        frameFade *
        provenVisibility;
    });

    const networkOpacity = networkVisibility * dim;
    network.position.x = 1.25 + ramp(supportProgress, 0.08, 0.72) * 1.1;
    network.rotation.y = pointerSmoothX * 0.04;
    networkNodes.forEach((node) => {
      node.position.copy(node.userData.home);
      node.position.z += node.userData.hover * 0.32;
      node.scale.setScalar(1 + node.userData.hover * 0.38);
      node.material.emissive.setHex(
        node.userData.hover > 0.01 ? SIGNAL_ORANGE : OFF_WHITE,
      );
      node.material.emissiveIntensity = 0.06 + node.userData.hover * 0.82;
    });
    setOpacity(network, networkOpacity);

    const railOpacity = supportVisibility * dim;
    supportRail.position.x = ramp(supportProgress, 0.04, 0.68) * 3.1;
    supportRail.scale.setScalar(1);
    supportRail.children.forEach((child) => {
      const signal = child as (typeof supportSignals)[number];
      if (
        typeof signal.userData.phase === "number" &&
        typeof signal.userData.rail === "number"
      ) {
        const travel = (signal.userData.phase + elapsed * 0.075) % 1;
        signal.position.set(
          lerp(-3.8, 3.75, travel),
          (1 - signal.userData.rail) * 1.25,
          0.08,
        );
      }
      const tetherSignal = child.userData.signal as
        | (typeof supportSignals)[number]
        | undefined;
      if (tetherSignal && "geometry" in child) {
        const positions = (child as THREE.Line).geometry.attributes.position
          .array as Float32Array;
        positions[0] = tetherSignal.position.x;
        positions[1] = tetherSignal.position.y;
        positions[2] = tetherSignal.position.z;
        positions[3] = -4;
        positions[4] = tetherSignal.position.y;
        positions[5] = 0;
        (child as THREE.Line).geometry.attributes.position.needsUpdate = true;
      }
    });
    setOpacity(supportRail, railOpacity);

    processMinis.forEach((mini, index) => {
      const cursor = processProgress * processMinis.length;
      const entered = ramp(cursor, index, index + 0.42);
      const leaving =
        index === processMinis.length - 1
          ? 1
          : 1 - ramp(cursor, index + 0.72, index + 1);
      setOpacity(mini, entered * leaving * processVisibility * dim);
      mini.scale.setScalar(0.7 + 0.3 * easeOutCubic(entered));
      mini.rotation.z = 0;
    });
    for (let index = 0; index < 3; index += 1) {
      const operator = operated.userData[`signal${index}`] as THREE.Mesh;
      const travel = (Number(operator.userData.phase) + elapsed * 0.18) % 1;
      operator.position.set(
        lerp(-0.4, 0.43, travel),
        (1 - Number(operator.userData.rail)) * 0.32,
        0.13,
      );
    }

    const segment = Math.min(cameraPath.length - 2, Math.floor(progress));
    const segmentProgress = clamp(progress - segment);
    const amount =
      segment === 7
        ? smooth(segmentProgress)
        : ramp(segmentProgress, segment === 0 ? 0.42 : 0.68, 1);
    const from = cameraPath[segment];
    const to = cameraPath[segment + 1];
    const pointerDamping = 1 - Math.pow(0.0018, Math.max(delta, 0.001));
    pointerSmoothX = lerp(pointerSmoothX, pointerX, pointerDamping);
    pointerSmoothY = lerp(pointerSmoothY, pointerY, pointerDamping);
    const targetX =
      lerp(from.position[0], to.position[0], amount) +
      pointerSmoothX * 0.18 +
      (progress > 3.7 && progress < 4.9 ? pathBias * 0.6 : 0);
    const targetY =
      lerp(from.position[1], to.position[1], amount) - pointerSmoothY * 0.1;
    const targetZ = lerp(from.position[2], to.position[2], amount);
    const cameraDamping = 1 - Math.pow(0.0018, Math.max(delta, 0.001));
    cameraPosition.x = lerp(cameraPosition.x, targetX, cameraDamping);
    cameraPosition.y = lerp(cameraPosition.y, targetY, cameraDamping);
    cameraPosition.z = lerp(cameraPosition.z, targetZ, cameraDamping);
    camera.position.copy(cameraPosition);
    cameraLook.x = lerp(
      cameraLook.x,
      lerp(from.look[0], to.look[0], amount),
      cameraDamping,
    );
    cameraLook.y = lerp(
      cameraLook.y,
      lerp(from.look[1], to.look[1], amount),
      cameraDamping,
    );
    cameraLook.z = lerp(
      cameraLook.z,
      lerp(from.look[2], to.look[2], amount),
      cameraDamping,
    );
    camera.lookAt(cameraLook);

    updateHover(progress, delta);
    updateLabels(progress);
    renderer.render(scene, camera);

    if (!readySent) {
      readySent = true;
      onReady?.();
    }
    if (schedule && !paused && !destroyed) raf = requestAnimationFrame(renderFrame);
  };

  const resize = () => {
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    const maxBackingPixels = 8_000_000;
    const pixelRatio = Math.min(
      window.devicePixelRatio || 1,
      2,
      Math.sqrt(maxBackingPixels / (width * height)),
    );
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (paused) renderFrame(performance.now(), false);
  };

  const handleContextLost = (event: Event) => {
    event.preventDefault();
    if (raf) cancelAnimationFrame(raf);
    onFailure?.();
  };

  canvas.addEventListener("webglcontextlost", handleContextLost);
  resize();
  raf = requestAnimationFrame(renderFrame);

  return {
    destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      labels.forEach((label) => label.element.remove());
      tooltip.style.opacity = "0";
      disposeObject(scene);
      renderer.dispose();
      renderer.forceContextLoss();
    },
    resize,
    setMetrics(nextMetrics) {
      metrics = nextMetrics;
      if (paused) renderFrame(performance.now(), false);
    },
    setPathBias(value) {
      pathBiasTarget = value;
      if (paused) renderFrame(performance.now(), false);
    },
    setPaused(nextPaused) {
      if (paused === nextPaused) return;
      paused = nextPaused;
      previousTimestamp = performance.now();
      if (paused) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        renderFrame(performance.now(), false);
      } else if (!raf) {
        raf = requestAnimationFrame(renderFrame);
      }
    },
    setPointer(normalizedX, normalizedY, clientX, clientY) {
      pointerX = normalizedX;
      pointerY = normalizedY;
      pointerClientX = clientX;
      pointerClientY = clientY;
      if (paused) renderFrame(performance.now(), false);
    },
    setScroll(nextScroll) {
      scrollPosition = nextScroll;
      if (paused) renderFrame(performance.now(), false);
    },
  };
}
