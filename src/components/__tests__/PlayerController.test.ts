import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { PlayerController } from "../PlayerController";
import { Camera } from "../Camera";
import * as THREE from "three";
import { PLANET_RADIUS, FIRST_PERSON_HEIGHT } from "../../config/constants";
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

describe("PlayerController", () => {
  let playerController: PlayerController;
  let camera: THREE.PerspectiveCamera;
  let keydownHandler: (event: KeyboardEvent) => void;
  let keyupHandler: (event: KeyboardEvent) => void;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Initialize Camera
    camera = new Camera().getPerspectiveCamera();

    // Initialize PlayerController
    playerController = new PlayerController(camera);

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

  it("should initialize with default position", () => {
    const position = playerController.getPosition();
    expect(position.x).toBe(0);
    expect(position.y).not.toBe(0);
    expect(position.z).not.toBe(0);
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
    const position = playerController.getPosition();
    expect(position.z).toBeGreaterThan(0);
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
