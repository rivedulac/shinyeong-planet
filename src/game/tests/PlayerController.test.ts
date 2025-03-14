import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { PlayerController } from "../PlayerController";
import { Camera } from "../../core/Camera";
import { NpcManager } from "../npcs/NpcManager";
import { INpc } from "../npcs/INpc";
import * as THREE from "three";
import { Billboard } from "../npcs/Billboard";

// Mock the window object
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

const mockWindow = {
  innerWidth: 1920,
  innerHeight: 1080,
  addEventListener: mockAddEventListener,
  removeEventListener: mockRemoveEventListener,
  requestAnimationFrame: vi.fn((cb) => {
    cb(0);
    return 0;
  }),
  dispatchEvent: vi.fn(),
};

// Set up the global window object
vi.stubGlobal("window", mockWindow);

class MockNpcManager extends NpcManager {
  nearbyNpcs: INpc[] = [];
  constructor(nearbyNpcs: INpc[]) {
    const mockScene = new THREE.Scene();
    super(mockScene);
    this.nearbyNpcs = nearbyNpcs;
  }

  // @ts-ignore: Mocking the NpcManager
  getNearbyNpcs(position: THREE.Vector3): INpc[] {
    return this.nearbyNpcs;
  }
}

describe("PlayerController", () => {
  let playerController: PlayerController;
  let camera: Camera;
  let keydownHandler: (event: KeyboardEvent) => void;
  let keyupHandler: (event: KeyboardEvent) => void;
  let npcManager: MockNpcManager;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Initialize Camera
    camera = new Camera();

    // Initialize PlayerController
    playerController = new PlayerController(camera);
    npcManager = new MockNpcManager([]);
    playerController.setNpcManager(npcManager);

    // Extract the event handlers from the mock calls
    const keydownCall = mockAddEventListener.mock.calls.find(
      (call) => call[0] === "keydown"
    );
    const keyupCall = mockAddEventListener.mock.calls.find(
      (call) => call[0] === "keyup"
    );

    if (keydownCall) keydownHandler = keydownCall[1];
    if (keyupCall) keyupHandler = keyupCall[1];
  });

  afterEach(() => {
    // Clean up
    playerController.dispose();
  });

  describe("initialize", () => {
    it("should initialize with default position", () => {
      const position = playerController.getPosition();
      expect(position.x).toBe(0);
      expect(position.y).not.toBe(0); // Position will be at PLANET_RADIUS + FIRST_PERSON_HEIGHT
      expect(position.z).toBe(0);
    });

    it("should set up input listeners on initialization", () => {
      expect(mockAddEventListener).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function)
      );
      expect(mockAddEventListener).toHaveBeenCalledWith(
        "keyup",
        expect.any(Function)
      );
    });
  });

  describe("Physical keyboard input", () => {
    it("should move forward when W key is pressed", () => {
      const moveSpy = vi.spyOn(camera, "moveOnPlanet");

      // Simulate W key press
      if (keydownHandler) {
        keydownHandler(new KeyboardEvent("keydown", { key: "w" }));
      } else {
        throw new Error("Keydown handler not found");
      }

      // Update with a delta time of 1 second
      playerController.update(1);

      // Check that moveOnPlanet was called with a positive value (moving forward)
      expect(moveSpy).toHaveBeenCalled();
      const callValue = moveSpy.mock.calls[0][0];
      expect(callValue).toBeGreaterThan(0);
    });

    it("should move backward when S key is pressed", () => {
      const moveSpy = vi.spyOn(camera, "moveOnPlanet");

      // Simulate S key press
      if (keydownHandler) {
        keydownHandler(new KeyboardEvent("keydown", { key: "s" }));
      } else {
        throw new Error("Keydown handler not found");
      }

      // Update with a delta time of 1 second
      playerController.update(1);

      // Check that moveOnPlanet was called with a negative value (moving backward)
      expect(moveSpy).toHaveBeenCalled();
      const callValue = moveSpy.mock.calls[0][0];
      expect(callValue).toBeLessThan(0);
    });

    it("should stop moving when key is released", () => {
      const moveSpy = vi.spyOn(camera, "moveOnPlanet");

      // Simulate W key press and release
      if (keydownHandler && keyupHandler) {
        keydownHandler(new KeyboardEvent("keydown", { key: "w" }));
        keyupHandler(new KeyboardEvent("keyup", { key: "w" }));
      } else {
        throw new Error("Key handlers not found");
      }

      // Update with a delta time of 1 second
      playerController.update(1);

      // Check that moveOnPlanet was not called since key was released
      expect(moveSpy).not.toHaveBeenCalled();
    });
  });

  describe("Virtual input methods", () => {
    it("should handle virtual key down events", () => {
      const moveSpy = vi.spyOn(camera, "moveOnPlanet");

      // Trigger a virtual W key press
      playerController.triggerKeyDown("w");

      // Update with a delta time of 1 second
      playerController.update(1);

      // Check that moveOnPlanet was called with a positive value (moving forward)
      expect(moveSpy).toHaveBeenCalled();
      const callValue = moveSpy.mock.calls[0][0];
      expect(callValue).toBeGreaterThan(0);
    });

    it("should handle virtual key up events", () => {
      const moveSpy = vi.spyOn(camera, "moveOnPlanet");

      // Trigger a virtual W key press and release
      playerController.triggerKeyDown("w");
      playerController.triggerKeyUp("w");

      // Update with a delta time of 1 second
      playerController.update(1);

      // Check that moveOnPlanet was not called since key was released
      expect(moveSpy).not.toHaveBeenCalled();
    });

    it("should be case-insensitive for virtual key inputs", () => {
      const moveSpy = vi.spyOn(camera, "moveOnPlanet");

      // Trigger with uppercase W
      playerController.triggerKeyDown("W");

      // Update with a delta time of 1 second
      playerController.update(1);

      // Check that moveOnPlanet was called despite using uppercase
      expect(moveSpy).toHaveBeenCalled();
      const callValue = moveSpy.mock.calls[0][0];
      expect(callValue).toBeGreaterThan(0);
    });
  });

  describe("Multiple simultaneous inputs", () => {
    it("should handle multiple physical key presses", () => {
      const moveSpy = vi.spyOn(camera, "moveOnPlanet");
      const strafeSpy = vi.spyOn(camera, "strafeOnPlanet");

      // Simulate W and A key presses
      if (keydownHandler) {
        keydownHandler(new KeyboardEvent("keydown", { key: "w" }));
        keydownHandler(new KeyboardEvent("keydown", { key: "a" }));
      } else {
        throw new Error("Keydown handler not found");
      }

      // Update with a delta time of 1 second
      playerController.update(1);

      // Check that both functions were called
      expect(moveSpy).toHaveBeenCalled();
      expect(strafeSpy).toHaveBeenCalled();

      // Check correct values: positive for forward, negative for left
      expect(moveSpy.mock.calls[0][0]).toBeGreaterThan(0);
      expect(strafeSpy.mock.calls[0][0]).toBeLessThan(0);
    });

    it("should handle multiple virtual key presses", () => {
      const moveSpy = vi.spyOn(camera, "moveOnPlanet");
      const strafeSpy = vi.spyOn(camera, "strafeOnPlanet");

      // Trigger virtual W and A key presses
      playerController.triggerKeyDown("w");
      playerController.triggerKeyDown("a");

      // Update with a delta time of 1 second
      playerController.update(1);

      // Check that both functions were called
      expect(moveSpy).toHaveBeenCalled();
      expect(strafeSpy).toHaveBeenCalled();

      // Check correct values: positive for forward, negative for left
      expect(moveSpy.mock.calls[0][0]).toBeGreaterThan(0);
      expect(strafeSpy.mock.calls[0][0]).toBeLessThan(0);
    });

    it("should handle mix of physical and virtual inputs", () => {
      const moveSpy = vi.spyOn(camera, "moveOnPlanet");
      const strafeSpy = vi.spyOn(camera, "strafeOnPlanet");

      // Simulate physical W key press and virtual A key press
      if (keydownHandler) {
        keydownHandler(new KeyboardEvent("keydown", { key: "w" }));
      } else {
        throw new Error("Keydown handler not found");
      }

      playerController.triggerKeyDown("a");

      // Update with a delta time of 1 second
      playerController.update(1);

      // Check that both functions were called
      expect(moveSpy).toHaveBeenCalled();
      expect(strafeSpy).toHaveBeenCalled();

      // Check correct values
      expect(moveSpy.mock.calls[0][0]).toBeGreaterThan(0);
      expect(strafeSpy.mock.calls[0][0]).toBeLessThan(0);
    });
  });

  describe("Collision detection", () => {
    it("should detect collisions with nearby NPCs", () => {
      // Spy on the CollisionUtils.checkCollision method
      const checkCollisionSpy = vi
        .spyOn(npcManager, "getNearbyNpcs")
        .mockImplementation(() => {
          // Create an NPC that's close enough to cause a collision
          const billboard = new Billboard("test-billboard");
          const playerPos = playerController.getPosition();
          // Position billboard very close to the player
          billboard.getMesh().position.copy(playerPos);

          return [billboard];
        });

      // Try to move forward (movement will be prevented by collision)
      playerController.triggerKeyDown("w");

      // Store the original position before update
      const originalPosition = playerController.getPosition().clone();

      // Update which will trigger collision check
      playerController.update(1);

      // Verify position hasn't changed due to collision
      const newPosition = playerController.getPosition();
      expect(newPosition.x).toBeCloseTo(originalPosition.x);
      expect(newPosition.y).toBeCloseTo(originalPosition.y);
      expect(newPosition.z).toBeCloseTo(originalPosition.z);

      // Verify that nearby NPCs were checked
      expect(checkCollisionSpy).toHaveBeenCalled();
    });

    it("should allow movement when there is no collision", () => {
      // Mock the getNearbyNpcs to return empty array (no collisions)
      vi.spyOn(npcManager, "getNearbyNpcs").mockImplementation(() => []);

      // Spy on camera movement
      const moveSpy = vi.spyOn(camera, "moveOnPlanet");

      // Try to move forward
      playerController.triggerKeyDown("w");
      playerController.update(1);

      // Verify that movement function was called
      expect(moveSpy).toHaveBeenCalled();

      // Movement should have been allowed (don't need to test exact position since
      // that's tested in other test cases, just verify the move function was called)
      expect(moveSpy).toHaveBeenCalledWith(expect.any(Number));
      expect(moveSpy.mock.calls[0][0]).toBeGreaterThan(0);
    });
  });

  describe("Cleanup", () => {
    it("should remove event listeners when disposed", () => {
      playerController.dispose();

      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function)
      );
      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        "keyup",
        expect.any(Function)
      );
    });
  });
});
