import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { PlayerController } from "../PlayerController";
import { Camera } from "../Camera";

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
  let camera: Camera;
  let keydownHandler: (event: KeyboardEvent) => void;
  let keyupHandler: (event: KeyboardEvent) => void;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Initialize Camera
    camera = new Camera();

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
