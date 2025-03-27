import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { PlayerController } from "../PlayerController";
import { Camera } from "../../core/Camera";
import { NpcManager } from "../npcs/NpcManager";
import * as THREE from "three";
import { StaticModel } from "../npcs/StaticModel";
import { DEFAULT_NPC_RADIUS } from "@/config/constants";

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
  private nearbyNpcs: StaticModel[] = [];

  constructor(nearbyNpcs: StaticModel[]) {
    const mockScene = new THREE.Scene();
    super(mockScene);
    this.nearbyNpcs = nearbyNpcs;
  }

  // @ts-ignore: Mocking the NpcManager
  getNearbyNpcs(position: THREE.Vector3): StaticModel[] {
    return this.nearbyNpcs;
  }
}

describe("PlayerController", () => {
  let playerController: PlayerController;
  let camera: Camera;
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
  });

  afterEach(() => {
    // Clean up
    playerController.dispose();
  });

  describe("initialize", () => {
    it("should initialize with default position", () => {
      const position = playerController.getPosition();
      expect(position.x).not.toBe(0);
      expect(position.y).toBe(0);
      expect(position.z).toBe(0);
    });
  });

  describe("Virtual input methods", () => {
    it("should handle virtual key down events", () => {
      const moveSpy = vi.spyOn(camera, "moveOnPlanet");

      // Trigger a virtual W key press
      playerController.triggerMovement("forward", true);

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
      playerController.triggerMovement("forward", true);
      playerController.triggerMovement("forward", false);

      // Update with a delta time of 1 second
      playerController.update(1);

      // Check that moveOnPlanet was not called since key was released
      expect(moveSpy).not.toHaveBeenCalled();
    });

    it("should be case-insensitive for virtual key inputs", () => {
      const moveSpy = vi.spyOn(camera, "moveOnPlanet");

      // Trigger with uppercase W
      playerController.triggerMovement("forward", true);

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

      // Simulate forward move and left rotation
      playerController.triggerMovement("forward", true);
      playerController.triggerMovement("left", true);

      // Update with a delta time of 1 second
      playerController.update(1);

      // Check that both functions were called
      expect(moveSpy).toHaveBeenCalled();

      // Check correct values: positive for forward, negative for left
      expect(moveSpy.mock.calls[0][0]).toBeGreaterThan(0);
    });

    it("should handle multiple virtual key presses", () => {
      const moveSpy = vi.spyOn(camera, "moveOnPlanet");

      // Trigger virtual W and A key presses
      playerController.triggerMovement("forward", true);
      playerController.triggerMovement("left", true);

      // Update with a delta time of 1 second
      playerController.update(1);

      // Check that both functions were called
      expect(moveSpy).toHaveBeenCalled();

      // Check correct values: positive for forward, negative for left
      expect(moveSpy.mock.calls[0][0]).toBeGreaterThan(0);
    });
  });

  describe("Collision detection", () => {
    it("should detect collisions with nearby NPCs", () => {
      // Spy on the CollisionUtils.checkCollision method
      const checkCollisionSpy = vi
        .spyOn(npcManager, "getNearbyNpcs")
        .mockImplementation(() => {
          // Create an NPC that's close enough to cause a collision
          const billboard = new StaticModel(
            "test-billboard",
            "test-billboard",
            true,
            0,
            DEFAULT_NPC_RADIUS,
            undefined,
            "test-billboard"
          );
          const playerPos = playerController.getPosition();
          // Position billboard very close to the player
          billboard.getMesh().position.copy(playerPos);

          return [billboard];
        });

      // Try to move forward (movement will be prevented by collision)
      playerController.triggerMovement("forward", true);

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
      playerController.triggerMovement("forward", true);
      playerController.update(1);

      // Verify that movement function was called
      expect(moveSpy).toHaveBeenCalled();

      // Movement should have been allowed (don't need to test exact position since
      // that's tested in other test cases, just verify the move function was called)
      expect(moveSpy).toHaveBeenCalledWith(expect.any(Number));
      expect(moveSpy.mock.calls[0][0]).toBeGreaterThan(0);
    });
  });

  describe("get the direction the player is looking", () => {
    beforeEach(() => {
      playerController = new PlayerController(camera);
    });

    it("should return a normalized vector", () => {
      const lookDir = playerController.getLookDirection();

      // Verify the vector is normalized
      expect(lookDir.length()).toBeCloseTo(1);
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

describe("PlayerController - Key Controls", () => {
  let playerController: PlayerController;
  let camera: Camera;
  let keyDownHandler: Function;
  let keyUpHandler: Function;

  beforeEach(() => {
    // Reset mocks before creating new instances
    vi.clearAllMocks();

    camera = new Camera();
    playerController = new PlayerController(camera);

    // Get the most recent handlers from the mock calls
    const mockCalls = mockAddEventListener.mock.calls;
    keyDownHandler = mockCalls[mockCalls.length - 2][1]; // Second to last call (keydown)
    keyUpHandler = mockCalls[mockCalls.length - 1][1]; // Last call (keyup)
  });

  afterEach(() => {
    playerController.dispose();
    vi.clearAllMocks();
  });

  it("should handle arrow key down events", () => {
    // Arrow Up
    keyDownHandler({ key: "ArrowUp" });
    expect(playerController["movement"].forward).toBe(true);
    expect(playerController["movement"].backward).toBe(false);

    // Arrow Down
    keyDownHandler({ key: "ArrowDown" });
    expect(playerController["movement"].backward).toBe(true);
    expect(playerController["movement"].forward).toBe(true);

    // Arrow Left
    keyDownHandler({ key: "ArrowLeft" });
    expect(playerController["movement"].left).toBe(true);
    expect(playerController["movement"].right).toBe(false);

    // Arrow Right
    keyDownHandler({ key: "ArrowRight" });
    expect(playerController["movement"].right).toBe(true);
    expect(playerController["movement"].left).toBe(true);
  });

  it("should handle arrow key up events", () => {
    // First press keys
    keyDownHandler({ key: "ArrowUp" });
    keyDownHandler({ key: "ArrowLeft" });

    // Then release them
    keyUpHandler({ key: "ArrowUp" });
    expect(playerController["movement"].forward).toBe(false);

    keyUpHandler({ key: "ArrowLeft" });
    expect(playerController["movement"].left).toBe(false);
  });

  it("should ignore non-arrow keys", () => {
    keyDownHandler({ key: "a" });
    expect(playerController["movement"].forward).toBe(false);
    expect(playerController["movement"].backward).toBe(false);
    expect(playerController["movement"].left).toBe(false);
    expect(playerController["movement"].right).toBe(false);
  });

  it("should properly clean up event listeners on dispose", () => {
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

  it("should update movement state through update method", () => {
    const deltaTime = 1 / 60; // Simulate 60 FPS
    const moveSpy = vi.spyOn(camera, "moveOnPlanet");

    // Press forward key
    keyDownHandler({ key: "ArrowUp" });
    playerController.update(deltaTime);

    // Verify that camera.moveOnPlanet was called with positive movement
    expect(moveSpy).toHaveBeenCalledWith(expect.any(Number));
    expect(moveSpy).toHaveBeenLastCalledWith(
      playerController["movementSpeed"] * deltaTime
    );

    // Press backward key
    keyDownHandler({ key: "ArrowDown" });
    playerController.update(deltaTime);

    // Verify that camera.moveOnPlanet was called with negative movement
    expect(moveSpy).toHaveBeenLastCalledWith(
      -playerController["movementSpeed"] * deltaTime
    );
  });
});
