// 3D barbell behind the hero terminal (desktop only). Phones and anything that can't run it keep the
// static render (assets/img/barbell.webp) that is already in the HTML.
// Three.js (~170 KB compressed) is downloaded only after the page has loaded and the visitor first moves
// the mouse, scrolls or presses a key, so it never competes with the first paint.

export const MODEL_URL = new URL("../assets/models/barbell.glb", import.meta.url).href;
export const MIN_WIDTH = 960;

// Camera setup, shared with tools/blender/barbell.py so the static render and the live model line up exactly.
export const FOV = 28; // vertical, degrees, of the full (stretched) frame
export const VIEW_DIRECTION = [0.45, 0.32, 0.83]; // three-quarter view from slightly above
// The lower part of the box sits behind the terminal window, so the model is drawn higher up:
// we render the bottom part of a taller virtual frame, which puts the model's centre ~35% from the top.
export const FRAME_STRETCH = 1.3;

export function shouldLoadModel({ viewportWidth, finePointer, saveData, webgl }) {
  return viewportWidth >= MIN_WIDTH && finePointer && !saveData && webgl;
}

// Camera distance that fits an object `radius` metres wide (from its centre) across the canvas width.
// Vertical field of view is fixed, so the horizontal one depends on the canvas aspect ratio.
export function fitDistance(radius, verticalFovDegrees, aspect, padding = 1.08) {
  const verticalHalf = (verticalFovDegrees * Math.PI) / 360;
  const horizontalHalf = Math.atan(Math.tan(verticalHalf) * aspect);
  const limitingHalf = Math.min(verticalHalf, horizontalHalf);
  return (radius * padding) / Math.tan(limitingHalf);
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

const whenIdle = (callback) =>
  "requestIdleCallback" in window ? requestIdleCallback(callback, { timeout: 3000 }) : setTimeout(callback, 1200);

async function startViewer(container) {
  const [THREE, { GLTFLoader }, { OrbitControls }, { MeshoptDecoder }, { RoomEnvironment }] = await Promise.all([
    import("three"),
    import("three/addons/loaders/GLTFLoader.js"),
    import("three/addons/controls/OrbitControls.js"),
    import("three/addons/libs/meshopt_decoder.module.js"),
    import("three/addons/environments/RoomEnvironment.js"),
  ]);

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = container.querySelector("canvas");

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  // A soft studio reflection so the chrome bar and collars don't look flat grey
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(2, 3, 2);
  scene.add(key, new THREE.HemisphereLight(0xffffff, 0x1b1f24, 0.6));

  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 50);
  const viewDirection = new THREE.Vector3(...VIEW_DIRECTION).normalize();

  const controls = new OrbitControls(camera, canvas);
  controls.enableZoom = false; // wheel keeps scrolling the page
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.minPolarAngle = Math.PI * 0.18;
  controls.maxPolarAngle = Math.PI * 0.48; // never look from under the platform
  controls.autoRotate = !prefersReducedMotion;
  const BASE_SPEED = 1.1;
  controls.autoRotateSpeed = BASE_SPEED;

  // The terminal's `gym` command spins the barbell fast for a moment
  let spinTimer = null;
  function spin() {
    if (prefersReducedMotion) return;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 18;
    clearTimeout(spinTimer);
    spinTimer = setTimeout(() => {
      controls.autoRotateSpeed = BASE_SPEED;
    }, 2400);
  }

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(MODEL_URL);
  const model = gltf.scene;
  // Centre the model so it spins around its middle
  const box = new THREE.Box3().setFromObject(model);
  model.position.sub(box.getCenter(new THREE.Vector3()));
  scene.add(model);
  controls.target.set(0, 0, 0);
  // Half of the longest side: the bar seen broadside is the widest the model ever gets on screen
  const size = box.getSize(new THREE.Vector3());
  const radius = Math.max(size.x, size.z) / 2;

  function resize() {
    const { width, height } = container.getBoundingClientRect();
    renderer.setSize(width, height, false);
    // Aspect belongs to the full virtual frame, otherwise the model would look squashed
    camera.aspect = width / (height * FRAME_STRETCH);
    camera.setViewOffset(width, height * FRAME_STRETCH, 0, height * (FRAME_STRETCH - 1), width, height);
    camera.updateProjectionMatrix();
    // Keep the current orbit angle, only change how far away the camera is
    const direction = camera.position.lengthSq() ? camera.position.clone().normalize() : viewDirection;
    camera.position.copy(direction.multiplyScalar(fitDistance(radius, FOV, camera.aspect)));
  }
  resize();
  new ResizeObserver(resize).observe(container);

  // Draw only while the model is on screen and the tab is visible
  let onScreen = true;
  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
  }).observe(container);

  renderer.setAnimationLoop(() => {
    if (!onScreen || document.hidden) return;
    controls.update();
    renderer.render(scene, camera);
  });

  container.classList.add("is-ready");
  document.addEventListener("hero-model:spin", spin);
  // A spin asked for while the model was still loading plays now
  if (spinRequested) spin();
}

let spinRequested = false;

export function initHeroModel() {
  const container = document.querySelector("[data-hero-model]");
  if (!container) return;

  const enabled = shouldLoadModel({
    viewportWidth: window.innerWidth,
    finePointer: window.matchMedia("(pointer: fine)").matches,
    saveData: Boolean(navigator.connection?.saveData),
    webgl: supportsWebGL(),
  });
  if (!enabled) return;

  document.addEventListener("hero-model:spin", () => (spinRequested = true), { once: true });

  const start = () =>
    whenIdle(() =>
      startViewer(container).catch((error) => {
        // The static render stays in place, so the hero still looks complete
        console.warn("3D model could not be started.", error);
      }),
    );

  // Wait for the visitor's first move. Until then the static render (same camera angle) is on screen,
  // so the swap is invisible — and parsing Three.js never blocks the page while it is still settling.
  const FIRST_INTERACTION = ["pointermove", "pointerdown", "wheel", "scroll", "keydown", "touchstart"];
  const onFirstInteraction = () => {
    for (const type of FIRST_INTERACTION) window.removeEventListener(type, onFirstInteraction);
    start();
  };
  const listen = () => {
    for (const type of FIRST_INTERACTION) window.addEventListener(type, onFirstInteraction, { passive: true });
  };

  if (document.readyState === "complete") listen();
  else window.addEventListener("load", listen, { once: true });
}
