// src/game/npcs/tests/StaticModel.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { StaticModel } from "../StaticModel";
import { NpcType } from "../interfaces/INpc";
import * as THREE from "three";
import {
  PLANET_RADIUS,
  PLANET_CENTER,
  PERSON_RADIUS,
  DEFAULT_PERSON_CONVERSTAION,
} from "../../../config/constants";

// Mock the modelLoader module
vi.mock("../../../utils/modelLoader", () => {
  return {
    loadModelAsync: vi.fn().mockImplementation(() => {
      // Return a mock successful model loading result
      return Promise.resolve({
        scene: new THREE.Group(), // Empty group as a mock scene
        animations: [],
      });
    }),
  };
});

describe("StaticModel", () => {
  let staticModel: StaticModel;
  const testId = "test-model";
  const testName = "Test Model";
  const testPath = "test/path/model.glb";

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Create a fresh instance for each test
    staticModel = new StaticModel(testId, testName, testPath);
  });

  describe("Initialization", () => {
    it("should initialize with the provided values", () => {
      expect(staticModel.getId()).toBe(testId);
      expect(staticModel.getType()).toBe(NpcType.Person);
      expect(staticModel.getCollisionRadius()).toBe(PERSON_RADIUS);

      const info = staticModel.getInfo();
      expect(info.name).toBe(testName);
    });

    it("should create a mesh group", () => {
      const mesh = staticModel.getMesh();
      expect(mesh).toBeInstanceOf(THREE.Group);
    });

    it("should use default conversation if none provided", () => {
      expect(staticModel.getConversation()).toBe(DEFAULT_PERSON_CONVERSTAION);
    });

    it("should use custom conversation if provided", () => {
      const customConversation = {
        title: "Custom Title",
        messages: ["Custom message"],
        icon: "🔍",
      };

      const modelWithCustomConversation = new StaticModel(
        "custom-id",
        "Custom Name",
        testPath,
        customConversation
      );

      expect(modelWithCustomConversation.getConversation()).toBe(
        customConversation
      );
    });

    it("should attempt to load the model when created", async () => {
      // Import the actual loadModelAsync function for verification
      const { loadModelAsync } = await import("../../../utils/modelLoader");

      // Verify loadModelAsync was called with the correct path
      expect(loadModelAsync).toHaveBeenCalledWith(testPath);
    });
  });

  describe("Positioning", () => {
    it("should position correctly on the planet surface", () => {
      // Position at the equator (latitude = 0, longitude = 0)
      staticModel.setPositionOnPlanet(0, 0);

      const mesh = staticModel.getMesh();

      // At equator, longitude 0, position should be along the X axis
      expect(mesh.position.x).toBeCloseTo(
        PLANET_CENTER.x + PLANET_RADIUS + 0.2
      ); // With small offset
      expect(mesh.position.y).toBeCloseTo(PLANET_CENTER.y);
      expect(mesh.position.z).toBeCloseTo(PLANET_CENTER.z);
    });

    it("should handle positioning at the north pole", () => {
      // Position at the north pole (latitude = PI/2, longitude = 0)
      staticModel.setPositionOnPlanet(Math.PI / 2, 0);

      const mesh = staticModel.getMesh();

      // At north pole, position should be along Y axis
      expect(mesh.position.x).toBeCloseTo(PLANET_CENTER.x);
      expect(mesh.position.y).toBeCloseTo(
        PLANET_CENTER.y + PLANET_RADIUS + 0.2
      ); // With small offset
      expect(mesh.position.z).toBeCloseTo(PLANET_CENTER.z);
    });

    it("should handle positioning at an arbitrary location", () => {
      // Position at some arbitrary location (latitude = PI/4, longitude = PI/4)
      staticModel.setPositionOnPlanet(Math.PI / 4, Math.PI / 4);

      const mesh = staticModel.getMesh();

      // Calculate expected position
      const phi = Math.PI / 2 - Math.PI / 4; // Convert latitude to phi
      const theta = Math.PI / 4; // Longitude

      const expectedX = PLANET_RADIUS * Math.sin(phi) * Math.cos(theta);
      const expectedY = PLANET_RADIUS * Math.cos(phi);
      const expectedZ = PLANET_RADIUS * Math.sin(phi) * Math.sin(theta);

      // Account for the small offset and planet center
      expect(mesh.position.x).toBeCloseTo(
        PLANET_CENTER.x + expectedX + 0.2 * Math.sin(phi) * Math.cos(theta)
      );
      expect(mesh.position.y).toBeCloseTo(
        PLANET_CENTER.y + expectedY + 0.2 * Math.cos(phi)
      );
      expect(mesh.position.z).toBeCloseTo(
        PLANET_CENTER.z + expectedZ + 0.2 * Math.sin(phi) * Math.sin(theta)
      );
    });

    it("should apply ground offset correctly", () => {
      const groundOffset = 5;
      const modelWithOffset = new StaticModel(
        "offset-model",
        "Offset Model",
        testPath,
        DEFAULT_PERSON_CONVERSTAION,
        groundOffset
      );

      // Position at the equator (latitude = 0, longitude = 0)
      modelWithOffset.setPositionOnPlanet(0, 0);

      const mesh = modelWithOffset.getMesh();

      // At equator with offset, position should be further out along X axis
      expect(mesh.position.x).toBeCloseTo(
        PLANET_CENTER.x + PLANET_RADIUS + groundOffset + 0.2
      );
      expect(mesh.position.y).toBeCloseTo(PLANET_CENTER.y);
      expect(mesh.position.z).toBeCloseTo(PLANET_CENTER.z);
    });
  });

  describe("Conversation Management", () => {
    it("should allow changing the conversation", () => {
      const newConversation = {
        title: "New Conversation",
        messages: ["New message 1", "New message 2"],
        icon: "💬",
      };

      staticModel.setConversation(newConversation);

      expect(staticModel.getConversation()).toBe(newConversation);
    });
  });

  describe("Scaling", () => {
    it("should allow changing the scale", () => {
      const newScale = 2.0;

      // First, mock that the model is loaded
      const mockScene = new THREE.Group();
      const mockModel = new THREE.Group();
      mockScene.add(mockModel);

      // Access the private field using type assertion
      (staticModel as any).isModelLoaded = true;
      (staticModel as any).mesh.add(mockScene);

      // Call the method
      staticModel.setScale(newScale);

      // Verify the stored scale value was updated (private field)
      expect((staticModel as any).scale).toBe(newScale);
    });
  });

  describe("Error handling", () => {
    it("should handle model loading errors gracefully", async () => {
      // Mock loadModelAsync to reject
      const { loadModelAsync } = await import("../../../utils/modelLoader");
      (loadModelAsync as any).mockRejectedValueOnce(
        new Error("Failed to load model")
      );

      // Create console.error spy
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      // Create a new model which will trigger the error
      new StaticModel("error-model", "Error Model", "wrong/path");

      // Wait for async operations to complete
      await new Promise(process.nextTick);

      // Verify error was logged
      expect(errorSpy).toHaveBeenCalled();
      expect(errorSpy.mock.calls[0][0]).toContain(
        "Failed to load model for NPC"
      );
    });
  });
});
