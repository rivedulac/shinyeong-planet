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
    playAnimation: vi.fn().mockImplementation(() => {
      // Mock animation action
      return {
        reset: vi.fn().mockReturnThis(),
        fadeIn: vi.fn().mockReturnThis(),
        play: vi.fn().mockReturnThis(),
        stop: vi.fn(),
        fadeOut: vi.fn(),
        paused: false,
        clampWhenFinished: false,
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
});
