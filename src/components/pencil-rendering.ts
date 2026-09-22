import * as THREE from "three";

/** Pigment and hatching stay attached to the part, so they never crawl as it moves. */
export function pencilMaterial(color: number, density = 20, strength = .22) {
  const material = new THREE.MeshBasicMaterial({ color, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1, toneMapped: false });
  material.onBeforeCompile = shader => {
    shader.uniforms.pencilDensity = { value: density };
    shader.uniforms.pencilStrength = { value: strength };
    shader.uniforms.pencilPaper = { value: new THREE.Color(0xded9d1) };
    const varyings = "varying vec3 pencilPosition; varying vec3 pencilNormal;\n";
    shader.vertexShader = varyings + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\npencilPosition = position; pencilNormal = normal;");
    shader.fragmentShader = varyings + `
      uniform float pencilDensity;
      uniform float pencilStrength;
      uniform vec3 pencilPaper;
      float pencilHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float pencilNoise(vec2 p) {
        vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(pencilHash(i), pencilHash(i + vec2(1,0)), f.x), mix(pencilHash(i + vec2(0,1)), pencilHash(i + vec2(1,1)), f.x), f.y);
      }
      float pencilStroke(float p) {
        float width = max(fwidth(p), .018);
        float line = 1.0 - smoothstep(.025, .025 + width, abs(fract(p) - .5));
        return line * (1.0 - smoothstep(.35, .8, width));
      }
    ` + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace("#include <color_fragment>", `
      #include <color_fragment>
      vec3 face = abs(normalize(pencilNormal));
      vec2 paperUV = face.y > face.x && face.y > face.z ? pencilPosition.xz : (face.z > face.x ? pencilPosition.xy : pencilPosition.zy);
      float tooth = pencilNoise(paperUV * 115.0);
      float pressure = pencilNoise(paperUV * 5.0);
      float wobble = pencilNoise(paperUV * 14.0) * .24;
      float strokes = pencilStroke((paperUV.x * .8 + paperUV.y) * pencilDensity + wobble);
      float crossStrokes = pencilStroke((paperUV.x - paperUV.y * .7) * pencilDensity * .77 + wobble);
      float crossPressure = smoothstep(.45, .8, pressure) * .4;
      float graphite = strokes * (.55 + pressure * .45) + crossStrokes * crossPressure;
      diffuseColor.rgb = mix(diffuseColor.rgb, pencilPaper, .07 + tooth * .10);
      diffuseColor.rgb *= 1.0 - graphite * pencilStrength - (tooth - .5) * .085;
    `);
  };
  material.customProgramCacheKey = () => "enginara-colored-pencil-v1";
  return material;
}

/** Short uneven strokes and light retracing, with the machined silhouette intact. */
export function pencilEdges(geometry: THREE.BufferGeometry) {
  const edges = new THREE.EdgesGeometry(geometry, 12);
  const source = edges.getAttribute("position");
  const positions: number[] = [], colors: number[] = [];
  const a = new THREE.Vector3(), b = new THREE.Vector3(), side = new THREE.Vector3(), axis = new THREE.Vector3();
  const graphite = new THREE.Color(0x6b6357), light = new THREE.Color(0xa49b8c), color = new THREE.Color();
  const noise = (seed: number) => { const n = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
  const point = (t: number, seed: number, pass: number) => {
    const n = (noise(seed) - .5) * .012 + pass * .012;
    positions.push(a.x + (b.x - a.x) * t + side.x * n, a.y + (b.y - a.y) * t + side.y * n, a.z + (b.z - a.z) * t + side.z * n);
    color.copy(graphite).lerp(light, pass ? .72 : noise(seed + 9) * .4);
    colors.push(color.r, color.g, color.b);
  };
  for (let i = 0; i < source.count; i += 2) {
    a.fromBufferAttribute(source, i); b.fromBufferAttribute(source, i + 1);
    const length = a.distanceTo(b);
    if (length < .012) continue;
    side.subVectors(b, a).normalize();
    axis.set(Math.abs(side.y) < .85 ? 0 : 1, Math.abs(side.y) < .85 ? 1 : 0, 0);
    side.cross(axis).normalize();
    const segments = Math.max(1, Math.min(40, Math.ceil(length / .16)));
    for (let j = 0; j < segments; j++) {
      point(j / segments, i * 31 + j, 0);
      point((j + 1) / segments, i * 31 + j + 1, 0);
    }
    if (length > .65) {
      const start = -.012, end = .72 + noise(i) * .3;
      for (let j = 0; j < segments; j++) {
        point(start + (end - start) * j / segments, i * 43 + j, 1);
        point(start + (end - start) * (j + 1) / segments, i * 43 + j + 1, 1);
      }
    }
  }
  edges.dispose();
  const drawing = new THREE.BufferGeometry();
  drawing.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  drawing.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  return drawing;
}
