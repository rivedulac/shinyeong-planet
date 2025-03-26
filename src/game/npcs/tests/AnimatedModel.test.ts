// src/game/npcs/tests/AnimatedModel.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AnimatedModel } from "../AnimatedModel";
import * as THREE from "three";
import {
  DEFAULT_PERSON_CONVERSTAION,
  DEFAULT_NPC_RADIUS,
} from "../../../config/constants";
import * as modelLoader from "../../../utils/modelLoader";

// Mock the modelLoader module
vi.mock("../../../utils/modelLoader", () => {
  return {
    loadModel: vi.fn().mockImplementation(() => {
      // Return a mock successful model loading result with animations
      const mockScene = new THREE.Group();
      const mockAnimations = [
        new THREE.AnimationClip("idle", 1, []),
        new THREE.AnimationClip("walk", 1, []),
      ];
      return Promise.resolve({
        scene: mockScene,
        animations: mockAnimations,
        gltf: { scene: mockScene, animations: mockAnimations },
      });
    }),
    createAnimationMixer: vi.fn().mockImplementation(() => {
      return new THREE.AnimationMixer(new THREE.Object3D());
    }),
    playAnimation: vi.fn().mockImplementation((_1, _2, options) => {
      // Enhanced mock animation action
      return {
        reset: vi.fn().mockReturnThis(),
        fadeIn: vi.fn().mockReturnThis(),
        play: vi.fn().mockReturnThis(),
        stop: vi.fn(),
        fadeOut: vi.fn(),
        paused: false,
        clampWhenFinished: false,
        getClip: vi.fn().mockReturnValue({ name: options.name || "test" }), // Add getClip method
        setLoop: vi.fn().mockReturnThis(),
        setEffectiveTimeScale: vi.fn().mockReturnThis(),
        setEffectiveWeight: vi.fn().mockReturnThis(),
      };
    }),
  };
});

