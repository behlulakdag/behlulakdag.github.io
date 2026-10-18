// 3D barbell behind the hero terminal (desktop only). Phones and anything that can't run it keep the
// static render (assets/img/barbell.webp) that is already in the HTML.
// Three.js (~170 KB compressed) is downloaded only after the page has loaded and the browser is idle,
// so it never competes with the first paint.

export const MODEL_URL = new URL("../assets/models/barbell.glb", import.meta.url).href;
export const MIN_WIDTH = 960;

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

  const FOV = 28;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 50);
  // Starting angle: three-quarter view from slightly above, same as the static render
  const viewDirection = new THREE.Vector3(0.45, 0.32, 0.83).normalize();

  const controls = new OrbitControls(camera, canvas);
  controls.enableZoom = false; // wheel keeps scrolling the page
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.minPolarAngle = Math.PI * 0.18;
  controls.maxPolarAngle = Math.PI * 0.48; // never look from under the platform
  controls.autoRotate = !prefersReducedMotion;
  controls.autoRotateSpeed = 1.1;

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

  // The lower part of the canvas sits behind the terminal window, so draw the model higher up:
  // render the top part of a taller virtual frame, which moves the model's centre to ~35% from the top.
  const FRAME_STRETCH = 1.3;

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
}

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

  const begin = () =>
    whenIdle(() =>
      startViewer(container).catch((error) => {
        // The static render stays in place, so the hero still looks complete
        console.warn("3D model could not be started.", error);
      }),
    );

  if (document.readyState === "complete") begin();
  else window.addEventListener("load", begin, { once: true });
}
