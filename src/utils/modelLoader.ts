import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

// Type definitions
export interface ModelLoadResult {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
  gltf: GLTF; // Add full GLTF object for advanced use cases
}

export interface LoaderOptions {
  onProgress?: (event: ProgressEvent) => void;
  dracoDecoderPath?: string;
}

/**
 * Creates and configures a GLTFLoader with DRACO compression support
 */
function createConfiguredLoader(
  dracoDecoderPath: string = "/draco/"
): GLTFLoader {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(dracoDecoderPath);

  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  return loader;
}

/**
 * Load a GLB/GLTF model
 * @param path Path to the GLB/GLTF file
 * @param options Optional configuration for the loader
 * @returns Promise that resolves with the loaded model
 */
export async function loadModel(
  path: string,
  options: LoaderOptions = {}
): Promise<ModelLoadResult> {
  const loader = createConfiguredLoader(options.dracoDecoderPath);

  try {
    const gltf = await new Promise<GLTF>((resolve, reject) => {
      loader.load(path, resolve, options.onProgress, reject);
    });

    console.log("Model loaded successfully:", path);
    return {
      scene: gltf.scene,
      animations: gltf.animations,
      gltf,
    };
  } catch (error) {
    console.error("Error loading model:", error);
    throw error;
  }
}

/**
 * Create an animation mixer for a model
 * @param scene The model scene to animate
 * @returns THREE.AnimationMixer for the model
 */
export function createAnimationMixer(scene: THREE.Group): THREE.AnimationMixer {
  return new THREE.AnimationMixer(scene);
}

/**
 * Play an animation on a model
 * @param mixer The animation mixer
 * @param animations Array of animation clips
 * @param options Configuration options for the animation
 * @returns The animation action that was started
 */
export function playAnimation(
  mixer: THREE.AnimationMixer,
  animations: THREE.AnimationClip[],
  options: {
    name?: string;
    loop?: THREE.AnimationActionLoopStyles;
    clampWhenFinished?: boolean;
    timeScale?: number;
  } = {}
): THREE.AnimationAction | null {
  const {
    name,
    loop = THREE.LoopRepeat,
    clampWhenFinished = false,
    timeScale = 1.0,
  } = options;

  if (animations.length === 0) {
    console.warn("No animations available to play");
    return null;
  }

  // Find the requested animation by name, or use the first one
  const clip = name ? animations.find((a) => a.name === name) : animations[0];

  if (!clip) {
    console.warn(
      `Animation "${name}" not found. Available animations:`,
      animations.map((a) => a.name)
    );
    return null;
  }

  // Create and configure the animation
  const action = mixer.clipAction(clip);
  action
    .setLoop(loop, Infinity)
    .setEffectiveTimeScale(timeScale)
    .setEffectiveWeight(1.0);

  if (clampWhenFinished) {
    action.clampWhenFinished = true;
  }

  action.play();
  return action;
}