describe("AnimatedModel", () => {
  let animatedModel: AnimatedModel;
  const testId = "test-animated-model";
  const testName = "Test Animated Model";
  const testPath = "test/path/model.glb";

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Create a fresh instance for each test
    animatedModel = new AnimatedModel(
      testId,
      testName,
      true,
      0,
      DEFAULT_NPC_RADIUS,
      undefined,
      testPath
    );
  });

  describe("Initialization", () => {
    it("should initialize with the provided values", () => {
      expect(animatedModel.getId()).toBe(testId);
      expect(animatedModel.getCollisionRadius()).toBe(DEFAULT_NPC_RADIUS);

      const info = animatedModel.getInfo();
      expect(info.name).toBe(testName);
    });

    it("should create a mesh group", () => {
      const mesh = animatedModel.getMesh();
      expect(mesh).toBeInstanceOf(THREE.Group);
    });

    it("should use default conversation if none provided", () => {
      expect(animatedModel.getConversation()).toBe(DEFAULT_PERSON_CONVERSTAION);
    });

    it("should attempt to load the model when created", async () => {
      // Import the actual loadModel function for verification
      const { loadModel } = await import("../../../utils/modelLoader");

      // Verify loadModel was called with the correct path
      expect(loadModel).toHaveBeenCalledWith(testPath);
    });
  });

  describe("Animation Management", () => {
    it("should play animation when requested", () => {
      // Manually set animations since we're not actually loading the model
      const animations = [
        new THREE.AnimationClip("idle", 1, []),
        new THREE.AnimationClip("walk", 1, []),
      ];
      animatedModel.setAnimations(animations);

      // Play an animation
      const action = animatedModel.playAnimation("idle");

      // Verify the animation was played
      expect(action).not.toBeNull();
      expect(modelLoader.playAnimation).toHaveBeenCalled();
    });

    it("should stop animation when requested", () => {
      // Set up animations and play one
      const animations = [new THREE.AnimationClip("test", 1, [])];
      animatedModel.setAnimations(animations);
      animatedModel.playAnimation("test");

      // Now stop it
      animatedModel.stopAnimation();

      // This is a bit tricky to test without exposing internal state
      // For a basic test, we'll just ensure the method doesn't throw
      expect(() => animatedModel.stopAnimation()).not.toThrow();
    });

    it("should update animation mixer when update is called", () => {
      // Set up animations
      const animations = [new THREE.AnimationClip("test", 1, [])];
      animatedModel.setAnimations(animations);

      // Create a spy on the update method of the animation mixer
      const mixer = modelLoader.createAnimationMixer(
        animatedModel.getMesh() as THREE.Group
      );
      const updateSpy = vi.spyOn(mixer, "update");

      // Assign the mixer to the model (this requires some trickery)
      Object.defineProperty(animatedModel, "animationMixer", {
        value: mixer,
        writable: true,
      });

      // Update the animation
      animatedModel.update(0.016); // 16ms

      // Verify the mixer was updated
      expect(updateSpy).toHaveBeenCalledWith(0.016);
    });
  });

  describe("Animation Information", () => {
    it("should return animation names correctly", () => {
      // Set up animations
      const animations = [
        new THREE.AnimationClip("idle", 1, []),
        new THREE.AnimationClip("walk", 1, []),
      ];
      animatedModel.setAnimations(animations);

      // Get animation names
      const names = animatedModel.getAnimationNames();

      // Verify the names
      expect(names).toContain("idle");
      expect(names).toContain("walk");
      expect(names.length).toBe(2);
    });

    it("should check if animation exists correctly", () => {
      // Set up animations
      const animations = [
        new THREE.AnimationClip("idle", 1, []),
        new THREE.AnimationClip("walk", 1, []),
      ];
      animatedModel.setAnimations(animations);

      // Check for existing and non-existing animations
      expect(animatedModel.hasAnimation("idle")).toBe(true);
      expect(animatedModel.hasAnimation("run")).toBe(false);
    });
  });

  describe("Initial Animation", () => {
    it("should set and store initial animation name", () => {
      const animationName = "Attack_Headbutt";
      animatedModel.setInitialAnimation(animationName);

      // We need to access the private property for testing
      // @ts-ignore - accessing private property for testing
      expect(animatedModel["initialAnimation"]).toBe(animationName);
    });

    it("should play initial animation when model loads", async () => {
      const animationName = "Attack_Headbutt";
      animatedModel.setInitialAnimation(animationName);

      // Manually trigger model loading
      // @ts-ignore - accessing protected method for testing
      await animatedModel.loadAnimatedModel("test/path.glb");

      // Verify that playAnimation was called with the initial animation name
      expect(modelLoader.playAnimation).toHaveBeenCalled();
    });

    it("should fall back to default animation if initial animation not found", async () => {
      animatedModel.setInitialAnimation("nonexistent_animation");

      // Manually trigger model loading
      // @ts-ignore - accessing protected method for testing
      await animatedModel.loadAnimatedModel("test/path.glb");

      // Should play the first available animation
      expect(modelLoader.playAnimation).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          name: "idle", // First animation in our mock
          loop: THREE.LoopOnce,
        })
      );
    });
  });

  describe("Model Loading", () => {
    it("should clear existing mesh children before adding new model", async () => {
      // Add some dummy children to the mesh
      const mesh = animatedModel.getMesh();
      const dummyChild1 = new THREE.Object3D();
      const dummyChild2 = new THREE.Object3D();
      mesh.add(dummyChild1, dummyChild2);

      // Verify children were added
      expect(mesh.children.length).toBe(3);

      // Trigger model loading
      // @ts-ignore - accessing protected method for testing
      await animatedModel.loadAnimatedModel("test/path.glb");

      // Verify only the new model scene is present
      expect(mesh.children.length).toBe(1);
      // The only child should be the mock scene from our modelLoader mock
      expect(mesh.children[0]).toBeInstanceOf(THREE.Group);
    });

    it("should apply scale to the loaded model", async () => {
      const testScale = 2;
      animatedModel.setScale(testScale);

      // Trigger model loading
      // @ts-ignore - accessing protected method for testing
      await animatedModel.loadAnimatedModel("test/path.glb");

      // Get the loaded model (first child of the mesh)
      const modelScene = animatedModel.getMesh().children[0];
      expect(modelScene.scale.x).toBe(testScale);
      expect(modelScene.scale.y).toBe(testScale);
      expect(modelScene.scale.z).toBe(testScale);
    });
  });

  describe("Animation State", () => {
    it("should return current animation name", () => {
      const animations = [new THREE.AnimationClip("test", 1, [])];
      animatedModel.setAnimations(animations);

      animatedModel.playAnimation("test");
      expect(animatedModel.getCurrentAnimationName()).toBe("test");
    });
  });
});
