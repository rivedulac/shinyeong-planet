import { describe, it, expect, beforeEach, vi } from "vitest";
import { Camera } from "../Camera";
import { PLANET_RADIUS, FIRST_PERSON_HEIGHT } from "../../config/constants";

// Create a mock window object
const mockWindow = {
  innerWidth: 1920,
  innerHeight: 1080,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  requestAnimationFrame: vi.fn((cb) => {
    cb(0);
    return 0;
  }),
  dispatchEvent: vi.fn(),
};

// Set up the global window object
vi.stubGlobal("window", mockWindow);

describe("Camera", () => {
  let camera: Camera;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Initialize Camera
    camera = new Camera();
  });

  it("should initialize a PerspectiveCamera with correct parameters", () => {
    expect(camera.getPerspectiveCamera().fov).toBe(75);
    expect(camera.getPerspectiveCamera().aspect).toBe(
      window.innerWidth / window.innerHeight
    );
    expect(camera.getPerspectiveCamera().near).toBe(0.1);
    expect(camera.getPerspectiveCamera().far).toBe(1000);
  });

  it("should initialize currentPosition and desiredPosition", () => {
    const perspective = camera.getPerspective();
    expect(perspective).toHaveProperty("position");
    expect(perspective).toHaveProperty("rotation");
  });

  it("should update aspect ratio when handleResize is called", () => {
    const perspectiveCamera = camera.getPerspectiveCamera();
    const spyUpdateProjectionMatrix = vi.spyOn(
      perspectiveCamera,
      "updateProjectionMatrix"
    );

    // Call handleResize
    const newWidth = 1280;
    const newHeight = 720;
    camera.handleResize(newWidth, newHeight);

    // Verify camera aspect was updated
    expect(perspectiveCamera.aspect).toBe(newWidth / newHeight);
    expect(spyUpdateProjectionMatrix).toHaveBeenCalled();
  });
});
