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

    if (keydownCall) keydownHandler = keydownCall[1];
  });

  afterEach(() => {
    // Clean up
    playerController.dispose();
  });

  describe("initialize", () => {
    it("should initialize with default position", () => {
      const position = playerController.getPosition();
      expect(position.x).toBe(0);
      expect(position.y).not.toBe(0);
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

  describe("Move player", () => {
    it("should move forward when W key is pressed", () => {
      const originalPosition = playerController.getPosition();

      // Simulate W key press
      const mockEvent = new KeyboardEvent("keydown", { key: "w" });

      // Execute the keydown handler
      if (keydownHandler) {
        keydownHandler(mockEvent);
      } else {
        throw new Error("Keydown handler not found");
      }

      // Update with a delta time of 1 second
      playerController.update();

      // Check that the player moved in the -Z direction (forward)
      expect(playerController.getPosition()).not.toBe(originalPosition);
    });

    it("should move backward when S key is pressed", () => {
      const originalPosition = playerController.getPosition();
      // Simulate S key press
      const mockEvent = new KeyboardEvent("keydown", { key: "s" });

      // Execute the keydown handler
      if (keydownHandler) {
        keydownHandler(mockEvent);
      } else {
        throw new Error("Keydown handler not found");
      }

      // Update with a delta time of 1 second
      playerController.update(1);

      // Check that the player moved in the +Z direction (backward)
      expect(playerController.getPosition()).not.toBe(originalPosition);
    });

    it("should not move when there is a collision", () => {
      const originalPosition = playerController.getPosition();
      npcManager.nearbyNpcs = [new Billboard("test-npc", "test")];
      playerController.update(1);
      expect(playerController.getPosition()).toStrictEqual(originalPosition);
    });
  });

  describe("Strafe player", () => {
    it("should strafe left when A key is pressed", () => {
      const originalPosition = playerController.getPosition();

      // Simulate A key press
      const mockEvent = new KeyboardEvent("keydown", { key: "a" });

      // Execute the keydown handler
      if (keydownHandler) {
        keydownHandler(mockEvent);
      } else {
        throw new Error("Keydown handler not found");
      }

      // Update with a delta time of 1 second
      playerController.update(1);

      // Check that the player moved sideways
      expect(playerController.getPosition()).not.toEqual(originalPosition);
    });

    it("should strafe right when D key is pressed", () => {
      const originalPosition = playerController.getPosition();

      // Simulate D key press
      const mockEvent = new KeyboardEvent("keydown", { key: "d" });

      // Execute the keydown handler
      if (keydownHandler) {
        keydownHandler(mockEvent);
      } else {
        throw new Error("Keydown handler not found");
      }

      // Update with a delta time of 1 second
      playerController.update(1);

      // Check that the player moved sideways
      expect(playerController.getPosition()).not.toEqual(originalPosition);
    });
  });

  describe("Rotate (yaw) player", () => {
    it("should rotate left when left arrow key is pressed", () => {
      const rotateSpy = vi.spyOn(camera, "rotateYaw");

      const mockEvent = new KeyboardEvent("keydown", { key: "ArrowLeft" });

      if (keydownHandler) {
        keydownHandler(mockEvent);
      } else {
        throw new Error("Keydown handler not found");
      }

      playerController.update(1);

      // Check that rotateYaw was called with a positive value (rotating left)
      expect(rotateSpy).toHaveBeenCalledWith(expect.any(Number));
      const callValue = rotateSpy.mock.calls[0][0];
      expect(callValue).toBeGreaterThan(0);
    });

    it("should rotate right when right arrow key is pressed", () => {
      const rotateSpy = vi.spyOn(camera, "rotateYaw");

      const mockEvent = new KeyboardEvent("keydown", { key: "ArrowRight" });

      if (keydownHandler) {
        keydownHandler(mockEvent);
      } else {
        throw new Error("Keydown handler not found");
      }

      playerController.update(1);

      // Check that rotateYaw was called with a negative value (rotating right)
      expect(rotateSpy).toHaveBeenCalledWith(expect.any(Number));
      const callValue = rotateSpy.mock.calls[0][0];
      expect(callValue).toBeLessThan(0);
    });
  });

  describe("Rotate (pitch) player", () => {
    it("should look up when arrow up key is pressed", () => {
      const rotatePitchSpy = vi.spyOn(camera, "rotatePitch");

      const mockEvent = new KeyboardEvent("keydown", { key: "arrowup" });

      if (keydownHandler) {
        keydownHandler(mockEvent);
      } else {
        throw new Error("Keydown handler not found");
      }

      playerController.update(1);

      // Check that rotatePitch was called with a positive value (looking up)
      expect(rotatePitchSpy).toHaveBeenCalledWith(expect.any(Number));
      const callValue = rotatePitchSpy.mock.calls[0][0];
      expect(callValue).toBeGreaterThan(0);
    });

    it("should look down when arrow down key is pressed", () => {
      const rotatePitchSpy = vi.spyOn(camera, "rotatePitch");

      const mockEvent = new KeyboardEvent("keydown", { key: "arrowdown" });

      if (keydownHandler) {
        keydownHandler(mockEvent);
      } else {
        throw new Error("Keydown handler not found");
      }

      // Update with a delta time of 1 second
      playerController.update(1);

      // Check that rotatePitch was called with a negative value (looking down)
      expect(rotatePitchSpy).toHaveBeenCalledWith(expect.any(Number));
      const callValue = rotatePitchSpy.mock.calls[0][0];
      expect(callValue).toBeLessThan(0);
    });
  });

  describe("Simultaneous Movements", () => {
    it("should support simultaneous forward movement and strafing", () => {
      const originalPosition = playerController.getPosition();

      // Simulate W and A key presses simultaneously
      const wEvent = new KeyboardEvent("keydown", { key: "w" });
      const aEvent = new KeyboardEvent("keydown", { key: "a" });

      if (keydownHandler) {
        keydownHandler(wEvent);
        keydownHandler(aEvent);
      } else {
        throw new Error("Keydown handler not found");
      }

      playerController.update(1);

      // Position should change
      expect(playerController.getPosition()).not.toEqual(originalPosition);
    });

    it("should support simultaneous rotation and movement", () => {
      const originalPosition = playerController.getPosition();

      // Simulate W and ArrowLeft key presses simultaneously
      const wEvent = new KeyboardEvent("keydown", { key: "w" });
      const leftEvent = new KeyboardEvent("keydown", { key: "ArrowLeft" });

      if (keydownHandler) {
        keydownHandler(wEvent);
        keydownHandler(leftEvent);
      } else {
        throw new Error("Keydown handler not found");
      }

      const rotateSpy = vi.spyOn(camera, "rotateYaw");

      playerController.update(1);

      // Position should change
      expect(playerController.getPosition()).not.toEqual(originalPosition);

      // Rotation should have occurred
      expect(rotateSpy).toHaveBeenCalledWith(expect.any(Number));
    });
  });

  describe("Adjust FOV", () => {
    it("should increase FOV when minus key is pressed", () => {
      // Spy on the camera's adjustFOV method
      const adjustFOVSpy = vi.spyOn(camera, "adjustFOV");

      // Simulate minus key press
      const mockEvent = new KeyboardEvent("keydown", { key: "-" });

      // Execute the keydown handler
      if (keydownHandler) {
        keydownHandler(mockEvent);
      } else {
        throw new Error("Keydown handler not found");
      }

      playerController.update(1);

      // Check that adjustFOV was called with a positive value (increasing FOV)
      expect(adjustFOVSpy).toHaveBeenCalledWith(expect.any(Number));
      const callValue = adjustFOVSpy.mock.calls[0][0];
      expect(callValue).toBeGreaterThan(0);
    });

    it("should decrease FOV when plus key is pressed", () => {
      const adjustFOVSpy = vi.spyOn(camera, "adjustFOV");

      const mockEvent = new KeyboardEvent("keydown", { key: "+" });

      if (keydownHandler) {
        keydownHandler(mockEvent);
      } else {
        throw new Error("Keydown handler not found");
      }

      playerController.update(1);

      // Check that adjustFOV was called with a negative value (decreasing FOV)
      expect(adjustFOVSpy).toHaveBeenCalledWith(expect.any(Number));
      const callValue = adjustFOVSpy.mock.calls[0][0];
      expect(callValue).toBeLessThan(0);
    });

    it("should scale FOV adjustment by delta time", () => {
      const adjustFOVSpy = vi.spyOn(camera, "adjustFOV");

      const mockEvent = new KeyboardEvent("keydown", { key: "+" });

      if (keydownHandler) {
        keydownHandler(mockEvent);
      } else {
        throw new Error("Keydown handler not found");
      }

      playerController.update(0.5);

      expect(adjustFOVSpy).toHaveBeenCalled();
      // The actual value depends on the fovAdjustSpeed, but it should be
      // proportional to the delta time
      const expectedValue = -0.5 * 20; // deltaTime * fovAdjustSpeed
      expect(adjustFOVSpy.mock.calls[0][0]).toBeCloseTo(expectedValue);
    });
  });

  it("should clean up event listeners when disposed", () => {
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
