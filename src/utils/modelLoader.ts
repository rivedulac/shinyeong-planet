import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

// Type definition for loading results
export interface ModelLoadResult {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
  error?: string;
}

// Type definition for the success and error callbacks
type OnLoadCallback = (result: ModelLoadResult) => void;
type OnProgressCallback = (event: ProgressEvent) => void;
type OnErrorCallback = (error: Error) => void;

/**
 * Load a GLB/GLTF model
 * @param path Path to the GLB/GLTF file
 * @param onLoad Callback when model is loaded successfully
 * @param onProgress Optional callback for load progress
 * @param onError Optional callback for load errors
 * @returns The loader instance (can be used to abort loading if needed)
 */
export function loadModel(
  path: string,
  onLoad: OnLoadCallback,
  onProgress?: OnProgressCallback,
  onError?: OnErrorCallback
): GLTFLoader {
  // Create a DRACO loader for compressed models
  const dracoLoader = new DRACOLoader();
  // Specify the path to the Draco decoder (you'll need to include these files in your project)
  dracoLoader.setDecoderPath("/draco/");

  // Create a new GLTFLoader instance
  const loader = new GLTFLoader();

  // Use Draco loader for compressed models (optional but recommended for production)
  loader.setDRACOLoader(dracoLoader);

  // Start loading the model
  loader.load(
    // Path to the GLB/GLTF file
    path,

    // Called when the resource is loaded
    (gltf) => {
      console.log("Model loaded successfully:", path);
      onLoad({
        scene: gltf.scene,
        animations: gltf.animations,
      });
    },

    // Called while loading is progressing
    onProgress,

    // Called when loading has errors
    (error) => {
      console.error("Error loading model:", error);
      if (onError) {
        onError(error as Error);
      }
    }
  );

  return loader;
}

/**
 * Asynchronous version of the model loader (returns a Promise)
 * @param path Path to the GLB/GLTF file
 * @returns Promise that resolves with the loaded model
 */
export function loadModelAsync(path: string): Promise<ModelLoadResult> {
  return new Promise((resolve, reject) => {
    loadModel(
      path,
      (result) => resolve(result),
      undefined,
      (error) => reject(error)
    );
  });
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
 * @param animationName Name of the animation to play (if not provided, plays the first animation)
 * @param loop Whether to loop the animation
 * @returns The animation action that was started
 */
export function playAnimation(
  mixer: THREE.AnimationMixer,
  animations: THREE.AnimationClip[],
  animationName?: string,
  loop: THREE.AnimationActionLoopStyles = THREE.LoopRepeat
): THREE.AnimationAction | null {
  if (animations.length === 0) {
    console.warn("No animations available to play");
    return null;
  }

  let clip: THREE.AnimationClip;

  // Find the requested animation by name, or use the first one
  if (animationName) {
    const foundClip = animations.find((a) => a.name === animationName);
    if (!foundClip) {
      console.warn(
        `Animation "${animationName}" not found. Available animations:`,
        animations.map((a) => a.name)
      );
      return null;
    }
    clip = foundClip;
  } else {
    // Default to the first animation
    clip = animations[0];
  }

  // Create and play the animation
  const action = mixer.clipAction(clip);
  action.setLoop(loop, Infinity);
  action.play();

  return action;
}
