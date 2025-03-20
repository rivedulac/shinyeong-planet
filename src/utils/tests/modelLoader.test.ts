import { describe, it, expect, vi, beforeEach } from "vitest";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { loadModel, playAnimation } from "../modelLoader";

// Mock THREE.js classes
vi.mock("three/examples/jsm/loaders/GLTFLoader.js", () => ({
  GLTFLoader: vi.fn(() => ({
    setDRACOLoader: vi.fn(),
    load: vi.fn(),
  })),
}));

vi.mock("three/examples/jsm/loaders/DRACOLoader.js", () => ({
  DRACOLoader: vi.fn(() => ({
    setDecoderPath: vi.fn(),
  })),
}));

describe("modelLoader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loadModel", () => {
    it("should load a model successfully", async () => {
      const mockScene = new THREE.Group();
      const mockAnimations = [new THREE.AnimationClip("test", 1, [])];
      const mockGLTF = { scene: mockScene, animations: mockAnimations };

      // Mock successful loading
      // @ts-ignore: vi namespace is not recognized
      (GLTFLoader as vi.mock).mockImplementation(() => ({
        setDRACOLoader: vi.fn(),
        load: (
          _path: string,
          onLoad: (gltf: any) => void,
          _onProgress?: () => void,
          _onError?: () => void
        ) => {
          onLoad(mockGLTF);
        },
      }));

      const result = await loadModel("test.glb");

      expect(result.scene).toBe(mockScene);
      expect(result.animations).toBe(mockAnimations);
      expect(result.gltf).toBe(mockGLTF);
    });

    it("should handle loading errors", async () => {
      const errorMessage = "Failed to load model";

      // Mock loading error
      // @ts-ignore: vi namespace is not recognized
      (GLTFLoader as vi.mock).mockImplementation(() => ({
        setDRACOLoader: vi.fn(),
        load: (
          _path: string,
          _onLoad: () => void,
          _onProgress: () => void,
          onError: (error: Error) => void
        ) => {
          onError(new Error(errorMessage));
        },
      }));

      await expect(loadModel("test.glb")).rejects.toThrow(errorMessage);
    });

    it("should handle progress updates", async () => {
      const mockProgress = vi.fn();
      const progressEvent = new ProgressEvent("progress", {
        loaded: 50,
        total: 100,
      });

      // Mock loading with progress
      // @ts-ignore: vi namespace is not recognized
      (GLTFLoader as vi.mock).mockImplementation(() => ({
        setDRACOLoader: vi.fn(),
        load: (
          _path: string,
          onLoad: () => void,
          onProgress: (event: ProgressEvent) => void
        ) => {
          onProgress(progressEvent);
          // @ts-ignore: argument number
          onLoad({ scene: new THREE.Group(), animations: [] });
        },
      }));

      await loadModel("test.glb", { onProgress: mockProgress });

      expect(mockProgress).toHaveBeenCalledWith(progressEvent);
    });
  });

  describe("playAnimation", () => {
    it("should play the specified animation", () => {
      const mixer = new THREE.AnimationMixer(new THREE.Group());
      const clip = new THREE.AnimationClip("test", 1, []);
      const mockAction = {
        setLoop: vi.fn().mockReturnThis(),
        setEffectiveTimeScale: vi.fn().mockReturnThis(),
        setEffectiveWeight: vi.fn().mockReturnThis(),
        play: vi.fn(),
      };

      vi.spyOn(mixer, "clipAction").mockReturnValue(mockAction as any);

      const result = playAnimation(mixer, [clip], { name: "test" });

      expect(result).toBeTruthy();
      expect(mixer.clipAction).toHaveBeenCalledWith(clip);
      expect(mockAction.play).toHaveBeenCalled();
    });

    it("should handle missing animations gracefully", () => {
      const mixer = new THREE.AnimationMixer(new THREE.Group());
      const consoleSpy = vi.spyOn(console, "warn");

      const result = playAnimation(mixer, [], { name: "test" });

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        "No animations available to play"
      );
    });
  });
});
